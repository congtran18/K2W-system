const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  console.log('🧪 Testing Gemini API key...\n');
  
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyBQ-2P0f7kw38k5Ic7E9J2LpTv4opO78wE';
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  try {
    const startTime = Date.now();
    const result = await model.generateContent('Viết 1 câu ngắn về container homes bằng tiếng Việt (20-30 từ)');
    const response = result.response;
    const duration = Date.now() - startTime;
    
    console.log('✅ GEMINI HOẠT ĐỘNG HOÀN HẢO!\n');
    console.log('📝 Response:', response.text());
    console.log('⏱️  Thời gian:', duration, 'ms');
    
    if (response.usageMetadata) {
      const metadata = response.usageMetadata;
      console.log('\n📊 TOKEN USAGE:');
      console.log('   Prompt tokens:', metadata.promptTokenCount);
      console.log('   Completion tokens:', metadata.candidatesTokenCount);
      console.log('   Total tokens:', metadata.totalTokenCount);
      
      // Calculate cost
      const tokens = metadata.totalTokenCount;
      const geminiCost = (tokens / 1000) * 0.00035; // Flash pricing
      const openaiCost = (tokens / 1000) * 0.03; // GPT-4 pricing
      const savings = ((openaiCost - geminiCost) / openaiCost * 100).toFixed(1);
      
      console.log('\n💰 CHI PHÍ:');
      console.log('   Gemini Flash: $' + geminiCost.toFixed(6));
      console.log('   OpenAI GPT-4: $' + openaiCost.toFixed(6));
      console.log('   💸 TIẾT KIỆM: ' + savings + '%');
      
      // Monthly projection
      const monthlyRequests = 500;
      const monthlyCostGemini = geminiCost * monthlyRequests;
      const monthlyCostOpenAI = openaiCost * monthlyRequests;
      console.log('\n📅 DỰ ÁN HÀNG THÁNG (500 contents):');
      console.log('   Gemini: $' + monthlyCostGemini.toFixed(2));
      console.log('   OpenAI: $' + monthlyCostOpenAI.toFixed(2));
      console.log('   💰 Tiết kiệm: $' + (monthlyCostOpenAI - monthlyCostGemini).toFixed(2) + '/tháng');
    }
    
    console.log('\n🎉 GEMINI SẴN SÀNG SỬ DỤNG!');
    console.log('✅ Text generation: OK');
    console.log('⚠️  Image generation: Cần dùng DALL-E (OpenAI) hoặc setup Imagen');
    
  } catch (error) {
    console.error('\n❌ LỖI:', error.message);
    console.log('\n🔧 Kiểm tra:');
    console.log('- API key có đúng không?');
    console.log('- Có kết nối internet không?');
    console.log('- Quota còn không? (Free: 1500 req/day)');
  }
}

testGemini();
