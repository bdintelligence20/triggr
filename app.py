from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from datetime import datetime
from google.cloud import storage
import json
from google.oauth2 import service_account

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

def get_storage_client():
    """Initialize Google Cloud Storage client"""
    try:
        credentials_json = os.environ.get('GOOGLE_CLOUD_CREDENTIALS')
        if not credentials_json:
            raise ValueError("GOOGLE_CLOUD_CREDENTIALS environment variable not set")
        
        credentials_dict = json.loads(credentials_json)
        credentials = service_account.Credentials.from_service_account_info(credentials_dict)
        return storage.Client(credentials=credentials)
    except Exception as e:
        logger.error(f"Error initializing storage client: {e}")
        raise

class StorageManager:
    """Handles Google Cloud Storage operations"""
    def __init__(self):
        self.storage_client = get_storage_client()
        self.bucket_name = os.environ.get('BUCKET_NAME', 'testtriggr')
        self.bucket = self.storage_client.bucket(self.bucket_name)

    def upload_file(self, file):
        """Upload a single file to GCS"""
        try:
            # Create a unique blob name using timestamp
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            safe_filename = file.filename.replace(' ', '_')
            blob_name = f'uploads/{timestamp}_{safe_filename}'
            
            # Create blob and upload
            blob = self.bucket.blob(blob_name)
            blob.upload_from_string(
                file.read(),
                content_type=file.content_type
            )
            
            # Make the blob publicly readable
            blob.make_public()

            return {
                "status": "success",
                "filename": file.filename,
                "url": blob.public_url,
                "size": blob.size,
                "contentType": blob.content_type,
                "uploaded_at": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Error uploading file {file.filename}: {str(e)}")
            logger.exception("Full traceback:")
            return {
                "status": "error",
                "filename": file.filename,
                "error": str(e)
            }

    def list_files(self):
        """List all files in the bucket"""
        try:
            blobs = self.bucket.list_blobs(prefix='uploads/')
            files = []
            
            for blob in blobs:
                # Skip if it's the directory itself
                if blob.name.endswith('/'):
                    continue
                    
                files.append({
                    "id": blob.id,
                    "name": blob.name.split('/')[-1],
                    "type": "file",
                    "size": f"{blob.size / 1024 / 1024:.2f} MB",
                    "owner": "You",
                    "lastModified": blob.updated.isoformat(),
                    "url": blob.public_url
                })
            
            return files
        except Exception as e:
            logger.error(f"Error listing files: {str(e)}")
            logger.exception("Full traceback:")
            raise

# Initialize storage manager
storage_manager = StorageManager()

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    try:
        # Test GCS connection by listing files
        storage_manager.list_files()
        return jsonify({
            "status": "healthy",
            "storage_connection": "connected",
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
        "message": "File Storage Service is running"
    })

@app.route("/files", methods=["GET"])
def get_files():
    """Get list of all files"""
    try:
        files = storage_manager.list_files()
        return jsonify({
            "status": "success",
            "files": files
        })
    except Exception as e:
        logger.error(f"Error getting files: {str(e)}")
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

        for file in files:
            if file.filename:
                result = storage_manager.upload_file(file)
                results.append(result)

        successful_uploads = [r for r in results if r['status'] == 'success']
        failed_uploads = [r for r in results if r['status'] == 'error']

        return jsonify({
            "status": "success" if len(failed_uploads) == 0 else "partial_success",
            "message": f"Uploaded {len(successful_uploads)} files successfully" + 
                      (f", {len(failed_uploads)} failed" if failed_uploads else ""),
            "files": results
        })

    except Exception as e:
        logger.error(f"Error uploading files: {str(e)}")
        logger.exception("Full traceback:")
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

@app.route("/files/<path:filename>", methods=["DELETE"])
def delete_file(filename):
    """Delete a file"""
    try:
        blob = storage_manager.bucket.blob(f'uploads/{filename}')
        blob.delete()
        return jsonify({
            "status": "success",
            "message": f"File {filename} deleted successfully"
        })
    except Exception as e:
        logger.error(f"Error deleting file: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))