from sqlalchemy.orm import Session
from pgvector.sqlalchemy import Vector
from sqlalchemy import text

from app.models.document import Document


def search_similar_chunks(
    db: Session,
    embedding: list[float],
    document_id: int,
    top_k: int = 5,
):
    query = text("""
        SELECT
            id,
            chunk_text,
            page_number,
            embedding <=> CAST(:embedding AS vector) AS distance
        FROM document_chunks
        WHERE document_id = :document_id
        ORDER BY embedding <=> CAST(:embedding AS vector)
        LIMIT :top_k
    """)

    result = db.execute(
        query,
        {
            "embedding": embedding,
            "document_id": document_id,
            "top_k": top_k,
        },
    )

    return result.fetchall()