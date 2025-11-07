from fastapi import APIRouter
from .endpoints import subjects, flashcards, quizzes, practice_problems, study_sessions, progress

api_router = APIRouter()

api_router.include_router(subjects.router, prefix="/subjects", tags=["subjects"])
api_router.include_router(flashcards.router, prefix="/flashcards", tags=["flashcards"])
api_router.include_router(quizzes.router, prefix="/quizzes", tags=["quizzes"])
api_router.include_router(practice_problems.router, prefix="/practice-problems", tags=["practice-problems"])
api_router.include_router(study_sessions.router, prefix="/study-sessions", tags=["study-sessions"])
api_router.include_router(progress.router, prefix="/progress", tags=["progress"])
