from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models.chat_history import ChatHistory
from app.database.connection import engine
from app.database.database import Base

from app.models.user import User
from app.models.document import Document
from app.models.document_chunk import DocumentChunk

from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.documents import router as documents_router
from app.routers.chat import router as chat_router

app = FastAPI(
    title="IntelliDoc AI API",
    version="1.0.0"
)

# Add this block

origins = [
    "http://localhost:5173",
    "https://intelli-doc-ai-bice.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(documents_router)
app.include_router(chat_router)

Base.metadata.create_all(bind=engine)

@app.get("/")
def home():
    return {
        "message": "IntelliDoc AI Backend Running 🚀"
    }