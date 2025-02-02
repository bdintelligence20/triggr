from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client as SupabaseClient
from pinecone import Pinecone
from datetime import datetime
import httpx
import hashlib
import json
import os
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# API Configurations
class APIConfig:
    # Supabase
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

    # Pinecone
    PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
    PINECONE_INDEX = "triggrdocstore"

    # R2R
    R2R_API_KEY = os.getenv("R2R_API_KEY")
    R2R_BASE_URL = "https://api.sciphi.ai/v3"
    
    # WhatsApp
    WA_API_VERSION = "v17.0"
    WA_PHONE_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
    WA_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN")
    WA_VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN")
    
    # API Headers
    @classmethod
    def r2r_headers(cls):
        return {
            "Authorization": f"Bearer {cls.R2R_API_KEY}",
            "Content-Type": "application/json"
        }
    
    @classmethod
    def wa_headers(cls):
        return {
            "Authorization": f"Bearer {cls.WA_TOKEN}",
            "Content-Type": "application/json"
        }

# Initialize API clients
try:
    # Supabase
    supabase: SupabaseClient = create_client(
        APIConfig.SUPABASE_URL,
        APIConfig.SUPABASE_KEY
    )
    
    # Pinecone
    pc = Pinecone(api_key=APIConfig.PINECONE_API_KEY)
    vector_index = pc.Index(APIConfig.PINECONE_INDEX)
    
    logger.info("API clients initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize API clients: {str(e)}")
    raise

class WhatsAppAPI:
    @staticmethod
    async def send_message(to_number: str, message: str) -> dict:
        """Send a message using WhatsApp Business API"""
        url = f"https://graph.facebook.com/{APIConfig.WA_API_VERSION}/{APIConfig.WA_PHONE_ID}/messages"
        
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to_number,
            "type": "text",
            "text": {"preview_url": False, "body": message}
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    url, 
                    json=payload, 
                    headers=APIConfig.wa_headers()
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                logger.error(f"WhatsApp API error: {str(e)}")
                raise

class MessageProcessor:
    @staticmethod
    async def get_embedding(text: str) -> list:
        """Get embedding from R2R API"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{APIConfig.R2R_BASE_URL}/embeddings",
                headers=APIConfig.r2r_headers(),
                json={"input": text}
            )
            return response.json()['data'][0]['embedding']

    @staticmethod
    async def process_message(from_number: str, message_text: str) -> str:
        """Process incoming message and generate response"""
        try:
            # Store user message
            message_id = hashlib.md5(
                f"{from_number}-{datetime.utcnow().isoformat()}".encode()
            ).hexdigest()
            
            message_data = {
                "id": message_id,
                "session_id": from_number,
                "role": "user",
                "content": message_text,
                "timestamp": datetime.utcnow().isoformat()
            }
            supabase.table("messages").insert(message_data).execute()

            # Get chat history
            chat_history = supabase.table("messages")\
                .select("*")\
                .eq("session_id", from_number)\
                .order("timestamp", desc=True)\
                .limit(10)\
                .execute()

            # Get relevant context from vector store
            embedding = await MessageProcessor.get_embedding(message_text)
            search_results = vector_index.query(
                vector=embedding,
                top_k=5,
                include_metadata=True
            )
            
            context = " ".join([
                match.metadata['text'] 
                for match in search_results.matches
            ])

            # Generate response using R2R
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{APIConfig.R2R_BASE_URL}/chat/completions",
                    headers=APIConfig.r2r_headers(),
                    json={
                        "messages": [
                            {
                                "role": "system",
                                "content": f"Use this context to help answer: {context}"
                            },
                            *[
                                {"role": msg["role"], "content": msg["content"]} 
                                for msg in reversed(chat_history.data)
                            ],
                            {"role": "user", "content": message_text}
                        ]
                    }
                )
                
            ai_response = response.json()['choices'][0]['message']['content']

            # Store AI response
            assistant_message = {
                "id": hashlib.md5(
                    f"{from_number}-{datetime.utcnow().isoformat()}-assistant".encode()
                ).hexdigest(),
                "session_id": from_number,
                "role": "assistant",
                "content": ai_response,
                "timestamp": datetime.utcnow().isoformat()
            }
            supabase.table("messages").insert(assistant_message).execute()

            return ai_response

        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            raise

@app.route("/whatsapp", methods=["GET", "POST"])
def whatsapp_webhook():
    """Handle WhatsApp webhook events"""
    try:
        # Handle webhook verification (GET request)
        if request.method == "GET":
            mode = request.args.get("hub.mode")
            token = request.args.get("hub.verify_token")
            challenge = request.args.get("hub.challenge")
            
            logger.info(f"Webhook verification - Mode: {mode}, Token: {token}, Challenge: {challenge}")
            
            if mode and token:
                if mode == "subscribe" and token == APIConfig.WA_VERIFY_TOKEN:
                    if challenge:
                        logger.info(f"Webhook verified! Challenge: {challenge}")
                        return str(challenge)  # Must return the challenge as a string
                    return "No challenge found", 400
                return "Invalid verification token", 403
            return "Invalid parameters", 400

        # Process incoming messages (POST request)
        data = request.json
        logger.info(f"Received webhook data: {json.dumps(data)}")
        
        if data.get("object") == "whatsapp_business_account":
            for entry in data.get("entry", []):
                for change in entry.get("changes", []):
                    messages = change.get("value", {}).get("messages", [])
                    
                    for message in messages:
                        if message.get("type") != "text":
                            continue
                            
                        from_number = message["from"]
                        message_text = message["text"]["body"]
                        
                        # Start async processing in a background task
                        # For now, we'll handle it synchronously
                        # Process message and get response
                        WhatsAppAPI.send_message_sync(from_number, "Thank you for your message. Processing...")

        return jsonify({"status": "success"}), 200

    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Update WhatsAppAPI to include sync method
class WhatsAppAPI:
    @staticmethod
    def send_message_sync(to_number: str, message: str) -> dict:
        """Send a message using WhatsApp Business API (synchronous version)"""
        url = f"https://graph.facebook.com/{APIConfig.WA_API_VERSION}/{APIConfig.WA_PHONE_ID}/messages"
        
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to_number,
            "type": "text",
            "text": {"preview_url": False, "body": message}
        }
        
        try:
            response = httpx.post(
                url, 
                json=payload, 
                headers=APIConfig.wa_headers(),
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            logger.error(f"WhatsApp API error: {str(e)}")
            raise

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))