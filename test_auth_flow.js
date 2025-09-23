// Test script to verify authentication flow
const API_URL = 'http://128.140.123.48:8000';

async function testAuthFlow() {
  console.log('🧪 Testing Authentication Flow...\n');
  
  // Step 1: Test Django login
  console.log('1. Testing Django login...');
  try {
    const loginResponse = await fetch(`${API_URL}/api/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpass123',
      }),
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful');
      console.log('Token:', loginData.token);
      console.log('User:', loginData.user.email, loginData.user.user_type);
      
      // Step 2: Test API call with token
      console.log('\n2. Testing API call with token...');
      const apiResponse = await fetch(`${API_URL}/api/auth/profile/`, {
        headers: {
          'Authorization': `Token ${loginData.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (apiResponse.ok) {
        const profileData = await apiResponse.json();
        console.log('✅ API call successful');
        console.log('Profile data:', profileData);
      } else {
        console.log('❌ API call failed');
        console.log('Status:', apiResponse.status);
        const errorText = await apiResponse.text();
        console.log('Error:', errorText);
      }
      
    } else {
      console.log('❌ Login failed');
      console.log('Status:', loginResponse.status);
      const errorText = await loginResponse.text();
      console.log('Error:', errorText);
    }
    
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

// Run the test
testAuthFlow();
