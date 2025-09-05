/**
 * Create Test Data for User ppansiun@outlook.com
 * สร้างข้อมูลทดสอบสำหรับ user ppansiun@outlook.com
 */

const API_BASE_URL = 'http://localhost:8080';

class TestDataCreator {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.jwtToken = null;
    this.userId = null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (this.jwtToken) {
      config.headers['Authorization'] = `Bearer ${this.jwtToken}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!data.success && data.message !== 'User not found') {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error(`API Request Error:`, error.message);
      throw error;
    }
  }

  // Login และรับ JWT token
  async login(email, password) {
    console.log(`🔐 Logging in as ${email}...`);
    
    try {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (response.success && response.data.token) {
        this.jwtToken = response.data.token;
        this.userId = response.data.user.id;
        console.log(`✅ Login successful! User ID: ${this.userId}`);
        return true;
      } else {
        console.log(`❌ Login failed: ${response.message}`);
        return false;
      }
    } catch (error) {
      console.log(`💥 Login error: ${error.message}`);
      return false;
    }
  }

  // สร้าง water log entries
  async createWaterLogs() {
    console.log(`\n💧 Creating water log entries...`);

    const waterLogs = [
      // 2024-01-15
      {
        amount_ml: 250,
        drink_type: 'water',
        notes: 'Morning hydration',
        consumed_at: '2024-01-15T07:00:00Z'
      },
      {
        amount_ml: 200,
        drink_type: 'coffee',
        notes: 'Morning coffee',
        consumed_at: '2024-01-15T08:30:00Z'
      },
      {
        amount_ml: 300,
        drink_type: 'water',
        notes: 'Lunch water',
        consumed_at: '2024-01-15T12:00:00Z'
      },
      {
        amount_ml: 400,
        drink_type: 'water',
        notes: 'Afternoon hydration',
        consumed_at: '2024-01-15T15:30:00Z'
      },
      {
        amount_ml: 250,
        drink_type: 'water',
        notes: 'Evening water',
        consumed_at: '2024-01-15T19:00:00Z'
      },
      // 2024-01-14
      {
        amount_ml: 300,
        drink_type: 'water',
        notes: 'Morning water',
        consumed_at: '2024-01-14T08:00:00Z'
      },
      {
        amount_ml: 150,
        drink_type: 'tea',
        notes: 'Green tea',
        consumed_at: '2024-01-14T10:30:00Z'
      },
      {
        amount_ml: 350,
        drink_type: 'water',
        notes: 'Lunch water',
        consumed_at: '2024-01-14T12:30:00Z'
      },
      {
        amount_ml: 200,
        drink_type: 'water',
        notes: 'Afternoon water',
        consumed_at: '2024-01-14T16:00:00Z'
      },
      // 2024-01-13
      {
        amount_ml: 400,
        drink_type: 'water',
        notes: 'Morning hydration',
        consumed_at: '2024-01-13T07:30:00Z'
      },
      {
        amount_ml: 250,
        drink_type: 'coffee',
        notes: 'Morning coffee',
        consumed_at: '2024-01-13T09:00:00Z'
      },
      {
        amount_ml: 500,
        drink_type: 'water',
        notes: 'Large bottle',
        consumed_at: '2024-01-13T14:00:00Z'
      },
      {
        amount_ml: 300,
        drink_type: 'water',
        notes: 'Evening water',
        consumed_at: '2024-01-13T18:30:00Z'
      },
      // 2024-01-12
      {
        amount_ml: 200,
        drink_type: 'water',
        notes: 'Morning water',
        consumed_at: '2024-01-12T08:00:00Z'
      },
      {
        amount_ml: 300,
        drink_type: 'water',
        notes: 'Mid-morning',
        consumed_at: '2024-01-12T11:00:00Z'
      },
      {
        amount_ml: 400,
        drink_type: 'water',
        notes: 'Lunch water',
        consumed_at: '2024-01-12T13:00:00Z'
      },
      {
        amount_ml: 250,
        drink_type: 'water',
        notes: 'Afternoon',
        consumed_at: '2024-01-12T15:30:00Z'
      },
      {
        amount_ml: 200,
        drink_type: 'water',
        notes: 'Evening',
        consumed_at: '2024-01-12T19:00:00Z'
      },
      // 2024-01-11
      {
        amount_ml: 350,
        drink_type: 'water',
        notes: 'Morning hydration',
        consumed_at: '2024-01-11T07:00:00Z'
      },
      {
        amount_ml: 200,
        drink_type: 'coffee',
        notes: 'Coffee break',
        consumed_at: '2024-01-11T10:00:00Z'
      },
      {
        amount_ml: 450,
        drink_type: 'water',
        notes: 'Lunch water',
        consumed_at: '2024-01-11T12:30:00Z'
      },
      {
        amount_ml: 300,
        drink_type: 'water',
        notes: 'Afternoon',
        consumed_at: '2024-01-11T16:00:00Z'
      },
      // 2024-01-10
      {
        amount_ml: 250,
        drink_type: 'water',
        notes: 'Morning water',
        consumed_at: '2024-01-10T08:00:00Z'
      },
      {
        amount_ml: 200,
        drink_type: 'tea',
        notes: 'Herbal tea',
        consumed_at: '2024-01-10T10:30:00Z'
      },
      {
        amount_ml: 400,
        drink_type: 'water',
        notes: 'Lunch water',
        consumed_at: '2024-01-10T12:00:00Z'
      },
      {
        amount_ml: 350,
        drink_type: 'water',
        notes: 'Afternoon hydration',
        consumed_at: '2024-01-10T15:00:00Z'
      },
      {
        amount_ml: 200,
        drink_type: 'water',
        notes: 'Evening water',
        consumed_at: '2024-01-10T18:00:00Z'
      },
      // 2024-01-09
      {
        amount_ml: 300,
        drink_type: 'water',
        notes: 'Morning water',
        consumed_at: '2024-01-09T07:30:00Z'
      },
      {
        amount_ml: 250,
        drink_type: 'coffee',
        notes: 'Morning coffee',
        consumed_at: '2024-01-09T09:00:00Z'
      },
      {
        amount_ml: 500,
        drink_type: 'water',
        notes: 'Large bottle',
        consumed_at: '2024-01-09T13:00:00Z'
      },
      {
        amount_ml: 300,
        drink_type: 'water',
        notes: 'Afternoon',
        consumed_at: '2024-01-09T16:30:00Z'
      },
      // 2024-01-08
      {
        amount_ml: 400,
        drink_type: 'water',
        notes: 'Morning hydration',
        consumed_at: '2024-01-08T08:00:00Z'
      },
      {
        amount_ml: 200,
        drink_type: 'water',
        notes: 'Mid-morning',
        consumed_at: '2024-01-08T11:00:00Z'
      },
      {
        amount_ml: 350,
        drink_type: 'water',
        notes: 'Lunch water',
        consumed_at: '2024-01-08T12:30:00Z'
      },
      {
        amount_ml: 250,
        drink_type: 'water',
        notes: 'Afternoon',
        consumed_at: '2024-01-08T15:00:00Z'
      },
      {
        amount_ml: 300,
        drink_type: 'water',
        notes: 'Evening water',
        consumed_at: '2024-01-08T18:30:00Z'
      }
    ];

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < waterLogs.length; i++) {
      const log = waterLogs[i];
      try {
        const response = await this.request('/water-logs', {
          method: 'POST',
          body: JSON.stringify(log)
        });

        if (response.success) {
          successCount++;
          console.log(`✅ Created log ${i + 1}: ${log.amount_ml}ml ${log.drink_type} at ${log.consumed_at.split('T')[0]}`);
        } else {
          failCount++;
          console.log(`❌ Failed to create log ${i + 1}: ${response.message}`);
        }
      } catch (error) {
        failCount++;
        console.log(`💥 Error creating log ${i + 1}: ${error.message}`);
      }

      // เพิ่ม delay เล็กน้อยเพื่อไม่ให้ server overload
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n📊 Water Log Creation Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📝 Total: ${waterLogs.length}`);

