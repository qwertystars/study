"""Spaced repetition algorithm (SM-2 simplified)"""
from datetime import datetime, timedelta
from typing import Tuple


class SpacedRepetition:
    """Simplified SM-2 spaced repetition algorithm"""

    @staticmethod
    def calculate_next_review(
        remembered: bool, current_interval: float = 1.0
    ) -> Tuple[datetime, float]:
        """
        Calculate next review date and new interval

        Args:
            remembered: Whether the user remembered the card
            current_interval: Current interval in days

        Returns:
            Tuple of (next_review_datetime, new_interval_days)
        """
        if remembered:
            # User remembered: double the interval
            new_interval = current_interval * 2
        else:
            # User forgot: reset to 1 day
            new_interval = 1.0

        # Calculate next review date
        next_review = datetime.utcnow() + timedelta(days=new_interval)

        return next_review, new_interval

    @staticmethod
    def get_initial_interval() -> Tuple[datetime, float]:
        """Get initial review interval (1 day)"""
        initial_interval = 1.0
        next_review = datetime.utcnow() + timedelta(days=initial_interval)
        return next_review, initial_interval

    @staticmethod
    def is_due(next_review: datetime) -> bool:
        """Check if a card is due for review"""
        return datetime.utcnow() >= next_review
