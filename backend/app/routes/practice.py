"""Practice and review routes"""
from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from ..database import get_db
from ..models.user import User
from ..models.deck import Deck
from ..models.flashcard import Flashcard
from ..models.review import Review
from ..schemas.flashcard import FlashcardResponse
from ..schemas.review import ReviewCreate, ReviewResponse
from ..utils.auth import get_current_user
from ..utils.spaced_repetition import SpacedRepetition

router = APIRouter(prefix="/practice", tags=["Practice"])


@router.get("/deck/{deck_id}/due", response_model=List[FlashcardResponse])
def get_due_cards(
    deck_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all flashcards due for review in a deck"""
    # Verify deck ownership
    deck = (
        db.query(Deck)
        .filter(Deck.id == deck_id, Deck.user_id == current_user.id)
        .first()
    )

    if not deck:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deck not found")

    # Get all flashcards in the deck
    all_cards = db.query(Flashcard).filter(Flashcard.deck_id == deck_id).all()

    due_cards = []
    for card in all_cards:
        # Get latest review for this user
        latest_review = (
            db.query(Review)
            .filter(
                Review.flashcard_id == card.id,
                Review.user_id == current_user.id,
            )
            .order_by(Review.reviewed_at.desc())
            .first()
        )

        # Include if never reviewed or if next_review is in the past
        if not latest_review or latest_review.next_review <= datetime.utcnow():
            card_dict = {
                "id": card.id,
                "deck_id": card.deck_id,
                "question": card.question,
                "answer": card.answer,
                "created_at": card.created_at,
                "updated_at": card.updated_at,
                "next_review": latest_review.next_review if latest_review else None,
                "interval_days": latest_review.interval_days if latest_review else None,
            }
            due_cards.append(FlashcardResponse(**card_dict))

    return due_cards


@router.post("/review", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def submit_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submit a review for a flashcard"""
    # Get flashcard
    flashcard = db.query(Flashcard).filter(Flashcard.id == review_data.flashcard_id).first()

    if not flashcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Flashcard not found"
        )

    # Verify ownership through deck
    deck = db.query(Deck).filter(Deck.id == flashcard.deck_id).first()
    if deck.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Get latest review for interval calculation
    latest_review = (
        db.query(Review)
        .filter(
            Review.flashcard_id == review_data.flashcard_id,
            Review.user_id == current_user.id,
        )
        .order_by(Review.reviewed_at.desc())
        .first()
    )

    # Calculate next review using spaced repetition
    current_interval = latest_review.interval_days if latest_review else 1.0
    next_review, new_interval = SpacedRepetition.calculate_next_review(
        remembered=review_data.remembered, current_interval=current_interval
    )

    # Create new review record
    new_review = Review(
        flashcard_id=review_data.flashcard_id,
        user_id=current_user.id,
        remembered=review_data.remembered,
        interval_days=new_interval,
        next_review=next_review,
    )

    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return new_review


@router.get("/today", response_model=List[FlashcardResponse])
def get_todays_reviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all flashcards due for review today across all decks"""
    # Get all user's decks
    user_decks = db.query(Deck).filter(Deck.user_id == current_user.id).all()
    deck_ids = [deck.id for deck in user_decks]

    if not deck_ids:
        return []

    # Get all flashcards in user's decks
    all_cards = db.query(Flashcard).filter(Flashcard.deck_id.in_(deck_ids)).all()

    due_cards = []
    for card in all_cards:
        # Get latest review for this user
        latest_review = (
            db.query(Review)
            .filter(
                Review.flashcard_id == card.id,
                Review.user_id == current_user.id,
            )
            .order_by(Review.reviewed_at.desc())
            .first()
        )

        # Include if never reviewed or if next_review is in the past
        if not latest_review or latest_review.next_review <= datetime.utcnow():
            card_dict = {
                "id": card.id,
                "deck_id": card.deck_id,
                "question": card.question,
                "answer": card.answer,
                "created_at": card.created_at,
                "updated_at": card.updated_at,
                "next_review": latest_review.next_review if latest_review else None,
                "interval_days": latest_review.interval_days if latest_review else None,
            }
            due_cards.append(FlashcardResponse(**card_dict))

    return due_cards
