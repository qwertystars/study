"""Upload and content processing routes"""
import os
import tempfile
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..models.deck import Deck
from ..models.flashcard import Flashcard
from ..schemas.deck import DeckResponse
from ..schemas.flashcard import FlashcardResponse
from ..utils.auth import get_current_user
from ..utils.file_parser import FileParser
from ..services.ai_service import AIService
from ..config import settings

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("/process", response_model=DeckResponse)
async def process_upload(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    youtube_url: Optional[str] = Form(None),
    deck_name: str = Form(...),
    deck_description: Optional[str] = Form(None),
    num_cards: int = Form(10),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Process uploaded content and generate flashcards

    Accepts:
    - file: PDF, PPTX, or text file
    - text: Pasted text content
    - youtube_url: YouTube video URL
    - deck_name: Name for the new deck
    - num_cards: Number of flashcards to generate (default 10)
    """
    # Extract text content from the source
    content = ""

    try:
        if file:
            # Handle file upload
            # Save file temporarily
            suffix = os.path.splitext(file.filename)[1]
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
                tmp_file.write(await file.read())
                tmp_path = tmp_file.name

            try:
                # Parse file
                content = FileParser.parse_file(tmp_path)
            finally:
                # Clean up temp file
                os.unlink(tmp_path)

        elif text:
            # Use provided text
            content = text

        elif youtube_url:
            # Parse YouTube video
            content = FileParser.parse_youtube(youtube_url)

        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Must provide either file, text, or youtube_url",
            )

        if not content or len(content.strip()) < 50:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Content is too short to generate flashcards",
            )

        # Create deck
        new_deck = Deck(
            user_id=current_user.id,
            name=deck_name,
            description=deck_description,
        )
        db.add(new_deck)
        db.commit()
        db.refresh(new_deck)

        # Generate flashcards using AI
        ai_service = AIService()
        flashcards_data = ai_service.generate_flashcards(content, num_cards=num_cards)

        # Save flashcards to database
        for card_data in flashcards_data:
            flashcard = Flashcard(
                deck_id=new_deck.id,
                question=card_data["question"],
                answer=card_data["answer"],
            )
            db.add(flashcard)

        db.commit()

        # Return deck with count
        card_count = len(flashcards_data)
        return DeckResponse(
            id=new_deck.id,
            user_id=new_deck.user_id,
            name=new_deck.name,
            description=new_deck.description,
            created_at=new_deck.created_at,
            updated_at=new_deck.updated_at,
            card_count=card_count,
            due_count=card_count,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing content: {str(e)}",
        )


@router.post("/generate-more/{deck_id}", response_model=List[FlashcardResponse])
async def generate_more_cards(
    deck_id: int,
    text: str = Form(...),
    num_cards: int = Form(5),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate additional flashcards for an existing deck"""
    # Verify deck ownership
    deck = (
        db.query(Deck)
        .filter(Deck.id == deck_id, Deck.user_id == current_user.id)
        .first()
    )

    if not deck:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deck not found")

    try:
        # Generate flashcards using AI
        ai_service = AIService()
        flashcards_data = ai_service.generate_flashcards(text, num_cards=num_cards)

        # Save flashcards to database
        new_flashcards = []
        for card_data in flashcards_data:
            flashcard = Flashcard(
                deck_id=deck.id,
                question=card_data["question"],
                answer=card_data["answer"],
            )
            db.add(flashcard)
            db.flush()
            new_flashcards.append(
                FlashcardResponse(
                    id=flashcard.id,
                    deck_id=flashcard.deck_id,
                    question=flashcard.question,
                    answer=flashcard.answer,
                    created_at=flashcard.created_at,
                    updated_at=flashcard.updated_at,
                )
            )

        db.commit()

        return new_flashcards

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating flashcards: {str(e)}",
        )
