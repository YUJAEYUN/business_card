'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from '@/hooks/useTranslation'

export default function MobileGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signInWithGoogle, isInAppBrowser } = useAuth()
  const { t } = useTranslation()

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)

      await signInWithGoogle()
    } catch (err: unknown) {
      console.error('Mobile Google Auth Error:', err)
      const errorMessage = err instanceof Error ? err.message : t('loginError')
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full space-y-4">
      <button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        {isLoading ? t('signingIn') : t('signInWithGoogle')}
      </button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
          <p className="text-xs text-red-600 mt-1">
            {t('mobileLoginError')}
          </p>
        </div>
      )}

      <div className="text-center space-y-2">
        <p className="text-xs text-gray-500">
          📱 모바일 최적화된 Google 로그인
        </p>
        {process.env.NODE_ENV === 'development' && (
          <p className="text-xs text-gray-400">
            {isInAppBrowser ? '🔍 인앱 브라우저 감지됨 (서버 리다이렉션 사용)' : '🌐 일반 브라우저 (NextAuth 사용)'}
          </p>
        )}
      </div>
    </div>
  )
}
