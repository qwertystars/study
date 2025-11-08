import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDecks, deleteDeck, getDueFlashcards } from '../services/api';

const Dashboard = () => {
  const [decks, setDecks] = useState([]);
  const [dueCount, setDueCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [decksResponse, dueResponse] = await Promise.all([
        getDecks(),
        getDueFlashcards()
      ]);
      setDecks(decksResponse.data);
      setDueCount(dueResponse.data.length);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDeck = async (deckId) => {
    if (!window.confirm('Are you sure you want to delete this deck?')) {
      return;
    }

    try {
      await deleteDeck(deckId);
      setDecks(decks.filter(d => d.id !== deckId));
    } catch (err) {
      alert('Failed to delete deck');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Decks</h1>
        <Link
          to="/upload"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Create New Deck
        </Link>
      </div>

      {dueCount > 0 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
          <p className="font-bold">You have {dueCount} flashcard(s) due for review!</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {decks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-4">No decks yet. Create your first deck!</p>
          <Link
            to="/upload"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Get Started
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <div key={deck.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-2">{deck.name}</h3>
              {deck.description && (
                <p className="text-gray-600 mb-4">{deck.description}</p>
              )}
              <div className="text-sm text-gray-500 mb-4">
                Created: {new Date(deck.created_at).toLocaleDateString()}
              </div>
              <div className="flex space-x-2">
                <Link
                  to={`/deck/${deck.id}`}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded hover:bg-blue-700"
                >
                  View
                </Link>
                <Link
                  to={`/practice/${deck.id}`}
                  className="flex-1 px-4 py-2 bg-green-600 text-white text-center rounded hover:bg-green-700"
                >
                  Practice
                </Link>
                <button
                  onClick={() => handleDeleteDeck(deck.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
