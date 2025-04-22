/**
 * Script to update football fixtures in Supabase database
 * Fetches upcoming fixtures from the API-Football service and stores them in Supabase
 */

import { getUpcomingFixtures, Fixture } from '../src/lib/apiFootball';
import { supabase } from '../src/utils/supabase';

/**
 * Database fixture representation
 */
interface FixtureRecord {
  fixture_id: number;
  league_id: number;
  home_id: number;
  away_id: number;
  utc_kickoff: string;
  status: string;
  score_home: number | null;
  score_away: number | null;
  last_updated: string;
}

/**
 * Updates fixtures in the Supabase database
 * @returns Summary of the update operation
 */
export async function updateFixtures(): Promise<{
  processed: number;
  errors: number;
  leagueIds: number[];
}> {
  // League IDs to fetch fixtures for
  const leagueIds = [39, 140]; // Premier League (39) and La Liga (140)
  const summary = {
    processed: 0,
    errors: 0,
    leagueIds,
  };

  try {
    console.log(`Fetching fixtures for leagues: ${leagueIds.join(', ')}...`);
    const fixtures = await getUpcomingFixtures(leagueIds, 2);
    console.log(`Found ${fixtures.length} upcoming fixtures.`);

    if (fixtures.length === 0) {
      console.log('No fixtures to update.');
      return summary;
    }

    // Process fixtures in batches to avoid rate limits
    const batchSize = 20;
    const batches = Math.ceil(fixtures.length / batchSize);

    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, fixtures.length);
      const batchFixtures = fixtures.slice(start, end);
      
      console.log(`Processing batch ${i + 1}/${batches} (${batchFixtures.length} fixtures)...`);
      
      // Process fixtures in current batch
      const results = await Promise.allSettled(
        batchFixtures.map(fixture => processFixture(fixture))
      );
      
      // Count successes and failures
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          summary.processed++;
        } else {
          summary.errors++;
          console.error(`Error processing fixture:`, result.reason);
        }
      });
    }

    console.log(`Update completed. Processed: ${summary.processed}, Errors: ${summary.errors}`);
    return summary;
    
  } catch (error) {
    console.error('Error updating fixtures:', error);
    throw error;
  }
}

/**
 * Process a single fixture and upsert it to the database
 * @param fixture Fixture data from API
 */
async function processFixture(fixture: Fixture): Promise<void> {
  const fixtureRecord: FixtureRecord = {
    fixture_id: fixture.fixture.id,
    league_id: fixture.league.id,
    home_id: fixture.teams.home.id,
    away_id: fixture.teams.away.id,
    utc_kickoff: fixture.fixture.date,
    status: fixture.fixture.status.short,
    score_home: fixture.goals.home,
    score_away: fixture.goals.away,
    last_updated: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('fixtures')
    .upsert(fixtureRecord, {
      onConflict: 'fixture_id',
      ignoreDuplicates: false,
    });

  if (error) {
    console.error(`Error upserting fixture ${fixture.fixture.id}:`, error);
    throw error;
  }
}

/**
 * Main function to execute the script manually
 */
async function main() {
  try {
    console.log('Starting fixture update process...');
    const result = await updateFixtures();
    console.log('Fixture update completed successfully!');
    console.log(`Processed ${result.processed} fixtures with ${result.errors} errors.`);
    process.exit(0);
  } catch (error) {
    console.error('Fixture update failed:', error);
    process.exit(1);
  }
}

// Execute main function if this script is run directly
if (require.main === module) {
  main();
}

export default updateFixtures; 