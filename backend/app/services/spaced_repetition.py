from datetime import datetime, timedelta
from typing import Optional

def calculate_next_review(remembered: bool, current_interval_days: float = 1.0) -> tuple[float, datetime]:
    """
    Calculate next review interval and datetime using SM-2 simplified algorithm
    
    Args:
        remembered: Whether the user remembered the card
        current_interval_days: Current interval in days
    
    Returns:
        Tuple of (new_interval_days, next_review_datetime)
    """
    if remembered:
        # Double the interval if remembered
        new_interval = current_interval_days * 2
    else:
        # Reset to 1 day if forgot
        new_interval = 1.0
    
    # Calculate next review datetime
    next_review = datetime.utcnow() + timedelta(days=new_interval)
    
    return new_interval, next_review

def get_cards_due_for_review(reviews, current_datetime: Optional[datetime] = None):
    """
    Filter reviews that are due for review
    
    Args:
        reviews: List of Review objects
        current_datetime: Current datetime (defaults to now)
    
    Returns:
        List of reviews due for review
    """
    if current_datetime is None:
        current_datetime = datetime.utcnow()
    
    return [review for review in reviews if review.next_review <= current_datetime]
