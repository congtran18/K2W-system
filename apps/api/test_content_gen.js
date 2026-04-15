const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Since the project is TypeScript, we can run this by loading the TS files via ts-node,
// or we can write a simple JS-equivalent check for the generator to run on your local machine.
const { GoogleGenerativeAI } = require('../../node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

async function run() {
  console.log('Testing Structured JSON output via Google SDK directly...');
  console.log('Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING');
  console.log('Model:', modelName);

  if (!apiKey) {
    console.error('API key is missing.');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json'
      }
    });

    const prompt = `Generate a JSON object with:
    {
      "title": "A standard post title about containers",
      "meta_title": "SEO title",
      "body_html": "<h2>Heading</h2><p>Paragraph text about containers.</p>"
    }
    Return ONLY valid JSON.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log('\n✅ API Response received successfully!');
    console.log('Raw text:', text);

    const parsed = JSON.parse(text);
    console.log('\n🎉 Successfully parsed JSON object:');
    console.log(JSON.stringify(parsed, null, 2));

  } catch (error) {
    console.error('❌ Generation/Parsing failed:', error.message);
  }
}

run();
