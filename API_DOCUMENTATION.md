# API Documentation

Base URL: `http://localhost:8000/api`

## Subjects API

### List All Subjects
```http
GET /subjects
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Multivariable Calculus",
    "description": "Advanced calculus topics",
    "color": "#3B82F6",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": null
  }
]
```

### Get Subject by ID
```http
GET /subjects/{id}
```

### Create Subject
```http
POST /subjects
Content-Type: application/json

{
  "name": "Quantum Mechanics",
  "description": "Physics fundamentals",
  "color": "#10B981"
}
```

### Update Subject
```http
PUT /subjects/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

### Delete Subject
```http
DELETE /subjects/{id}
```

## Flashcards API

### List Flashcards
```http
GET /flashcards?subject_id=1
```

### Get Due Flashcards
```http
GET /flashcards/due?subject_id=1
```

### Generate Flashcards with AI
```http
POST /flashcards/generate?subject_id=1&topic=Partial%20Derivatives&num_cards=5
```

**Response:**
```json
[
  {
    "id": 1,
    "subject_id": 1,
    "question": "What is a partial derivative?",
    "answer": "A derivative of a function with respect to one variable...",
    "difficulty": "medium",
    "topic": "Partial Derivatives",
    "ease_factor": 2.5,
    "interval": 1,
    "repetitions": 0,
    "next_review": "2025-01-02T00:00:00Z",
    "created_at": "2025-01-01T00:00:00Z",
    "last_reviewed": null
  }
]
```

### Create Flashcard Manually
```http
POST /flashcards
Content-Type: application/json

{
  "subject_id": 1,
  "question": "What is integration?",
  "answer": "Integration is...",
  "difficulty": "easy",
  "topic": "Calculus Basics"
}
```

### Review Flashcard
```http
POST /flashcards/{id}/review
Content-Type: application/json

{
  "quality": 4
}
```

**Quality Scale:**
- 0-1: Again (completely forgot)
- 2: Hard (difficult to recall)
- 3-4: Good (recalled with effort)
- 5: Easy (recalled instantly)

### Update Flashcard
```http
PUT /flashcards/{id}
Content-Type: application/json

{
  "question": "Updated question",
  "answer": "Updated answer"
}
```

### Delete Flashcard
```http
DELETE /flashcards/{id}
```

## Quizzes API

### List Quizzes
```http
GET /quizzes?subject_id=1
```

### Get Quiz with Questions
```http
GET /quizzes/{id}
```

**Response:**
```json
{
  "id": 1,
  "subject_id": 1,
  "title": "Calculus Midterm Practice",
  "difficulty": "medium",
  "score": 85.0,
  "total_questions": 10,
  "completed_at": "2025-01-01T10:00:00Z",
  "created_at": "2025-01-01T09:00:00Z",
  "questions": [
    {
      "id": 1,
      "question": "What is the derivative of x^2?",
      "options": ["2x", "x^2", "2", "x"],
      "correct_answer": "A",
      "user_answer": "A",
      "explanation": "Using the power rule...",
      "is_correct": 1
    }
  ]
}
```

### Generate Quiz with AI
```http
POST /quizzes/generate
Content-Type: application/json

{
  "subject_id": 1,
  "title": "Calculus Practice Quiz",
  "difficulty": "medium",
  "num_questions": 10
}
```

**Difficulty Options:**
- `easy`
- `medium`
- `hard`

### Submit Quiz Answers
```http
POST /quizzes/{id}/submit
Content-Type: application/json

{
  "answers": {
    "1": "A",
    "2": "C",
    "3": "B"
  }
}
```

**Response:** Updated quiz with scores and correct answers

### Delete Quiz
```http
DELETE /quizzes/{id}
```

## Practice Problems API

### List Practice Problems
```http
GET /practice-problems?subject_id=1&difficulty=medium
```

### Get Practice Problem
```http
GET /practice-problems/{id}
```

**Response:**
```json
{
  "id": 1,
  "subject_id": 1,
  "question": "Solve the integral...",
  "solution": "Step 1: Apply substitution...",
  "difficulty": "medium",
  "topic": "Integration",
  "hints": "Try u-substitution",
  "is_solved": false,
  "created_at": "2025-01-01T00:00:00Z",
  "solved_at": null
}
```

### Generate Practice Problems with AI
```http
POST /practice-problems/generate
Content-Type: application/json

