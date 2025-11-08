from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import User, Deck, Flashcard
from app.schemas.schemas import FileUploadResponse, GenerateFlashcardsRequest, GenerateFlashcardsResponse
from app.api.auth import get_current_user
from app.services.parser import extract_text_from_file
from app.services.llm import generate_flashcards_from_text

router = APIRouter()

@router.post("/upload", response_model=FileUploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload a file and extract text"""
    try:
        content = await file.read()
        extracted_text = extract_text_from_file(file.filename, content)
        
        return {
            "filename": file.filename,
            "extracted_text": extracted_text
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@router.post("/generate", response_model=GenerateFlashcardsResponse)
async def generate_flashcards(
    request: GenerateFlashcardsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate flashcards from text using LLM"""
    try:
        # Generate flashcards using LLM
        flashcards_data = await generate_flashcards_from_text(request.text)
        
        # Create deck
        deck = Deck(
            name=request.deck_name,
            description=request.deck_description,
            user_id=current_user.id
        )
        db.add(deck)
        db.commit()
        db.refresh(deck)
        
        # Add flashcards to deck
        for card_data in flashcards_data:
            flashcard = Flashcard(
                deck_id=deck.id,
                question=card_data["question"],
                answer=card_data["answer"]
            )
            db.add(flashcard)
        
        db.commit()
        
        return {
            "deck_id": deck.id,
            "flashcards_count": len(flashcards_data),
            "message": f"Successfully generated {len(flashcards_data)} flashcards"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error generating flashcards: {str(e)}")
