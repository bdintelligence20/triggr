from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool
import os
from dotenv import load_dotenv
from twilio.rest import Client
from datetime import datetime
import hashlib
import json
import asyncio
from r2r.core.models import ChatMessage
from r2r.core.store import DocumentStore, MessageStore
from r2r.core.index import VectorIndex
from r2r.core.chunking import TextChunker
from r2r.core.embeddings import OpenAIEmbeddings
from r2r.core.llm import OpenAIChat

# Load environment variables
load_dotenv()

# Initialize Flask app with Supabase connection
DATABASE_URL = f"postgresql://{os.getenv('SUPABASE_USER')}:{os.getenv('SUPABASE_PASSWORD')}@{os.getenv('SUPABASE_HOST')}:{os.getenv('SUPABASE_PORT')}/{os.getenv('SUPABASE_DATABASE')}"

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'poolclass': QueuePool,
    'pool_size': 5,
    'max_overflow': 10,
    'pool_timeout': 30,
    'pool_recycle': 1800,
}
CORS(app)

# Initialize R2R components
document_store = DocumentStore(
    connection_string=DATABASE_URL,
    table_name="documents"
)

message_store = MessageStore(
    connection_string=DATABASE_URL,
    table_name="messages"
)

vector_index = VectorIndex(
    connection_string=DATABASE_URL,
    embedding_model=OpenAIEmbeddings(api_key=os.getenv("OPENAI_API_KEY")),
    collection_name="triggrdocstore"
)

text_chunker = TextChunker(
    chunk_size=500,
    chunk_overlap=100
)

llm = OpenAIChat(
    api_key=os.getenv("OPENAI_API_KEY"),
    model="gpt-4-turbo-preview",
    temperature=0.7
)

# Initialize Twilio client
twilio_client = Client(
    os.getenv("TWILIO_ACCOUNT_SID"),
    os.getenv("TWILIO_AUTH_TOKEN")
)

# Create upload folder
UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "./uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Check if file type is allowed"""
    ALLOWED_EXTENSIONS = {'txt', 'pdf', 'doc', 'docx', 'csv'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/upload-files", methods=["POST"])
async def upload_files():
    try:
        if 'files' not in request.files:
            return jsonify({"error": "No files provided"}), 400

        files = request.files.getlist('files')
        results = []

        for file in files:
            if file and allowed_file(file.filename):
                try:
                    # Create a unique file ID
                    file_id = hashlib.md5(f"{file.filename}-{datetime.utcnow().isoformat()}".encode()).hexdigest()
                    temp_path = os.path.join(UPLOAD_FOLDER, file_id)
                    file.save(temp_path)

                    # Process file content
                    with open(temp_path, 'rb') as f:
                        content = f.read()

                    # Create document in R2R
                    document = await document_store.create_document(
                        content=content,
                        metadata={
                            "filename": file.filename,
                            "file_id": file_id,
                            "content_type": file.content_type or f"text/{file.filename.rsplit('.', 1)[1].lower()}"
                        }
                    )

                    # Chunk and index content
                    chunks = text_chunker.chunk(content.decode('utf-8', errors='ignore'))
                    
                    # Add chunks to vector index
                    await vector_index.add_texts(
                        texts=chunks,
                        metadata={"document_id": document.id}
                    )

                    results.append({
                        "id": document.id,
                        "name": file.filename,
                        "status": "success"
                    })

                    # Clean up
                    os.remove(temp_path)

                except Exception as e:
                    results.append({
                        "name": file.filename,
                        "status": "error",
                        "error": str(e)
                    })
                    if os.path.exists(temp_path):
                        os.remove(temp_path)

        return jsonify({"message": "Files processed", "files": results})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/documents", methods=["GET"])
async def get_documents():
    try:
        documents = await document_store.list_documents()
        return jsonify([{
            'id': doc.id,
            'name': doc.metadata.get('filename'),
            'type': doc.metadata.get('content_type'),
            'created_at': doc.created_at.isoformat(),
            'metadata': doc.metadata
        } for doc in documents])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/documents/<document_id>", methods=["DELETE"])
async def delete_document(document_id):
    try:
        await document_store.delete_document(document_id)
        await vector_index.delete_texts(filter={"document_id": document_id})
        return jsonify({"message": "Document deleted successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/whatsapp", methods=["POST"])
async def whatsapp_webhook():
    try:
        from_number = request.form.get("From")
        query = request.form.get("Body")

        # Create chat message
        chat_message = ChatMessage(
            role="user",
            content=query,
            metadata={"phone_number": from_number}
        )
        await message_store.create_message(chat_message)

        # Get relevant context
        relevant_chunks = await vector_index.similarity_search(
            query=query,
            k=5
        )

        # Get chat history
        chat_history = await message_store.get_messages(
            filter={"metadata.phone_number": from_number},
            limit=5
        )

        # Prepare messages for LLM
        messages = [
            {
                "role": "system",
                "content": f"You are a helpful AI assistant. Use this context to help answer the user's question, but don't mention that you're using any context: {' '.join([chunk.page_content for chunk in relevant_chunks])}"
            }
        ]

        # Add chat history
        for msg in chat_history:
            messages.append({
                "role": msg.role,
                "content": msg.content
            })

        # Add current query
        messages.append({
            "role": "user",
            "content": query
        })

        # Get response from LLM
        response = await llm.chat_complete(messages=messages)
        assistant_response = response.choices[0].message.content

        # Save assistant message
        assistant_message = ChatMessage(
            role="assistant",
            content=assistant_response,
            metadata={"phone_number": from_number}
        )
        await message_store.create_message(assistant_message)

        # Send WhatsApp response
        twilio_client.messages.create(
            to=from_number,
            from_=os.getenv("TWILIO_WHATSAPP_NUMBER"),
            body=assistant_response
        )

        return "OK", 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))