import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, RotateCw, Sparkles } from 'lucide-react';
import { getFlashcards, generateFlashcards, reviewFlashcard, getDueFlashcards } from '../services/api';

function Flashcards() {
  const { id } = useParams();
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    topic: '',
    numCards: 5
  });
  const [mode, setMode] = useState('all'); // 'all' or 'due'

  useEffect(() => {
    loadFlashcards();
  }, [id, mode]);

  const loadFlashcards = async () => {
    setLoading(true);
    try {
      const response = mode === 'due'
        ? await getDueFlashcards(id)
        : await getFlashcards(id);
      setFlashcards(response.data);
      setCurrentIndex(0);
      setFlipped(false);
    } catch (error) {
      console.error('Error loading flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await generateFlashcards(id, generateForm.topic, generateForm.numCards);
      setShowGenerateModal(false);
      setGenerateForm({ topic: '', numCards: 5 });
      loadFlashcards();
    } catch (error) {
      console.error('Error generating flashcards:', error);
      alert('Failed to generate flashcards. Make sure Ollama is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (quality) => {
    if (currentIndex >= flashcards.length) return;

    try {
      await reviewFlashcard(flashcards[currentIndex].id, quality);

      // Move to next card
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setFlipped(false);
      } else {
        // End of deck
        loadFlashcards();
      }
    } catch (error) {
      console.error('Error reviewing flashcard:', error);
    }
  };

  const currentCard = flashcards[currentIndex];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link to={`/subjects/${id}`} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Flashcards</h2>
            <p className="text-gray-600">Study with spaced repetition</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setMode(mode === 'all' ? 'due' : 'all')}
            className="btn-secondary flex items-center space-x-2"
          >
            <RotateCw className="w-5 h-5" />
            <span>{mode === 'all' ? 'Show Due Only' : 'Show All'}</span>
          </button>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>Generate Flashcards</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : flashcards.length === 0 ? (
        <div className="text-center py-12 card">
          <h3 className="text-xl font-medium text-gray-900 mb-2">No flashcards yet</h3>
          <p className="text-gray-600 mb-6">Generate some flashcards to get started</p>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="btn-primary"
          >
            Generate Flashcards
          </button>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="text-center mb-6">
            <p className="text-gray-600">
              Card {currentIndex + 1} of {flashcards.length}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Flashcard */}
          <div
            className="card cursor-pointer min-h-[300px] flex items-center justify-center relative"
            onClick={() => setFlipped(!flipped)}
          >
            <div className="text-center p-8">
              <p className="text-sm text-gray-500 mb-4">
                {flipped ? 'Answer' : 'Question'}
              </p>
              <p className="text-xl text-gray-900 mb-6">
                {flipped ? currentCard.answer : currentCard.question}
              </p>
              <p className="text-sm text-gray-400">
                Click to {flipped ? 'see question' : 'reveal answer'}
              </p>
            </div>
            {currentCard.topic && (
              <div className="absolute top-4 right-4">
                <span className="badge badge-medium">{currentCard.topic}</span>
              </div>
            )}
          </div>

          {/* Review Buttons */}
          {flipped && (
            <div className="mt-6 grid grid-cols-4 gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); handleReview(1); }}
                className="py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
              >
                Again
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleReview(2); }}
                className="py-3 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium"
              >
                Hard
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleReview(3); }}
                className="py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
              >
                Good
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleReview(5); }}
                className="py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
              >
                Easy
              </button>
            </div>
          )}
        </div>
      )}

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Generate Flashcards</h3>
            <form onSubmit={handleGenerate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topic *
                  </label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={generateForm.topic}
                    onChange={(e) => setGenerateForm({ ...generateForm, topic: e.target.value })}
                    placeholder="e.g., Partial Derivatives"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Cards
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    className="input"
                    value={generateForm.numCards}
                    onChange={(e) => setGenerateForm({ ...generateForm, numCards: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button type="submit" className="btn-primary flex-1" disabled={loading}>
                  {loading ? 'Generating...' : 'Generate'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="btn-secondary flex-1"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Flashcards;
