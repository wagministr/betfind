#!/usr/bin/env node

console.log('Starting TypeScript compilation for Vercel deployment...');

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the scripts directory
const scriptsDir = path.join(process.cwd(), 'scripts');

// Get all TypeScript files
const tsFiles = fs
  .readdirSync(scriptsDir)
  .filter(file => file.endsWith('.ts') && !file.includes('.d.ts'));

console.log(`Found ${tsFiles.length} TypeScript files to compile`);

// Create a temporary tsconfig file for the compilation
const tempTsConfigPath = path.join(scriptsDir, 'temp-tsconfig.json');
const tsConfig = {
  compilerOptions: {
    target: "es2018",
    module: "commonjs",
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    resolveJsonModule: true,
    skipLibCheck: true,
    strict: false,
    outDir: scriptsDir,
    declaration: false
  },
  include: tsFiles.map(file => path.join(scriptsDir, file))
};

// Write the temporary tsconfig
fs.writeFileSync(tempTsConfigPath, JSON.stringify(tsConfig, null, 2));
console.log(`Created temporary tsconfig at ${tempTsConfigPath}`);

try {
  // Compile all TypeScript files
  console.log('Compiling TypeScript files...');
  execSync(`npx tsc --project ${tempTsConfigPath}`, { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('TypeScript compilation completed successfully');
  
  // Check if the output files were created
  const compiledFiles = tsFiles.map(file => file.replace('.ts', '.js'));
  const missingFiles = compiledFiles.filter(file => !fs.existsSync(path.join(scriptsDir, file)));
  
  if (missingFiles.length > 0) {
    console.warn('Warning: Some files were not compiled:');
    missingFiles.forEach(file => console.warn(`- ${file}`));
  } else {
    console.log('All TypeScript files were successfully compiled to JavaScript');
  }
} catch (error) {
  console.error('Error compiling TypeScript files:', error.message);
  process.exit(1);
} finally {
  // Clean up the temporary tsconfig
  try {
    fs.unlinkSync(tempTsConfigPath);
    console.log('Removed temporary tsconfig');
  } catch (err) {
    console.warn('Failed to remove temporary tsconfig:', err.message);
  }
}
