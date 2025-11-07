from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ...database import get_db
from ...models.progress import Progress
from ...models.subject import Subject
from ...schemas.progress import ProgressResponse

router = APIRouter()


@router.get("/", response_model=List[ProgressResponse])
def get_all_progress(db: Session = Depends(get_db)):
    """Get progress for all subjects"""
    progress = db.query(Progress).all()
    return progress


@router.get("/{subject_id}", response_model=ProgressResponse)
def get_subject_progress(subject_id: int, db: Session = Depends(get_db)):
    """Get progress for a specific subject"""
    progress = db.query(Progress).filter(Progress.subject_id == subject_id).first()
    if not progress:
        # Create progress if it doesn't exist
        subject = db.query(Subject).filter(Subject.id == subject_id).first()
        if not subject:
            raise HTTPException(status_code=404, detail="Subject not found")

        progress = Progress(subject_id=subject_id)
        db.add(progress)
        db.commit()
        db.refresh(progress)

    return progress
