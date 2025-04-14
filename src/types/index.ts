// Types for the application

export interface Bet {
  matchId: string;
  match: string;
  league: string;
  bet: string;
  odds: number;
  confidence: number;
  valueIndex: number;
  reasoning: string;
} 