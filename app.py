from flask import Flask, request, jsonify
from flask_cors import CORS
import os
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


@app.route("/", methods=["GET"])
def home():
    return "Backend is running with CORS enabled!"


# Route to create a vector store
@app.route("/create-vector-store", methods=["POST"])
def create_vector_store():
    try:
        vector_store = openai.VectorStore.create(name="MyVectorStore")
        return jsonify({"message": "Vector store created!", "id": vector_store.id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Route to upload files and convert to vector store
@app.route("/upload-files", methods=["POST"])
def upload_files():
    try:
        # Extract vector store ID if provided
        vector_store_id = request.form.get("vector_store_id", "vs_R5HLAebBXbIv8MX7bsE9Gjzk")  # Default to provided ID
        files = request.files.getlist("files")

        if not files:
            return jsonify({"error": "No files provided"}), 400

        uploaded_files = []

        # Save files locally
        for file in files:
            filepath = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(filepath)
            uploaded_files.append(filepath)

        # Convert files to vector stores if vector_store_id is provided
        file_streams = [open(file, "rb") for file in uploaded_files]
        file_batch = openai.VectorStoreFileBatch.upload_and_poll(
            vector_store_id=vector_store_id,
            files=file_streams
        )
        return jsonify({"message": "Files uploaded and converted to vector store!", "batch_id": file_batch.id}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Route to query the assistant
@app.route("/query-assistant", methods=["POST"])
def query_assistant():
    try:
        data = request.get_json()
        query = data["query"]
        assistant_id = data.get("assistant_id", "asst_uFDXSPAmDTPShC92EDlwCtBz")  # Default to provided ID

        response = openai.AssistantCompletion.create(
            assistant_id=assistant_id,
            input=query
        )
        return jsonify({"response": response["choices"][0]["message"]["content"]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# WhatsApp webhook for querying the assistant
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
