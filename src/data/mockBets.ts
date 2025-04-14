// data/mockBets.ts
import { Bet } from "@/types";

// Sample mock data for the ValueBetsTable component
export const mockBets: Bet[] = [
  {
    matchId: "1",
    match: "Manchester United vs Liverpool",
    league: "Premier League",
    bet: "Home Win",
    odds: 2.5,
    confidence: 0.75,
    valueIndex: 1.5,
    reasoning: "Liverpool has been struggling defensively in away games this season, while Manchester United has shown strong offensive performance at home. Historical head-to-head data suggests United performs well as underdogs in this matchup.",
    time: "Today 15:00",
    date: new Date().toISOString()
  },
  {
    matchId: "2",
    match: "Real Madrid vs Barcelona",
    league: "La Liga",
    bet: "Over 2.5 Goals",
    odds: 1.85,
    confidence: 0.82,
    valueIndex: 2.0,
    reasoning: "El Clásico matches have averaged 3.2 goals per game over the last 10 encounters. Both teams are in strong scoring form, with key attacking players available for both sides.",
    time: "Today 20:00",
    date: new Date().toISOString()
  },
  {
    matchId: "3",
    match: "Bayern Munich vs Borussia Dortmund",
    league: "Bundesliga",
    bet: "Both Teams to Score",
    odds: 1.65,
    confidence: 0.88,
    valueIndex: 1.8,
    reasoning: "Der Klassiker consistently delivers goals from both sides. The last 8 matches between these teams have seen both teams scoring. Bayern's high defensive line creates opportunities for Dortmund's quick attackers.",
    time: "Tomorrow 18:30",
    date: new Date(Date.now() + 86400000).toISOString()
  },
  {
    matchId: "4",
    match: "Juventus vs Inter Milan",
    league: "Serie A",
    bet: "Draw",
    odds: 3.2,
    confidence: 0.65,
    valueIndex: 2.5,
    reasoning: "Derby d'Italia matches are typically tight affairs. 4 of the last 7 encounters ended in draws. Both teams have strong defenses and are likely to adopt cautious approaches.",
    time: "Tomorrow 20:45",
    date: new Date(Date.now() + 86400000).toISOString()
  },
  {
    matchId: "5",
    match: "PSG vs Marseille",
    league: "Ligue 1",
    bet: "PSG -1.5",
    odds: 2.1,
    confidence: 0.70,
    valueIndex: 1.2,
    reasoning: "Le Classique has been dominated by PSG in recent years, winning by 2+ goals in 5 of the last 7 home matches against Marseille. PSG's attacking talent should create multiple scoring opportunities.",
    time: "Tomorrow 21:00",
    date: new Date(Date.now() + 86400000).toISOString()
  },
  {
    matchId: "6",
    match: "Ajax vs Feyenoord",
    league: "Eredivisie",
    bet: "Over 3.5 Goals",
    odds: 2.4,
    confidence: 0.72,
    valueIndex: 1.6,
    reasoning: "De Klassieker tends to be high-scoring, with 4+ goals in 6 of the last 8 matches between these rivals. Both teams favor attacking styles over defensive solidity.",
    time: "Sunday 14:30",
    date: new Date(Date.now() + 172800000).toISOString()
  },
  {
    matchId: "7",
    match: "Arsenal vs Tottenham",
    league: "Premier League",
    bet: "Arsenal Win",
    odds: 1.95,
    confidence: 0.78,
    valueIndex: 2.2,
    reasoning: "The North London derby has favored home teams historically. Arsenal's improved defensive organization and Tottenham's inconsistent away form suggest value in backing the Gunners.",
    time: "Sunday 16:30",
    date: new Date(Date.now() + 172800000).toISOString()
  },
  {
    matchId: "8",
    match: "AC Milan vs AS Roma",
    league: "Serie A", 
    bet: "Under 2.5 Goals",
    odds: 1.75,
    confidence: 0.80,
    valueIndex: 1.4,
    reasoning: "These matches have tended to be low-scoring in recent seasons, with 6 of the last 8 encounters seeing fewer than 3 goals. Both teams have solid defensive structures.",
    time: "Sunday 18:00",
    date: new Date(Date.now() + 172800000).toISOString()
  },
  {
    matchId: "9",
    match: "Celtic vs Rangers",
    league: "Scottish Premiership",
    bet: "Celtic -1",
    odds: 2.25,
    confidence: 0.68,
    valueIndex: 1.3,
    reasoning: "The Old Firm derby has been dominated by Celtic at home in recent seasons. Rangers' defensive vulnerabilities against high-pressing teams suggest Celtic can win by a margin.",
    time: "Sunday 12:00",
    date: new Date(Date.now() + 172800000).toISOString()
  },
  {
    matchId: "10",
    match: "Boca Juniors vs River Plate",
    league: "Argentine Primera División",
    bet: "Under 1.5 Goals",
    odds: 2.7,
    confidence: 0.62,
    valueIndex: 1.9,
    reasoning: "Superclásico matches are typically tense, low-scoring affairs, especially in high-stakes situations. The last 5 matches at La Bombonera have averaged just 1.2 goals per game.",
    time: "Sunday 22:00",
    date: new Date(Date.now() + 172800000).toISOString()
  }
]; 