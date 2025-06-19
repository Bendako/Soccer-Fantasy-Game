'use client'

import { SignInButton, SignedIn, SignedOut, UserButton, SignOutButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">⚽</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Fantasy Soccer
          </h1>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
            Home
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

        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton>
              <Button variant="outline">Sign In</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden sm:block">Welcome back!</span>
              <UserButton />
              <SignOutButton>
                <Button variant="outline" size="sm" className="ml-2">
                  Sign Out
                </Button>
              </SignOutButton>
            </div>
          </SignedIn>
        </div>
      </div>

      <div className="md:hidden border-t px-4 py-2">
        <nav className="flex items-center justify-center space-x-6 text-sm">
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
            Home
          </Link>
          <Link href="/team-builder" className="text-gray-600 hover:text-gray-900 transition-colors">
            Team Builder
          </Link>
          <Link href="/leagues" className="text-gray-600 hover:text-gray-900 transition-colors">
            Leagues
          </Link>
          <Link href="/admin/seed" className="text-gray-600 hover:text-gray-900 transition-colors">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  )
}
