from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
import requests
from dotenv import load_dotenv
from twilio.rest import Client
from pinecone import Pinecone
import hashlib
import json

# Langchain imports
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.chat_models import ChatOpenAI
from langchain_community.vectorstores import Pinecone as LangchainPinecone
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import ConversationalRetrievalChain
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_core.prompts import PromptTemplate
from langchain.memory import ConversationBufferMemory

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///files.db'
db = SQLAlchemy(app)
CORS(app)

# Initialize Langchain components
embeddings = OpenAIEmbeddings(
    openai_api_key=os.getenv("OPENAI_API_KEY")
)

llm = ChatOpenAI(
    model_name="gpt-4-turbo-preview",
    temperature=0.7,
    openai_api_key=os.getenv("OPENAI_API_KEY")
)

# Initialize Pinecone
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index_name = "triggrdocstore"

if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name,
        spec=pc.create_index_spec(
            name=index_name,
            dimension=1536,  # OpenAI embedding dimension
            metric="cosine",
            spec_type="serverless",
            cloud="aws",
            region="us-east-1"
        )
    )

# Get Pinecone index
index = pc.Index(index_name)

# Initialize vectorstore for Langchain
vectorstore = LangchainPinecone(
    index=index,
    embedding=embeddings,
    text_key="text"
)

# Initialize text splitter
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len,
    separators=["\n\n", "\n", " ", ""]
)

# Initialize Twilio client
twilio_client = Client(
    os.getenv("TWILIO_ACCOUNT_SID"),
    os.getenv("TWILIO_AUTH_TOKEN")
)

# Define custom prompt template
CONDENSE_QUESTION_PROMPT = PromptTemplate.from_template("""
Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question that captures all relevant context.

Chat History:
{chat_history}

Follow Up Input: {question}

Standalone question:""")

QA_PROMPT = PromptTemplate.from_template("""
You are a helpful AI assistant. Use the following context to answer the user's question. 
If you don't know the answer, just say you don't know. Don't mention that you're using any context.

Context: {context}

Question: {question}

Helpful answer:""")

# Models
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
    user_id = db.Column(db.String, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_active = db.Column(db.DateTime, default=datetime.utcnow)

class Message(db.Model):
    id = db.Column(db.String, primary_key=True)
    thread_id = db.Column(db.String, db.ForeignKey('chat_thread.id'), nullable=False)
    role = db.Column(db.String, nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Create tables
with app.app_context():
    db.create_all()

def process_file_content(content, file_id):
    """Process file content into chunks and store in vector database"""
    # Split text into chunks
    chunks = text_splitter.split_text(content)
    
    # Generate IDs for chunks
    chunk_ids = [hashlib.md5(chunk.encode()).hexdigest() for chunk in chunks]
    
    # Prepare documents for vectorstore
    texts = [{"id": id, "text": text, "metadata": {"file_id": file_id}} 
            for id, text in zip(chunk_ids, chunks)]
    
    # Add to vectorstore
    vectorstore.add_texts(
        texts=[doc["text"] for doc in texts],
        ids=[doc["id"] for doc in texts],
        metadatas=[doc["metadata"] for doc in texts]
    )
    
    return chunk_ids

def get_chat_history(thread_id, limit=10):
    """Get chat history in Langchain format"""
    messages = Message.query.filter_by(thread_id=thread_id)\
        .order_by(Message.created_at.desc())\
        .limit(limit)\
        .all()
    
    history = []
    for i in range(0, len(messages)-1, 2):
        if i+1 < len(messages):
            history.append((messages[i].content, messages[i+1].content))
    
    return history

# Routes
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
            # Delete chunks from vectorstore
            chunk_ids = json.loads(file.chunk_ids) if file.chunk_ids else []
            if chunk_ids:
                vectorstore.delete(ids=chunk_ids)
            
            db.session.delete(file)
            db.session.commit()
            return jsonify({"message": "File deleted successfully"})
        return jsonify({"error": "File not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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

        # Get chat history
        chat_history = get_chat_history(thread.id)

        # Initialize conversation chain
        qa_chain = ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=vectorstore.as_retriever(),
            memory=ConversationBufferMemory(
                memory_key="chat_history",
                return_messages=True,
                output_key="answer"
            ),
            condense_question_prompt=CONDENSE_QUESTION_PROMPT,
            combine_docs_chain_kwargs={"prompt": QA_PROMPT},
            return_source_documents=True,
            verbose=True
        )

        # Get response
        response = qa_chain.invoke({
            "question": body,
            "chat_history": chat_history
        })

        assistant_response = response["answer"]

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
            content=assistant_response
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
            body=assistant_response
        )

        return "OK", 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))