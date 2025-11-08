import axios from 'axios';

const API_BASE_URL = '/api';

// Decks
export const getDecks = () => axios.get(`${API_BASE_URL}/decks/`);
export const getDeck = (deckId) => axios.get(`${API_BASE_URL}/decks/${deckId}`);
export const createDeck = (deck) => axios.post(`${API_BASE_URL}/decks/`, deck);
export const updateDeck = (deckId, deck) => axios.put(`${API_BASE_URL}/decks/${deckId}`, deck);
export const deleteDeck = (deckId) => axios.delete(`${API_BASE_URL}/decks/${deckId}`);

// Flashcards
export const getFlashcard = (flashcardId) => axios.get(`${API_BASE_URL}/flashcards/${flashcardId}`);
export const addFlashcard = (deckId, flashcard) => axios.post(`${API_BASE_URL}/decks/${deckId}/flashcards`, flashcard);
export const updateFlashcard = (flashcardId, flashcard) => axios.put(`${API_BASE_URL}/flashcards/${flashcardId}`, flashcard);
export const deleteFlashcard = (flashcardId) => axios.delete(`${API_BASE_URL}/flashcards/${flashcardId}`);

// Reviews
export const createReview = (review) => axios.post(`${API_BASE_URL}/reviews/`, review);
export const getDueFlashcards = () => axios.get(`${API_BASE_URL}/reviews/due`);
export const getDeckDueFlashcards = (deckId) => axios.get(`${API_BASE_URL}/reviews/deck/${deckId}/due`);

// Upload
export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post(`${API_BASE_URL}/upload/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const generateFlashcards = (data) => axios.post(`${API_BASE_URL}/upload/generate`, data);
