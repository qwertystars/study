import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Subjects
export const getSubjects = () => api.get('/subjects');
export const getSubject = (id) => api.get(`/subjects/${id}`);
export const createSubject = (data) => api.post('/subjects', data);
export const updateSubject = (id, data) => api.put(`/subjects/${id}`, data);
export const deleteSubject = (id) => api.delete(`/subjects/${id}`);

// Flashcards
export const getFlashcards = (subjectId) =>
  api.get('/flashcards', { params: { subject_id: subjectId } });
export const getDueFlashcards = (subjectId) =>
  api.get('/flashcards/due', { params: { subject_id: subjectId } });
export const generateFlashcards = (subjectId, topic, numCards = 5) =>
  api.post(`/flashcards/generate?subject_id=${subjectId}&topic=${topic}&num_cards=${numCards}`);
export const reviewFlashcard = (id, quality) =>
  api.post(`/flashcards/${id}/review`, { quality });
export const deleteFlashcard = (id) => api.delete(`/flashcards/${id}`);

// Quizzes
export const getQuizzes = (subjectId) =>
  api.get('/quizzes', { params: { subject_id: subjectId } });
export const getQuiz = (id) => api.get(`/quizzes/${id}`);
export const generateQuiz = (data) => api.post('/quizzes/generate', data);
export const submitQuiz = (id, answers) => api.post(`/quizzes/${id}/submit`, { answers });
export const deleteQuiz = (id) => api.delete(`/quizzes/${id}`);

// Practice Problems
export const getPracticeProblems = (subjectId) =>
  api.get('/practice-problems', { params: { subject_id: subjectId } });
export const generatePracticeProblems = (data) =>
  api.post('/practice-problems/generate', data);
export const markProblemSolved = (id) =>
  api.post(`/practice-problems/${id}/solve`);
export const deletePracticeProblem = (id) =>
  api.delete(`/practice-problems/${id}`);

// Progress
export const getAllProgress = () => api.get('/progress');
export const getSubjectProgress = (subjectId) => api.get(`/progress/${subjectId}`);

// Study Sessions
export const getStudySessions = (subjectId) =>
  api.get('/study-sessions', { params: { subject_id: subjectId } });
export const createStudySession = (data) => api.post('/study-sessions', data);

export default api;
