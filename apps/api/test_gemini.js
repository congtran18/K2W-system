const https = require('https');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;
const models = [
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-flash-latest'
];

async function testModel(modelName) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  console.log(`\n--------------------------------------------`);
  console.log(`Testing model: ${modelName}`);
  console.log(`URL: https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=...`);

  const body = JSON.stringify({
    contents: [{ parts: [{ text: 'Hello, respond with one word "test".' }] }]
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`HTTP Status: ${res.statusCode} ${res.statusMessage}`);
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            console.log('Error Message:', parsed.error.message);
            if (parsed.error.message.includes('limit: 0')) {
              console.log('⚠️ Status: Quota is restricted to 0 for this model.');
            }
          } else if (parsed.candidates) {
            console.log('✅ Success! Output:', parsed.candidates[0].content.parts[0].text.trim());
          } else {
            console.log('Response:', JSON.stringify(parsed, null, 2));
          }
        } catch (e) {
          console.log('Raw Response:', data.substring(0, 500));
        }
        resolve(res.statusCode);
      });
    });

    req.on('error', (err) => {
      console.error(`Network Error for ${modelName}:`, err.message);
      resolve(null);
    });

    req.write(body);
    req.end();
  });
}

async function run() {
  console.log('Starting Gemini API diagnostics for available models...');
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}... (length: ${apiKey.length})` : 'MISSING');
  
  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY is not defined in your .env file.');
    return;
  }

  for (const model of models) {
    await testModel(model);
  }
}

run();
