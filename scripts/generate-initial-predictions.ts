// Simple wrapper script to run the TypeScript file with ts-node
const { spawn } = require('child_process');
const path = require('path');

try {
  console.log('Starting initial predictions generation...');
  
  // Определяем путь к ts-node
  const tsNodeBin = path.join(process.cwd(), 'node_modules', '.bin', 'ts-node');
  const tsScriptPath = path.join(__dirname, 'generate-initial-predictions.ts');
  
  // Запускаем TypeScript скрипт через ts-node с нужными опциями
  const tsProcess = spawn(tsNodeBin, [
    '--esm',                            // Включаем ES Modules
    '--transpile-only',                 // Только транспиляция без проверки типов для скорости
    '--require', 'tsconfig-paths/register', // Для поддержки алиасов путей
    tsScriptPath                        // Путь к TypeScript файлу
  ], {
    stdio: 'inherit', // Показываем вывод в консоли
    shell: true       // Используем shell для кроссплатформенности
  });
  
  // Обработка завершения процесса
  tsProcess.on('close', (code: number | null) => {
    if (code === 0) {
      console.log('Initial predictions generation completed successfully.');
      process.exit(0);
    } else {
      console.error(`Failed to generate initial predictions. Process exited with code ${code}`);
      process.exit(1);
    }
  });
  
} catch (error: unknown) {
  console.error('Error running initial predictions generation:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}