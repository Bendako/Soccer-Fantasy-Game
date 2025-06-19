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
  position: string;
  selectedPlayerIds: Id<"players">[];
  onSelectPlayer: (player: Player) => void;
}

export function PlayerSelectionModal({
  isOpen,
  onClose,
  position,
  selectedPlayerIds,
  onSelectPlayer,
}: PlayerSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"points" | "goals" | "assists">("points");

  const players = useQuery(api.players.getPlayersByPosition, { position });
  const searchResults = useQuery(
    api.players.searchPlayers,
    searchTerm ? { searchTerm, position } : "skip"
  );

  const displayPlayers = searchTerm ? searchResults : players;

  // Filter out already selected players
  const availablePlayers = displayPlayers?.filter(player => 
    !selectedPlayerIds.includes(player._id)
  );

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Select {getPositionLabel(position)}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
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

          {/* Search and Sort */}
          <div className="mt-4 flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "points" | "goals" | "assists")}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="points">Sort by Points</option>
              <option value="goals">Sort by Goals</option>
              <option value="assists">Sort by Assists</option>
            </select>
          </div>
        </div>

        {/* Player List */}
        <div className="flex-1 overflow-y-auto p-6">
          {!sortedPlayers ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : sortedPlayers.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {selectedPlayerIds.length > 0 && displayPlayers && displayPlayers.length > 0 
                ? "All available players are already selected" 
                : "No players found"
              }
            </div>
          ) : (
            <div className="grid gap-3">
              {sortedPlayers.map((player) => {
                const isSelected = selectedPlayerIds.includes(player._id);
                const isUnavailable = player.injured || player.suspended;

                return (
                  <div
                    key={player._id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? "border-green-500 bg-green-50"
                        : isUnavailable
                        ? "border-red-200 bg-red-50 opacity-60"
                        : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                    }`}
                    onClick={() => !isUnavailable && onSelectPlayer(player)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Player Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-600">
                            {player.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </span>
                        </div>

                        {/* Player Info */}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">
                              {player.name}
                            </h3>
                            {player.jerseyNumber && (
                              <span className="text-sm text-gray-500">
                                #{player.jerseyNumber}
                              </span>
                            )}
                            {isUnavailable && (
                              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                                {player.injured ? "Injured" : "Suspended"}
                              </span>
                            )}
                          </div>
                                                     <div className="flex items-center gap-2 text-sm text-gray-600">
                             {player.realTeam && (
                               <>
                                 <div
                                   className="w-3 h-3 rounded-full"
                                   style={{ backgroundColor: player.realTeam.colors?.primary || "#6B7280" }}
                                 />
                                 <span>{player.realTeam.shortName}</span>
                                 <span>•</span>
                               </>
                             )}
                             <span>{getPositionLabel(player.position)}</span>
                           </div>
                        </div>
                      </div>

                      {/* Player Stats */}
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">
                            {player.totalPoints}
                          </div>
                          <div className="text-gray-500">Points</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">
                            {player.totalGoals}
                          </div>
                          <div className="text-gray-500">Goals</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">
                            {player.totalAssists}
                          </div>
                          <div className="text-gray-500">Assists</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">
                            {player.averagePoints.toFixed(1)}
                          </div>
                          <div className="text-gray-500">Avg/Game</div>
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
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {sortedPlayers?.length || 0} players available
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 