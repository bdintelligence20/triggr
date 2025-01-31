
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
import requests
from dotenv import load_dotenv
from twilio.rest import Client
from pinecone import Pinecone
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.chat_models import ChatOpenAI
from langchain.schema import SystemMessage, HumanMessage, AIMessage
import hashlib
import json

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///files.db'
db = SQLAlchemy(app)
CORS(app)

# Initialize Pinecone
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index_name = "documents-store"
if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name,
        dimension=1536,  # OpenAI embedding dimension
        metric="cosine"
    )
index = pc.Index(index_name)

# Initialize OpenAI embeddings
embeddings = OpenAIEmbeddings(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize ChatGPT model
chat_model = ChatOpenAI(
    model_name="gpt-4-turbo-preview",
    temperature=0.7,
    api_key=os.getenv("OPENAI_API_KEY")
)

# Initialize Twilio client
twilio_client = Client(
    os.getenv("TWILIO_ACCOUNT_SID"),
    os.getenv("TWILIO_AUTH_TOKEN")
)

# Text splitter for chunking
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len,
    separators=["\n\n", "\n", " ", ""]
)

# Enhanced models
class FileMetadata(db.Model):
    id = db.Column(db.String, primary_key=True)
    name = db.Column(db.String, nullable=False)
    type = db.Column(db.String, nullable=False)
    size = db.Column(db.String)
    owner = db.Column(db.String)
    last_modified = db.Column(db.DateTime, default=datetime.utcnow)
    chunk_ids = db.Column(db.String)  # Store chunk IDs as JSON string

class ChatThread(db.Model):
    id = db.Column(db.String, primary_key=True)
    user_id = db.Column(db.String, nullable=False)  # Could be phone number or other identifier
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_active = db.Column(db.DateTime, default=datetime.utcnow)

class Message(db.Model):
    id = db.Column(db.String, primary_key=True)
    thread_id = db.Column(db.String, db.ForeignKey('chat_thread.id'), nullable=False)
    role = db.Column(db.String, nullable=False)  # 'user' or 'assistant'
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Create tables
with app.app_context():
    db.create_all()

def generate_chunk_id(content):
    """Generate a unique ID for a chunk based on its content"""
    return hashlib.md5(content.encode()).hexdigest()

def process_file_content(content, file_id):
    """Process file content into chunks and store in Pinecone"""
    chunks = text_splitter.split_text(content)
    chunk_ids = []
    
    for chunk in chunks:
        chunk_id = generate_chunk_id(chunk)
        chunk_ids.append(chunk_id)
        
        # Get embedding for the chunk
        embedding = embeddings.embed_query(chunk)
        
        # Store in Pinecone
        index.upsert(
            vectors=[{
                "id": chunk_id,
                "values": embedding,
                "metadata": {
                    "file_id": file_id,
                    "content": chunk
                }
            }]
        )
    
    return chunk_ids

@app.route("/files", methods=["GET"])
def get_files():
    try:
        files = FileMetadata.query.all()
        return jsonify([{
            'id': file.id,
            'name': file.name,
            'type': file.type,
            'size': file.size,
            'owner': file.owner,
            'lastModified': file.last_modified.isoformat(),
            'chunkIds': json.loads(file.chunk_ids) if file.chunk_ids else []
        } for file in files])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/files", methods=["POST"])
def save_file_metadata():
    try:
        data = request.json
        file_content = data.get('content', '')
        chunk_ids = process_file_content(file_content, data['id']) if file_content else []
        
        new_file = FileMetadata(
            id=data['id'],
            name=data['name'],
            type=data['type'],
            size=data['size'],
            owner=data['owner'],
            chunk_ids=json.dumps(chunk_ids)
        )
        db.session.add(new_file)
        db.session.commit()
        return jsonify({"message": "File metadata saved successfully", "chunkIds": chunk_ids})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/files/<file_id>", methods=["DELETE"])
def delete_file(file_id):
    try:
        file = FileMetadata.query.get(file_id)
        if file:
            # Delete chunks from Pinecone
            chunk_ids = json.loads(file.chunk_ids) if file.chunk_ids else []
            if chunk_ids:
                index.delete(ids=chunk_ids)
            
            db.session.delete(file)
            db.session.commit()
            return jsonify({"message": "File deleted successfully"})
        return jsonify({"error": "File not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_relevant_chunks(query, k=5):
    """Get relevant chunks from Pinecone based on query"""
    query_embedding = embeddings.embed_query(query)
    results = index.query(
        vector=query_embedding,
        top_k=k,
        include_metadata=True
    )
    
    return [match.metadata["content"] for match in results.matches]

def get_chat_history(thread_id, limit=10):
    """Get recent chat history for a thread"""
    messages = Message.query.filter_by(thread_id=thread_id)\
        .order_by(Message.created_at.desc())\
        .limit(limit)\
        .all()
    
    return [
        HumanMessage(content=msg.content) if msg.role == "user"
        else AIMessage(content=msg.content)
        for msg in reversed(messages)
    ]

@app.route("/whatsapp", methods=["POST"])
def whatsapp_webhook():
    try:
        from_number = request.form.get("From")
        body = request.form.get("Body")

        # Get or create thread
        thread = ChatThread.query.filter_by(user_id=from_number).first()
        if not thread:
            thread_id = hashlib.md5(from_number.encode()).hexdigest()
            thread = ChatThread(id=thread_id, user_id=from_number)
            db.session.add(thread)
            db.session.commit()

        # Get relevant chunks
        relevant_chunks = get_relevant_chunks(body)
        context = "\n\n".join(relevant_chunks)

        # Get chat history
        chat_history = get_chat_history(thread.id)

        # Prepare messages for the model
        messages = [
            SystemMessage(content=f"You are a helpful AI assistant. Use this context to help answer the user's question, but don't mention that you're using any context: {context}"),
            *chat_history,
            HumanMessage(content=body)
        ]

        # Get response from the model
        response = chat_model.invoke(messages)

        # Save messages to database
        new_user_message = Message(
            id=hashlib.md5(f"{thread.id}-{datetime.utcnow().isoformat()}".encode()).hexdigest(),
            thread_id=thread.id,
            role="user",
            content=body
        )
        new_assistant_message = Message(
            id=hashlib.md5(f"{thread.id}-{datetime.utcnow().isoformat()}-assistant".encode()).hexdigest(),
            thread_id=thread.id,
            role="assistant",
            content=response.content
        )
        db.session.add(new_user_message)
        db.session.add(new_assistant_message)
        
        # Update thread last_active
        thread.last_active = datetime.utcnow()
        db.session.commit()

        # Send response via WhatsApp
        twilio_client.messages.create(
            to=from_number,
            from_=os.getenv("TWILIO_WHATSAPP_NUMBER"),
            body=response.content
        )

        return "OK", 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))