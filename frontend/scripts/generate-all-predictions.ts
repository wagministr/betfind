/**
 * Script for generating predictions for all available upcoming matches
 * 
 * Gets a list of upcoming matches, checks for existing predictions in the database
 * and generates missing predictions using OpenAI
 */

// Load environment variables from .env file
import 'dotenv/config';

// Заменяем импорты с алиасом @ на относительные пути
import { getUpcomingFixtures, Fixture } from '../src/lib/apiFootball';
import { supabase } from '../src/utils/supabase';
import generatePrediction from './generatePrediction';
import { validateEnvOrExit } from '../src/utils/envCheck';

/**
 * Main function for generating predictions for all matches
 */
export async function generateAllPredictions(): Promise<{
  total: number;
  generated: number;
  skipped: number;
  failed: number;
}> {
  const summary = {
    total: 0,
    generated: 0,
    skipped: 0,
    failed: 0
  };

  try {
    // Validate environment variables
    validateEnvOrExit();
    
    // Get all upcoming matches from Premier League and La Liga
    console.log('Getting list of upcoming matches...');
    const fixtures = await getUpcomingFixtures([39, 140], 3);
    summary.total = fixtures.length;
    
    console.log(`Found ${fixtures.length} upcoming matches`);
    
    if (fixtures.length === 0) {
      console.log('No upcoming matches for prediction generation.');
      return summary;
    }
    
    // Get existing predictions from database
    console.log('Getting existing predictions from database...');
    const { data: existingPredictions, error } = await supabase
      .from('ai_predictions')
      .select('fixture_id')
      .eq('type', 'pre-match');
    
    if (error) {
      console.error('Error getting existing predictions:', error);
      throw error;
    }
    
    // Create a set of match IDs that already have predictions
    const existingFixtureIds = new Set(existingPredictions?.map((p: { fixture_id: number }) => p.fixture_id) || []);
    console.log(`Found ${existingFixtureIds.size} existing predictions`);
    
    // Filter matches that don't have predictions yet
    const fixturesNeedingPredictions = fixtures.filter((f: Fixture) => !existingFixtureIds.has(f.fixture.id));
    console.log(`Need to generate ${fixturesNeedingPredictions.length} new predictions`);
    
    // Generate predictions with pauses between requests
    for (let i = 0; i < fixturesNeedingPredictions.length; i++) {
      const fixture = fixturesNeedingPredictions[i];
      const fixtureId = fixture.fixture.id;
      
      console.log(`[${i+1}/${fixturesNeedingPredictions.length}] Generating prediction for match ${fixture.teams.home.name} vs ${fixture.teams.away.name}...`);
      
      try {
        // Generate prediction
        const predictionId = await generatePrediction(fixtureId);
        
        if (predictionId) {
          console.log(`✅ Prediction successfully generated with ID: ${predictionId}`);
          summary.generated++;
        } else {
          console.log(`❌ Failed to generate prediction for match with ID: ${fixtureId}`);
          summary.failed++;
        }
      } catch (err) {
        console.error(`❌ Error generating prediction for match with ID: ${fixtureId}:`, err);
        summary.failed++;
      }
      
      // Pause between requests to avoid exceeding OpenAI API limits
      if (i < fixturesNeedingPredictions.length - 1) {
        console.log('Pausing 5 seconds before next request...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    // Update skipped match statistics
    summary.skipped = existingFixtureIds.size;
    
    return summary;
    
  } catch (err) {
    console.error('Error generating predictions:', err);
    // Приводим тип ошибки к Error или используем строку сообщения
    const error = err as Error;
    throw new Error(`Failed to generate predictions: ${error.message}`);
  }
}

/**
 * Function for manual script execution
 */
async function main() {
  try {
    console.log('Starting prediction generation for all matches...');
    const result = await generateAllPredictions();
    
    console.log('\n--- Prediction Generation Results ---');
    console.log(`Total matches: ${result.total}`);
    console.log(`Predictions generated: ${result.generated}`);
    console.log(`Skipped (already have predictions): ${result.skipped}`);
    console.log(`Failed to generate: ${result.failed}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error executing script:', error);
    process.exit(1);
  }
}

// Run script if called directly
if (require.main === module) {
  main();
}