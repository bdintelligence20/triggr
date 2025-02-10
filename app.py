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

# Configure CORS with specific origins
CORS(app, resources={
    r"/*": {
        "origins": [
            "https://triggr-1.onrender.com",  # Production frontend
            "http://localhost:3000",          # Local development
            "http://localhost:5173"           # Vite default port
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Ensure CORS headers are returned even for errors
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'https://triggr-1.onrender.com')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

class RAGConfig:
    """Configuration for the RAG system"""
    def __init__(self):
        # Initialize R2R client with custom settings
        self.client = R2RClient()
        
        # Configure RAG parameters
        self.rag_settings = {
            "model": os.getenv("LLM_MODEL", "openai/gpt-4"),
            "temperature": float(os.getenv("LLM_TEMPERATURE", "0.0")),
        }
        
        # Configure search settings
        self.search_settings = {
            "index_measure": "cosine",  # or "l2_distance", "inner_product"
            "use_hybrid_search": True,
            "hybrid_settings": {
                "full_text_weight": 1.0,
                "semantic_weight": 5.0,
                "full_text_limit": 200,
                "rrf_k": 50,
            }
        }
        
        # Configure chunking settings
        self.chunk_settings = {
            "chunk_size": 1000,  # Size of each chunk in characters
            "chunk_overlap": 200,  # Overlap between chunks
            "length_function": len,  # Function to measure chunk size
        }
        
        # Configure embedding settings
        self.embedding_settings = {
            "model": "openai",  # R2R will use the appropriate embedding model
            "dimensions": 1536,  # Embedding dimensions
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

            # Ingest document using R2R with metadata
            response = self.client.documents.create(
                file_path=temp_path,
                metadata={
                    "filename": file.filename,
                    "upload_date": datetime.utcnow().isoformat(),
                }
            )

            # Log the full response for debugging
            logger.info(f"Document creation response: {response}")

            # Extract document ID
            doc_id = str(response.document_id) if hasattr(response, 'document_id') else None
            if not doc_id and hasattr(response, 'results'):
                doc_id = str(response.results.document_id)

            # Extract task ID if available
            task_id = None
            if hasattr(response, 'task_id'):
                task_id = str(response.task_id)
            elif hasattr(response, 'results') and hasattr(response.results, 'task_id'):
                task_id = str(response.results.task_id)

            # Clean up temporary file
            os.unlink(temp_path)

            return {
                "status": "success",
                "document_id": doc_id,
                "task_id": task_id,
                "filename": file.filename,
                "message": "Document upload initiated and being processed"
            }

        except Exception as e:
            logger.error(f"Error processing file {file.filename}: {str(e)}")
            logger.exception("Full traceback:")
            if 'temp_path' in locals() and os.path.exists(temp_path):
                os.unlink(temp_path)
            return {
                "status": "error",
                "filename": file.filename,
                "error": str(e)
            }

            # Log the full response for debugging
            logger.info(f"Document creation response: {response}")

            # Handle IngestionResponse
            if hasattr(response, 'document_id'):
                doc_id = str(response.document_id)
            elif hasattr(response, 'results') and hasattr(response.results, 'document_id'):
                doc_id = str(response.results.document_id)
            else:
                doc_id = "pending"
                logger.warning(f"Unexpected response format: {response}")

            # Handle task_id if available
            task_id = None
            if hasattr(response, 'task_id'):
                task_id = str(response.task_id)
            elif hasattr(response, 'results') and hasattr(response.results, 'task_id'):
                task_id = str(response.results.task_id)

            # Clean up temporary file
            os.unlink(temp_path)

            return {
                "status": "success",
                "document_id": doc_id,
                "task_id": task_id,
                "filename": file.filename,
                "message": "Document upload initiated and being processed"
            }

        except Exception as e:
            logger.error(f"Error processing file {file.filename}: {str(e)}")
            logger.exception("Full traceback:")  # This will log the full traceback
            if os.path.exists(temp_path):
                os.unlink(temp_path)
            return {
                "status": "error",
                "filename": file.filename,
                "error": str(e)
            }
            
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

@app.route("/test-connection", methods=["GET"])
def test_connection():
    """Test database and R2R connections"""
    try:
        # Get Postgres configuration
        postgres_config = {
            "host": os.getenv("R2R_POSTGRES_HOST"),
            "port": int(os.getenv("R2R_POSTGRES_PORT", "6543")),
            "user": os.getenv("R2R_POSTGRES_USER", "postgres"),
            "dbname": os.getenv("R2R_POSTGRES_DBNAME", "postgres"),
            "project_name": os.getenv("R2R_PROJECT_NAME", "r2r_project")
        }
        
        # Log connection attempt
        logger.info(f"Testing connection to Postgres: {postgres_config['host']}:{postgres_config['port']}")
        
        # Test R2R connection
        response = rag_config.client.documents.list()
        logger.info(f"R2R connection test response: {response}")
        
        return jsonify({
            "status": "success",
            "postgres_config": {
                "host": postgres_config["host"],
                "port": postgres_config["port"],
                "user": postgres_config["user"],
                "dbname": postgres_config["dbname"],
                "project_name": postgres_config["project_name"]
            },
            "r2r_status": "connected",
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Connection test failed: {str(e)}")
        logger.exception("Full traceback:")
        return jsonify({
            "status": "error",
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
        logger.info(f"Documents response: {response}")
        
        documents = []
        # Check if response is a list
        if isinstance(response, list):
            for doc in response:
                # Handle each document based on its structure
                doc_data = {
                    "id": str(doc["id"]) if isinstance(doc, dict) and "id" in doc else "unknown",
                    "filename": doc["metadata"]["filename"] if isinstance(doc, dict) and "metadata" in doc and "filename" in doc["metadata"] else "Unknown",
                    "upload_date": doc["metadata"]["upload_date"] if isinstance(doc, dict) and "metadata" in doc and "upload_date" in doc["metadata"] else "Unknown",
                    "status": doc["status"] if isinstance(doc, dict) and "status" in doc else "unknown"
                }
                documents.append(doc_data)
        
        return jsonify({
            "status": "success",
            "documents": documents
        })
    except Exception as e:
        logger.error(f"Error getting documents: {str(e)}")
        logger.exception("Full traceback:")  # This will log the full traceback
        return jsonify({"error": str(e)}), 500

@app.route("/upload-files", methods=["POST"])
def upload_files():
    """Handle file uploads"""
    try:
        if 'files' not in request.files:
            return jsonify({
                "status": "error",
                "error": "No files provided"
            }), 400

        files = request.files.getlist('files')
        results = []
        file_ids = []

        for file in files:
            if file.filename:
                result = document_manager.process_file(file)
                results.append(result)
                if result.get('status') == 'success':
                    file_ids.append(result.get('document_id'))

        return jsonify({
            "status": "success",
            "message": "Files processed",
            "files": results,
            "file_ids": file_ids  # Add file_ids to match frontend expectations
        })

    except Exception as e:
        logger.error(f"Error uploading files: {str(e)}")
        logger.exception("Full traceback:")
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

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

@app.route("/documents/<document_id>/chunks", methods=["GET"])
def get_document_chunks(document_id):
    """Get chunks for a specific document"""
    try:
        # Get document chunks with their embeddings
        chunks = rag_config.client.documents.get_chunks(document_id)
        
        return jsonify({
            "status": "success",
            "document_id": document_id,
            "chunks": [{
                "id": chunk.id if hasattr(chunk, 'id') else None,
                "text": chunk.text if hasattr(chunk, 'text') else str(chunk),
                "metadata": chunk.metadata if hasattr(chunk, 'metadata') else None
            } for chunk in chunks]
        })
    except Exception as e:
        logger.error(f"Error getting document chunks: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/documents/<document_id>/status", methods=["GET"])
def get_document_status(document_id):
    """Get the status of a document"""
    try:
        # Get document status
        response = rag_config.client.documents.get(document_id)
        logger.info(f"Document status response: {response}")
        
        # Extract status information
        status_data = {
            "document_id": document_id,
            "status": "unknown"
        }
        
        if isinstance(response, dict):
            status_data.update({
                "status": response.get("status", "unknown"),
                "filename": response.get("metadata", {}).get("filename", "Unknown"),
                "upload_date": response.get("metadata", {}).get("upload_date", "Unknown"),
                "is_processed": response.get("is_processed", False)
            })
        
        return jsonify(status_data)
    except Exception as e:
        logger.error(f"Error getting document status: {str(e)}")
        logger.exception("Full traceback:")
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