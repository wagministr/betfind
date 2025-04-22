#!/usr/bin/env node

// Simple script for running prediction generation
require('dotenv').config();
require('ts-node').register();
require('tsconfig-paths/register');
const generatePrediction = require('./generatePrediction.ts').default;

// Fixture ID can be passed as an argument or use the test ID
const fixtureId = process.argv[2] ? parseInt(process.argv[2]) : 1090754;

console.log(`Starting prediction generation for fixture ID: ${fixtureId}`);

generatePrediction(fixtureId)
  .then(result => {
    if (result) {
      console.log(`✅ Prediction successfully generated with ID: ${result}`);
      process.exit(0);
    } else {
      console.error('❌ Failed to generate prediction');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Error during script execution:', error);
    process.exit(1);
  }); 