/**
 * Script for generating predictions for football matches using API-Football and OpenAI
 * 
 * Gets match data, odds, and predictions from API-Football,
 * creates a prompt for OpenAI and saves the result to Supabase
 */

// Load environment variables from .env file
import 'dotenv/config';

// Explicit environment variable checks
if (!process.env.OPENAI_API_KEY) {
  throw new Error("❌ Missing OPENAI_API_KEY in .env");
}

if (!process.env.API_FOOTBALL_KEY) {
  throw new Error("❌ Missing API_FOOTBALL_KEY in .env");
}

if (!process.env.SUPABASE_URL) {
  throw new Error("❌ Missing SUPABASE_URL in .env");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env");
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("❌ Missing NEXT_PUBLIC_SUPABASE_URL in .env");
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in .env");
}

// Заменяем импорты с алиасом @ на относительные пути
import { getOddsForFixture, getPredictionsForFixture, getFixtureById } from '../src/lib/apiFootball';
import { supabase } from '../src/utils/supabase';
import { validateEnvOrExit } from '../src/utils/envCheck';

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
    // Validate environment variables first
    validateEnvOrExit();
    
    console.log(`Generating prediction for match ID: ${fixtureId}`);
    
    // Get match data
    console.log("Getting match information...");
    let fixtureData;
    try {
      fixtureData = await getFixtureById(fixtureId);
      if (!fixtureData) {
        throw new Error(`Match with ID ${fixtureId} not found`);
      }
      console.log(`✅ Successfully retrieved fixture data for ${fixtureData.teams.home.name} vs ${fixtureData.teams.away.name}`);
    } catch (error) {
      console.error(`❌ API-Football Error: Failed to get fixture data:`, error);
      throw new Error(`Failed to retrieve match data: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Get odds
    console.log("Getting odds...");
    let oddsData: any[] = [];
    try {
      const fetchedOdds = await getOddsForFixture(fixtureId);
      oddsData = fetchedOdds || [];
      if (oddsData.length > 0) {
        console.log(`✅ Successfully retrieved odds data with ${oddsData.length} bookmakers`);
      } else {
        console.warn(`⚠️ No odds data available for fixture ${fixtureId}`);
      }
    } catch (error) {
      console.error(`⚠️ API-Football Error: Failed to get odds data:`, error);
      // Don't throw, use fallback empty array
    }
    
    // Get predictions
    console.log("Getting predictions...");
    let predictionsData: any = null;
    const fallbackPredictionsData = {
      predictions: {
        percent: { home: "N/A", draw: "N/A", away: "N/A" },
        advice: "No prediction available"
      },
      teams: {
        home: { league: { form: "N/A", goals: { for: { average: { total: "N/A" } }, against: { average: { total: "N/A" } } } } },
        away: { league: { form: "N/A", goals: { for: { average: { total: "N/A" } }, against: { average: { total: "N/A" } } } } }
      }
    };
    
    try {
      const fetchedPredictions = await getPredictionsForFixture(fixtureId);
      predictionsData = fetchedPredictions || fallbackPredictionsData;
      if (predictionsData && predictionsData.predictions) {
        console.log(`✅ Successfully retrieved prediction data`);
      } else {
        console.warn(`⚠️ No prediction data available for fixture ${fixtureId}`);
        predictionsData = fallbackPredictionsData;
      }
    } catch (error) {
      console.error(`⚠️ API-Football Error: Failed to get prediction data:`, error);
      // Don't throw, use fallback
      predictionsData = fallbackPredictionsData;
    }

    // Build prompt for OpenAI
    const prompt = buildPrompt(fixtureData, oddsData, predictionsData);
    
    // Send request to OpenAI
    console.log("Sending request to OpenAI...");
    let aiResponse;
    try {
      aiResponse = await callOpenAI(prompt);
      console.log(`✅ Successfully received OpenAI response (${aiResponse.length} characters)`);
    } catch (error) {
      console.error(`❌ OpenAI Error:`, error);
      throw new Error(`Failed to get OpenAI prediction: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Parse response
    console.log("Processing OpenAI response...");
    let parsedResponse;
    try {
      parsedResponse = parseOpenAIResponse(aiResponse);
      
      // Validate that we have at least the basic prediction
      if (!parsedResponse.chain_of_thought || !parsedResponse.final_prediction) {
        console.warn(`⚠️ OpenAI response did not contain all required sections`);
        // Enhance with basic fallback data if needed
        if (!parsedResponse.chain_of_thought) {
          parsedResponse.chain_of_thought = `Analysis for ${fixtureData.teams.home.name} vs ${fixtureData.teams.away.name} could not be generated. Please check the fixture details and try again.`;
        }
        if (!parsedResponse.final_prediction) {
          parsedResponse.final_prediction = `Prediction for ${fixtureData.teams.home.name} vs ${fixtureData.teams.away.name} could not be generated.`;
        }
        if (parsedResponse.value_bets.length === 0) {
          parsedResponse.value_bets = [
            { market: "No value bet available", odds: 0, confidence: 0 }
          ];
        }
      }
    } catch (error) {
      console.error(`❌ Error parsing OpenAI response:`, error);
      throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Save result to Supabase
    console.log("Saving prediction to database...");
    try {
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
        .select()
        .single();
      
      if (error) {
        throw new Error(`Error saving to Supabase: ${error.message}`);
      }
      
      // Validate that data exists and has the expected format
      if (!data || !data.id) {
        throw new Error('Supabase returned no data or missing ID after insert');
      }
      
      console.log(`✅ Prediction successfully saved with ID: ${data.id}`);
      console.log(`✅ Inserted prediction for fixture: ${fixtureId}`);
      return data.id;
    } catch (error) {
      console.error(`❌ Supabase Error:`, error);
      throw new Error(`Failed to save prediction to database: ${error instanceof Error ? error.message : String(error)}`);
    }
    
  } catch (error) {
    console.error('❌ Error generating prediction:', error);
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
  
  console.log(`Using OpenAI model: ${model}`);
  
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
      console.error('OpenAI API Error Response:', errorText);
      throw new Error(`OpenAI API Error: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
    
  } catch (error) {
    console.error('Error details:', error);
    throw new Error(`Error contacting OpenAI: ${error}`);
  }
}

/**
 * Parses the OpenAI response
 * @param response Response text
 * @returns Structured result
 */
function parseOpenAIResponse(response: string): PredictionResult {
  // Log the full response for debugging
  console.log('Parsing OpenAI response...');
  
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
  
  // Log parsing results
  console.log(`Parsed ${valueBets.length} value bets`);
  
  return {
    chain_of_thought: chainOfThought,
    final_prediction: finalPrediction,
    value_bets: valueBets
  };
}

// Функция для обработки аргументов командной строки
export async function runWithArgs(): Promise<void> {
  // Проверяем, есть ли аргументы
  if (process.argv.length < 3) {
    console.log('Usage: ts-node generatePrediction.ts <fixtureId>');
    process.exit(1);
  }
  
  // Получаем ID матча из аргументов
  const fixtureId = parseInt(process.argv[2], 10);
  
  if (isNaN(fixtureId)) {
    console.error('Error: fixtureId must be a number');
    process.exit(1);
  }
  
  console.log('Starting prediction generation...');
  const result = await generatePrediction(fixtureId);
  
  if (result) {
    console.log(`Prediction successfully generated and saved with ID: ${result}`);
    process.exit(0);
  } else {
    console.error('Failed to generate prediction');
    process.exit(1);
  }
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
  // Если переданы аргументы, используем их
  if (process.argv.length > 2) {
    runWithArgs();
  } else {
    main();
  }
}

export default generatePrediction;