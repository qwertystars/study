"""Main FastAPI application"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import auth, decks, flashcards, practice, upload
from .config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="Flashcard App API",
    description="API for AI-powered flashcard learning app",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(decks.router, prefix="/api")
app.include_router(flashcards.router, prefix="/api")
app.include_router(practice.router, prefix="/api")
app.include_router(upload.router, prefix="/api")


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Flashcard App API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
