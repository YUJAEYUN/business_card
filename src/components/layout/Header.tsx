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
  const [isScrolled, setIsScrolled] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement>(null)

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' }
  ]

  // 스크롤 감지로 헤더 스타일 변경
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/98 backdrop-blur-xl shadow-lg border-b border-gray-200/50'
            : 'bg-white/95 backdrop-blur-sm border-b border-gray-100'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 로고 - 토스 스타일 */}
            <motion.button
              onClick={handleLogoClick}
              className="flex items-center space-x-3 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="relative"
                whileHover={{ rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-lg"
                />
              </motion.div>
              <span className="text-lg font-bold text-gray-900 hidden sm:block group-hover:text-blue-600 transition-colors duration-200">
                Swivel
              </span>
            </motion.button>

            {/* 페이지 제목 - 토스 스타일 */}
            {user && (
              <motion.div
                className="hidden md:block"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-lg font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text">
                  {pathname === '/dashboard' && t('dashboard')}
                  {pathname === '/wallet' && t('wallet')}
                  {pathname === '/create' && t('createCard')}
                  {pathname === '/' && 'Swivel'}
                </h1>
              </motion.div>
            )}

            {/* 우측 메뉴 - 토스 스타일 */}
            <div className="flex items-center space-x-2">
              {/* 번역 버튼 - 토스 스타일 */}
              <motion.button
                onClick={() => setShowLanguageSheet(true)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-gray-50/80 hover:bg-gray-100/80 transition-all duration-200 border border-gray-200/50 backdrop-blur-sm group"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.span
                  className="text-base"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {languages.find(lang => lang.code === locale)?.flag}
                </motion.span>
                <span className="text-sm font-semibold text-gray-700 hidden sm:block group-hover:text-gray-900 transition-colors">
                  {languages.find(lang => lang.code === locale)?.name}
                </span>
                <motion.svg
                  className="w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ rotate: showLanguageSheet ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </motion.button>

              {/* 계정 관리 버튼 - 토스 스타일 */}
              {user && (
                <div ref={accountMenuRef} className="relative">
                  <motion.button
                    onClick={() => setShowAccountMenu(!showAccountMenu)}
                    className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-blue-50/80 hover:bg-blue-100/80 transition-all duration-200 border border-blue-200/50 backdrop-blur-sm group"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </motion.svg>
                    <span className="text-sm font-semibold text-blue-700 hidden sm:block group-hover:text-blue-800 transition-colors">
                      {t('accountManagement')}
                    </span>
                    <motion.svg
                      className="w-3 h-3 text-blue-500 group-hover:text-blue-600 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      animate={{ rotate: showAccountMenu ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </motion.button>

                  {/* 계정 관리 드롭다운 - 토스 스타일 */}
                  <AnimatePresence>
                    {showAccountMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="absolute right-0 mt-3 w-52 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 z-50 overflow-hidden"
                      >
                        <div className="py-2">
                          <motion.button
                            onClick={handleSignOut}
                            className="w-full text-left px-5 py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50/80 transition-all duration-200 flex items-center space-x-3 group"
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <svg className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>{t('signOut')}</span>
                          </motion.button>
                          <div className="border-t border-gray-100/50 mx-2"></div>
                          <motion.button
                            onClick={handleDeleteAccount}
                            className="w-full text-left px-5 py-3.5 text-sm font-semibold text-red-600 hover:bg-red-50/80 transition-all duration-200 flex items-center space-x-3 group"
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <svg className="w-4 h-4 text-red-500 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>{t('deleteAccount')}</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* 언어 선택 바텀 시트 - 토스 스타일 */}
      <AnimatePresence>
        {showLanguageSheet && (
          <>
            {/* 배경 오버레이 - 토스 스타일 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLanguageSheet(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              transition={{ duration: 0.2 }}
            />

            {/* 바텀 시트 - 토스 스타일 */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 400,
                opacity: { duration: 0.2 }
              }}
              className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl rounded-t-3xl shadow-2xl z-50 max-w-md mx-auto border-t border-gray-200/50"
            >
              <div className="p-6 pb-8">
                {/* 핸들 바 - 토스 스타일 */}
                <motion.div
                  className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-8"
                  whileHover={{ scale: 1.1, backgroundColor: "#9CA3AF" }}
                  transition={{ duration: 0.2 }}
                />

                {/* 제목 - 토스 스타일 */}
                <motion.h3
                  className="text-xl font-bold text-gray-900 mb-6 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {t('selectLanguage')}
                </motion.h3>

                {/* 언어 옵션들 - 토스 스타일 */}
                <div className="space-y-3">
                  {languages.map((language, index) => (
                    <motion.button
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code as 'ko' | 'ja' | 'en')}
                      className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all duration-200 group ${
                        locale === language.code
                          ? 'bg-blue-50/80 border-2 border-blue-200/80 shadow-sm'
                          : 'bg-gray-50/80 hover:bg-gray-100/80 border-2 border-transparent hover:border-gray-200/50'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.span
                        className="text-2xl"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        {language.flag}
                      </motion.span>
                      <span className={`text-lg font-semibold flex-1 text-left transition-colors ${
                        locale === language.code
                          ? 'text-blue-700'
                          : 'text-gray-900 group-hover:text-gray-700'
                      }`}>
                        {language.name}
                      </span>
                      {locale === language.code && (
                        <motion.div
                          className="ml-auto"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>

                {/* 닫기 버튼 - 토스 스타일 */}
                <motion.button
                  onClick={() => setShowLanguageSheet(false)}
                  className="w-full mt-6 py-4 bg-gray-100/80 hover:bg-gray-200/80 rounded-2xl text-gray-700 font-semibold transition-all duration-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t('cancel') || '취소'}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
