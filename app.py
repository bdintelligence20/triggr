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
            json={}
        )
        thread_response.raise_for_status()
        thread_id = thread_response.json()["id"]

        # Step 2: Send user's message to the thread
        message_response = requests.post(
            f"https://api.openai.com/v1/threads/{thread_id}/messages",
            headers=HEADERS,
            json={"role": "user", "content": body}
        )
        message_response.raise_for_status()

        # Step 3: Run the assistant
        run_payload = {
            "assistant_id": "asst_uFDXSPAmDTPShC92EDlwCtBz",
            "tools": [
                {
                    "type": "file_search",
                    "file_search": {
                        "vector_store_id": "vs_R5HLAebBXbIv8MX7bsE9Gjzk",
                        "ranking_options": {
                            "ranker": "default_2024_08_21",
                            "score_threshold": 0.0
                        }
                    }
                }
            ]
        }

        run_response = requests.post(
            f"https://api.openai.com/v1/threads/{thread_id}/runs",
            headers=HEADERS,
            json=run_payload
        )
        if run_response.status_code != 200:
            # Log the response for debugging
            print("Run Response:", run_response.json())
            return jsonify({"error": f"Failed to create run: {run_response.json()}"}), 500


        # Step 4: Poll for the run results
        poll_interval = 2
        max_attempts = 10
        attempts = 0
        while attempts < max_attempts:
            time.sleep(poll_interval)
            run_status_response = requests.get(
                f"https://api.openai.com/v1/threads/{thread_id}/runs/{run_id}",
                headers=HEADERS
            )
            run_status_response.raise_for_status()
            run_status = run_status_response.json()["status"]

            if run_status == "completed":
                break
            elif run_status == "failed":
                return jsonify({"error": "Assistant run failed"}), 500

            attempts += 1

        if run_status != "completed":
            return jsonify({"error": "Assistant run timed out"}), 500

        assistant_response_content = run_status_response.json()["results"]["messages"][-1]["content"]

        # Step 5: Send the assistant's response back via WhatsApp
        twilio_client.messages.create(
            to=from_number,
            from_=os.getenv("TWILIO_WHATSAPP_NUMBER"),
            body=assistant_response_content
        )

        return "OK", 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
