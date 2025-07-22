'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import FlipCard from '@/components/BusinessCard/FlipCard'
import Header from '@/components/layout/Header'
import GoogleIdentityLogin from '@/components/auth/GoogleIdentityLogin'
import InAppBrowserWarning from '@/components/auth/InAppBrowserWarning'
import { Database } from '@/lib/supabase'
import { BusinessCardData } from '@/lib/ocr/types'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from '@/hooks/useTranslation'

type BusinessCard = Database['public']['Tables']['business_cards']['Row']

interface SharedCardViewerProps {
  card: BusinessCard
  ocrData?: BusinessCardData
}

export default function SharedCardViewer({ card, ocrData }: SharedCardViewerProps) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle')
  const [saveMessage, setSaveMessage] = useState('')
  const [hasTriedAutoSave, setHasTriedAutoSave] = useState(false)
  const { user } = useAuth()
  const { t } = useTranslation()
  const pathname = usePathname()

  // 자동 저장 함수
  const autoSaveToWallet = useCallback(async () => {
    // 사용자가 로그인되어 있지 않으면 자동 저장 안함
    if (!user) {
      return
    }

    // 이미 시도했다면 중복 실행 방지
    if (hasTriedAutoSave) {
      return
    }

    setHasTriedAutoSave(true)

    try {
      // 현재 URL이 슬러그 URL인지 확인
      const isSlugUrl = !pathname.startsWith('/card/')
      const shareUrl = isSlugUrl ?
        `${window.location.origin}${pathname}` :
        card.custom_slug ?
          `${window.location.origin}/${card.custom_slug}` :
          `${window.location.origin}/card/${card.id}`

      // 지갑에 자동 저장
      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          business_card_id: card.id,
          nickname: card.title,
          source: 'auto_save', // 자동 저장임을 표시
          share_url: shareUrl // 슬러그 URL 또는 적절한 공유 URL 저장
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setSaveStatus('success')
        setSaveMessage('명함이 자동으로 지갑에 저장되었습니다!')

        // 3초 후 메시지 자동 숨김
        setTimeout(() => {
          setSaveStatus('idle')
        }, 3000)
      } else if (response.status === 400 && result.error === 'Cannot save your own business card to wallet') {
        // 자신의 명함인 경우 - 조용히 처리
        setSaveStatus('idle')
      } else if (response.status === 409 && result.error === 'Business card already saved in wallet') {
        // 이미 저장된 명함인 경우 - 조용히 처리 (알림 없음)
        setSaveStatus('idle')
      } else {
        // 오류 발생 시에도 조용히 처리 (사용자에게 알림 없음)
        setSaveStatus('idle')
      }
    } catch (error) {
      console.warn('Failed to auto-save to wallet:', error)
      // 오류 발생 시에도 조용히 처리 (사용자에게 알림 없음)
      setSaveStatus('idle')
    }
  }, [user, hasTriedAutoSave, pathname, card.custom_slug, card.id, card.title])

  // 페이지 로드 시 실행
  useEffect(() => {

    const trackView = async () => {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            businessCardId: card.id,
            eventType: 'view',
            eventData: {
              source: 'shared_link',
              hasOcrData: !!ocrData
            }
          }),
        })
      } catch (error) {
        console.warn('Failed to track page view:', error)
      }
    }

    trackView()
    autoSaveToWallet()
  }, [card.id, card.custom_slug, card.title, ocrData, user, pathname, autoSaveToWallet])

  // 로그인 상태 변경 감지 - 로그인 후 자동 저장 재시도
  useEffect(() => {
    if (user && !hasTriedAutoSave) {
      // 로그인 후 잠시 대기 후 자동 저장 시도
      const timer = setTimeout(() => {
        autoSaveToWallet()
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [user, hasTriedAutoSave, autoSaveToWallet])

  const handleContactClick = async (type: string, value: string) => {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessCardId: card.id,
          eventType: 'contact_click',
          eventData: {
            contactType: type,
            contactValue: value
          }
        }),
      });
    } catch (error) {
      console.warn('Failed to track contact click:', error);
    }

    if (type === 'phone') {
      const cleanPhone = value.replace(/[^\d+]/g, '');
      window.location.href = `tel:${cleanPhone}`;
    } else if (type === 'email') {
      window.location.href = `mailto:${value}`;
    } else if (type === 'website') {
      const url = value.startsWith('http') ? value : `https://${value}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 pb-16 md:pb-0">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-2xl mx-auto">
          {/* Header - 토스 스타일 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">{card.title}</h1>
            <p className="text-gray-500 font-medium">Swivel</p>

          {/* Auto Save Status - 성공했을 때만 표시 - 토스 스타일 */}
          {user && saveStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6"
            >
              <div className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-green-50 to-green-100 border border-green-200/50 rounded-2xl text-green-800 text-sm font-semibold shadow-lg">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {saveMessage}
              </div>
            </motion.div>
          )}

          {/* 비로그인 사용자 로그인 유도 - 토스 스타일 */}
          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 bg-white/95 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-6 shadow-xl"
            >
              <div className="text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {t('saveToWallet')}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    {t('saveToWalletDesc')}
                  </p>
                </div>
                <div className="max-w-sm mx-auto">
                  <GoogleIdentityLogin />
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Card Display - 토스 스타일 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          className="flex justify-center mb-12"
        >
          <div className="relative">
            <FlipCard
              frontImageUrl={card.front_image_url}
              backImageUrl={card.back_image_url || undefined}
              cardType={card.card_type}
              className=""
              hideIndicator={false}
            />
            {/* 배경 글로우 효과 */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl blur-xl -z-10 scale-110"></div>
          </div>
        </motion.div>

        {/* Contact Information - 토스 스타일 */}
        {ocrData && (ocrData.phone || ocrData.email || ocrData.website) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-sm mx-auto"
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-5 border border-gray-200/50">
              <h3 className="text-base font-bold text-gray-900 mb-4 text-center">
                {t('contactInfo')}
              </h3>

              <div className="space-y-2">
                {/* Phone */}
                {ocrData.phone && (
                  <button
                    onClick={() => handleContactClick('phone', ocrData.phone!)}
                    className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl border border-green-200/50 transition-all duration-200 group"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-semibold text-green-800">{t('phone')}</p>
                      <p className="text-sm text-green-700 font-medium">{ocrData.phone}</p>
                    </div>
                    <div className="text-green-600 group-hover:text-green-700 text-sm">
                      →
                    </div>
                  </button>
                )}

                {/* Email */}
                {ocrData.email && (
                  <button
                    onClick={() => handleContactClick('email', ocrData.email!)}
                    className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl border border-blue-200/50 transition-all duration-200 group"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-semibold text-blue-800">{t('email')}</p>
                      <p className="text-sm text-blue-700 font-medium truncate">{ocrData.email}</p>
                    </div>
                    <div className="text-blue-600 group-hover:text-blue-700 text-sm">
                      →
                    </div>
                  </button>
                )}

                {/* Website */}
                {ocrData.website && (
                  <button
                    onClick={() => handleContactClick('website', ocrData.website!)}
                    className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl border border-purple-200/50 transition-all duration-200 group"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9-9a9 9 0 00-9 9m0 0a9 9 0 019-9" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-semibold text-purple-800">{t('website')}</p>
                      <p className="text-sm text-purple-700 font-medium truncate">{ocrData.website}</p>
                    </div>
                    <div className="text-purple-600 group-hover:text-purple-700 text-sm">
                      →
                    </div>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-gray-500">
            {t('poweredBy')}
          </p>
        </motion.div>
        </div>
      </div>

      {/* 인앱 브라우저 경고 모달 */}
      <InAppBrowserWarning />
    </div>
  )
}
