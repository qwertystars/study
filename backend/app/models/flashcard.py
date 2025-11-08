"""Flashcard model"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Flashcard(Base):
    """Flashcard model for storing Q&A pairs"""

    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True)
    deck_id = Column(Integer, ForeignKey("decks.id"), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    deck = relationship("Deck", back_populates="flashcards")
    reviews = relationship("Review", back_populates="flashcard", cascade="all, delete-orphan")
