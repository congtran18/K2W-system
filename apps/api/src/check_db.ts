import { supabase } from '@k2w/database';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
  console.log('Querying Supabase keywords table...');
  const { data: keywords, error } = await supabase
    .from('keywords')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching keywords:', error);
    return;
  }

  console.log(`\nFound ${keywords.length} keywords:`);
  for (const kw of keywords) {
    console.log(`- ID: ${kw.id} | Keyword: "${kw.keyword}" | Status: "${kw.status}" | Created: ${kw.created_at}`);
  }

  console.log('\nQuerying Supabase content table...');
  const { data: contents, error: contentError } = await supabase
    .from('content')
    .select('*')
    .order('created_at', { ascending: false });

  if (contentError) {
    console.error('Error fetching content:', contentError);
    return;
  }

  console.log(`\nFound ${contents.length} content records:`);
  for (const c of contents) {
    console.log(`- ID: ${c.id} | Title: "${c.title}" | Keyword ID: ${c.keyword_id} | Status: "${c.status}" | Body Length: ${c.body?.length || 0}`);
  }
}

run().catch(console.error);
