'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import QRCodeGenerator from '@/components/QRCode/QRCodeGenerator'
import { Database } from '@/lib/supabase'
import { useTranslation } from '@/hooks/useTranslation'

type BusinessCard = Database['public']['Tables']['business_cards']['Row']

interface BusinessCardItemProps {
  card: BusinessCard
  onDelete: () => void
}

export default function BusinessCardItem({ card, onDelete }: BusinessCardItemProps) {
  const { t } = useTranslation()
  const [showQRCode, setShowQRCode] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  // [슬러그 관련 상태, useEffect, currentSlug 등 완전 삭제]
  const cardUrl = `${window.location.origin}/card/${card.id}`;

  // 컴포넌트 마운트 시 슬러그 로드
  useEffect(() => {
    const loadCurrentSlug = async () => {
      try {
        const response = await fetch(`/api/slugs/current/${card.id}`)
        if (response.ok) {
          const data = await response.json()
          if (data.slug) {
            // setCurrentSlug(data.slug) // 슬러그 관련 상태 삭제
          }
        }
      } catch (error) {
        console.error('Failed to load current slug:', error)
      }
    }

    loadCurrentSlug()
  }, [card.id])

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(cardUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  const handleDelete = () => {
    setShowDeleteConfirm(false)
    onDelete()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <>
      <motion.div
        className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 relative group border border-gray-100"
        whileHover={{ y: -6, scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        {/* Card Preview - 토스식 깔끔한 레이아웃 */}
        <div className="relative">
          <div className="p-4">
            <div className={`
              relative mx-auto
              ${card.card_type === 'horizontal'
                ? 'w-full aspect-[1.6/1]'
                : 'w-full aspect-[1/1.6]'
              }
            `}>
              <Image
                src={card.front_image_url}
                alt={card.title}
                fill
                className="object-cover rounded-xl"
                onError={(e) => {
                  console.error('Image load error:', card.front_image_url);
                  e.currentTarget.style.display = 'none';
                }}
                sizes="(max-width: 640px) 280px, (max-width: 768px) 320px, (max-width: 1024px) 360px, 400px"
              />
            </div>
          </div>

          {/* Double-sided indicator - 토스식 배지 */}
          {card.back_image_url && (
            <div className="absolute top-6 right-6">
              <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-blue-600 text-white shadow-sm">
                양면
              </span>
            </div>
          )}
        </div>

        {/* Card Info - 토스식 깔끔한 정보 표시 */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
            {card.title}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {formatDate(card.created_at)} 생성
          </p>

          {/* Action Buttons - 토스식 버튼 디자인 */}
          <div className="space-y-3">
            <Link
              href={`/my-card/${card.id}`}
              className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all duration-200"
            >
              {t('manage')}
            </Link>

            <div className="flex space-x-2">
              <button
                onClick={handleCopyUrl}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  copySuccess
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {copySuccess ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    복사됨
                  </span>
                ) : (
                  '링크 복사'
                )}
              </button>
              <button
                onClick={() => setShowQRCode(true)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all duration-200"
              >
                QR 코드
              </button>
            </div>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full bg-red-50 text-red-600 py-3 px-4 rounded-xl text-sm font-semibold hover:bg-red-100 transition-all duration-200"
            >
              삭제
            </button>
          </div>
        </div>
      </motion.div>

      {/* QR Code Modal - 토스식 디자인 */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">QR 코드</h3>
              <button
                onClick={() => setShowQRCode(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <QRCodeGenerator
              url={cardUrl}
              title={card.title}
            />
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal - 토스식 디자인 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
          >
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                명함을 삭제하시겠어요?
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                &quot;{card.title}&quot; 명함이 영구적으로 삭제되며<br />
                복구할 수 없어요.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-red-700 transition-all duration-200"
              >
                삭제
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}
