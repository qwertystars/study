"""Review model for spaced repetition"""
from sqlalchemy import Column, Integer, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Review(Base):
    """Review model for tracking spaced repetition"""

    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    flashcard_id = Column(Integer, ForeignKey("flashcards.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Spaced repetition fields
    remembered = Column(Boolean, nullable=False)
    interval_days = Column(Float, default=1.0)  # Days until next review
    next_review = Column(DateTime(timezone=True), nullable=False)

    reviewed_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    flashcard = relationship("Flashcard", back_populates="reviews")
