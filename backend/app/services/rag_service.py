import os

from google import genai

from app.services.embedding_service import generate_embedding
from app.services.vector_store import search_similar_chunks

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def answer_question(db, document_id: int, question: str):

    # Generate embedding for the user's question
    question_embedding = generate_embedding(question)

    # Retrieve relevant chunks
    chunks = search_similar_chunks(
        db=db,
        embedding=question_embedding,
        document_id=document_id,
        top_k=5,
    )

    context = "\n\n".join(chunk.chunk_text for chunk in chunks)

    prompt = f"""
You are an AI assistant.

Answer ONLY using the provided context.

If the answer is not available in the context, reply:

"I couldn't find that information in the uploaded document."

Context:
{context}

Question:
{question}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    return {
        "answer": response.text,
        "sources": [
            {
                "page": chunk.page_number,
                "chunk_id": chunk.id,
            }
            for chunk in chunks
        ],
    }