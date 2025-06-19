"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface Player {
  _id: Id<"players">;
  name: string;
  position: string;
  jerseyNumber?: number;
  totalGoals: number;
  totalAssists: number;
  totalPoints: number;
  averagePoints: number;
  injured: boolean;
  suspended: boolean;
  realTeam: {
    name: string;
    shortName: string;
    colors?: {
      primary: string;
      secondary: string;
    };
  } | null;
}

interface PlayerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  position?: string; // Made optional to support all players view
  selectedPlayerIds: Id<"players">[];
  onPlayerSelect: (player: Player) => void;
  players?: Player[]; // Optional pre-loaded players array
}

export function PlayerSelectionModal({
  isOpen,
  onClose,
  position,
  selectedPlayerIds,
  onPlayerSelect,
  players: preloadedPlayers,
}: PlayerSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"points" | "goals" | "assists">("points");
  const [positionFilter, setPositionFilter] = useState<string>(position || "ALL");

  // Fetch players based on whether we have preloaded players or need to fetch by position
  const allPlayers = useQuery(api.players.getAllPlayers, preloadedPlayers ? "skip" : {});
  const positionPlayers = useQuery(
    api.players.getPlayersByPosition, 
    position && !preloadedPlayers ? { position } : "skip"
  );
  const searchResults = useQuery(
    api.players.searchPlayers,
    searchTerm ? { searchTerm, position: positionFilter === "ALL" ? undefined : positionFilter } : "skip"
  );

  // Debug logging
  console.log("PlayerSelectionModal Debug:", {
    preloadedPlayers: preloadedPlayers?.length,
    allPlayers: allPlayers?.length,
    positionPlayers: positionPlayers?.length,
    searchResults: searchResults?.length,
    searchTerm,
    position,
    positionFilter
  });

  // Determine which player data to use
  let displayPlayers = searchTerm ? searchResults : (preloadedPlayers || positionPlayers || allPlayers);

  // Apply position filter if in "ALL" mode and a specific position is selected
  if (!position && !searchTerm && positionFilter !== "ALL" && displayPlayers) {
    displayPlayers = displayPlayers.filter(player => player.position === positionFilter);
  }

  console.log("After filtering:", {
    displayPlayersLength: displayPlayers?.length,
    selectedPlayerIds: selectedPlayerIds.length,
    positionFilter
  });

  // Filter out already selected players
  const availablePlayers = displayPlayers?.filter(player => {
    // Simply check if this player's ID is already in the selectedPlayerIds array
    return !selectedPlayerIds.includes(player._id);
  });

  console.log("Available players after filtering selected:", availablePlayers?.length);

  const sortedPlayers = availablePlayers?.sort((a, b) => {
    switch (sortBy) {
      case "goals":
        return b.totalGoals - a.totalGoals;
      case "assists":
        return b.totalAssists - a.totalAssists;
      default:
        return b.totalPoints - a.totalPoints;
    }
  });

  const getPositionLabel = (pos: string) => {
    switch (pos) {
      case "GK":
        return "Goalkeeper";
      case "DEF":
        return "Defender";
      case "MID":
        return "Midfielder";
      case "FWD":
        return "Forward";
      default:
        return pos;
    }
  };

  const getModalTitle = () => {
    if (position) {
      return `Select ${getPositionLabel(position)}`;
    }
    return positionFilter === "ALL" ? "Select Players" : `Select ${getPositionLabel(positionFilter)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 w-full max-w-4xl max-h-[90vh] flex flex-col mx-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-emerald-900">
              {getModalTitle()}
            </h2>
            <button
              onClick={onClose}
              className="text-emerald-400 hover:text-emerald-600 p-2 rounded-full hover:bg-emerald-100 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Search, Position Filter, and Sort */}
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <svg className="w-5 h-5 text-emerald-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 bg-white/80 backdrop-blur-sm shadow-sm transition-all text-black placeholder-gray-500"
              />
            </div>
            {!position && (
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 bg-white/80 backdrop-blur-sm shadow-sm transition-all font-medium text-black"
              >
                <option value="ALL">All Positions</option>
                <option value="GK">Goalkeepers</option>
                <option value="DEF">Defenders</option>
                <option value="MID">Midfielders</option>
                <option value="FWD">Forwards</option>
              </select>
            )}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "points" | "goals" | "assists")}
              className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 bg-white/80 backdrop-blur-sm shadow-sm transition-all font-medium text-black"
            >
              <option value="points">Sort by Points</option>
              <option value="goals">Sort by Goals</option>
              <option value="assists">Sort by Assists</option>
            </select>
          </div>
        </div>

        {/* Player List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {!sortedPlayers ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : sortedPlayers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-slate-600 font-semibold text-lg mb-2">
                {selectedPlayerIds.length > 0 && displayPlayers && displayPlayers.length > 0 
                  ? "All available players are already selected" 
                  : "No players found"
                }
              </p>
              <p className="text-slate-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {sortedPlayers.map((player) => {
                const isSelected = selectedPlayerIds.includes(player._id);
                const isUnavailable = player.injured || player.suspended;

                return (
                  <div
                    key={player._id}
                    className={`p-4 border rounded-xl transition-all transform hover:scale-[1.02] ${
                      isSelected
                        ? "border-emerald-500 bg-gradient-to-r from-emerald-50 to-emerald-100 opacity-70 cursor-not-allowed shadow-md"
                        : isUnavailable
                        ? "border-red-300 bg-gradient-to-r from-red-50 to-orange-50 opacity-70 cursor-not-allowed"
                        : "border-slate-200 hover:border-emerald-400 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 cursor-pointer hover:shadow-lg"
                    }`}
                    onClick={() => {
                      if (!isUnavailable && !isSelected) {
                        onPlayerSelect(player);
                      }
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1">
                        {/* Player Avatar */}
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-md ${
                          player.position === 'GK' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                          player.position === 'DEF' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                          player.position === 'MID' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                          'bg-gradient-to-br from-red-500 to-rose-600'
                        }`}>
                          <span>
                            {player.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </span>
                        </div>

                        {/* Player Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                            <h3 className="font-bold text-slate-900 text-base sm:text-lg truncate">
                              {player.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                              {player.jerseyNumber && (
                                <span className="text-xs sm:text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full font-medium">
                                  #{player.jerseyNumber}
                                </span>
                              )}
                              {isUnavailable && (
                                <span className="px-2 sm:px-3 py-1 text-xs font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full shadow-sm">
                                  {player.injured ? "Injured" : "Suspended"}
                                </span>
                              )}
                              {isSelected && (
                                <span className="px-2 sm:px-3 py-1 text-xs font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full shadow-sm">
                                  ✓ Selected
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                            {player.realTeam && (
                              <>
                                <div
                                  className="w-3 h-3 rounded-full shadow-sm"
                                  style={{ backgroundColor: player.realTeam.colors?.primary || "#6B7280" }}
                                />
                                <span className="font-medium">{player.realTeam.shortName}</span>
                                <span className="text-slate-400">•</span>
                              </>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              player.position === 'GK' ? 'bg-yellow-100 text-yellow-800' :
                              player.position === 'DEF' ? 'bg-blue-100 text-blue-800' :
                              player.position === 'MID' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {getPositionLabel(player.position)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Player Stats */}
                      <div className="flex items-center justify-between sm:gap-6 text-xs sm:text-sm bg-slate-50 sm:bg-transparent rounded-lg sm:rounded-none p-2 sm:p-0 mt-2 sm:mt-0">
                        <div className="text-center">
                          <div className="font-bold text-emerald-700 text-sm sm:text-lg">
                            {player.totalPoints}
                          </div>
                          <div className="text-slate-500 font-medium text-xs sm:text-sm">Points</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-slate-700 text-sm sm:text-lg">
                            {player.totalGoals}
                          </div>
                          <div className="text-slate-500 font-medium text-xs sm:text-sm">Goals</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-slate-700 text-sm sm:text-lg">
                            {player.totalAssists}
                          </div>
                          <div className="text-slate-500 font-medium text-xs sm:text-sm">Assists</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-slate-700 text-sm sm:text-lg">
                            {(player.averagePoints || 0).toFixed(1)}
                          </div>
                          <div className="text-slate-500 font-medium text-xs sm:text-sm">Avg/Game</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-emerald-200 bg-gradient-to-r from-slate-50 to-emerald-50">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center">
            <div className="text-sm text-slate-600 font-medium text-center sm:text-left">
              <span className="text-emerald-700 font-bold">{sortedPlayers?.length || 0}</span> players available
            </div>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2 text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg font-medium transition-colors shadow-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 