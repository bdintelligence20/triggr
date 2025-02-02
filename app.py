from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from twilio.rest import Client
from datetime import datetime
import hashlib
import json
import httpx
from pinecone import Pinecone
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

class SupabaseManager:
    def __init__(self, client: Client):
        self.client = client
    
    async def create_document(self, data, user_id, workspace_id=None):
        """Create document with proper ownership"""
        doc_data = {
            **data,
            "owner_id": user_id,
            "workspace_id": workspace_id,
            "is_public": False
        }
        return self.client.table("documents").insert(doc_data).execute()
    
    async def get_user_documents(self, user_id):
        """Get all documents accessible by user"""
        return self.client.table("documents")\
            .select("*")\
            .or_(f"owner_id.eq.{user_id},is_public.eq.true")\
            .is_("deleted_at", "null")\
            .execute()
    
    async def get_chat_history(self, session_id, limit=10):
        """Get chat history with context using our custom function"""
        return self.client.rpc(
            'get_chat_history_with_context',
            {"p_session_id": session_id, "p_limit": limit}
        ).execute()
    
    async def soft_delete_document(self, doc_id, user_id):
        """Soft delete a document"""
        return self.client.table("documents")\
            .update({"deleted_at": datetime.utcnow().isoformat()})\
            .eq("id", doc_id)\
            .eq("owner_id", user_id)\
            .execute()

# Initialize Supabase manager
supabase_manager = SupabaseManager(supabase)

# Initialize Pinecone
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index_name = "triggrdocstore"
index = pc.Index(index_name)

# Initialize R2R API
R2R_API_KEY = os.getenv("R2R_API_KEY")
R2R_BASE_URL = "https://api.sciphi.ai/v3"
R2R_HEADERS = {
    "Authorization": f"Bearer {R2R_API_KEY}",
    "Content-Type": "application/json"
}

# Initialize Twilio
twilio_client = Client(
    os.getenv("TWILIO_ACCOUNT_SID"),
    os.getenv("TWILIO_AUTH_TOKEN")
)

async def process_document_with_r2r(content, filename):
    """Process document with R2R and store embeddings in Pinecone"""
    async with httpx.AsyncClient() as client:
        # Upload to R2R
        r2r_response = await client.post(
            f"{R2R_BASE_URL}/documents",
            headers=R2R_HEADERS,
            json={
                "content": content,
                "metadata": {"filename": filename}
            }
        )
        r2r_doc = r2r_response.json()
        
        # Get embeddings from R2R
        embeddings_response = await client.get(
            f"{R2R_BASE_URL}/documents/{r2r_doc['id']}/embeddings",
            headers=R2R_HEADERS
        )
        embeddings_data = embeddings_response.json()

        # Store in Pinecone
        vectors = []
        vector_ids = []
        for chunk in embeddings_data['chunks']:
            vector_id = hashlib.md5(chunk['text'].encode()).hexdigest()
            vectors.append({
                'id': vector_id,
                'values': chunk['embedding'],
                'metadata': {
                    'text': chunk['text'],
                    'document_id': r2r_doc['id']
                }
            })
            vector_ids.append(vector_id)

        index.upsert(vectors=vectors)
        
        return r2r_doc['id'], vector_ids

@app.route("/upload-files", methods=["POST"])
async def upload_files():
    try:
        if 'files' not in request.files:
            return jsonify({"error": "No files provided"}), 400

        files = request.files.getlist('files')
        results = []

        for file in files:
            try:
                content = file.read().decode('utf-8')
                
                # Process with R2R and store vectors
                r2r_doc_id, vector_ids = await process_document_with_r2r(content, file.filename)
                
                # Store document metadata in Supabase
                doc_data = {
                    "id": hashlib.md5(f"{file.filename}-{datetime.utcnow().isoformat()}".encode()).hexdigest(),
                    "name": file.filename,
                    "type": file.content_type or 'text/plain',
                    "r2r_doc_id": r2r_doc_id,
                    "vector_ids": vector_ids,
                    "meta_info": {
                        "filename": file.filename,
                        "upload_date": datetime.utcnow().isoformat()
                    }
                }
                
                supabase.table("documents").insert(doc_data).execute()
                
                results.append({
                    "id": doc_data["id"],
                    "name": file.filename,
                    "status": "success",
                    "r2r_doc_id": r2r_doc_id
                })
                
            except Exception as e:
                results.append({
                    "name": file.filename,
                    "status": "error",
                    "error": str(e)
                })

        return jsonify({"message": "Files processed", "files": results})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/documents", methods=["GET"])
async def get_documents():
    try:
        # Get user ID from auth header
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "Authorization required"}), 401
        
        user_id = supabase.auth.get_user(auth_header.split(' ')[1]).user.id
        response = await supabase_manager.get_user_documents(user_id)
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/documents/<document_id>", methods=["DELETE"])
async def delete_document(document_id):
    try:
        # Get user ID from auth header
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "Authorization required"}), 401
        
        user_id = supabase.auth.get_user(auth_header.split(' ')[1]).user.id
        
        # Soft delete in Supabase
        await supabase_manager.soft_delete_document(document_id, user_id)
        
        # Get document info for cleanup
        doc = supabase.table("documents").select("*").eq("id", document_id).single().execute().data
        
        # Delete from R2R
        async with httpx.AsyncClient() as client:
            await client.delete(
                f"{R2R_BASE_URL}/documents/{doc['r2r_doc_id']}",
                headers=R2R_HEADERS
            )
        
        # Delete vectors from Pinecone
        if doc['vector_ids']:
            index.delete(ids=doc['vector_ids'])
        
        return jsonify({"message": "Document deleted successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/whatsapp", methods=["POST"])
async def whatsapp_webhook():
    try:
        from_number = request.form.get("From")
        query = request.form.get("Body")

        # Store message in Supabase
        message_data = {
            "id": hashlib.md5(f"{from_number}-{datetime.utcnow().isoformat()}".encode()).hexdigest(),
            "session_id": from_number,
            "role": "user",
            "content": query,
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

        # Get relevant vectors from Pinecone
        query_response = index.query(
            vector=await get_embedding(query),
            top_k=5,
            include_metadata=True
        )
        
        context = " ".join([match.metadata['text'] for match in query_response.matches])

        # Query R2R with context and history
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{R2R_BASE_URL}/chat/completions",
                headers=R2R_HEADERS,
                json={
                    "messages": [
                        {"role": "system", "content": f"Use this context to help answer: {context}"},
                        *[{"role": msg["role"], "content": msg["content"]} 
                          for msg in reversed(chat_history.data)],
                        {"role": "user", "content": query}
                    ],
                    "stream": False
                }
            )
            r2r_response = response.json()
            
        assistant_response = r2r_response['choices'][0]['message']['content']

        # Store assistant message
        assistant_message = {
            "id": hashlib.md5(f"{from_number}-{datetime.utcnow().isoformat()}-assistant".encode()).hexdigest(),
            "session_id": from_number,
            "role": "assistant",
            "content": assistant_response,
            "timestamp": datetime.utcnow().isoformat()
        }
        supabase.table("messages").insert(assistant_message).execute()

        # Send WhatsApp response
        twilio_client.messages.create(
            to=from_number,
            from_=os.getenv("TWILIO_WHATSAPP_NUMBER"),
            body=assistant_response
        )

        return "OK", 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

async def get_embedding(text):
    """Get embedding from R2R"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{R2R_BASE_URL}/embeddings",
            headers=R2R_HEADERS,
            json={"input": text}
        )
        return response.json()['data'][0]['embedding']

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))