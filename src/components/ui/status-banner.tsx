'use client';

import React from 'react';

interface StatusBannerProps {
  gameweekNumber: number;
  isDeadlinePassed: boolean;
  timeRemaining: number;
  existingTeam?: boolean;
  playerCount?: number;
}

export default function StatusBanner({ 
  gameweekNumber, 
  isDeadlinePassed, 
  timeRemaining, 
  existingTeam,
  playerCount 
}: StatusBannerProps) {
  const formatTimeRemaining = (ms: number) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="space-y-3 xs:space-y-4">
      {/* Existing Team Status */}
      {existingTeam && (
        <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3 xs:p-4">
          <div className="flex items-center gap-2 text-blue-100">
            <svg className="w-4 h-4 xs:w-5 xs:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium text-xs xs:text-sm">
              Team already submitted for this gameweek
            </span>
          </div>
          <p className="text-blue-200 text-xs xs:text-sm mt-1">
            You can still make changes until the deadline.
          </p>
        </div>
      )}

      {/* Deadline Status */}
      <div className={`rounded-lg p-3 xs:p-4 border ${
        isDeadlinePassed 
          ? 'bg-red-500/20 border-red-400/30' 
          : timeRemaining < 24 * 60 * 60 * 1000 
            ? 'bg-orange-500/20 border-orange-400/30'
            : 'bg-green-500/20 border-green-400/30'
      }`}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className={`flex items-center gap-2 ${
              isDeadlinePassed ? 'text-red-100' : timeRemaining < 24 * 60 * 60 * 1000 ? 'text-orange-100' : 'text-green-100'
            }`}>
              <svg className="w-4 h-4 xs:w-5 xs:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isDeadlinePassed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              <span className="font-medium text-xs xs:text-sm">
                {isDeadlinePassed ? 'Teams Locked' : `${formatTimeRemaining(timeRemaining)} remaining`}
              </span>
            </div>
            <p className={`text-xs mt-1 ${
              isDeadlinePassed ? 'text-red-200' : timeRemaining < 24 * 60 * 60 * 1000 ? 'text-orange-200' : 'text-green-200'
            }`}>
              Gameweek {gameweekNumber} deadline
            </p>
          </div>
          
          {/* Player Count */}
          {playerCount && playerCount > 0 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2 xs:px-3 py-1.5 xs:py-2">
              <span className="text-emerald-100 text-xs xs:text-sm font-medium">
                {playerCount} players
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
