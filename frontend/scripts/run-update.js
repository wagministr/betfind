#!/usr/bin/env node

// Load environment variables from .env file
require('dotenv').config();

// Check if required environment variables are set
const missingVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
].filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('Please check your .env file or environment configuration');
  process.exit(1);
}

// Simple wrapper to run the updateFixtures script
const path = require('path');

try {
  // Try to use ts-node if available (development environment)
  require('ts-node').register();
  require('./updateFixtures.ts').default().catch(console.error);
} catch (error) {
  // In production, we'll use the compiled JavaScript version instead
  console.log("Running in production mode - ts-node not available");
  if (error.code === 'MODULE_NOT_FOUND') {
    // Check if compiled JS file exists
    const fs = require('fs');
    
    // Use absolute paths
    const scriptsDir = path.join(process.cwd(), 'scripts');
    const tsFilePath = path.join(scriptsDir, 'updateFixtures.ts');
    const jsFilePath = path.join(scriptsDir, 'updateFixtures.js');
    
    console.log(`Looking for: ${jsFilePath}`);
    
    // List all files in the scripts directory for debugging
    try {
      const files = fs.readdirSync(scriptsDir);
      console.log("Files in scripts directory:", files);
    } catch (err) {
      console.error("Error listing files:", err);
    }
    
    if (fs.existsSync(jsFilePath)) {
      console.log("Using compiled JavaScript version");
      require(jsFilePath).default().catch(console.error);
    } else {
      console.error(`Error: Neither TypeScript nor JavaScript version found.`);
      console.error(`Please ensure that '${tsFilePath}' is compiled to '${jsFilePath}' for production.`);
      process.exit(1);
    }
  } else {
    // If error is not just MODULE_NOT_FOUND, rethrow it
    console.error("Error running update script:", error);
    process.exit(1);
  }
} 