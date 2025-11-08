# Flashcard Study App

An AI-powered flashcard application for creating and studying flashcards using spaced repetition. Upload study materials (PDF, PowerPoint, text) and automatically generate flashcards using AI, or create them manually.

## Features

- 🔐 **User Authentication**: Email/password login and signup
- 📤 **File Upload**: Support for PDF, PowerPoint (.ppt, .pptx), and text files
- 🤖 **AI-Powered**: Auto-generate flashcards from study materials using LLM APIs
- 📚 **Deck Management**: Organize flashcards into named decks
- ✏️ **Card Editor**: Manually create, edit, and delete flashcards
- 🧠 **Spaced Repetition**: SM-2 algorithm for optimal learning
- 📊 **Practice Mode**: Interactive flashcard review with flip animations
- 🎯 **Review Tracking**: Track "Remembered" vs "Forgot" responses

## Tech Stack

### Backend
- **Framework**: Python + FastAPI
- **Database**: SQLite (easily swappable to PostgreSQL)
- **Authentication**: JWT with passlib for password hashing
- **File Parsing**: PyPDF2 (PDF), python-pptx (PowerPoint)
- **AI Integration**: Supports any OpenAI-compatible API endpoint

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **HTTP Client**: Axios

## Project Structure

```
study/
├── backend/
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   ├── core/          # Config, database, security
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic (parser, LLM, spaced repetition)
│   │   └── utils/         # Utilities
│   ├── main.py            # FastAPI application
│   ├── requirements.txt   # Python dependencies
│   └── .env.example       # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/    # React components (Navbar)
│   │   ├── contexts/      # React contexts (Auth)
│   │   ├── pages/         # Page components
│   │   ├── services/      # API client
│   │   └── utils/         # Utilities
│   ├── package.json       # Node dependencies
│   └── vite.config.js     # Vite configuration
└── Readme.md              # This file
```

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (optional but recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file from the example:
```bash
cp .env.example .env
```

5. Configure your `.env` file:
   - Set `SECRET_KEY` to a secure random string
   - (Optional) Configure LLM API settings for AI flashcard generation:
     - For OpenAI: Set `LLM_API_KEY` to your OpenAI API key
     - For other providers: Update `LLM_API_URL` and `LLM_API_KEY`
   - The app works without an LLM API key but will use a simple fallback for flashcard generation

6. Start the backend server:
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Or use the provided script:
```bash
./run.sh
```

The API will be available at `http://localhost:8000`
- API docs: `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage Guide

### 1. Sign Up / Login
- Create an account with your email and password
- Login to access the dashboard

### 2. Create Flashcards

**Option A: Upload Files**
1. Click "Upload" in the navigation bar
2. Choose a PDF, PowerPoint, or text file
3. The app extracts text from your file
4. Name your deck and optionally add a description
5. Click "Generate Flashcards" to create cards using AI

**Option B: Manual Entry**
1. Go to Dashboard and click "Create New Deck"
2. Upload a text file or paste content
3. After deck creation, click "View" on the deck
4. Click "+ Add Flashcard" to manually create cards

### 3. Study with Spaced Repetition
1. From the Dashboard, click "Practice" on any deck
2. Read the question and try to recall the answer
3. Click "Show Answer" to reveal it
4. Mark whether you "Remembered" or "Forgot"
5. The app schedules the next review based on your response:
   - **Remembered**: Review interval doubles (e.g., 1 day → 2 days → 4 days)
   - **Forgot**: Reset to review in 1 day

### 4. Manage Decks
- **View**: See all flashcards in a deck
- **Edit**: Modify questions and answers
- **Delete**: Remove cards or entire decks
- **Practice**: Study cards that are due for review

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Decks
- `GET /api/decks/` - List all decks
- `POST /api/decks/` - Create deck
- `GET /api/decks/{id}` - Get deck with flashcards
- `PUT /api/decks/{id}` - Update deck
- `DELETE /api/decks/{id}` - Delete deck

### Flashcards
- `GET /api/flashcards/{id}` - Get flashcard
- `POST /api/decks/{id}/flashcards` - Add flashcard to deck
- `PUT /api/flashcards/{id}` - Update flashcard
- `DELETE /api/flashcards/{id}` - Delete flashcard

### Reviews
- `POST /api/reviews/` - Record review
- `GET /api/reviews/due` - Get all due flashcards
- `GET /api/reviews/deck/{id}/due` - Get due flashcards for deck

### Upload
- `POST /api/upload/upload` - Upload and parse file
- `POST /api/upload/generate` - Generate flashcards from text

## Spaced Repetition Algorithm

The app uses a simplified SM-2 algorithm:

```python
if remembered:
    new_interval = current_interval * 2  # Double the interval
else:
    new_interval = 1.0  # Reset to 1 day
```

This ensures:
- Cards you know well are reviewed less frequently
- Cards you struggle with appear more often
- Optimal long-term retention with minimal study time

## Configuration

### Using PostgreSQL Instead of SQLite

1. Install PostgreSQL and create a database:
```bash
createdb flashcard_db
```

2. Update `DATABASE_URL` in `.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/flashcard_db
```

### Using Different LLM Providers

The app supports any OpenAI-compatible API:

**Anthropic Claude:**
```env
LLM_API_URL=https://api.anthropic.com/v1/messages
LLM_API_KEY=your-anthropic-key
LLM_MODEL=claude-3-sonnet-20240229
```

**Local LLM (Ollama, LM Studio):**
```env
LLM_API_URL=http://localhost:11434/v1/chat/completions
LLM_API_KEY=not-needed
LLM_MODEL=llama2
```

## Development

### Running Tests
Currently, no automated tests are included. To add tests:

**Backend:**
```bash
pip install pytest pytest-asyncio
pytest
```

**Frontend:**
```bash
npm install --save-dev vitest @testing-library/react
npm run test
```

### Building for Production

**Backend:**
```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
npm run build
npm run preview
```

## Troubleshooting

### Backend Issues

**Database errors:**
- Delete the SQLite database file and restart: `rm flashcard.db`
- The database will be recreated automatically

**File parsing errors:**
- Ensure files are not corrupted
- Check file size limits (default: no limit, but configurable)

### Frontend Issues

**CORS errors:**
- Ensure backend is running on port 8000
- Check `FRONTEND_URL` in backend `.env`

**API connection errors:**
- Verify proxy settings in `vite.config.js`
- Check that backend is accessible at `http://localhost:8000`

## License

This project is open source and available for educational purposes.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Acknowledgments

- Inspired by Gizmo AI Flashcards
- Built with modern web technologies
- Implements research-backed spaced repetition learning
