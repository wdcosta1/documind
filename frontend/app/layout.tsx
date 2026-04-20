// Root layout shared by every page. It wraps the app with providers and the shell chrome.
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ChevronDown, LogIn, Settings, UserCircle2 } from 'lucide-react'
import './globals.css'
import { Providers } from '@/providers/providers'

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
            <header className="sticky top-0 z-40 border-b border-white/60 bg-white/75 backdrop-blur-xl">
              <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-4 py-4 md:px-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-slate-950 px-3 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-white">
                    DocuMind
                  </div>
                </div>

                <details className="group relative">
                  <summary className="flex cursor-pointer list-none items-center gap-3 rounded-full border border-border bg-white/90 px-3 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:border-primary/30 hover:bg-white">
                    <UserCircle2 className="h-5 w-5 text-primary" />
                    <span className="hidden sm:inline">Account</span>
                    <ChevronDown className="h-4 w-4 text-slate-500 transition group-open:rotate-180" />
                  </summary>

                  <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-border bg-white/95 p-2 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.45)] backdrop-blur">
                    <div className="border-b border-border px-3 py-3">
                      <p className="text-sm font-semibold text-slate-950">Guest User</p>
                      <p className="text-xs text-muted-foreground">Sign in to sync chats and documents</p>
                    </div>
                    <button
                      className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-secondary"
                      type="button"
                    >
                      <LogIn className="h-4 w-4 text-primary" />
                      Sign in
                    </button>
                    <button
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-secondary"
                      type="button"
                    >
                      <Settings className="h-4 w-4 text-primary" />
                      Account settings
                    </button>
                  </div>
                </details>
              </div>
            </header>

            <div className="flex-1">{children}</div>

            <footer className="border-t border-white/60 bg-white/65">
              <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-2 px-4 py-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between md:px-6">
                <p className="font-medium text-slate-900">DocuMind</p>
                <p>Document chat workspace for uploads, retrieval, and grounded AI answers.</p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  )
}
