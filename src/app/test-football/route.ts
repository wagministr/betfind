import { NextRequest, NextResponse } from 'next/server';
import { getUpcomingFixtures } from '@/lib/apiFootball';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing API-Football connection...');
    
    // Check API-Football key
    const apiFootballKey = process.env.API_FOOTBALL_KEY;
    if (!apiFootballKey) {
      return NextResponse.json({ 
        error: 'API_FOOTBALL_KEY environment variable is not set' 
      }, { status: 500 });
    }
    
    // Try to fetch a small number of fixtures
    const fixtures = await getUpcomingFixtures([39], 1); // Premier League only, 1 day ahead
    
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully connected to API-Football',
      fixtures_count: fixtures.length,
      first_fixture: fixtures.length > 0 ? {
        id: fixtures[0].fixture.id,
        match: `${fixtures[0].teams.home.name} vs ${fixtures[0].teams.away.name}`,
        league: fixtures[0].league.name,
        date: fixtures[0].fixture.date
      } : null
    });
  } catch (error) {
    console.error('Error connecting to API-Football:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error connecting to API-Football' 
    }, { status: 500 });
  }
}