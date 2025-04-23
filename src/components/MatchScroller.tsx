"use client";

import { useState } from "react";
import MatchCard from "@/components/MatchCard";
import ReasoningModal from "@/components/ReasoningModal";

interface Match {
  id: string;
  match: string;
  league: string;
}

const mockMatches = [
  { id: "1", match: "Liverpool vs Man City", league: "Premier League" },
  { id: "2", match: "Barcelona vs Real Madrid", league: "La Liga" },
  { id: "3", match: "PSG vs Marseille", league: "Ligue 1" },
  { id: "4", match: "Bayern vs Dortmund", league: "Bundesliga" },
  { id: "5", match: "Juventus vs Napoli", league: "Serie A" },
];

export default function MatchScroller() {
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);

  return (
    <div className="overflow-x-auto w-full pb-4">
      <div className="flex space-x-4 px-4 min-w-max">
        {mockMatches.map((match) => (
          <MatchCard 
            key={match.id} 
            match={match} 
            onClick={() => setActiveMatch(match)}
          />
        ))}
      </div>

      {activeMatch && (
        <ReasoningModal
          isOpen={true}
          onClose={() => setActiveMatch(null)}
          reasoning={`AI Analysis for ${activeMatch.match} match in ${activeMatch.league}`}
        />
      )}
    </div>
  );
} 