import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Check, Eye, EyeOff } from 'lucide-react';
import { getPracticeProblems, generatePracticeProblems, markProblemSolved } from '../services/api';

function PracticeProblems() {
  const { id } = useParams();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [expandedProblem, setExpandedProblem] = useState(null);
  const [showSolution, setShowSolution] = useState({});
  const [generateForm, setGenerateForm] = useState({
    topic: '',
    difficulty: 'medium',
    num_problems: 5
  });

  useEffect(() => {
    loadProblems();
  }, [id]);

  const loadProblems = async () => {
    setLoading(true);
    try {
      const response = await getPracticeProblems(id);
      setProblems(response.data);
    } catch (error) {
      console.error('Error loading problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await generatePracticeProblems({
        subject_id: parseInt(id),
        topic: generateForm.topic,
        difficulty: generateForm.difficulty,
        num_problems: generateForm.num_problems
      });
      setShowGenerateModal(false);
      setGenerateForm({ topic: '', difficulty: 'medium', num_problems: 5 });
      loadProblems();
    } catch (error) {
      console.error('Error generating problems:', error);
      alert('Failed to generate problems. Make sure Ollama is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSolved = async (problemId) => {
    try {
      await markProblemSolved(problemId);
      loadProblems();
    } catch (error) {
      console.error('Error marking problem as solved:', error);
    }
  };

  const toggleSolution = (problemId) => {
    setShowSolution({ ...showSolution, [problemId]: !showSolution[problemId] });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link to={`/subjects/${id}`} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Practice Problems</h2>
            <p className="text-gray-600">Solve problems with detailed solutions</p>
          </div>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Sparkles className="w-5 h-5" />
          <span>Generate Problems</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : problems.length === 0 ? (
        <div className="text-center py-12 card">
          <h3 className="text-xl font-medium text-gray-900 mb-2">No practice problems yet</h3>
          <p className="text-gray-600 mb-6">Generate some problems to start practicing</p>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="btn-primary"
          >
            Generate Problems
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {problems.map((problem, index) => (
            <div key={problem.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3 flex-1">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {problem.topic && (
                        <span className="badge badge-medium text-xs">{problem.topic}</span>
                      )}
                      <span className={`badge badge-${problem.difficulty} text-xs`}>
                        {problem.difficulty}
                      </span>
                      {problem.is_solved && (
                        <span className="badge bg-green-100 text-green-800 text-xs">
                          Solved
                        </span>
                      )}
                    </div>
                    <p className="text-lg text-gray-900 whitespace-pre-wrap">{problem.question}</p>
                  </div>
                </div>
              </div>

              {problem.hints && (
                <div className="ml-11 mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-900 mb-1">Hints:</p>
                  <p className="text-sm text-yellow-800">{problem.hints}</p>
                </div>
              )}

              <div className="ml-11 flex items-center space-x-3">
                <button
                  onClick={() => toggleSolution(problem.id)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  {showSolution[problem.id] ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      <span>Hide Solution</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>Show Solution</span>
                    </>
                  )}
                </button>
                {!problem.is_solved && (
                  <button
                    onClick={() => handleMarkSolved(problem.id)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Mark as Solved</span>
                  </button>
                )}
              </div>

              {showSolution[problem.id] && (
                <div className="ml-11 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">Solution:</p>
                  <p className="text-sm text-blue-800 whitespace-pre-wrap">{problem.solution}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Generate Practice Problems</h3>
            <form onSubmit={handleGenerate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topic *
                  </label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={generateForm.topic}
                    onChange={(e) => setGenerateForm({ ...generateForm, topic: e.target.value })}
                    placeholder="e.g., Integration by Parts"
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
                    Number of Problems
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="input"
                    value={generateForm.num_problems}
                    onChange={(e) => setGenerateForm({ ...generateForm, num_problems: parseInt(e.target.value) })}
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

export default PracticeProblems;
