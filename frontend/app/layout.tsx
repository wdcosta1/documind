// Root layout shared by every page. It wraps the app with providers and the shell chrome.
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ChevronDown, LogIn, Settings, UserCircle2 } from 'lucide-react'
import './globals.css'
import { Providers } from '@/providers/providers'
import Header from '@/components/headers/header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'docuMind',
  description: 'Next.js starter with Tailwind, shadcn-style UI, and Redux Toolkit.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />

            <div className="flex-1">{children}</div>

          </div>
        </Providers>
      </body>
    </html>
  )
}
