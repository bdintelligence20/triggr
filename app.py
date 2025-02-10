from flask import Flask, request, jsonify
from flask_cors import CORS
import httpx
import hashlib
import os
from datetime import datetime
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

    # Load environment variables
load_dotenv()

# Validate API key format
api_key = os.getenv("R2R_API_KEY")
if not api_key:
    raise ValueError("R2R_API_KEY environment variable is not set")
if '.' in api_key:
    secret_key = api_key.split('.')[1]
    if not secret_key.startswith('sk_'):
        raise ValueError("Invalid API key format: secret key portion should start with 'sk_'")
else:
    if not api_key.startswith('sk_'):
        raise ValueError("Invalid API key format: should start with 'sk_'")

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# API Configuration
class APIConfig:
    # R2R (Documents API)
    R2R_API_KEY = os.getenv("R2R_API_KEY")
    R2R_BASE_URL = "https://api.sciphi.ai"

    @classmethod
    def r2r_headers(cls):
        # Use the full API key in both headers to cover all bases
        return {
            "Authorization": f"Bearer {cls.R2R_API_KEY}",
            "X-API-Key": cls.R2R_API_KEY,
            "Accept": "application/json",
            "Content-Type": "application/json"
        }

class DocumentProcessor:
    @staticmethod
    def get_embedding(text: str) -> list:
        """Get embedding for a text using R2R API"""
        with httpx.Client(verify=False) as client:
            response = client.post(
                f"{APIConfig.R2R_BASE_URL}/v1/embeddings",
                headers=APIConfig.r2r_headers(),
                json={"input": text}
            )
            response_json = response.json()
            if "data" not in response_json:
                logger.error(f"Unexpected response from embeddings API: {response_json}")
                raise Exception(f"Embeddings API did not return data: {response_json}")
            return response_json['data'][0]['embedding']

    @staticmethod
    def process_query(query_text: str) -> str:
        """Process a query using R2R chat completions"""
        try:
            # Get embedding for context retrieval
            embedding = DocumentProcessor.get_embedding(query_text)
            
            with httpx.Client(verify=False, timeout=30.0) as client:
                # Use R2R's document search endpoint
                search_response = client.post(
                    f"{APIConfig.R2R_BASE_URL}/v1/search",
                    headers=APIConfig.r2r_headers(),
                    json={
                        "query": query_text,
                        "embedding": embedding,
                        "top_k": 5
                    }
                )
                search_results = search_response.json()
                
                # Extract context from search results
                context = " ".join([result['text'] for result in search_results.get('data', [])])
                
                # Generate response using chat completions
                response = client.post(
                    f"{APIConfig.R2R_BASE_URL}/chat/completions",
                    headers=APIConfig.r2r_headers(),
                    json={
                        "messages": [
                            {"role": "system", "content": f"Use this context to help answer: {context}"},
                            {"role": "user", "content": query_text}
                        ]
                    }
                )
                return response.json()['choices'][0]['message']['content']

        except Exception as e:
            logger.error(f"Error processing query: {str(e)}")
            raise

