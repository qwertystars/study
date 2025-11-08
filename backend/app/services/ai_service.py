import ollama
from typing import List, Dict, Any
from ..config import settings
import json


class AIService:
    """Service for interacting with Ollama LLM"""

    def __init__(self):
        self.client = ollama.Client(host=settings.OLLAMA_BASE_URL)
        self.model = settings.OLLAMA_MODEL

    def generate_flashcards(self, subject: str, topic: str, num_cards: int = 5) -> List[Dict[str, str]]:
        """Generate flashcards for a given subject and topic"""
        prompt = f"""Generate {num_cards} educational flashcards for {subject} on the topic of {topic}.

For each flashcard, provide:
- A clear, focused question
- A comprehensive but concise answer
- A difficulty level (easy, medium, or hard)

Return the response as a JSON array with objects containing 'question', 'answer', and 'difficulty' fields.

Example format:
[
  {{"question": "What is...", "answer": "...", "difficulty": "medium"}},
  ...
]

Only return the JSON array, no additional text."""

        try:
            response = self.client.generate(
                model=self.model,
                prompt=prompt,
            )

            # Parse the response
            content = response['response']
            # Try to extract JSON from the response
            start_idx = content.find('[')
            end_idx = content.rfind(']') + 1
            if start_idx != -1 and end_idx != 0:
                json_str = content[start_idx:end_idx]
                flashcards = json.loads(json_str)
                return flashcards
            else:
                # Fallback parsing
                return self._parse_flashcards_fallback(content, num_cards)
        except Exception as e:
            print(f"Error generating flashcards: {e}")
            return []

    def generate_practice_problems(self, subject: str, topic: str, difficulty: str, num_problems: int = 5) -> List[Dict[str, str]]:
        """Generate practice problems for a given subject and topic"""
        prompt = f"""Generate {num_problems} practice problems for {subject} on the topic of {topic} with {difficulty} difficulty.

For each problem, provide:
- A clear problem statement
- A detailed solution with step-by-step explanation
- Helpful hints (optional)

Return the response as a JSON array with objects containing 'question', 'solution', and 'hints' fields.

Example format:
[
  {{"question": "Solve...", "solution": "Step 1:... Step 2:...", "hints": "Remember to..."}},
  ...
]

Only return the JSON array, no additional text."""

        try:
            response = self.client.generate(
                model=self.model,
                prompt=prompt,
            )

            content = response['response']
            start_idx = content.find('[')
            end_idx = content.rfind(']') + 1
            if start_idx != -1 and end_idx != 0:
                json_str = content[start_idx:end_idx]
                problems = json.loads(json_str)
                return problems
            else:
                return []
        except Exception as e:
            print(f"Error generating practice problems: {e}")
            return []

    def generate_quiz_questions(self, subject: str, topic: str, difficulty: str, num_questions: int = 10) -> List[Dict[str, Any]]:
        """Generate multiple choice quiz questions"""
        prompt = f"""Generate {num_questions} multiple choice questions for {subject} on the topic of {topic} with {difficulty} difficulty.

For each question, provide:
- A clear question
- 4 answer options (labeled A, B, C, D)
- The correct answer (A, B, C, or D)
- An explanation of why the answer is correct

Return the response as a JSON array with objects containing 'question', 'options' (array of 4 strings), 'correct_answer' (A/B/C/D), and 'explanation' fields.

Example format:
[
  {{
    "question": "What is...",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correct_answer": "A",
    "explanation": "The answer is A because..."
  }},
  ...
]

Only return the JSON array, no additional text."""

        try:
            response = self.client.generate(
                model=self.model,
                prompt=prompt,
            )

            content = response['response']
            start_idx = content.find('[')
            end_idx = content.rfind(']') + 1
            if start_idx != -1 and end_idx != 0:
                json_str = content[start_idx:end_idx]
                questions = json.loads(json_str)
                return questions
            else:
                return []
        except Exception as e:
            print(f"Error generating quiz questions: {e}")
            return []

    def _parse_flashcards_fallback(self, content: str, num_cards: int) -> List[Dict[str, str]]:
        """Fallback parser if JSON parsing fails"""
        # Simple fallback - return empty for now
        # In production, you'd implement more robust parsing
        return []


# Singleton instance
ai_service = AIService()
