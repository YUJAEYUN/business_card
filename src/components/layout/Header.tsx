'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
  const { t, locale, changeLocale } = useTranslation()
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [showLanguageSheet, setShowLanguageSheet] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement>(null)

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' }
  ]

  // 외부 클릭 감지로 계정 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false)
      }
    }

    if (showAccountMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showAccountMenu])

  const handleLanguageChange = (langCode: 'ko' | 'ja' | 'en') => {
    changeLocale(langCode)
    setShowLanguageSheet(false)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
      setShowAccountMenu(false)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleDeleteAccount = async () => {
    if (confirm(t('deleteConfirmMessage'))) {
      // TODO: Implement account deletion
      console.log('Delete account functionality to be implemented')
      setShowAccountMenu(false)
    }
  }

  const handleLogoClick = () => {
    // 홈페이지로 이동하면서 새로고침
    window.location.href = '/'
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 로고 */}
            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-3 hover:opacity-80 transition-all duration-200 active:scale-95"
            >
              <Image
                src="/logo.png"
                alt="Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-lg font-semibold text-gray-900 hidden sm:block">
                Business Card
              </span>
            </button>

            {/* 페이지 제목 (로그인된 사용자에게만 표시) */}
            {user && (
              <div className="hidden md:block">
                <h1 className="text-lg font-semibold text-gray-900">
                  {pathname === '/dashboard' && t('dashboard')}
                  {pathname === '/wallet' && t('wallet')}
                  {pathname === '/create' && t('createCard')}
                  {pathname === '/' && 'Business Card'}
                </h1>
              </div>
            )}

            {/* 우측 메뉴 */}
            <div className="flex items-center space-x-3">
              {/* 번역 버튼 */}
              <button
                onClick={() => setShowLanguageSheet(true)}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 active:scale-95 border border-gray-200"
              >
                <span className="text-base">
                  {languages.find(lang => lang.code === locale)?.flag}
                </span>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {languages.find(lang => lang.code === locale)?.name}
                </span>
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* 계정 관리 버튼 (로그인된 경우에만 표시) */}
              {user && (
                <div ref={accountMenuRef} className="relative">
                  <button
                    onClick={() => setShowAccountMenu(!showAccountMenu)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 active:scale-95 border border-gray-200"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                      {t('accountManagement')}
                    </span>
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* 계정 관리 드롭다운 */}
                  <AnimatePresence>
                    {showAccountMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                      >
                        <div className="py-1">
                          <button
                            onClick={handleSignOut}
                            className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 active:bg-gray-100"
                          >
                            {t('signOut')}
                          </button>
                          <div className="border-t border-gray-100"></div>
                          <button
                            onClick={handleDeleteAccount}
                            className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 active:bg-red-100"
                          >
                            {t('deleteAccount')}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>


      </header>

      {/* 언어 선택 바텀 시트 */}
      <AnimatePresence>
        {showLanguageSheet && (
          <>
            {/* 배경 오버레이 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLanguageSheet(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            
            {/* 바텀 시트 */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 500 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-w-md mx-auto"
            >
              <div className="p-6">
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  {t('selectLanguage')}
                </h3>
                <div className="space-y-2">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code as 'ko' | 'ja' | 'en')}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        locale === language.code
                          ? 'bg-blue-50 border-2 border-blue-200'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <span className="text-2xl">{language.flag}</span>
                      <span className="text-lg font-medium text-gray-900">
                        {language.name}
                      </span>
                      {locale === language.code && (
                        <div className="ml-auto">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
