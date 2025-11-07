from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ...database import get_db
from ...models.quiz import Quiz, QuizQuestion
from ...models.subject import Subject
from ...models.progress import Progress
from ...schemas.quiz import QuizCreate, QuizResponse, QuizSubmitRequest
from ...services.ai_service import ai_service

router = APIRouter()


@router.get("/", response_model=List[QuizResponse])
def get_quizzes(subject_id: int = None, db: Session = Depends(get_db)):
    """Get all quizzes, optionally filtered by subject"""
    query = db.query(Quiz)
    if subject_id:
        query = query.filter(Quiz.subject_id == subject_id)
    quizzes = query.all()
    return quizzes


@router.get("/{quiz_id}", response_model=QuizResponse)
def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    """Get a specific quiz with questions"""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz


@router.post("/generate", response_model=QuizResponse)
def generate_quiz(quiz_data: QuizCreate, db: Session = Depends(get_db)):
    """Generate a quiz using AI"""
    subject = db.query(Subject).filter(Subject.id == quiz_data.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    # Generate quiz questions using AI
    num_questions = quiz_data.num_questions or 10
    generated_questions = ai_service.generate_quiz_questions(
        subject.name,
        subject.description or "general topics",
        quiz_data.difficulty,
        num_questions
    )

    if not generated_questions:
        raise HTTPException(status_code=500, detail="Failed to generate quiz questions")

    # Create quiz
    db_quiz = Quiz(
        subject_id=quiz_data.subject_id,
        title=quiz_data.title,
        difficulty=quiz_data.difficulty,
        total_questions=len(generated_questions)
    )
    db.add(db_quiz)
    db.commit()
    db.refresh(db_quiz)

    # Create quiz questions
    for q in generated_questions:
        db_question = QuizQuestion(
            quiz_id=db_quiz.id,
            question=q.get("question", ""),
            options=q.get("options", []),
            correct_answer=q.get("correct_answer", "A"),
            explanation=q.get("explanation", "")
        )
        db.add(db_question)

    db.commit()
    db.refresh(db_quiz)
    return db_quiz


@router.post("/{quiz_id}/submit", response_model=QuizResponse)
def submit_quiz(
    quiz_id: int,
    submission: QuizSubmitRequest,
    db: Session = Depends(get_db)
):
    """Submit quiz answers and calculate score"""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    if quiz.completed_at:
        raise HTTPException(status_code=400, detail="Quiz already submitted")

    # Update questions with user answers and check correctness
    correct_count = 0
    for question in quiz.questions:
        user_answer = submission.answers.get(question.id)
        if user_answer:
            question.user_answer = user_answer
            question.is_correct = 1 if user_answer == question.correct_answer else 0
            if question.is_correct:
                correct_count += 1

    # Calculate score
    quiz.score = (correct_count / quiz.total_questions) * 100 if quiz.total_questions > 0 else 0
    quiz.completed_at = datetime.now()

    # Update progress
    progress = db.query(Progress).filter(Progress.subject_id == quiz.subject_id).first()
    if progress:
        progress.quizzes_completed += 1
        progress.last_studied = datetime.now()

        # Update average quiz score
        total_score = progress.average_quiz_score * (progress.quizzes_completed - 1) + quiz.score
        progress.average_quiz_score = total_score / progress.quizzes_completed

        # Update mastery level based on quiz performance
        progress.mastery_level = min(100, progress.average_quiz_score * 0.8 + progress.problems_solved * 0.2)

    db.commit()
    db.refresh(quiz)
    return quiz


@router.delete("/{quiz_id}")
def delete_quiz(quiz_id: int, db: Session = Depends(get_db)):
    """Delete a quiz"""
    db_quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not db_quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    db.delete(db_quiz)
    db.commit()
    return {"message": "Quiz deleted successfully"}
