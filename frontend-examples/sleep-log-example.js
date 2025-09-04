// Sleep Log API Usage Examples
// This file demonstrates how to use the Sleep Log API from a frontend application

const API_BASE_URL = 'http://localhost:3000';
let jwtToken = '';

// Helper function to get headers with authentication
function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}`,
  };
}

// 1. Authentication (Login to get JWT token)
async function login(username, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    jwtToken = data.data.access_token;
    console.log('Login successful, token saved');
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// 2. Create a new sleep log
async function createSleepLog(sleepData) {
  try {
    const response = await fetch(`${API_BASE_URL}/sleep-log`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(sleepData),
    });

    if (!response.ok) {
      throw new Error('Failed to create sleep log');
    }

    const data = await response.json();
    console.log('Sleep log created:', data);
    return data;
  } catch (error) {
    console.error('Create sleep log error:', error);
    throw error;
  }
}

// 3. Get all sleep logs with pagination and filters
async function getSleepLogs(options = {}) {
  try {
    const params = new URLSearchParams();
    
    // Add query parameters
    if (options.page) params.append('page', options.page);
    if (options.limit) params.append('limit', options.limit);
    if (options.sleep_quality) params.append('sleep_quality', options.sleep_quality);
    if (options.min_sleep_duration) params.append('min_sleep_duration', options.min_sleep_duration);
    if (options.max_sleep_duration) params.append('max_sleep_duration', options.max_sleep_duration);
    if (options.sleep_date_from) params.append('sleep_date_from', options.sleep_date_from);
    if (options.sleep_date_to) params.append('sleep_date_to', options.sleep_date_to);
    if (options.search) params.append('search', options.search);

    const url = `${API_BASE_URL}/sleep-log?${params.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sleep logs');
    }

    const data = await response.json();
    console.log('Sleep logs fetched:', data);
    return data;
  } catch (error) {
    console.error('Get sleep logs error:', error);
    throw error;
  }
}

// 4. Get a specific sleep log by ID
async function getSleepLogById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/sleep-log/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sleep log');
    }

    const data = await response.json();
    console.log('Sleep log fetched:', data);
    return data;
  } catch (error) {
    console.error('Get sleep log error:', error);
    throw error;
  }
}

// 5. Update a sleep log
async function updateSleepLog(id, updateData) {
  try {
    const response = await fetch(`${API_BASE_URL}/sleep-log/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error('Failed to update sleep log');
    }

    const data = await response.json();
    console.log('Sleep log updated:', data);
    return data;
  } catch (error) {
    console.error('Update sleep log error:', error);
    throw error;
  }
}

// 6. Delete a sleep log
async function deleteSleepLog(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/sleep-log/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete sleep log');
    }

    const data = await response.json();
    console.log('Sleep log deleted:', data);
    return data;
  } catch (error) {
    console.error('Delete sleep log error:', error);
    throw error;
  }
}

// 7. Get sleep statistics
async function getSleepStats(date = null) {
  try {
    const url = date 
      ? `${API_BASE_URL}/sleep-log/stats/overview?date=${date}`
      : `${API_BASE_URL}/sleep-log/stats/overview`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sleep stats');
    }

    const data = await response.json();
    console.log('Sleep stats:', data);
    return data;
  } catch (error) {
    console.error('Get sleep stats error:', error);
    throw error;
  }
}

// 8. Get sleep trends
async function getSleepTrends(days = 7) {
  try {
    const response = await fetch(`${API_BASE_URL}/sleep-log/trends?days=${days}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sleep trends');
    }

    const data = await response.json();
    console.log('Sleep trends:', data);
    return data;
  } catch (error) {
    console.error('Get sleep trends error:', error);
    throw error;
  }
}

// 9. Get sleep analysis
async function getSleepAnalysis(days = 30) {
  try {
    const response = await fetch(`${API_BASE_URL}/sleep-log/analysis?days=${days}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sleep analysis');
    }

    const data = await response.json();
    console.log('Sleep analysis:', data);
    return data;
  } catch (error) {
    console.error('Get sleep analysis error:', error);
    throw error;
  }
}

// 10. Get sleep recommendations
async function getSleepRecommendations() {
  try {
    const response = await fetch(`${API_BASE_URL}/sleep-log/recommendations`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sleep recommendations');
    }

    const data = await response.json();
    console.log('Sleep recommendations:', data);
    return data;
  } catch (error) {
    console.error('Get sleep recommendations error:', error);
    throw error;
  }
}

// 11. Search sleep logs by quality
async function searchSleepLogsByQuality(quality) {
  try {
    const response = await fetch(`${API_BASE_URL}/sleep-log/search/quality/${quality}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to search sleep logs by quality');
    }

    const data = await response.json();
    console.log('Sleep logs by quality:', data);
    return data;
  } catch (error) {
    console.error('Search sleep logs by quality error:', error);
    throw error;
  }
}

