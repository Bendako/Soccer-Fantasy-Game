'use client'

import { SignInButton, SignedIn, SignedOut, UserButton, SignOutButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState } from 'react'
import { LanguageSelector } from '@/components/LanguageSelector'
import { useTranslation } from '@/lib/i18n'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40">
      <div className="container mx-auto px-3 xs:px-4 sm:px-6 py-3 sm:py-4">
        {/* Main header row */}
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity touch-manipulation min-h-touch"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm sm:text-base">⚽</span>
            </div>
            <h1 className="text-base xs:text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Fantasy Soccer
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-md hover:bg-gray-100 min-h-touch flex items-center touch-manipulation"
            >
              {t('nav.home')}
            </Link>
            <Link 
              href="/rooms" 
              className="text-blue-600 hover:text-blue-700 transition-colors font-semibold px-3 py-2 rounded-md hover:bg-blue-50 min-h-touch flex items-center touch-manipulation"
            >
              {t('nav.myRooms')}
            </Link>
            <Link 
              href="/rooms/create" 
              className="text-emerald-600 hover:text-emerald-700 transition-colors font-semibold px-3 py-2 rounded-md hover:bg-emerald-50 min-h-touch flex items-center touch-manipulation"
            >
              {t('nav.createRoom')}
            </Link>
            <Link 
              href="/team-builder" 
              className="text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-md hover:bg-gray-100 min-h-touch flex items-center touch-manipulation"
            >
              {t('nav.teamBuilder')}
            </Link>
            <Link 
              href="/admin/seed" 
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm px-3 py-2 rounded-md hover:bg-gray-100 min-h-touch flex items-center touch-manipulation"
            >
              {t('nav.admin')}
            </Link>
          </nav>

          {/* Right side - Language + Auth + Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>
            
            {/* Auth Section */}
            <div className="flex items-center gap-2 sm:gap-3">
              <SignedOut>
                <SignInButton>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="min-h-touch min-w-touch touch-manipulation text-xs xs:text-sm px-2 xs:px-3 sm:px-4"
                  >
                    <span className="hidden xs:inline">{t('auth.signIn')}</span>
                    <span className="xs:hidden">{t('auth.signInShort')}</span>
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-1 xs:gap-2 sm:gap-3">
                  <span className="text-xs sm:text-sm text-gray-600 hidden md:block">{t('common.welcome')}!</span>
                  <UserButton />
                  <SignOutButton>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="min-h-touch min-w-touch touch-manipulation text-xxs xs:text-xs sm:text-sm px-1 xs:px-2 sm:px-3"
                    >
                                              <span className="hidden xs:inline">{t('auth.signOut')}</span>
                        <span className="xs:hidden">{t('auth.signOutShort')}</span>
                    </Button>
                  </SignOutButton>
                </div>
              </SignedIn>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors min-h-touch min-w-touch touch-manipulation flex items-center justify-center"
              aria-label="Toggle menu"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`
          lg:hidden transition-all duration-300 ease-in-out overflow-hidden
          ${isMobileMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}
        `}>
          <nav className="border-t pt-4 pb-2">
            {/* Mobile Language Selector */}
            <div className="mb-4 flex justify-center">
              <LanguageSelector />
            </div>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
              <Link 
                href="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-600 hover:text-gray-900 transition-colors py-3 px-4 rounded-lg hover:bg-gray-100 touch-manipulation min-h-touch flex items-center font-medium"
              >
                🏠 {t('nav.home')}
              </Link>
              <Link 
                href="/rooms" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-blue-600 hover:text-blue-700 transition-colors py-3 px-4 rounded-lg hover:bg-blue-50 touch-manipulation min-h-touch flex items-center font-semibold"
              >
                🏆 {t('nav.myRooms')}
              </Link>
              <Link 
                href="/rooms/create" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-emerald-600 hover:text-emerald-700 transition-colors py-3 px-4 rounded-lg hover:bg-emerald-50 touch-manipulation min-h-touch flex items-center font-semibold"
              >
                ➕ {t('nav.createRoom')}
              </Link>
              <Link 
                href="/team-builder" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-600 hover:text-gray-900 transition-colors py-3 px-4 rounded-lg hover:bg-gray-100 touch-manipulation min-h-touch flex items-center font-medium"
              >
                ⚡ {t('nav.teamBuilder')}
              </Link>
              <Link 
                href="/admin/seed" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-600 hover:text-gray-900 transition-colors py-3 px-4 rounded-lg hover:bg-gray-100 touch-manipulation min-h-touch flex items-center text-sm font-medium xs:col-span-2"
              >
                🔧 {t('nav.admin')}
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
