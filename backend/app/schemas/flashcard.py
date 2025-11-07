from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class FlashcardBase(BaseModel):
    question: str
    answer: str
    difficulty: Optional[str] = "medium"
    topic: Optional[str] = None


class FlashcardCreate(FlashcardBase):
    subject_id: int


class FlashcardUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    difficulty: Optional[str] = None
    topic: Optional[str] = None


class FlashcardReviewRequest(BaseModel):
    quality: int  # 0-5 rating for spaced repetition


class FlashcardResponse(FlashcardBase):
    id: int
    subject_id: int
    ease_factor: float
    interval: int
    repetitions: int
    next_review: datetime
    created_at: datetime
    last_reviewed: Optional[datetime] = None

    class Config:
        from_attributes = True
