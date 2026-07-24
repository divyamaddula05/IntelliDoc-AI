from sqlalchemy import Column, Integer, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database.database import Base


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)

    document_id = Column(
        Integer,
        ForeignKey("documents.id"),
        nullable=False
    )

    content = Column(Text, nullable=False)

    # Store Gemini embeddings as a JSON array
    embedding = Column(JSON, nullable=True)

    document = relationship(
        "Document",
        back_populates="chunks"
    )