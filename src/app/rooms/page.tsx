'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery, useMutation } from 'convex/react'
import { Button } from '@/components/ui/button'
import { api } from '../../../convex/_generated/api'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Id } from "../../../convex/_generated/dataModel"

export default function MyRooms() {
  const { user } = useUser()
  const [userConvexId, setUserConvexId] = useState<Id<"users"> | null>(null)

  // Create user mutation
  const createUser = useMutation(api.users.createUser)

  // Get user's leagues
  const userLeagues = useQuery(api.fantasyLeagues.getUserLeagues,
    userConvexId ? { userId: userConvexId } : "skip"
  )

  // Initialize user
  useEffect(() => {
    const initializeUser = async () => {
      if (user && !userConvexId) {
        try {
          const convexUser = await createUser({
            name: user.fullName || user.emailAddresses[0]?.emailAddress || 'Unknown User',
            email: user.emailAddresses[0]?.emailAddress || '',
            clerkId: user.id,
            imageUrl: user.imageUrl
          })
          setUserConvexId(convexUser)
        } catch (error) {
          console.error('Failed to create/get user:', error)
        }
      }
    }

    initializeUser()
  }, [user, createUser, userConvexId])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
        <div className="text-center max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="text-6xl mb-4">⚽</div>
          <h1 className="text-2xl font-bold mb-4 text-white">Sign In Required</h1>
          <p className="text-emerald-100 mb-6">Please sign in to view your rooms</p>
          <Link href="/sign-in">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!userLeagues) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading your rooms...</p>
        </div>
      </div>
    )
  }

  const leagueTypeColors = {
    premier_league: 'from-purple-500 to-blue-600',
    la_liga: 'from-red-500 to-orange-600',
    champions_league: 'from-blue-600 to-indigo-700'
  }

  const leagueTypeNames = {
    premier_league: '🇬🇧 Premier League',
    la_liga: '🇪🇸 La Liga',
    champions_league: '🏆 Champions League'
  }

  // Separate created vs joined rooms
  const createdRooms = userLeagues.filter(league => league.creatorId === userConvexId)
  const joinedRooms = userLeagues.filter(league => league.creatorId !== userConvexId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏟️</div>
          <h1 className="text-3xl font-bold text-white mb-2">My Rooms</h1>
          <p className="text-emerald-100">Manage your created and joined fantasy soccer rooms</p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
          <Link href="/rooms/create">
            <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700">
              ➕ Create New Room
            </Button>
          </Link>
          <Link href="/team-builder">
            <Button variant="outline" className="w-full sm:w-auto text-white border-white/50 hover:bg-white/10">
              ⚡ Build Your Team
            </Button>
          </Link>
        </div>

        {/* No rooms state */}
        {userLeagues.length === 0 && (
          <div className="text-center max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-xl font-bold text-white mb-4">No Rooms Yet</h2>
            <p className="text-emerald-100 mb-6">
              Create your first room or join one using a room code to get started!
            </p>
            <div className="space-y-3">
              <Link href="/rooms/create">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Create Your First Room
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Created Rooms */}
        {createdRooms.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              👑 Rooms You Created ({createdRooms.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {createdRooms.map((league) => (
                <div key={league._id} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{league.name}</h3>
                      <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${leagueTypeColors[league.league as keyof typeof leagueTypeColors]} text-white`}>
                        {leagueTypeNames[league.league as keyof typeof leagueTypeNames]}
                      </div>
                    </div>
                    <div className="bg-yellow-500/20 rounded-full p-2">
                      <span className="text-yellow-400 text-sm">👑</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-200">Members:</span>
                      <span className="text-white font-medium">{league.currentParticipants}/{league.maxParticipants}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-200">Your Points:</span>
                      <span className="text-white font-medium">{league.userPoints || 0}</span>
                    </div>
                    {league.userRank && (
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-200">Your Rank:</span>
                        <span className="text-white font-medium">#{league.userRank}</span>
                      </div>
                    )}
                  </div>

                  <Link href={`/rooms/${league._id}`}>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                      Manage Room →
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Joined Rooms */}
        {joinedRooms.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              🤝 Rooms You Joined ({joinedRooms.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {joinedRooms.map((league) => (
                <div key={league._id} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{league.name}</h3>
                      <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${leagueTypeColors[league.league as keyof typeof leagueTypeColors]} text-white`}>
                        {leagueTypeNames[league.league as keyof typeof leagueTypeNames]}
                      </div>
                    </div>
                    <div className="bg-blue-500/20 rounded-full p-2">
                      <span className="text-blue-400 text-sm">👥</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-200">Created by:</span>
                      <span className="text-white font-medium">{league.creator?.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-200">Members:</span>
                      <span className="text-white font-medium">{league.currentParticipants}/{league.maxParticipants}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-200">Your Points:</span>
                      <span className="text-white font-medium">{league.userPoints || 0}</span>
                    </div>
                    {league.userRank && (
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-200">Your Rank:</span>
                        <span className="text-white font-medium">#{league.userRank}</span>
                      </div>
                    )}
                  </div>

                  <Link href={`/rooms/${league._id}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      View Room →
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-emerald-200 hover:text-white transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
} 