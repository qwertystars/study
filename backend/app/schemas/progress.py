from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProgressResponse(BaseModel):
    id: int
    subject_id: int
    mastery_level: float
    total_study_time: int
    flashcards_reviewed: int
    quizzes_completed: int
    problems_solved: int
    average_quiz_score: float
    last_studied: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
