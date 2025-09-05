const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testWaterLogAPI() {
  try {
    console.log('🚀 Testing Water Log API...\n');

    // Step 1: Login
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'ppansiun@outlook.com',
        password: 'adwawdasd'
      })
    });

    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      console.log('❌ Login failed:', errorData);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.data?.access_token;
    
    if (!token) {
      console.log('❌ No token received:', loginData);
      return;
    }

    console.log('✅ Login successful');
    console.log('Token:', token.substring(0, 50) + '...\n');

    // Step 2: Test Daily Stats
    console.log('2. Testing Daily Water Stats...');
    const dailyStatsResponse = await fetch(`${BASE_URL}/water-logs/stats/daily?date=2024-01-15`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const dailyStatsData = await dailyStatsResponse.json();
    console.log('Daily Stats Response:', JSON.stringify(dailyStatsData, null, 2));
    console.log('');

    // Step 3: Test Weekly Stats
    console.log('3. Testing Weekly Water Stats...');
    const weeklyStatsResponse = await fetch(`${BASE_URL}/water-logs/stats/weekly?start_date=2024-01-08&end_date=2024-01-14`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const weeklyStatsData = await weeklyStatsResponse.json();
    console.log('Weekly Stats Response:', JSON.stringify(weeklyStatsData, null, 2));
    console.log('');

    // Step 4: Test Daily Goal
    console.log('4. Testing Daily Water Goal...');
    const dailyGoalResponse = await fetch(`${BASE_URL}/water-logs/goals/daily`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const dailyGoalData = await dailyGoalResponse.json();
    console.log('Daily Goal Response:', JSON.stringify(dailyGoalData, null, 2));
    console.log('');

    // Step 5: Set Daily Goal
    console.log('5. Setting Daily Water Goal...');
    const setGoalResponse = await fetch(`${BASE_URL}/water-logs/goals/daily`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        daily_goal_ml: 2500,
        notes: 'Test goal setting'
      })
    });

    const setGoalData = await setGoalResponse.json();
    console.log('Set Goal Response:', JSON.stringify(setGoalData, null, 2));
    console.log('');

    // Step 6: Test Today's Progress
    console.log('6. Testing Today\'s Water Progress...');
    const progressResponse = await fetch(`${BASE_URL}/water-logs/progress/today`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const progressData = await progressResponse.json();
    console.log('Progress Response:', JSON.stringify(progressData, null, 2));
    console.log('');

    console.log('🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
testWaterLogAPI();
