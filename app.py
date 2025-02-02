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
import asyncio

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

    # R2R (Documents API)
    R2R_API_KEY = os.getenv("R2R_API_KEY")
    R2R_BASE_URL = "https://api.sciphi.ai/v3"  # Use the base URL provided by your service
    
    # WhatsApp
    WA_API_VERSION = "v17.0"
    WA_PHONE_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
    WA_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN")
    WA_VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN")
    
    # API Headers
    # Using X-API-Key instead of Authorization for the R2R API
    @classmethod
    def r2r_headers(cls):
        return {
            "X-API-Key": cls.R2R_API_KEY,
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
        """Send a message using WhatsApp Business API asynchronously"""
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
                response = await client.post(url, json=payload, headers=APIConfig.wa_headers())
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                logger.error(f"WhatsApp API error (async): {str(e)}")
                raise

    @staticmethod
    def send_message_sync(to_number: str, message: str) -> dict:
        """Send a message using WhatsApp Business API synchronously"""
        url = f"https://graph.facebook.com/{APIConfig.WA_API_VERSION}/{APIConfig.WA_PHONE_ID}/messages"
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to_number,
            "type": "text",
            "text": {"preview_url": False, "body": message}
        }
        try:
            with httpx.Client() as client:
                response = client.post(url, json=payload, headers=APIConfig.wa_headers())
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            logger.error(f"WhatsApp API error (sync): {str(e)}")
            raise

