#!/usr/bin/env node

/**
 * Скрипт для запуска всего проекта
 * 
 * Использование:
 * node start.js          - запустить Docker Compose с полным окружением
 * node start.js frontend - запустить только фронтенд
 * node start.js backend  - запустить только бэкенд
 */

const { execSync } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');
const args = process.argv.slice(2);

// Проверка наличия Docker
try {
  execSync('docker --version', { stdio: 'ignore' });
  console.log('✓ Docker установлен');
} catch (error) {
  console.error('✗ Docker не установлен. Установите Docker для полноценной работы.');
  console.log('  Вы всё ещё можете запустить компоненты по отдельности.');
}

// Проверка наличия файлов окружения
if (!existsSync('.env')) {
  console.warn('⚠ Файл .env не найден. Копирую env.example в .env...');
  try {
    execSync('copy env.example .env', { stdio: 'inherit' });
    console.log('✓ Файл .env создан');
  } catch (error) {
    console.error('✗ Не удалось создать файл .env. Создайте его вручную из env.example');
  }
}

// Функция для запуска команды с выводом
function runCommand(command) {
  console.log(`> ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Ошибка при выполнении: ${command}`);
    return false;
  }
}

// Запуск проекта на основе аргументов
const component = args[0] || 'all';

switch (component) {
  case 'frontend':
    console.log('🚀 Запуск фронтенда...');
    runCommand('npm run dev:frontend');
    break;
    
  case 'backend':
    console.log('🚀 Запуск бэкенда...');
    runCommand('npm run dev:backend');
    break;
    
  case 'all':
  default:
    console.log('🚀 Запуск всего проекта через Docker Compose...');
    
    // Проверка наличия .env файла
    if (!existsSync('.env')) {
      console.error('✗ Файл .env не найден, но требуется для Docker Compose');
      process.exit(1);
    }
    
    runCommand('docker-compose up');
    break;
} 