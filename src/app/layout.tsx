import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import ConvexClientProvider from './ConvexClientProvider'
import UserSync from '@/components/UserSync'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "soccer-fantasy-game",
  description: "A modern web application built with Next.js, powered by soccer-fantasy-game",
  keywords: ["Next.js", "React", "TypeScript", "Convex", "Clerk", "soccer-fantasy-game"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body className={inter.className}>
        <ConvexClientProvider>
          <UserSync />
          {children}
        </ConvexClientProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}