# Create upload folder
UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "./uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Check if file type is allowed"""
    ALLOWED_EXTENSIONS = {'txt', 'pdf', 'doc', 'docx', 'csv'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/", methods=["GET"])
def root():
    """Root endpoint"""
    return jsonify({
        "status": "ok",
        "message": "R2R API Service is running",
        "api_key_configured": bool(APIConfig.R2R_API_KEY),
        "api_url": APIConfig.R2R_BASE_URL
    })

@app.route("/test-connection", methods=["GET"])
def test_connection():
    """Test R2R API connection"""
    try:
        logger.info(f"Testing connection to R2R API at {APIConfig.R2R_BASE_URL}")
        logger.info(f"Using org ID: {APIConfig.ORG_ID}")
        
        headers = APIConfig.r2r_headers()
        debug_headers = headers.copy()
        if 'X-API-Key' in debug_headers:
            debug_headers['X-API-Key'] = 'REDACTED'
        if 'Authorization' in debug_headers:
            debug_headers['Authorization'] = 'REDACTED'
        logger.info(f"Using headers: {debug_headers}")
        
        with httpx.Client(verify=False) as client:
            response = client.get(
                f"{APIConfig.R2R_BASE_URL}/health",
                headers=headers
            )
            
            logger.info(f"Response status: {response.status_code}")
            logger.info(f"Response headers: {dict(response.headers)}")
            logger.info(f"Response content: {response.text}")
            
            return jsonify({
                "status": "success" if response.status_code == 200 else "error",
                "api_url": APIConfig.R2R_BASE_URL,
                "org_id": APIConfig.ORG_ID,
                "response_code": response.status_code,
                "response_text": response.text
            })
            
    except Exception as e:
        logger.error(f"Connection test failed: {str(e)}")
        return jsonify({
            "status": "error",
            "error": str(e),
            "api_url": APIConfig.R2R_BASE_URL,
            "org_id": APIConfig.ORG_ID
        }), 500

@app.route("/files", methods=["GET"])
def get_files():
    """Get list of all documents from R2R"""
    try:
        # Log headers for debugging (excluding API key)
        debug_headers = APIConfig.r2r_headers().copy()
        debug_headers["X-API-Key"] = "REDACTED"
        logger.info(f"Making request to R2R API with headers: {debug_headers}")
        
        with httpx.Client(verify=False) as client:
            response = client.get(
                f"{APIConfig.R2R_BASE_URL}/v1/documents",
                headers=APIConfig.r2r_headers()
            )
            
            # Log response status, headers, and content
            logger.info(f"R2R API Response Status: {response.status_code}")
            logger.info(f"R2R API Response Headers: {dict(response.headers)}")
            logger.info(f"R2R API Response Content: {response.text}")
            
            if response.status_code == 403:
                logger.error("Authentication failed with R2R API")
                return jsonify({
                    "error": "Authentication failed",
                    "message": "Please check your R2R API key"
                }), 403
                
            response.raise_for_status()  # Raise error for other non-200 responses
            return jsonify(response.json())
            
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error occurred: {str(e)}")
        return jsonify({
            "error": "API Error",
            "message": str(e),
            "status_code": e.response.status_code
        }), e.response.status_code
    except Exception as e:
        logger.error(f"Error getting documents: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/upload-files", methods=["POST"])
def upload_files():
    """Handle document uploads to R2R"""
    try:
        if 'files' not in request.files:
            return jsonify({"error": "No files provided"}), 400

        files = request.files.getlist('files')
        results = []

        for file in files:
            if file and allowed_file(file.filename):
                temp_path = None
                try:
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

                    # Upload to R2R
                    with httpx.Client(verify=False) as client:
                        # Log request details (excluding sensitive data)
                        debug_headers = APIConfig.r2r_headers().copy()
                        if 'Authorization' in debug_headers:
                            debug_headers['Authorization'] = 'REDACTED'
                        logger.info(f"Making upload request to: {APIConfig.R2R_BASE_URL}/documents")
                        logger.info(f"Headers: {debug_headers}")
                        logger.info(f"Payload size: {len(content)} bytes")
                        
                        response = client.post(
                            f"{APIConfig.R2R_BASE_URL}/v1/documents",
                            headers=APIConfig.r2r_headers(),
                            json={
                                "content": content,
                                "metadata": {
                                    "filename": file.filename,
                                    "upload_date": datetime.utcnow().isoformat()
                                }
                            }
                        )
                        
                        if response.status_code != 200:
                            raise Exception(f"Document upload failed: {response.text}")
                        
                        doc_data = response.json()
                        results.append({
                            "name": file.filename,
                            "status": "success",
                            "document": doc_data
                        })

                finally:
                    if temp_path and os.path.exists(temp_path):
                        os.remove(temp_path)
            else:
                results.append({
                    "name": file.filename if file else "Unknown",
                    "status": "error",
                    "error": "Invalid file type"
                })

        return jsonify({"message": "Files processed", "files": results})

    except Exception as e:
        logger.error(f"Error uploading files: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/query", methods=["POST"])
def query_documents():
    """Query documents using R2R"""
    try:
        data = request.json
        if not data or 'query' not in data:
            return jsonify({"error": "No query provided"}), 400

        response = DocumentProcessor.process_query(data['query'])
        return jsonify({"response": response})

    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/documents/<document_id>", methods=["DELETE"])
def delete_document(document_id):
    """Delete a document from R2R"""
    try:
        with httpx.Client(verify=False) as client:
            response = client.delete(
                f"{APIConfig.R2R_BASE_URL}/v1/documents/{document_id}",
                headers=APIConfig.r2r_headers()
            )
            if response.status_code == 204:
                return jsonify({"message": "Document deleted successfully"})
            return jsonify({"error": "Failed to delete document"}), response.status_code
    except Exception as e:
        logger.error(f"Error deleting document: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))