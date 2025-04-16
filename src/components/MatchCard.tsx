interface MatchCardProps {
  match: {
    id: string;
    match: string;
    league: string;
  };
}

export default function MatchCard({ match }: MatchCardProps) {
  return (
    <div 
      className="flex-shrink-0 w-64 bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-blue-500 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-blue-500/20"
    >
      <div className="p-4">
        <div className="text-xs text-gray-500 mb-2">{match.league}</div>
        <div className="text-white font-medium text-lg">{match.match}</div>
        <div className="mt-4 mb-2 flex justify-between">
          <span className="text-xs text-gray-500">Odds: 1.87</span>
          <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">Value</span>
        </div>
        <button className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm transition-colors">
          View Analysis
        </button>
      </div>
    </div>
  );
} 