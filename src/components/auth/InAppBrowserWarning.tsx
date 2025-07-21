'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { detectBrowser, openInChrome, BrowserInfo } from '@/lib/browser-detection'

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
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const info = detectBrowser()
    setBrowserInfo(info)
    if (info.isInApp) {
      setIsVisible(true)
      // 모달을 약간 지연시켜 자연스럽게 표시
      setTimeout(() => setShowModal(true), 500)
    }
  }, [])

  const handleClose = () => {
    setShowModal(false)
    setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 300)
  }

  const handleOpenExternal = () => {
    try {
      // 크롬 브라우저로 직접 열기 시도
      openInChrome()
    } catch (error) {
      console.error('Failed to open in Chrome:', error)
      // 실패 시 URL 복사로 폴백
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href)
        alert('URL이 복사되었습니다. Chrome 브라우저에 붙여넣어 주세요.')
      }
    }
  }

  const getPlatformIcon = () => {
    switch (browserInfo?.platform) {
      case 'kakao':
        return '💬'
      case 'instagram':
        return '📷'
      case 'facebook':
        return '👥'
      case 'line':
        return '💚'
      case 'naver':
        return '🔍'
      default:
        return '📱'
    }
  }

  const getPlatformName = () => {
    switch (browserInfo?.platform) {
      case 'kakao':
        return '카카오톡'
      case 'instagram':
        return '인스타그램'
      case 'facebook':
        return '페이스북'
      case 'line':
        return '라인'
      case 'naver':
        return '네이버'
      default:
        return '앱'
    }
  }

  if (!browserInfo?.isInApp || !isVisible) {
    return null
  }

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
          >
            {/* 헤더 */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">{getPlatformIcon()}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {getPlatformName()}에서는 로그인이 제한돼요
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                아래 버튼을 눌러 Chrome 브라우저로<br />
                바로 이동해서 로그인하세요
              </p>
            </div>

            {/* 안내 단계 */}
            <div className="bg-blue-50 rounded-2xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Chrome 브라우저로 자동 이동
                  </p>
                  <p className="text-xs text-gray-500">
                    버튼 클릭 시 Chrome이 자동으로 열립니다
                  </p>
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="space-y-3">
              <button
                onClick={handleOpenExternal}
                className="w-full bg-blue-500 text-white py-4 rounded-2xl font-semibold text-base hover:bg-blue-600 transition-colors"
              >
                Chrome으로 열기
              </button>

              {showCloseButton && (
                <button
                  onClick={handleClose}
                  className="w-full bg-gray-100 text-gray-700 py-4 rounded-2xl font-medium text-base hover:bg-gray-200 transition-colors"
                >
                  나중에 하기
                </button>
              )}
            </div>

            {/* 하단 안내 */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400">
                더 안전하고 빠른 로그인을 위한 안내입니다
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
