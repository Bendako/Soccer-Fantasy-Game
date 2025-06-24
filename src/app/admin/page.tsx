'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AdminPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const seedDatabase = useMutation(api.seedData.seedDatabase)

  const handleSeed = async () => {
    setLoading(true)
    try {
      const result = await seedDatabase({})
      setMessage(`✅ Database seeded successfully! Teams: ${result.teamsCreated}, Players: ${result.playersCreated}`)
    } catch (error) {
      setMessage(`❌ Error: ${error}`)
    }
    setLoading(false)
  }

  const handleClear = async () => {
    if (!confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      return
    }
    
    setLoading(true)
    try {
      // For now, just show a message since we don't have a clearDatabase mutation
      setMessage(`⚠️ Clear database functionality not implemented yet`)
    } catch (error) {
      setMessage(`❌ Error: ${error}`)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-2xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              🔧 Admin Panel
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage the Fantasy Soccer Game database and settings
            </p>
          </div>

          {/* Database Management */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
              📊 Database Management
            </h2>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleSeed}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 flex-1"
                  size="lg"
                >
                  {loading ? '⏳ Seeding...' : '🌱 Seed Database'}
                </Button>
                
                <Button 
                  onClick={handleClear}
                  disabled={loading}
                  variant="destructive"
                  className="flex-1"
                  size="lg"
                >
                  {loading ? '⏳ Clearing...' : '🗑️ Clear Database'}
                </Button>
              </div>
              
              {message && (
                <div className="mt-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-700">
                  <p className="text-sm font-mono">{message}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sample Data Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-4 text-blue-800 dark:text-blue-200">
              📋 What gets seeded?
            </h3>
            <div className="space-y-3 text-sm text-blue-700 dark:text-blue-300">
              <div className="flex items-center gap-2">
                <span>⚽</span>
                <span><strong>6 Premier League teams:</strong> Manchester City, Arsenal, Liverpool, Manchester United, Chelsea, Tottenham</span>
              </div>
              <div className="flex items-center gap-2">
                <span>👥</span>
                <span><strong>30 Players:</strong> 5 players per team (1 GK, 1 DEF, 2 MID, 1 FWD)</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span><strong>1 Gameweek:</strong> Sample gameweek for the 2024-25 season</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🏆</span>
                <span><strong>Player Stats:</strong> Realistic points and performance data</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Ready to test the game?
            </p>
            <div className="space-x-4">
              <Link href="/team-builder" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                🏗️ Team Builder
              </Link>
              <Link href="/" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                🏠 Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 