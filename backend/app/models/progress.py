from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Progress(Base):
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, unique=True)
    mastery_level = Column(Float, default=0.0)  # 0-100
    total_study_time = Column(Integer, default=0)  # in minutes
    flashcards_reviewed = Column(Integer, default=0)
    quizzes_completed = Column(Integer, default=0)
    problems_solved = Column(Integer, default=0)
    average_quiz_score = Column(Float, default=0.0)
    last_studied = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    subject = relationship("Subject", back_populates="progress")
