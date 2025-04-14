// data/mockBets.ts
import { Bet } from "@/types";

export const mockBets: Bet[] = [
  {
    matchId: "001",
    match: "Liverpool vs Man City",
    league: "Premier League",
    bet: "Liverpool to win",
    odds: 2.1,
    confidence: 0.74,
    valueIndex: 1.55,
    reasoning:
      "Liverpool has won 5 of their last 6 home matches. Man City will be missing their key defender due to injury, which weakens their back line significantly.",
  },
  {
    matchId: "002",
    match: "Barcelona vs Real Madrid",
    league: "La Liga",
    bet: "Both teams to score",
    odds: 1.85,
    confidence: 0.71,
    valueIndex: 1.31,
    reasoning:
      "Both teams have scored in 7 of their last 8 meetings. Barcelona's defense has been shaky lately, especially against top-tier teams.",
  },
  {
    matchId: "003",
    match: "Juventus vs AC Milan",
    league: "Serie A",
    bet: "Under 2.5 goals",
    odds: 1.95,
    confidence: 0.68,
    valueIndex: 1.33,
    reasoning:
      "Both sides play defensively in high-stakes games. 4 of the last 5 matchups between them have had under 2.5 goals.",
  },
  {
    matchId: "004",
    match: "PSG vs Lyon",
    league: "Ligue 1",
    bet: "PSG to win by 2+ goals",
    odds: 2.4,
    confidence: 0.63,
    valueIndex: 1.51,
    reasoning:
      "PSG are dominant at home and in excellent form. Lyon has lost 3 consecutive away games by 2 or more goals.",
  },
  {
    matchId: "005",
    match: "Bayern Munich vs Borussia Dortmund",
    league: "Bundesliga",
    bet: "Over 3.5 goals",
    odds: 2.0,
    confidence: 0.69,
    valueIndex: 1.38,
    reasoning:
      "This fixture historically produces high-scoring matches. Both teams are in attacking form, averaging over 2 goals per game.",
  },
  {
    matchId: "006",
    match: "Chelsea vs Arsenal",
    league: "Premier League",
    bet: "Arsenal to win or draw",
    odds: 1.75,
    confidence: 0.72,
    valueIndex: 1.26,
    reasoning:
      "Arsenal has not lost to Chelsea in their last 5 encounters. Their midfield dominance gives them a clear edge.",
  },
] 