const https = require('https');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;

async function run() {
  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY is not defined in your .env file.');
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  console.log('Fetching available models for key from Google AI Studio...');
  console.log(`URL: https://generativelanguage.googleapis.com/v1beta/models?key=...`);

  const req = https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log(`HTTP Status: ${res.statusCode} ${res.statusMessage}`);
      try {
        const parsed = JSON.parse(data);
        if (parsed.models) {
          console.log('\nAvailable Models for your Key:');
          parsed.models.forEach(m => {
            console.log(`- ${m.name.replace('models/', '')} (${m.displayName})`);
            console.log(`  Supported methods: ${m.supportedGenerationMethods.join(', ')}`);
          });
        } else {
          console.log('Response:', JSON.stringify(parsed, null, 2));
        }
      } catch (e) {
        console.log('Raw response:', data.substring(0, 1000));
      }
    });
  });

  req.on('error', (err) => {
    console.error('Network Error:', err.message);
  });
}

run();