class MessageProcessor:
    @staticmethod
    async def get_embedding(text: str) -> list:
        """
        Get embedding for a text message.
        (Note: If you have a separate embeddings service for chat messages, update this method.)
        """
        # Disable SSL verification for this call (for testing only)
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.post(
                f"{APIConfig.R2R_BASE_URL}/documents/embeddings",
                headers=APIConfig.r2r_headers(),
                json={"input": text}
            )
            response_json = response.json()
            if "data" not in response_json:
                logger.error(f"Unexpected response from embeddings API: {response_json}")
                raise Exception(f"Embeddings API did not return data: {response_json}")
            return response_json['data'][0]['embedding']

    @staticmethod
    async def process_message(from_number: str, message_text: str) -> str:
        """Process an incoming message using RAG logic and generate a response"""
        try:
            # Store user message in Supabase
            message_id = hashlib.md5(f"{from_number}-{datetime.utcnow().isoformat()}".encode()).hexdigest()
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

            # Get embedding for the incoming message (for context retrieval)
            embedding = await MessageProcessor.get_embedding(message_text)
            search_results = vector_index.query(
                vector=embedding,
                top_k=5,
                include_metadata=True
            )
            context = " ".join([match.metadata['text'] for match in search_results.matches])

            # Generate AI response using the chat completions endpoint
            async with httpx.AsyncClient(verify=False) as client:
                response = await client.post(
                    f"{APIConfig.R2R_BASE_URL}/chat/completions",
                    headers=APIConfig.r2r_headers(),
                    json={
                        "messages": [
                            {"role": "system", "content": f"Use this context to help answer: {context}"},
                            *[{"role": msg["role"], "content": msg["content"]} for msg in reversed(chat_history.data)],
                            {"role": "user", "content": message_text}
                        ]
                    }
                )
            ai_response = response.json()['choices'][0]['message']['content']

            # Store AI response in Supabase
            assistant_message = {
                "id": hashlib.md5(f"{from_number}-{datetime.utcnow().isoformat()}-assistant".encode()).hexdigest(),
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
    """Handle WhatsApp webhook events and process messages with RAG interface"""
    try:
        # Webhook verification (GET request)
        if request.method == "GET":
            mode = request.args.get("hub.mode")
            token = request.args.get("hub.verify_token")
            challenge = request.args.get("hub.challenge")
            logger.info(f"Webhook verification - Mode: {mode}, Token: {token}, Challenge: {challenge}")
            if mode and token:
                if mode == "subscribe" and token == APIConfig.WA_VERIFY_TOKEN:
                    if challenge:
                        logger.info(f"Webhook verified! Challenge: {challenge}")
                        return str(challenge)
                    return "No challenge found", 400
                return "Invalid verification token", 403
            return "Invalid parameters", 400

        # Process incoming messages (POST request)
        logger.info(f"Headers: {dict(request.headers)}")
        data = request.json
        logger.info(f"Received webhook data: {json.dumps(data)}")
        if data.get("object") == "whatsapp_business_account":
            for entry in data.get("entry", []):
                for change in entry.get("changes", []):
                    messages = change.get("value", {}).get("messages", [])
                    logger.info(f"Processing messages: {messages}")
                    for message in messages:
                        if message.get("type") != "text":
                            logger.info(f"Skipping non-text message: {message.get('type')}")
                            continue
                        from_number = message["from"]
                        message_text = message["text"]["body"]
                        logger.info(f"Processing message from {from_number}: {message_text}")

                        # Send immediate acknowledgment
                        try:
                            WhatsAppAPI.send_message_sync(from_number, "Message received. Processing...")
                        except Exception as e:
                            logger.error(f"Error sending acknowledgment: {str(e)}")
                        
                        # Process the message using RAG logic
                        try:
                            ai_response = asyncio.run(MessageProcessor.process_message(from_number, message_text))
                            # Send the generated AI response back to the user
                            WhatsAppAPI.send_message_sync(from_number, ai_response)
                        except Exception as e:
                            logger.error(f"Error processing message with RAG: {str(e)}")
                            try:
                                WhatsAppAPI.send_message_sync(from_number, "Sorry, an error occurred while processing your message.")
                            except Exception as inner_e:
                                logger.error(f"Error sending error message: {str(inner_e)}")
        return jsonify({"status": "success"}), 200

    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        logger.exception("Full traceback:")
        return jsonify({"error": str(e)}), 500

# Create upload folder
UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "./uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Check if file type is allowed"""
    ALLOWED_EXTENSIONS = {'txt', 'pdf', 'doc', 'docx', 'csv'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/files", methods=["GET"])
def get_files():
    """Get list of all files"""
    try:
        response = supabase.table("documents").select("*").execute()
        return jsonify(response.data)
    except Exception as e:
        logger.error(f"Error getting files: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/upload-files", methods=["POST"])
def upload_files():
    """Handle file uploads by ingesting the document and upserting its chunks to Pinecone"""
    try:
        if 'files' not in request.files:
            return jsonify({"error": "No files provided"}), 400

        files = request.files.getlist('files')
        results = []

        for file in files:
            if file and allowed_file(file.filename):
                temp_path = None
                try:
                    logger.info(f"Processing file: {file.filename}")
                    # Create a unique file ID
                    file_id = hashlib.md5(f"{file.filename}-{datetime.utcnow().isoformat()}".encode()).hexdigest()
                    temp_path = os.path.join(UPLOAD_FOLDER, file_id)
                    file.save(temp_path)

                    # Extract file content
                    if file.filename.endswith('.pdf'):
                        import PyPDF2
                        with open(temp_path, 'rb') as pdf_file:
                            pdf_reader = PyPDF2.PdfReader(pdf_file)
                            content = ""
                            for page in pdf_reader.pages:
                                content += page.extract_text() + "\n"
                    else:
                        with open(temp_path, 'rb') as f:
                            content = f.read().decode('utf-8', errors='ignore')
                    logger.info(f"File content extracted, length: {len(content)}")

                    # Ingest document via R2R Documents API (disable SSL verification)
                    with httpx.Client(verify=False) as client:
                        ingest_response = client.post(
                            f"{APIConfig.R2R_BASE_URL}/documents",
                            headers=APIConfig.r2r_headers(),
                            json={"content": content, "metadata": {"filename": file.filename}}
                        )
                        logger.info(f"Document ingest response status: {ingest_response.status_code}, content: {ingest_response.text}")
                        ingest_json = ingest_response.json()
                        if "id" not in ingest_json:
                            raise Exception(f"Document ingest failed: {ingest_json}")
                        document_id = ingest_json["id"]

                        # Retrieve generated chunks for the document
                        chunks_response = client.get(
                            f"{APIConfig.R2R_BASE_URL}/documents/{document_id}/chunks",
                            headers=APIConfig.r2r_headers()
                        )
                        logger.info(f"Chunks response status: {chunks_response.status_code}, content: {chunks_response.text}")
                        chunks_json = chunks_response.json()
                        if "data" not in chunks_json:
                            raise Exception(f"Chunks not returned: {chunks_json}")
                        chunks_data = chunks_json["data"]

                    # Create vectors for Pinecone from the retrieved chunks
                    vectors = []
                    for i, chunk in enumerate(chunks_data):
                        vector_id = f"{document_id}-chunk-{i}"
                        # Assume each chunk has an "embedding" and a "text" field
                        vectors.append({
                            'id': vector_id,
                            'values': chunk["embedding"],
                            'metadata': {
                                'text': chunk["text"],
                                'document_id': document_id,
                                'chunk_index': i,
                                'filename': file.filename
                            }
                        })
                    logger.info(f"Upserting {len(vectors)} vectors to Pinecone")
                    vector_index.upsert(vectors=vectors)
                    vector_ids = [v['id'] for v in vectors]
                    logger.info(f"Vectors upserted to Pinecone: {vector_ids}")

                    # Store document metadata in Supabase
                    doc_data = {
                        "id": document_id,
                        "name": file.filename,
                        "type": file.content_type or "application/pdf",
                        "vector_ids": vector_ids,
                        "meta_info": {
                            "filename": file.filename,
                            "upload_date": datetime.utcnow().isoformat(),
                            "num_chunks": len(vectors)
                        }
                    }
                    logger.info(f"Inserting document into Supabase: {doc_data}")
                    response = supabase.table("documents").insert(doc_data).execute()
                    logger.info(f"Supabase response: {response}")

                    # Clean up temporary file
                    if temp_path and os.path.exists(temp_path):
                        os.remove(temp_path)
                    results.append({
                        "id": document_id,
                        "name": file.filename,
                        "status": "success",
                        "num_chunks": len(vectors),
                        "vector_ids": vector_ids
                    })
                except Exception as e:
                    logger.error(f"Error processing file {file.filename}: {str(e)}")
                    logger.exception("Full traceback:")
                    results.append({
                        "name": file.filename,
                        "status": "error",
                        "error": str(e)
                    })
                    if temp_path and os.path.exists(temp_path):
                        os.remove(temp_path)
        return jsonify({"message": "Files processed", "files": results})
    except Exception as e:
        logger.error(f"Error in upload_files: {str(e)}")
        logger.exception("Full traceback:")
        return jsonify({"error": str(e)}), 500

@app.route("/test-pinecone", methods=["GET"])
def test_pinecone():
    """Test Pinecone connection and content"""
    try:
        stats = vector_index.describe_index_stats()
        query_response = vector_index.query(
            vector=[0.0] * 1536,  # Dummy vector
            top_k=5,
            include_metadata=True
        )
        return jsonify({
            "status": "success",
            "index_stats": stats,
            "sample_vectors": query_response.matches if query_response.matches else []
        })
    except Exception as e:
        logger.error(f"Pinecone test error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/files/<file_id>", methods=["DELETE"])
def delete_file(file_id):
    """Delete a file"""
    try:
        docs = supabase.table("documents").select("*").eq("id", file_id).execute().data
        if not docs:
            return jsonify({"error": "Document not found"}), 404
        doc = docs[0]
        # Delete from R2R if applicable
        if 'r2r_doc_id' in doc:
            httpx.delete(
                f"{APIConfig.R2R_BASE_URL}/documents/{doc['r2r_doc_id']}",
                headers=APIConfig.r2r_headers()
            )
        vector_index.delete(ids=doc['vector_ids'])
        supabase.table("documents").delete().eq("id", file_id).execute()
        return jsonify({"message": "Document deleted successfully"})
    except Exception as e:
        logger.error(f"Error deleting file: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
