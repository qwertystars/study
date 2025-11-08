"""Deck routes"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime

from ..database import get_db
from ..models.user import User
from ..models.deck import Deck
from ..models.flashcard import Flashcard
from ..models.review import Review
from ..schemas.deck import DeckCreate, DeckUpdate, DeckResponse
from ..utils.auth import get_current_user

router = APIRouter(prefix="/decks", tags=["Decks"])


@router.get("", response_model=List[DeckResponse])
def get_decks(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get all decks for the current user"""
    decks = db.query(Deck).filter(Deck.user_id == current_user.id).all()

    # Enrich with card counts and due counts
    deck_responses = []
    for deck in decks:
        card_count = db.query(Flashcard).filter(Flashcard.deck_id == deck.id).count()

        # Count due cards (cards with next_review <= now or no reviews yet)
        due_count = (
            db.query(Flashcard)
            .outerjoin(Review)
            .filter(Flashcard.deck_id == deck.id)
            .filter(
                (Review.next_review <= datetime.utcnow()) | (Review.next_review == None)
            )
            .distinct()
            .count()
        )

        deck_dict = {
            "id": deck.id,
            "user_id": deck.user_id,
            "name": deck.name,
            "description": deck.description,
            "created_at": deck.created_at,
            "updated_at": deck.updated_at,
            "card_count": card_count,
            "due_count": due_count,
        }
        deck_responses.append(DeckResponse(**deck_dict))

    return deck_responses


@router.get("/{deck_id}", response_model=DeckResponse)
def get_deck(
    deck_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific deck"""
    deck = (
        db.query(Deck)
        .filter(Deck.id == deck_id, Deck.user_id == current_user.id)
        .first()
    )

    if not deck:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deck not found")

    # Get counts
    card_count = db.query(Flashcard).filter(Flashcard.deck_id == deck.id).count()
    due_count = (
        db.query(Flashcard)
        .outerjoin(Review)
        .filter(Flashcard.deck_id == deck.id)
        .filter((Review.next_review <= datetime.utcnow()) | (Review.next_review == None))
        .distinct()
        .count()
    )

    deck_dict = {
        "id": deck.id,
        "user_id": deck.user_id,
        "name": deck.name,
        "description": deck.description,
        "created_at": deck.created_at,
        "updated_at": deck.updated_at,
        "card_count": card_count,
        "due_count": due_count,
    }

    return DeckResponse(**deck_dict)


@router.post("", response_model=DeckResponse, status_code=status.HTTP_201_CREATED)
def create_deck(
    deck_data: DeckCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new deck"""
    new_deck = Deck(
        user_id=current_user.id,
        name=deck_data.name,
        description=deck_data.description,
    )

    db.add(new_deck)
    db.commit()
    db.refresh(new_deck)

    return DeckResponse(
        id=new_deck.id,
        user_id=new_deck.user_id,
        name=new_deck.name,
        description=new_deck.description,
        created_at=new_deck.created_at,
        updated_at=new_deck.updated_at,
        card_count=0,
        due_count=0,
    )


@router.put("/{deck_id}", response_model=DeckResponse)
def update_deck(
    deck_id: int,
    deck_data: DeckUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a deck"""
    deck = (
        db.query(Deck)
        .filter(Deck.id == deck_id, Deck.user_id == current_user.id)
        .first()
    )

    if not deck:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deck not found")

    # Update fields
    if deck_data.name is not None:
        deck.name = deck_data.name
    if deck_data.description is not None:
        deck.description = deck_data.description

    db.commit()
    db.refresh(deck)

    card_count = db.query(Flashcard).filter(Flashcard.deck_id == deck.id).count()
    due_count = (
        db.query(Flashcard)
        .outerjoin(Review)
        .filter(Flashcard.deck_id == deck.id)
        .filter((Review.next_review <= datetime.utcnow()) | (Review.next_review == None))
        .distinct()
        .count()
    )

    return DeckResponse(
        id=deck.id,
        user_id=deck.user_id,
        name=deck.name,
        description=deck.description,
        created_at=deck.created_at,
        updated_at=deck.updated_at,
        card_count=card_count,
        due_count=due_count,
    )


@router.delete("/{deck_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_deck(
    deck_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a deck"""
    deck = (
        db.query(Deck)
        .filter(Deck.id == deck_id, Deck.user_id == current_user.id)
        .first()
    )

    if not deck:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deck not found")

    db.delete(deck)
    db.commit()

    return None
