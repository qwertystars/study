from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime


class QuizQuestionBase(BaseModel):
    question: str
    options: List[str]
    correct_answer: str
    explanation: Optional[str] = None


class QuizQuestionResponse(QuizQuestionBase):
    id: int
    user_answer: Optional[str] = None
    is_correct: Optional[int] = None

    class Config:
        from_attributes = True


class QuizCreate(BaseModel):
    subject_id: int
    title: str
    difficulty: Optional[str] = "medium"
    num_questions: Optional[int] = 10


class QuizSubmitRequest(BaseModel):
    answers: Dict[int, str]  # question_id: answer


class QuizResponse(BaseModel):
    id: int
    subject_id: int
    title: str
    difficulty: str
    score: float
    total_questions: int
    completed_at: Optional[datetime] = None
    created_at: datetime
    questions: List[QuizQuestionResponse] = []

    class Config:
        from_attributes = True
