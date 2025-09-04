const axios = require('axios');

async function testSleepLogAPI() {
  const baseURL = 'http://localhost:3000';
  
  try {
    console.log('🔍 Testing Sleep Log API...\n');
    
    // Step 1: Login
    console.log('1. Testing Login...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'ppansiun@outlook.com',
      password: 'awdawdasd'
    });
    
    console.log('✅ Login successful');
    console.log('User ID:', loginResponse.data.user.id);
    console.log('Access Token:', loginResponse.data.access_token.substring(0, 50) + '...\n');
    
    const token = loginResponse.data.access_token;
    const userId = loginResponse.data.user.id;
    
    // Step 2: Test Health Check
    console.log('2. Testing Health Check...');
    const healthResponse = await axios.get(`${baseURL}/sleep-log/test/health-check`);
    console.log('✅ Health Check:', healthResponse.data.message, '\n');
    
    // Step 3: Get existing sleep logs
    console.log('3. Getting existing sleep logs...');
    try {
      const getResponse = await axios.get(`${baseURL}/sleep-log`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Get Sleep Logs:', getResponse.data.message);
      console.log('Total logs:', getResponse.data.data.total, '\n');
    } catch (error) {
      console.log('❌ Get Sleep Logs Error:', error.response?.data?.message || error.message, '\n');
    }
    
    // Step 4: Create sleep log with minimal data
    console.log('4. Creating sleep log with minimal data...');
    const sleepLogData = {
      sleep_date: '2024-01-15',
      bedtime: '22:30',
      wake_time: '06:30',
      sleep_duration_hours: 8,
      sleep_quality: 'good'
    };
    
    try {
      const createResponse = await axios.post(`${baseURL}/sleep-log`, sleepLogData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Create Sleep Log Success:', createResponse.data.message);
      console.log('Sleep Log ID:', createResponse.data.data.id, '\n');
    } catch (error) {
      console.log('❌ Create Sleep Log Error:');
      console.log('Status:', error.response?.status);
      console.log('Message:', error.response?.data?.message || error.message);
      console.log('Full Error:', JSON.stringify(error.response?.data, null, 2), '\n');
    }
    
    // Step 5: Test with more complete data
    console.log('5. Creating sleep log with complete data...');
    const completeSleepLogData = {
      sleep_date: '2024-01-16',
      bedtime: '23:00',
      wake_time: '07:00',
      sleep_duration_hours: 8,
      sleep_quality: 'excellent',
      sleep_efficiency_percentage: 90,
      time_to_fall_asleep_minutes: 10,
      awakenings_count: 0,
      notes: 'ทดสอบการสร้างข้อมูล sleep log'
    };
    
    try {
      const createCompleteResponse = await axios.post(`${baseURL}/sleep-log`, completeSleepLogData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Create Complete Sleep Log Success:', createCompleteResponse.data.message);
      console.log('Sleep Log ID:', createCompleteResponse.data.data.id, '\n');
    } catch (error) {
      console.log('❌ Create Complete Sleep Log Error:');
      console.log('Status:', error.response?.status);
      console.log('Message:', error.response?.data?.message || error.message);
      console.log('Full Error:', JSON.stringify(error.response?.data, null, 2), '\n');
    }
    
    // Step 6: Get sleep logs again to verify
    console.log('6. Getting sleep logs after creation...');
    try {
      const getAfterResponse = await axios.get(`${baseURL}/sleep-log`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Get Sleep Logs After Creation:', getAfterResponse.data.message);
      console.log('Total logs:', getAfterResponse.data.data.total);
      console.log('Sleep logs:', getAfterResponse.data.data.sleep_logs.length, '\n');
    } catch (error) {
      console.log('❌ Get Sleep Logs After Creation Error:', error.response?.data?.message || error.message, '\n');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testSleepLogAPI();
