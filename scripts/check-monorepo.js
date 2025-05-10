#!/usr/bin/env node

/**
 * check-monorepo.js
 * 
 * Simple script to verify that the monorepo structure is working correctly.
 * This checks:
 * 1. Project structure (existence of critical files/directories)
 * 2. Package.json configurations
 * 3. Environment variables
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🔍 Checking monorepo structure...');

// Check critical directories and files
const requiredPaths = [
  './frontend',
  './backend',
  './frontend/package.json',
  './backend/requirements.txt',
  './docker-compose.yml',
  './package.json'
];

const missingPaths = requiredPaths.filter(p => !fs.existsSync(path.resolve(p)));

if (missingPaths.length > 0) {
  console.error('❌ Missing critical files or directories:');
  missingPaths.forEach(p => console.error(`   - ${p}`));
  process.exit(1);
}

console.log('✅ All critical directories and files exist');

// Check package.json configurations
const rootPackage = require('../package.json');
const frontendPackage = require('../frontend/package.json');

// Check root package.json scripts
const requiredScripts = [
  'dev:frontend',
  'dev:backend',
  'dev:all',
  'docker:up',
  'docker:down'
];

const missingScripts = requiredScripts.filter(script => !rootPackage.scripts[script]);

if (missingScripts.length > 0) {
  console.error('❌ Missing required scripts in root package.json:');
  missingScripts.forEach(script => console.error(`   - ${script}`));
  process.exit(1);
}

console.log('✅ Root package.json contains all required scripts');

// Check environment variables
let envExample;
try {
  envExample = fs.readFileSync(path.resolve('./env.example'), 'utf8');
  console.log('✅ env.example file exists');
} catch (err) {
  console.error('❌ env.example file is missing');
  process.exit(1);
}

// Check env variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'API_FOOTBALL_KEY',
  'OPENAI_API_KEY'
];

const missingEnvVars = requiredEnvVars.filter(v => !envExample.includes(v));

if (missingEnvVars.length > 0) {
  console.warn('⚠️ Missing environment variables in env.example:');
  missingEnvVars.forEach(v => console.warn(`   - ${v}`));
} else {
  console.log('✅ env.example contains all required variables');
}

// Check presence of key backend files (minimal check)
const backendFiles = ['app/main.py', 'Dockerfile'];
const missingBackendFiles = backendFiles
  .map(f => path.join('./backend', f))
  .filter(p => !fs.existsSync(path.resolve(p)));

if (missingBackendFiles.length > 0) {
  console.warn('⚠️ Backend might be missing key files:');
  missingBackendFiles.forEach(p => console.warn(`   - ${p}`));
} else {
  console.log('✅ Backend has critical files present');
}

// Final summary
console.log('\n📋 Monorepo Check Summary:');
console.log('------------------------');
console.log(`Frontend package: ${frontendPackage.name}@${frontendPackage.version}`);
console.log(`Root package: ${rootPackage.name}@${rootPackage.version}`);
console.log(`Scripts available: ${Object.keys(rootPackage.scripts).length}`);
console.log('------------------------');
console.log('✨ Monorepo structure check completed!\n');

// Instructions for next steps
console.log('Next steps:');
console.log('1. Run "npm install" to install dependencies');
console.log('2. Run "npm run backend:install" to install Python dependencies');
console.log('3. Run "npm run dev:all" to start both frontend and backend');
console.log('4. Or run "npm run docker:up" to start the full stack with Docker'); 