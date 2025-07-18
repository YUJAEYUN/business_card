'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import FlipCard from '@/components/BusinessCard/FlipCard'
import Header from '@/components/layout/Header'
import { Database } from '@/lib/supabase'
import { BusinessCardData } from '@/lib/ocr/types'
import { useAuth } from '@/contexts/AuthContext'

type BusinessCard = Database['public']['Tables']['business_cards']['Row']

interface SharedCardViewerProps {
  card: BusinessCard
  ocrData?: BusinessCardData
}

export default function SharedCardViewer({ card, ocrData }: SharedCardViewerProps) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error' | 'already_saved'>('idle')
  const [saveMessage, setSaveMessage] = useState('')
  const { user } = useAuth()
  const pathname = usePathname()

  // 자동 저장 기능
  useEffect(() => {
    const autoSaveToWallet = async () => {
      // 사용자가 로그인되어 있지 않으면 자동 저장 안함
      if (!user) {
        return
      }

      setSaveStatus('saving')

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
          // 이미 저장된 명함인 경우
          setSaveStatus('already_saved')
          setSaveMessage('이미 지갑에 저장된 명함입니다.')
          
          // 3초 후 메시지 자동 숨김
          setTimeout(() => {
            setSaveStatus('idle')
          }, 3000)
        } else {
          setSaveStatus('error')
          setSaveMessage('명함 저장 중 오류가 발생했습니다.')
          
          // 5초 후 메시지 자동 숨김
          setTimeout(() => {
            setSaveStatus('idle')
          }, 5000)
        }
      } catch (error) {
        console.warn('Failed to auto-save to wallet:', error)
        setSaveStatus('error')
        setSaveMessage('명함 저장 중 오류가 발생했습니다.')
        
        // 5초 후 메시지 자동 숨김
        setTimeout(() => {
          setSaveStatus('idle')
        }, 5000)
      }
    }

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
  }, [card.id, ocrData, user])

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-16 md:pb-0">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{card.title}</h1>
            <p className="text-gray-600">Digital Business Card</p>

          {/* Auto Save Status */}
          {user && saveStatus !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4"
            >
              {saveStatus === 'saving' && (
                <div className="inline-flex items-center px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-lg text-yellow-800 text-sm">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-yellow-600 border-t-transparent rounded-full"></div>
                  명함을 지갑에 저장 중...
                </div>
              )}
              {saveStatus === 'success' && (
                <div className="inline-flex items-center px-4 py-2 bg-green-100 border border-green-300 rounded-lg text-green-800 text-sm">
                  <span className="mr-2">✅</span>
                  {saveMessage}
                </div>
              )}
              {saveStatus === 'already_saved' && (
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg text-blue-800 text-sm">
                  <span className="mr-2">💼</span>
                  {saveMessage}
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="inline-flex items-center px-4 py-2 bg-red-100 border border-red-300 rounded-lg text-red-800 text-sm">
                  <span className="mr-2">❌</span>
                  {saveMessage}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Card Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <FlipCard
            frontImageUrl={card.front_image_url}
            backImageUrl={card.back_image_url || undefined}
            cardType={card.card_type}
            className="shadow-2xl"
            hideIndicator={false}
          />
        </motion.div>

        {/* Contact Information */}
        {ocrData && (ocrData.phone || ocrData.email || ocrData.website) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                📞 Contact Information
              </h3>

              <div className="space-y-3">
                {/* Phone */}
                {ocrData.phone && (
                  <button
                    onClick={() => handleContactClick('phone', ocrData.phone!)}
                    className="w-full flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors group"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">📞</span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-green-900">Phone</p>
                      <p className="text-green-700">{ocrData.phone}</p>
                    </div>
                    <div className="text-green-600 group-hover:text-green-800">
                      →
                    </div>
                  </button>
                )}

                {/* Email */}
                {ocrData.email && (
                  <button
                    onClick={() => handleContactClick('email', ocrData.email!)}
                    className="w-full flex items-center space-x-3 p-3 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors group"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">📧</span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-red-900">Email</p>
                      <p className="text-red-700">{ocrData.email}</p>
                    </div>
                    <div className="text-red-600 group-hover:text-red-800">
                      →
                    </div>
                  </button>
                )}

                {/* Website */}
                {ocrData.website && (
                  <button
                    onClick={() => handleContactClick('website', ocrData.website!)}
                    className="w-full flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors group"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">🌐</span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-blue-900">Website</p>
                      <p className="text-blue-700">{ocrData.website}</p>
                    </div>
                    <div className="text-blue-600 group-hover:text-blue-800">
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
            Powered by Digital Business Cards
          </p>
        </motion.div>
        </div>
      </div>
    </div>
  )
}
