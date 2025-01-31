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

# R2R imports
from r2r import (
    Document,
    Collection,
    QueryEngine,
    LLMConfig,
    VectorDBConfig,
    ProcessorConfig,
    ChunkingConfig,
    RetrievalConfig
)
from r2r.document import DocumentProcessor
from r2r.vectordb import PineconeVectorDB
from r2r.chunking import SemanticChunker
from r2r.llm import OpenAILLM
from r2r.processor import (
    PDFProcessor,
    DocxProcessor,
    TextProcessor,
    CSVProcessor
)
from r2r.retrieval import (
    HybridRetriever,
    ReRanker,
    QueryExpander
)

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

# Initialize Twilio
twilio_client = Client(
    os.getenv("TWILIO_ACCOUNT_SID"),
    os.getenv("TWILIO_AUTH_TOKEN")
)

# R2R Configuration
llm_config = LLMConfig(
    provider="openai",
    model="gpt-4-turbo-preview",
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.7
)

vector_config = VectorDBConfig(
    provider="pinecone",
    api_key=os.getenv("PINECONE_API_KEY"),
    index_name="triggrdocstore",
    environment="us-east-1"
)

processor_config = ProcessorConfig(
    pdf=PDFProcessor(),
    docx=DocxProcessor(),
    txt=TextProcessor(),
    csv=CSVProcessor()
)

chunking_config = ChunkingConfig(
    chunker=SemanticChunker(
        chunk_size=500,
        chunk_overlap=50,
        semantics_model="all-MiniLM-L6-v2"
    )
)

retrieval_config = RetrievalConfig(
    retriever=HybridRetriever(
        vector_weight=0.7,
        keyword_weight=0.3
    ),
    reranker=ReRanker(
        model="cross-encoder/ms-marco-MiniLM-L-6-v2",
        top_k=5
    ),
    query_expander=QueryExpander(
        expansion_model="all-MiniLM-L6-v2",
        num_expansions=3
    )
)

# Initialize R2R components
collection = Collection(
    vector_db=PineconeVectorDB(vector_config),
    processor_config=processor_config,
    chunking_config=chunking_config
)

query_engine = QueryEngine(
    collection=collection,
    llm=OpenAILLM(llm_config),
    retrieval_config=retrieval_config
)

# Create upload folder
UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "./uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Database models (using SQLAlchemy)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

Base = declarative_base()

class FileMetadata(Base):
    __tablename__ = 'file_metadata'
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    size = Column(String)
    owner = Column(String)
    last_modified = Column(DateTime, default=datetime.utcnow)
    doc_id = Column(String)  # R2R document ID
    metadata = Column(String)  # JSON string for additional metadata

class ChatThread(Base):
    __tablename__ = 'chat_thread'
    
    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_active = Column(DateTime, default=datetime.utcnow)
    messages = relationship("Message", back_populates="thread")

class Message(Base):
    __tablename__ = 'message'
    
    id = Column(String, primary_key=True)
    thread_id = Column(String, ForeignKey('chat_thread.id'), nullable=False)
    role = Column(String, nullable=False)
    content = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    thread = relationship("ChatThread", back_populates="messages")

# Create database tables
engine = create_engine(DATABASE_URL)
Base.metadata.create_all(engine)

