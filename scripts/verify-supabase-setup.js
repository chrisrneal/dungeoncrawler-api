#!/usr/bin/env node

/**
 * Supabase Setup Verification Script
 * 
 * This script helps verify your Supabase configuration and connection.
 * Run with: node scripts/verify-supabase-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Supabase Configuration Verification\n');
console.log('=====================================\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('❌ .env.local file not found');
  console.log('📝 Please create .env.local from .env.example:');
  console.log('   cp .env.example .env.local\n');
  process.exit(1);
}

console.log('✅ .env.local file found\n');

// Read and parse environment variables
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    envVars[key] = value;
  }
});

// Check required variables
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

let allPresent = true;
console.log('Checking required environment variables:\n');

requiredVars.forEach(varName => {
  const value = envVars[varName];
  const isSet = value && value !== 'your_supabase_project_url' && value !== 'your_supabase_anon_key' && value !== 'your_supabase_service_role_key';
  
  if (isSet) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: Not configured`);
    allPresent = false;
  }
});

console.log('');

// Check storage mode
const storageMode = envVars['STORAGE_MODE'] || 'supabase';
console.log(`📦 Storage Mode: ${storageMode}\n`);

if (!allPresent) {
  console.log('❌ Some required environment variables are not configured');
  console.log('\n📚 Setup Instructions:');
  console.log('1. Go to https://supabase.com and create a project');
  console.log('2. Navigate to Settings → API in your Supabase dashboard');
  console.log('3. Copy your Project URL and API keys');
  console.log('4. Update .env.local with your actual values\n');
  process.exit(1);
}

console.log('✅ All required environment variables are configured\n');

// Check if Supabase client is installed
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  if (deps['@supabase/supabase-js']) {
    console.log(`✅ @supabase/supabase-js is installed (${deps['@supabase/supabase-js']})\n`);
  } else {
    console.log('❌ @supabase/supabase-js is not installed');
    console.log('📝 Install it with: npm install @supabase/supabase-js\n');
    process.exit(1);
  }
}

// Check if migration files exist
const migrationsPath = path.join(process.cwd(), 'supabase', 'migrations');
if (fs.existsSync(migrationsPath)) {
  const files = fs.readdirSync(migrationsPath);
  console.log(`✅ Found ${files.length} migration file(s):`);
  files.forEach(file => {
    console.log(`   - ${file}`);
  });
  console.log('');
} else {
  console.log('⚠️  Migration files directory not found\n');
}

console.log('=====================================\n');
console.log('🎉 Configuration looks good!\n');
console.log('📝 Next Steps:');
console.log('1. Run migrations in Supabase SQL Editor:');
console.log('   - Copy contents of supabase/migrations/001_initial_schema.sql');
console.log('   - Paste and run in Supabase Dashboard → SQL Editor');
console.log('2. Optionally run 002_seed_data.sql for test data');
console.log('3. Start your development server: npm run dev\n');
console.log('📚 For detailed instructions, see supabase/README.md\n');
