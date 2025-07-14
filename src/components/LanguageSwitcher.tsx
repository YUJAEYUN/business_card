'use client'

import { useState, useEffect } from 'react'
import { useTranslation, type Locale } from '@/hooks/useTranslation'
import { motion, AnimatePresence } from 'framer-motion'

const languages = [
  { code: 'ko' as Locale, name: '한국어', flag: '🇰🇷' },
  { code: 'ja' as Locale, name: '日本語', flag: '🇯🇵' },
  { code: 'en' as Locale, name: 'English', flag: '🇺🇸' }
]

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { locale, changeLocale } = useTranslation()

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0]

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLanguageChange = (newLocale: Locale) => {
    changeLocale(newLocale)
    setIsOpen(false)
  }

  // 모바일에서는 바텀 시트 스타일, 데스크톱에서는 드롭다운
  if (isMobile) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors flex items-center space-x-1 min-w-0"
          aria-label="Change language"
        >
          <span className="text-sm">{currentLanguage.flag}</span>
          <span className="text-xs font-medium">
            {currentLanguage.code.toUpperCase()}
          </span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setIsOpen(false)}
              />

              {/* 모바일 바텀 시트 */}
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-80"
              >
                <div className="p-4">
                  <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">언어 선택</h3>

                  <div className="space-y-2">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                          locale === language.code
                            ? 'bg-blue-50 text-blue-600 border-2 border-blue-200'
                            : 'text-gray-700 hover:bg-gray-50 border-2 border-transparent'
                        }`}
                      >
                        <span className="text-2xl">{language.flag}</span>
                        <span className="text-base font-medium flex-1 text-left">{language.name}</span>
                        {locale === language.code && (
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // 데스크톱 드롭다운
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 font-medium"
        aria-label="Change language"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="text-sm font-medium">
          {currentLanguage.code.toUpperCase()}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
            >
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                    locale === language.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  <span className="text-lg">{language.flag}</span>
                  <span className="text-sm font-medium">{language.name}</span>
                  {locale === language.code && (
                    <svg className="w-4 h-4 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
