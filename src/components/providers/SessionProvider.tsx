'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { AuthProvider } from '@/contexts/AuthContext'

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <NextAuthSessionProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </NextAuthSessionProvider>
  )
}
