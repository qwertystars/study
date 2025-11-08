"""Flashcard routes"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..models.deck import Deck
from ..models.flashcard import Flashcard
from ..models.review import Review
from ..schemas.flashcard import FlashcardCreate, FlashcardUpdate, FlashcardResponse
from ..utils.auth import get_current_user

router = APIRouter(prefix="/flashcards", tags=["Flashcards"])


@router.get("/deck/{deck_id}", response_model=List[FlashcardResponse])
def get_flashcards_by_deck(
    deck_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all flashcards for a specific deck"""
    # Verify deck ownership
    deck = (
        db.query(Deck)
        .filter(Deck.id == deck_id, Deck.user_id == current_user.id)
        .first()
    )

    if not deck:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deck not found")

    flashcards = db.query(Flashcard).filter(Flashcard.deck_id == deck_id).all()

    # Enrich with review info
    responses = []
    for card in flashcards:
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
        responses.append(FlashcardResponse(**card_dict))

    return responses


@router.get("/{flashcard_id}", response_model=FlashcardResponse)
def get_flashcard(
    flashcard_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific flashcard"""
    flashcard = db.query(Flashcard).filter(Flashcard.id == flashcard_id).first()

    if not flashcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Flashcard not found"
        )

    # Verify ownership through deck
    deck = db.query(Deck).filter(Deck.id == flashcard.deck_id).first()
    if deck.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Get latest review
    latest_review = (
        db.query(Review)
        .filter(
            Review.flashcard_id == flashcard.id,
            Review.user_id == current_user.id,
        )
        .order_by(Review.reviewed_at.desc())
        .first()
    )

    return FlashcardResponse(
        id=flashcard.id,
        deck_id=flashcard.deck_id,
        question=flashcard.question,
        answer=flashcard.answer,
        created_at=flashcard.created_at,
        updated_at=flashcard.updated_at,
        next_review=latest_review.next_review if latest_review else None,
        interval_days=latest_review.interval_days if latest_review else None,
    )


@router.post("", response_model=FlashcardResponse, status_code=status.HTTP_201_CREATED)
def create_flashcard(
    flashcard_data: FlashcardCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new flashcard"""
    # Verify deck ownership
    deck = (
        db.query(Deck)
        .filter(Deck.id == flashcard_data.deck_id, Deck.user_id == current_user.id)
        .first()
    )

    if not deck:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deck not found")

    new_flashcard = Flashcard(
        deck_id=flashcard_data.deck_id,
        question=flashcard_data.question,
        answer=flashcard_data.answer,
    )

    db.add(new_flashcard)
    db.commit()
    db.refresh(new_flashcard)

    return FlashcardResponse(
        id=new_flashcard.id,
        deck_id=new_flashcard.deck_id,
        question=new_flashcard.question,
        answer=new_flashcard.answer,
        created_at=new_flashcard.created_at,
        updated_at=new_flashcard.updated_at,
    )


@router.put("/{flashcard_id}", response_model=FlashcardResponse)
def update_flashcard(
    flashcard_id: int,
    flashcard_data: FlashcardUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a flashcard"""
    flashcard = db.query(Flashcard).filter(Flashcard.id == flashcard_id).first()

    if not flashcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Flashcard not found"
        )

    # Verify ownership through deck
    deck = db.query(Deck).filter(Deck.id == flashcard.deck_id).first()
    if deck.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Update fields
    if flashcard_data.question is not None:
        flashcard.question = flashcard_data.question
    if flashcard_data.answer is not None:
        flashcard.answer = flashcard_data.answer

    db.commit()
    db.refresh(flashcard)

    # Get latest review
    latest_review = (
        db.query(Review)
        .filter(
            Review.flashcard_id == flashcard.id,
            Review.user_id == current_user.id,
        )
        .order_by(Review.reviewed_at.desc())
        .first()
    )

    return FlashcardResponse(
        id=flashcard.id,
        deck_id=flashcard.deck_id,
        question=flashcard.question,
        answer=flashcard.answer,
        created_at=flashcard.created_at,
        updated_at=flashcard.updated_at,
        next_review=latest_review.next_review if latest_review else None,
        interval_days=latest_review.interval_days if latest_review else None,
    )


@router.delete("/{flashcard_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_flashcard(
    flashcard_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a flashcard"""
    flashcard = db.query(Flashcard).filter(Flashcard.id == flashcard_id).first()

    if not flashcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Flashcard not found"
        )

    # Verify ownership through deck
    deck = db.query(Deck).filter(Deck.id == flashcard.deck_id).first()
    if deck.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    db.delete(flashcard)
    db.commit()

    return None
