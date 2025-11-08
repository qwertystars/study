from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ...database import get_db
from ...models.flashcard import Flashcard
from ...models.subject import Subject
from ...models.progress import Progress
from ...schemas.flashcard import FlashcardCreate, FlashcardUpdate, FlashcardResponse, FlashcardReviewRequest
from ...services.ai_service import ai_service
from ...services.spaced_repetition import spaced_repetition_service

router = APIRouter()


@router.get("/", response_model=List[FlashcardResponse])
def get_flashcards(subject_id: int = None, db: Session = Depends(get_db)):
    """Get all flashcards, optionally filtered by subject"""
    query = db.query(Flashcard)
    if subject_id:
        query = query.filter(Flashcard.subject_id == subject_id)
    flashcards = query.all()
    return flashcards


@router.get("/due", response_model=List[FlashcardResponse])
def get_due_flashcards(subject_id: int = None, db: Session = Depends(get_db)):
    """Get flashcards that are due for review"""
    query = db.query(Flashcard).filter(Flashcard.next_review <= datetime.now())
    if subject_id:
        query = query.filter(Flashcard.subject_id == subject_id)
    flashcards = query.all()
    return flashcards


@router.get("/{flashcard_id}", response_model=FlashcardResponse)
def get_flashcard(flashcard_id: int, db: Session = Depends(get_db)):
    """Get a specific flashcard"""
    flashcard = db.query(Flashcard).filter(Flashcard.id == flashcard_id).first()
    if not flashcard:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    return flashcard


@router.post("/generate", response_model=List[FlashcardResponse])
def generate_flashcards(
    subject_id: int,
    topic: str,
    num_cards: int = 5,
    db: Session = Depends(get_db)
):
    """Generate flashcards using AI"""
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    # Generate flashcards using AI
    generated_cards = ai_service.generate_flashcards(subject.name, topic, num_cards)

    if not generated_cards:
        raise HTTPException(status_code=500, detail="Failed to generate flashcards")

    # Save flashcards to database
    db_flashcards = []
    for card in generated_cards:
        db_flashcard = Flashcard(
            subject_id=subject_id,
            question=card.get("question", ""),
            answer=card.get("answer", ""),
            difficulty=card.get("difficulty", "medium"),
            topic=topic
        )
        db.add(db_flashcard)
        db_flashcards.append(db_flashcard)

    db.commit()
    for card in db_flashcards:
        db.refresh(card)

    return db_flashcards


@router.post("/", response_model=FlashcardResponse)
def create_flashcard(flashcard: FlashcardCreate, db: Session = Depends(get_db)):
    """Create a new flashcard manually"""
    subject = db.query(Subject).filter(Subject.id == flashcard.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    db_flashcard = Flashcard(**flashcard.model_dump())
    db.add(db_flashcard)
    db.commit()
    db.refresh(db_flashcard)
    return db_flashcard


@router.post("/{flashcard_id}/review", response_model=FlashcardResponse)
def review_flashcard(
    flashcard_id: int,
    review: FlashcardReviewRequest,
    db: Session = Depends(get_db)
):
    """Review a flashcard and update spaced repetition data"""
    flashcard = db.query(Flashcard).filter(Flashcard.id == flashcard_id).first()
    if not flashcard:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    # Calculate next review using spaced repetition
    ease_factor, interval, repetitions, next_review = spaced_repetition_service.calculate_next_review(
        review.quality,
        flashcard.ease_factor,
        flashcard.interval,
        flashcard.repetitions
    )

    # Update flashcard
    flashcard.ease_factor = ease_factor
    flashcard.interval = interval
    flashcard.repetitions = repetitions
    flashcard.next_review = next_review
    flashcard.last_reviewed = datetime.now()

    # Update progress
    progress = db.query(Progress).filter(Progress.subject_id == flashcard.subject_id).first()
    if progress:
        progress.flashcards_reviewed += 1
        progress.last_studied = datetime.now()

    db.commit()
    db.refresh(flashcard)
    return flashcard


@router.put("/{flashcard_id}", response_model=FlashcardResponse)
def update_flashcard(
    flashcard_id: int,
    flashcard: FlashcardUpdate,
    db: Session = Depends(get_db)
):
    """Update a flashcard"""
    db_flashcard = db.query(Flashcard).filter(Flashcard.id == flashcard_id).first()
    if not db_flashcard:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    update_data = flashcard.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_flashcard, field, value)

    db.commit()
    db.refresh(db_flashcard)
    return db_flashcard


@router.delete("/{flashcard_id}")
def delete_flashcard(flashcard_id: int, db: Session = Depends(get_db)):
    """Delete a flashcard"""
    db_flashcard = db.query(Flashcard).filter(Flashcard.id == flashcard_id).first()
    if not db_flashcard:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    db.delete(db_flashcard)
    db.commit()
    return {"message": "Flashcard deleted successfully"}
