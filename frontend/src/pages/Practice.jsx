import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDeckDueFlashcards, createReview } from '../services/api';

const Practice = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetchFlashcards();
  }, [deckId]);

  const fetchFlashcards = async () => {
    try {
      const response = await getDeckDueFlashcards(deckId);
      if (response.data.length === 0) {
        setCompleted(true);
      } else {
        setFlashcards(response.data);
      }
    } catch (err) {
      setError('Failed to load flashcards');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (remembered) => {
    const currentCard = flashcards[currentIndex];

    try {
      await createReview({
        flashcard_id: currentCard.id,
        remembered: remembered
      });

      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      } else {
        setCompleted(true);
      }
    } catch (err) {
      alert('Failed to save review');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (completed || flashcards.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">🎉 Great Job!</h2>
          <p className="text-gray-600 mb-6">
            {flashcards.length === 0
              ? 'No cards due for review right now. Check back later!'
              : 'You\'ve completed all cards for now!'}
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate(`/deck/${deckId}`)}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View Deck
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={() => navigate(`/deck/${deckId}`)}
          className="text-blue-600 hover:underline"
        >
          ← Back to Deck
        </button>
        <span className="text-gray-600">
          Card {currentIndex + 1} of {flashcards.length}
        </span>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 min-h-[400px] flex flex-col">
        <div className="flex-1 flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">QUESTION</h3>
            <p className="text-xl font-medium">{currentCard.question}</p>
          </div>

          {showAnswer && (
            <div className="border-t pt-6 animate-fadeIn">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">ANSWER</h3>
              <p className="text-xl">{currentCard.answer}</p>
            </div>
          )}
        </div>

        <div className="mt-6">
          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-medium"
            >
              Show Answer
            </button>
          ) : (
            <div>
              <p className="text-center text-gray-600 mb-3">Did you remember?</p>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleReview(false)}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 text-lg font-medium"
                >
                  ❌ Forgot
                </button>
                <button
                  onClick={() => handleReview(true)}
                  className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 text-lg font-medium"
                >
                  ✓ Remembered
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default Practice;
