"use client";

import React, { useState, useEffect } from 'react';
import { useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export interface Player {
  _id: string;
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  realTeam?: {
    name: string;
    shortName: string;
    colors: {
      primary: string;
      secondary: string;
    };
  };
  totalPoints: number;
  jerseyNumber?: number;
  imageUrl?: string;
}

interface Formation {
  name: string;
  positions: {
    goalkeeper: { top: string; left: string }[];
    defenders: { top: string; left: string }[];
    midfielders: { top: string; left: string }[];
    forwards: { top: string; left: string }[];
  };
}

const formations: Record<string, Formation> = {
  '4-3-3': {
    name: '4-3-3',
    positions: {
      goalkeeper: [{ top: '85%', left: '50%' }],
      defenders: [
        { top: '70%', left: '20%' },
        { top: '70%', left: '40%' },
        { top: '70%', left: '60%' },
        { top: '70%', left: '80%' }
      ],
      midfielders: [
        { top: '50%', left: '30%' },
        { top: '50%', left: '50%' },
        { top: '50%', left: '70%' }
      ],
      forwards: [
        { top: '25%', left: '30%' },
        { top: '25%', left: '50%' },
        { top: '25%', left: '70%' }
      ]
    }
  },
  '4-4-2': {
    name: '4-4-2',
    positions: {
      goalkeeper: [{ top: '85%', left: '50%' }],
      defenders: [
        { top: '70%', left: '20%' },
        { top: '70%', left: '40%' },
        { top: '70%', left: '60%' },
        { top: '70%', left: '80%' }
      ],
      midfielders: [
        { top: '50%', left: '25%' },
        { top: '50%', left: '42%' },
        { top: '50%', left: '58%' },
        { top: '50%', left: '75%' }
      ],
      forwards: [
        { top: '25%', left: '40%' },
        { top: '25%', left: '60%' }
      ]
    }
  },
  '3-5-2': {
    name: '3-5-2',
    positions: {
      goalkeeper: [{ top: '85%', left: '50%' }],
      defenders: [
        { top: '70%', left: '30%' },
        { top: '70%', left: '50%' },
        { top: '70%', left: '70%' }
      ],
      midfielders: [
        { top: '50%', left: '20%' },
        { top: '50%', left: '35%' },
        { top: '50%', left: '50%' },
        { top: '50%', left: '65%' },
        { top: '50%', left: '80%' }
      ],
      forwards: [
        { top: '25%', left: '40%' },
        { top: '25%', left: '60%' }
      ]
    }
  }
};

interface TeamFormation {
  [key: string]: Player | null;
}

interface ExistingTeam {
  formation: string;
  players: {
    goalkeeper: Player;
    defenders: Player[];
    midfielders: Player[];
    forwards: Player[];
    captain: Player;
    viceCaptain: Player;
  };
  captainId: string;
  viceCaptainId: string;
}

interface FormationPitchProps {
  selectedPlayers: Player[];
  onPlayerSelect: (player: Player) => void;
  onRemovePlayer: (playerId: string) => void;
  userId: Id<"users">;
  gameweekId: Id<"gameweeks">;
  fantasyLeagueId: Id<"fantasyLeagues">;
  existingTeam?: ExistingTeam | null;
  isDeadlinePassed: boolean;
}

const positionColors = {
  GK: 'bg-gradient-to-br from-amber-400 to-orange-500',
  DEF: 'bg-gradient-to-br from-blue-500 to-indigo-600',
  MID: 'bg-gradient-to-br from-emerald-500 to-green-600',
  FWD: 'bg-gradient-to-br from-red-500 to-rose-600'
};

const positionLabels = {
  GK: 'GK',
  DEF: 'DEF',
  MID: 'MID',
  FWD: 'FWD'
};

export default function FormationPitch({ 
  selectedPlayers, 
  userId, 
  gameweekId, 
  fantasyLeagueId, 
  existingTeam, 
  isDeadlinePassed 
}: FormationPitchProps) {
  const [selectedFormation, setSelectedFormation] = useState<string>('4-3-3');
  const [teamFormation, setTeamFormation] = useState<TeamFormation>({});
  const [captain, setCaptain] = useState<string | null>(null);
  const [viceCaptain, setViceCaptain] = useState<string | null>(null);
  const [showPlayerModal, setShowPlayerModal] = useState<{show: boolean, slotId: string, position: string}>({
    show: false,
    slotId: '',
    position: ''
  });
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'points' | 'name'>('points');

  // Convex hooks
  const { user } = useUser();
  const saveFantasyTeam = useMutation(api.fantasyTeams.saveFantasyTeam);

  const currentFormation = formations[selectedFormation];

  // Close overlay on Escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && activeOverlay) {
        setActiveOverlay(null);
      }
    };

    if (activeOverlay) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [activeOverlay]);

  // Load existing team when component mounts or existingTeam changes
  useEffect(() => {
    if (existingTeam && existingTeam.players) {
      const loadedFormation: TeamFormation = {};
      
      // Set formation
      setSelectedFormation(existingTeam.formation);
      
      // Load goalkeeper
      if (existingTeam.players.goalkeeper) {
        loadedFormation['gk-0'] = existingTeam.players.goalkeeper;
      }
      
      // Load defenders
      existingTeam.players.defenders.forEach((defender, index) => {
        if (defender) {
          loadedFormation[`def-${index}`] = defender;
        }
      });
      
      // Load midfielders
      existingTeam.players.midfielders.forEach((midfielder, index) => {
        if (midfielder) {
          loadedFormation[`mid-${index}`] = midfielder;
        }
      });
      
      // Load forwards
      existingTeam.players.forwards.forEach((forward, index) => {
        if (forward) {
          loadedFormation[`fwd-${index}`] = forward;
        }
      });
      
      setTeamFormation(loadedFormation);
      setCaptain(existingTeam.captainId);
      setViceCaptain(existingTeam.viceCaptainId);
    }
  }, [existingTeam]);

  // Add a function to clear the entire team
  const handleClearTeam = () => {
    if (confirm('Are you sure you want to clear your entire team?')) {
      setTeamFormation({});
      setCaptain(null);
      setViceCaptain(null);
    }
  };

  // Validate if team is complete and ready to save
  const isTeamComplete = () => {
    const formation = formations[selectedFormation];
    const assignedPlayers = Object.values(teamFormation).filter(p => p !== null);
    
    const gkCount = assignedPlayers.filter(p => p?.position === 'GK').length;
    const defCount = assignedPlayers.filter(p => p?.position === 'DEF').length;
    const midCount = assignedPlayers.filter(p => p?.position === 'MID').length;
    const fwdCount = assignedPlayers.filter(p => p?.position === 'FWD').length;
    
    return (
      gkCount === 1 &&
      defCount === formation.positions.defenders.length &&
      midCount === formation.positions.midfielders.length &&
      fwdCount === formation.positions.forwards.length &&
      captain !== null &&
      viceCaptain !== null
    );
  };

  const handleSaveTeam = async () => {
    if (!user || !isTeamComplete() || isDeadlinePassed) return;

    try {
      setIsSaving(true);
      setSaveStatus('idle');

      // Organize players by position for the API
      const assignedPlayers = Object.values(teamFormation).filter(p => p !== null) as Player[];
      
      const goalkeeper = assignedPlayers.find(p => p.position === 'GK')!;
      const defenders = assignedPlayers.filter(p => p.position === 'DEF');
      const midfielders = assignedPlayers.filter(p => p.position === 'MID');
      const forwards = assignedPlayers.filter(p => p.position === 'FWD');

      // For bench players, use first available of each position not in starting XI
      const availableGK = selectedPlayers.filter(p => p.position === 'GK' && p._id !== goalkeeper._id)[0];
      const availableDEF = selectedPlayers.filter(p => p.position === 'DEF' && !defenders.find(d => d._id === p._id))[0];
      const availableMID = selectedPlayers.filter(p => p.position === 'MID' && !midfielders.find(m => m._id === p._id))[0];
      const availableFWD = selectedPlayers.filter(p => p.position === 'FWD' && !forwards.find(f => f._id === p._id))[0];

      await saveFantasyTeam({
        userId: userId,
        gameweekId: gameweekId,
        fantasyLeagueId: fantasyLeagueId,
        formation: selectedFormation,
        
        // Starting XI
        goalkeeper: goalkeeper._id as Id<"players">,
        defenders: defenders.map(p => p._id as Id<"players">),
        midfielders: midfielders.map(p => p._id as Id<"players">),
        forwards: forwards.map(p => p._id as Id<"players">),
        
        // Bench (using available players or defaults)
        benchGoalkeeper: availableGK?._id as Id<"players"> || goalkeeper._id as Id<"players">,
        benchDefender: availableDEF?._id as Id<"players"> || defenders[0]._id as Id<"players">,
        benchMidfielder: availableMID?._id as Id<"players"> || midfielders[0]._id as Id<"players">,
        benchForward: availableFWD?._id as Id<"players"> || forwards[0]._id as Id<"players">,
        
        // Captain system
        captainId: captain as Id<"players">,
        viceCaptainId: viceCaptain as Id<"players">,
      });

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving team:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSlotClick = (slotId: string, position: string) => {
    if (isDeadlinePassed) return;
    setSearchTerm(''); // Clear search when opening modal
    setShowPlayerModal({ show: true, slotId, position });
  };

  const handlePlayerAssign = (player: Player) => {
    // Check if this player is already assigned to any position
    const currentPlayerInSlot = teamFormation[showPlayerModal.slotId];
    const isPlayerAlreadyAssigned = Object.values(teamFormation).some(assignedPlayer => 
      assignedPlayer && assignedPlayer._id === player._id
    );
    
    // If player is already assigned and it's not the same slot, don't allow assignment
    if (isPlayerAlreadyAssigned && (!currentPlayerInSlot || currentPlayerInSlot._id !== player._id)) {
      alert(`${player.name} is already assigned to your team!`);
      return;
    }

    setTeamFormation(prev => ({
      ...prev,
      [showPlayerModal.slotId]: player
    }));
    setShowPlayerModal({ show: false, slotId: '', position: '' });
  };

  const handleRemoveFromSlot = (slotId: string) => {
    if (isDeadlinePassed) return;
    
    const playerToRemove = teamFormation[slotId];
    if (playerToRemove) {
      // Remove captain/vice-captain status if this player is being removed
      if (captain === playerToRemove._id) setCaptain(null);
      if (viceCaptain === playerToRemove._id) setViceCaptain(null);
    }
    
    setTeamFormation(prev => {
      const newFormation = { ...prev };
      delete newFormation[slotId];
      return newFormation;
    });
  };

  const handleCaptainSelect = (playerId: string) => {
    if (isDeadlinePassed) return;
    
    if (captain === playerId) {
      setCaptain(null);
    } else {
      if (viceCaptain === playerId) {
        setViceCaptain(null);
      }
      setCaptain(playerId);
    }
  };

  const handleViceCaptainSelect = (playerId: string) => {
    if (isDeadlinePassed) return;
    
    if (viceCaptain === playerId) {
      setViceCaptain(null);
    } else {
      if (captain === playerId) {
        setCaptain(null);
      }
      setViceCaptain(playerId);
    }
  };

  // Player Action Overlay Component
  const PlayerActionOverlay = ({ 
    slotId, 
    player, 
    isCaptain, 
    isViceCaptain 
  }: {
    slotId: string;
    player: Player;
    isCaptain: boolean;
    isViceCaptain: boolean;
  }) => (
    <>
      {/* Full screen backdrop - closes overlay when clicked */}
      <div 
        className="fixed inset-0 z-40 bg-transparent"
        onClick={() => setActiveOverlay(null)}
      />
      
      {/* Overlay content */}
      <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in duration-200">
        <div 
          className="bg-black/90 backdrop-blur-sm rounded-lg shadow-xl border border-white/20"
          onClick={(e) => e.stopPropagation()} // Prevent overlay from closing when clicking on buttons
        >
          {/* Player Info Header */}
          <div className="px-3 py-2 border-b border-white/20">
            <div className="text-white font-semibold text-sm text-center truncate">
              {player.name}
            </div>
            <div className="text-white/70 text-xs text-center">
              {player.realTeam?.shortName} • {player.totalPoints} pts
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="p-2 flex gap-1">
          {/* Captain Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCaptainSelect(player._id);
              setActiveOverlay(null);
            }}
            disabled={isDeadlinePassed}
            className={`p-2 rounded-md transition-colors text-xs font-medium min-w-[60px] disabled:opacity-50 disabled:cursor-not-allowed ${
              isCaptain 
                ? 'bg-yellow-500 text-black' 
                : 'bg-white/10 text-yellow-400 hover:bg-yellow-500/20'
            }`}
            title="Make Captain"
          >
            👑 {isCaptain ? 'CAPT' : 'Capt'}
          </button>
          
          {/* Vice Captain Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViceCaptainSelect(player._id);
              setActiveOverlay(null);
            }}
            disabled={isDeadlinePassed}
            className={`p-2 rounded-md transition-colors text-xs font-medium min-w-[60px] disabled:opacity-50 disabled:cursor-not-allowed ${
              isViceCaptain 
                ? 'bg-gray-500 text-white' 
                : 'bg-white/10 text-gray-300 hover:bg-gray-500/20'
            }`}
            title="Make Vice Captain"
          >
            ⭐ {isViceCaptain ? 'VICE' : 'Vice'}
          </button>
          
          {/* Change Player Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSlotClick(slotId, player.position);
              setActiveOverlay(null);
            }}
            disabled={isDeadlinePassed}
            className="p-2 rounded-md bg-white/10 text-blue-400 hover:bg-blue-500/20 transition-colors text-xs font-medium min-w-[60px] disabled:opacity-50 disabled:cursor-not-allowed"
            title="Change Player"
          >
            🔄 Change
          </button>
          
          {/* Remove Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveFromSlot(slotId);
              setActiveOverlay(null);
            }}
            disabled={isDeadlinePassed}
            className="p-2 rounded-md bg-white/10 text-red-400 hover:bg-red-500/20 transition-colors text-xs font-medium min-w-[60px] disabled:opacity-50 disabled:cursor-not-allowed"
            title="Remove Player"
          >
            ❌ Remove
          </button>
          </div>
        </div>
      </div>
    </>
  );

  const getAvailablePlayersForPosition = (position: string) => {
    // Get all currently assigned player IDs
    const assignedPlayerIds = Object.values(teamFormation)
      .filter(Boolean)
      .map(player => player!._id);
    
    // Get the current player in the slot we're trying to fill (if any)
    const currentPlayerInSlot = teamFormation[showPlayerModal.slotId];
    
    // Filter players by position and exclude already assigned players
    // BUT allow the current player in the slot to be shown (for re-selection/confirmation)
    const availablePlayers = selectedPlayers.filter(player => {
      if (player.position !== position) return false;
      
      // If this player is assigned but it's the current player in this slot, allow it
      if (currentPlayerInSlot && currentPlayerInSlot._id === player._id) {
        return true;
      }
      
      // Otherwise, exclude already assigned players
      return !assignedPlayerIds.includes(player._id);
    });

    // Apply search filter
    const filteredPlayers = availablePlayers.filter(player => {
      if (!searchTerm) return true;
      const lowerSearchTerm = searchTerm.toLowerCase();
      return (
        player.name.toLowerCase().includes(lowerSearchTerm) ||
        player.realTeam?.name.toLowerCase().includes(lowerSearchTerm) ||
        player.realTeam?.shortName.toLowerCase().includes(lowerSearchTerm)
      );
    });

    // Apply sorting
    return filteredPlayers.sort((a, b) => {
      if (sortBy === 'points') {
        return b.totalPoints - a.totalPoints;
      } else {
        return a.name.localeCompare(b.name);
      }
    });
  };

  const renderPlayerSlot = (slotId: string, position: 'GK' | 'DEF' | 'MID' | 'FWD', style: React.CSSProperties) => {
    const player = teamFormation[slotId];
    const isCaptain = player && captain === player._id;
    const isViceCaptain = player && viceCaptain === player._id;

    return (
      <div key={slotId} style={style} className="relative">
        {/* Player Slot */}
        <div
          onClick={() => {
            if (!player) {
              // Empty slot - open player selection (current behavior)
              handleSlotClick(slotId, position);
            } else {
              // Assigned player - show overlay
              setActiveOverlay(activeOverlay === slotId ? null : slotId);
            }
          }}
          className={`
            absolute 
            w-10 h-10 
            xs:w-12 xs:h-12 
            sm:w-14 sm:h-14 
            md:w-16 md:h-16 
            lg:w-18 lg:h-18 
            xl:w-20 xl:h-20
            rounded-full border-2 flex items-center justify-center 
            transition-all duration-200 transform -translate-x-1/2 -translate-y-1/2 
            touch-manipulation cursor-pointer
            ${isDeadlinePassed ? 'cursor-not-allowed opacity-75' : 'active:scale-95'}
            ${player 
              ? `${positionColors[position]} text-white shadow-lg ${!isDeadlinePassed ? 'hover:scale-105 hover:shadow-xl' : ''}` 
              : `border-white/60 border-dashed bg-white/20 ${!isDeadlinePassed ? 'hover:bg-white/30 active:bg-white/40 hover:border-white/80' : ''}`
            }
            ${isCaptain ? 'ring-2 xs:ring-3 sm:ring-4 ring-yellow-400 ring-offset-1' : ''}
            ${isViceCaptain ? 'ring-2 xs:ring-3 sm:ring-4 ring-gray-400 ring-offset-1' : ''}
            ${activeOverlay === slotId ? 'ring-2 ring-white/50' : ''}
          `}
        >
        {player ? (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Captain/Vice Captain Badge */}
            {isCaptain && (
              <div className="absolute -top-0.5 -right-0.5 xs:-top-1 xs:-right-1 w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 bg-yellow-400 text-black font-bold rounded-full flex items-center justify-center text-xxs xs:text-xs shadow-md">
                C
              </div>
            )}
            {isViceCaptain && (
              <div className="absolute -top-0.5 -right-0.5 xs:-top-1 xs:-right-1 w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 bg-gray-400 text-white font-bold rounded-full flex items-center justify-center text-xxs xs:text-xs shadow-md">
                V
              </div>
            )}
            
            {/* Player Name */}
            <span className="text-xxs xs:text-xs sm:text-sm font-bold text-center leading-tight px-1 break-words">
              {(() => {
                const name = player.name;
                // For mobile (small circles), show first name only or initials if too long
                if (name.length <= 8) return name;
                const firstName = name.split(' ')[0];
                if (firstName.length <= 8) return firstName;
                return firstName.substring(0, 6) + '...';
              })()}
            </span>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-xxs xs:text-xs sm:text-sm font-medium text-white/80">
              {positionLabels[position]}
            </div>
          </div>
        )}
        </div>
        

        
        {/* Action Overlay */}
        {player && activeOverlay === slotId && (
          <PlayerActionOverlay
            slotId={slotId}
            player={player}
            isCaptain={!!isCaptain}
            isViceCaptain={!!isViceCaptain}
          />
        )}
      </div>
    );
  };

  const renderFormationSlots = () => {
    const slots: React.ReactElement[] = [];

    // Goalkeeper
    currentFormation.positions.goalkeeper.forEach((pos, index) => {
      const slotId = `gk-${index}`;
      slots.push(renderPlayerSlot(slotId, 'GK', { position: 'absolute', top: pos.top, left: pos.left }));
    });

    // Defenders
    currentFormation.positions.defenders.forEach((pos, index) => {
      const slotId = `def-${index}`;
      slots.push(renderPlayerSlot(slotId, 'DEF', { position: 'absolute', top: pos.top, left: pos.left }));
    });

    // Midfielders
    currentFormation.positions.midfielders.forEach((pos, index) => {
      const slotId = `mid-${index}`;
      slots.push(renderPlayerSlot(slotId, 'MID', { position: 'absolute', top: pos.top, left: pos.left }));
    });

    // Forwards
    currentFormation.positions.forwards.forEach((pos, index) => {
      const slotId = `fwd-${index}`;
      slots.push(renderPlayerSlot(slotId, 'FWD', { position: 'absolute', top: pos.top, left: pos.left }));
    });

    return slots;
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Deadline Warning */}
      {isDeadlinePassed && (
        <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="font-medium">
              Deadline has passed - team changes are locked
            </span>
          </div>
        </div>
      )}

      {/* Formation Selector */}
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-3 xs:p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Top row - Formation selector and clear button */}
          <div className="flex flex-col xs:flex-row xs:items-center gap-3 xs:gap-4">
            <div className="flex items-center gap-2 xs:gap-3 min-w-0 flex-1">
              <label className="font-semibold text-slate-700 text-xs xs:text-sm sm:text-base whitespace-nowrap">Formation:</label>
              <select
                value={selectedFormation}
                onChange={(e) => setSelectedFormation(e.target.value)}
                disabled={isDeadlinePassed}
                className="flex-1 px-3 xs:px-4 py-2.5 xs:py-3 sm:py-2.5 border border-emerald-200 rounded-lg xs:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 text-xs xs:text-sm sm:text-base bg-white shadow-sm font-medium text-slate-700 min-h-touch touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {Object.keys(formations).map(formation => (
                  <option key={formation} value={formation}>
                    {formation}
                  </option>
                ))}
              </select>
            </div>
            {!isDeadlinePassed && (
              <button
                onClick={handleClearTeam}
                className="px-3 xs:px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors text-xs xs:text-sm min-h-touch touch-manipulation active:bg-red-700 xs:min-w-[100px]"
              >
                Clear Team
              </button>
            )}
          </div>
          
          {/* Bottom row - Team info */}
          <div className="bg-slate-50/80 rounded-lg p-2 xs:p-3 sm:p-4">
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 text-xs xs:text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-600">Formation:</span>
                <span className="text-emerald-600 font-semibold">{selectedFormation}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-600">Captain:</span>
                <span className="text-amber-600 font-semibold truncate">
                  {captain ? teamFormation[Object.keys(teamFormation).find(key => teamFormation[key]?._id === captain) || '']?.name || 'None' : 'None'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-600">Vice Captain:</span>
                <span className="text-slate-600 font-semibold truncate">
                  {viceCaptain ? teamFormation[Object.keys(teamFormation).find(key => teamFormation[key]?._id === viceCaptain) || '']?.name || 'None' : 'None'}
                </span>
              </div>
              <div className="flex items-center gap-2 xs:col-span-2 lg:col-span-1">
                <span className="font-medium text-slate-500 text-xs">💡 Click players to manage</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Soccer Pitch */}
      <div
        className="relative bg-gradient-to-b from-green-400 to-green-500 rounded-lg shadow-lg overflow-hidden 
                   h-[350px] xs:h-[400px] sm:h-[500px] md:h-[580px] lg:h-[650px] xl:h-[720px]
                   mx-auto max-w-sm xs:max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl"
        style={{ 
          backgroundImage: `
            linear-gradient(90deg, rgba(255,255,255,0.1) 50%, transparent 50%),
            linear-gradient(rgba(255,255,255,0.1) 50%, transparent 50%)
          `,
          backgroundSize: '15px 15px'
        }}
      >
        {/* Center Circle */}
        <div 
          className="absolute border-2 border-white/50 rounded-full 
                     w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
        
        {/* Center Dot */}
        <div 
          className="absolute bg-white/70 rounded-full w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2.5 sm:h-2.5"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />

        {/* Goal Areas */}
        <div 
          className="absolute border-2 border-white/50 
                     w-14 h-6 xs:w-16 xs:h-7 sm:w-20 sm:h-8 md:w-24 md:h-10 lg:w-28 lg:h-12 xl:w-32 xl:h-14"
          style={{
            top: '8px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        />
        <div 
          className="absolute border-2 border-white/50 
                     w-14 h-6 xs:w-16 xs:h-7 sm:w-20 sm:h-8 md:w-24 md:h-10 lg:w-28 lg:h-12 xl:w-32 xl:h-14"
          style={{
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        />

        {/* Penalty Areas */}
        <div 
          className="absolute border-2 border-white/30 
                     w-24 h-12 xs:w-28 xs:h-14 sm:w-32 sm:h-16 md:w-36 md:h-18 lg:w-40 lg:h-20 xl:w-44 xl:h-22"
          style={{
            top: '5px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        />
        <div 
          className="absolute border-2 border-white/30 
                     w-24 h-12 xs:w-28 xs:h-14 sm:w-32 sm:h-16 md:w-36 md:h-18 lg:w-40 lg:h-20 xl:w-44 xl:h-22"
          style={{
            bottom: '5px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        />

        {/* Formation Slots */}
        {renderFormationSlots()}
      </div>

      {/* Team Summary */}
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4 sm:p-6">
        <h3 className="font-bold text-slate-800 mb-4 text-lg">Team Summary</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-200">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-500"></div>
              <span className="text-slate-700 font-medium">Goalkeeper</span>
            </div>
            <span className="text-lg font-bold text-amber-700">
              {Object.values(teamFormation).filter(p => p?.position === 'GK').length}/1
            </span>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600"></div>
              <span className="text-slate-700 font-medium">Defenders</span>
            </div>
            <span className="text-lg font-bold text-blue-700">
              {Object.values(teamFormation).filter(p => p?.position === 'DEF').length}/{currentFormation.positions.defenders.length}
            </span>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-3 border border-emerald-200">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-emerald-500 to-green-600"></div>
              <span className="text-slate-700 font-medium">Midfielders</span>
            </div>
            <span className="text-lg font-bold text-emerald-700">
              {Object.values(teamFormation).filter(p => p?.position === 'MID').length}/{currentFormation.positions.midfielders.length}
            </span>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-3 border border-red-200">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-500 to-rose-600"></div>
              <span className="text-slate-700 font-medium">Forwards</span>
            </div>
            <span className="text-lg font-bold text-red-700">
              {Object.values(teamFormation).filter(p => p?.position === 'FWD').length}/{currentFormation.positions.forwards.length}
            </span>
          </div>
        </div>
      </div>

      {/* Player Selection Modal */}
      {showPlayerModal.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 xs:p-3 sm:p-4 safe-area-inset">
          <div className="bg-white rounded-xl xs:rounded-2xl shadow-2xl w-full max-w-xs xs:max-w-sm sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[95vh] xs:max-h-[90vh] sm:max-h-[85vh] flex flex-col border border-emerald-100">
            {/* Header - Fixed */}
            <div className="flex justify-between items-center p-3 xs:p-4 sm:p-6 border-b border-slate-100">
              <div className="min-w-0 flex-1">
                <h3 className="text-base xs:text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 truncate">
                  Select {showPlayerModal.position}
                </h3>
                <p className="text-xs xs:text-sm text-slate-600 mt-1">Choose a player for this position</p>
              </div>
              <button
                onClick={() => setShowPlayerModal({ show: false, slotId: '', position: '' })}
                className="text-slate-400 hover:text-slate-600 p-2 xs:p-3 hover:bg-slate-100 rounded-full transition-colors touch-manipulation min-h-touch min-w-touch flex items-center justify-center ml-3"
              >
                <svg className="w-5 h-5 xs:w-6 xs:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search and Sort Controls - Fixed */}
            <div className="p-3 xs:p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <svg className="w-4 h-4 xs:w-5 xs:h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search players..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 xs:pl-10 pr-3 xs:pr-4 py-2 xs:py-2.5 border border-slate-200 rounded-lg xs:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 bg-white shadow-sm text-slate-700 placeholder-slate-400 text-xs xs:text-sm min-h-touch"
                  />
                </div>
                
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'points' | 'name')}
                  className="px-3 xs:px-4 py-2 xs:py-2.5 border border-slate-200 rounded-lg xs:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 bg-white shadow-sm text-slate-700 text-xs xs:text-sm min-w-[120px] xs:min-w-[140px] min-h-touch"
                >
                  <option value="points">By Points</option>
                  <option value="name">By Name</option>
                </select>
              </div>
            </div>

            {/* Player List - Scrollable */}
            <div className="flex-1 overflow-y-auto scrollbar-hide p-3 xs:p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-2 xs:gap-3">
                {getAvailablePlayersForPosition(showPlayerModal.position).map(player => (
                  <div
                    key={player._id}
                    onClick={() => handlePlayerAssign(player)}
                    className="group p-3 xs:p-4 border border-slate-200 rounded-lg xs:rounded-xl cursor-pointer hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200 hover:shadow-md active:bg-emerald-100 touch-manipulation min-h-[60px] xs:min-h-[72px] flex items-center"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3 xs:gap-4 min-w-0 flex-1">
                        <div className={`w-10 h-10 xs:w-12 xs:h-12 rounded-full ${positionColors[player.position]} text-white text-xs xs:text-sm font-bold flex items-center justify-center shadow-lg flex-shrink-0`}>
                          {player.position}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-800 text-sm xs:text-base group-hover:text-emerald-700 transition-colors truncate">
                            {player.name}
                          </div>
                          <div className="text-xs xs:text-sm text-slate-600 flex items-center gap-1 xs:gap-2">
                            <span className="font-medium truncate">{player.realTeam?.shortName}</span>
                            <span className="text-slate-400 hidden xs:inline">•</span>
                            <span className="text-emerald-600 font-semibold">{player.totalPoints} pts</span>
                          </div>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                        <svg className="w-4 h-4 xs:w-5 xs:h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Save Team Section */}
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Save Your Team</h3>
            <p className="text-sm text-slate-600">
              {isDeadlinePassed 
                ? 'Deadline has passed - team changes are locked'
                : isTeamComplete() 
                  ? `Team complete! Formation: ${selectedFormation}` 
                  : `Complete your ${selectedFormation} formation and select captain & vice-captain`
              }
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {saveStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Team saved!
              </div>
            )}
            
            {saveStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Save failed
              </div>
            )}
            
            <button
              onClick={handleSaveTeam}
              disabled={!isTeamComplete() || isSaving || !user || isDeadlinePassed}
              className={`px-6 py-3 rounded-lg font-semibold transition-all min-h-[44px] touch-manipulation ${
                isTeamComplete() && user && !isSaving && !isDeadlinePassed
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg transform hover:scale-105'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                'Save Team'
              )}
            </button>
          </div>
        </div>
        
        {!user && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 text-sm">
              Please sign in to save your team.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 