// 12. Search sleep logs by duration range
async function searchSleepLogsByDuration(minHours, maxHours) {
  try {
    const response = await fetch(`${API_BASE_URL}/sleep-log/search/duration/${minHours}/${maxHours}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to search sleep logs by duration');
    }

    const data = await response.json();
    console.log('Sleep logs by duration:', data);
    return data;
  } catch (error) {
    console.error('Search sleep logs by duration error:', error);
    throw error;
  }
}

// 13. Search sleep logs by date range
async function searchSleepLogsByDateRange(fromDate, toDate) {
  try {
    const response = await fetch(`${API_BASE_URL}/sleep-log/search/date-range?from=${fromDate}&to=${toDate}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to search sleep logs by date range');
    }

    const data = await response.json();
    console.log('Sleep logs by date range:', data);
    return data;
  } catch (error) {
    console.error('Search sleep logs by date range error:', error);
    throw error;
  }
}

// Example usage
async function exampleUsage() {
  try {
    // 1. Login first
    await login('testuser', 'testpassword');
    
    // 2. Create a sleep log
    const newSleepLog = await createSleepLog({
      sleep_date: '2024-01-15',
      bedtime: '22:30',
      wake_time: '06:30',
      sleep_duration_hours: 8,
      sleep_quality: 'good',
      sleep_efficiency_percentage: 85,
      time_to_fall_asleep_minutes: 15,
      awakenings_count: 1,
      deep_sleep_minutes: 120,
      light_sleep_minutes: 300,
      rem_sleep_minutes: 90,
      awake_minutes: 30,
      heart_rate_avg: 65,
      room_temperature_celsius: 22,
      caffeine_intake_mg: 0,
      alcohol_intake_ml: 0,
      exercise_before_bed_hours: 3,
      screen_time_before_bed_minutes: 30,
      stress_level: 3,
      mood_before_sleep: 7,
      mood_after_wake: 8,
      energy_level: 8,
      notes: 'นอนหลับได้ดี ตื่นขึ้นมาสดชื่น',
      dreams_remembered: true,
      nightmares: false,
    });
    
    // 3. Get all sleep logs
    const allLogs = await getSleepLogs({ page: 1, limit: 10 });
    
    // 4. Get sleep logs with filters
    const goodSleepLogs = await getSleepLogs({
      sleep_quality: 'good',
      min_sleep_duration: 7,
      max_sleep_duration: 9,
    });
    
    // 5. Get sleep statistics
    const stats = await getSleepStats();
    
    // 6. Get sleep trends
    const trends = await getSleepTrends(7);
    
    // 7. Get sleep analysis
    const analysis = await getSleepAnalysis(30);
    
    // 8. Get sleep recommendations
    const recommendations = await getSleepRecommendations();
    
    // 9. Search by quality
    const excellentSleepLogs = await searchSleepLogsByQuality('excellent');
    
    // 10. Search by duration
    const longSleepLogs = await searchSleepLogsByDuration(8, 10);
    
    // 11. Search by date range
    const recentLogs = await searchSleepLogsByDateRange('2024-01-01', '2024-01-31');
    
    console.log('All examples completed successfully!');
    
  } catch (error) {
    console.error('Example usage error:', error);
  }
}

// Sample sleep log data for testing
const sampleSleepLogData = {
  sleep_date: '2024-01-15',
  bedtime: '22:30',
  wake_time: '06:30',
  sleep_duration_hours: 8,
  sleep_quality: 'good',
  sleep_efficiency_percentage: 85,
  time_to_fall_asleep_minutes: 15,
  awakenings_count: 1,
  deep_sleep_minutes: 120,
  light_sleep_minutes: 300,
  rem_sleep_minutes: 90,
  awake_minutes: 30,
  heart_rate_avg: 65,
  heart_rate_min: 55,
  heart_rate_max: 75,
  oxygen_saturation_avg: 98,
  room_temperature_celsius: 22,
  noise_level_db: 35,
  light_level_lux: 5,
  caffeine_intake_mg: 0,
  alcohol_intake_ml: 0,
  exercise_before_bed_hours: 3,
  screen_time_before_bed_minutes: 30,
  sleep_aids_used: [],
  medications_taken: [],
  stress_level: 3,
  mood_before_sleep: 7,
  mood_after_wake: 8,
  energy_level: 8,
  notes: 'นอนหลับได้ดี ตื่นขึ้นมาสดชื่น',
  dreams_remembered: true,
  nightmares: false,
};

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    login,
    createSleepLog,
    getSleepLogs,
    getSleepLogById,
    updateSleepLog,
    deleteSleepLog,
    getSleepStats,
    getSleepTrends,
    getSleepAnalysis,
    getSleepRecommendations,
    searchSleepLogsByQuality,
    searchSleepLogsByDuration,
    searchSleepLogsByDateRange,
    exampleUsage,
    sampleSleepLogData,
  };
}
