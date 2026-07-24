from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.core.security import get_current_user

from app.models.user import User
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.models.chat_history import ChatHistory

from app.schemas.chat import ChatRequest, ChatResponse

from app.services.retrieval_service import retrieve_top_chunks
from app.services.chat_service import ask_gemini


router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)


@router.get("/history/{document_id}")
def get_chat_history(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Return all chat history for a document belonging to the current user.
    """

    document = (
        db.query(Document)
        .filter(
            Document.id == document_id,
            Document.uploaded_by == current_user.id
        )
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )

    chats = (
        db.query(ChatHistory)
        .filter(
            ChatHistory.user_id == current_user.id,
            ChatHistory.document_id == document_id
        )
        .order_by(ChatHistory.created_at.asc())
        .all()
    )

    return chats


@router.post("/", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Chat with an uploaded document using RAG + Gemini.
    """

    # Check document ownership
    document = (
        db.query(Document)
        .filter(
            Document.id == request.document_id,
            Document.uploaded_by == current_user.id
        )
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )

    # Fetch document chunks
    chunks = (
        db.query(DocumentChunk)
        .filter(
            DocumentChunk.document_id == request.document_id
        )
        .all()
    )

    if not chunks:
        raise HTTPException(
            status_code=404,
            detail="No chunks found for this document."
        )

    # Retrieve most relevant chunks
    top_chunks = retrieve_top_chunks(
        request.question,
        chunks,
        top_k=5
    )

    # Build context
    context = "\n\n".join(
        chunk.content for chunk in top_chunks
    )

    # Debug (optional)
    print("=" * 60)
    print("Question:", request.question)
    print("Chunks:", len(chunks))
    print("Retrieved:", len(top_chunks))

    for i, chunk in enumerate(top_chunks, start=1):
        print(f"\nChunk {i}")
        print(chunk.content[:300])

    print("=" * 60)

    # Generate AI answer
    answer = ask_gemini(
        question=request.question,
        context=context
    )

    # Save chat history
    history = ChatHistory(
        user_id=current_user.id,
        document_id=request.document_id,
        question=request.question,
        answer=answer
    )

    db.add(history)
    db.commit()

    return ChatResponse(
        answer=answer
    )