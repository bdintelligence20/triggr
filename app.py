from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
from dotenv import load_dotenv
import openai
from twilio.rest import Client

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize OpenAI API
openai.api_key = os.getenv("OPENAI_API_KEY")

# Initialize Twilio client
twilio_client = Client(
    os.getenv("TWILIO_ACCOUNT_SID"),
    os.getenv("TWILIO_AUTH_TOKEN")
)

UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "./uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Ensure required environment variables are set
if not openai.api_key:
    raise EnvironmentError("OPENAI_API_KEY is not set in the environment")


@app.route("/", methods=["GET"])
def home():
    return "Backend is running with CORS enabled!"


@app.route("/create-vector-store", methods=["POST"])
def create_vector_store():
    try:
        vector_store = openai.VectorStore.create(name="MyVectorStore")
        return jsonify({"message": "Vector store created!", "id": vector_store.id})
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
            # Step 1: Upload file to OpenAI
            upload_response = requests.post(
                "https://api.openai.com/v1/files",
                headers={
                    "Authorization": f"Bearer {openai.api_key}"
                },
                files={"file": (file.filename, file.stream)},
                data={"purpose": "assistants"}
            )
            if upload_response.status_code != 200:
                return jsonify({"error": f"Failed to upload file: {upload_response.json()}"}), 500

            file_id = upload_response.json()["id"]
            file_ids.append(file_id)

        # Step 2: Attach files to vector store
        for file_id in file_ids:
            attach_response = requests.post(
                f"https://api.openai.com/v1/vector_stores/{vector_store_id}/files",
                headers={
                    "Authorization": f"Bearer {openai.api_key}",
                    "Content-Type": "application/json",
                    "OpenAI-Beta": "assistants=v2"
                },
                json={"file_id": file_id}
            )
            if attach_response.status_code != 200:
                return jsonify({"error": f"Failed to attach file to vector store: {attach_response.json()}"}), 500

        return jsonify({"message": "Files uploaded and attached to vector store successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/query-assistant", methods=["POST"])
def query_assistant():
    try:
        data = request.get_json()
        query = data.get("query")
        assistant_id = data.get("assistant_id", "asst_uFDXSPAmDTPShC92EDlwCtBz")  # Default to provided ID

        response = openai.AssistantCompletion.create(
            assistant_id=assistant_id,
            input=query
        )
        return jsonify({"response": response["choices"][0]["message"]["content"]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/whatsapp", methods=["POST"])
def whatsapp_webhook():
    try:
        from_number = request.form.get("From")
        body = request.form.get("Body")

        # Query the assistant
        assistant_response = query_assistant({
            "query": body,
            "assistant_id": "asst_uFDXSPAmDTPShC92EDlwCtBz"
        })

        # Send the response back to WhatsApp
        twilio_client.messages.create(
            to=from_number,
            from_=os.getenv("TWILIO_WHATSAPP_NUMBER"),
            body=assistant_response.json["response"]
        )
        return "OK", 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    # Bind to 0.0.0.0 and use the PORT environment variable for Render compatibility
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
