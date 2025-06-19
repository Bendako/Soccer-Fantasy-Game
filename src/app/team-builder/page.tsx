'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PlayerSelectionModal } from '@/components/PlayerSelectionModal'
import FormationPitch, { Player } from '@/components/FormationPitch'
import { api } from '../../../convex/_generated/api'

export default function TeamBuilder() {
  const { user } = useUser()
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([])
  const [showPlayerModal, setShowPlayerModal] = useState(false)

  // Fetch players data
  const players = useQuery(api.players.getAllPlayers)

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to build your team</h1>
          <p className="text-gray-600">You need to be signed in to access the team builder.</p>
          <Link href="/">
            <Button className="mt-4" variant="outline">← Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handlePlayerSelect = (player: Player) => {
    // Prevent duplicate selections by name and team (not just _id)
    if (selectedPlayers.find(p => p.name === player.name && p.realTeam?.shortName === player.realTeam?.shortName)) {
      return; // Player already selected, do nothing
    }
    setSelectedPlayers([...selectedPlayers, player])
    setShowPlayerModal(false) // Close modal after selection
  }

  const handleRemovePlayer = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.filter(p => p._id !== playerId))
  }

  const openPlayerModal = () => {
    setShowPlayerModal(true)
  }

  const closePlayerModal = () => {
    setShowPlayerModal(false)
  }

  // Convert Convex players to our Player interface
  const convertedPlayers: Player[] = (players || []).map(player => ({
    _id: player._id,
    name: player.name,
    position: player.position as 'GK' | 'DEF' | 'MID' | 'FWD',
    realTeam: player.realTeam ? {
      name: player.realTeam.name,
      shortName: player.realTeam.shortName,
      colors: player.realTeam.colors || { primary: '#000000', secondary: '#ffffff' }
    } : undefined,
    totalPoints: player.totalPoints,
    jerseyNumber: player.jerseyNumber,
    imageUrl: player.imageUrl
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-teal-700">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Team Builder</h1>
          <p className="text-emerald-100">Build your fantasy team with a visual formation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Formation Pitch - Main Area */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <FormationPitch
              selectedPlayers={selectedPlayers}
              onPlayerSelect={handlePlayerSelect as any}
              onRemovePlayer={handleRemovePlayer}
            />
          </div>

          {/* Sidebar - Player Selection */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-4 lg:p-6 lg:sticky lg:top-6">
                              <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center mb-4 lg:mb-6">
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-800">Players</h2>
                  <Button onClick={openPlayerModal} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors">
                    Add Players
                  </Button>
                </div>

                              <div className="space-y-4 lg:space-y-6">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <div className="text-sm font-medium text-emerald-800">
                      Selected: {selectedPlayers.length}/15 players
                    </div>
                    <div className="w-full bg-emerald-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(selectedPlayers.length / 15) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                {/* Selected Players Summary */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 text-base">Selected Players:</h3>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {selectedPlayers.map(player => (
                      <div key={player._id} className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200 hover:shadow-md transition-all duration-200">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{player.name}</div>
                          <div className="text-slate-600 text-sm flex items-center gap-1">
                            <span className="font-medium">{player.realTeam?.shortName}</span>
                            <span className="text-slate-400">•</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              player.position === 'GK' ? 'bg-yellow-100 text-yellow-800' :
                              player.position === 'DEF' ? 'bg-blue-100 text-blue-800' :
                              player.position === 'MID' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {player.position}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemovePlayer(player._id)}
                          className="ml-3 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 hover:text-red-800 text-xs font-medium rounded-lg transition-colors duration-200"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedPlayers.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-slate-600 font-medium">No players selected</p>
                    <p className="text-slate-500 text-sm mt-1">Click "Add Players" to start building your team</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Player Selection Modal */}
        {showPlayerModal && (
          <PlayerSelectionModal
            isOpen={showPlayerModal}
            onClose={closePlayerModal}
            onPlayerSelect={handlePlayerSelect as any}
            selectedPlayerIds={selectedPlayers.map(p => p._id) as any}
            players={convertedPlayers as any}
          />
        )}
      </div>
    </div>
  )
} 