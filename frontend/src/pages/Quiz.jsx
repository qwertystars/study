import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Clock } from 'lucide-react';
import { getQuizzes, generateQuiz, deleteQuiz } from '../services/api';

function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    title: '',
    difficulty: 'medium',
    num_questions: 10
  });

  useEffect(() => {
    loadQuizzes();
  }, [id]);

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const response = await getQuizzes(id);
      setQuizzes(response.data);
    } catch (error) {
      console.error('Error loading quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await generateQuiz({
        subject_id: parseInt(id),
        title: generateForm.title,
        difficulty: generateForm.difficulty,
        num_questions: generateForm.num_questions
      });
      setShowGenerateModal(false);
      setGenerateForm({ title: '', difficulty: 'medium', num_questions: 10 });
      // Navigate to the quiz
      navigate(`/quiz/${response.data.id}`);
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz. Make sure Ollama is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await deleteQuiz(quizId);
        loadQuizzes();
      } catch (error) {
        console.error('Error deleting quiz:', error);
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link to={`/subjects/${id}`} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Quiz Mode</h2>
            <p className="text-gray-600">Test your knowledge</p>
          </div>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Sparkles className="w-5 h-5" />
          <span>Generate Quiz</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-12 card">
          <h3 className="text-xl font-medium text-gray-900 mb-2">No quizzes yet</h3>
          <p className="text-gray-600 mb-6">Generate a quiz to test your knowledge</p>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="btn-primary"
          >
            Generate Quiz
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{quiz.title}</h3>
                <span className={`badge badge-${quiz.difficulty}`}>
                  {quiz.difficulty}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600 text-sm">
                  <Clock className="w-4 h-4 mr-2" />
                  {quiz.total_questions} questions
                </div>
                {quiz.completed_at && (
                  <div className="text-sm">
                    <span className="text-gray-600">Score: </span>
                    <span className="font-bold text-primary-600">
                      {Math.round(quiz.score)}%
                    </span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Link
                  to={`/quiz/${quiz.id}`}
                  className="flex-1 text-center py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  {quiz.completed_at ? 'Review' : 'Start Quiz'}
                </Link>
                <button
                  onClick={() => handleDelete(quiz.id)}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Generate Quiz</h3>
            <form onSubmit={handleGenerate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={generateForm.title}
                    onChange={(e) => setGenerateForm({ ...generateForm, title: e.target.value })}
                    placeholder="e.g., Midterm Practice Quiz"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    className="input"
                    value={generateForm.difficulty}
                    onChange={(e) => setGenerateForm({ ...generateForm, difficulty: e.target.value })}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Questions
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="20"
                    className="input"
                    value={generateForm.num_questions}
                    onChange={(e) => setGenerateForm({ ...generateForm, num_questions: parseInt(e.target.value) })}
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

export default Quiz;
