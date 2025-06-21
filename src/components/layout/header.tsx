'use client'

import { SignInButton, SignedIn, SignedOut, UserButton, SignOutButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity touch-manipulation">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">⚽</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Fantasy Soccer
          </h1>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
            Home
          </Link>
          <Link href="/rooms" className="text-blue-600 hover:text-blue-700 transition-colors font-semibold">
            My Rooms
          </Link>
          <Link href="/rooms/create" className="text-emerald-600 hover:text-emerald-700 transition-colors font-semibold">
            Create Room
          </Link>
          <Link href="/team-builder" className="text-gray-600 hover:text-gray-900 transition-colors">
            Team Builder
          </Link>
          <Link href="/leagues" className="text-gray-600 hover:text-gray-900 transition-colors">
            Leagues
          </Link>
          <Link href="/admin/seed" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
            Admin
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <SignedOut>
            <SignInButton>
              <Button variant="outline" className="min-h-[40px] touch-manipulation text-sm px-3 sm:px-4">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-sm text-gray-600 hidden sm:block">Welcome back!</span>
              <UserButton />
              <SignOutButton>
                <Button variant="outline" size="sm" className="min-h-[36px] touch-manipulation text-xs sm:text-sm px-2 sm:px-3">
                  Sign Out
                </Button>
              </SignOutButton>
            </div>
          </SignedIn>
        </div>
      </div>

      <div className="md:hidden border-t px-4 py-3">
        <nav className="flex items-center justify-center space-x-3 sm:space-x-4 text-sm">
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors py-2 px-2 rounded touch-manipulation">
            Home
          </Link>
          <Link href="/rooms" className="text-blue-600 hover:text-blue-700 transition-colors py-2 px-2 rounded touch-manipulation whitespace-nowrap font-semibold">
            My Rooms
          </Link>
          <Link href="/rooms/create" className="text-emerald-600 hover:text-emerald-700 transition-colors py-2 px-2 rounded touch-manipulation whitespace-nowrap font-semibold">
            Create Room
          </Link>
          <Link href="/team-builder" className="text-gray-600 hover:text-gray-900 transition-colors py-2 px-2 rounded touch-manipulation whitespace-nowrap">
            Team Builder
          </Link>
          <Link href="/leagues" className="text-gray-600 hover:text-gray-900 transition-colors py-2 px-2 rounded touch-manipulation">
            Leagues
          </Link>
          <Link href="/admin/seed" className="text-gray-600 hover:text-gray-900 transition-colors py-2 px-2 rounded touch-manipulation">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  )
}