def allowed_file(filename):
    """Check if file type is allowed"""
    ALLOWED_EXTENSIONS = {'txt', 'pdf', 'doc', 'docx', 'csv'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/files", methods=["POST"])
def upload_files():
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

                    # Process document with R2R
                    doc = Document.from_file(
                        file_path=temp_path,
                        metadata={
                            "filename": file.filename,
                            "upload_date": datetime.utcnow().isoformat(),
                            "owner": "user"  # Replace with actual user ID
                        }
                    )

                    # Add document to collection
                    doc_id = collection.add_document(doc)

                    # Save metadata to database
                    new_file = FileMetadata(
                        id=file_id,
                        name=file.filename,
                        type=file.content_type or f"text/{file.filename.rsplit('.', 1)[1].lower()}",
                        size=str(os.path.getsize(temp_path)),
                        owner="user",
                        doc_id=doc_id,
                        metadata=json.dumps(doc.metadata)
                    )

                    with engine.connect() as conn:
                        conn.execute(
                            FileMetadata.__table__.insert(),
                            new_file.__dict__
                        )
                        conn.commit()

                    # Clean up
                    os.remove(temp_path)

                    results.append({
                        "id": file_id,
                        "name": file.filename,
                        "status": "success",
                        "doc_id": doc_id
                    })

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

@app.route("/files", methods=["GET"])
def get_files():
    try:
        with engine.connect() as conn:
            result = conn.execute(FileMetadata.__table__.select())
            files = [{
                'id': row.id,
                'name': row.name,
                'type': row.type,
                'size': row.size,
                'owner': row.owner,
                'lastModified': row.last_modified.isoformat(),
                'docId': row.doc_id,
                'metadata': json.loads(row.metadata) if row.metadata else {}
            } for row in result]
        return jsonify(files)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/files/<file_id>", methods=["DELETE"])
def delete_file(file_id):
    try:
        with engine.connect() as conn:
            # Get file metadata
            result = conn.execute(
                FileMetadata.__table__.select().where(FileMetadata.id == file_id)
            ).first()
            
            if result:
                # Delete from vector store
                collection.delete_document(result.doc_id)
                
                # Delete from database
                conn.execute(
                    FileMetadata.__table__.delete().where(FileMetadata.id == file_id)
                )
                conn.commit()
                
                return jsonify({"message": "File deleted successfully"})
            return jsonify({"error": "File not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/whatsapp", methods=["POST"])
def whatsapp_webhook():
    try:
        from_number = request.form.get("From")
        body = request.form.get("Body")

        # Get or create chat thread
        with engine.connect() as conn:
            thread = conn.execute(
                ChatThread.__table__.select().where(ChatThread.user_id == from_number)
            ).first()

            if not thread:
                thread_id = hashlib.md5(from_number.encode()).hexdigest()
                conn.execute(
                    ChatThread.__table__.insert(),
                    {
                        "id": thread_id,
                        "user_id": from_number,
                        "created_at": datetime.utcnow(),
                        "last_active": datetime.utcnow()
                    }
                )
                conn.commit()
            else:
                thread_id = thread.id

            # Get chat history
            messages = conn.execute(
                Message.__table__.select()
                .where(Message.thread_id == thread_id)
                .order_by(Message.created_at.desc())
                .limit(10)
            ).all()

            chat_history = [
                {"role": msg.role, "content": msg.content}
                for msg in reversed(messages)
            ]

        # Query using R2R
        response = query_engine.query(
            query=body,
            chat_history=chat_history
        )

        assistant_response = response.answer

        # Save messages
        with engine.connect() as conn:
            # Save user message
            conn.execute(
                Message.__table__.insert(),
                {
                    "id": hashlib.md5(f"{thread_id}-{datetime.utcnow().isoformat()}".encode()).hexdigest(),
                    "thread_id": thread_id,
                    "role": "user",
                    "content": body,
                    "created_at": datetime.utcnow()
                }
            )

            # Save assistant message
            conn.execute(
                Message.__table__.insert(),
                {
                    "id": hashlib.md5(f"{thread_id}-{datetime.utcnow().isoformat()}-assistant".encode()).hexdigest(),
                    "thread_id": thread_id,
                    "role": "assistant",
                    "content": assistant_response,
                    "created_at": datetime.utcnow()
                }
            )

            # Update thread last_active
            conn.execute(
                ChatThread.__table__.update()
                .where(ChatThread.id == thread_id)
                .values(last_active=datetime.utcnow())
            )
            
            conn.commit()

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