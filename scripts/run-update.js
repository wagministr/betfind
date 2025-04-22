#!/usr/bin/env node

// Simple wrapper to run the TypeScript updateFixtures script
require('ts-node').register();
require('./updateFixtures.ts').default().catch(console.error); 