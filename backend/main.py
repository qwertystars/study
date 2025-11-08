from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api import auth, decks, flashcards, upload, reviews

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Flashcard Study App API",
    description="API for AI-powered flashcard generation and spaced repetition learning",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(decks.router, prefix="/api/decks", tags=["decks"])
app.include_router(flashcards.router, prefix="/api/flashcards", tags=["flashcards"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])

@app.get("/")
async def root():
    return {
        "message": "Flashcard Study App API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}
