"use client";

import React, { useState } from "react";
import { Bet } from "@/types";

interface ValueBetsTableProps {
  bets: Bet[];
}

export default function ValueBetsTable({ bets }: ValueBetsTableProps) {
  const [expandedBet, setExpandedBet] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Bet>("valueIndex");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [activeAiButton, setActiveAiButton] = useState<string | null>(null);

  const toggleExpand = (matchId: string) => {
    if (expandedBet === matchId) {
      setExpandedBet(null);
    } else {
      setExpandedBet(matchId);
    }
  };

  const handleAiClick = (matchId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row expansion when clicking AI button
    setActiveAiButton(activeAiButton === matchId ? null : matchId);
    // In the future, this would open a modal with AI reasoning
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

  return (
    <div className="overflow-x-auto">
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
          {sortedBets.map((bet) => (
            <React.Fragment key={bet.matchId}>
              <tr
                className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
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
                    onClick={(e) => handleAiClick(bet.matchId, e)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      activeAiButton === bet.matchId
                        ? "bg-blue-600 text-white"
                        : "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
                    }`}
                  >
                    AI
                  </button>
                </td>
              </tr>
              {expandedBet === bet.matchId && (
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300"
                  >
                    <div className="font-medium mb-1 text-gray-900 dark:text-white">
                      Analysis:
                    </div>
                    <p>{bet.reasoning}</p>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
} 