/**
 * Script for generating predictions for football matches using API-Football and OpenAI
 * 
 * Gets match data, odds, and predictions from API-Football,
 * creates a prompt for OpenAI and saves the result to Supabase
 */

import { getOddsForFixture, getPredictionsForFixture, getFixtureById } from '@/lib/apiFootball';
import { supabase } from '@/utils/supabase';

// Interface for structured bets
interface ValueBet {
  market: string;
  odds: number;
  confidence: number;
}

// Interface for prediction results
interface PredictionResult {
  chain_of_thought: string;
  final_prediction: string;
  value_bets: ValueBet[];
}

/**
 * Main function for generating match predictions
 * @param fixtureId Football match ID from API-Football
 * @returns ID of the created database record or null in case of error
 */
export async function generatePrediction(fixtureId: number): Promise<string | null> {
  try {
    console.log(`Generating prediction for match ID: ${fixtureId}`);
    
    // Get match data
    console.log("Getting match information...");
    const fixtureData = await getFixtureById(fixtureId);
    if (!fixtureData) {
      throw new Error(`Match with ID ${fixtureId} not found`);
    }

    // Get odds
    console.log("Getting odds...");
    const oddsData = await getOddsForFixture(fixtureId);
    
    // Get predictions
    console.log("Getting predictions...");
    const predictionsData = await getPredictionsForFixture(fixtureId);

    if (!oddsData || !predictionsData) {
      throw new Error('Could not get all the necessary data for analysis');
    }

    // Build prompt for OpenAI
    const prompt = buildPrompt(fixtureData, oddsData, predictionsData);
    
    // Send request to OpenAI
    console.log("Sending request to OpenAI...");
    const aiResponse = await callOpenAI(prompt);
    
    // Parse response
    console.log("Processing OpenAI response...");
    const parsedResponse = parseOpenAIResponse(aiResponse);
    
    // Save result to Supabase
    console.log("Saving prediction to database...");
    const { data, error } = await supabase
      .from('ai_predictions')
      .insert({
        fixture_id: fixtureId,
        type: "pre-match",
        chain_of_thought: parsedResponse.chain_of_thought,
        final_prediction: parsedResponse.final_prediction,
        value_bets_json: JSON.stringify(parsedResponse.value_bets),
        model_version: process.env.OPENAI_API_MODEL || "o4-mini",
        generated_at: new Date().toISOString(),
      })
      .select();
    
    if (error) {
      throw new Error(`Error saving to Supabase: ${error.message}`);
    }
    
    console.log(`Prediction successfully saved with ID: ${data[0].id}`);
    return data[0].id;
    
  } catch (error) {
    console.error('Error generating prediction:', error);
    return null;
  }
}

/**
 * Builds a prompt for OpenAI based on match data
 */
function buildPrompt(fixtureData: any, oddsData: any, predictionsData: any): string {
  const homeTeam = fixtureData.teams.home.name;
  const awayTeam = fixtureData.teams.away.name;
  const leagueName = fixtureData.league.name;
  const kickoffTime = new Date(fixtureData.fixture.date).toLocaleString();
  
  // Prepare odds data for popular markets
  let oddsInfo = "Odds not available";
  
  if (oddsData && oddsData.length > 0 && oddsData[0].bookmakers && oddsData[0].bookmakers.length > 0) {
    const bookmaker = oddsData[0].bookmakers[0];
    const markets = bookmaker.bets;
    
    oddsInfo = "Odds:\n";
    
    // Add match outcomes (1X2)
    const homeDrawAway = markets.find((m: any) => m.name === "Match Winner");
    if (homeDrawAway) {
      oddsInfo += "Match outcome:\n";
      homeDrawAway.values.forEach((v: any) => {
        oddsInfo += `- ${v.value}: ${v.odd}\n`;
      });
    }
    
    // Add totals
    const overUnder = markets.find((m: any) => m.name === "Goals Over/Under");
    if (overUnder) {
      oddsInfo += "\nTotals:\n";
      overUnder.values.forEach((v: any) => {
        oddsInfo += `- ${v.value}: ${v.odd}\n`;
      });
    }
    
    // Add both teams to score
    const btts = markets.find((m: any) => m.name === "Both Teams Score");
    if (btts) {
      oddsInfo += "\nBoth teams to score:\n";
      btts.values.forEach((v: any) => {
        oddsInfo += `- ${v.value}: ${v.odd}\n`;
      });
    }
  }
  
  // Prepare prediction data
  let predictionsInfo = "Predictions not available";
  
  if (predictionsData && predictionsData.predictions) {
    const p = predictionsData.predictions;
    predictionsInfo = `API Predictions:\n`;
    predictionsInfo += `- ${homeTeam} win: ${p.percent.home}%\n`;
    predictionsInfo += `- Draw: ${p.percent.draw}%\n`;
    predictionsInfo += `- ${awayTeam} win: ${p.percent.away}%\n\n`;
    
    if (p.advice) {
      predictionsInfo += `API Advice: ${p.advice}\n`;
    }
    
    if (predictionsData.teams && predictionsData.teams.home && predictionsData.teams.away) {
      const home = predictionsData.teams.home;
      const away = predictionsData.teams.away;
      
      predictionsInfo += `\n${homeTeam} form: ${home.league.form}\n`;
      predictionsInfo += `${awayTeam} form: ${away.league.form}\n\n`;
      
      predictionsInfo += `Average goals scored (${homeTeam}): ${home.league.goals.for.average.total}\n`;
      predictionsInfo += `Average goals conceded (${homeTeam}): ${home.league.goals.against.average.total}\n`;
      predictionsInfo += `Average goals scored (${awayTeam}): ${away.league.goals.for.average.total}\n`;
      predictionsInfo += `Average goals conceded (${awayTeam}): ${away.league.goals.against.average.total}\n`;
    }
  }
  
  // Build the full prompt
  return `
You are an experienced football analyst and betting expert. Your task is to analyze the upcoming match and provide in-depth analysis with specific betting recommendations.

Match information:
- Match: ${homeTeam} vs ${awayTeam}
- League: ${leagueName}
- Date and time: ${kickoffTime}

${oddsInfo}

${predictionsInfo}

Based on this data:

1. First, provide a detailed analysis (Chain of Thought), considering:
   - Current form of both teams
   - Head-to-head history
   - Injuries and suspensions (if information is available)
   - Tactical analysis
   - Key factors influencing the outcome
   - League specifics and match conditions

2. Then provide a short final prediction (Final Prediction) in 2-3 sentences.

3. Finally, list TOP-3 value bets in the following format:
   Market: [market name]
   Odds: [number]
   Confidence: [number]%

Your answer should be structured as follows:

CHAIN OF THOUGHT:
[Your detailed analysis]

FINAL PREDICTION:
[Brief final prediction]

VALUE BETS:
Market: [market name 1]
Odds: [number]
Confidence: [number]%

Market: [market name 2]
Odds: [number]
Confidence: [number]%

Market: [market name 3]
Odds: [number]
Confidence: [number]%
`;
}

