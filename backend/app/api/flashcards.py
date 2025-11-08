from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.models import User, Flashcard, Deck
from app.schemas.schemas import FlashcardCreate, Flashcard as FlashcardSchema
from app.api.auth import get_current_user

router = APIRouter()

@router.get("/{flashcard_id}", response_model=FlashcardSchema)
async def get_flashcard(
    flashcard_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific flashcard"""
    flashcard = db.query(Flashcard).join(Deck).filter(
        Flashcard.id == flashcard_id,
        Deck.user_id == current_user.id
    ).first()
    
    if not flashcard:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    return flashcard

@router.put("/{flashcard_id}", response_model=FlashcardSchema)
async def update_flashcard(
    flashcard_id: int,
    flashcard_update: FlashcardCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a flashcard"""
    flashcard = db.query(Flashcard).join(Deck).filter(
        Flashcard.id == flashcard_id,
        Deck.user_id == current_user.id
    ).first()
    
    if not flashcard:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    
    flashcard.question = flashcard_update.question
    flashcard.answer = flashcard_update.answer
    db.commit()
    db.refresh(flashcard)
    return flashcard

@router.delete("/{flashcard_id}")
async def delete_flashcard(
    flashcard_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a flashcard"""
    flashcard = db.query(Flashcard).join(Deck).filter(
        Flashcard.id == flashcard_id,
        Deck.user_id == current_user.id
    ).first()
    
    if not flashcard:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    
    db.delete(flashcard)
    db.commit()
    return {"message": "Flashcard deleted successfully"}
