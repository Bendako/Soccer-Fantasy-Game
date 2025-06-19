'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PlayerSelectionModal } from '@/components/PlayerSelectionModal'
import { Id } from '../../convex/_generated/dataModel'

// Types for our team builder
interface Player {
  _id: Id<"players">
  name: string
  position: 'GK' | 'DEF' | 'MID' | 'FWD'
  jerseyNumber?: number
  totalGoals: number
  totalAssists: number
  totalPoints: number
  averagePoints: number
  injured: boolean
  suspended: boolean
  realTeam: {
    name: string
    shortName: string
    colors?: {
      primary: string
      secondary: string
    }
  } | null
}

interface Formation {
  name: string
  positions: {
    defenders: number
    midfielders: number
    forwards: number
  }
}

interface ModalState {
  isOpen: boolean
  position: string
  slotType: 'starting' | 'bench'
  slotIndex?: number
}

const formations: Formation[] = [
  { name: '4-3-3', positions: { defenders: 4, midfielders: 3, forwards: 3 } },
  { name: '4-4-2', positions: { defenders: 4, midfielders: 4, forwards: 2 } },
  { name: '3-5-2', positions: { defenders: 3, midfielders: 5, forwards: 2 } },
  { name: '5-3-2', positions: { defenders: 5, midfielders: 3, forwards: 2 } },
  { name: '4-5-1', positions: { defenders: 4, midfielders: 5, forwards: 1 } },
]

