# This makes the schemas directory a package
from app.schemas.schemas import *

__all__ = [
    "UserBase", "UserCreate", "UserLogin", "User", "Token", "TokenData",
    "FlashcardBase", "FlashcardCreate", "Flashcard",
    "DeckBase", "DeckCreate", "Deck", "DeckWithCards",
    "ReviewCreate", "Review",
    "FileUploadResponse", "GenerateFlashcardsRequest", "GenerateFlashcardsResponse"
]
