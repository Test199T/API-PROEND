const axios = require('axios');

const baseURL = 'http://localhost:3000';

async function testSleepLogTrends() {
  try {
    console.log('🔍 Testing Sleep Log Trends & Analysis APIs...\n');

    // 1. Login
    console.log('1. Testing Login...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'ppansiun@outlook.com',
      password: 'awdawdasd'
    });
    
    const token = loginResponse.data.access_token;
    const userId = loginResponse.data.user.id;
    console.log('✅ Login successful');
    console.log(`User ID: ${userId}\n`);

    // 2. Check existing data first
    console.log('2. Checking existing sleep log data...');
    const getLogsResponse = await axios.get(`${baseURL}/sleep-log`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const totalLogs = getLogsResponse.data.data.total;
    const sleepLogs = getLogsResponse.data.data.sleep_logs;
    
    console.log(`✅ Total sleep logs: ${totalLogs}`);
    
    if (sleepLogs.length > 0) {
      // Check date range
      const dates = sleepLogs.map(log => new Date(log.sleep_date));
      const oldestDate = new Date(Math.min(...dates));
      const newestDate = new Date(Math.max(...dates));
      const daysDiff = Math.ceil((newestDate - oldestDate) / (1000 * 60 * 60 * 24));
      
      console.log(`📅 Date range: ${oldestDate.toISOString().split('T')[0]} to ${newestDate.toISOString().split('T')[0]}`);
      console.log(`📊 Days span: ${daysDiff} days`);
      console.log(`📈 Average logs per day: ${(totalLogs / Math.max(daysDiff, 1)).toFixed(2)}\n`);
    }

    // 3. Test trends API with different day ranges
    console.log('3. Testing Trends API...');
    
    const dayRanges = [7, 14, 30, 90];
    
    for (const days of dayRanges) {
      try {
        console.log(`\n📊 Testing trends for ${days} days...`);
        const trendsResponse = await axios.get(`${baseURL}/sleep-log/trends?days=${days}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`✅ Trends (${days} days): Success`);
        console.log(`   Data points: ${trendsResponse.data.data?.trends?.length || 0}`);
        console.log(`   Average sleep duration: ${trendsResponse.data.data?.average_sleep_duration || 'N/A'} hours`);
        console.log(`   Average sleep quality: ${trendsResponse.data.data?.average_sleep_quality || 'N/A'}`);
        
      } catch (error) {
        console.log(`❌ Trends (${days} days): Failed`);
        console.log(`   Status: ${error.response?.status}`);
        console.log(`   Error: ${error.response?.data?.message || error.message}`);
      }
    }

    // 4. Test analysis API
    console.log('\n4. Testing Analysis API...');
    
    for (const days of dayRanges) {
      try {
        console.log(`\n📈 Testing analysis for ${days} days...`);
        const analysisResponse = await axios.get(`${baseURL}/sleep-log/analysis?days=${days}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`✅ Analysis (${days} days): Success`);
        console.log(`   Total records analyzed: ${analysisResponse.data.data?.total_records || 0}`);
        console.log(`   Sleep score: ${analysisResponse.data.data?.sleep_score || 'N/A'}`);
        console.log(`   Recommendations: ${analysisResponse.data.data?.recommendations?.length || 0} items`);
        
      } catch (error) {
        console.log(`❌ Analysis (${days} days): Failed`);
        console.log(`   Status: ${error.response?.status}`);
        console.log(`   Error: ${error.response?.data?.message || error.message}`);
      }
    }

    // 5. Create sample data if needed
    if (totalLogs < 10) {
      console.log('\n5. Creating sample data for better testing...');
      
      const sampleDates = [];
      const today = new Date();
      
      // Create dates for the last 30 days
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        sampleDates.push(date.toISOString().split('T')[0]);
      }
      
      const sleepQualities = ['excellent', 'good', 'fair', 'poor', 'very_poor'];
      const bedtimes = ['21:00', '21:30', '22:00', '22:30', '23:00', '23:30'];
      const wakeTimes = ['05:30', '06:00', '06:30', '07:00', '07:30', '08:00'];
      
      let createdCount = 0;
      
      for (let i = 0; i < Math.min(20, sampleDates.length); i++) {
        try {
          const sleepData = {
            sleep_date: sampleDates[i],
            bedtime: bedtimes[Math.floor(Math.random() * bedtimes.length)],
            wake_time: wakeTimes[Math.floor(Math.random() * wakeTimes.length)],
            sleep_duration_hours: Math.floor(Math.random() * 4) + 6, // 6-10 hours
            sleep_quality: sleepQualities[Math.floor(Math.random() * sleepQualities.length)],
            notes: `Sample data for testing - Day ${i + 1}`
          };
          
          await axios.post(`${baseURL}/sleep-log`, sleepData, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          createdCount++;
          
        } catch (error) {
          console.log(`   ⚠️  Failed to create sample for ${sampleDates[i]}: ${error.response?.data?.message || error.message}`);
        }
      }
      
      console.log(`✅ Created ${createdCount} sample sleep logs`);
    }

    // 6. Test again with more data
    if (totalLogs < 10) {
      console.log('\n6. Re-testing with more data...');
      
      try {
        const trendsResponse = await axios.get(`${baseURL}/sleep-log/trends?days=30`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Trends (30 days) after sample data:');
        console.log(`   Data points: ${trendsResponse.data.data?.trends?.length || 0}`);
        console.log(`   Average sleep duration: ${trendsResponse.data.data?.average_sleep_duration || 'N/A'} hours`);
        
      } catch (error) {
        console.log('❌ Trends still failing:', error.response?.data?.message || error.message);
      }
    }

    console.log('\n🎉 Testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testSleepLogTrends();
