'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import LoginButton from '@/components/auth/LoginButton'
import { useTranslation } from '@/hooks/useTranslation'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function Home() {
  const { user, loading } = useAuth()
  const { t } = useTranslation()

  // 환경 변수 확인
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return <div>Missing NEXT_PUBLIC_SUPABASE_URL</div>
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <div>Missing NEXT_PUBLIC_SUPABASE_ANON_KEY</div>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {t('dashboard')}
                  </Link>
                  <Link
                    href="/create"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    {t('createCard')}
                  </Link>
                </>
              ) : (
                <div className="w-64">
                  <LoginButton />
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {t('heroTitle')}
              <span className="text-blue-600 block">{t('heroSubtitle')}</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t('heroDescription')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            {user ? (
              <>
                <Link
                  href="/create"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors shadow-lg"
                >
                  {t('createYourCard')}
                </Link>
                <Link
                  href="/dashboard"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors shadow-lg border border-blue-600"
                >
                  {t('viewDashboard')}
                </Link>
              </>
            ) : (
              <div className="w-full max-w-md">
                <LoginButton />
                <p className="text-sm text-gray-500 mt-2">{t('signInToStart')}</p>
              </div>
            )}
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          >
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('easyUpload')}</h3>
              <p className="text-gray-600">{t('easyUploadDesc')}</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('flipAnimation')}</h3>
              <p className="text-gray-600">{t('flipAnimationDesc')}</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('easySharing')}</h3>
              <p className="text-gray-600">{t('easySharingDesc')}</p>
            </div>
          </motion.div>

          {/* Demo Card Placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white rounded-lg p-8 shadow-lg max-w-md mx-auto"
          >
            <div className="w-64 h-40 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <p className="text-white font-semibold">{t('cardPreview')}</p>
            </div>
            <p className="text-gray-600">{t('uploadToSee')}</p>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 {t('title')}. {t('footerText')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
