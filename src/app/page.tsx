import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900 dark:to-emerald-900">
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-16 sm:pb-24">
        <div className="text-center mb-12 sm:mb-16">
          <div className="mb-6">
            <span className="inline-block text-5xl sm:text-6xl mb-4">⚽</span>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 sm:mb-6 leading-tight">
              Fantasy Soccer
            </h1>
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Unlimited. Unrestricted. Unbeatable.
            </h2>
          </div>
          
          <p className="text-base sm:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2">
            Break free from budget limits and team restrictions. Build your dream team with any players, 
            from any club, and compete in the most flexible fantasy soccer experience ever created.
          </p>
          
          <div className="flex flex-col gap-3 sm:gap-4 justify-center items-center max-w-sm sm:max-w-none mx-auto">
            <Link href="/team-builder" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-4 text-base sm:text-lg font-semibold shadow-lg transform hover:scale-105 transition-all min-h-[50px] touch-manipulation">
                ⚡ Build Your Team
              </Button>
            </Link>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 border-gray-300 hover:border-gray-400 px-6 sm:px-8 py-4 text-base sm:text-lg min-h-[50px] touch-manipulation">
                📖 Learn How to Play
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 border-green-300 hover:border-green-400 text-green-700 hover:text-green-800 px-6 sm:px-8 py-4 text-base sm:text-lg min-h-[50px] touch-manipulation">
                🏆 View Leagues
              </Button>
            </div>
          </div>
        </div>

        {/* Key Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl text-center transform hover:scale-105 transition-all">
            <div className="text-3xl sm:text-4xl mb-4">💰</div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-800 dark:text-gray-200">No Budget Limits</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Select Messi, Ronaldo, and Mbappé all in one team. No artificial budget constraints holding you back.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl text-center transform hover:scale-105 transition-all">
            <div className="text-3xl sm:text-4xl mb-4">🔄</div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-800 dark:text-gray-200">Live Substitutions</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Make strategic substitutions between match days with your weekly tokens. Adapt as the action unfolds.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl text-center transform hover:scale-105 transition-all">
            <div className="text-3xl sm:text-4xl mb-4">⚡</div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-800 dark:text-gray-200">Real-Time Scoring</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Watch your players light up as they score. Get points within seconds of real match events.
            </p>
          </div>
        </div>

        {/* Game Rules Highlight */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-10 shadow-2xl mb-16 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10 text-gray-800 dark:text-gray-200">
            🏆 How It Works
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Pick 15 Players</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">11 starters + 4 subs from any team, any league</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Choose Captain</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Double points for your captain&apos;s performance</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Earn Points</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Goals, assists, clean sheets, and bonus points</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 dark:bg-orange-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏅</span>
              </div>
              <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Compete</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Join leagues with friends or play publicly</p>
            </div>
          </div>
        </div>

        {/* Leagues Section */}
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-800 dark:text-gray-200">
            🌍 Available Leagues
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg sm:text-xl font-bold mb-2">⚽ Premier League</h3>
              <p className="text-sm sm:text-base text-purple-100">The world&apos;s most exciting league</p>
            </div>
            
            <div className="bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg sm:text-xl font-bold mb-2">🇪🇸 La Liga</h3>
              <p className="text-sm sm:text-base text-red-100">Spanish football excellence</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
              <h3 className="text-lg sm:text-xl font-bold mb-2">🏆 Champions League</h3>
              <p className="text-sm sm:text-base text-blue-100">Europe&apos;s premier competition</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-8 sm:p-12 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Dominate Fantasy Soccer?</h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-green-100">
            Join thousands of players already building their dream teams
          </p>
          
          <div className="flex flex-col gap-3 sm:gap-4 justify-center items-center max-w-sm sm:max-w-none mx-auto">
            <Link href="/team-builder" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100 px-6 sm:px-8 py-4 text-base sm:text-lg font-semibold shadow-lg min-h-[50px] touch-manipulation">
                🚀 Start Your Journey
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-blue-600 px-6 sm:px-8 py-4 text-base sm:text-lg font-semibold min-h-[50px] touch-manipulation">
              📊 View Leaderboards
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
