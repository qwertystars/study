# AI-Powered Study Assistant

A comprehensive study assistant application designed for B.Tech CSE students at VIT Chennai. Built with FastAPI, React, PostgreSQL, and Ollama for local AI-powered content generation.

## Features

### Core Functionality
- **Subject Management**: Organize your courses with custom colors and descriptions
- **AI-Powered Flashcards**: Generate flashcards automatically from topics using local LLM
- **Spaced Repetition**: Smart flashcard review system based on the SM-2 algorithm
- **Quiz Mode**: Generate adaptive quizzes with multiple-choice questions
- **Practice Problems**: Get AI-generated practice problems with detailed solutions
- **Progress Tracking**: Comprehensive analytics and mastery level tracking
- **Study Sessions**: Log and track your study time

### Technical Highlights
- Local AI using Ollama (no cloud API required)
- Modern React frontend with TailwindCSS
- FastAPI backend with async support
- PostgreSQL database with Alembic migrations
- Docker support for easy deployment
- RESTful API architecture

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: ORM for database operations
- **PostgreSQL**: Production-grade database
- **Alembic**: Database migration tool
- **Ollama**: Local LLM integration
- **Pydantic**: Data validation

### Frontend
- **React 18**: UI library
- **Vite**: Fast build tool
- **TailwindCSS**: Utility-first CSS framework
- **Axios**: HTTP client
- **React Router**: Client-side routing
- **Lucide React**: Beautiful icons

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Python 3.11+**
   ```bash
   python --version
   ```

2. **Node.js 18+**
   ```bash
   node --version
   ```

3. **PostgreSQL 15+**
   ```bash
   psql --version
   ```

4. **Ollama** (for AI features)
   - Download from: https://ollama.ai
   - After installation, pull the model:
   ```bash
   ollama pull llama3.2
   ```

5. **Docker & Docker Compose** (optional, for containerized deployment)
   ```bash
   docker --version
   docker-compose --version
   ```

## Installation

### Method 1: Local Setup (Recommended for Development)

#### 1. Clone the Repository
```bash
cd /home/user/study
```

#### 2. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env file with your settings (if needed)
nano .env
```

#### 3. Setup Database

```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE studyassistant;
CREATE USER studyuser WITH PASSWORD 'studypass';
GRANT ALL PRIVILEGES ON DATABASE studyassistant TO studyuser;
\q

# Run migrations
alembic upgrade head
```

#### 4. Setup Frontend

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# The frontend is configured to proxy API requests to localhost:8000
```

#### 5. Start Ollama

```bash
# Make sure Ollama is running
ollama serve

# In another terminal, verify the model is available
ollama list
```

#### 6. Run the Application

```bash
# Terminal 1: Start Backend (from backend directory)
cd backend
source venv/bin/activate  # if not already activated
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Start Frontend (from frontend directory)
cd frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### Method 2: Docker Setup (Recommended for Production)

```bash
# From project root directory
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Note**: When using Docker, Ollama must be running on your host machine. The backend container will connect to it via `host.docker.internal:11434`.

## Usage Guide

### Getting Started

1. **Access the Application**
   - Open your browser and go to http://localhost:5173

2. **Create Your First Subject**
   - Click "Add Subject" on the dashboard
   - Enter subject name (e.g., "Multivariable Calculus")
   - Add a description (optional)
   - Choose a color theme
   - Click "Create Subject"

3. **Generate Flashcards**
   - Click on a subject to view details
   - Navigate to "Flashcards"
   - Click "Generate Flashcards"
   - Enter a topic (e.g., "Partial Derivatives")
   - Specify number of cards (default: 5)
   - Click "Generate" and wait for AI to create flashcards

4. **Study with Flashcards**
   - Click on a flashcard to flip between question and answer
   - Rate your recall: Again, Hard, Good, or Easy
   - The system will schedule next review using spaced repetition

5. **Take Quizzes**
   - Go to "Quiz Mode" from subject details
   - Click "Generate Quiz"
   - Set title, difficulty, and number of questions
   - Answer all questions
   - Click "Submit Quiz" to see results and explanations

6. **Practice Problems**
   - Navigate to "Practice Problems"
   - Click "Generate Problems"
   - Enter topic and difficulty
   - Work through problems
   - Click "Show Solution" to view detailed explanations
   - Mark problems as solved to track progress

7. **Track Progress**
   - Visit the "Progress" page from the header
   - View your mastery level, study time, and performance metrics
   - Monitor progress across all subjects

## Project Structure

```
study-assistant/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── endpoints/     # API route handlers
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   ├── config.py          # Configuration
│   │   ├── database.py        # Database setup
│   │   └── main.py            # FastAPI application
│   ├── alembic/               # Database migrations
│   ├── requirements.txt       # Python dependencies
│   └── .env.example          # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service layer
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   ├── package.json          # Node dependencies
│   └── vite.config.js        # Vite configuration
├── docker-compose.yml         # Docker orchestration
└── README.md                 # This file
```

## API Documentation

Once the backend is running, visit http://localhost:8000/docs for interactive API documentation powered by Swagger UI.

### Key Endpoints

