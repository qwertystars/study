import axios from 'axios';
import type {
  User,
  Deck,
  Flashcard,
  Review,
  AuthTokens,
  LoginCredentials,
  SignupCredentials,
} from '@/types';

const API_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  signup: async (credentials: SignupCredentials): Promise<User> => {
    const { data } = await api.post<User>('/auth/signup', credentials);
    return data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
    const { data } = await api.post<AuthTokens>('/auth/login', credentials);
    return data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },
};

// Decks API
export const decksAPI = {
  getAll: async (): Promise<Deck[]> => {
    const { data } = await api.get<Deck[]>('/decks');
    return data;
  },

  getById: async (id: number): Promise<Deck> => {
    const { data } = await api.get<Deck>(`/decks/${id}`);
    return data;
  },

  create: async (deck: { name: string; description?: string }): Promise<Deck> => {
    const { data } = await api.post<Deck>('/decks', deck);
    return data;
  },

  update: async (id: number, deck: { name?: string; description?: string }): Promise<Deck> => {
    const { data } = await api.put<Deck>(`/decks/${id}`, deck);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/decks/${id}`);
  },
};

// Flashcards API
export const flashcardsAPI = {
  getByDeck: async (deckId: number): Promise<Flashcard[]> => {
    const { data } = await api.get<Flashcard[]>(`/flashcards/deck/${deckId}`);
    return data;
  },

  getById: async (id: number): Promise<Flashcard> => {
    const { data } = await api.get<Flashcard>(`/flashcards/${id}`);
    return data;
  },

  create: async (flashcard: {
    question: string;
    answer: string;
    deck_id: number;
  }): Promise<Flashcard> => {
    const { data } = await api.post<Flashcard>('/flashcards', flashcard);
    return data;
  },

  update: async (
    id: number,
    flashcard: { question?: string; answer?: string }
  ): Promise<Flashcard> => {
    const { data } = await api.put<Flashcard>(`/flashcards/${id}`, flashcard);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/flashcards/${id}`);
  },
};

// Practice API
export const practiceAPI = {
  getDueCards: async (deckId: number): Promise<Flashcard[]> => {
    const { data } = await api.get<Flashcard[]>(`/practice/deck/${deckId}/due`);
    return data;
  },

  getTodaysReviews: async (): Promise<Flashcard[]> => {
    const { data } = await api.get<Flashcard[]>('/practice/today');
    return data;
  },

  submitReview: async (review: { flashcard_id: number; remembered: boolean }): Promise<Review> => {
    const { data } = await api.post<Review>('/practice/review', review);
    return data;
  },
};

// Upload API
export const uploadAPI = {
  processFile: async (formData: FormData): Promise<Deck> => {
    const { data } = await api.post<Deck>('/upload/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  generateMore: async (deckId: number, text: string, numCards: number): Promise<Flashcard[]> => {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('num_cards', numCards.toString());

    const { data } = await api.post<Flashcard[]>(`/upload/generate-more/${deckId}`, formData);
    return data;
  },
};

export default api;
