import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

// This endpoint is triggered by the Vercel cron job to update fixtures and generate predictions
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from a cron job using Vercel's authorization header
    const authHeader = request.headers.get('Authorization');
  //  if (process.env.VERCEL_ENV === 'production' && (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`)) {
  //    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    //}
    
    console.log('Starting daily update process...');
    
    // Get the path to the project root
    const rootDir = process.cwd();
    
    // 1. First update the fixtures
    console.log('Updating fixtures...');
    await executeScript(path.join(rootDir, 'scripts', 'run-update.js'), []);
    
    // 2. Then generate predictions for fixtures without predictions
    console.log('Generating predictions...');
    await executeScript(path.join(rootDir, 'scripts', 'run-all-predictions.js'), []);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Daily update completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in daily update process:', error);
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