export default function TeamBuilder() {
  const { user } = useUser()
  const [selectedFormation, setSelectedFormation] = useState<Formation>(formations[0])
  const [selectedPlayers, setSelectedPlayers] = useState<{
    goalkeeper?: Player
    defenders: Player[]
    midfielders: Player[]
    forwards: Player[]
    bench: {
      goalkeeper?: Player
      defender?: Player
      midfielder?: Player
      forward?: Player
    }
  }>({
    defenders: [],
    midfielders: [],
    forwards: [],
    bench: {}
  })
  const [captain, setCaptain] = useState<string | null>(null)
  const [viceCaptain, setViceCaptain] = useState<string | null>(null)
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    position: '',
    slotType: 'starting'
  })

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

  const openPlayerSelector = (position: string, slotType: 'starting' | 'bench', slotIndex?: number) => {
    setModalState({
      isOpen: true,
      position,
      slotType,
      slotIndex
    })
  }

  const closePlayerSelector = () => {
    setModalState({
      isOpen: false,
      position: '',
      slotType: 'starting'
    })
  }

  const handlePlayerSelect = (player: Player) => {
    const newSelectedPlayers = { ...selectedPlayers }

    if (modalState.slotType === 'starting') {
      if (modalState.position === 'GK') {
        newSelectedPlayers.goalkeeper = player
      } else if (modalState.position === 'DEF') {
        if (modalState.slotIndex !== undefined) {
          const newDefenders = [...newSelectedPlayers.defenders]
          newDefenders[modalState.slotIndex] = player
          newSelectedPlayers.defenders = newDefenders
        } else {
          // Find first empty slot
          const emptyIndex = newSelectedPlayers.defenders.findIndex((_, i) => !newSelectedPlayers.defenders[i])
          if (emptyIndex !== -1) {
            newSelectedPlayers.defenders[emptyIndex] = player
          } else if (newSelectedPlayers.defenders.length < selectedFormation.positions.defenders) {
            newSelectedPlayers.defenders.push(player)
          }
        }
      } else if (modalState.position === 'MID') {
        if (modalState.slotIndex !== undefined) {
          const newMidfielders = [...newSelectedPlayers.midfielders]
          newMidfielders[modalState.slotIndex] = player
          newSelectedPlayers.midfielders = newMidfielders
        } else {
          // Find first empty slot
          const emptyIndex = newSelectedPlayers.midfielders.findIndex((_, i) => !newSelectedPlayers.midfielders[i])
          if (emptyIndex !== -1) {
            newSelectedPlayers.midfielders[emptyIndex] = player
          } else if (newSelectedPlayers.midfielders.length < selectedFormation.positions.midfielders) {
            newSelectedPlayers.midfielders.push(player)
          }
        }
      } else if (modalState.position === 'FWD') {
        if (modalState.slotIndex !== undefined) {
          const newForwards = [...newSelectedPlayers.forwards]
          newForwards[modalState.slotIndex] = player
          newSelectedPlayers.forwards = newForwards
        } else {
          // Find first empty slot
          const emptyIndex = newSelectedPlayers.forwards.findIndex((_, i) => !newSelectedPlayers.forwards[i])
          if (emptyIndex !== -1) {
            newSelectedPlayers.forwards[emptyIndex] = player
          } else if (newSelectedPlayers.forwards.length < selectedFormation.positions.forwards) {
            newSelectedPlayers.forwards.push(player)
          }
        }
      }
    } else {
      // Bench selection
      if (modalState.position === 'GK') {
        newSelectedPlayers.bench.goalkeeper = player
      } else if (modalState.position === 'DEF') {
        newSelectedPlayers.bench.defender = player
      } else if (modalState.position === 'MID') {
        newSelectedPlayers.bench.midfielder = player
      } else if (modalState.position === 'FWD') {
        newSelectedPlayers.bench.forward = player
      }
    }

    setSelectedPlayers(newSelectedPlayers)
    closePlayerSelector()
  }

  const getAllSelectedPlayerIds = (): Id<"players">[] => {
    const ids: Id<"players">[] = []
    
    if (selectedPlayers.goalkeeper) ids.push(selectedPlayers.goalkeeper._id)
    ids.push(...selectedPlayers.defenders.map(p => p._id))
    ids.push(...selectedPlayers.midfielders.map(p => p._id))
    ids.push(...selectedPlayers.forwards.map(p => p._id))
    
    if (selectedPlayers.bench.goalkeeper) ids.push(selectedPlayers.bench.goalkeeper._id)
    if (selectedPlayers.bench.defender) ids.push(selectedPlayers.bench.defender._id)
    if (selectedPlayers.bench.midfielder) ids.push(selectedPlayers.bench.midfielder._id)
    if (selectedPlayers.bench.forward) ids.push(selectedPlayers.bench.forward._id)
    
    return ids
  }

  const getTotalPlayers = () => {
    const starting = 1 + // goalkeeper
      selectedPlayers.defenders.length +
      selectedPlayers.midfielders.length +
      selectedPlayers.forwards.length
    
    const bench = Object.values(selectedPlayers.bench).filter(Boolean).length
    return starting + bench
  }

  const isFormationValid = () => {
    return (
      selectedPlayers.goalkeeper &&
      selectedPlayers.defenders.length === selectedFormation.positions.defenders &&
      selectedPlayers.midfielders.length === selectedFormation.positions.midfielders &&
      selectedPlayers.forwards.length === selectedFormation.positions.forwards
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900 dark:to-emerald-900">
      <div className="container mx-auto px-6 py-8">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
              Home
            </Link>
            <span>›</span>
            <span className="text-gray-900 dark:text-gray-200 font-medium">Team Builder</span>
          </nav>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              ⚽ Build Your Dream Team
            </h1>
            <Link href="/">
              <Button variant="outline" className="hidden sm:flex">
                ← Back to Home
              </Button>
            </Link>
          </div>
          <p className="text-center sm:text-left text-gray-600 dark:text-gray-300 max-w-2xl">
            No budget limits. No team restrictions. Pick any players from any club and create your ultimate fantasy team.
          </p>
        </div>

        {/* Formation Selector */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-center">Choose Your Formation</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {formations.map((formation) => (
              <Button
                key={formation.name}
                variant={selectedFormation.name === formation.name ? "default" : "outline"}
                onClick={() => setSelectedFormation(formation)}
                className="min-w-[80px]"
              >
                {formation.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Team Progress */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-4 bg-white dark:bg-gray-800 rounded-lg px-6 py-3 shadow-lg">
            <span className="text-sm font-medium">
              Players: {getTotalPlayers()}/15
            </span>
            <span className="text-sm font-medium">
              Formation: {isFormationValid() ? '✅' : '❌'} {selectedFormation.name}
            </span>
            <span className="text-sm font-medium">
              Captain: {captain ? '✅' : '❌'}
            </span>
          </div>
        </div>

        {/* Soccer Pitch Layout */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-green-600 rounded-lg p-8 relative min-h-[600px]" style={{
            backgroundImage: `
              radial-gradient(circle at 50% 0%, rgba(255,255,255,0.1) 0%, transparent 50%),
              radial-gradient(circle at 50% 100%, rgba(255,255,255,0.1) 0%, transparent 50%),
              linear-gradient(90deg, rgba(255,255,255,0.1) 49%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 51%)
            `
          }}>
            
            {/* Goalkeeper */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <PlayerSlot
                position="GK"
                player={selectedPlayers.goalkeeper}
                isCaptain={captain === selectedPlayers.goalkeeper?._id}
                isViceCaptain={viceCaptain === selectedPlayers.goalkeeper?._id}
                onClick={() => openPlayerSelector('GK', 'starting')}
              />
            </div>

            {/* Defenders */}
            <div className="absolute bottom-20 left-0 right-0">
              <div className="flex justify-center gap-4">
                {Array.from({ length: selectedFormation.positions.defenders }).map((_, index) => (
                  <PlayerSlot
                    key={`def-${index}`}
                    position="DEF"
                    player={selectedPlayers.defenders[index]}
                    isCaptain={captain === selectedPlayers.defenders[index]?._id}
                    isViceCaptain={viceCaptain === selectedPlayers.defenders[index]?._id}
                    onClick={() => openPlayerSelector('DEF', 'starting', index)}
                  />
                ))}
              </div>
            </div>

            {/* Midfielders */}
            <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2">
              <div className="flex justify-center gap-4">
                {Array.from({ length: selectedFormation.positions.midfielders }).map((_, index) => (
                  <PlayerSlot
                    key={`mid-${index}`}
                    position="MID"
                    player={selectedPlayers.midfielders[index]}
                    isCaptain={captain === selectedPlayers.midfielders[index]?._id}
                    isViceCaptain={viceCaptain === selectedPlayers.midfielders[index]?._id}
                    onClick={() => openPlayerSelector('MID', 'starting', index)}
                  />
                ))}
              </div>
            </div>

            {/* Forwards */}
            <div className="absolute top-20 left-0 right-0">
              <div className="flex justify-center gap-4">
                {Array.from({ length: selectedFormation.positions.forwards }).map((_, index) => (
                  <PlayerSlot
                    key={`fwd-${index}`}
                    position="FWD"
                    player={selectedPlayers.forwards[index]}
                    isCaptain={captain === selectedPlayers.forwards[index]?._id}
                    isViceCaptain={viceCaptain === selectedPlayers.forwards[index]?._id}
                    onClick={() => openPlayerSelector('FWD', 'starting', index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bench */}
        <div className="max-w-4xl mx-auto mb-8">
          <h3 className="text-lg font-semibold mb-4 text-center">Bench (4 players)</h3>
          <div className="flex justify-center gap-4 flex-wrap">
            <PlayerSlot
              position="GK"
              player={selectedPlayers.bench.goalkeeper}
              label="Bench GK"
              onClick={() => openPlayerSelector('GK', 'bench')}
            />
            <PlayerSlot
              position="DEF"
              player={selectedPlayers.bench.defender}
              label="Bench DEF"
              onClick={() => openPlayerSelector('DEF', 'bench')}
            />
            <PlayerSlot
              position="MID"
              player={selectedPlayers.bench.midfielder}
              label="Bench MID"
              onClick={() => openPlayerSelector('MID', 'bench')}
            />
            <PlayerSlot
              position="FWD"
              player={selectedPlayers.bench.forward}
              label="Bench FWD"
              onClick={() => openPlayerSelector('FWD', 'bench')}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <Button size="lg" variant="outline">
            Save as Draft
          </Button>
          <Button 
            size="lg" 
            className="bg-green-600 hover:bg-green-700"
            disabled={!isFormationValid() || !captain}
          >
            Submit Team
          </Button>
        </div>

        {/* Player Selection Modal */}
        <PlayerSelectionModal
          isOpen={modalState.isOpen}
          onClose={closePlayerSelector}
          position={modalState.position}
          selectedPlayerIds={getAllSelectedPlayerIds()}
          onSelectPlayer={handlePlayerSelect}
        />
      </div>
    </div>
  )
}

// Player Slot Component
interface PlayerSlotProps {
  position: string
  player?: Player
  isCaptain?: boolean
  isViceCaptain?: boolean
  label?: string
  onClick: () => void
}

function PlayerSlot({ position, player, isCaptain, isViceCaptain, label, onClick }: PlayerSlotProps) {
  return (
    <div className="text-center">
      <div
        onClick={onClick}
        className={`
          w-16 h-20 rounded-lg border-2 cursor-pointer transition-all duration-200
          flex flex-col items-center justify-center text-xs font-semibold
          ${player 
            ? 'bg-white dark:bg-gray-800 border-white dark:border-gray-600 hover:scale-105 shadow-lg' 
            : 'bg-white/20 border-white/40 hover:bg-white/30 border-dashed'
          }
          ${isCaptain ? 'ring-4 ring-yellow-400' : ''}
          ${isViceCaptain ? 'ring-4 ring-blue-400' : ''}
        `}
      >
        {player ? (
          <>
            <div className="text-[10px] text-gray-600 dark:text-gray-300">
              {player.name.split(' ').pop()}
            </div>
            <div className="text-[8px] text-gray-500">
              {player.realTeam?.shortName}
            </div>
            {isCaptain && <div className="text-yellow-600">©</div>}
            {isViceCaptain && <div className="text-blue-600">V</div>}
          </>
        ) : (
          <div className="text-white/60 text-xl">+</div>
        )}
      </div>
      {label && (
        <div className="text-xs mt-1 text-gray-600 dark:text-gray-400">
          {label}
        </div>
      )}
      {!label && (
        <div className="text-xs mt-1 text-white/80">
          {position}
        </div>
      )}
    </div>
  )
} 