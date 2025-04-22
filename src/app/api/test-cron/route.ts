import { NextRequest, NextResponse } from 'next/server';

// This endpoint allows manual triggering of the cron job during development
export async function GET(request: NextRequest) {
  try {
    // This should only be callable in development environment
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
    }
    
    console.log('Manually triggering cron job...');
    
    // Make a request to the cron endpoint
    const cronResponse = await fetch(new URL('/api/cron/daily-update', request.url), {
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'dev-secret'}`
      }
    });
    
    const result = await cronResponse.json();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cron job triggered manually',
      result
    });
  } catch (error) {
    console.error('Error triggering cron job:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 