import httpx
import json
from typing import List, Dict
from app.core.config import settings

async def generate_flashcards_from_text(text: str) -> List[Dict[str, str]]:
    """
    Generate flashcards from text using LLM API
    Returns a list of dicts with 'question' and 'answer' keys
    """
    if not settings.LLM_API_KEY:
        # Fallback: create simple flashcards by splitting into chunks
        return _generate_simple_flashcards(text)
    
    prompt = f"""You are a helpful assistant that creates educational flashcards.
Given the following study material, generate 5-10 flashcards as question-answer pairs.
Each flashcard should focus on a key concept, definition, or fact from the material.

Study Material:
{text[:3000]}  

Please respond with a JSON array of flashcards in this exact format:
[
  {{"question": "What is...", "answer": "It is..."}},
  {{"question": "Define...", "answer": "..."}}
]

Only return the JSON array, no additional text."""

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                settings.LLM_API_URL,
                headers={
                    "Authorization": f"Bearer {settings.LLM_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": settings.LLM_MODEL,
                    "messages": [
                        {"role": "system", "content": "You are a helpful assistant that creates educational flashcards."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.7
                }
            )
            response.raise_for_status()
            
            result = response.json()
            content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
            
            # Parse the JSON response
            # Find JSON array in the content
            start = content.find('[')
            end = content.rfind(']') + 1
            if start != -1 and end > start:
                json_str = content[start:end]
                flashcards = json.loads(json_str)
                return flashcards
            else:
                # Fallback if JSON parsing fails
                return _generate_simple_flashcards(text)
                
    except Exception as e:
        print(f"Error calling LLM API: {str(e)}")
        # Fallback to simple generation
        return _generate_simple_flashcards(text)

def _generate_simple_flashcards(text: str) -> List[Dict[str, str]]:
    """
    Simple fallback method to generate flashcards without LLM
    Splits text into sentences and creates basic Q&A pairs
    """
    sentences = [s.strip() for s in text.split('.') if len(s.strip()) > 20]
    flashcards = []
    
    for i, sentence in enumerate(sentences[:10]):  # Limit to 10 cards
        if len(sentence) > 30:
            # Split sentence into question and answer
            words = sentence.split()
            if len(words) > 10:
                question = f"What is mentioned about: {' '.join(words[:5])}...?"
                answer = sentence
                flashcards.append({"question": question, "answer": answer})
    
    # Ensure at least one flashcard
    if not flashcards and text:
        flashcards.append({
            "question": "What is the main content about?",
            "answer": text[:200] + "..." if len(text) > 200 else text
        })
    
    return flashcards
