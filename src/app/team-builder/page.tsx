'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery, useMutation } from 'convex/react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import FormationPitch, { Player } from '@/components/FormationPitch'
import { api } from '../../../convex/_generated/api'
import { useState, useEffect } from 'react'
import type { Id } from "../../../convex/_generated/dataModel"

export default function TeamBuilder() {
  const { user } = useUser()
  const [selectedLeague] = useState<string>('premier_league')
  const [userConvexId, setUserConvexId] = useState<Id<"users"> | null>(null)

  // Fetch or create user in Convex
  const createUser = useMutation(api.users.createUser)
  const createDefaultLeague = useMutation(api.fantasyLeagues.createDefaultLeague)
  const activateFirstGameweek = useMutation(api.gameweeks.activateFirstGameweek)

  // Fetch current gameweek for the selected league
  const currentGameweek = useQuery(api.gameweeks.getCurrentGameweek, 
    { league: selectedLeague }
  )

  // Fetch user's leagues
  const userLeagues = useQuery(api.fantasyLeagues.getUserLeagues,
    userConvexId ? { userId: userConvexId } : "skip"
  )

  // Fetch players data
  const players = useQuery(api.players.getAllPlayers)

  // Get user's existing team for current gameweek (if any)
  const currentLeagueId = userLeagues?.[0]?._id
  const existingTeam = useQuery(api.fantasyTeams.getUserTeam,
    userConvexId && currentGameweek && currentLeagueId ? {
      userId: userConvexId,
      gameweekId: currentGameweek._id,
      fantasyLeagueId: currentLeagueId
    } : "skip"
  )

    // Create or get user when component mounts
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

  // Create default league if user has no leagues
  useEffect(() => {
    const ensureUserHasLeague = async () => {
      if (userConvexId && userLeagues && userLeagues.length === 0) {
        try {
          await createDefaultLeague({
            userId: userConvexId,
            league: selectedLeague
          })
          // Refetch will happen automatically due to Convex reactivity
        } catch (error) {
          console.error('Failed to create default league:', error)
        }
      }
    }

    ensureUserHasLeague()
  }, [userConvexId, userLeagues, selectedLeague, createDefaultLeague])

  // Activate first gameweek if none is active
  useEffect(() => {
    const ensureActiveGameweek = async () => {
      if (!currentGameweek) {
        try {
          await activateFirstGameweek({ league: selectedLeague })
          // Refetch will happen automatically due to Convex reactivity
        } catch (error) {
          console.error('Failed to activate gameweek:', error)
        }
      }
    }

    ensureActiveGameweek()
  }, [currentGameweek, selectedLeague, activateFirstGameweek])

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

  // Show loading state while initializing
  if (!userConvexId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading your profile...</p>
        </div>
      </div>
    )
  }

  // Show message if no gameweek is active
  if (!currentGameweek) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold mb-4 text-white">No Active Gameweek</h1>
          <p className="text-emerald-100 mb-6">
                         There&apos;s currently no active gameweek for {selectedLeague.replace('_', ' ').toUpperCase()}. 
            Please check back later or contact support.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button variant="outline" className="w-full sm:w-auto">← Back to Home</Button>
            </Link>
            <Link href="/admin">
              <Button className="w-full sm:w-auto">⚙️ Admin Panel</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Show loading state while creating default league
  if (userConvexId && userLeagues && userLeagues.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Setting up your default league...</p>
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

  const deadlineDate = new Date(currentGameweek.deadline)
  const timeUntilDeadline = currentGameweek.deadline - Date.now()
  const isDeadlinePassed = timeUntilDeadline <= 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-teal-700">
      {/* Mobile-optimized container */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">Team Builder</h1>
              <p className="text-emerald-100 text-sm sm:text-base">
                Build your team for Gameweek {currentGameweek.number} ({selectedLeague.replace('_', ' ').toUpperCase()})
              </p>
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
            </div>
          </div>
          
          {/* Gameweek Info Panel */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-emerald-200 font-medium">Gameweek:</span>
                <p className="text-white font-bold">{currentGameweek.number} - {currentGameweek.season}</p>
              </div>
              <div>
                <span className="text-emerald-200 font-medium">League:</span>
                <p className="text-white font-bold">{userLeagues?.[0]?.name || 'Default League'}</p>
              </div>
              <div>
                <span className="text-emerald-200 font-medium">Deadline:</span>
                <p className={`font-bold ${isDeadlinePassed ? 'text-red-300' : 'text-white'}`}>
                  {isDeadlinePassed ? 'Deadline Passed' : deadlineDate.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Team Status */}
          {existingTeam && (
            <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-blue-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">
                  Team already submitted for this gameweek
                </span>
              </div>
              <p className="text-blue-200 text-sm mt-1">
                You can still make changes until the deadline.
              </p>
            </div>
          )}

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
          {convertedPlayers.length > 0 && currentLeagueId ? (
            <FormationPitch
              selectedPlayers={convertedPlayers}
              onPlayerSelect={() => {}} // Not used in the new approach
              onRemovePlayer={() => {}} // Not used in the new approach
              userId={userConvexId}
              gameweekId={currentGameweek._id}
              fantasyLeagueId={currentLeagueId}
              existingTeam={existingTeam}
              isDeadlinePassed={isDeadlinePassed}
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