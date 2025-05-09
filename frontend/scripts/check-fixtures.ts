// Import supabase client
import { supabase } from '../src/utils/supabase';
import { getFixtureById } from '../src/lib/apiFootball';

async function checkFixtures() {
  console.log('Checking fixtures table...');
  
  // Check if fixture exists in the database
  const fixtureId = 1090754; // Test fixture ID
  
  // Check if this fixture is already in the database
  const { data: existingFixture, error: checkError } = await supabase
    .from('fixtures')
    .select('*')
    .eq('fixture_id', fixtureId)
    .single();
  
  if (checkError && checkError.code !== 'PGRST116') {
    console.error('Error checking fixture:', checkError);
    return;
  }
  
  if (existingFixture) {
    console.log('Fixture already exists in the database:', existingFixture);
    return;
  }
  
  // Fetch fixture data from API
  console.log('Fetching fixture from API-Football...');
  const fixtureData = await getFixtureById(fixtureId);
  
  if (!fixtureData) {
    console.error('Failed to fetch fixture data from API');
    return;
  }
  
  console.log('Fixture data:', fixtureData);
  
  // Insert fixture into database
  console.log('Inserting fixture into database...');
  
  const { data: insertResult, error: insertError } = await supabase
    .from('fixtures')
    .insert({
      fixture_id: fixtureData.fixture.id,
      league_id: fixtureData.league.id,
      home_id: fixtureData.teams.home.id,
      away_id: fixtureData.teams.away.id,
      utc_kickoff: fixtureData.fixture.date,
      status: fixtureData.fixture.status.short,
      score_home: fixtureData.goals.home,
      score_away: fixtureData.goals.away
    })
    .select()
    .single();
  
  if (insertError) {
    console.error('Error inserting fixture:', insertError);
    return;
  }
  
  console.log('Fixture inserted successfully:', insertResult);
}

// Run the function
checkFixtures()
  .catch(error => console.error('Error running script:', error))
  .finally(() => process.exit()); 