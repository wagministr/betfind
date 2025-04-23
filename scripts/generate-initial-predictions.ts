import { supabase } from '../src/utils/supabase';
import { getUpcomingFixtures, Fixture } from '../src/lib/apiFootball';
import dotenv from 'dotenv';

dotenv.config();

// Generate reasoning text based on fixture data
const generateReasoning = (fixture: Fixture): string => {
  const homeTeam = fixture.teams.home.name;
  const awayTeam = fixture.teams.away.name;
  const date = new Date(fixture.fixture.date).toLocaleDateString();
  const time = new Date(fixture.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return `Analyzing the upcoming match between ${homeTeam} and ${awayTeam}, scheduled for ${date} at ${time}, we can identify several key factors that could influence the outcome.

${homeTeam} has shown consistent form in recent games, especially in home matches where they score an average of 2.1 goals per game. Their attacking line is in excellent form, and their defense concedes rarely — an average of 0.8 goals per home game.

${awayTeam}, on the contrary, is experiencing certain difficulties in away matches, especially against teams with strong home support. In their last 5 away games, they scored only 3 goals and conceded 7.

Head-to-head statistics also favor ${homeTeam} — 3 wins in the last 5 matches. Additionally, 4 out of the last 5 games between these teams saw more than 2.5 goals scored.

Tactical analysis shows that ${homeTeam} will likely dominate in the midfield and create more dangerous opportunities. ${awayTeam} is expected to focus on counter-attacks, but this strategy is unlikely to be sufficient for a win.

The current odds offered by bookmakers undervalue ${homeTeam}'s chances, presenting value betting opportunities. Given all factors analyzed, we recommend considering bets on ${homeTeam} to win or Over 2.5 goals, which have historically been successful in similar match contexts.`;
};

// Generate final prediction text
const generateFinalPrediction = (fixture: Fixture): string => {
  const homeTeam = fixture.teams.home.name;
  const awayTeam = fixture.teams.away.name;
  
  // Randomly choose the winner, with a bias toward home team
  const random = Math.random();
  let winner;
  let probability;
  
  if (random < 0.6) { // 60% chance for home team
    winner = homeTeam;
    probability = Math.floor(Math.random() * 20) + 60; // 60-80% probability
  } else if (random < 0.8) { // 20% chance for draw
    winner = "Draw";
    probability = Math.floor(Math.random() * 15) + 25; // 25-40% probability
  } else { // 20% chance for away team
    winner = awayTeam;
    probability = Math.floor(Math.random() * 20) + 40; // 40-60% probability
  }
  
  return `${winner === "Draw" ? "Draw" : `${winner} to win`} with ${probability}% probability`;
};

// Generate value bets for a fixture
const generateValueBets = (fixture: Fixture) => {
  const homeTeam = fixture.teams.home.name;
  const awayTeam = fixture.teams.away.name;
  
  // Create an array of potential markets
  const markets = [
    { name: `${homeTeam} to win`, baseOdds: 1.8, baseConfidence: 65 },
    { name: `${awayTeam} to win`, baseOdds: 3.2, baseConfidence: 40 },
    { name: "Draw", baseOdds: 3.5, baseConfidence: 30 },
    { name: "Over 2.5 Goals", baseOdds: 1.9, baseConfidence: 70 },
    { name: "Under 2.5 Goals", baseOdds: 2.0, baseConfidence: 60 },
    { name: "Both Teams to Score", baseOdds: 1.75, baseConfidence: 75 },
    { name: "No Goal", baseOdds: 9.0, baseConfidence: 15 },
    { name: `${homeTeam} to Score First`, baseOdds: 1.6, baseConfidence: 70 },
    { name: `${awayTeam} to Score First`, baseOdds: 2.5, baseConfidence: 45 }
  ];
  
  // Add some randomness to the odds and confidence
  const randomizedMarkets = markets.map(market => ({
    market: market.name,
    odds: market.baseOdds + (Math.random() * 0.6 - 0.3), // +/- 0.3
    confidence: Math.min(95, Math.max(10, market.baseConfidence + (Math.random() * 10 - 5))) // +/- 5, min 10, max 95
  }));
  
  // Sort by confidence and pick the top 3-5
  randomizedMarkets.sort((a, b) => b.confidence - a.confidence);
  const numBets = Math.floor(Math.random() * 3) + 3; // 3-5 bets
  return randomizedMarkets.slice(0, numBets);
};

// Main function to generate predictions for all upcoming fixtures
const generatePredictions = async () => {
  try {
    console.log("Fetching upcoming fixtures...");
    // Get upcoming fixtures from multiple leagues - adjust league IDs as needed
    const leagueIds = [39, 140, 78, 61, 135]; // Premier League, La Liga, Bundesliga, Ligue 1, Serie A
    const fixtures = await getUpcomingFixtures(leagueIds, 7); // Next 7 days
    
    console.log(`Found ${fixtures.length} upcoming fixtures`);
    
    for (let i = 0; i < fixtures.length; i++) {
      const fixture = fixtures[i];
      console.log(`Processing fixture ${i+1}/${fixtures.length}: ${fixture.teams.home.name} vs ${fixture.teams.away.name}`);
      
      // Check if prediction already exists
      const { data: existingPredictions } = await supabase
        .from('ai_predictions')
        .select('id')
        .eq('fixture_id', fixture.fixture.id)
        .eq('type', 'pre-match');
      
      if (existingPredictions && existingPredictions.length > 0) {
        console.log(`Prediction already exists for fixture ${fixture.fixture.id}, skipping`);
        continue;
      }
      
      // Generate prediction elements
      const reasoning = generateReasoning(fixture);
      const finalPrediction = generateFinalPrediction(fixture);
      const valueBets = generateValueBets(fixture);
      
      // Insert into Supabase
      const { error } = await supabase
        .from('ai_predictions')
        .insert({
          fixture_id: fixture.fixture.id,
          chain_of_thought: reasoning,
          final_prediction: finalPrediction,
          value_bets_json: JSON.stringify(valueBets),
          model_version: "v1.0-initial",
          type: "pre-match",
          generated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error(`Error inserting prediction for fixture ${fixture.fixture.id}:`, error);
      } else {
        console.log(`Successfully created prediction for fixture ${fixture.fixture.id}`);
      }
      
      // Add a short delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log("Finished generating predictions");
    
  } catch (error) {
    console.error("Error generating predictions:", error);
  }
};

// Run the function
generatePredictions()
  .then(() => {
    console.log("Script execution completed");
    process.exit(0);
  })
  .catch(error => {
    console.error("Uncaught error:", error);
    process.exit(1);
  });
