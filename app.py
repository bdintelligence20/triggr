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

        # Step 1: Create a new thread
        thread_response = requests.post(
            "https://api.openai.com/v1/threads",
            headers=HEADERS,
            json={}  # Create thread without unnecessary parameters
        )

        if thread_response.status_code != 200:
            error_message = thread_response.json().get("error", {}).get("message", "Unknown error during thread creation")
            return jsonify({"error": f"Failed to create thread: {error_message}"}), 500

        thread_id = thread_response.json()["id"]

        # Step 2: Send the user's message
        message_response = requests.post(
            f"https://api.openai.com/v1/threads/{thread_id}/messages",
            headers=HEADERS,
            json={"role": "user", "content": body}
        )

        if message_response.status_code != 200:
            error_message = message_response.json().get("error", {}).get("message", "Unknown error during message creation")
            return jsonify({"error": f"Failed to send message to assistant: {error_message}"}), 500

        # Step 3: Run the assistant for this thread
        run_response = requests.post(
            f"https://api.openai.com/v1/threads/{thread_id}/runs",
            headers=HEADERS,
            json={"assistant_id": "asst_uFDXSPAmDTPShC92EDlwCtBz"}
        )

        if run_response.status_code != 200:
            error_message = run_response.json().get("error", {}).get("message", "Unknown error during assistant run")
            return jsonify({"error": f"Failed to get assistant response: {error_message}"}), 500

        assistant_message = run_response.json()["results"]["messages"][-1]["content"]

        # Step 4: Send the assistant's response back to WhatsApp
        twilio_client.messages.create(
            to=from_number,
            from_=os.getenv("TWILIO_WHATSAPP_NUMBER"),
            body=assistant_message
        )

        return "OK", 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
