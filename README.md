# Flashcard App - AI-Powered Spaced Repetition Learning

A full-stack web application similar to Gizmo AI Flashcards that helps you learn more efficiently using AI-generated flashcards and spaced repetition.

## Features

- **AI-Powered Flashcard Generation**: Upload study materials (PDF, PowerPoint, text, or YouTube links) and automatically generate flashcards
- **Multiple Content Sources**: Support for PDF, PPTX, text files, pasted notes, and YouTube videos
- **Spaced Repetition System**: SM-2 simplified algorithm to optimize review intervals
- **Deck Management**: Organize flashcards into decks with full CRUD operations
- **Practice Mode**: Interactive flashcard practice with flip animations
- **User Authentication**: Secure signup/login with JWT tokens
- **Clean, Modern UI**: Built with React, TailwindCSS, and shadcn/ui components

## Tech Stack

### Backend
- **Framework**: Python + FastAPI
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **AI Integration**: OpenAI GPT / Anthropic Claude APIs
- **File Parsing**: PyPDF2, python-pptx, yt-dlp

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui + Radix UI
- **Routing**: React Router v6
- **HTTP Client**: Axios

### Infrastructure
- **Database**: PostgreSQL 15
- **Containerization**: Docker + Docker Compose

## Project Structure

```
flashcard-app/
├── backend/
│   ├── app/
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic (AI service)
│   │   ├── utils/           # Utilities (auth, file parsing, spaced repetition)
│   │   ├── config.py        # Configuration
│   │   ├── database.py      # Database setup
│   │   └── main.py          # FastAPI app
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities and API client
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

## Prerequisites

- **Docker & Docker Compose** (recommended) OR
- **Python 3.11+** and **Node.js 18+** (for local development)
- **PostgreSQL 15+** (if not using Docker)
- **API Keys**: At least one of:
  - OpenAI API key
  - Anthropic API key

## Quick Start with Docker (Recommended)

1. **Clone the repository**
   ```bash
   cd flashcard-app
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API keys:
   ```env
   SECRET_KEY=your-random-secret-key-here
   OPENAI_API_KEY=sk-...
   # OR
   ANTHROPIC_API_KEY=sk-ant-...
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

5. **Stop the application**
   ```bash
   docker-compose down
   ```

## Local Development Setup

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up PostgreSQL**
   - Install PostgreSQL
   - Create database:
     ```bash
     createdb flashcards_db
     ```

5. **Configure environment**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your settings:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/flashcards_db
   SECRET_KEY=your-secret-key
   OPENAI_API_KEY=sk-...
   # OR
   ANTHROPIC_API_KEY=sk-ant-...
   ```

6. **Run the backend**
   ```bash
   python run.py
   ```

   The API will be available at http://localhost:8000

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at http://localhost:3000

## Usage Guide

### 1. Sign Up / Login
- Create an account with your email and password
- Login to access your dashboard

### 2. Upload Study Materials
- Click "Upload & Generate Flashcards"
- Choose your content source:
  - **File Upload**: PDF, PowerPoint, or text files
  - **Paste Text**: Copy and paste your notes
  - **YouTube**: Paste a YouTube video URL
- Enter deck name and number of flashcards to generate
- Click "Generate Flashcards"

### 3. Review Your Decks
- View all your decks on the dashboard
- See how many cards are due for review
- Click on a deck to edit flashcards

### 4. Practice Mode
- Click "Practice" on any deck
- Read the question and try to recall the answer
- Click "Show Answer" to reveal
- Mark as "Remembered" or "Forgot"
- The spaced repetition algorithm adjusts review intervals:
  - **Remembered**: Interval doubles (1 day → 2 days → 4 days...)
  - **Forgot**: Interval resets to 1 day

### 5. Edit Flashcards
- Click "Edit" on any deck
- Add, edit, or delete flashcards manually
- Customize questions and answers

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Decks
- `GET /api/decks` - Get all user decks
- `GET /api/decks/{id}` - Get specific deck
- `POST /api/decks` - Create new deck
- `PUT /api/decks/{id}` - Update deck
- `DELETE /api/decks/{id}` - Delete deck

### Flashcards
- `GET /api/flashcards/deck/{deck_id}` - Get all flashcards in deck
- `POST /api/flashcards` - Create flashcard
- `PUT /api/flashcards/{id}` - Update flashcard
- `DELETE /api/flashcards/{id}` - Delete flashcard

### Practice
- `GET /api/practice/deck/{deck_id}/due` - Get due cards for deck
- `GET /api/practice/today` - Get all due cards for today
- `POST /api/practice/review` - Submit review

### Upload
- `POST /api/upload/process` - Upload and generate flashcards
- `POST /api/upload/generate-more/{deck_id}` - Generate more cards for existing deck

## Configuration

### Backend Configuration (backend/app/config.py)
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT signing key
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration (default: 30)
- `OPENAI_API_KEY`: OpenAI API key
- `ANTHROPIC_API_KEY`: Anthropic API key
- `UPLOAD_DIR`: Directory for uploaded files
- `MAX_UPLOAD_SIZE`: Max file size in bytes (default: 50MB)

### Frontend Configuration (frontend/vite.config.ts)
- API proxy configured to forward `/api` requests to backend
- Port: 3000 (development)

## Spaced Repetition Algorithm

The app uses a simplified SM-2 algorithm:

1. **Initial Review**: New cards start with 1-day interval
2. **If Remembered**: Interval doubles (1 → 2 → 4 → 8 → 16 days...)
3. **If Forgot**: Interval resets to 1 day
4. **Next Review**: Scheduled based on calculated interval

This ensures:
- Frequently forgotten cards are reviewed more often
- Well-known cards are reviewed less frequently
- Optimal long-term retention

## Troubleshooting

### Docker Issues

**Containers won't start:**
```bash
docker-compose down -v
docker-compose up --build
```

**Database connection errors:**
- Ensure PostgreSQL container is healthy
- Check DATABASE_URL in .env

### Local Development Issues

**Backend import errors:**
```bash
cd backend
pip install -r requirements.txt
```

**Frontend build errors:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Database migration errors:**
```bash
# Delete database and recreate
dropdb flashcards_db
createdb flashcards_db
python run.py
```

### API Key Issues

**AI generation fails:**
- Verify API key is correct in `.env`
- Check API key has sufficient credits
- Ensure at least one AI provider (OpenAI or Anthropic) is configured

## Production Deployment

### Environment Variables
Set these in production:
```env
SECRET_KEY=<strong-random-key>
DATABASE_URL=<production-db-url>
OPENAI_API_KEY=<your-key>
```

### Security Considerations
- Use strong SECRET_KEY
- Enable HTTPS
- Set proper CORS origins
- Use environment variables for sensitive data
- Regularly update dependencies

### Database Migrations
For production, consider using Alembic:
```bash
pip install alembic
alembic init migrations
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## Development

### Running Tests
```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

### Code Style
```bash
# Backend (Black + isort)
pip install black isort
black .
isort .

# Frontend (ESLint)
npm run lint
```

## License

MIT License - feel free to use this project for learning and development.

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues and questions:
- Open a GitHub issue
- Check existing documentation
- Review API docs at `/docs`

## Roadmap

Future enhancements:
- [ ] Mobile app (React Native)
- [ ] Collaborative decks
- [ ] Image occlusion
- [ ] Audio flashcards
- [ ] Statistics and progress tracking
- [ ] Export/import decks (Anki format)
- [ ] Gamification (streaks, achievements)

---

Built with ❤️ using FastAPI, React, and modern web technologies.
