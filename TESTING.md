# Testing Guide

This document provides instructions for testing the Flashcard Study App.

## Quick Start Testing

### 1. Start Both Servers

Use the convenience script:
```bash
./start-dev.sh
```

Or manually:

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

### 2. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Manual Testing Checklist

### Authentication Flow
- [ ] Sign up with a new email and password
- [ ] Log out
- [ ] Log in with the credentials
- [ ] Verify token is stored in localStorage
- [ ] Verify protected routes redirect to login when not authenticated

### Dashboard
- [ ] View empty dashboard (no decks)
- [ ] Create a new deck via upload page
- [ ] Verify deck appears on dashboard
- [ ] Check that due cards count shows when cards need review

### File Upload & Flashcard Generation
- [ ] Upload a PDF file
- [ ] Upload a PowerPoint file (.pptx)
- [ ] Upload a text file (.txt)
- [ ] Paste text directly
- [ ] Verify text extraction works
- [ ] Name the deck and add description
- [ ] Generate flashcards (note: without LLM API key, uses simple fallback)
- [ ] Verify flashcards are created

### Deck Management
- [ ] Click "View" on a deck to see all flashcards
- [ ] Manually add a new flashcard
- [ ] Edit an existing flashcard
- [ ] Delete a flashcard
- [ ] Delete entire deck
- [ ] Verify changes persist after page reload

### Practice Mode
- [ ] Click "Practice" on a deck
- [ ] Read the question
- [ ] Click "Show Answer"
- [ ] Mark as "Remembered" or "Forgot"
- [ ] Verify next card appears
- [ ] Complete all cards in practice session
- [ ] Verify completion message

### Spaced Repetition
- [ ] Practice a card and mark as "Remembered"
- [ ] Note the card shouldn't appear immediately for review
- [ ] Practice a card and mark as "Forgot"
- [ ] Verify the card appears again soon (1 day interval)
- [ ] Check review schedule persists across sessions

## API Testing

### Using curl

**1. Signup:**
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**2. Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=password123"
```

**3. Create Deck:**
```bash
curl -X POST http://localhost:8000/api/decks/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Deck","description":"Test deck"}'
```

**4. Add Flashcard:**
```bash
curl -X POST http://localhost:8000/api/decks/1/flashcards \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question":"What is AI?","answer":"Artificial Intelligence","deck_id":1}'
```

**5. Upload File:**
```bash
curl -X POST http://localhost:8000/api/upload/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@path/to/file.pdf"
```

### Using the Interactive API Docs

Visit http://localhost:8000/docs for Swagger UI where you can:
1. Test all endpoints interactively
2. See request/response schemas
3. Authorize with JWT token
4. View example requests

## Test Data

### Sample Study Material (Text)

```
Machine Learning is a subset of artificial intelligence. It focuses on building systems that can learn from data. Supervised learning uses labeled data. Unsupervised learning works with unlabeled data. Neural networks are inspired by biological neurons. Deep learning uses multi-layer neural networks.
```

### Sample Questions for Manual Entry

1. **Q:** What is the capital of France?  
   **A:** Paris

2. **Q:** What year did World War II end?  
   **A:** 1945

3. **Q:** What is the speed of light?  
   **A:** 299,792,458 meters per second

4. **Q:** Who wrote Romeo and Juliet?  
   **A:** William Shakespeare

## Common Issues & Solutions

### Backend Issues

**Port 8000 already in use:**
```bash
# Find and kill the process
lsof -ti:8000 | xargs kill -9
```

**Database locked:**
```bash
# Remove the SQLite database and restart
rm backend/flashcard.db
```

**Missing dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

### Frontend Issues

**Port 5173 already in use:**
- Vite will automatically try the next available port (5174, etc.)

**Module not found:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Build errors:**
```bash
cd frontend
npm run build
```

### CORS Errors

- Ensure backend is running on port 8000
- Check `FRONTEND_URL` in backend `.env`
- Verify proxy settings in `frontend/vite.config.js`

## Performance Testing

### Test File Sizes
- Small PDF: < 1 MB (should process instantly)
- Medium PDF: 1-5 MB (should process in < 5 seconds)
- Large PDF: > 5 MB (may take 10+ seconds)

### Expected Response Times
- Authentication: < 500ms
- Deck operations: < 100ms
- File upload: varies by file size
- Flashcard generation with LLM: 2-5 seconds
- Flashcard generation without LLM: < 1 second

## Security Testing

- [ ] Verify JWT tokens expire after 30 minutes
- [ ] Attempt to access protected routes without token (should fail)
- [ ] Verify passwords are hashed in database
- [ ] Test SQL injection protection (use special characters in inputs)
- [ ] Verify file upload restrictions (file types, sizes)
- [ ] Test CORS policy (access from different origins)

## Browser Compatibility

Test on:
- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Mobile Responsiveness

Test responsive design on:
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

## Automated Testing (Future)

Currently, the app does not include automated tests. To add:

**Backend (pytest):**
```bash
cd backend
pip install pytest pytest-asyncio pytest-cov
pytest
```

**Frontend (Vitest):**
```bash
cd frontend
npm install --save-dev vitest @testing-library/react
npm run test
```

## Success Criteria

All features should work as described in the requirements:
- ✓ User signup and login
- ✓ File upload and text extraction
- ✓ Flashcard generation (AI or fallback)
- ✓ Deck management
- ✓ Practice mode with card flipping
- ✓ Spaced repetition scheduling
- ✓ Review tracking

## Reporting Issues

When reporting bugs, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser/OS information
5. Console errors (if any)
6. Network tab errors (if any)
