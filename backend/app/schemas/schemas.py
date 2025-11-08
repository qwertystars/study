from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Flashcard schemas
class FlashcardBase(BaseModel):
    question: str
    answer: str

class FlashcardCreate(FlashcardBase):
    deck_id: int

class Flashcard(FlashcardBase):
    id: int
    deck_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Deck schemas
class DeckBase(BaseModel):
    name: str
    description: Optional[str] = None

class DeckCreate(DeckBase):
    pass

class Deck(DeckBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class DeckWithCards(Deck):
    flashcards: List[Flashcard] = []
    
    class Config:
        from_attributes = True

# Review schemas
class ReviewCreate(BaseModel):
    flashcard_id: int
    remembered: bool

class Review(BaseModel):
    id: int
    flashcard_id: int
    user_id: int
    remembered: bool
    interval_days: float
    next_review: datetime
    reviewed_at: datetime
    
    class Config:
        from_attributes = True

# File upload schemas
class FileUploadResponse(BaseModel):
    filename: str
    extracted_text: str

class GenerateFlashcardsRequest(BaseModel):
    text: str
    deck_name: str
    deck_description: Optional[str] = None

class GenerateFlashcardsResponse(BaseModel):
    deck_id: int
    flashcards_count: int
    message: str
