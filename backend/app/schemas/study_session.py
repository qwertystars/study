from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class StudySessionCreate(BaseModel):
    subject_id: int
    duration: int  # in minutes
    topics_covered: Optional[str] = None
    notes: Optional[str] = None


class StudySessionResponse(StudySessionCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
