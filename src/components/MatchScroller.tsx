"use client";

import MatchCard from "./MatchCard"

const mockMatches = [
  { id: "1", match: "Liverpool vs Man City", league: "Premier League" },
  { id: "2", match: "Barcelona vs Real Madrid", league: "La Liga" },
  { id: "3", match: "PSG vs Marseille", league: "Ligue 1" },
  { id: "4", match: "Bayern vs Dortmund", league: "Bundesliga" },
  { id: "5", match: "Juventus vs Napoli", league: "Serie A" },
]

export default function MatchScroller() {
  return (
    <div className="overflow-x-auto w-full pb-4">
      <div className="flex space-x-4 px-4 min-w-max">
        {mockMatches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  )
} 