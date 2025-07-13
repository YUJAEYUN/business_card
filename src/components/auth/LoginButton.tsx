'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { detectBrowser, openInExternalBrowser, getBrowserMessage, type BrowserInfo } from '@/utils/browserDetection'

export default function LoginButton() {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo>({
    isInAppBrowser: false,
    browserType: null,
    canUseOAuth: true
  })

  useEffect(() => {
    setBrowserInfo(detectBrowser())
  }, [])

  const handleOpenExternalBrowser = () => {
    openInExternalBrowser()
  }

  if (browserInfo.isInAppBrowser) {
    return (
      <div className="w-full space-y-4">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                인앱 브라우저에서는 로그인이 제한됩니다
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                {getBrowserMessage(browserInfo.browserType)}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenExternalBrowser}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          외부 브라우저에서 열기
        </button>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            또는 Safari, Chrome 등의 브라우저에서 직접 접속해주세요
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <Auth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#3b82f6',
                brandAccent: '#2563eb',
              },
            },
          },
          className: {
            container: 'auth-container',
            button: 'auth-button w-full',
            input: 'auth-input',
          },
        }}
        providers={['google']}
        redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
        onlyThirdPartyProviders
        view="sign_in"
        providerScopes={{
          google: 'openid email profile'
        }}
        // 팝업 대신 리다이렉트 사용 (모바일 호환)
        socialLayout="vertical"
        theme="default"
      />
    </div>
  )
}
