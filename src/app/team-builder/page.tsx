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
    if (!selectedPlayers.find(p => p._id === player._id)) {
      setSelectedPlayers([...selectedPlayers, player])
    }
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Builder</h1>
          <p className="text-gray-600">Build your fantasy team with a visual formation</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Formation Pitch - Main Area */}
          <div className="xl:col-span-3">
            <FormationPitch
              selectedPlayers={selectedPlayers}
              onPlayerSelect={handlePlayerSelect}
              onRemovePlayer={handleRemovePlayer}
            />
          </div>

          {/* Sidebar - Player Selection */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Players</h2>
                <Button onClick={openPlayerModal} className="text-sm">
                  Add Players
                </Button>
              </div>

              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  Selected: {selectedPlayers.length}/15 players
                </div>

                {/* Selected Players Summary */}
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700">Selected Players:</h3>
                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {selectedPlayers.map(player => (
                      <div key={player._id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <div>
                          <div className="font-medium">{player.name}</div>
                          <div className="text-gray-500">{player.realTeam?.shortName} • {player.position}</div>
                        </div>
                        <button
                          onClick={() => handleRemovePlayer(player._id)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedPlayers.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <p>No players selected</p>
                    <p className="text-sm">Click "Add Players" to start building your team</p>
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
            onPlayerSelect={handlePlayerSelect}
            selectedPlayerIds={selectedPlayers.map(p => p._id)}
            players={convertedPlayers}
          />
        )}
      </div>
    </div>
  )
} 