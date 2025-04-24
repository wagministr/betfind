import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { validateEnv } from '@/utils/envCheck';
import { testSupabaseConnection } from '@/utils/supabase';

// This endpoint runs daily updates for fixtures and predictions
export async function GET(request: NextRequest) {
  try {
    // Explicit environment variable checks
    if (!process.env.CRON_SECRET) {
      console.error('❌ Missing CRON_SECRET in environment variables');
      return NextResponse.json({ 
        error: 'Missing required environment variable: CRON_SECRET' 
      }, { status: 500 });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ Missing OPENAI_API_KEY in environment variables');
      return NextResponse.json({ 
        error: 'Missing required environment variable: OPENAI_API_KEY' 
      }, { status: 500 });
    }

    if (!process.env.API_FOOTBALL_KEY) {
      console.error('❌ Missing API_FOOTBALL_KEY in environment variables');
      return NextResponse.json({ 
        error: 'Missing required environment variable: API_FOOTBALL_KEY' 
      }, { status: 500 });
    }
    
    // Complete environment check
    const envCheck = validateEnv();
    if (!envCheck.isValid) {
      console.error('Environment validation failed:', envCheck.message);
      return NextResponse.json({ 
        error: 'Environment configuration error', 
        details: envCheck.message 
      }, { status: 500 });
    }

    // Test Supabase connection
    const isSupabaseConnected = await testSupabaseConnection();
    if (!isSupabaseConnected) {
      return NextResponse.json({ 
        error: 'Failed to connect to Supabase database' 
      }, { status: 500 });
    }
    
    // Verify the request is from a Vercel cron job using the authorization header
    const authHeader = request.headers.get('Authorization');
    
    // Get the cron secret from the environment
    const cronSecret = process.env.CRON_SECRET || '';
    
    // Check if this is a Vercel cron job or if the secret matches
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    const hasValidToken = authHeader === `Bearer ${cronSecret}`;
    
    // For security, we require either a valid Vercel cron job header or a valid auth token
    if (!isVercelCron && !hasValidToken) {
      console.error('Unauthorized access attempt to cron endpoint');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('Starting daily update process...');
    
    // Get the path to the project root
    const rootDir = process.cwd();
    
    // 1. Run the update fixtures script
    console.log('Running fixture update script...');
    const updateResult = await executeScript(path.join(rootDir, 'scripts', 'run-update.js'));
    console.log('Fixtures update completed:', updateResult);
    
    // 2. Run the generate predictions script
    console.log('Running prediction generation script...');
    const predictionsResult = await executeScript(path.join(rootDir, 'scripts', 'run-all-predictions.js'));
    console.log('Prediction generation completed:', predictionsResult);
    
    // Return a success response
    return NextResponse.json({ 
      success: true, 
      message: 'Daily update completed successfully',
      timestamp: new Date().toISOString(),
      fixtures_update: updateResult,
      predictions_generation: predictionsResult
    });
  } catch (error) {
    console.error('Error in daily update process:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// Helper function to execute a script and return its output
function executeScript(scriptPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log(`Executing script: ${scriptPath}`);
    
    const child = spawn('node', [scriptPath]);
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      console.log(`SCRIPT OUTPUT: ${output}`);
    });
    
    child.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      console.error(`SCRIPT ERROR: ${output}`);
    });
    
    child.on('error', (error) => {
      console.error(`Failed to start script: ${error.message}`);
      reject(error);
    });
    
    child.on('close', (code) => {
      console.log(`Script exited with code ${code}`);
      
      if (code !== 0) {
        reject(new Error(`Script exited with code ${code}: ${stderr}`));
      } else {
        resolve(stdout);
      }
    });
  });
}