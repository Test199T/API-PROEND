// Health Goals API Usage Examples for Frontend
// Base URL: http://localhost:3000

// =====================================================
// CONFIGURATION
// =====================================================

const API_BASE_URL = 'http://localhost:3000';
const API_ENDPOINTS = {
  healthGoals: '/health-goals',
  testPublic: '/health-goals/test/public',
  testSampleData: '/health-goals/test/sample-data'
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

// Get JWT token from localStorage or other storage
const getAuthToken = () => {
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
};

// Set JWT token to storage
const setAuthToken = (token) => {
  localStorage.setItem('auth_token', token);
  sessionStorage.setItem('auth_token', token);
};

// Remove JWT token from storage
const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
  sessionStorage.removeItem('auth_token');
};

// Create headers with authentication
const createAuthHeaders = (includeContentType = false) => {
  const headers = {
    'Authorization': `Bearer ${getAuthToken()}`
  };
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
};

// =====================================================
// PUBLIC ENDPOINTS (NO AUTHENTICATION REQUIRED)
// =====================================================

// Test if API is working
export const testAPIHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.testPublic}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ API is working:', data.data.message);
      return data.data;
    } else {
      console.error('❌ API test failed:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ API connection error:', error);
    return null;
  }
};

// Get sample data for testing
export const getSampleData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.testSampleData}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Sample data retrieved:', data.data);
      return data.data;
    } else {
      console.error('❌ Failed to get sample data:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting sample data:', error);
    return null;
  }
};

// =====================================================
// PROTECTED ENDPOINTS (AUTHENTICATION REQUIRED)
// =====================================================

// Get all health goals
export const getAllHealthGoals = async (searchParams = {}) => {
  try {
    const queryString = new URLSearchParams(searchParams).toString();
    const url = `${API_BASE_URL}${API_ENDPOINTS.healthGoals}${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers: createAuthHeaders()
    });
    
    if (response.status === 401) {
      console.error('❌ Unauthorized - Please login again');
      removeAuthToken();
      return null;
    }
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Health goals retrieved:', data.data);
      return data.data;
    } else {
      console.error('❌ Failed to get health goals:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting health goals:', error);
    return null;
  }
};

// Get health goal by ID
export const getHealthGoalById = async (goalId) => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.healthGoals}/${goalId}`, {
      headers: createAuthHeaders()
    });
    
    if (response.status === 404) {
      console.error('❌ Health goal not found');
      return null;
    }
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Health goal retrieved:', data.data);
      return data.data;
    } else {
      console.error('❌ Failed to get health goal:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting health goal:', error);
    return null;
  }
};

// Create new health goal
export const createHealthGoal = async (goalData) => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.healthGoals}`, {
      method: 'POST',
      headers: createAuthHeaders(true),
      body: JSON.stringify(goalData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Health goal created:', data.data);
      return data.data;
    } else {
      console.error('❌ Failed to create health goal:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error creating health goal:', error);
    return null;
  }
};

// Update health goal
export const updateHealthGoal = async (goalId, updateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.healthGoals}/${goalId}`, {
      method: 'PUT',
      headers: createAuthHeaders(true),
      body: JSON.stringify(updateData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Health goal updated:', data.data);
      return data.data;
    } else {
      console.error('❌ Failed to update health goal:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error updating health goal:', error);
    return null;
  }
};

// Delete health goal
export const deleteHealthGoal = async (goalId) => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.healthGoals}/${goalId}`, {
      method: 'DELETE',
      headers: createAuthHeaders()
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Health goal deleted');
      return true;
    } else {
      console.error('❌ Failed to delete health goal:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Error deleting health goal:', error);
    return false;
  }
};

// Update goal progress
export const updateGoalProgress = async (goalId, currentValue) => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.healthGoals}/${goalId}/progress`, {
      method: 'PUT',
      headers: createAuthHeaders(true),
      body: JSON.stringify({ current_value: currentValue })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Goal progress updated:', data.data);
      return data.data;
    } else {
      console.error('❌ Failed to update goal progress:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error updating goal progress:', error);
    return null;
  }
};

// Get goal progress
export const getGoalProgress = async (goalId) => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.healthGoals}/${goalId}/progress`, {
      headers: createAuthHeaders()
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Goal progress retrieved:', data.data);
      return data.data;
    } else {
      console.error('❌ Failed to get goal progress:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting goal progress:', error);
    return null;
  }
};

// =====================================================
// GOAL STATUS MANAGEMENT
// =====================================================

// Complete goal
export const completeGoal = async (goalId) => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.healthGoals}/${goalId}/complete`, {
      method: 'PUT',
      headers: createAuthHeaders()
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Goal completed:', data.data);
      return data.data;
    } else {
      console.error('❌ Failed to complete goal:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error completing goal:', error);
    return null;
  }
};

// Pause goal
export const pauseGoal = async (goalId) => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.healthGoals}/${goalId}/pause`, {
      method: 'PUT',
      headers: createAuthHeaders()
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Goal paused:', data.data);
      return data.data;
    } else {
      console.error('❌ Failed to pause goal:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error pausing goal:', error);
    return null;
  }
};

// Resume goal
export const resumeGoal = async (goalId) => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.healthGoals}/${goalId}/resume`, {
      method: 'PUT',
      headers: createAuthHeaders()
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Goal resumed:', data.data);
      return data.data;
    } else {
      console.error('❌ Failed to resume goal:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error resuming goal:', error);
    return null;
  }
};

