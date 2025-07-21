'use client'

import { useEffect, useRef, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useAuth } from '@/contexts/AuthContext'
import { detectBrowser } from '@/lib/browser-detection'

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: { access_token: string }) => void
            error_callback?: (error: any) => void
          }) => {
            requestAccessToken: () => void
          }
        }
      }
    }
  }
}

interface GoogleIdentityLoginProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export default function GoogleIdentityLogin({ 
  onSuccess, 
  onError 
}: GoogleIdentityLoginProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const tokenClientRef = useRef<any>(null)
  const { user } = useAuth()

  // Google Identity Services 스크립트 로드
  useEffect(() => {
    if (typeof window === 'undefined' || user) return

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    
    script.onload = () => {
      setIsScriptLoaded(true)
      initializeGoogleAuth()
    }
    
    script.onerror = () => {
      setError('Google 인증 서비스를 로드할 수 없습니다.')
      onError?.('Google 인증 서비스를 로드할 수 없습니다.')
    }

    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [user])

  const initializeGoogleAuth = () => {
    if (!window.google?.accounts?.oauth2) {
      setTimeout(initializeGoogleAuth, 100)
      return
    }

    try {
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        scope: 'openid email profile',
        callback: handleAuthSuccess,
        error_callback: handleAuthError
      })
    } catch (err) {
      console.error('Google Auth 초기화 실패:', err)
      setError('Google 인증 초기화에 실패했습니다.')
      onError?.('Google 인증 초기화에 실패했습니다.')
    }
  }

  const handleAuthSuccess = async (response: { access_token: string }) => {
    try {
      setIsLoading(true)
      setError(null)

      // Google API를 사용해 사용자 정보 가져오기
      const userInfoResponse = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${response.access_token}`
      )
      
      if (!userInfoResponse.ok) {
        throw new Error('사용자 정보를 가져올 수 없습니다.')
      }

      const userInfo = await userInfoResponse.json()
      
      // NextAuth를 통해 로그인 처리
      const result = await signIn('google', {
        redirect: false,
        email: userInfo.email,
        name: userInfo.name,
        image: userInfo.picture
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      onSuccess?.()
    } catch (err) {
      console.error('Google 로그인 처리 실패:', err)
      const errorMessage = err instanceof Error ? err.message : '로그인 처리 중 오류가 발생했습니다.'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthError = (error: any) => {
    console.error('Google Auth 오류:', error)
    const errorMessage = 'Google 인증 중 오류가 발생했습니다.'
    setError(errorMessage)
    onError?.(errorMessage)
    setIsLoading(false)
  }

  const handleLogin = () => {
    if (!tokenClientRef.current) {
      setError('Google 인증이 준비되지 않았습니다.')
      return
    }

    if (isLoading) return

    try {
      setIsLoading(true)
      setError(null)
      tokenClientRef.current.requestAccessToken()
    } catch (err) {
      console.error('로그인 요청 실패:', err)
      setError('로그인 요청에 실패했습니다.')
      setIsLoading(false)
    }
  }

  // 이미 로그인된 경우
  if (user) {
    return null
  }

  const browserInfo = detectBrowser()

  return (
    <div className="w-full">
      <button
        onClick={handleLogin}
        disabled={isLoading || !isScriptLoaded || !tokenClientRef.current}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl font-semibold text-gray-700 hover:scale-105 transform"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {isLoading ? '로그인 중...' : 'Google로 로그인'}
      </button>



      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  )
}
