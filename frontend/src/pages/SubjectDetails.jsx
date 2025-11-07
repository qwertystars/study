import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, Brain, FileText, TrendingUp, Clock } from 'lucide-react';
import { getSubject, getSubjectProgress } from '../services/api';

function SubjectDetails() {
  const { id } = useParams();
  const [subject, setSubject] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [subjectRes, progressRes] = await Promise.all([
        getSubject(id),
        getSubjectProgress(id)
      ]);
      setSubject(subjectRes.data);
      setProgress(progressRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!subject) {
    return <div className="text-center py-12">Subject not found</div>;
  }

  const features = [
    {
      title: 'Flashcards',
      description: 'Generate AI-powered flashcards with spaced repetition',
      icon: BookOpen,
      link: `/subjects/${id}/flashcards`,
      color: 'bg-blue-500',
      stats: `${progress?.flashcards_reviewed || 0} reviewed`
    },
    {
      title: 'Quiz Mode',
      description: 'Test your knowledge with adaptive quizzes',
      icon: Brain,
      link: `/subjects/${id}/quiz`,
      color: 'bg-green-500',
      stats: `${progress?.quizzes_completed || 0} completed`
    },
    {
      title: 'Practice Problems',
      description: 'Solve practice problems with detailed solutions',
      icon: FileText,
      link: `/subjects/${id}/practice`,
      color: 'bg-purple-500',
      stats: `${progress?.problems_solved || 0} solved`
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="card mb-8">
        <div
          className="absolute top-0 left-0 w-full h-2 rounded-t-lg"
          style={{ backgroundColor: subject.color }}
        />
        <div className="mt-2">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{subject.name}</h2>
          <p className="text-gray-600">{subject.description || 'No description'}</p>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Mastery Level</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(progress?.mastery_level || 0)}%
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Study Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {progress?.total_study_time || 0}m
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Flashcards</p>
              <p className="text-2xl font-bold text-gray-900">
                {progress?.flashcards_reviewed || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Quiz Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(progress?.average_quiz_score || 0)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Study Features */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Study Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.title}
                to={feature.link}
                className="card hover:shadow-lg transition-shadow group"
              >
                <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {feature.title}
                </h4>
                <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{feature.stats}</span>
                  <span className="text-primary-600 font-medium text-sm">Start →</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SubjectDetails;
