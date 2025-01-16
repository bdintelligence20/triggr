from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
import openai
from twilio.rest import Client

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Initialize OpenAI API
openai.api_key = os.getenv("OPENAI_API_KEY")

# Initialize Twilio client
twilio_client = Client(
    os.getenv("TWILIO_ACCOUNT_SID"),
    os.getenv("TWILIO_AUTH_TOKEN")
)

@app.route("/", methods=["GET"])
def home():
    return "Backend is running!"

# Route to create a vector store
@app.route("/create-vector-store", methods=["POST"])
def create_vector_store():
    try:
        vector_store = openai.VectorStore.create(name="MyVectorStore")
        return jsonify({"message": "Vector store created!", "id": vector_store.id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to upload files to the vector store
@app.route("/upload-files", methods=["POST"])
def upload_files():
    try:
        vector_store_id = request.form.get("vector_store_id")
        files = request.files.getlist("files")
        
        file_streams = [file.stream for file in files]
        file_batch = openai.VectorStoreFileBatch.upload_and_poll(
            vector_store_id=vector_store_id,
            files=file_streams
        )
        return jsonify({"message": "Files uploaded successfully!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to query the assistant
@app.route("/query-assistant", methods=["POST"])
def query_assistant():
    try:
        data = request.get_json()
        query = data["query"]
        assistant_id = data["assistant_id"]

        response = openai.AssistantCompletion.create(
            assistant_id=assistant_id,
            input=query
        )
        return jsonify({"response": response["choices"][0]["message"]["content"]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Twilio webhook for WhatsApp integration
@app.route("/whatsapp", methods=["POST"])
def whatsapp_webhook():
    try:
        from_number = request.form.get("From")
        body = request.form.get("Body")
        
        # Query the assistant
        assistant_response = query_assistant({
            "query": body,
            "assistant_id": "your_assistant_id"
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
    app.run(debug=True)
