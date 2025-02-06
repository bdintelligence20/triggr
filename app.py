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

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# API Configuration
class APIConfig:
    # R2R (Documents API)
    R2R_API_KEY = os.getenv("R2R_API_KEY")
    R2R_BASE_URL = "https://api.sciphi.ai/v3"

    @classmethod
    def r2r_headers(cls):
        return {
            "X-API-Key": cls.R2R_API_KEY,
            "Content-Type": "application/json"
        }

class DocumentProcessor:
    @staticmethod
    async def get_embedding(text: str) -> list:
        """Get embedding for a text using R2R API"""
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.post(
                f"{APIConfig.R2R_BASE_URL}/documents/embeddings",
                headers=APIConfig.r2r_headers(),
                json={"input": text}
            )
            response_json = response.json()
            if "data" not in response_json:
                logger.error(f"Unexpected response from embeddings API: {response_json}")
                raise Exception(f"Embeddings API did not return data: {response_json}")
            return response_json['data'][0]['embedding']

    @staticmethod
    async def process_query(query_text: str) -> str:
        """Process a query using R2R chat completions"""
        try:
            # Get embedding for context retrieval
            embedding = await DocumentProcessor.get_embedding(query_text)
            
            # Use R2R's document search endpoint
            async with httpx.AsyncClient(verify=False) as client:
                search_response = await client.post(
                    f"{APIConfig.R2R_BASE_URL}/documents/search",
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
                response = await client.post(
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

@app.route("/documents", methods=["GET"])
async def get_documents():
    """Get list of all documents from R2R"""
    try:
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.get(
                f"{APIConfig.R2R_BASE_URL}/documents",
                headers=APIConfig.r2r_headers()
            )
            return jsonify(response.json())
    except Exception as e:
        logger.error(f"Error getting documents: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/upload", methods=["POST"])
async def upload_document():
    """Handle document uploads to R2R"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files['file']
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
                async with httpx.AsyncClient(verify=False) as client:
                    response = await client.post(
                        f"{APIConfig.R2R_BASE_URL}/documents",
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
                    return jsonify({
                        "message": "Document uploaded successfully",
                        "document": doc_data
                    })

            finally:
                if temp_path and os.path.exists(temp_path):
                    os.remove(temp_path)

        return jsonify({"error": "Invalid file type"}), 400

    except Exception as e:
        logger.error(f"Error uploading document: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/query", methods=["POST"])
async def query_documents():
    """Query documents using R2R"""
    try:
        data = request.json
        if not data or 'query' not in data:
            return jsonify({"error": "No query provided"}), 400

        response = await DocumentProcessor.process_query(data['query'])
        return jsonify({"response": response})

    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/documents/<document_id>", methods=["DELETE"])
async def delete_document(document_id):
    """Delete a document from R2R"""
    try:
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.delete(
                f"{APIConfig.R2R_BASE_URL}/documents/{document_id}",
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