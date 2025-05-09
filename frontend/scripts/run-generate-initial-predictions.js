// Simple wrapper script to run the TypeScript file with ts-node
const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Starting initial predictions generation...');
  // Execute the TypeScript file using ts-node
  execSync('npx ts-node -r tsconfig-paths/register scripts/generate-initial-predictions.ts', {
    stdio: 'inherit', // This will show the output in the console
    cwd: path.resolve(__dirname, '..')
  });
  console.log('Initial predictions generation completed successfully.');
} catch (error) {
  console.error('Error running initial predictions generation:', error.message);
  process.exit(1);
} 