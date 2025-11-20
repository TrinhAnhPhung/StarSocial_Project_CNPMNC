// Test connection to backend
import API_BASE_URL from '../constants/apiConfig';

console.log('=== BACKEND CONNECTION TEST ===');
console.log('API Base URL:', API_BASE_URL);
console.log('Testing connection...');

// Test simple fetch
fetch(API_BASE_URL.replace('/api', '/'))
  .then(response => {
    console.log('✅ Connection successful!');
    console.log('Status:', response.status);
    return response.text();
  })
  .then(data => {
    console.log('Response:', data);
  })
  .catch(error => {
    console.error('❌ Connection failed!');
    console.error('Error:', error.message);
    console.log('\n=== TROUBLESHOOTING ===');
    console.log('1. Check if backend is running: node index.js');
    console.log('2. Check if port 3000 is correct');
    console.log('3. For Android Emulator, use: http://10.0.2.2:3000/api');
    console.log('4. For real device, use: http://YOUR_IP:3000/api');
    console.log('5. Check firewall settings');
  });
