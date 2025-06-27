'use client';

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n'

export default function Home() {
  const { t } = useTranslation();
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900 dark:to-emerald-900">
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-16 sm:pb-24">
        <div className="text-center mb-12 sm:mb-16">
          <div className="mb-6">
            <span className="inline-block text-5xl sm:text-6xl mb-4">⚽</span>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 sm:mb-6 leading-tight">
              {t('home.title')}
            </h1>
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              {t('home.subtitle')}
            </h2>
          </div>
          
          <p className="text-base sm:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2">
            {t('home.description')}
          </p>
          
          <div className="flex flex-col gap-3 sm:gap-4 justify-center items-center max-w-sm sm:max-w-none mx-auto">
            <Link href="/rooms/create" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 sm:px-8 py-4 text-base sm:text-lg font-semibold shadow-lg transform hover:scale-105 transition-all min-h-[50px] touch-manipulation">
                {t('home.createRoomAndInvite')}
              </Button>
            </Link>
            <Link href="/rooms" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 border-green-300 hover:border-green-400 text-green-700 hover:text-green-800 px-6 sm:px-8 py-4 text-base sm:text-lg min-h-[50px] touch-manipulation">
                {t('home.viewMyRooms')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Key Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl text-center transform hover:scale-105 transition-all">
            <div className="text-3xl sm:text-4xl mb-4">💰</div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-800 dark:text-gray-200">{t('home.features.noBudgetLimits.title')}</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {t('home.features.noBudgetLimits.description')}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl text-center transform hover:scale-105 transition-all">
            <div className="text-3xl sm:text-4xl mb-4">🔄</div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-800 dark:text-gray-200">{t('home.features.liveSubstitutions.title')}</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {t('home.features.liveSubstitutions.description')}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl text-center transform hover:scale-105 transition-all">
            <div className="text-3xl sm:text-4xl mb-4">⚡</div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-800 dark:text-gray-200">{t('home.features.realTimeScoring.title')}</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {t('home.features.realTimeScoring.description')}
            </p>
          </div>
        </div>

        {/* Game Rules Highlight */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-10 shadow-2xl mb-16 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10 text-gray-800 dark:text-gray-200">
            {t('home.howItWorks.title')}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">{t('home.howItWorks.steps.pickPlayers.title')}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('home.howItWorks.steps.pickPlayers.description')}</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">{t('home.howItWorks.steps.chooseCaptain.title')}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('home.howItWorks.steps.chooseCaptain.description')}</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">{t('home.howItWorks.steps.earnPoints.title')}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('home.howItWorks.steps.earnPoints.description')}</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 dark:bg-orange-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏅</span>
              </div>
              <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">{t('home.howItWorks.steps.compete.title')}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('home.howItWorks.steps.compete.description')}</p>
            </div>
          </div>
        </div>

        {/* Leagues Section */}
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-800 dark:text-gray-200">
            {t('home.availableLeagues')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg sm:text-xl font-bold mb-2">{t('home.leagues.premierLeague.title')}</h3>
              <p className="text-sm sm:text-base text-purple-100">{t('home.leagues.premierLeague.description')}</p>
            </div>
            
            <div className="bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg sm:text-xl font-bold mb-2">{t('home.leagues.laLiga.title')}</h3>
              <p className="text-sm sm:text-base text-red-100">{t('home.leagues.laLiga.description')}</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
              <h3 className="text-lg sm:text-xl font-bold mb-2">{t('home.leagues.championsLeague.title')}</h3>
              <p className="text-sm sm:text-base text-blue-100">{t('home.leagues.championsLeague.description')}</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-8 sm:p-12 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">{t('home.cta.title')}</h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-green-100">
            {t('home.cta.description')}
          </p>
          
          <div className="flex flex-col gap-3 sm:gap-4 justify-center items-center max-w-sm sm:max-w-none mx-auto">
            <Link href="/rooms/create" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100 px-6 sm:px-8 py-4 text-base sm:text-lg font-semibold shadow-lg min-h-[50px] touch-manipulation">
                {t('home.cta.createFirstRoom')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
