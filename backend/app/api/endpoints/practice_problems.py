from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ...database import get_db
from ...models.practice_problem import PracticeProblem
from ...models.subject import Subject
from ...models.progress import Progress
from ...schemas.practice_problem import PracticeProblemCreate, PracticeProblemResponse
from ...services.ai_service import ai_service

router = APIRouter()


@router.get("/", response_model=List[PracticeProblemResponse])
def get_practice_problems(
    subject_id: int = None,
    difficulty: str = None,
    db: Session = Depends(get_db)
):
    """Get all practice problems, optionally filtered"""
    query = db.query(PracticeProblem)
    if subject_id:
        query = query.filter(PracticeProblem.subject_id == subject_id)
    if difficulty:
        query = query.filter(PracticeProblem.difficulty == difficulty)
    problems = query.all()
    return problems


@router.get("/{problem_id}", response_model=PracticeProblemResponse)
def get_practice_problem(problem_id: int, db: Session = Depends(get_db)):
    """Get a specific practice problem"""
    problem = db.query(PracticeProblem).filter(PracticeProblem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Practice problem not found")
    return problem


@router.post("/generate", response_model=List[PracticeProblemResponse])
def generate_practice_problems(
    problem_data: PracticeProblemCreate,
    db: Session = Depends(get_db)
):
    """Generate practice problems using AI"""
    subject = db.query(Subject).filter(Subject.id == problem_data.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    # Generate practice problems using AI
    num_problems = problem_data.num_problems or 5
    topic = problem_data.topic or "general topics"
    difficulty = problem_data.difficulty or "medium"

    generated_problems = ai_service.generate_practice_problems(
        subject.name,
        topic,
        difficulty,
        num_problems
    )

    if not generated_problems:
        raise HTTPException(status_code=500, detail="Failed to generate practice problems")

    # Save problems to database
    db_problems = []
    for problem in generated_problems:
        db_problem = PracticeProblem(
            subject_id=problem_data.subject_id,
            question=problem.get("question", ""),
            solution=problem.get("solution", ""),
            difficulty=difficulty,
            topic=topic,
            hints=problem.get("hints", "")
        )
        db.add(db_problem)
        db_problems.append(db_problem)

    db.commit()
    for problem in db_problems:
        db.refresh(problem)

    return db_problems


@router.post("/{problem_id}/solve", response_model=PracticeProblemResponse)
def mark_problem_solved(problem_id: int, db: Session = Depends(get_db)):
    """Mark a practice problem as solved"""
    problem = db.query(PracticeProblem).filter(PracticeProblem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Practice problem not found")

    problem.is_solved = True
    problem.solved_at = datetime.now()

    # Update progress
    progress = db.query(Progress).filter(Progress.subject_id == problem.subject_id).first()
    if progress:
        progress.problems_solved += 1
        progress.last_studied = datetime.now()

        # Update mastery level
        progress.mastery_level = min(100, progress.average_quiz_score * 0.7 + progress.problems_solved * 0.3)

    db.commit()
    db.refresh(problem)
    return problem


@router.delete("/{problem_id}")
def delete_practice_problem(problem_id: int, db: Session = Depends(get_db)):
    """Delete a practice problem"""
    db_problem = db.query(PracticeProblem).filter(PracticeProblem.id == problem_id).first()
    if not db_problem:
        raise HTTPException(status_code=404, detail="Practice problem not found")

    db.delete(db_problem)
    db.commit()
    return {"message": "Practice problem deleted successfully"}
