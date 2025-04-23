#!/usr/bin/env node

// Script for running prediction generation for all matches
require('dotenv').config();
require('ts-node').register();
require('tsconfig-paths/register'); // Add support for path aliases
const { generateAllPredictions } = require('./generate-all-predictions.ts');

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