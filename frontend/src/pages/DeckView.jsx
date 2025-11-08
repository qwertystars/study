import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getDeck, addFlashcard, updateFlashcard, deleteFlashcard } from '../services/api';

const DeckView = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [newCard, setNewCard] = useState({ question: '', answer: '' });

  useEffect(() => {
    fetchDeck();
  }, [deckId]);

  const fetchDeck = async () => {
    try {
      const response = await getDeck(deckId);
      setDeck(response.data);
    } catch (err) {
      setError('Failed to load deck');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async () => {
    if (!newCard.question.trim() || !newCard.answer.trim()) {
      alert('Please fill in both question and answer');
      return;
    }

    try {
      await addFlashcard(deckId, { ...newCard, deck_id: parseInt(deckId) });
      setNewCard({ question: '', answer: '' });
      setIsEditing(false);
      fetchDeck();
    } catch (err) {
      alert('Failed to add flashcard');
      console.error(err);
    }
  };

  const handleUpdateCard = async (cardId) => {
    if (!editingCard.question.trim() || !editingCard.answer.trim()) {
      alert('Please fill in both question and answer');
      return;
    }

    try {
      await updateFlashcard(cardId, { ...editingCard, deck_id: parseInt(deckId) });
      setEditingCard(null);
      fetchDeck();
    } catch (err) {
      alert('Failed to update flashcard');
      console.error(err);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('Are you sure you want to delete this flashcard?')) {
      return;
    }

    try {
      await deleteFlashcard(cardId);
      fetchDeck();
    } catch (err) {
      alert('Failed to delete flashcard');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error || !deck) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Deck not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-blue-600 hover:underline mb-4"
        >
          ← Back to Dashboard
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{deck.name}</h1>
            {deck.description && (
              <p className="text-gray-600">{deck.description}</p>
            )}
          </div>
          <Link
            to={`/practice/${deckId}`}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Practice
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Flashcards ({deck.flashcards.length})</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isEditing ? 'Cancel' : '+ Add Flashcard'}
          </button>
        </div>

        {isEditing && (
          <div className="bg-gray-50 p-4 rounded mb-4">
            <h3 className="font-semibold mb-2">New Flashcard</h3>
            <input
              type="text"
              placeholder="Question"
              value={newCard.question}
              onChange={(e) => setNewCard({ ...newCard, question: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
            />
            <textarea
              placeholder="Answer"
              value={newCard.answer}
              onChange={(e) => setNewCard({ ...newCard, answer: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded mb-2 h-24"
            />
            <button
              onClick={handleAddCard}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Add Card
            </button>
          </div>
        )}

        {deck.flashcards.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No flashcards yet. Add your first one!</p>
        ) : (
          <div className="space-y-4">
            {deck.flashcards.map((card) => (
              <div key={card.id} className="border border-gray-200 rounded p-4">
                {editingCard?.id === card.id ? (
                  <div>
                    <input
                      type="text"
                      value={editingCard.question}
                      onChange={(e) => setEditingCard({ ...editingCard, question: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
                    />
                    <textarea
                      value={editingCard.answer}
                      onChange={(e) => setEditingCard({ ...editingCard, answer: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded mb-2 h-24"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateCard(card.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingCard(null)}
                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-2">
                      <span className="font-semibold text-blue-600">Q:</span> {card.question}
                    </div>
                    <div className="mb-3">
                      <span className="font-semibold text-green-600">A:</span> {card.answer}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingCard(card)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeckView;
