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
    <ClerkProvider>
    <html lang="en">
      <body className={inter.className}>
        <ConvexClientProvider>
          <UserSync />
          <Header />
          {children}
        </ConvexClientProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}
