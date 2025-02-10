from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from datetime import datetime
from dotenv import load_dotenv
from r2r import R2RClient
import tempfile

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

class RAGConfig:
    """Configuration for the RAG system"""
    def __init__(self):
        # Initialize R2R client
        self.client = R2RClient()
        
        # Configure RAG parameters
        self.rag_settings = {
            "model": os.getenv("LLM_MODEL", "openai/gpt-4"),
            "temperature": float(os.getenv("LLM_TEMPERATURE", "0.0")),
        }
        
        # Configure search settings
        self.search_settings = {
            "index_measure": "l2_distance",
            "use_hybrid_search": True,
            "hybrid_settings": {
                "full_text_weight": 1.0,
                "semantic_weight": 5.0,
                "full_text_limit": 200,
                "rrf_k": 50,
            }
        }

class DocumentManager:
    """Handles document operations"""
    def __init__(self, rag_config: RAGConfig):
        self.config = rag_config
        self.client = rag_config.client

    def process_file(self, file):
        """Process and ingest a single file"""
        try:
            # Create temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp:
                file.save(temp.name)
                temp_path = temp.name

            # Ingest document using R2R
            response = self.client.documents.create(
                file_path=temp_path,
                metadata={"filename": file.filename, "upload_date": datetime.utcnow().isoformat()}
            )
            
            # Extract document ID from the response
            # The response type might vary depending on the R2R version
            doc_id = None
            if hasattr(response, 'id'):
                doc_id = response.id
            elif isinstance(response, tuple) and len(response) >= 1:
                doc_id = response[0]
            else:
                logger.warning(f"Unexpected response format: {response}")
                doc_id = "pending"  # Document is being processed

            # Clean up temporary file
            os.unlink(temp_path)

            return {
                "status": "success",
                "document_id": doc_id,
                "filename": file.filename,
                "message": "Document uploaded and being processed"
            }

        except Exception as e:
            logger.error(f"Error processing file {file.filename}: {str(e)}")
            return {
                "status": "error",
                "filename": file.filename,
                "error": str(e)
            }

class RAGService:
    """Handles RAG operations"""
    def __init__(self, rag_config: RAGConfig):
        self.config = rag_config
        self.client = rag_config.client

    def query(self, query_text: str, stream: bool = False):
        """Process a query using RAG"""
        try:
            # Perform RAG query
            rag_response = self.client.retrieval.rag(
                query=query_text,
                rag_generation_config=self.config.rag_settings,
                search_settings=self.config.search_settings,
                stream=stream
            )

            # Extract search results and completion
            results = rag_response.results
            
            return {
                "status": "success",
                "completion": results.completion,
                "search_results": [
                    {
                        "score": result.score,
                        "text": result.text
                    } for result in results.search_results.chunk_search_results
                ]
            }

        except Exception as e:
            logger.error(f"Error processing query: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }

# Initialize services
rag_config = RAGConfig()
document_manager = DocumentManager(rag_config)
rag_service = RAGService(rag_config)

# Error handlers
@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({
        "error": "Method not allowed",
        "message": "The method is not allowed for this endpoint"
    }), 405

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint that also verifies R2R connection"""
    try:
        # Try to list documents as a connection test
        rag_config.client.documents.list()
        return jsonify({
            "status": "healthy",
            "r2r_connection": "connected",
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }), 500

@app.route("/", methods=["GET"])
def root():
    """Root endpoint"""
    return jsonify({
        "status": "ok",
        "message": "R2R Local RAG Service is running"
    })

@app.route("/files", methods=["GET"])
def get_files():
    """Get list of all documents"""
    try:
        # List all documents
        response = rag_config.client.documents.list()
        
        # The response contains documents in a data field
        documents = []
        for doc in response:
            if isinstance(doc, tuple) and len(doc) >= 2:
                doc_id, metadata = doc
                documents.append({
                    "id": doc_id,
                    "filename": metadata.get("filename", "Unknown") if metadata else "Unknown",
                    "upload_date": metadata.get("upload_date", "Unknown") if metadata else "Unknown"
                })
            else:
                logger.warning(f"Unexpected document format: {doc}")
        
        return jsonify({
            "status": "success",
            "documents": documents
        })
    except Exception as e:
        logger.error(f"Error getting documents: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/upload-files", methods=["POST"])
def upload_files():
    """Handle file uploads"""
    try:
        if 'files' not in request.files:
            return jsonify({"error": "No files provided"}), 400

        files = request.files.getlist('files')
        results = []

        for file in files:
            if file.filename:
                result = document_manager.process_file(file)
                results.append(result)

        return jsonify({
            "message": "Files processed",
            "files": results
        })

    except Exception as e:
        logger.error(f"Error uploading files: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/query", methods=["POST"])
def query():
    """Query the RAG system"""
    try:
        data = request.json
        if not data or 'query' not in data:
            return jsonify({"error": "No query provided"}), 400

        stream = data.get('stream', False)
        response = rag_service.query(data['query'], stream)
        return jsonify(response)

    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/documents/<document_id>", methods=["DELETE"])
def delete_document(document_id):
    """Delete a document"""
    try:
        rag_config.client.documents.delete(document_id)
        return jsonify({"message": "Document deleted successfully"})
    except Exception as e:
        logger.error(f"Error deleting document: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))