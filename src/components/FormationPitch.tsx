"use client";

import React, { useState } from 'react';

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

interface FormationPitchProps {
  selectedPlayers: Player[];
  onPlayerSelect: (player: Player) => void;
  onRemovePlayer: (playerId: string) => void;
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

export default function FormationPitch({ selectedPlayers }: FormationPitchProps) {
  const [selectedFormation, setSelectedFormation] = useState<string>('4-3-3');
  const [teamFormation, setTeamFormation] = useState<TeamFormation>({});
  const [captain, setCaptain] = useState<string | null>(null);
  const [viceCaptain, setViceCaptain] = useState<string | null>(null);
  const [showPlayerModal, setShowPlayerModal] = useState<{show: boolean, slotId: string, position: string}>({
    show: false,
    slotId: '',
    position: ''
  });

  const currentFormation = formations[selectedFormation];

  const handleSlotClick = (slotId: string, position: string) => {
    // Always allow clicking - either to assign a new player or change an existing one
    setShowPlayerModal({ show: true, slotId, position });
  };

  const handlePlayerAssign = (player: Player) => {
    setTeamFormation(prev => ({
      ...prev,
      [showPlayerModal.slotId]: player
    }));
    setShowPlayerModal({ show: false, slotId: '', position: '' });
  };

  const handleRemoveFromSlot = (slotId: string) => {
    setTeamFormation(prev => {
      const newFormation = { ...prev };
      delete newFormation[slotId];
      return newFormation;
    });
  };

  const handleCaptainSelect = (playerId: string) => {
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
    if (viceCaptain === playerId) {
      setViceCaptain(null);
    } else {
      if (captain === playerId) {
        setCaptain(null);
      }
      setViceCaptain(playerId);
    }
  };

  const getAvailablePlayersForPosition = (position: string) => {
    const assignedPlayerIds = Object.values(teamFormation)
      .filter(Boolean)
      .map(player => player!._id);
    
    return selectedPlayers.filter(player => 
      player.position === position && !assignedPlayerIds.includes(player._id)
    );
  };

  const renderPlayerSlot = (slotId: string, position: 'GK' | 'DEF' | 'MID' | 'FWD', style: React.CSSProperties) => {
    const player = teamFormation[slotId];
    const isCaptain = player && captain === player._id;
    const isViceCaptain = player && viceCaptain === player._id;
    const isMobile = window.innerWidth < 768;

    return (
      <div
        key={slotId}
        style={style}
        onClick={() => handleSlotClick(slotId, position)}
        className={`
          absolute ${isMobile ? 'w-12 h-12' : 'w-16 h-16'} rounded-full border-2 flex items-center justify-center cursor-pointer transition-all transform -translate-x-1/2 -translate-y-1/2
          ${player 
            ? `${positionColors[position]} text-white shadow-lg hover:scale-105` 
            : `border-white/60 border-dashed bg-white/20 hover:bg-white/30`
          }
          ${isCaptain ? 'ring-2 sm:ring-4 ring-yellow-400' : ''}
          ${isViceCaptain ? 'ring-2 sm:ring-4 ring-gray-400' : ''}
        `}
      >
        {player ? (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Captain/Vice Captain Badge */}
            {isCaptain && (
              <div className={`absolute -top-1 -right-1 ${isMobile ? 'w-3 h-3 text-xs' : 'w-4 h-4 text-xs'} bg-yellow-400 text-black font-bold rounded-full flex items-center justify-center`}>
                C
              </div>
            )}
            {isViceCaptain && (
              <div className={`absolute -top-1 -right-1 ${isMobile ? 'w-3 h-3 text-xs' : 'w-4 h-4 text-xs'} bg-gray-400 text-white font-bold rounded-full flex items-center justify-center`}>
                V
              </div>
            )}
            
            {/* Player Jersey Number or Initials */}
            <span className={`${isMobile ? 'text-xs' : 'text-xs'} font-bold`}>
              {player.jerseyNumber || player.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-xs font-medium text-white/80">
              {positionLabels[position]}
            </div>
          </div>
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
      {/* Formation Selector */}
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <label className="font-semibold text-slate-700 text-sm sm:text-base">Formation:</label>
            <select
              value={selectedFormation}
              onChange={(e) => setSelectedFormation(e.target.value)}
              className="px-4 py-2.5 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 text-sm sm:text-base bg-white shadow-sm font-medium text-slate-700"
            >
              {Object.keys(formations).map(formation => (
                <option key={formation} value={formation}>
                  {formation}
                </option>
              ))}
            </select>
          </div>
          <div className="text-xs sm:text-sm text-slate-600 flex flex-col sm:flex-row gap-1 sm:gap-2 bg-slate-50 rounded-lg p-2 sm:p-3">
            <span className="font-medium">Formation: <span className="text-emerald-600">{selectedFormation}</span></span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="font-medium">Captain: <span className="text-amber-600">{captain ? teamFormation[Object.keys(teamFormation).find(key => teamFormation[key]?._id === captain) || '']?.name || 'None' : 'None'}</span></span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="font-medium">Vice: <span className="text-slate-600">{viceCaptain ? teamFormation[Object.keys(teamFormation).find(key => teamFormation[key]?._id === viceCaptain) || '']?.name || 'None' : 'None'}</span></span>
          </div>
        </div>
      </div>

      {/* Soccer Pitch */}
      <div
        className="relative bg-gradient-to-b from-green-400 to-green-500 rounded-lg shadow-lg overflow-hidden"
        style={{ 
          height: window.innerWidth < 768 ? '500px' : '600px',
          backgroundImage: `
            linear-gradient(90deg, rgba(255,255,255,0.1) 50%, transparent 50%),
            linear-gradient(rgba(255,255,255,0.1) 50%, transparent 50%)
          `,
          backgroundSize: '20px 20px'
        }}
      >
        {/* Center Circle */}
        <div 
          className="absolute border-2 border-white/50 rounded-full"
          style={{
            width: '120px',
            height: '120px',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
        
        {/* Center Dot */}
        <div 
          className="absolute bg-white/70 rounded-full"
          style={{
            width: '8px',
            height: '8px',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />

        {/* Goal Areas */}
        <div 
          className="absolute border-2 border-white/50"
          style={{
            width: '120px',
            height: '40px',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        />
        <div 
          className="absolute border-2 border-white/50"
          style={{
            width: '120px',
            height: '40px',
            bottom: '10px',
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-3xl max-h-[85vh] overflow-y-auto border border-emerald-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800">Select {showPlayerModal.position}</h3>
                <p className="text-sm text-slate-600 mt-1">Choose a player for this position</p>
              </div>
              <button
                onClick={() => setShowPlayerModal({ show: false, slotId: '', position: '' })}
                className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {getAvailablePlayersForPosition(showPlayerModal.position).map(player => (
                <div
                  key={player._id}
                  onClick={() => handlePlayerAssign(player)}
                  className="group p-4 border border-slate-200 rounded-xl cursor-pointer hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full ${positionColors[player.position]} text-white text-sm font-bold flex items-center justify-center shadow-lg`}>
                        {player.position}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 text-base group-hover:text-emerald-700 transition-colors">{player.name}</div>
                        <div className="text-sm text-slate-600 flex items-center gap-2">
                          <span className="font-medium">{player.realTeam?.shortName}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-emerald-600 font-semibold">{player.totalPoints} pts</span>
                        </div>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Assigned Players Panel */}
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4 sm:p-6">
        <h3 className="font-bold text-slate-800 mb-4 text-lg">Assigned Players</h3>
        <div className="space-y-3">
          {Object.entries(teamFormation).map(([slotId, player]) => {
            if (!player) return null;
            const isCaptain = captain === player._id;
            const isViceCaptain = viceCaptain === player._id;
            
            return (
              <div key={slotId} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full ${positionColors[player.position]} text-white text-sm font-bold flex items-center justify-center shadow-lg`}>
                    {player.position === 'GK' ? 'GK' : player.position.slice(0, 1)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">{player.name}</div>
                    <div className="text-sm text-slate-600 flex items-center gap-2">
                      <span className="font-medium">{player.realTeam?.shortName}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-emerald-600 font-semibold">{player.totalPoints} pts</span>
                    </div>
                  </div>
                  {isCaptain && <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 text-xs px-3 py-1 rounded-full font-bold shadow-sm">CAPTAIN</span>}
                  {isViceCaptain && <span className="bg-gradient-to-r from-slate-400 to-slate-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-sm">VICE</span>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCaptainSelect(player._id)}
                    className={`text-xs px-3 py-2 rounded-lg font-medium transition-colors ${isCaptain ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-amber-100 hover:text-amber-700'}`}
                  >
                    Captain
                  </button>
                  <button
                    onClick={() => handleViceCaptainSelect(player._id)}
                    className={`text-xs px-3 py-2 rounded-lg font-medium transition-colors ${isViceCaptain ? 'bg-gradient-to-r from-slate-400 to-slate-500 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  >
                    Vice
                  </button>
                  <button
                    onClick={() => handleRemoveFromSlot(slotId)}
                    className="text-xs px-3 py-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 transition-colors shadow-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 