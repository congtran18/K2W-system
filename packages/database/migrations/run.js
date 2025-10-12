#!/usr/bin/env node

// Migration script that can be run directly
const { execSync } = require('child_process');
const path = require('path');

// Set environment variables for development
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('⚠️  Missing Supabase environment variables');
  console.log('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.log('');
  console.log('Example:');
  console.log('export SUPABASE_URL="https://your-project.supabase.co"');
  console.log('export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
  process.exit(1);
}

console.log('🚀 Starting database migration...');
console.log('');

try {
  // Run the TypeScript migration file
  execSync('npx ts-node src/migration-runner.ts', {
    cwd: __dirname,
    stdio: 'inherit'
  });
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}