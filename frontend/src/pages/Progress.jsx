import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, BookOpen, Brain, FileText, Clock } from 'lucide-react';
import { getAllProgress, getSubjects } from '../services/api';

function Progress() {
  const [progress, setProgress] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [progressRes, subjectsRes] = await Promise.all([
        getAllProgress(),
        getSubjects()
      ]);
      setProgress(progressRes.data);
      setSubjects(subjectsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };

  const getSubjectColor = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.color : '#3B82F6';
  };

  const totalStats = progress.reduce((acc, p) => ({
    totalTime: acc.totalTime + (p.total_study_time || 0),
    totalFlashcards: acc.totalFlashcards + (p.flashcards_reviewed || 0),
    totalQuizzes: acc.totalQuizzes + (p.quizzes_completed || 0),
    totalProblems: acc.totalProblems + (p.problems_solved || 0),
  }), { totalTime: 0, totalFlashcards: 0, totalQuizzes: 0, totalProblems: 0 });

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Progress Overview</h2>
        <p className="text-gray-600">Track your learning journey across all subjects</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Study Time</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalTime}m</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Flashcards Reviewed</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalFlashcards}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Quizzes Completed</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalQuizzes}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Problems Solved</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalProblems}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Progress */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Subject Progress</h3>
        {progress.length === 0 ? (
          <div className="text-center py-12 card">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No progress data yet</h3>
            <p className="text-gray-600 mb-6">Start studying to track your progress</p>
            <Link to="/" className="btn-primary">
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {progress.map((p) => (
              <div key={p.id} className="card">
                <div
                  className="absolute top-0 left-0 w-full h-2 rounded-t-lg"
                  style={{ backgroundColor: getSubjectColor(p.subject_id) }}
                />
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-semibold text-gray-900">
                      {getSubjectName(p.subject_id)}
                    </h4>
                    <Link
                      to={`/subjects/${p.subject_id}`}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      View Subject →
                    </Link>
                  </div>

                  {/* Mastery Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Mastery Level</span>
                      <span className="text-sm font-bold text-primary-600">
                        {Math.round(p.mastery_level || 0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all"
                        style={{ width: `${p.mastery_level || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{p.total_study_time || 0}</p>
                      <p className="text-xs text-gray-600">Minutes Studied</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{p.flashcards_reviewed || 0}</p>
                      <p className="text-xs text-gray-600">Flashcards</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{p.quizzes_completed || 0}</p>
                      <p className="text-xs text-gray-600">Quizzes</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{p.problems_solved || 0}</p>
                      <p className="text-xs text-gray-600">Problems</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {Math.round(p.average_quiz_score || 0)}%
                      </p>
                      <p className="text-xs text-gray-600">Avg Quiz Score</p>
                    </div>
                  </div>

                  {p.last_studied && (
                    <p className="text-sm text-gray-500 mt-4">
                      Last studied: {new Date(p.last_studied).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Progress;
