// data/mockBets.ts
import { Bet } from "@/types/Bet";

// Sample mock data for the ValueBetsTable component
export const mockBets: Bet[] = [
  {
    id: '1',
    match: 'Liverpool vs Manchester City',
    league: 'Premier League',
    betType: 'Over 2.5 Goals',
    odds: 1.85,
    confidence: 0.82,
    value: 1.68,
    aiAnalysis: 'High probability of goals based on recent form and head-to-head history',
    reasoning: `Based on recent form, Liverpool enters this match with a strong home advantage, having won 4 of their last 5 games at Anfield. Their attacking trio has been effective, averaging 2.1 goals per match, and Mohamed Salah appears to be in top shape.

Manchester City, on the other hand, has shown some inconsistency on the road, especially when facing high-press teams. While their overall possession stats remain high (averaging 62% per game), they have conceded early goals in 3 of their last 4 away fixtures.

From a tactical standpoint, Klopp is expected to press high and target City's flanks, especially exploiting the right side where City has allowed 40% of their xG conceded. Haaland remains a threat, but his touches in the box have decreased by 18% over the last three matches due to tighter marking.

Weather conditions at Anfield are mild with no expected rain, which typically benefits Liverpool's faster playstyle. Referee assignments suggest a higher likelihood of cards, which could influence momentum in the second half.

Overall, the expected goals (xG) model favors Liverpool slightly at 1.65 to 1.38, suggesting a tight contest but with a slight edge for the home side. This match is likely to produce goals, with Over 2.5 being statistically supported in 7 of the last 8 head-to-head matchups.

Value may lie in markets like "Both Teams to Score" and "Liverpool Win or Draw," especially considering current bookmaker odds undervalue the home advantage.`,
    time: '20:45',
    date: '2024-03-10',
  },
  {
    id: '2',
    match: 'Barcelona vs Real Madrid',
    league: 'La Liga',
    betType: 'Barcelona Win',
    odds: 2.10,
    confidence: 0.75,
    value: 1.58,
    aiAnalysis: 'Barcelona showing strong home form and tactical advantages',
    reasoning: `El Clásico analysis reveals Barcelona's significant home advantage at the Camp Nou, with their possession-based style particularly effective against Real Madrid's recent tactical setup. Statistical analysis shows Barcelona maintaining 65% possession in their last 5 home games.

Real Madrid's recent away form has been inconsistent, with their high defensive line potentially vulnerable to Barcelona's quick transitions. Key player matchup analysis favors Barcelona in midfield control and attacking third entries.

Expected goals (xG) model predicts Barcelona 2.1 - Real Madrid 1.4, suggesting value in Barcelona win at current odds. Historical head-to-head data at Camp Nou supports this prediction.`,
    time: '21:00',
    date: '2024-03-17',
  },
  {
    id: '3',
    match: 'Bayern Munich vs Borussia Dortmund',
    league: 'Bundesliga',
    betType: 'Both Teams to Score',
    odds: 1.65,
    confidence: 0.88,
    value: 1.45,
    aiAnalysis: 'Both teams in strong scoring form with attacking style matchup',
    reasoning: `Der Klassiker presents a compelling case for goals from both sides. Bayern Munich's home record shows they've scored in 100% of their home games this season, while Dortmund has found the net in 92% of their away matches.

Recent tactical analysis shows both teams favoring aggressive pressing and quick transitions, leading to high-quality chances for both sides. The expected goals (xG) data supports this, with both teams averaging over 2.0 xG per game.

Historical head-to-head data at the Allianz Arena shows both teams scoring in 8 of the last 10 meetings. Current form and team news suggests this trend will continue.`,
    time: '18:30',
    date: '2024-03-24',
  },
  {
    id: '4',
    match: 'PSG vs Marseille',
    league: 'Ligue 1',
    betType: 'Over 3.5 Goals',
    odds: 2.20,
    confidence: 0.70,
    value: 1.54,
    aiAnalysis: 'Le Classique historically produces high-scoring matches',
    reasoning: `Le Classique analysis indicates a high probability of goals based on both teams' recent attacking output and historical head-to-head data. PSG's front three have contributed to 15 goals in their last 5 home games.

Marseille's pressing style typically leads to transition opportunities, with their matches averaging 3.2 goals this season. The expected goals (xG) model suggests a combined 3.8 xG for this fixture.

Weather conditions and referee appointment favor an open, attacking game. Both teams' current tactical setups and available personnel support the over 3.5 goals prediction.`,
    time: '20:45',
    date: '2024-03-31',
  },
  {
    id: '5',
    match: 'Arsenal vs Tottenham',
    league: 'Premier League',
    betType: 'Arsenal Win & Over 2.5',
    odds: 2.35,
    confidence: 0.72,
    value: 1.69,
    aiAnalysis: 'North London derby favors Arsenal\'s current form and tactical setup',
    reasoning: `North London derby analysis shows Arsenal's superior tactical organization and recent form giving them a significant edge. Their pressing metrics and possession stats in home games (averaging 64% possession) suggest they'll control the tempo.

Tottenham's high defensive line has been exploited in recent away games, conceding an average of 1.8 goals. Arsenal's quick transitions and wide attacking play matches up well against this vulnerability.

Expected goals (xG) model predicts Arsenal 2.4 - Tottenham 1.2, with Arsenal's home advantage and current form supporting the prediction. Historical derby data shows 76% of recent meetings producing over 2.5 goals.`,
    time: '16:30',
    date: '2024-04-07',
  },
  {
    id: '6',
    match: 'AC Milan vs AS Roma',
    league: 'Serie A',
    betType: 'Milan Win',
    odds: 1.95,
    confidence: 0.76,
    value: 1.48,
    aiAnalysis: 'Milan\'s home form and tactical superiority against Roma\'s current setup',
    reasoning: `Analysis of Milan's recent home performances shows strong tactical cohesion and effective pressing patterns. Their midfield control has been particularly impressive, winning 62% of duels in central areas.

Roma's away form has been inconsistent, with their defensive transitions showing vulnerability against teams that press high. Milan's attacking patterns and width should create numerous opportunities.

Expected goals (xG) model suggests Milan 1.8 - Roma 0.9, indicating value in the home win market at current odds.`,
    time: '20:45',
    date: '2024-04-14',
  },
  {
    id: '7',
    match: 'Celtic vs Rangers',
    league: 'Scottish Premiership',
    betType: 'Over 2.5 Goals',
    odds: 1.75,
    confidence: 0.80,
    value: 1.40,
    aiAnalysis: 'Old Firm derby historically produces high-scoring matches',
    reasoning: `Old Firm analysis shows both teams in strong scoring form, with Celtic averaging 2.5 goals per home game and Rangers scoring in 90% of their away matches. The derby atmosphere typically produces open, attacking football.

Recent tactical analysis reveals both teams' high defensive lines and aggressive pressing, creating transition opportunities. Set-piece effectiveness for both sides adds to the goal threat.

Historical data shows 75% of recent Old Firm derbies at Celtic Park going over 2.5 goals.`,
    time: '12:30',
    date: '2024-04-21',
  },
  {
    id: '8',
    match: 'Boca Juniors vs River Plate',
    league: 'Argentine Primera División',
    betType: 'Under 2.5 Goals',
    odds: 1.80,
    confidence: 0.78,
    value: 1.41,
    aiAnalysis: 'Superclásico matches typically tight and tactical',
    reasoning: `Superclásico analysis indicates a likely tactical battle, with both teams adopting cautious approaches. Recent head-to-head matches at La Bombonera have averaged 1.8 goals per game.

Both teams' defensive organization has been solid, with clean sheets in over 50% of their recent matches. The high-stakes nature of the derby typically leads to conservative tactical setups.

Weather conditions and pitch state suggest a slower-paced game, supporting the under 2.5 goals prediction.`,
    time: '21:00',
    date: '2024-04-28',
  }
]; 