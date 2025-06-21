'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from "../../convex/_generated/dataModel"

interface RoomSharingModalProps {
  fantasyLeagueId: Id<"fantasyLeagues">
  userId: Id<"users">
  isOpen: boolean
  onClose: () => void
}

export default function RoomSharingModal({ fantasyLeagueId, userId, isOpen, onClose }: RoomSharingModalProps) {
  const [copied, setCopied] = useState<string | null>(null)
  
  // Get sharing info
  const sharingInfo = useQuery(api.fantasyLeagues.getRoomSharingInfo,
    { fantasyLeagueId }
  )
  
  // Regenerate code mutation
  const regenerateCode = useMutation(api.fantasyLeagues.regenerateRoomCode)

  if (!isOpen || !sharingInfo) return null

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleRegenerateCode = async () => {
    try {
      await regenerateCode({ fantasyLeagueId, userId })
    } catch (error) {
      console.error('Failed to regenerate code:', error)
      alert('Failed to regenerate code. Please try again.')
    }
  }

  const shareMessage = `Join my fantasy soccer room: ${sharingInfo.roomName}\n\nRoom Code: ${sharingInfo.code}\nJoin Link: ${sharingInfo.shareUrl}`
  
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(sharingInfo.shareUrl)}&text=${encodeURIComponent(`Join my fantasy soccer room: ${sharingInfo.roomName}`)}`

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Share Your Room</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Room Info */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-4 text-white mb-6">
          <h3 className="font-bold text-lg">{sharingInfo.roomName}</h3>
          <p className="text-emerald-100">
            {sharingInfo.memberCount}/{sharingInfo.maxMembers} members
          </p>
        </div>

        {/* Room Code Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Room Code
          </label>
          <div className="flex gap-2">
            <div className="flex-1 p-3 bg-gray-800 text-white rounded-lg font-mono text-lg text-center font-bold">
              {sharingInfo.code}
            </div>
            <Button
              onClick={() => handleCopy(sharingInfo.code, 'code')}
              variant="outline"
              className="px-4"
            >
              {copied === 'code' ? '✓' : 'Copy'}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Friends can enter this code manually
          </p>
        </div>

        {/* Share Link Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Share Link
          </label>
          <div className="flex gap-2">
            <div className="flex-1 p-3 bg-gray-800 text-white rounded-lg text-sm break-all">
              {sharingInfo.shareUrl}
            </div>
            <Button
              onClick={() => handleCopy(sharingInfo.shareUrl, 'link')}
              variant="outline"
              className="px-4"
            >
              {copied === 'link' ? '✓' : 'Copy'}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Direct join link with room preview
          </p>
        </div>

        {/* Quick Share Buttons */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Quick Share
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleCopy(shareMessage, 'message')}
              variant="outline"
              className="p-3"
            >
              {copied === 'message' ? '✓ Copied!' : '📋 Copy Message'}
            </Button>
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button variant="outline" className="w-full p-3">
                💬 WhatsApp
              </Button>
            </a>
            <a 
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button variant="outline" className="w-full p-3">
                ✈️ Telegram
              </Button>
            </a>
            <Button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `Join ${sharingInfo.roomName}`,
                    text: shareMessage,
                    url: sharingInfo.shareUrl,
                  })
                } else {
                  handleCopy(shareMessage, 'message')
                }
              }}
              variant="outline"
              className="p-3"
            >
              📤 Share
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        {sharingInfo.recentMembers.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Recent Joins
            </label>
            <div className="space-y-2">
              {sharingInfo.recentMembers.slice(0, 3).map((member, index) => (
                <div key={index} className="flex items-center text-sm bg-gray-50 p-2 rounded-lg">
                  <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs mr-3 font-semibold">
                    {member.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="flex-1 text-gray-800 font-medium">{member.name}</span>
                  <span className="text-gray-600 text-xs">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Options */}
        <div className="border-t pt-4">
          <Button
            onClick={handleRegenerateCode}
            variant="outline"
            className="w-full text-sm text-gray-600"
          >
            🔄 Generate New Code
          </Button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            This will invalidate the current code
          </p>
        </div>
      </div>
    </div>
  )
} 