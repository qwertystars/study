"""User schemas"""
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    """Schema for user registration"""

    email: EmailStr
    password: str


class UserLogin(BaseModel):
    """Schema for user login"""

    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Schema for user response"""

    id: int
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    """Schema for JWT token"""

    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Schema for token data"""

    email: Optional[str] = None
