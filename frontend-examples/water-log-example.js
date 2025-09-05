/**
 * Water Log API Usage Examples
 * ตัวอย่างการใช้งาน Water Log API สำหรับ Frontend
 */

class WaterLogAPI {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

  /**
   * ส่ง HTTP request ไปยัง API
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  /**
   * สร้าง water log ใหม่
   */
  async createWaterLog(data) {
    return await this.request('/water-logs', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * ดึงข้อมูล water logs
   */
  async getWaterLogs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/water-logs?${queryString}`);
  }

  /**
   * ดึงข้อมูล water log ตาม ID
   */
  async getWaterLogById(id) {
    return await this.request(`/water-logs/${id}`);
  }

  /**
   * อัปเดต water log
   */
  async updateWaterLog(id, data) {
    return await this.request(`/water-logs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * ลบ water log
   */
  async deleteWaterLog(id) {
    return await this.request(`/water-logs/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * ดึงความคืบหน้าการดื่มน้ำวันนี้
   */
  async getTodayProgress() {
    return await this.request('/water-logs/progress/today');
  }

  /**
   * ดึงสถิติการดื่มน้ำรายวัน
   */
  async getDailyStats(date) {
    return await this.request(`/water-logs/stats/daily?date=${date}`);
  }

  /**
   * ดึงสถิติการดื่มน้ำรายสัปดาห์
   */
  async getWeeklyStats(startDate, endDate) {
    return await this.request(`/water-logs/stats/weekly?start_date=${startDate}&end_date=${endDate}`);
  }

  /**
   * ดึงเป้าหมายการดื่มน้ำรายวัน
   */
  async getDailyGoal() {
    return await this.request('/water-logs/goals/daily');
  }

  /**
   * ตั้งเป้าหมายการดื่มน้ำรายวัน
   */
  async setDailyGoal(goalMl, notes = '') {
    return await this.request('/water-logs/goals/daily', {
      method: 'POST',
      body: JSON.stringify({
        daily_goal_ml: goalMl,
        notes: notes
      })
    });
  }

  /**
   * ดึงแนวโน้มการดื่มน้ำ
   */
  async getConsumptionTrends(days = 30) {
    return await this.request(`/water-logs/trends/consumption?days=${days}`);
  }

  /**
   * ดึงข้อมูลเชิงลึกเกี่ยวกับการดื่มน้ำ
   */
  async getHydrationInsights() {
    return await this.request('/water-logs/insights/hydration');
  }
}

// ตัวอย่างการใช้งาน
async function waterLogExamples() {
  // เริ่มต้น API client
  const waterAPI = new WaterLogAPI('http://localhost:8080', 'your_jwt_token_here');

  try {
    console.log('=== Water Log API Examples ===\n');

    // 1. สร้าง water log ใหม่
    console.log('1. Creating a new water log...');
    const newLog = await waterAPI.createWaterLog({
      amount_ml: 250,
      drink_type: 'water',
      notes: 'Morning hydration',
      consumed_at: new Date().toISOString()
    });
    console.log('Created water log:', newLog.data);
    console.log('');

    // 2. ดึงข้อมูล water logs ทั้งหมด
    console.log('2. Getting all water logs...');
    const allLogs = await waterAPI.getWaterLogs({ limit: 5 });
    console.log('Recent water logs:', allLogs.data);
    console.log('');

    // 3. ดึงความคืบหน้าการดื่มน้ำวันนี้
    console.log('3. Getting today\'s progress...');
    const todayProgress = await waterAPI.getTodayProgress();
    console.log('Today\'s progress:', todayProgress.data);
    console.log('');

    // 4. ตั้งเป้าหมายการดื่มน้ำรายวัน
    console.log('4. Setting daily goal...');
    const goal = await waterAPI.setDailyGoal(2000, 'Recommended daily intake');
    console.log('Daily goal set:', goal.data);
    console.log('');

    // 5. ดึงสถิติการดื่มน้ำรายวัน
    console.log('5. Getting daily stats...');
    const today = new Date().toISOString().split('T')[0];
    const dailyStats = await waterAPI.getDailyStats(today);
    console.log('Daily stats:', dailyStats.data);
    console.log('');

    // 6. ดึงแนวโน้มการดื่มน้ำ
    console.log('6. Getting consumption trends...');
    const trends = await waterAPI.getConsumptionTrends(7);
    console.log('Weekly trends:', trends.data);
    console.log('');

    // 7. ดึงข้อมูลเชิงลึก
    console.log('7. Getting hydration insights...');
    const insights = await waterAPI.getHydrationInsights();
    console.log('Hydration insights:', insights.data);

  } catch (error) {
    console.error('Error in examples:', error.message);
  }
}

// ตัวอย่างการใช้งานใน React Component
const WaterLogComponentExample = {
  // State management
  state: {
    waterLogs: [],
    todayProgress: null,
    dailyGoal: null,
    loading: false,
    error: null
  },

  // Initialize API
  initAPI() {
    this.api = new WaterLogAPI('http://localhost:8080', localStorage.getItem('jwt_token'));
  },

  // Load initial data
  async loadData() {
    try {
      this.setState({ loading: true, error: null });
      
      const [progress, goal, logs] = await Promise.all([
        this.api.getTodayProgress(),
        this.api.getDailyGoal(),
        this.api.getWaterLogs({ limit: 10 })
      ]);

      this.setState({
        todayProgress: progress.data,
        dailyGoal: goal.data,
        waterLogs: logs.data,
        loading: false
      });
    } catch (error) {
      this.setState({ 
        error: error.message, 
        loading: false 
      });
    }
  },

  // Add water log
  async addWaterLog(amount, drinkType, notes = '') {
    try {
      this.setState({ loading: true });
      
      await this.api.createWaterLog({
        amount_ml: amount,
        drink_type: drinkType,
        notes: notes,
        consumed_at: new Date().toISOString()
      });

      // Refresh data
      await this.loadData();
    } catch (error) {
      this.setState({ 
        error: error.message, 
        loading: false 
      });
    }
  },

  // Update daily goal
  async updateDailyGoal(goalMl) {
    try {
      this.setState({ loading: true });
      
      await this.api.setDailyGoal(goalMl, 'Updated goal');
      await this.loadData();
    } catch (error) {
      this.setState({ 
        error: error.message, 
        loading: false 
      });
    }
  },

  // Delete water log
  async deleteWaterLog(logId) {
    try {
      this.setState({ loading: true });
      
      await this.api.deleteWaterLog(logId);
      await this.loadData();
    } catch (error) {
      this.setState({ 
        error: error.message, 
        loading: false 
      });
    }
  },

  // Utility functions
  getDrinkIcon(drinkType) {
    const icons = {
      water: '💧',
      tea: '🍵',
      coffee: '☕',
      juice: '🧃',
      sports_drink: '🥤',
      other: '🥤'
    };
    return icons[drinkType] || '🥤';
  },

  getDrinkTypeText(drinkType) {
    const types = {
      water: 'น้ำเปล่า',
      tea: 'ชา',
      coffee: 'กาแฟ',
      juice: 'น้ำผลไม้',
      sports_drink: 'เครื่องดื่มเกลือแร่',
      other: 'อื่นๆ'
    };
    return types[drinkType] || 'อื่นๆ';
  },

  formatTime(dateString) {
    return new Date(dateString).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  getProgressColor(percentage) {
    if (percentage >= 100) return '#4CAF50';
    if (percentage >= 75) return '#8BC34A';
    if (percentage >= 50) return '#FFC107';
    if (percentage >= 25) return '#FF9800';
    return '#F44336';
  }
};

// ตัวอย่างการใช้งานใน Vanilla JavaScript
class SimpleWaterTracker {
  constructor(apiBaseURL, token) {
    this.api = new WaterLogAPI(apiBaseURL, token);
    this.init();
  }

  async init() {
    await this.loadTodayProgress();
    this.setupEventListeners();
  }

  async loadTodayProgress() {
    try {
      const response = await this.api.getTodayProgress();
      this.updateProgressDisplay(response.data);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }

  updateProgressDisplay(progress) {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const remainingText = document.getElementById('remaining-text');

    if (progressBar) {
      progressBar.style.width = `${Math.min(progress.progress_percentage, 100)}%`;
    }

    if (progressText) {
      progressText.textContent = `${progress.consumed_ml}ml / ${progress.goal_ml}ml`;
    }

    if (remainingText) {
      remainingText.textContent = `เหลืออีก ${progress.remaining_ml}ml`;
    }
  }

  setupEventListeners() {
    // Quick add buttons
    document.querySelectorAll('.quick-add-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const amount = parseInt(e.target.dataset.amount);
        const drinkType = e.target.dataset.drinkType;
        
        try {
          await this.api.createWaterLog({
            amount_ml: amount,
            drink_type: drinkType,
            consumed_at: new Date().toISOString()
          });
          
          await this.loadTodayProgress();
          this.showSuccessMessage(`เพิ่ม ${amount}ml สำเร็จ!`);
        } catch (error) {
          this.showErrorMessage('เกิดข้อผิดพลาดในการบันทึก');
        }
      });
    });

    // Custom add form
    const customForm = document.getElementById('custom-water-form');
    if (customForm) {
      customForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const amount = parseInt(formData.get('amount'));
        const drinkType = formData.get('drinkType');
        const notes = formData.get('notes');

        try {
          await this.api.createWaterLog({
            amount_ml: amount,
            drink_type: drinkType,
            notes: notes,
            consumed_at: new Date().toISOString()
          });
          
          await this.loadTodayProgress();
          e.target.reset();
          this.showSuccessMessage(`เพิ่ม ${amount}ml สำเร็จ!`);
        } catch (error) {
          this.showErrorMessage('เกิดข้อผิดพลาดในการบันทึก');
        }
      });
    }
  }

  showSuccessMessage(message) {
    // Implement success message display
    console.log('Success:', message);
  }

  showErrorMessage(message) {
    // Implement error message display
    console.error('Error:', message);
  }
}

// ตัวอย่างการใช้งาน
// const tracker = new SimpleWaterTracker('http://localhost:8080', 'your_jwt_token');

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WaterLogAPI, WaterLogComponentExample, SimpleWaterTracker };
}

// Run examples if this file is executed directly
if (typeof window !== 'undefined' && window.location) {
  // Browser environment
  console.log('Water Log API examples loaded. Use waterLogExamples() to run examples.');
} else {
  // Node.js environment
  console.log('Water Log API examples loaded.');
}
