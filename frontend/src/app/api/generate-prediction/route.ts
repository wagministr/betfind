import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { validateEnv } from '@/utils/envCheck';

// This function will execute our prediction script for a specific fixture
export async function POST(request: NextRequest) {
  try {
    // Проверяем конфигурацию окружения
    const envCheck = validateEnv();
    if (!envCheck.isValid) {
      console.error('Environment validation failed:', envCheck.message);
      return NextResponse.json({ 
        error: 'Environment configuration error', 
        details: envCheck.message 
      }, { status: 500 });
    }
    
    const { fixtureId } = await request.json();
    
    if (!fixtureId) {
      return NextResponse.json({ error: 'Fixture ID is required' }, { status: 400 });
    }
    
    console.log(`Generating prediction for fixture ID: ${fixtureId}`);
    
    // Get the path to the project root
    const rootDir = process.cwd();
    
    // Используем обновленный скрипт запуска
    const scriptPath = path.join(rootDir, 'scripts', 'run-prediction.js');
    
    // Execute the script
    const result = await executeScript(scriptPath, [fixtureId.toString()]);
    
    // Check if the result indicates a fixture not found error
    if (result.includes('Match with ID') && result.includes('not found')) {
      console.warn(`Fixture ID ${fixtureId} not found in API-Football`);
      return NextResponse.json({ 
        success: false,
        error: 'Fixture not found',
        fixtureId 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      fixtureId, 
      result 
    });
  } catch (error) {
    console.error('Error generating prediction:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// Helper function to execute a script and return its output
function executeScript(scriptPath: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log(`Executing script: ${scriptPath} with args: ${args.join(' ')}`);
    
    // Используем npm для запуска скрипта в режиме Node.js
    const child = spawn('node', [scriptPath, ...args]);
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      const chunk = data.toString();
      stdout += chunk;
      console.log(`STDOUT: ${chunk}`);
    });
    
    child.stderr.on('data', (data) => {
      const chunk = data.toString();
      stderr += chunk;
      console.error(`STDERR: ${chunk}`);
    });
    
    child.on('error', (error) => {
      console.error(`Failed to start script: ${error.message}`);
      reject(error);
    });
    
    child.on('close', (code) => {
      console.log(`Script exited with code ${code}`);
      
      // We always resolve, and let the caller handle the response
      // This allows for proper error handling in the API route
      resolve(stdout + stderr);
    });
  });
}