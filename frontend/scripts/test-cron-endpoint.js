// Simple script to test the cron endpoint with authorization
const https = require('https');
require('dotenv').config(); // Load environment variables from .env file

// Get the CRON_SECRET from environment variables
const cronSecret = process.env.CRON_SECRET;

if (!cronSecret) {
  console.error('Error: CRON_SECRET environment variable is not set.');
  console.error('Please set it in your .env file or provide it when running the script:');
  console.error('CRON_SECRET=your_secret_here node scripts/test-cron-endpoint.js');
  process.exit(1);
}

const url = 'https://betfind.vercel.app/api/cron/daily-update';
const options = {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${cronSecret}`
  }
};

console.log(`Testing cron endpoint: ${url}`);
console.log('Using Authorization header with CRON_SECRET from environment variables');

const req = https.request(url, options, (res) => {
  console.log(`\nResponse status code: ${res.statusCode}`);
  console.log(`Response headers: ${JSON.stringify(res.headers, null, 2)}`);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`\nResponse body:`);
    try {
      // Try to parse as JSON
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));
    } catch (e) {
      // If not JSON, just output as text
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error(`\nError making request: ${error.message}`);
});

req.end(); 