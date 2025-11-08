"""Deck schemas"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class DeckCreate(BaseModel):
    """Schema for creating a deck"""

    name: str
    description: Optional[str] = None


class DeckUpdate(BaseModel):
    """Schema for updating a deck"""

    name: Optional[str] = None
    description: Optional[str] = None


class DeckResponse(BaseModel):
    """Schema for deck response"""

    id: int
    user_id: int
    name: str
    description: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    card_count: Optional[int] = 0
    due_count: Optional[int] = 0

    class Config:
        from_attributes = True
