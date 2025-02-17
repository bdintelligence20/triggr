from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

def create_app():
    app = FastAPI()
    
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    @app.get("/")
    async def root():
        return {"message": "Hello World"}
    
    return app

# main.py
import uvicorn
from app import create_app

app = create_app()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)