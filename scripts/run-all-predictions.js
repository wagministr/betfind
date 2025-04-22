#!/usr/bin/env node

// Скрипт для запуска генерации прогнозов для всех матчей
require('dotenv').config();
require('ts-node').register();
const { generateAllPredictions } = require('./generate-all-predictions.ts');

console.log('Запуск генерации прогнозов для всех предстоящих матчей...');

generateAllPredictions()
  .then(result => {
    console.log('\n--- Результаты генерации прогнозов ---');
    console.log(`Всего матчей: ${result.total}`);
    console.log(`Сгенерировано прогнозов: ${result.generated}`);
    console.log(`Пропущено (уже есть прогнозы): ${result.skipped}`);
    console.log(`Не удалось сгенерировать: ${result.failed}`);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Ошибка при выполнении скрипта:', error);
    process.exit(1);
  }); 