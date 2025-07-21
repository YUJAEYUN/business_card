'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { detectBrowser, getInAppBrowserMessage, BrowserInfo } from '@/lib/browser-detection'
import { useTranslation } from '@/hooks/useTranslation'

interface InAppBrowserWarningProps {
  onClose?: () => void
  showCloseButton?: boolean
}

export default function InAppBrowserWarning({ 
  onClose, 
  showCloseButton = true 
}: InAppBrowserWarningProps) {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const { language } = useTranslation()

  useEffect(() => {
    const info = detectBrowser()
    setBrowserInfo(info)
    setIsVisible(info.isInApp)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  const handleOpenExternal = () => {
    if (browserInfo?.platform === 'kakao') {
      // 카카오톡의 경우 사용자가 수동으로 메뉴를 열도록 안내
      alert('우측 상단 메뉴(⋯)를 눌러 "다른 브라우저에서 열기"를 선택해주세요.')
    } else {
      // 다른 플랫폼의 경우 현재 URL을 클립보드에 복사
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href)
        alert('URL이 복사되었습니다. 외부 브라우저에 붙여넣어 주세요.')
      }
    }
  }

  if (!browserInfo?.isInApp || !isVisible) {
    return null
  }

  const message = getInAppBrowserMessage(browserInfo.platform, language as 'ko' | 'en' | 'ja')

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black p-4 shadow-lg"
      >
        <div className="max-w-4xl mx-auto flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="flex-shrink-0 mt-1">
              <svg 
                className="w-5 h-5 text-yellow-800" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium whitespace-pre-line">
                {message}
              </p>
              {browserInfo.platform === 'kakao' && (
                <button
                  onClick={handleOpenExternal}
                  className="mt-2 text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors"
                >
                  도움말 보기
                </button>
              )}
            </div>
          </div>
          {showCloseButton && (
            <button
              onClick={handleClose}
              className="flex-shrink-0 ml-4 text-yellow-800 hover:text-yellow-900 transition-colors"
              aria-label="닫기"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path 
                  fillRule="evenodd" 
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
