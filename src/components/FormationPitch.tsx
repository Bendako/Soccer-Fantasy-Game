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
  GK: 'bg-yellow-500',
  DEF: 'bg-blue-500',
  MID: 'bg-green-500',
  FWD: 'bg-red-500'
};

const positionLabels = {
  GK: 'GK',
  DEF: 'DEF',
  MID: 'MID',
  FWD: 'FWD'
};

export default function FormationPitch({ selectedPlayers, onPlayerSelect: _onPlayerSelect, onRemovePlayer: _onRemovePlayer }: FormationPitchProps) {
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
    if (teamFormation[slotId]) {
      // Player already assigned, show options to change captain/vice or remove
      return;
    }
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
    const slots = [];

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
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <label className="font-semibold text-gray-700 text-sm sm:text-base">Formation:</label>
          <select
            value={selectedFormation}
            onChange={(e) => setSelectedFormation(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          >
            {Object.keys(formations).map(formation => (
              <option key={formation} value={formation}>
                {formation}
              </option>
            ))}
          </select>
        </div>
        <div className="text-xs sm:text-sm text-gray-600 flex flex-col sm:flex-row gap-1 sm:gap-2">
          <span>Formation: {selectedFormation}</span>
          <span className="hidden sm:inline">•</span>
          <span>Captain: {captain ? teamFormation[Object.keys(teamFormation).find(key => teamFormation[key]?._id === captain) || '']?.name || 'None' : 'None'}</span>
          <span className="hidden sm:inline">•</span>
          <span>Vice: {viceCaptain ? teamFormation[Object.keys(teamFormation).find(key => teamFormation[key]?._id === viceCaptain) || '']?.name || 'None' : 'None'}</span>
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
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-2">Team Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Goalkeeper:</span>
            <span className="ml-1 font-medium">
              {Object.values(teamFormation).filter(p => p?.position === 'GK').length}/1
            </span>
          </div>
          <div>
            <span className="text-gray-600">Defenders:</span>
            <span className="ml-1 font-medium">
              {Object.values(teamFormation).filter(p => p?.position === 'DEF').length}/{currentFormation.positions.defenders.length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Midfielders:</span>
            <span className="ml-1 font-medium">
              {Object.values(teamFormation).filter(p => p?.position === 'MID').length}/{currentFormation.positions.midfielders.length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Forwards:</span>
            <span className="ml-1 font-medium">
              {Object.values(teamFormation).filter(p => p?.position === 'FWD').length}/{currentFormation.positions.forwards.length}
            </span>
          </div>
        </div>
      </div>

      {/* Player Selection Modal */}
      {showPlayerModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-semibold">Select {showPlayerModal.position}</h3>
              <button
                onClick={() => setShowPlayerModal({ show: false, slotId: '', position: '' })}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {getAvailablePlayersForPosition(showPlayerModal.position).map(player => (
                <div
                  key={player._id}
                  onClick={() => handlePlayerAssign(player)}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-sm sm:text-base">{player.name}</div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {player.realTeam?.shortName} • {player.totalPoints} pts
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Assigned Players Panel */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Assigned Players</h3>
        <div className="space-y-2">
          {Object.entries(teamFormation).map(([slotId, player]) => {
            if (!player) return null;
            const isCaptain = captain === player._id;
            const isViceCaptain = viceCaptain === player._id;
            
            return (
              <div key={slotId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${positionColors[player.position]} text-white text-xs font-bold flex items-center justify-center`}>
                    {player.position === 'GK' ? 'GK' : player.position.slice(0, 1)}
                  </div>
                  <div>
                    <div className="font-medium">{player.name}</div>
                    <div className="text-sm text-gray-600">{player.realTeam?.shortName} • {player.totalPoints} pts</div>
                  </div>
                  {isCaptain && <span className="bg-yellow-400 text-black text-xs px-2 py-1 rounded font-bold">CAPTAIN</span>}
                  {isViceCaptain && <span className="bg-gray-400 text-white text-xs px-2 py-1 rounded font-bold">VICE</span>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCaptainSelect(player._id)}
                    className={`text-xs px-2 py-1 rounded ${isCaptain ? 'bg-yellow-400 text-black' : 'bg-gray-200 hover:bg-yellow-300'}`}
                  >
                    Captain
                  </button>
                  <button
                    onClick={() => handleViceCaptainSelect(player._id)}
                    className={`text-xs px-2 py-1 rounded ${isViceCaptain ? 'bg-gray-400 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    Vice
                  </button>
                  <button
                    onClick={() => handleRemoveFromSlot(slotId)}
                    className="text-xs px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600"
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