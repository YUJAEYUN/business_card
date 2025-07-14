'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession, signIn, signOut as nextAuthSignOut } from 'next-auth/react'
import { Session } from 'next-auth'

interface AuthContextType {
  user: Session['user'] | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(status === 'loading')
  }, [status])

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google OAuth with NextAuth.js')
      await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: true
      })
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await nextAuthSignOut({
        callbackUrl: '/',
        redirect: true
      })
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const value = {
    user: session?.user || null,
    session,
    loading,
    signInWithGoogle,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
