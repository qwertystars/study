from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.models import User, Deck, Flashcard
from app.schemas.schemas import DeckCreate, Deck as DeckSchema, DeckWithCards, FlashcardCreate, Flashcard as FlashcardSchema
from app.api.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=DeckSchema)
async def create_deck(
    deck: DeckCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new deck"""
    db_deck = Deck(
        name=deck.name,
        description=deck.description,
        user_id=current_user.id
    )
    db.add(db_deck)
    db.commit()
    db.refresh(db_deck)
    return db_deck

@router.get("/", response_model=List[DeckSchema])
async def list_decks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all decks for current user"""
    decks = db.query(Deck).filter(Deck.user_id == current_user.id).all()
    return decks

@router.get("/{deck_id}", response_model=DeckWithCards)
async def get_deck(
    deck_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific deck with all its flashcards"""
    deck = db.query(Deck).filter(Deck.id == deck_id, Deck.user_id == current_user.id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    return deck

@router.put("/{deck_id}", response_model=DeckSchema)
async def update_deck(
    deck_id: int,
    deck_update: DeckCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a deck"""
    deck = db.query(Deck).filter(Deck.id == deck_id, Deck.user_id == current_user.id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    
    deck.name = deck_update.name
    deck.description = deck_update.description
    db.commit()
    db.refresh(deck)
    return deck

@router.delete("/{deck_id}")
async def delete_deck(
    deck_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a deck"""
    deck = db.query(Deck).filter(Deck.id == deck_id, Deck.user_id == current_user.id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    
    db.delete(deck)
    db.commit()
    return {"message": "Deck deleted successfully"}

@router.post("/{deck_id}/flashcards", response_model=FlashcardSchema)
async def add_flashcard(
    deck_id: int,
    flashcard: FlashcardCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a flashcard to a deck"""
    deck = db.query(Deck).filter(Deck.id == deck_id, Deck.user_id == current_user.id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    
    db_flashcard = Flashcard(
        deck_id=deck_id,
        question=flashcard.question,
        answer=flashcard.answer
    )
    db.add(db_flashcard)
    db.commit()
    db.refresh(db_flashcard)
    return db_flashcard
