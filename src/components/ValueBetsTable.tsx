"use client";

import React, { useState } from "react";
import { Bet } from "@/types";
import ReasoningModal from "./ReasoningModal";

interface ValueBetsTableProps {
  bets: Bet[];
  isAuthed?: boolean;
  onLoginClick?: () => void;
}

export default function ValueBetsTable({ 
  bets, 
  isAuthed = true, 
  onLoginClick = () => {} 
}: ValueBetsTableProps) {
  const [expandedBet, setExpandedBet] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Bet>("valueIndex");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [activeAiButton, setActiveAiButton] = useState<string | null>(null);
  const [activeReasoning, setActiveReasoning] = useState<string | null>(null);

  const toggleExpand = (matchId: string) => {
    if (!isAuthed) return; // Prevent expansion if not authenticated
    
    if (expandedBet === matchId) {
      setExpandedBet(null);
    } else {
      setExpandedBet(matchId);
    }
  };

  const handleAiClick = (bet: Bet, e: React.MouseEvent) => {
    if (!isAuthed) {
      e.stopPropagation();
      onLoginClick();
      return;
    }
    
    e.stopPropagation(); // Prevent row expansion when clicking AI button
    setActiveReasoning(bet.reasoning);
  };

  const handleSort = (field: keyof Bet) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedBets = [...bets].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100)}%`;
  };

  // Only show the full list if authenticated, otherwise show the last 3
  const visibleBets = isAuthed ? sortedBets : sortedBets.slice(-3);
  
  // Calculate which bets should be blurred - but we'll only apply blur to displayed rows
  const shouldBlur = (index: number) => {
    return !isAuthed && index < sortedBets.length - 3;
  };

  // Calculate height for the overlay (only cover the rows that should be blurred)
  const overlayHeightPercentage = !isAuthed ? (sortedBets.length - 3) / sortedBets.length * 100 : 0;

  return (
    <div className="relative">
      {/* Reasoning Modal */}
      <ReasoningModal 
        isOpen={activeReasoning !== null}
        onClose={() => setActiveReasoning(null)}
        reasoning={activeReasoning || ''}
      />

      {/* Login overlay for non-authenticated users - only cover the top portion */}
      {!isAuthed && (
        <div 
          className="absolute top-0 left-0 right-0 bg-gray-900/20 dark:bg-gray-900/40 backdrop-blur-[2px] flex items-center justify-center z-10"
          style={{ height: `${overlayHeightPercentage}%` }}
        >
          <div className="bg-white/90 dark:bg-gray-800/90 p-5 rounded-lg shadow-lg text-center">
            <h3 className="text-lg font-semibold mb-3 dark:text-white">
              Want to see all value bets?
            </h3>
            <button
              onClick={onLoginClick}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200"
            >
              Log in to access full list
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto z-0 relative">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("match")}
              >
                Match
                {sortField === "match" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("league")}
              >
                League
                {sortField === "league" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("bet")}
              >
                Bet
                {sortField === "bet" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("odds")}
              >
                Odds
                {sortField === "odds" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("confidence")}
              >
                Confidence
                {sortField === "confidence" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("valueIndex")}
              >
                Value
                {sortField === "valueIndex" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                AI
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {/* Use sortedBets instead of mapping over all bets */}
            {sortedBets.map((bet, index) => {
              // Only apply blur to the specific rows that should be blurred, not to the last 3
              const isBlurred = shouldBlur(index);
              
              return (
                <React.Fragment key={bet.matchId}>
                  <tr
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                      isBlurred ? "blur-sm opacity-50" : ""
                    }`}
                    onClick={() => toggleExpand(bet.matchId)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {bet.match}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {bet.league}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {bet.bet}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 font-mono">
                      {bet.odds.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div
                            className="bg-green-600 h-2.5 rounded-full"
                            style={{ width: `${bet.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-gray-500 dark:text-gray-300">
                          {formatPercentage(bet.confidence)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          bet.valueIndex >= 1.5
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : bet.valueIndex >= 1.3
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {bet.valueIndex.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={(e) => handleAiClick(bet, e)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          activeReasoning === bet.reasoning
                            ? "bg-blue-600 text-white"
                            : "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
                        }`}
                      >
                        AI
                      </button>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 