import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadFile, generateFlashcards } from '../services/api';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [deckName, setDeckName] = useState('');
  const [deckDescription, setDeckDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [step, setStep] = useState(1); // 1: upload, 2: review text, 3: generating
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleFileUpload = async () => {
    if (!file && !text) {
      setError('Please select a file or paste text');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (file) {
        const response = await uploadFile(file);
        setExtractedText(response.data.extracted_text);
      } else {
        setExtractedText(text);
      }
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process file');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!deckName.trim()) {
      setError('Please enter a deck name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await generateFlashcards({
        text: extractedText,
        deck_name: deckName,
        deck_description: deckDescription
      });

      alert(`Successfully created ${response.data.flashcards_count} flashcards!`);
      navigate(`/deck/${response.data.deck_id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate flashcards');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Create Flashcards</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Step 1: Upload Study Material</h2>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Upload File (PDF, PPT, TXT)</label>
            <input
              type="file"
              accept=".pdf,.ppt,.pptx,.txt"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>

          <div className="mb-6">
            <p className="text-center text-gray-600 mb-2">OR</p>
            <label className="block text-gray-700 mb-2">Paste Text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded h-40"
              placeholder="Paste your study notes here..."
            />
          </div>

          <button
            onClick={handleFileUpload}
            disabled={loading || (!file && !text)}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Next'}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Step 2: Review & Name Your Deck</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Extracted Text (Preview)</label>
            <div className="p-3 bg-gray-100 rounded h-40 overflow-y-auto text-sm">
              {extractedText.substring(0, 500)}...
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Deck Name *</label>
            <input
              type="text"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="e.g., Biology Chapter 5"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Description (Optional)</label>
            <textarea
              value={deckDescription}
              onChange={(e) => setDeckDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded h-20"
              placeholder="Brief description of this deck..."
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
            >
              Back
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Generating Flashcards...' : 'Generate Flashcards'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
