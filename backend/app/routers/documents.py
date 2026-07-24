import os
import shutil
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.core.security import get_current_user

from app.models.user import User
from app.models.document import Document
from app.models.document_chunk import DocumentChunk

from app.services.pdf_service import extract_text_from_pdf
from app.services.chunk_service import split_text
from app.services.embedding_service import generate_embedding

router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# ==========================
# Upload PDF
# ==========================
@router.post("/upload")
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Validate file
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    # Generate unique filename
    unique_filename = f"{uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_FOLDER, unique_filename)

    # Save PDF
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract text
    extracted_text = extract_text_from_pdf(file_path)

    if not extracted_text.strip():
        raise HTTPException(
            status_code=400,
            detail="No readable text found in PDF."
        )

    # Save document
    document = Document(
        filename=file.filename,
        filepath=file_path,
        uploaded_by=current_user.id,
        content=extracted_text
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    # Split into chunks
    chunks = split_text(extracted_text)

    # Save chunks with embeddings
    for chunk in chunks:
        embedding = generate_embedding(chunk)

        db_chunk = DocumentChunk(
            document_id=document.id,
            content=chunk,
            embedding=embedding
        )

        db.add(db_chunk)

    db.commit()

    return {
        "message": "Document uploaded successfully",
        "document_id": document.id,
        "filename": document.filename,
        "text_length": len(extracted_text),
        "chunks_created": len(chunks)
    }


# ==========================
# Get Uploaded Documents
# ==========================
@router.get("/")
def get_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    documents = (
        db.query(Document)
        .filter(Document.uploaded_by == current_user.id)
        .order_by(Document.id.desc())
        .all()
    )

    return [
        {
            "id": doc.id,
            "filename": doc.filename,
            "filepath": doc.filepath
        }
        for doc in documents
    ]


# ==========================
# Get Single Document
# ==========================
@router.get("/{document_id}")
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

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
            detail="Document not found"
        )

    return {
        "id": document.id,
        "filename": document.filename,
        "content": document.content
    }


# ==========================
# Delete Document
# ==========================
@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

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
            detail="Document not found"
        )

    # Delete chunk records
    db.query(DocumentChunk).filter(
        DocumentChunk.document_id == document.id
    ).delete()

    # Delete PDF from disk
    if document.filepath and os.path.exists(document.filepath):
        os.remove(document.filepath)

    # Delete document record
    db.delete(document)
    db.commit()

    return {
        "message": "Document deleted successfully"
    }