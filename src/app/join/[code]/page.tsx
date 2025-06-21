'use client'

import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useQuery, useMutation } from 'convex/react'
import { Button } from '@/components/ui/button'
import { api } from '../../../../convex/_generated/api'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Id } from "../../../../convex/_generated/dataModel"

export default function JoinRoom() {
  const params = useParams()
  const code = params?.code as string
  const router = useRouter()
  const { user } = useUser()
  const [userConvexId, setUserConvexId] = useState<Id<"users"> | null>(null)
  const [isJoining, setIsJoining] = useState(false)

  // Create user mutation
  const createUser = useMutation(api.users.createUser)
  const joinLeague = useMutation(api.fantasyLeagues.joinFantasyLeague)

  // Get league by code
  const league = useQuery(api.fantasyLeagues.getLeagueByCode, 
    code ? { code } : "skip"
  )

  // Get league details with members if league found
  const leagueDetails = useQuery(api.fantasyLeagues.getLeagueWithMembers,
    league ? { fantasyLeagueId: league._id } : "skip"
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

  const handleJoinRoom = async () => {
    if (!userConvexId || !league) return
    
    setIsJoining(true)
    try {
      await joinLeague({
        userId: userConvexId,
        code: code as string
      })
      
      // Redirect to room dashboard
      router.push(`/rooms/${league._id}`)
    } catch (error) {
      console.error('Failed to join room:', error)
      alert('Failed to join room. Please try again.')
    } finally {
      setIsJoining(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
        <div className="text-center max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="text-6xl mb-4">⚽</div>
          <h1 className="text-2xl font-bold mb-4 text-white">Join Soccer Room</h1>
          <p className="text-emerald-100 mb-6">Sign in to join this fantasy soccer room</p>
          <Link href="/sign-in">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
              Sign In to Join
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!league) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
        <div className="text-center max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-4 text-white">Room Not Found</h1>
          <p className="text-emerald-100 mb-6">
            The room code <span className="font-mono bg-white/20 px-2 py-1 rounded">{code}</span> is invalid or expired.
          </p>
          <Link href="/">
            <Button variant="outline" className="w-full">
              ← Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!leagueDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading room details...</p>
        </div>
      </div>
    )
  }

  // Check if league is full
  const isFull = leagueDetails.currentParticipants >= leagueDetails.maxParticipants

  // Check if user is already a member
  const isAlreadyMember = leagueDetails.members.some(member => member.clerkId === user.id)

  if (isAlreadyMember) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
        <div className="text-center max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-4 text-white">Already Joined!</h1>
          <p className="text-emerald-100 mb-6">
            You&apos;re already a member of <span className="font-semibold">{leagueDetails.name}</span>
          </p>
          <Link href={`/rooms/${leagueDetails._id}`}>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
              Go to Room →
            </Button>
          </Link>
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
      <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        {/* Room Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">⚽</div>
          <h1 className="text-2xl font-bold text-white mb-2">{leagueDetails.name}</h1>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${leagueTypeColors[leagueDetails.league as keyof typeof leagueTypeColors]} text-white`}>
            {leagueTypeNames[leagueDetails.league as keyof typeof leagueTypeNames]}
          </div>
        </div>

        {/* Room Stats */}
        <div className="bg-white/10 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{leagueDetails.currentParticipants}</div>
              <div className="text-sm text-emerald-100">Members</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{leagueDetails.maxParticipants}</div>
              <div className="text-sm text-emerald-100">Max Size</div>
            </div>
          </div>
        </div>

        {/* Creator Info */}
        <div className="text-center mb-6">
          <p className="text-emerald-100">
            Created by <span className="font-semibold text-white">{leagueDetails.creator?.name}</span>
          </p>
        </div>

        {/* Recent Members */}
        {leagueDetails.members.length > 0 && (
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3">Recent Members</h3>
            <div className="space-y-2">
              {leagueDetails.members.slice(0, 3).map((member, index) => (
                <div key={index} className="flex items-center text-sm text-emerald-100">
                  <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs mr-3">
                    {member.name?.charAt(0)?.toUpperCase()}
                  </div>
                  {member.name}
                </div>
              ))}
              {leagueDetails.members.length > 3 && (
                <div className="text-sm text-emerald-200">
                  +{leagueDetails.members.length - 3} more members
                </div>
              )}
            </div>
          </div>
        )}

        {/* Join Button */}
        <div className="space-y-3">
          {isFull ? (
            <Button disabled className="w-full">
              Room is Full ({leagueDetails.currentParticipants}/{leagueDetails.maxParticipants})
            </Button>
          ) : (
            <Button 
              onClick={handleJoinRoom}
              disabled={isJoining}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {isJoining ? 'Joining...' : 'Join Room'}
            </Button>
          )}
          
          <Link href="/">
            <Button variant="outline" className="w-full">
              ← Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 