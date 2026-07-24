from app.services.embedding_service import generate_embedding

embedding = generate_embedding(
    "Artificial Intelligence is transforming industries."
)

print(type(embedding))
print(len(embedding))
print(embedding[:10])