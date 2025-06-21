'use client'

import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useQuery, useMutation } from 'convex/react'
import { Button } from '@/components/ui/button'
import { api } from '../../../../convex/_generated/api'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import RoomSharingModal from '@/components/RoomSharingModal'
import type { Id } from "../../../../convex/_generated/dataModel"

export default function RoomDashboard() {
  const params = useParams()
  const router = useRouter()
  const roomId = params?.roomId as Id<"fantasyLeagues">
  const { user } = useUser()
  const [userConvexId, setUserConvexId] = useState<Id<"users"> | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Create user mutation
  const createUser = useMutation(api.users.createUser)
  
  // Delete room mutation
  const deleteRoom = useMutation(api.fantasyLeagues.deleteFantasyLeague)

  // Get room details with members
  const roomDetails = useQuery(api.fantasyLeagues.getLeagueWithMembers,
    roomId ? { fantasyLeagueId: roomId } : "skip"
  )

  // Handle room deletion
  const handleDeleteRoom = async () => {
    if (!userConvexId || !roomId) return
    
    try {
      await deleteRoom({
        fantasyLeagueId: roomId,
        userId: userConvexId
      })
      router.push('/rooms')
    } catch (error) {
      console.error('Failed to delete room:', error)
      alert('Failed to delete room. Please try again.')
    }
  }

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
          <h1 className="text-2xl font-bold mb-4 text-white">Room Dashboard</h1>
          <p className="text-emerald-100 mb-6">Sign in to access this room</p>
          <Link href="/sign-in">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!roomDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading room...</p>
        </div>
      </div>
    )
  }

  const isCreator = roomDetails.creator?.clerkId === user.id
  const currentUserMember = roomDetails.members.find(member => member.clerkId === user.id)
  
  if (!currentUserMember) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
        <div className="text-center max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-4 text-white">Access Denied</h1>
          <p className="text-emerald-100 mb-6">
            You&apos;re not a member of this room.
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⚽</div>
          <h1 className="text-3xl font-bold text-white mb-2">{roomDetails.name}</h1>
          <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r ${leagueTypeColors[roomDetails.league as keyof typeof leagueTypeColors]} text-white mb-4`}>
            {leagueTypeNames[roomDetails.league as keyof typeof leagueTypeNames]}
          </div>
          <p className="text-emerald-100">
            Created by {roomDetails.creator?.name} • {roomDetails.currentParticipants}/{roomDetails.maxParticipants} members
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
          {isCreator && (
            <Button
              onClick={() => setShowShareModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              📤 Share Room
            </Button>
          )}
          <Link href={`/team-builder?league=${roomDetails.league}`}>
            <Button variant="outline" className="w-full sm:w-auto text-white border-white/50 hover:bg-white/10">
              ⚡ Build Your Team
            </Button>
          </Link>
          <Button variant="outline" className="text-white border-white/50 hover:bg-white/10">
            📊 View Leaderboard
          </Button>
          {isCreator && (
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="outline"
              className="text-red-300 border-red-300/50 hover:bg-red-500/20"
            >
              🗑️ Delete Room
            </Button>
          )}
        </div>

        {/* Room Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-white mb-2">{roomDetails.currentParticipants}</div>
            <div className="text-emerald-100">Total Members</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {roomDetails.maxParticipants - roomDetails.currentParticipants}
            </div>
            <div className="text-emerald-100">Spots Available</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-white mb-2">{roomDetails.status === 'active' ? 'Active' : 'Upcoming'}</div>
            <div className="text-emerald-100">Room Status</div>
          </div>
        </div>

        {/* Members List */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-6">Room Members</h2>
          
          {roomDetails.members.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">👥</div>
              <p className="text-emerald-100">No members yet. Share your room code to invite friends!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {roomDetails.members.map((member, index) => (
                <div key={member._id} className="flex items-center justify-between bg-white/10 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                      {member.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-semibold flex items-center gap-2">
                        {member.name}
                        {member._id === roomDetails.creatorId && (
                          <span className="bg-emerald-600 text-white text-xs px-2 py-1 rounded-full">Creator</span>
                        )}
                        {member.clerkId === user.id && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">You</span>
                        )}
                      </div>
                      <div className="text-emerald-200 text-sm">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-white font-bold">#{index + 1}</div>
                    <div className="text-emerald-200 text-sm">{member.totalPoints || 0} pts</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-emerald-200 hover:text-white transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Sharing Modal */}
      {userConvexId && (
        <RoomSharingModal
          fantasyLeagueId={roomId}
          userId={userConvexId}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-md w-full">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-white mb-4">Delete Room?</h2>
              <p className="text-emerald-100 mb-6">
                Are you sure you want to delete &quot;{roomDetails.name}&quot;? This action cannot be undone and will remove all members and their data.
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="outline"
                  className="flex-1 text-white border-white/50 hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteRoom}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete Room
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 