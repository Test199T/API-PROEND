/**
 * Test Water Log Statistics Endpoints
 * ทดสอบ endpoints สำหรับ water log statistics
 */

const API_BASE_URL = 'http://localhost:8080';

// ตัวอย่าง JWT token (ต้องแทนที่ด้วย token จริง)
const JWT_TOKEN = 'your_jwt_token_here';

class WaterLogStatsTester {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

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
      console.log(`\n🔍 Testing: ${options.method || 'GET'} ${endpoint}`);
      const response = await fetch(url, config);
      const data = await response.json();
      
      console.log(`📊 Status: ${response.status}`);
      console.log(`📋 Response:`, JSON.stringify(data, null, 2));
      
      if (!data.success) {
        console.log(`❌ Error: ${data.message}`);
      } else {
        console.log(`✅ Success: ${data.message}`);
      }
      
      return data;
    } catch (error) {
      console.error(`💥 Request Error:`, error.message);
      throw error;
    }
  }

  // ทดสอบ Daily Stats
  async testDailyStats(date = '2024-01-15') {
    console.log('\n' + '='.repeat(60));
    console.log('📅 TESTING DAILY WATER STATS');
    console.log('='.repeat(60));
    
    try {
      const result = await this.request(`/water-logs/stats/daily?date=${date}`);
      
      if (result.success) {
        const stats = result.data;
        console.log('\n📈 Daily Stats Summary:');
        console.log(`   📅 Date: ${stats.date}`);
        console.log(`   💧 Total Consumed: ${stats.totalConsumed}ml`);
        console.log(`   🎯 Goal: ${stats.goal}ml`);
        console.log(`   📊 Percentage: ${stats.percentage.toFixed(1)}%`);
        console.log(`   📝 Log Count: ${stats.logCount}`);
        console.log(`   ⏳ Remaining: ${stats.remaining}ml`);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Daily Stats Test Failed:', error.message);
      return null;
    }
  }

  // ทดสอบ Weekly Stats
  async testWeeklyStats(startDate = '2024-01-08', endDate = '2024-01-14') {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TESTING WEEKLY WATER STATS');
    console.log('='.repeat(60));
    
    try {
      const result = await this.request(`/water-logs/stats/weekly?start_date=${startDate}&end_date=${endDate}`);
      
      if (result.success) {
        const stats = result.data;
        console.log('\n📈 Weekly Stats Summary:');
        console.log(`   📅 Period: ${stats.startDate} to ${stats.endDate}`);
        console.log(`   💧 Weekly Total: ${stats.weeklyTotal}ml`);
        console.log(`   🎯 Weekly Goal: ${stats.weeklyGoal}ml`);
        console.log(`   📊 Weekly Percentage: ${stats.weeklyPercentage.toFixed(1)}%`);
        console.log(`   📈 Average Daily: ${stats.averageDaily.toFixed(1)}ml`);
        console.log(`   📝 Daily Stats Count: ${stats.dailyStats.length}`);
        
        if (stats.dailyStats.length > 0) {
          console.log('\n📋 Daily Breakdown:');
          stats.dailyStats.forEach(day => {
            console.log(`   ${day.date}: ${day.totalAmount}ml (${day.logCount} entries)`);
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error('❌ Weekly Stats Test Failed:', error.message);
      return null;
    }
  }

  // สร้างข้อมูลทดสอบ
  async createTestData() {
    console.log('\n' + '='.repeat(60));
    console.log('🔧 CREATING TEST DATA');
    console.log('='.repeat(60));

    const testLogs = [
      {
        amount_ml: 250,
        drink_type: 'water',
        notes: 'Morning water',
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
      }
    ];

    console.log(`📝 Creating ${testLogs.length} test water logs...`);
    
    for (let i = 0; i < testLogs.length; i++) {
      try {
        const result = await this.request('/water-logs', {
          method: 'POST',
          body: JSON.stringify(testLogs[i])
        });
        
        if (result.success) {
          console.log(`✅ Created log ${i + 1}: ${testLogs[i].amount_ml}ml ${testLogs[i].drink_type}`);
        } else {
          console.log(`❌ Failed to create log ${i + 1}: ${result.message}`);
        }
      } catch (error) {
        console.log(`💥 Error creating log ${i + 1}: ${error.message}`);
      }
    }
  }

  // ทดสอบทั้งหมด
  async runAllTests() {
    console.log('🚀 Starting Water Log Statistics Tests...');
    console.log(`🌐 API Base URL: ${this.baseURL}`);
    console.log(`🔑 Using Token: ${this.token.substring(0, 20)}...`);

    try {
      // 1. สร้างข้อมูลทดสอบ
      await this.createTestData();
      
      // 2. ทดสอบ Daily Stats
      await this.testDailyStats('2024-01-15');
      
      // 3. ทดสอบ Weekly Stats
      await this.testWeeklyStats('2024-01-08', '2024-01-14');
      
      console.log('\n' + '='.repeat(60));
      console.log('🎉 ALL TESTS COMPLETED!');
      console.log('='.repeat(60));
      
    } catch (error) {
      console.error('\n💥 Test Suite Failed:', error.message);
    }
  }
}

// ฟังก์ชันสำหรับทดสอบแบบง่าย
async function quickTest() {
  console.log('🔍 Quick Test - Water Log Statistics Endpoints');
  console.log('='.repeat(50));
  
  const tester = new WaterLogStatsTester(API_BASE_URL, JWT_TOKEN);
  
  // ทดสอบ Daily Stats
  console.log('\n1️⃣ Testing Daily Stats...');
  await tester.testDailyStats('2024-01-15');
  
  // ทดสอบ Weekly Stats  
  console.log('\n2️⃣ Testing Weekly Stats...');
  await tester.testWeeklyStats('2024-01-08', '2024-01-14');
}

// ฟังก์ชันสำหรับทดสอบแบบครบครัน
async function fullTest() {
  console.log('🚀 Full Test Suite - Water Log Statistics');
  console.log('='.repeat(50));
  
  const tester = new WaterLogStatsTester(API_BASE_URL, JWT_TOKEN);
  await tester.runAllTests();
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WaterLogStatsTester, quickTest, fullTest };
}

// Auto-run if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  console.log('📋 Water Log Statistics Test Script Loaded');
  console.log('💡 Usage:');
  console.log('   - quickTest() - Run quick tests');
  console.log('   - fullTest() - Run full test suite with data creation');
  console.log('   - Make sure to update JWT_TOKEN before running tests');
} else {
  // Browser environment
  console.log('🌐 Water Log Statistics Test Script Loaded in Browser');
  console.log('💡 Call quickTest() or fullTest() to run tests');
}
