// Bet type for storing bet information
export interface Bet {
  id: string;
  match: string;
  league: string;
  betType: string;
  odds: number;
  confidence: number;
  valueIndex: number;
  aiAnalysis: string;
  time: string;
  date: string;
} 