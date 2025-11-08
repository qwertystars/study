from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class PracticeProblem(Base):
    __tablename__ = "practice_problems"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    question = Column(Text, nullable=False)
    solution = Column(Text, nullable=False)
    difficulty = Column(String, default="medium")  # easy, medium, hard
    topic = Column(String, nullable=True)
    hints = Column(Text, nullable=True)
    is_solved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    solved_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    subject = relationship("Subject", back_populates="practice_problems")
