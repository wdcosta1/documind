'use client'

// Central location for client-only app providers. Right now this is Redux only.
import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { store } from '@/lib/store'

type ProvidersProps = {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return <Provider store={store}>{children}</Provider>
}
