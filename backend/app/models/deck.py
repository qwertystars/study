"""Deck model"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Deck(Base):
    """Deck model for organizing flashcards"""

    __tablename__ = "decks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="decks")
    flashcards = relationship("Flashcard", back_populates="deck", cascade="all, delete-orphan")
