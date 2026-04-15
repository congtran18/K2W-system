/**
 * Quick test script to verify API returns images correctly
 * Run: npx ts-node apps/api/test-image-api.ts
 */

const API_URL = process.env.API_BASE_URL || 'http://localhost:8000';

async function test() {
  console.log(`\n🔍 Testing API at ${API_URL}/api/k2w/keywords/history\n`);
  
  try {
    const response = await fetch(`${API_URL}/api/k2w/keywords/history?limit=5`);
    const json = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Success:', json.success);
    console.log('Total keywords:', json.data?.total);
    
    const keywords = json.data?.keywords || [];
    
    for (const kw of keywords) {
      console.log(`\n--- Keyword: "${kw.keyword}" ---`);
      console.log('  Status:', kw.status);
      console.log('  Has results:', !!kw.results);
      
      if (kw.results) {
        console.log('  Content length:', kw.results.content?.length || 0);
        console.log('  SEO score:', kw.results.seo_score);
        console.log('  Images:', JSON.stringify(kw.results.images));
        console.log('  Images count:', kw.results.images?.length || 0);
        
        if (kw.results.images && kw.results.images.length > 0) {
          console.log('  ✅ IMAGE FOUND:', kw.results.images[0]?.substring(0, 80));
        } else {
          console.log('  ❌ NO IMAGES in results');
        }
      } else {
        console.log('  ❌ NO RESULTS (keyword not completed?)');
      }
    }
    
  } catch (err) {
    console.error('❌ API call failed:', err instanceof Error ? err.message : err);
    console.log('\nMake sure the API server is running: pnpm api:dev');
  }
}

test();
