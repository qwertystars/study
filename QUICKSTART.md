# 🚀 Quick Start Guide - Flashcard Study App

Get up and running in 5 minutes!

## Prerequisites

✅ Python 3.8+  
✅ Node.js 16+  
✅ npm or yarn

## Installation (One-Time Setup)

### 1. Clone Repository
```bash
git clone https://github.com/qwertystars/study.git
cd study
```

### 2. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
cd ..
```

### 3. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

## Running the Application

### Option A: Use the Quick Start Script (Recommended)
```bash
./start-dev.sh
```

### Option B: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Access the Application

🌐 **Frontend:** http://localhost:5173  
🔧 **Backend API:** http://localhost:8000  
📚 **API Docs:** http://localhost:8000/docs

## First Steps

1. **Sign Up** - Create an account at http://localhost:5173/signup
2. **Upload** - Click "Upload" and paste some study text or upload a file
3. **Generate** - Name your deck and generate flashcards
4. **Practice** - Click "Practice" to start studying with spaced repetition!

## Example Study Text

Try pasting this into the upload page:

```
Python is a high-level programming language. It emphasizes code 
readability and uses significant indentation. Python supports 
multiple programming paradigms including object-oriented and 
functional programming. It has a comprehensive standard library.
```

## Stopping the Application

Press `Ctrl+C` in both terminal windows to stop the servers.

## Configuration (Optional)

### Add AI Flashcard Generation

Edit `backend/.env`:
```env
LLM_API_KEY=your-openai-api-key
LLM_MODEL=gpt-3.5-turbo
```

The app works without this (uses fallback generation).

### Switch to PostgreSQL

Edit `backend/.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/flashcard_db
```

## Troubleshooting

**Port already in use?**
```bash
# Kill the process
lsof -ti:8000 | xargs kill -9  # Backend
lsof -ti:5173 | xargs kill -9  # Frontend
```

**Dependencies issue?**
```bash
# Reinstall
cd backend && pip install -r requirements.txt
cd ../frontend && rm -rf node_modules && npm install
```

**Need help?** Check [SETUP.md](SETUP.md) for detailed instructions.

## What's Next?

- 📖 Read the full [README](Readme.md)
- 🧪 Follow the [TESTING Guide](TESTING.md)
- 🔧 Review [SETUP Guide](SETUP.md) for advanced configuration
- 📊 Check [PROJECT_SUMMARY](PROJECT_SUMMARY.md) for technical details

---

**Enjoy studying with spaced repetition! 📚✨**
