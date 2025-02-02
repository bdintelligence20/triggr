from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, Column, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
import os
from dotenv import load_dotenv
from twilio.rest import Client
from datetime import datetime
import hashlib
import json
import httpx
from pinecone import Pinecone

# Load environment variables
load_dotenv()

# Initialize Flask app with Supabase connection
DATABASE_URL = f"postgresql://{os.getenv('SUPABASE_USER')}:{os.getenv('SUPABASE_PASSWORD')}@{os.getenv('SUPABASE_HOST')}:{os.getenv('SUPABASE_PORT')}/{os.getenv('SUPABASE_DATABASE')}"

app = Flask(__name__)
CORS(app)

# Initialize database
engine = create_engine(
    DATABASE_URL,
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=1800
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

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

# Database Models
class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    r2r_doc_id = Column(String)  # R2R document ID
    vector_ids = Column(String)  # JSON array of vector IDs
    metadata = Column(String)  # JSON string of metadata
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True)
    session_id = Column(String, nullable=False)  # e.g., phone number for WhatsApp
    role = Column(String, nullable=False)
    content = Column(String, nullable=False)
    metadata = Column(String)  # JSON string of metadata
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(engine)

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
                
                # Store document metadata
                doc_id = hashlib.md5(f"{file.filename}-{datetime.utcnow().isoformat()}".encode()).hexdigest()
                
                doc = Document(
                    id=doc_id,
                    name=file.filename,
                    type=file.content_type or 'text/plain',
                    r2r_doc_id=r2r_doc_id,
                    vector_ids=json.dumps(vector_ids),
                    metadata=json.dumps({
                        "filename": file.filename,
                        "upload_date": datetime.utcnow().isoformat()
                    })
                )

                db = SessionLocal()
                db.add(doc)
                db.commit()
                
                results.append({
                    "id": doc_id,
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
def get_documents():
    try:
        db = SessionLocal()
        documents = db.query(Document).all()
        return jsonify([{
            'id': doc.id,
            'name': doc.name,
            'type': doc.type,
            'r2r_doc_id': doc.r2r_doc_id,
            'created_at': doc.created_at.isoformat(),
            'metadata': json.loads(doc.metadata) if doc.metadata else {}
        } for doc in documents])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/documents/<document_id>", methods=["DELETE"])
async def delete_document(document_id):
    try:
        db = SessionLocal()
        doc = db.query(Document).filter(Document.id == document_id).first()
        
        if doc:
            # Delete from R2R
            async with httpx.AsyncClient() as client:
                await client.delete(
                    f"{R2R_BASE_URL}/documents/{doc.r2r_doc_id}",
                    headers=R2R_HEADERS
                )
            
            # Delete vectors from Pinecone
            vector_ids = json.loads(doc.vector_ids)
            index.delete(ids=vector_ids)
            
            # Delete from database
            db.delete(doc)
            db.commit()
            
            return jsonify({"message": "Document deleted successfully"})
            
        return jsonify({"error": "Document not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/whatsapp", methods=["POST"])
async def whatsapp_webhook():
    try:
        from_number = request.form.get("From")
        query = request.form.get("Body")
        
        db = SessionLocal()

        # Store user message
        user_message = ChatMessage(
            id=hashlib.md5(f"{from_number}-{datetime.utcnow().isoformat()}".encode()).hexdigest(),
            session_id=from_number,
            role="user",
            content=query,
            created_at=datetime.utcnow()
        )
        db.add(user_message)
        db.commit()

        # Get chat history
        chat_history = db.query(ChatMessage)\
            .filter(ChatMessage.session_id == from_number)\
            .order_by(ChatMessage.created_at.desc())\
            .limit(10)\
            .all()

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
                        *[{"role": msg.role, "content": msg.content} for msg in reversed(chat_history)],
                        {"role": "user", "content": query}
                    ],
                    "stream": False
                }
            )
            r2r_response = response.json()
            
        assistant_response = r2r_response['choices'][0]['message']['content']

        # Store assistant message
        assistant_message = ChatMessage(
            id=hashlib.md5(f"{from_number}-{datetime.utcnow().isoformat()}-assistant".encode()).hexdigest(),
            session_id=from_number,
            role="assistant",
            content=assistant_response,
            created_at=datetime.utcnow()
        )
        db.add(assistant_message)
        db.commit()

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