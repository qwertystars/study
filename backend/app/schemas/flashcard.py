"""Flashcard schemas"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class FlashcardCreate(BaseModel):
    """Schema for creating a flashcard"""

    question: str
    answer: str
    deck_id: int


class FlashcardUpdate(BaseModel):
    """Schema for updating a flashcard"""

    question: Optional[str] = None
    answer: Optional[str] = None


class FlashcardResponse(BaseModel):
    """Schema for flashcard response"""

    id: int
    deck_id: int
    question: str
    answer: str
    created_at: datetime
    updated_at: Optional[datetime]
    next_review: Optional[datetime] = None
    interval_days: Optional[float] = None

    class Config:
        from_attributes = True
