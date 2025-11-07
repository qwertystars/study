from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PracticeProblemBase(BaseModel):
    question: str
    solution: str
    difficulty: Optional[str] = "medium"
    topic: Optional[str] = None
    hints: Optional[str] = None


class PracticeProblemCreate(BaseModel):
    subject_id: int
    topic: Optional[str] = None
    difficulty: Optional[str] = "medium"
    num_problems: Optional[int] = 5


class PracticeProblemResponse(PracticeProblemBase):
    id: int
    subject_id: int
    is_solved: bool
    created_at: datetime
    solved_at: Optional[datetime] = None

    class Config:
        from_attributes = True
