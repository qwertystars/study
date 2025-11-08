# Setup Guide - Flashcard Study App

This guide provides detailed setup instructions for the Flashcard Study App.

## Prerequisites

### Required Software
- **Python 3.8+** - Backend runtime
- **Node.js 16+** - Frontend runtime
- **npm** or **yarn** - Package manager
- **Git** - Version control

### Optional
- **PostgreSQL** - For production database (SQLite is used by default)
- **LLM API Key** - For AI-powered flashcard generation (optional)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/qwertystars/study.git
cd study
```

### 2. Backend Setup

#### Install Python Dependencies

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env  # or use your preferred editor
```

**Minimum Configuration (.env):**
```env
SECRET_KEY=your-secret-key-here-change-in-production
DATABASE_URL=sqlite:///./flashcard.db
```

**With PostgreSQL:**
```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/flashcard_db
```

**With LLM API (Optional):**
```env
# For OpenAI
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_API_KEY=sk-your-openai-api-key
LLM_MODEL=gpt-3.5-turbo

# For Anthropic Claude
LLM_API_URL=https://api.anthropic.com/v1/messages
LLM_API_KEY=your-anthropic-api-key
LLM_MODEL=claude-3-sonnet-20240229

# For Local LLM (Ollama)
LLM_API_URL=http://localhost:11434/v1/chat/completions
LLM_API_KEY=not-needed
LLM_MODEL=llama2
```

#### Initialize Database

The database tables are created automatically when you first run the application. If using PostgreSQL:

```bash
# Create database
createdb flashcard_db

# Tables will be created automatically on first run
```

#### Run Backend Server

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Or use the provided script:
```bash
./run.sh
```

**Verify backend is running:**
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

### 3. Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
```

Or with yarn:
```bash
cd frontend
yarn install
```

#### Configure Frontend (Optional)

The frontend is pre-configured to work with the backend at `http://localhost:8000`. If you need to change this:

Edit `frontend/vite.config.js`:
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',  // Change if needed
        changeOrigin: true,
      }
    }
  }
})
```

#### Run Frontend Server

```bash
cd frontend
npm run dev
```

Or with yarn:
```bash
yarn dev
```

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Quick Start (Both Servers)

Use the provided convenience script to start both servers at once:

```bash
# From project root
./start-dev.sh
```

This will:
1. Start the backend on port 8000
2. Start the frontend on port 5173
3. Display status of both servers
4. Allow you to stop both with Ctrl+C

## Production Deployment

### Backend (Production)

#### Using Gunicorn

```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

#### Using Docker

Create `Dockerfile` in backend directory:
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t flashcard-backend .
docker run -p 8000:8000 flashcard-backend
```

#### Environment Variables for Production

```env
SECRET_KEY=strong-random-secret-key-here
DATABASE_URL=postgresql://user:password@db-host:5432/flashcard_db
FRONTEND_URL=https://yourdomain.com
LLM_API_KEY=your-production-api-key
```

### Frontend (Production)

#### Build for Production

```bash
cd frontend
npm run build
```

The build output will be in `frontend/dist/`.

#### Serve with Nginx

Example nginx configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /path/to/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Deploy to Vercel

```bash
cd frontend
npm install -g vercel
vercel
```

Follow the prompts to deploy.

#### Deploy to Netlify

```bash
cd frontend
npm run build
# Upload dist/ folder to Netlify
```

## Database Setup

### SQLite (Default)

No setup required. Database file is created automatically at `backend/flashcard.db`.

### PostgreSQL

#### Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download installer from https://www.postgresql.org/download/windows/

#### Create Database

```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE flashcard_db;
CREATE USER flashcard_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE flashcard_db TO flashcard_user;
\q
```

#### Update Configuration

Edit `backend/.env`:
```env
DATABASE_URL=postgresql://flashcard_user:your_password@localhost:5432/flashcard_db
```

### Supabase (Cloud PostgreSQL)

1. Sign up at https://supabase.com
2. Create a new project
3. Get connection string from Settings > Database
4. Update `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT].supabase.co:5432/postgres
```

## LLM API Setup

### OpenAI

1. Sign up at https://platform.openai.com
2. Create an API key
3. Add to `backend/.env`:
```env
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_API_KEY=sk-your-api-key-here
LLM_MODEL=gpt-3.5-turbo
```

### Anthropic Claude

1. Sign up at https://www.anthropic.com
2. Create an API key
3. Add to `backend/.env`:
```env
LLM_API_URL=https://api.anthropic.com/v1/messages
LLM_API_KEY=your-api-key-here
LLM_MODEL=claude-3-sonnet-20240229
```

### Local LLM (Ollama)

1. Install Ollama: https://ollama.ai
2. Pull a model:
```bash
ollama pull llama2
```
3. Add to `backend/.env`:
```env
LLM_API_URL=http://localhost:11434/v1/chat/completions
LLM_API_KEY=not-needed
LLM_MODEL=llama2
```

### Without LLM (Fallback)

The app works without an LLM API key. It will use a simple text-splitting fallback to create flashcards. To use fallback mode, simply don't set `LLM_API_KEY` in `.env`.

## Troubleshooting

### Backend Issues

**"Module not found" errors:**
```bash
cd backend
pip install -r requirements.txt
```

**Database connection errors:**
- Check `DATABASE_URL` in `.env`
- Ensure database server is running
- Verify credentials are correct

**Port 8000 already in use:**
```bash
# Find and kill process
lsof -ti:8000 | xargs kill -9
# Or change port in startup command
uvicorn main:app --port 8001
```

### Frontend Issues

**"Cannot find module" errors:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Vite build errors:**
```bash
cd frontend
npm run build
```

**Connection to backend fails:**
- Ensure backend is running on port 8000
- Check browser console for errors
- Verify proxy settings in `vite.config.js`

### Common Errors

**CORS errors:**
- Add your frontend URL to `FRONTEND_URL` in backend `.env`
- Restart backend server

**JWT token errors:**
- Clear browser localStorage
- Login again

**File upload fails:**
- Check file size (very large files may timeout)
- Verify file type is supported (PDF, PPT, TXT)
- Check backend logs for errors

## Development Tools

### Backend

**View API Documentation:**
http://localhost:8000/docs

**Database Browser (SQLite):**
```bash
pip install sqlite-web
sqlite_web backend/flashcard.db
```

**Check Database:**
```bash
sqlite3 backend/flashcard.db
.tables
.schema users
SELECT * FROM users;
```

### Frontend

**React DevTools:**
Install browser extension: https://react.dev/learn/react-developer-tools

**View Network Requests:**
Open browser DevTools > Network tab

## Next Steps

1. **Sign up** for an account at http://localhost:5173/signup
2. **Upload** some study material
3. **Generate** flashcards
4. **Practice** with spaced repetition
5. Review the [TESTING.md](TESTING.md) guide for testing checklist

## Support

For issues or questions:
1. Check [TESTING.md](TESTING.md) for common solutions
2. Review [Readme.md](Readme.md) for feature documentation
3. Open an issue on GitHub

## Security Notes

⚠️ **Important for Production:**
- Change `SECRET_KEY` to a strong random value
- Use HTTPS in production
- Don't commit `.env` file to git
- Use strong database passwords
- Regularly update dependencies
- Set appropriate CORS origins
- Consider rate limiting for API endpoints
