import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

// This function will execute our prediction script for a specific fixture
export async function POST(request: NextRequest) {
  try {
    const { fixtureId } = await request.json();
    
    if (!fixtureId) {
      return NextResponse.json({ error: 'Fixture ID is required' }, { status: 400 });
    }
    
    console.log(`Generating prediction for fixture ID: ${fixtureId}`);
    
    // Get the path to the project root
    const rootDir = process.cwd();
    const scriptPath = path.join(rootDir, 'scripts', 'run-prediction.js');
    
    // Execute the script
    const result = await executeScript(scriptPath, [fixtureId.toString()]);
    
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
    const child = spawn('node', [scriptPath, ...args]);
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log(`STDOUT: ${data}`);
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error(`STDERR: ${data}`);
    });
    
    child.on('error', (error) => {
      reject(error);
    });
    
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Script exited with code ${code}: ${stderr}`));
      } else {
        resolve(stdout);
      }
    });
  });
} 