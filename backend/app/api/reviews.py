from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.models.models import User, Review, Flashcard, Deck
from app.schemas.schemas import ReviewCreate, Review as ReviewSchema, Flashcard as FlashcardSchema
from app.api.auth import get_current_user
from app.services.spaced_repetition import calculate_next_review

router = APIRouter()

@router.post("/", response_model=ReviewSchema)
async def create_review(
    review: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record a flashcard review"""
    # Verify flashcard belongs to user's deck
    flashcard = db.query(Flashcard).join(Deck).filter(
        Flashcard.id == review.flashcard_id,
        Deck.user_id == current_user.id
    ).first()
    
    if not flashcard:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    
    # Get last review for this flashcard by this user
    last_review = db.query(Review).filter(
        Review.flashcard_id == review.flashcard_id,
        Review.user_id == current_user.id
    ).order_by(Review.reviewed_at.desc()).first()
    
    # Calculate next review interval
    current_interval = last_review.interval_days if last_review else 1.0
    new_interval, next_review = calculate_next_review(review.remembered, current_interval)
    
    # Create new review record
    db_review = Review(
        flashcard_id=review.flashcard_id,
        user_id=current_user.id,
        remembered=review.remembered,
        interval_days=new_interval,
        next_review=next_review
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    
    return db_review

@router.get("/due", response_model=List[FlashcardSchema])
async def get_due_flashcards(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get flashcards due for review"""
    # Get all flashcards from user's decks
    user_flashcards = db.query(Flashcard).join(Deck).filter(
        Deck.user_id == current_user.id
    ).all()
    
    due_flashcards = []
    current_time = datetime.utcnow()
    
    for flashcard in user_flashcards:
        # Get last review for this flashcard
        last_review = db.query(Review).filter(
            Review.flashcard_id == flashcard.id,
            Review.user_id == current_user.id
        ).order_by(Review.reviewed_at.desc()).first()
        
        # If no review exists or next review is due
        if not last_review or last_review.next_review <= current_time:
            due_flashcards.append(flashcard)
    
    return due_flashcards

@router.get("/deck/{deck_id}/due", response_model=List[FlashcardSchema])
async def get_deck_due_flashcards(
    deck_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get flashcards due for review in a specific deck"""
    # Verify deck belongs to user
    deck = db.query(Deck).filter(Deck.id == deck_id, Deck.user_id == current_user.id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    
    flashcards = db.query(Flashcard).filter(Flashcard.deck_id == deck_id).all()
    
    due_flashcards = []
    current_time = datetime.utcnow()
    
    for flashcard in flashcards:
        # Get last review for this flashcard
        last_review = db.query(Review).filter(
            Review.flashcard_id == flashcard.id,
            Review.user_id == current_user.id
        ).order_by(Review.reviewed_at.desc()).first()
        
        # If no review exists or next review is due
        if not last_review or last_review.next_review <= current_time:
            due_flashcards.append(flashcard)
    
    return due_flashcards