#### Subjects
- `GET /api/subjects` - List all subjects
- `POST /api/subjects` - Create a subject
- `GET /api/subjects/{id}` - Get subject details
- `PUT /api/subjects/{id}` - Update subject
- `DELETE /api/subjects/{id}` - Delete subject

#### Flashcards
- `GET /api/flashcards?subject_id={id}` - List flashcards
- `GET /api/flashcards/due` - Get due flashcards
- `POST /api/flashcards/generate` - Generate flashcards with AI
- `POST /api/flashcards/{id}/review` - Review a flashcard

#### Quizzes
- `GET /api/quizzes?subject_id={id}` - List quizzes
- `POST /api/quizzes/generate` - Generate quiz with AI
- `POST /api/quizzes/{id}/submit` - Submit quiz answers

#### Practice Problems
- `GET /api/practice-problems?subject_id={id}` - List problems
- `POST /api/practice-problems/generate` - Generate problems with AI
- `POST /api/practice-problems/{id}/solve` - Mark as solved

#### Progress
- `GET /api/progress` - Get all progress
- `GET /api/progress/{subject_id}` - Get subject progress

## Database Schema

### Tables
- **subjects**: Store subject information
- **flashcards**: Store flashcards with spaced repetition data
- **quizzes**: Store quiz metadata
- **quiz_questions**: Store individual quiz questions
- **practice_problems**: Store practice problems and solutions
- **study_sessions**: Log study sessions
- **progress**: Track learning progress per subject

## Configuration

### Backend Environment Variables

Edit `backend/.env`:

```env
# Database
DATABASE_URL=postgresql://studyuser:studypass@localhost:5432/studyassistant

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2  # or mistral, codellama, etc.

# API
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True

# CORS (add your frontend URLs)
CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000"]
```

### Ollama Models

You can use different models by changing `OLLAMA_MODEL`:
- `llama3.2` (recommended, balanced)
- `mistral` (faster, good quality)
- `llama2` (alternative)
- `codellama` (better for technical subjects)

Pull a model:
```bash
ollama pull mistral
```

## Troubleshooting

### Backend Issues

**Database Connection Error**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Verify database exists
psql -U postgres -l

# Test connection
psql -U studyuser -d studyassistant
```

**Alembic Migration Issues**
```bash
# Reset migrations (careful: drops all data)
alembic downgrade base
alembic upgrade head

# Or create a new migration
alembic revision --autogenerate -m "description"
```

**Ollama Connection Failed**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama
ollama serve

# Check logs
journalctl -u ollama -f
```

### Frontend Issues

**Build Errors**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

**API Connection Issues**
- Verify backend is running on port 8000
- Check CORS settings in backend `.env`
- Verify proxy configuration in `vite.config.js`

### Docker Issues

**Container Won't Start**
```bash
# View logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Development

### Adding a New Feature

1. **Backend**: Create models, schemas, and endpoints
2. **Frontend**: Create pages and components
3. **Test**: Verify functionality
4. **Document**: Update README if needed

### Running Tests

```bash
# Backend tests (if implemented)
cd backend
pytest

# Frontend tests (if implemented)
cd frontend
npm test
```

### Code Quality

```bash
# Backend linting
cd backend
flake8 app/

# Frontend linting
cd frontend
npm run lint
```

## Deployment

### Production Deployment

1. **Update Environment Variables**
   - Set `DEBUG=False` in backend `.env`
   - Use strong database passwords
   - Configure proper CORS origins

2. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

3. **Serve with Nginx** (example)
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           root /path/to/frontend/dist;
           try_files $uri /index.html;
       }

       location /api {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

4. **Use Process Manager for Backend**
   ```bash
   # With systemd or supervisor
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

## Performance Tips

1. **Database Indexing**: Already configured on frequently queried fields
2. **Ollama Performance**: Use GPU acceleration if available
3. **Caching**: Consider Redis for frequently accessed data
4. **Load Balancing**: Use multiple Ollama instances for heavy usage

## Customization

### Adding New Subjects

The app comes pre-configured for:
- Multivariable Calculus
- Physics (Quantum Mechanics)
- Basic Engineering
- English

You can add any subject through the UI!

### Customizing AI Prompts

Edit prompts in `backend/app/services/ai_service.py` to customize AI-generated content for your specific needs.

### Changing Theme

Modify colors in:
- `frontend/tailwind.config.js` - Theme colors
- `frontend/src/index.css` - Custom styles

## Contributing

This is a personal project, but suggestions are welcome!

## License

This project is for educational purposes.

## Acknowledgments

- VIT Chennai for the academic context
- Ollama team for local LLM capabilities
- FastAPI and React communities

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API docs at http://localhost:8000/docs
3. Verify Ollama is running and models are pulled

## Future Enhancements

Potential features to add:
- [ ] User authentication and multi-user support
- [ ] Export study materials to PDF
- [ ] Mobile app (React Native)
- [ ] Voice notes integration
- [ ] Collaborative study groups
- [ ] More AI providers (OpenAI, Anthropic)
- [ ] Advanced analytics and insights
- [ ] Study schedule recommendations
- [ ] Integration with calendar apps

---

**Built with focus on local-first AI and student privacy.**

Happy studying! 📚✨
