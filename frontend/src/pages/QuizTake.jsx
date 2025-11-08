import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { getQuiz, submitQuiz } from '../services/api';

function QuizTake() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      const response = await getQuiz(quizId);
      setQuiz(response.data);

      // Initialize answers for completed quiz
      if (response.data.completed_at) {
        const existingAnswers = {};
        response.data.questions.forEach((q) => {
          if (q.user_answer) {
            existingAnswers[q.id] = q.user_answer;
          }
        });
        setAnswers(existingAnswers);
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    if (quiz.completed_at) return; // Don't allow changes if already submitted
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quiz.questions.length) {
      if (!window.confirm('You haven\'t answered all questions. Submit anyway?')) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const response = await submitQuiz(quizId, answers);
      setQuiz(response.data);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!quiz) {
    return <div className="text-center py-12">Quiz not found</div>;
  }

  const isCompleted = quiz.completed_at !== null;
  const answeredCount = Object.keys(answers).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{quiz.title}</h2>
            <p className="text-gray-600">
              {isCompleted ? `Score: ${Math.round(quiz.score)}%` : `${answeredCount} / ${quiz.total_questions} answered`}
            </p>
          </div>
        </div>
        {!isCompleted && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {quiz.questions.map((question, index) => {
          const userAnswer = answers[question.id];
          const isCorrect = question.is_correct === 1;
          const isWrong = question.is_correct === 0;

          return (
            <div key={question.id} className="card">
              <div className="flex items-start space-x-3 mb-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-lg text-gray-900 font-medium">{question.question}</p>
                </div>
                {isCompleted && (
                  <div>
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : isWrong ? (
                      <XCircle className="w-6 h-6 text-red-600" />
                    ) : null}
                  </div>
                )}
              </div>

              <div className="space-y-2 ml-11">
                {question.options.map((option, optionIndex) => {
                  const optionLabel = String.fromCharCode(65 + optionIndex); // A, B, C, D
                  const isSelected = userAnswer === optionLabel;
                  const isCorrectOption = question.correct_answer === optionLabel;

                  let optionClass = 'p-4 border-2 rounded-lg cursor-pointer transition-colors ';
                  if (isCompleted) {
                    if (isCorrectOption) {
                      optionClass += 'border-green-500 bg-green-50';
                    } else if (isSelected && !isCorrectOption) {
                      optionClass += 'border-red-500 bg-red-50';
                    } else {
                      optionClass += 'border-gray-200';
                    }
                  } else {
                    optionClass += isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300';
                  }

                  return (
                    <div
                      key={optionIndex}
                      onClick={() => handleAnswerSelect(question.id, optionLabel)}
                      className={optionClass}
                    >
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 mr-3">{optionLabel}.</span>
                        <span className="text-gray-900">{option}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {isCompleted && question.explanation && (
                <div className="ml-11 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">Explanation:</p>
                  <p className="text-sm text-blue-800">{question.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isCompleted && (
        <div className="max-w-3xl mx-auto mt-8 card bg-gradient-to-r from-primary-50 to-blue-50">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h3>
          <p className="text-lg text-gray-700">
            You scored <span className="font-bold text-primary-600">{Math.round(quiz.score)}%</span>
          </p>
          <p className="text-gray-600 mt-2">
            {quiz.questions.filter(q => q.is_correct === 1).length} out of {quiz.total_questions} correct
          </p>
        </div>
      )}
    </div>
  );
}

export default QuizTake;
