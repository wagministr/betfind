// Bet type for storing bet information
export interface Bet {
  id: string;
  match: string;
  league: string;
  betType: string;
  odds: number;
  confidence: number;
  value: number;
  aiAnalysis: string;
  reasoning: string;
  time: string;
  date: string;
} 