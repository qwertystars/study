"""Review schemas"""
from pydantic import BaseModel
from datetime import datetime


class ReviewCreate(BaseModel):
    """Schema for creating a review"""

    flashcard_id: int
    remembered: bool


class ReviewResponse(BaseModel):
    """Schema for review response"""

    id: int
    flashcard_id: int
    user_id: int
    remembered: bool
    interval_days: float
    next_review: datetime
    reviewed_at: datetime

    class Config:
        from_attributes = True
