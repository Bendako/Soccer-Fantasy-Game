import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import ConvexClientProvider from './ConvexClientProvider'
import UserSync from '@/components/UserSync'
import Header from '@/components/layout/header'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fantasy Soccer Game",
  description: "Build your ultimate soccer team without budget constraints. Compete in the most flexible fantasy soccer experience ever created.",
  keywords: ["Fantasy Soccer", "Football", "Sports", "Premier League", "La Liga", "Champions League"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ClerkProvider>
          <ConvexClientProvider>
            <UserSync />
            <Header />
            {children}
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