// Cancel goal
export const cancelGoal = async (goalId) => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.healthGoals}/${goalId}/cancel`, {
      method: 'PUT',
      headers: createAuthHeaders()
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Goal cancelled:', data.data);
      return data.data;
    } else {
      console.error('❌ Failed to cancel goal:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error cancelling goal:', error);
    return null;
  }
};

// =====================================================
// SEARCH & FILTER FUNCTIONS
// =====================================================

// Get active goals
export const getActiveGoals = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.healthGoals}/search/active`, {
      headers: createAuthHeaders()
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Active goals retrieved:', data.data);
      return data.data;
    } else {
      console.error('❌ Failed to get active goals:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting active goals:', error);
    return null;
  }
};

// Get completed goals
export const getCompletedGoals = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.healthGoals}/search/completed`, {
      headers: createAuthHeaders()
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Completed goals retrieved:', data.data);
      return data.data;
    } else {
      console.error('❌ Failed to get completed goals:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting completed goals:', error);
    return null;
  }
};

// Get goals by priority
export const getGoalsByPriority = async (priority) => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.healthGoals}/search/priority/${priority}`, {
      headers: createAuthHeaders()
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ ${priority} priority goals retrieved:`, data.data);
      return data.data;
    } else {
      console.error('❌ Failed to get goals by priority:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting goals by priority:', error);
    return null;
  }
};

// Get goals by type
export const getGoalsByType = async (type) => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.healthGoals}/search/type/${type}`, {
      headers: createAuthHeaders()
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ ${type} type goals retrieved:`, data.data);
      return data.data;
    } else {
      console.error('❌ Failed to get goals by type:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting goals by type:', error);
    return null;
  }
};

// =====================================================
// USAGE EXAMPLES
// =====================================================

// Example: Initialize and test API
export const initializeAPI = async () => {
  console.log('🚀 Initializing Health Goals API...');
  
  // Test API health
  const healthStatus = await testAPIHealth();
  if (!healthStatus) {
    console.error('❌ API is not available');
    return false;
  }
  
  // Get sample data
  const sampleData = await getSampleData();
  if (sampleData) {
    console.log('📊 Sample data available for testing');
  }
  
  console.log('✅ API initialization complete');
  return true;
};

// Example: Create a weight loss goal
export const createWeightLossGoal = async () => {
  const goalData = {
    goal_type: 'weight_loss',
    title: 'ลดน้ำหนัก 5 กิโลกรัม',
    description: 'ลดน้ำหนักเพื่อสุขภาพที่ดีขึ้น',
    target_value: 5,
    current_value: 0,
    unit: 'kg',
    start_date: '2024-01-01',
    target_date: '2024-06-01',
    priority: 'medium'
  };
  
  return await createHealthGoal(goalData);
};

// Example: Update goal progress
export const updateWeightLossProgress = async (goalId, currentWeight) => {
  return await updateGoalProgress(goalId, currentWeight);
};

// Example: Get all goals with filters
export const getFilteredGoals = async () => {
  const searchParams = {
    goal_type: 'weight_loss',
    status: 'active',
    priority: 'high',
    page: 1,
    limit: 10
  };
  
  return await getAllHealthGoals(searchParams);
};

// =====================================================
// ERROR HANDLING & VALIDATION
// =====================================================

// Validate goal data before sending
export const validateGoalData = (goalData) => {
  const errors = [];
  
  if (!goalData.title || goalData.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (!goalData.goal_type) {
    errors.push('Goal type is required');
  }
  
  if (!goalData.start_date) {
    errors.push('Start date is required');
  }
  
  if (goalData.target_value && goalData.target_value < 0) {
    errors.push('Target value must be positive');
  }
  
  if (goalData.current_value && goalData.current_value < 0) {
    errors.push('Current value must be positive');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Handle API errors
export const handleAPIError = (error, context = '') => {
  console.error(`❌ API Error in ${context}:`, error);
  
  if (error.status === 401) {
    console.error('Authentication required');
    // Redirect to login or show login modal
    return 'AUTH_REQUIRED';
  }
  
  if (error.status === 400) {
    console.error('Bad request - check your data');
    return 'BAD_REQUEST';
  }
  
  if (error.status === 404) {
    console.error('Resource not found');
    return 'NOT_FOUND';
  }
  
  if (error.status >= 500) {
    console.error('Server error');
    return 'SERVER_ERROR';
  }
  
  return 'UNKNOWN_ERROR';
};

// =====================================================
// EXPORT ALL FUNCTIONS
// =====================================================

export default {
  // Public endpoints
  testAPIHealth,
  getSampleData,
  
  // CRUD operations
  getAllHealthGoals,
  getHealthGoalById,
  createHealthGoal,
  updateHealthGoal,
  deleteHealthGoal,
  
  // Progress management
  updateGoalProgress,
  getGoalProgress,
  
  // Status management
  completeGoal,
  pauseGoal,
  resumeGoal,
  cancelGoal,
  
  // Search & filter
  getActiveGoals,
  getCompletedGoals,
  getGoalsByPriority,
  getGoalsByType,
  
  // Utility functions
  initializeAPI,
  createWeightLossGoal,
  updateWeightLossProgress,
  getFilteredGoals,
  validateGoalData,
  handleAPIError,
  
  // Configuration
  API_BASE_URL,
  API_ENDPOINTS
};
