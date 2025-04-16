"use client";

interface Match {
  id: string
  match: string
  league: string
}

interface MatchCardProps {
  match: Match;
  onClick: () => void;
}

export default function MatchCard({ match, onClick }: MatchCardProps) {
  return (
    <button
      className="bg-white dark:bg-gray-800 text-black dark:text-white px-6 py-4 rounded-xl shadow-md hover:scale-105 transition-transform duration-200 min-w-[240px] text-left"
      onClick={onClick}
    >
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
        {match.league}
      </div>
      <div className="text-lg font-semibold">{match.match}</div>
    </button>
  )
} 