"""AI service for generating flashcards from text"""
import json
from typing import List, Dict, Optional
import openai
from anthropic import Anthropic
from ..config import settings


class AIService:
    """Service for generating flashcards using AI"""

    def __init__(self):
        self.openai_key = settings.OPENAI_API_KEY
        self.anthropic_key = settings.ANTHROPIC_API_KEY

    def generate_flashcards(
        self, text: str, num_cards: int = 10, provider: str = "auto"
    ) -> List[Dict[str, str]]:
        """
        Generate flashcards from text using AI

        Args:
            text: The text to generate flashcards from
            num_cards: Number of flashcards to generate
            provider: AI provider to use (auto, openai, anthropic)

        Returns:
            List of flashcards with 'question' and 'answer' keys
        """
        # Determine which provider to use
        if provider == "auto":
            if self.openai_key:
                provider = "openai"
            elif self.anthropic_key:
                provider = "anthropic"
            else:
                raise ValueError("No AI API key configured")

        # Generate flashcards
        if provider == "openai":
            return self._generate_with_openai(text, num_cards)
        elif provider == "anthropic":
            return self._generate_with_anthropic(text, num_cards)
        else:
            raise ValueError(f"Unknown provider: {provider}")

    def _generate_with_openai(self, text: str, num_cards: int) -> List[Dict[str, str]]:
        """Generate flashcards using OpenAI API"""
        if not self.openai_key:
            raise ValueError("OpenAI API key not configured")

        openai.api_key = self.openai_key

        prompt = f"""You are a helpful study assistant. Generate {num_cards} flashcards from the following text.
Each flashcard should have a clear question and a concise answer.
Focus on key concepts, definitions, and important facts.

Text:
{text}

Return ONLY a JSON array of flashcards in this exact format:
[
  {{"question": "What is...", "answer": "..."}},
  {{"question": "Define...", "answer": "..."}}
]

Do not include any other text, explanations, or markdown formatting. Only the JSON array."""

        try:
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that generates study flashcards. Always respond with valid JSON only.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
            )

            content = response.choices[0].message.content.strip()

            # Parse JSON response
            flashcards = json.loads(content)

            # Validate format
            if not isinstance(flashcards, list):
                raise ValueError("Response is not a list")

            for card in flashcards:
                if "question" not in card or "answer" not in card:
                    raise ValueError("Invalid flashcard format")

            return flashcards[:num_cards]

        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse AI response as JSON: {str(e)}")
        except Exception as e:
            raise ValueError(f"Error generating flashcards with OpenAI: {str(e)}")

    def _generate_with_anthropic(self, text: str, num_cards: int) -> List[Dict[str, str]]:
        """Generate flashcards using Anthropic Claude API"""
        if not self.anthropic_key:
            raise ValueError("Anthropic API key not configured")

        client = Anthropic(api_key=self.anthropic_key)

        prompt = f"""Generate {num_cards} flashcards from the following text.
Each flashcard should have a clear question and a concise answer.
Focus on key concepts, definitions, and important facts.

Text:
{text}

Return ONLY a JSON array of flashcards in this exact format:
[
  {{"question": "What is...", "answer": "..."}},
  {{"question": "Define...", "answer": "..."}}
]

Do not include any other text, explanations, or markdown formatting. Only the JSON array."""

        try:
            response = client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=4096,
                messages=[{"role": "user", "content": prompt}],
            )

            content = response.content[0].text.strip()

            # Remove markdown code blocks if present
            if content.startswith("```json"):
                content = content.replace("```json", "").replace("```", "").strip()
            elif content.startswith("```"):
                content = content.replace("```", "").strip()

            # Parse JSON response
            flashcards = json.loads(content)

            # Validate format
            if not isinstance(flashcards, list):
                raise ValueError("Response is not a list")

            for card in flashcards:
                if "question" not in card or "answer" not in card:
                    raise ValueError("Invalid flashcard format")

            return flashcards[:num_cards]

        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse AI response as JSON: {str(e)}")
        except Exception as e:
            raise ValueError(f"Error generating flashcards with Anthropic: {str(e)}")

    def summarize_text(self, text: str, provider: str = "auto") -> str:
        """
        Summarize text into key points

        Args:
            text: The text to summarize
            provider: AI provider to use (auto, openai, anthropic)

        Returns:
            Summarized text
        """
        # Determine which provider to use
        if provider == "auto":
            if self.openai_key:
                provider = "openai"
            elif self.anthropic_key:
                provider = "anthropic"
            else:
                raise ValueError("No AI API key configured")

        prompt = f"""Summarize the following text into key points and concepts that would be useful for creating study flashcards:

{text}

Provide a concise summary of the main ideas, concepts, and facts."""

        if provider == "openai":
            openai.api_key = self.openai_key
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.5,
            )
            return response.choices[0].message.content.strip()

        elif provider == "anthropic":
            client = Anthropic(api_key=self.anthropic_key)
            response = client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=2048,
                messages=[{"role": "user", "content": prompt}],
            )
            return response.content[0].text.strip()
