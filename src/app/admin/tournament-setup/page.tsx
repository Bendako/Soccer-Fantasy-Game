"use client"

import { useState } from "react"
import { useAction, useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Button } from "@/components/ui/button"

export default function TournamentSetupPage() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [results, setResults] = useState<Record<string, unknown> | null>(null)

  // Convex actions
  const initializeAllTournaments = useAction(api.realDataFetcher.initializeAllTournaments)
  const fetchRealFixtures = useAction(api.realDataFetcher.fetchRealFixturesAndGameweeks)
  const getTournamentInfo = useAction(api.realDataFetcher.getTournamentInfo)

  // Get current gameweeks
  const premierLeagueGameweeks = useQuery(api.gameweeks.getGameweeks, { 
    league: "premier_league" 
  })
  const championsLeagueGameweeks = useQuery(api.gameweeks.getGameweeks, { 
    league: "champions_league" 
  })
  const laLigaGameweeks = useQuery(api.gameweeks.getGameweeks, { 
    league: "la_liga" 
  })

  const handleInitializeAll = async () => {
    setIsInitializing(true)
    try {
      const result = await initializeAllTournaments({ useTestData: true })
      setResults(result)
    } catch (error) {
      console.error("Failed to initialize tournaments:", error)
      setResults({ error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setIsInitializing(false)
    }
  }

  const handleInitializeLeague = async (league: string) => {
    setIsInitializing(true)
    try {
      const result = await fetchRealFixtures({ league, useTestData: true })
      setResults(result)
    } catch (error) {
      console.error(`Failed to initialize ${league}:`, error)
      setResults({ error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setIsInitializing(false)
    }
  }

  const handleGetTournamentInfo = async (league: string) => {
    try {
      const info = await getTournamentInfo({ league })
      setResults(info)
    } catch (error) {
      console.error(`Failed to get ${league} info:`, error)
      setResults({ error: error instanceof Error ? error.message : "Unknown error" })
    }
  }

  const tournaments = [
    { 
      key: "premier_league", 
      name: "Premier League", 
      flag: "🇬🇧",
      gameweeks: premierLeagueGameweeks
    },
    { 
      key: "champions_league", 
      name: "Champions League", 
      flag: "🏆",
      gameweeks: championsLeagueGameweeks
    },
    { 
      key: "la_liga", 
      name: "La Liga", 
      flag: "🇪🇸",
      gameweeks: laLigaGameweeks
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Tournament Setup Admin</h1>
          <p className="text-emerald-200">
            Initialize real tournament data, manage gameweeks, and set up fixtures
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">🚀 Quick Setup</h2>
            <Button
              onClick={handleInitializeAll}
              disabled={isInitializing}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mb-2"
            >
              {isInitializing ? "Initializing..." : "Initialize All Tournaments"}
            </Button>
            <p className="text-emerald-200 text-sm">
              Sets up all tournaments with test data and proper gameweek deadlines
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">📊 Current Status</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-emerald-200">Premier League:</span>
                <span className="text-white">{premierLeagueGameweeks?.length || 0} gameweeks</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-200">Champions League:</span>
                <span className="text-white">{championsLeagueGameweeks?.length || 0} gameweeks</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-200">La Liga:</span>
                <span className="text-white">{laLigaGameweeks?.length || 0} gameweeks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Individual Tournament Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {tournaments.map((tournament) => (
            <div key={tournament.key} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{tournament.flag}</span>
                <h3 className="text-lg font-bold text-white">{tournament.name}</h3>
              </div>
              
              <div className="space-y-3">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-emerald-200 text-sm">Gameweeks:</div>
                  <div className="text-white font-bold">
                    {tournament.gameweeks?.length || 0}
                  </div>
                  {tournament.gameweeks && tournament.gameweeks.length > 0 && (
                    <div className="text-emerald-200 text-xs mt-1">
                      Active: {tournament.gameweeks.filter(gw => gw.isActive).length}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => handleInitializeLeague(tournament.key)}
                    disabled={isInitializing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  >
                    Initialize {tournament.name}
                  </Button>
                  
                  <Button
                    onClick={() => handleGetTournamentInfo(tournament.key)}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10 text-sm"
                  >
                    Get Info
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Results Display */}
        {results && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">📋 Last Operation Results</h3>
            <pre className="bg-black/20 rounded-lg p-4 text-emerald-200 text-sm overflow-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}

        {/* Real-time Tournament Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {tournaments.map((tournament) => (
            <div key={tournament.key} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h4 className="text-white font-bold mb-3">{tournament.flag} {tournament.name} Status</h4>
              
              {tournament.gameweeks && tournament.gameweeks.length > 0 ? (
                <div className="space-y-2">
                  {tournament.gameweeks
                    .filter(gw => gw.isActive)
                    .map(gw => (
                      <div key={gw._id} className="bg-emerald-600/20 rounded-lg p-3">
                        <div className="text-white font-medium">
                          Gameweek {gw.number}
                        </div>
                        <div className="text-emerald-200 text-sm">
                          Deadline: {new Date(gw.deadline).toLocaleString()}
                        </div>
                        <div className="text-emerald-200 text-sm">
                          Status: {gw.status}
                        </div>
                      </div>
                    ))}
                  
                  {tournament.gameweeks.filter(gw => gw.isActive).length === 0 && (
                    <div className="text-yellow-200 text-sm">
                      No active gameweek - consider activating one
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-300 text-sm">
                  No gameweeks configured
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <a href="/admin">← Back to Admin</a>
          </Button>
        </div>
      </div>
    </div>
  )
} 