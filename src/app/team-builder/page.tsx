'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import FormationPitch, { Player } from '@/components/FormationPitch'
import { api } from '../../../convex/_generated/api'

export default function TeamBuilder() {
  const { user } = useUser()

  // Fetch players data
  const players = useQuery(api.players.getAllPlayers)

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold mb-4 text-white">Please sign in to build your team</h1>
          <p className="text-emerald-100 mb-6">You need to be signed in to access the team builder.</p>
          <Link href="/">
            <Button className="w-full sm:w-auto" variant="outline">← Back to Home</Button>
          </Link>
        </div>
      </div>
    )
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
      {/* Mobile-optimized container */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">Team Builder</h1>
              <p className="text-emerald-100 text-sm sm:text-base">Click on any position to select a player for that spot</p>
            </div>
            
            {/* Mobile-friendly navigation buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Link href="/">
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white min-h-[44px] touch-manipulation"
                >
                  ← Home
                </Button>
              </Link>
              <Button 
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white min-h-[44px] touch-manipulation"
                disabled={convertedPlayers.length === 0}
              >
                Save Team
              </Button>
            </div>
          </div>
          
          {/* Player count indicator */}
          {convertedPlayers.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 inline-block">
              <span className="text-emerald-100 text-sm font-medium">
                {convertedPlayers.length} players available
              </span>
            </div>
          )}
        </div>

        {/* Formation Pitch with responsive width */}
        <div className="w-full max-w-7xl mx-auto">
          {convertedPlayers.length > 0 ? (
            <FormationPitch
              selectedPlayers={convertedPlayers}
              onPlayerSelect={() => {}} // Not used in the new approach
              onRemovePlayer={() => {}} // Not used in the new approach
            />
          ) : (
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 sm:p-8 text-center">
              <div className="text-6xl sm:text-8xl mb-4">⚽</div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3">No Players Available</h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                There are currently no players in the database. Please check back later or contact support.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/">
                  <Button variant="outline" className="w-full sm:w-auto min-h-[44px] touch-manipulation">
                    ← Back to Home
                  </Button>
                </Link>
                <Button 
                  variant="default" 
                  className="w-full sm:w-auto min-h-[44px] touch-manipulation"
                  onClick={() => window.location.reload()}
                >
                  🔄 Refresh Page
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 