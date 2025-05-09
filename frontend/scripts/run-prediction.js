#!/usr/bin/env node

// Simple script for running prediction generation
require('dotenv').config();
const path = require('path');
const { spawn } = require('child_process');

// Fixture ID can be passed as an argument or use the test ID
const fixtureId = process.argv[2] ? parseInt(process.argv[2]) : 1090754;

console.log(`Starting prediction generation for fixture ID: ${fixtureId}`);

// Validate input
if (isNaN(fixtureId)) {
  console.error('❌ Invalid fixture ID provided');
  process.exit(1);
}

// Запускаем TypeScript скрипт через ts-node с нужными опциями
const tsNodeBin = path.join(process.cwd(), 'node_modules', '.bin', 'ts-node');
const tsScriptPath = path.join(__dirname, 'generatePrediction.ts');

// Используем spawn для запуска процесса
const tsProcess = spawn(tsNodeBin, [
  '--transpile-only',                 // Только транспиляция без проверки типов для скорости
  '--require', 'tsconfig-paths/register', // Для поддержки алиасов путей
  tsScriptPath,                       // Путь к TypeScript файлу
  fixtureId.toString()                // Передаем fixtureId как аргумент
], {
  stdio: 'inherit', // Показываем вывод в консоли
  shell: true       // Используем shell для кроссплатформенности
});

// Обработка завершения процесса
tsProcess.on('close', (code) => {
  if (code === 0) {
    console.log(`✅ Prediction successfully generated for fixture ID: ${fixtureId}`);
    process.exit(0);
  } else {
    console.error(`❌ Failed to generate prediction. Process exited with code ${code}`);
    // We'll still exit with 0 to prevent API route from failing
    // This allows the frontend to fall back to showing a mock prediction
    process.exit(0);
  }
});