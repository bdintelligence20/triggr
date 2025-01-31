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
from r2r.embeddings import OpenAIEmbeddings
from r2r.vector_store import Pinecone
from r2r.schema import Document, Query, Context
from r2r.chunker import TokenTextSplitter
from r2r.retriever import VectorRetriever
from r2r.llm import OpenAI
from r2r.reranker import CohereReranker
from r2r.pipeline import Pipeline
from r2r.chat_history import ChatHistory

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

# R2R imports
from r2r.embeddings import OpenAIEmbeddings
from r2r.vector_store import Pinecone
from r2r.schema import Document, Query, Context
from r2r.chunker import TokenTextSplitter
from r2r.retriever import VectorRetriever, HybridRetriever, CrossEncoderRetriever
from r2r.llm import OpenAI
from r2r.pipeline import Pipeline
from r2r.chat_history import ChatHistory
from r2r.prompts import Prompt

# Custom ranking function
def custom_rank_documents(docs, query, llm):
    """
    Custom ranking function that uses GPT-4 to score document relevance
    """
    ranking_prompt = Prompt("""
    Rate how relevant the following document is to answering the query.
    Score from 0-10 where 10 is perfectly relevant and 0 is completely irrelevant.
    Only output the numerical score.
    
    Query: {query}
    
    Document: {document}
    
    Relevance Score (0-10): """)
    
    scored_docs = []
    for doc in docs:
        response = llm.complete(
            ranking_prompt.format(
                query=query,
                document=doc.content
            )
        )
        try:
            score = float(response.strip())
            scored_docs.append((doc, score))
        except ValueError:
            scored_docs.append((doc, 0))
    
    # Sort by score descending
    return [doc for doc, score in sorted(scored_docs, key=lambda x: x[1], reverse=True)]

# Initialize R2R components
embeddings = OpenAIEmbeddings(
    api_key=os.getenv("OPENAI_API_KEY"),
    model="text-embedding-3-large"  # Using the latest embedding model
)

vector_store = Pinecone(
    api_key=os.getenv("PINECONE_API_KEY"),
    environment="us-east-1",
    index_name="triggrdocstore"
)

chunker = TokenTextSplitter(
    chunk_size=500,
    chunk_overlap=100,  # Increased overlap for better context
    add_start_index=True
)

# Primary vector retriever
vector_retriever = VectorRetriever(
    vector_store=vector_store,
    embeddings=embeddings,
    top_k=10  # Retrieve more candidates for re-ranking
)

# Cross-encoder retriever for semantic similarity
cross_encoder_retriever = CrossEncoderRetriever(
    model_name="cross-encoder/ms-marco-MiniLM-L-12-v2",
    top_k=5
)

# Hybrid retriever combining vector and keyword search
hybrid_retriever = HybridRetriever(
    retrievers=[vector_retriever, cross_encoder_retriever],
    weights=[0.7, 0.3]
)

llm = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    model="gpt-4-turbo-preview",
    temperature=0.7
)

# Custom pipeline that includes ranking
class EnhancedPipeline(Pipeline):
    def retrieve(self, query: Query, **kwargs) -> list[Document]:
        # Get initial candidates from hybrid retriever
        candidates = self.retriever.retrieve(query, **kwargs)
        
        # Apply cross-encoder ranking
        if len(candidates) > 1:
            candidates = cross_encoder_retriever.rerank(candidates, query)
        
        # Apply custom GPT-4 ranking for final ordering
        ranked_docs = custom_rank_documents(candidates, query.text, self.llm)
        
        return ranked_docs[:5]  # Return top 5 after all ranking steps

# Initialize enhanced pipeline
pipeline = EnhancedPipeline(
    retriever=hybrid_retriever,
    llm=llm
)

# Initialize chat history with metadata tracking
chat_history = ChatHistory(
    max_messages=10,
    include_timestamps=True,
    track_token_usage=True
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