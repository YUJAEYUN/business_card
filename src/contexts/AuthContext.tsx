'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react'
import { Session } from 'next-auth'

interface AuthContextType {
  user: Session['user'] | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  isInAppBrowser: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [isInAppBrowser, setIsInAppBrowser] = useState(false)

  useEffect(() => {
    setLoading(status === 'loading')
  }, [status])

  // 인앱 브라우저 감지
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase()
      const inApp = (
        ua.includes('kakaotalk') ||
        ua.includes('instagram') ||
        ua.includes('facebookexternalhit') ||
        ua.includes('line') ||
        ( /iphone|ipad|ipod/.test(ua) && !ua.includes('safari') && !ua.includes('crios') && !ua.includes('fxios') ) ||
        ( /android/.test(ua) && ua.includes('wv') )
      )
      setIsInAppBrowser(inApp)
    }
  }, [])

  const signInWithGoogle = async () => {
    try {
      // 강제로 전체 페이지 리다이렉션 사용 (팝업 완전 차단)
      window.location.href = `/api/auth/signin/google?callbackUrl=${encodeURIComponent('/')}`
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
    isInAppBrowser,
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