/**
 * Sends a request to the OpenAI API
 * @param prompt Request text
 * @returns Response from the API
 */
async function callOpenAI(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_API_MODEL || "o4-mini";
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not found in environment variables');
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: "You are an experienced football analyst and betting expert. Answer only in English."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        top_p: 1.0,
        max_tokens: 2048,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API Error: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
    
  } catch (error) {
    throw new Error(`Error contacting OpenAI: ${error}`);
  }
}

/**
 * Parses the OpenAI response
 * @param response Response text
 * @returns Structured result
 */
function parseOpenAIResponse(response: string): PredictionResult {
  // Split the response into parts by keywords
  const chainRegex = /CHAIN OF THOUGHT:([\s\S]*?)(?=FINAL PREDICTION:|$)/i;
  const finalRegex = /FINAL PREDICTION:([\s\S]*?)(?=VALUE BETS:|$)/i;
  const valueBetsRegex = /VALUE BETS:([\s\S]*?)$/i;
  
  const chainMatch = response.match(chainRegex);
  const finalMatch = response.match(finalRegex);
  const valueBetsMatch = response.match(valueBetsRegex);
  
  // Extract chain of thought
  const chainOfThought = chainMatch && chainMatch[1] ? chainMatch[1].trim() : '';
  
  // Extract final prediction
  const finalPrediction = finalMatch && finalMatch[1] ? finalMatch[1].trim() : '';
  
  // Parse bets
  const valueBets: ValueBet[] = [];
  
  if (valueBetsMatch && valueBetsMatch[1]) {
    const valueBetsText = valueBetsMatch[1].trim();
    
    // Split text into bet blocks (separated by empty lines)
    const betBlocks = valueBetsText.split(/\n\s*\n/);
    
    for (const block of betBlocks) {
      if (!block.trim()) continue;
      
      const marketMatch = block.match(/Market:\s*(.+)/i);
      const oddsMatch = block.match(/Odds:\s*(\d+\.?\d*)/i);
      const confidenceMatch = block.match(/Confidence:\s*(\d+)%/i);
      
      if (marketMatch && oddsMatch && confidenceMatch) {
        valueBets.push({
          market: marketMatch[1].trim(),
          odds: parseFloat(oddsMatch[1]),
          confidence: parseInt(confidenceMatch[1], 10)
        });
      }
    }
  }
  
  return {
    chain_of_thought: chainOfThought,
    final_prediction: finalPrediction,
    value_bets: valueBets
  };
}

/**
 * Main function for manual script execution
 */
async function main() {
  try {
    // Test match ID
    const testFixtureId = 1090754; // Can be replaced with an actual match ID
    
    console.log('Starting prediction generation...');
    const result = await generatePrediction(testFixtureId);
    
    if (result) {
      console.log(`Prediction successfully generated and saved with ID: ${result}`);
      process.exit(0);
    } else {
      console.error('Failed to generate prediction');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error running script:', error);
    process.exit(1);
  }
}

// Run script if called directly
if (require.main === module) {
  main();
}

export default generatePrediction; 