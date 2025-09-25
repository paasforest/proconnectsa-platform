#!/usr/bin/env node

/**
 * System Test Script for ProConnect SA
 * This script helps test the main system flows
 */

const https = require('https');

const API_BASE = 'https://api.proconnectsa.co.za';

// Test data
const testLead = {
  service_category_id: 1,
  title: "Test Lead from Script",
  description: "Test lead for system testing",
  location_address: "123 Test Street",
  location_suburb: "Test Suburb", 
  location_city: "Cape Town",
  budget_range: "1000_5000",
  urgency: "this_week",
  hiring_intent: "ready_to_hire",
  hiring_timeline: "this_month",
  client_name: "Test Client",
  client_email: "test@example.com",
  client_phone: "+27123456789"
};

function makeRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.proconnectsa.co.za',
      port: 443,
      path: endpoint,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testSystem() {
  console.log('🧪 Testing ProConnect SA System...\n');

  // Test 1: Check API Health
  console.log('1️⃣ Testing API Health...');
  try {
    const response = await makeRequest('/api/');
    if (response.status === 200) {
      console.log('✅ API is healthy');
      console.log('📋 Available endpoints:', response.data.endpoints?.slice(0, 5).join(', ') + '...');
    } else {
      console.log('❌ API health check failed:', response.status);
    }
  } catch (error) {
    console.log('❌ API connection failed:', error.message);
  }

  // Test 2: Check Available Leads
  console.log('\n2️⃣ Testing Available Leads...');
  try {
    const response = await makeRequest('/api/leads/wallet/available/');
    if (response.status === 200 && response.data.data?.leads) {
      console.log('✅ Available leads endpoint working');
      console.log('📊 Found', response.data.data.leads.length, 'leads');
      if (response.data.data.leads.length > 0) {
        const lead = response.data.data.leads[0];
        console.log('📝 Sample lead:', lead.title, '-', lead.category);
      }
    } else {
      console.log('❌ Available leads endpoint failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Available leads test failed:', error.message);
  }

  // Test 3: Test Lead Creation
  console.log('\n3️⃣ Testing Lead Creation...');
  try {
    // Add required fields for API compatibility
    const apiLead = {
      ...testLead,
      budget: 3000, // Convert budget_range to budget
      category: testLead.service_category_id || 1, // Add category field
      location: `${testLead.location_address}, ${testLead.location_suburb}, ${testLead.location_city}` // Add location field
    };
    
    const response = await makeRequest('/api/leads/', 'POST', apiLead);
    if ((response.status === 200 || response.status === 201) && response.data.success) {
      console.log('✅ Lead creation successful');
      console.log('🆔 Created lead ID:', response.data.data.lead.id);
    } else {
      console.log('❌ Lead creation failed:', response.status);
      console.log('📝 Error:', response.data.message || response.data);
    }
  } catch (error) {
    console.log('❌ Lead creation test failed:', error.message);
  }

  console.log('\n🎯 Manual Testing Required:');
  console.log('1. Open http://localhost:3000 in your browser');
  console.log('2. Register as a provider');
  console.log('3. Test wallet top-up functionality');
  console.log('4. Test leads purchasing');
  console.log('5. Register as a client and submit quote requests');
  console.log('\n✅ System testing complete!');
}

// Run the tests
testSystem().catch(console.error);
