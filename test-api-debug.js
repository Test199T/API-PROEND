const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('🔐 Testing Login...');
    const loginResponse = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'methasphoyuxk01@gmail.com',
        password: 'Methas2448'
      })
    });

    const loginData = await loginResponse.json();
    console.log('✅ Login Response:', JSON.stringify(loginData, null, 2));

    if (loginData.access_token) {
      console.log('\n🔑 Access Token Length:', loginData.access_token.length);
      console.log('🔑 Token Preview:', loginData.access_token.substring(0, 50) + '...');
      
      // Test Profile with this token
      await testProfile(loginData.access_token);
    }
  } catch (error) {
    console.error('❌ Login Error:', error.message);
  }
}

async function testProfile(token) {
  try {
    console.log('\n👤 Testing Profile...');
    console.log('🔑 Using Token:', token.substring(0, 50) + '...');
    
    const profileResponse = await fetch('http://localhost:3000/auth/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const profileData = await profileResponse.json();
    console.log('✅ Profile Response Status:', profileResponse.status);
    console.log('✅ Profile Response:', JSON.stringify(profileData, null, 2));
    
  } catch (error) {
    console.error('❌ Profile Error:', error.message);
  }
}

// Run test
testLogin();
