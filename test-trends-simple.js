const axios = require('axios');

async function testTrendsSimple() {
  try {
    console.log('🔍 Testing Sleep Log Trends API...\n');

    // 1. Login
    const loginResponse = await axios.post('http://localhost:3000/auth/login', {
      email: 'ppansiun@outlook.com',
      password: 'awdawdasd'
    });
    
    const token = loginResponse.data.access_token;
    const userId = loginResponse.data.user.id;
    console.log('✅ Login successful');
    console.log(`User ID: ${userId}\n`);

    // 2. Test different endpoints
    const endpoints = [
      { name: 'Trends 7 days', url: '/sleep-log/trends?days=7' },
      { name: 'Trends 30 days', url: '/sleep-log/trends?days=30' },
      { name: 'Analysis 7 days', url: '/sleep-log/analysis?days=7' },
      { name: 'Analysis 30 days', url: '/sleep-log/analysis?days=30' },
      { name: 'Stats overview', url: '/sleep-log/stats/overview' }
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`📊 Testing ${endpoint.name}...`);
        const response = await axios.get(`http://localhost:3000${endpoint.url}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`✅ ${endpoint.name}: Success`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Data points: ${response.data.data?.trends?.length || response.data.data?.total_records || 'N/A'}`);
        
        if (endpoint.name.includes('Trends')) {
          console.log(`   Trends: ${response.data.data?.trends?.length || 0} items`);
        }
        if (endpoint.name.includes('Analysis')) {
          console.log(`   Analysis: ${response.data.data?.total_records || 0} records`);
        }
        
      } catch (error) {
        console.log(`❌ ${endpoint.name}: Failed`);
        console.log(`   Status: ${error.response?.status}`);
        console.log(`   Error: ${error.response?.data?.message || error.message}`);
      }
      console.log('');
    }

    // 3. Check what data we have
    console.log('📋 Checking available data...');
    const getLogsResponse = await axios.get('http://localhost:3000/sleep-log', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const totalLogs = getLogsResponse.data.data.total;
    const sleepLogs = getLogsResponse.data.data.sleep_logs;
    
    console.log(`✅ Total sleep logs: ${totalLogs}`);
    
    if (sleepLogs.length > 0) {
      const dates = sleepLogs.map(log => new Date(log.sleep_date));
      const oldestDate = new Date(Math.min(...dates));
      const newestDate = new Date(Math.max(...dates));
      const daysDiff = Math.ceil((newestDate - oldestDate) / (1000 * 60 * 60 * 24));
      
      console.log(`📅 Date range: ${oldestDate.toISOString().split('T')[0]} to ${newestDate.toISOString().split('T')[0]}`);
      console.log(`📊 Days span: ${daysDiff} days`);
      
      // Show recent logs
      console.log('\n📋 Recent sleep logs:');
      sleepLogs.slice(-5).forEach(log => {
        console.log(`  ${log.sleep_date.split('T')[0]} - ${log.sleep_quality} - ${log.sleep_duration_hours}h`);
      });
    }

    console.log('\n🎉 Testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testTrendsSimple();
