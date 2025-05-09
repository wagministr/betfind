// This file is a wrapper to execute the TypeScript implementation
// It ensures the cron job can run without TypeScript compilation issues

require('dotenv').config();
const path = require('path');
const { spawn } = require('child_process');

/**
 * Execute the TypeScript implementation via ts-node
 */
async function runTsImplementation() {
  return new Promise((resolve, reject) => {
    console.log('Executing TypeScript implementation via ts-node...');
    
    // Define the path to ts-node and the TypeScript file
    const tsNodeBin = path.join(process.cwd(), 'node_modules', '.bin', 'ts-node');
    const tsScriptPath = path.join(__dirname, 'generate-all-predictions.ts');
    
    // Spawn the process
    const tsProcess = spawn(tsNodeBin, [
      '--transpile-only',                 // Только транспиляция без проверки типов для скорости
      '--require', 'tsconfig-paths/register', // Для поддержки алиасов путей
      tsScriptPath                        // Путь к TypeScript файлу
    ], {
      stdio: 'inherit', // Show output in console
      shell: true       // Use shell for cross-platform compatibility
    });
    
    // Handle process completion
    tsProcess.on('close', (code) => {
      if (code === 0) {
        console.log('TypeScript implementation completed successfully');
        resolve({
          success: true,
          message: 'Predictions generation completed successfully'
        });
      } else {
        const error = new Error(`TypeScript implementation failed with code ${code}`);
        console.error(error.message);
        reject(error);
      }
    });
    
    // Handle process errors
    tsProcess.on('error', (err) => {
      console.error('Failed to start TypeScript process:', err);
      reject(err);
    });
  });
}

// Export the function
exports.generateAllPredictions = runTsImplementation;

// Default export for TypeScript compatibility
exports.default = runTsImplementation;

// If this file is run directly
if (require.main === module) {
  console.log('Running generate-all-predictions.js wrapper...');
  runTsImplementation()
    .then(() => {
      console.log('Prediction generation completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Error during prediction generation:', error);
      process.exit(1);
    });
} 