{
  "subject_id": 1,
  "topic": "Integration by Parts",
  "difficulty": "medium",
  "num_problems": 5
}
```

### Mark Problem as Solved
```http
POST /practice-problems/{id}/solve
```

### Delete Practice Problem
```http
DELETE /practice-problems/{id}
```

## Progress API

### Get All Progress
```http
GET /progress
```

**Response:**
```json
[
  {
    "id": 1,
    "subject_id": 1,
    "mastery_level": 75.5,
    "total_study_time": 120,
    "flashcards_reviewed": 45,
    "quizzes_completed": 5,
    "problems_solved": 12,
    "average_quiz_score": 82.5,
    "last_studied": "2025-01-01T10:00:00Z",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T10:00:00Z"
  }
]
```

### Get Subject Progress
```http
GET /progress/{subject_id}
```

## Study Sessions API

### List Study Sessions
```http
GET /study-sessions?subject_id=1
```

### Create Study Session
```http
POST /study-sessions
Content-Type: application/json

{
  "subject_id": 1,
  "duration": 60,
  "topics_covered": "Partial derivatives, chain rule",
  "notes": "Focused on practice problems"
}
```

### Delete Study Session
```http
DELETE /study-sessions/{id}
```

## Error Responses

### 404 Not Found
```json
{
  "detail": "Subject not found"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "detail": "Failed to generate flashcards"
}
```

## Rate Limits

Currently no rate limits are enforced. For production deployment, consider implementing rate limiting.

## Authentication

Currently no authentication is required. For production deployment with multiple users, implement JWT authentication.

## Interactive Documentation

Visit http://localhost:8000/docs for interactive Swagger UI documentation where you can test all endpoints directly.

Alternative documentation: http://localhost:8000/redoc

## Webhooks

Currently not implemented. Future feature for real-time updates.

## Pagination

Currently all list endpoints return all results. For production with large datasets, implement pagination:

```http
GET /flashcards?subject_id=1&page=1&limit=20
```

## Filtering and Sorting

**Filtering:**
```http
GET /flashcards?subject_id=1&difficulty=medium&topic=Calculus
```

**Sorting:**
```http
GET /quizzes?subject_id=1&sort=created_at&order=desc
```

(Note: Some filtering/sorting options may need to be implemented)

## Best Practices

1. **Always check response status codes**
2. **Handle errors gracefully**
3. **Use appropriate HTTP methods**
4. **Include Content-Type header for POST/PUT requests**
5. **Cache responses when appropriate**
6. **Implement retry logic for failed requests**

## Client Libraries

### Python Example
```python
import requests

BASE_URL = "http://localhost:8000/api"

# Get all subjects
response = requests.get(f"{BASE_URL}/subjects")
subjects = response.json()

# Generate flashcards
response = requests.post(
    f"{BASE_URL}/flashcards/generate",
    params={"subject_id": 1, "topic": "Calculus", "num_cards": 5}
)
flashcards = response.json()
```

### JavaScript Example
```javascript
const BASE_URL = "http://localhost:8000/api";

// Get all subjects
const response = await fetch(`${BASE_URL}/subjects`);
const subjects = await response.json();

// Create a subject
const response = await fetch(`${BASE_URL}/subjects`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Physics",
    description: "Quantum mechanics",
    color: "#10B981"
  })
});
const subject = await response.json();
```

## Versioning

Current version: v1 (no version prefix in URL)

Future versions may use:
- `/api/v2/subjects`
- Header-based versioning: `Accept: application/vnd.studyassistant.v2+json`

## Support

For API issues:
1. Check API documentation at /docs
2. Verify request payload matches schema
3. Check backend logs for detailed error messages
4. Ensure Ollama is running for AI features
