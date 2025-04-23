#!/usr/bin/env node

// Simple wrapper to run the updateFixtures script
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
    const tsFilePath = './updateFixtures.ts';
    const jsFilePath = './updateFixtures.js';
    
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