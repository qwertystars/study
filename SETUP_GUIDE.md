# Quick Setup Guide

## For First-Time Users

### Step 1: Install Prerequisites

1. **Install Ollama**
   ```bash
   # Visit https://ollama.ai and download for your OS
   # After installation:
   ollama pull llama3.2
   ```

2. **Install PostgreSQL**
   ```bash
   # Ubuntu/Debian:
   sudo apt-get install postgresql postgresql-contrib

   # macOS:
   brew install postgresql

   # Start PostgreSQL:
   sudo systemctl start postgresql  # Linux
   brew services start postgresql   # macOS
   ```

3. **Install Python 3.11+**
   ```bash
   python3 --version  # Should be 3.11 or higher
   ```

4. **Install Node.js 18+**
   ```bash
   node --version  # Should be 18 or higher
   ```

### Step 2: Setup Database

```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE studyassistant;
CREATE USER studyuser WITH PASSWORD 'studypass';
GRANT ALL PRIVILEGES ON DATABASE studyassistant TO studyuser;
ALTER DATABASE studyassistant OWNER TO studyuser;
\q
```

### Step 3: Setup Backend

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env if you changed database credentials

# Run migrations
alembic upgrade head
```

### Step 4: Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install
```

### Step 5: Start Everything

```bash
# Terminal 1: Start Ollama (if not already running)
ollama serve

# Terminal 2: Start Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# Terminal 3: Start Frontend
cd frontend
npm run dev
```

### Step 6: Access the App

Open your browser and go to: http://localhost:5173

## Quick Start with Docker

If you have Docker installed:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Note**: Ollama must still be running on your host machine.

## First Steps in the App

1. Click "Add Subject" to create your first subject
2. Add subjects like:
   - Multivariable Calculus
   - Physics (Quantum Mechanics)
   - Data Structures
   - Etc.

3. Click on a subject and try:
   - Generate Flashcards
   - Generate a Quiz
   - Generate Practice Problems

4. Check the Progress page to see your stats!

## Common Issues

### "Ollama connection failed"
- Make sure Ollama is running: `ollama serve`
- Verify model is pulled: `ollama list`
- Pull the model: `ollama pull llama3.2`

### "Database connection error"
- Check PostgreSQL is running
- Verify credentials in backend/.env
- Ensure database exists

### "Port already in use"
- Backend (8000): Stop other apps using this port
- Frontend (5173): Change port in vite.config.js
- Database (5432): Check if another PostgreSQL instance is running

## Next Steps

- Read the full README.md for detailed documentation
- Explore API docs at http://localhost:8000/docs
- Customize prompts in backend/app/services/ai_service.py
- Adjust theme colors in frontend/tailwind.config.js

Happy studying! 📚
