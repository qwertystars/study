from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ...database import get_db
from ...models.study_session import StudySession
from ...models.subject import Subject
from ...models.progress import Progress
from ...schemas.study_session import StudySessionCreate, StudySessionResponse

router = APIRouter()


@router.get("/", response_model=List[StudySessionResponse])
def get_study_sessions(subject_id: int = None, db: Session = Depends(get_db)):
    """Get all study sessions, optionally filtered by subject"""
    query = db.query(StudySession)
    if subject_id:
        query = query.filter(StudySession.subject_id == subject_id)
    sessions = query.order_by(StudySession.created_at.desc()).all()
    return sessions


@router.get("/{session_id}", response_model=StudySessionResponse)
def get_study_session(session_id: int, db: Session = Depends(get_db)):
    """Get a specific study session"""
    session = db.query(StudySession).filter(StudySession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Study session not found")
    return session


@router.post("/", response_model=StudySessionResponse)
def create_study_session(session: StudySessionCreate, db: Session = Depends(get_db)):
    """Create a new study session"""
    subject = db.query(Subject).filter(Subject.id == session.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    db_session = StudySession(**session.model_dump())
    db.add(db_session)

    # Update progress
    progress = db.query(Progress).filter(Progress.subject_id == session.subject_id).first()
    if progress:
        progress.total_study_time += session.duration
        progress.last_studied = db_session.created_at

    db.commit()
    db.refresh(db_session)
    return db_session


@router.delete("/{session_id}")
def delete_study_session(session_id: int, db: Session = Depends(get_db)):
    """Delete a study session"""
    db_session = db.query(StudySession).filter(StudySession.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Study session not found")

    db.delete(db_session)
    db.commit()
    return {"message": "Study session deleted successfully"}
