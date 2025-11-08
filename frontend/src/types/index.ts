export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface Deck {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  card_count?: number;
  due_count?: number;
}

export interface Flashcard {
  id: number;
  deck_id: number;
  question: string;
  answer: string;
  created_at: string;
  updated_at?: string;
  next_review?: string;
  interval_days?: number;
}

export interface Review {
  id: number;
  flashcard_id: number;
  user_id: number;
  remembered: boolean;
  interval_days: number;
  next_review: string;
  reviewed_at: string;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
}
