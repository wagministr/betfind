#!/usr/bin/env node

// Script for running prediction generation for all matches
require('dotenv').config();
const path = require('path');

let generateAllPredictions;

try {
  // Try to use ts-node if available (development environment)
  require('ts-node').register();
  require('tsconfig-paths/register'); // Add support for path aliases
  generateAllPredictions = require('./generate-all-predictions.ts').generateAllPredictions;
} catch (error) {
  // In production, we'll use the compiled JavaScript version instead
  console.log("Running in production mode - ts-node not available");
  if (error.code === 'MODULE_NOT_FOUND') {
    // Check if compiled JS file exists
    const fs = require('fs');
    
    // Use absolute paths
    const scriptsDir = path.join(process.cwd(), 'scripts');
    const jsFilePath = path.join(scriptsDir, 'generate-all-predictions.js');
    
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
      generateAllPredictions = require(jsFilePath).generateAllPredictions;
    } else {
      console.error(`Error: JavaScript version not found at ${jsFilePath}`);
      console.error(`Please ensure that TypeScript files are compiled to JavaScript for production.`);
      process.exit(1);
    }
  } else {
    // If error is not just MODULE_NOT_FOUND, rethrow it
    console.error("Error initializing script:", error);
    process.exit(1);
  }
}

console.log('Starting prediction generation for all upcoming matches...');

generateAllPredictions()
  .then(result => {
    console.log('\n--- Prediction Generation Results ---');
    console.log(`Total matches: ${result.total}`);
    console.log(`Predictions generated: ${result.generated}`);
    console.log(`Skipped (already have predictions): ${result.skipped}`);
    console.log(`Failed to generate: ${result.failed}`);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error executing script:', error);
    process.exit(1);
  }); 