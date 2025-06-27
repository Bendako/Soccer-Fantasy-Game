import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import ConvexClientProvider from './ConvexClientProvider'
import UserSync from '@/components/UserSync'
import Header from '@/components/layout/header'
import { I18nProvider } from '@/lib/i18n'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fantasy Soccer Game",
  description: "Build your ultimate soccer team without budget constraints. Compete in the most flexible fantasy soccer experience ever created.",
  keywords: ["Fantasy Soccer", "Football", "Sports", "Premier League", "La Liga", "Champions League"],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Fantasy Soccer'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#059669'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#059669" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} overflow-x-hidden`} suppressHydrationWarning>
        <I18nProvider>
          <ClerkProvider>
            <ConvexClientProvider>
              <UserSync />
              <Header />
              <main className="min-h-screen">
                {children}
              </main>
            </ConvexClientProvider>
          </ClerkProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
