import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { practiceAPI, decksAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Flashcard, Deck } from '@/types';
import { ArrowLeft, Check, X } from 'lucide-react';

export default function Practice() {
  const { deckId } = useParams();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadCards();
  }, [deckId]);

  const loadCards = async () => {
    try {
      if (deckId) {
        const [deckData, cardsData] = await Promise.all([
          decksAPI.getById(parseInt(deckId)),
          practiceAPI.getDueCards(parseInt(deckId)),
        ]);
        setDeck(deckData);
        setCards(cardsData);
      } else {
        // Practice all due cards
        const cardsData = await practiceAPI.getTodaysReviews();
        setCards(cardsData);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load practice cards',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (remembered: boolean) => {
    if (!cards[currentIndex]) return;

    try {
      await practiceAPI.submitReview({
        flashcard_id: cards[currentIndex].id,
        remembered,
      });

      // Move to next card
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      } else {
        // Finished all cards
        toast({
          title: 'Great job!',
          description: 'You have completed all reviews for this session',
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit review',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">No Cards Due</h2>
          <p className="text-gray-600 mb-6">
            All cards in this deck have been reviewed. Come back later!
          </p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </main>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>
              {deck ? deck.name : 'Practice Session'}
            </span>
            <span>
              {currentIndex + 1} / {cards.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <Card className="mb-6">
          <CardContent className="p-12">
            <div
              className="cursor-pointer min-h-[300px] flex items-center justify-center"
              onClick={() => setShowAnswer(!showAnswer)}
            >
              {!showAnswer ? (
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-4">Question</p>
                  <h2 className="text-2xl font-medium">{currentCard.question}</h2>
                  <p className="text-sm text-gray-400 mt-6">Click to reveal answer</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-4">Answer</p>
                  <h2 className="text-2xl font-medium">{currentCard.answer}</h2>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Review Buttons */}
        {showAnswer && (
          <div className="flex gap-4 justify-center">
            <Button
              variant="destructive"
              size="lg"
              onClick={() => handleReview(false)}
              className="flex-1 max-w-xs"
            >
              <X className="h-5 w-5 mr-2" />
              Forgot
            </Button>
            <Button
              size="lg"
              onClick={() => handleReview(true)}
              className="flex-1 max-w-xs"
            >
              <Check className="h-5 w-5 mr-2" />
              Remembered
            </Button>
          </div>
        )}

        {!showAnswer && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowAnswer(true)}
            >
              Show Answer
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
