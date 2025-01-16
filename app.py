from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
from dotenv import load_dotenv
from twilio.rest import Client

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Twilio client
twilio_client = Client(
    os.getenv("TWILIO_ACCOUNT_SID"),
    os.getenv("TWILIO_AUTH_TOKEN")
)

UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "./uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Ensure required environment variables are set
if not os.getenv("OPENAI_API_KEY"):
    raise EnvironmentError("OPENAI_API_KEY is not set in the environment")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
HEADERS = {
    "Authorization": f"Bearer {OPENAI_API_KEY}",
    "Content-Type": "application/json",
    "OpenAI-Beta": "assistants=v2"
}

@app.route("/", methods=["GET"])
def home():
    return "Backend is running with CORS enabled!"

@app.route("/create-vector-store", methods=["POST"])
def create_vector_store():
    try:
        response = requests.post(
            "https://api.openai.com/v1/vector_stores",
            headers=HEADERS,
            json={"name": "MyVectorStore"}
        )
        if response.status_code != 200:
            return jsonify({"error": response.json()}), response.status_code

        return jsonify({"message": "Vector store created!", "id": response.json()["id"]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/upload-files", methods=["POST"])
def upload_files():
    try:
        vector_store_id = request.form.get("vector_store_id")
        if not vector_store_id:
            return jsonify({"error": "Vector store ID is required"}), 400

        files = request.files.getlist("files")
        if not files:
            return jsonify({"error": "No files provided"}), 400

        file_ids = []
        for file in files:
            upload_response = requests.post(
                "https://api.openai.com/v1/files",
                headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
                files={"file": (file.filename, file.stream)},
                data={"purpose": "assistants"}
            )
            if upload_response.status_code != 200:
                return jsonify({"error": f"Failed to upload file: {upload_response.json()}"}), 500

            file_id = upload_response.json()["id"]
            file_ids.append(file_id)

        for file_id in file_ids:
            attach_response = requests.post(
                f"https://api.openai.com/v1/vector_stores/{vector_store_id}/files",
                headers=HEADERS,
                json={"file_id": file_id}
            )
            if attach_response.status_code != 200:
                return jsonify({"error": f"Failed to attach file to vector store: {attach_response.json()}"}), 500

        return jsonify({"message": "Files uploaded and attached to vector store successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/whatsapp", methods=["POST"])
def whatsapp_webhook():
    try:
        from_number = request.form.get("From")
        body = request.form.get("Body")

        # Step 1: Create a thread
        thread_response = requests.post(
            "https://api.openai.com/v1/threads",
            headers=HEADERS,
            json={}
        )

        if thread_response.status_code != 200:
            return jsonify({"error": f"Failed to create thread: {thread_response.json()}"}), 500

        thread_id = thread_response.json()["id"]

        # Step 2: Add the user's message to the thread
        message_response = requests.post(
            f"https://api.openai.com/v1/threads/{thread_id}/messages",
            headers=HEADERS,
            json={
                "role": "user",
                "content": body
            }
        )

        if message_response.status_code != 200:
            return jsonify({"error": f"Failed to add user message: {message_response.json()}"}), 500

        # Step 3: Run the assistant
        run_response = requests.post(
            f"https://api.openai.com/v1/threads/{thread_id}/runs",
            headers=HEADERS,
            json={
                "assistant_id": "asst_uFDXSPAmDTPShC92EDlwCtBz",
                "tools": [
                    {
                        "type": "file_search",
                        "file_search": {
                            "ranking_options": {
                                "ranker": "default_2024_08_21",
                                "score_threshold": 0.0
                            }
                        }
                    }
                ]
            }
        )

        if run_response.status_code != 200:
            return jsonify({"error": f"Failed to create run: {run_response.json()}"}), 500

        run_id = run_response.json()["id"]
        
        # Step 4: Poll for completion
        import time
        max_attempts = 60  # Maximum number of polling attempts
        attempt = 0
        while attempt < max_attempts:
            run_status_response = requests.get(
                f"https://api.openai.com/v1/threads/{thread_id}/runs/{run_id}",
                headers=HEADERS
            )
            
            if run_status_response.status_code != 200:
                return jsonify({"error": f"Failed to get run status: {run_status_response.json()}"}), 500
                
            run_status = run_status_response.json()["status"]
            
            if run_status == "completed":
                # Get messages after completion
                messages_response = requests.get(
                    f"https://api.openai.com/v1/threads/{thread_id}/messages",
                    headers=HEADERS
                )
                
                if messages_response.status_code != 200:
                    return jsonify({"error": f"Failed to get messages: {messages_response.json()}"}), 500
                    
                # Get the latest assistant message
                for message in messages_response.json()["data"]:
                    if message["role"] == "assistant":
                        assistant_response = message["content"][0]["text"]["value"]
                        # Send the response via WhatsApp
                        twilio_client.messages.create(
                            to=from_number,
                            from_=os.getenv("TWILIO_WHATSAPP_NUMBER"),
                            body=assistant_response
                        )
                        return "OK", 200
                        
            elif run_status in ["failed", "cancelled", "expired"]:
                return jsonify({"error": f"Run {run_status}"}), 500
                
            attempt += 1
            time.sleep(1)  # Wait for 1 second before polling again
            
        return jsonify({"error": "Run timed out"}), 500
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
