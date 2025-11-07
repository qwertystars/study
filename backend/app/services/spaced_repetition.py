from datetime import datetime, timedelta
from typing import Tuple


class SpacedRepetitionService:
    """Service for implementing SM-2 spaced repetition algorithm"""

    @staticmethod
    def calculate_next_review(
        quality: int,
        ease_factor: float,
        interval: int,
        repetitions: int
    ) -> Tuple[float, int, int, datetime]:
        """
        Calculate next review date using SM-2 algorithm

        Args:
            quality: Response quality (0-5)
            ease_factor: Current ease factor
            interval: Current interval in days
            repetitions: Number of consecutive successful repetitions

        Returns:
            Tuple of (new_ease_factor, new_interval, new_repetitions, next_review_date)
        """
        # Update ease factor
        new_ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        new_ease_factor = max(1.3, new_ease_factor)  # Minimum ease factor

        # Update repetitions and interval
        if quality < 3:
            # Reset if quality is too low
            new_repetitions = 0
            new_interval = 1
        else:
            new_repetitions = repetitions + 1
            if new_repetitions == 1:
                new_interval = 1
            elif new_repetitions == 2:
                new_interval = 6
            else:
                new_interval = int(interval * new_ease_factor)

        # Calculate next review date
        next_review = datetime.now() + timedelta(days=new_interval)

        return new_ease_factor, new_interval, new_repetitions, next_review


# Singleton instance
spaced_repetition_service = SpacedRepetitionService()
