"use client";

import React, { useState } from "react";
import { Bet } from "@/types/Bet";
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
  const [sortField, setSortField] = useState<keyof Bet>("value");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [activeAiButton, setActiveAiButton] = useState<string | null>(null);
  const [activeReasoning, setActiveReasoning] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    if (!isAuthed) return; // Prevent expansion if not authenticated
    
    if (expandedBet === id) {
      setExpandedBet(null);
    } else {
      setExpandedBet(id);
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
    <div className="relative w-full">
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
          <div className="bg-white/90 dark:bg-gray-800/90 p-4 sm:p-5 rounded-lg shadow-lg text-center max-w-[90%] sm:max-w-md">
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 dark:text-white">
              Want to see all value bets?
            </h3>
            <button
              onClick={onLoginClick}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 sm:px-4 rounded-md transition duration-200 text-sm sm:text-base"
            >
              Log in to access full list
            </button>
          </div>
        </div>
      )}

      <div className="w-full overflow-x-auto relative">
        <table className="min-w-[700px] sm:min-w-full table-auto divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                scope="col"
                className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
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
                className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
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
                className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("betType")}
              >
                Bet
                {sortField === "betType" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                scope="col"
                className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
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
                className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("confidence")}
              >
                Conf
                {sortField === "confidence" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                scope="col"
                className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("value")}
              >
                Value
                {sortField === "value" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                scope="col"
                className="px-3 sm:px-6 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
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
                <React.Fragment key={bet.id}>
                  <tr
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                      isBlurred ? "blur-sm opacity-50" : ""
                    }`}
                    onClick={() => toggleExpand(bet.id)}
                  >
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                      {bet.match}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-300">
                      {bet.league}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-300">
                      {bet.betType}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-300 font-mono">
                      {bet.odds.toFixed(2)}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${bet.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-gray-500 dark:text-gray-300 text-xs sm:text-sm">
                          {formatPercentage(bet.confidence)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          bet.value >= 1.5
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : bet.value >= 1.3
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {bet.value.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-center">
                      <button
                        onClick={(e) => handleAiClick(bet, e)}
                        className={`px-2 py-1 rounded-md text-white text-xs transition duration-150 ease-in-out
                          bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                        `}
                      >
                        Analysis
                      </button>
                    </td>
                  </tr>
                  {expandedBet === bet.id && (
                    <tr>
                      <td colSpan={7} className="px-3 sm:px-6 py-2 sm:py-4 bg-gray-50 dark:bg-gray-800">
                        <div className="flex flex-col sm:flex-row text-xs sm:text-sm">
                          <div className="flex-1 mb-2 sm:mb-0">
                            <p className="font-medium text-gray-900 dark:text-white mb-1">Date/Time:</p>
                            <p className="text-gray-500 dark:text-gray-300">{bet.date} - {bet.time}</p>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white mb-1">AI Analysis:</p>
                            <p className="text-gray-500 dark:text-gray-300 line-clamp-2">{bet.aiAnalysis}</p>
                            <button
                              onClick={(e) => handleAiClick(bet, e)}
                              className="mt-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline text-xs"
                            >
                              Read detailed analysis
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 