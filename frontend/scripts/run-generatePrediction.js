#!/usr/bin/env node

// Simple wrapper to run the TypeScript generatePrediction script
require('ts-node').register();
require('./generatePrediction.ts').default().catch(console.error); 