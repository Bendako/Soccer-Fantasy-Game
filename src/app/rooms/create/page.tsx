'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useMutation } from 'convex/react'
import { Button } from '@/components/ui/button'
import { api } from '../../../../convex/_generated/api'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import RoomSharingModal from '@/components/RoomSharingModal'
import type { Id } from "../../../../convex/_generated/dataModel"

const TOURNAMENTS = {
  premier_league: {
    name: 'Premier League',
    flag: '🇬🇧',
    color: 'from-purple-500 to-blue-600'
  },
  la_liga: {
    name: 'La Liga',
    flag: '🇪🇸',
    color: 'from-red-500 to-orange-600'
  },
  champions_league: {
    name: 'Champions League',
    flag: '🏆',
    color: 'from-blue-600 to-indigo-700'
  }
} as const

type TournamentKey = keyof typeof TOURNAMENTS

export default function CreateRoom() {
  const { user } = useUser()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: '',
    league: 'premier_league' as TournamentKey,
    maxParticipants: 12,
    type: 'private'
  })
  
  const [isCreating, setIsCreating] = useState(false)
  const [createdRoom, setCreatedRoom] = useState<{
    id: Id<"fantasyLeagues">
    userId: Id<"users">
  } | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)

  // Mutations
  const createUser = useMutation(api.users.createUser)
  const createLeague = useMutation(api.fantasyLeagues.createFantasyLeague)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsCreating(true)
    try {
      // Ensure user exists in Convex
      const userId = await createUser({
        name: user.fullName || user.emailAddresses[0]?.emailAddress || 'Unknown User',
        email: user.emailAddresses[0]?.emailAddress || '',
        clerkId: user.id,
        imageUrl: user.imageUrl
      })

      // Create the room
      const roomId = await createLeague({
        name: formData.name,
        type: formData.type,
        maxParticipants: formData.maxParticipants,
        creatorId: userId,
        league: formData.league
      })

      setCreatedRoom({ id: roomId, userId })
      setShowShareModal(true)
    } catch (error) {
      console.error('Failed to create room:', error)
      alert('Failed to create room. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCloseModal = () => {
    setShowShareModal(false)
    if (createdRoom) {
      router.push(`/rooms/${createdRoom.id}`)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
        <div className="text-center max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="text-6xl mb-4">⚽</div>
          <h1 className="text-2xl font-bold mb-4 text-white">Create Your Room</h1>
          <p className="text-emerald-100 mb-6">Sign in to create your fantasy soccer room</p>
          <Link href="/sign-in">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
              Sign In to Create Room
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⚽</div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Your Room</h1>
          <p className="text-emerald-100">Set up your fantasy soccer competition</p>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Room Name */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Room Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="My Awesome Soccer League"
                required
              />
            </div>

            {/* League Selection */}
            <div>
              <label className="block text-white font-semibold mb-3">
                Choose League
              </label>
              <div className="space-y-3">
                {Object.entries(TOURNAMENTS).map(([key, tournament]) => (
                  <label key={key} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="league"
                      value={key}
                      checked={formData.league === key}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        league: e.target.value as TournamentKey 
                      }))}
                      className="sr-only"
                    />
                    <div className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                      formData.league === key 
                        ? 'border-white bg-white/20' 
                        : 'border-white/30 bg-white/10 hover:bg-white/15'
                    }`}>
                      <div className={`bg-gradient-to-r ${tournament.color} rounded-lg p-3 text-white`}>
                        <div className="font-bold text-lg">{tournament.flag} {tournament.name}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Max Participants */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Max Participants
              </label>
              <select
                value={formData.maxParticipants}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  maxParticipants: parseInt(e.target.value) 
                }))}
                className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value={4}>4 Players</option>
                <option value={6}>6 Players</option>
                <option value={8}>8 Players</option>
                <option value={12}>12 Players</option>
                <option value={16}>16 Players</option>
                <option value={20}>20 Players</option>
              </select>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isCreating || !formData.name.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 py-3"
            >
              {isCreating ? 'Creating Room...' : 'Create Room'}
            </Button>
          </form>

          {/* Back Link */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-emerald-200 hover:text-white transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Sharing Modal */}
      {createdRoom && (
        <RoomSharingModal
          fantasyLeagueId={createdRoom.id}
          userId={createdRoom.userId}
          isOpen={showShareModal}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
} 