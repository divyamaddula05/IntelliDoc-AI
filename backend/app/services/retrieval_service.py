import math
from app.services.embedding_service import generate_embedding


def cosine_similarity(vec1, vec2):
    dot = sum(a * b for a, b in zip(vec1, vec2))

    norm1 = math.sqrt(sum(a * a for a in vec1))
    norm2 = math.sqrt(sum(b * b for b in vec2))

    if norm1 == 0 or norm2 == 0:
        return 0

    return dot / (norm1 * norm2)


def retrieve_top_chunks(question, chunks, top_k=5):
    """
    question -> user's question
    chunks -> list of DocumentChunk objects
    """

    question_embedding = generate_embedding(question)

    scored_chunks = []

    for chunk in chunks:
        score = cosine_similarity(
            question_embedding,
            chunk.embedding
        )

        scored_chunks.append(
            (score, chunk)
        )

    scored_chunks.sort(
        reverse=True,
        key=lambda x: x[0]
    )

    return [chunk for score, chunk in scored_chunks[:top_k]]