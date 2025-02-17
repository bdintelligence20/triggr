from datetime import datetime
from ..core.logger import logger
from ..core.config import Config

class StorageManager:
    """Handles Google Cloud Storage operations"""
    def __init__(self):
        self.storage_client = Config.get_storage_client()
        self.bucket_name = Config.BUCKET_NAME
        self.bucket = self.storage_client.bucket(self.bucket_name)

    def upload_file(self, file):
        """Upload a single file to GCS"""
        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            safe_filename = file.filename.replace(' ', '_')
            blob_name = f'uploads/{timestamp}_{safe_filename}'
            
            blob = self.bucket.blob(blob_name)
            blob.upload_from_string(
                file.read(),
                content_type=file.content_type
            )
            
            public_url = f"https://storage.googleapis.com/{self.bucket_name}/{blob_name}"

            return {
                "status": "success",
                "filename": file.filename,
                "url": public_url,
                "size": blob.size,
                "contentType": blob.content_type,
                "uploaded_at": datetime.utcnow().isoformat(),
                "path": blob_name
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
                if blob.name.endswith('/'):
                    continue
                    
                files.append({
                    "id": blob.id,
                    "name": blob.name.split('/')[-1],
                    "path": blob.name,
                    "type": "file",
                    "size": f"{blob.size / 1024 / 1024:.2f} MB",
                    "owner": "You",
                    "lastModified": blob.updated.isoformat(),
                    "url": f"https://storage.googleapis.com/{self.bucket_name}/{blob.name}"
                })
            
            return files
        except Exception as e:
            logger.error(f"Error listing files: {str(e)}")
            logger.exception("Full traceback:")
            raise

    def delete_file(self, file_path):
        """Delete a file from the bucket"""
        try:
            blob = self.bucket.blob(file_path)
            blob.delete()
            return True
        except Exception as e:
            logger.error(f"Error deleting file {file_path}: {str(e)}")
            logger.exception("Full traceback:")
            return False