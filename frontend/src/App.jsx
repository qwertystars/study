import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SubjectDetails from './pages/SubjectDetails';
import Flashcards from './pages/Flashcards';
import Quiz from './pages/Quiz';
import QuizTake from './pages/QuizTake';
import PracticeProblems from './pages/PracticeProblems';
import Progress from './pages/Progress';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/subjects/:id" element={<SubjectDetails />} />
          <Route path="/subjects/:id/flashcards" element={<Flashcards />} />
          <Route path="/subjects/:id/quiz" element={<Quiz />} />
          <Route path="/quiz/:quizId" element={<QuizTake />} />
          <Route path="/subjects/:id/practice" element={<PracticeProblems />} />
          <Route path="/progress" element={<Progress />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