    return { successCount, failCount, total: waterLogs.length };
  }

  // ตั้ง daily water goal
  async setDailyGoal() {
    console.log(`\n🎯 Setting daily water goal...`);

    try {
      const response = await this.request('/water-logs/goals/daily', {
        method: 'POST',
        body: JSON.stringify({
          daily_goal_ml: 2000,
          notes: 'Recommended daily intake for testing'
        })
      });

      if (response.success) {
        console.log(`✅ Daily goal set to 2000ml`);
        return true;
      } else {
        console.log(`❌ Failed to set daily goal: ${response.message}`);
        return false;
      }
    } catch (error) {
      console.log(`💥 Error setting daily goal: ${error.message}`);
      return false;
    }
  }

  // ทดสอบ statistics endpoints
  async testStatistics() {
    console.log(`\n📊 Testing statistics endpoints...`);

    // Test Daily Stats
    try {
      const dailyResponse = await this.request('/water-logs/stats/daily?date=2024-01-15');
      if (dailyResponse.success) {
        const stats = dailyResponse.data;
        console.log(`✅ Daily Stats (2024-01-15):`);
        console.log(`   💧 Total: ${stats.totalConsumed}ml`);
        console.log(`   🎯 Goal: ${stats.goal}ml`);
        console.log(`   📈 Percentage: ${stats.percentage.toFixed(1)}%`);
        console.log(`   📝 Log Count: ${stats.logCount}`);
      } else {
        console.log(`❌ Daily stats failed: ${dailyResponse.message}`);
      }
    } catch (error) {
      console.log(`💥 Daily stats error: ${error.message}`);
    }

    // Test Weekly Stats
    try {
      const weeklyResponse = await this.request('/water-logs/stats/weekly?start_date=2024-01-08&end_date=2024-01-14');
      if (weeklyResponse.success) {
        const stats = weeklyResponse.data;
        console.log(`✅ Weekly Stats (2024-01-08 to 2024-01-14):`);
        console.log(`   💧 Weekly Total: ${stats.weeklyTotal}ml`);
        console.log(`   🎯 Weekly Goal: ${stats.weeklyGoal}ml`);
        console.log(`   📈 Weekly Percentage: ${stats.weeklyPercentage.toFixed(1)}%`);
        console.log(`   📈 Average Daily: ${stats.averageDaily.toFixed(1)}ml`);
        console.log(`   📝 Daily Stats Count: ${stats.dailyStats.length}`);
      } else {
        console.log(`❌ Weekly stats failed: ${weeklyResponse.message}`);
      }
    } catch (error) {
      console.log(`💥 Weekly stats error: ${error.message}`);
    }
  }

  // รันทั้งหมด
  async run() {
    console.log(`🚀 Creating test data for ppansiun@outlook.com`);
    console.log(`🌐 API Base URL: ${this.baseURL}`);
    console.log(`==========================================`);

    // 1. Login
    const loginSuccess = await this.login('ppansiun@outlook.com', 'adwawdasd');
    if (!loginSuccess) {
      console.log(`❌ Cannot proceed without authentication`);
      return;
    }

    // 2. Set daily goal
    await this.setDailyGoal();

    // 3. Create water logs
    const result = await this.createWaterLogs();

    // 4. Test statistics
    await this.testStatistics();

    console.log(`\n🎉 Test data creation completed!`);
    console.log(`📊 Summary:`);
    console.log(`   👤 User: ppansiun@outlook.com`);
    console.log(`   🆔 User ID: ${this.userId}`);
    console.log(`   💧 Water Logs: ${result.successCount}/${result.total} created`);
    console.log(`   🎯 Daily Goal: 2000ml`);
    console.log(`\n✨ You can now test the statistics endpoints!`);
  }
}

// รันสคริปต์
async function main() {
  const creator = new TestDataCreator(API_BASE_URL);
  await creator.run();
}

// Export สำหรับใช้ใน modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TestDataCreator };
}

// รันอัตโนมัติถ้าเรียกใช้โดยตรง
if (typeof window === 'undefined') {
  // Node.js environment
  main().catch(console.error);
} else {
  // Browser environment
  console.log('🌐 Test Data Creator loaded in browser');
  console.log('💡 Call main() to start creating test data');
}
