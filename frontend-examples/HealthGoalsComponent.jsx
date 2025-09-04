import React, { useState, useEffect } from 'react';
import { 
  testAPIHealth, 
  getSampleData, 
  getAllHealthGoals, 
  createHealthGoal,
  updateGoalProgress,
  completeGoal,
  pauseGoal,
  resumeGoal,
  cancelGoal,
  deleteHealthGoal
} from './health-goals-example.js';

const HealthGoalsComponent = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState('unknown');
  const [sampleData, setSampleData] = useState(null);
  
  // Form state for creating new goals
  const [newGoal, setNewGoal] = useState({
    goal_type: 'weight_loss',
    title: '',
    description: '',
    target_value: '',
    current_value: '0',
    unit: 'kg',
    start_date: new Date().toISOString().split('T')[0],
    target_date: '',
    priority: 'medium'
  });

  // Initialize API and get sample data
  useEffect(() => {
    initializeAPI();
  }, []);

  const initializeAPI = async () => {
    setLoading(true);
    try {
      // Test API health
      const healthStatus = await testAPIHealth();
      if (healthStatus) {
        setApiStatus('healthy');
        
        // Get sample data
        const sample = await getSampleData();
        if (sample) {
          setSampleData(sample);
          setGoals(sample.goals);
        }
      } else {
        setApiStatus('unhealthy');
      }
    } catch (err) {
      setApiStatus('error');
      setError('Failed to initialize API');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGoal(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create new goal
  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Note: This will fail without authentication
      // In real app, you would have a valid JWT token
      const createdGoal = await createHealthGoal(newGoal);
      
      if (createdGoal) {
        setGoals(prev => [...prev, createdGoal]);
        // Reset form
        setNewGoal({
          goal_type: 'weight_loss',
          title: '',
          description: '',
          target_value: '',
          current_value: '0',
          unit: 'kg',
          start_date: new Date().toISOString().split('T')[0],
          target_date: '',
          priority: 'medium'
        });
      }
    } catch (err) {
      setError('Failed to create goal. Note: Authentication required for real API calls.');
    } finally {
      setLoading(false);
    }
  };

  // Update goal progress
  const handleUpdateProgress = async (goalId, newValue) => {
    setLoading(true);
    try {
      const updatedGoal = await updateGoalProgress(goalId, newValue);
      if (updatedGoal) {
        setGoals(prev => prev.map(goal => 
          goal.id === goalId ? updatedGoal : goal
        ));
      }
    } catch (err) {
      setError('Failed to update progress');
    } finally {
      setLoading(false);
    }
  };

  // Complete goal
  const handleCompleteGoal = async (goalId) => {
    setLoading(true);
    try {
      const completedGoal = await completeGoal(goalId);
      if (completedGoal) {
        setGoals(prev => prev.map(goal => 
          goal.id === goalId ? completedGoal : goal
        ));
      }
    } catch (err) {
      setError('Failed to complete goal');
    } finally {
      setLoading(false);
    }
  };

  // Pause goal
  const handlePauseGoal = async (goalId) => {
    setLoading(true);
    try {
      const pausedGoal = await pauseGoal(goalId);
      if (pausedGoal) {
        setGoals(prev => prev.map(goal => 
          goal.id === goalId ? pausedGoal : goal
        ));
      }
    } catch (err) {
      setError('Failed to pause goal');
    } finally {
      setLoading(false);
    }
  };

  // Resume goal
  const handleResumeGoal = async (goalId) => {
    setLoading(true);
    try {
      const resumedGoal = await resumeGoal(goalId);
      if (resumedGoal) {
        setGoals(prev => prev.map(goal => 
          goal.id === goalId ? resumedGoal : goal
        ));
      }
    } catch (err) {
      setError('Failed to resume goal');
    } finally {
      setLoading(false);
    }
  };

  // Cancel goal
  const handleCancelGoal = async (goalId) => {
    setLoading(true);
    try {
      const cancelledGoal = await cancelGoal(goalId);
      if (cancelledGoal) {
        setGoals(prev => prev.map(goal => 
          goal.id === goalId ? cancelledGoal : goal
        ));
      }
    } catch (err) {
      setError('Failed to cancel goal');
    } finally {
      setLoading(false);
    }
  };

  // Delete goal
  const handleDeleteGoal = async (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      setLoading(true);
      try {
        const success = await deleteHealthGoal(goalId);
        if (success) {
          setGoals(prev => prev.filter(goal => goal.id !== goalId));
        }
      } catch (err) {
        setError('Failed to delete goal');
      } finally {
        setLoading(false);
      }
    }
  };

  // Calculate progress percentage
  const calculateProgress = (current, target) => {
    if (!target || target === 0) return 0;
    return Math.round((current / target) * 100);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'completed': return 'text-blue-600';
      case 'paused': return 'text-yellow-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading && goals.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Health Goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Goals Dashboard</h1>
        <div className="flex items-center space-x-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            apiStatus === 'healthy' ? 'bg-green-100 text-green-800' :
            apiStatus === 'unhealthy' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            API Status: {apiStatus === 'healthy' ? 'Healthy' : apiStatus === 'unhealthy' ? 'Unhealthy' : 'Unknown'}
          </div>
          {sampleData && (
            <div className="text-sm text-gray-600">
              Sample Data: {sampleData.stats.total_goals} goals, {sampleData.stats.average_progress}% avg progress
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Create New Goal Form */}
      <div className="mb-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Health Goal</h2>
        <form onSubmit={handleCreateGoal} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal Type</label>
            <select
              name="goal_type"
              value={newGoal.goal_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="weight_loss">Weight Loss</option>
              <option value="weight_gain">Weight Gain</option>
              <option value="muscle_gain">Muscle Gain</option>
              <option value="endurance">Endurance</option>
              <option value="flexibility">Flexibility</option>
              <option value="stress_reduction">Stress Reduction</option>
              <option value="sleep_improvement">Sleep Improvement</option>
              <option value="nutrition">Nutrition</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={newGoal.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter goal title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              name="description"
              value={newGoal.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter goal description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Value</label>
            <input
              type="number"
              name="target_value"
              value={newGoal.target_value}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter target value"
              min="0"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <input
              type="text"
              name="unit"
              value={newGoal.unit}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="kg, lbs, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="start_date"
              value={newGoal.start_date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
            <input
              type="date"
              name="target_date"
              value={newGoal.target_date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              name="priority"
              value={newGoal.priority}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>

      {/* Goals List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Your Health Goals</h2>
          <p className="text-sm text-gray-600 mt-1">Manage and track your health goals</p>
        </div>

        {goals.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No health goals yet. Create your first goal above!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {goals.map((goal) => (
              <div key={goal.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{goal.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(goal.status)} bg-opacity-10`}>
                        {goal.status}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(goal.priority)} bg-opacity-10`}>
                        {goal.priority}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{goal.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="font-medium">{goal.goal_type.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Progress</p>
                        <p className="font-medium">{goal.current_value} / {goal.target_value} {goal.unit}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Start Date</p>
                        <p className="font-medium">{new Date(goal.start_date).toLocaleDateString()}</p>
                      </div>
                      {goal.target_date && (
                        <div>
                          <p className="text-sm text-gray-500">Target Date</p>
                          <p className="font-medium">{new Date(goal.target_date).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{calculateProgress(goal.current_value, goal.target_value)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${calculateProgress(goal.current_value, goal.target_value)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {goal.status === 'active' && (
                        <>
                          <button
                            onClick={() => handleUpdateProgress(goal.id, Math.min(goal.current_value + 1, goal.target_value))}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm"
                          >
                            + Progress
                          </button>
                          <button
                            onClick={() => handlePauseGoal(goal.id)}
                            className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 text-sm"
                          >
                            Pause
                          </button>
                          <button
                            onClick={() => handleCompleteGoal(goal.id)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
                          >
                            Complete
                          </button>
                        </>
                      )}
                      
                      {goal.status === 'paused' && (
                        <>
                          <button
                            onClick={() => handleResumeGoal(goal.id)}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm"
                          >
                            Resume
                          </button>
                          <button
                            onClick={() => handleCancelGoal(goal.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* API Information */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">API Information</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Base URL:</strong> http://localhost:3000</p>
          <p><strong>Main Endpoint:</strong> /health-goals</p>
          <p><strong>Test Endpoints:</strong> /health-goals/test/public, /health-goals/test/sample-data</p>
          <p><strong>Note:</strong> This demo uses sample data. Real API calls require JWT authentication.</p>
        </div>
      </div>
    </div>
  );
};

export default HealthGoalsComponent;
