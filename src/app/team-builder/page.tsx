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
          <p className="text-emerald-100">Click on any position to select a player for that spot</p>
        </div>

        {/* Full-width Formation Pitch */}
        <div className="w-full max-w-6xl mx-auto">
          <FormationPitch
            selectedPlayers={convertedPlayers}
            onPlayerSelect={() => {}} // Not used in the new approach
            onRemovePlayer={() => {}} // Not used in the new approach
          />
        </div>
      </div>
    </div>
  )
} 