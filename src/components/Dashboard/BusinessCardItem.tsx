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
  const [currentSlug, setCurrentSlug] = useState<string | null>(null)

  // 슬러그가 있으면 슬러그 URL, 없으면 기본 URL 사용
  const cardUrl = currentSlug
    ? `${window.location.origin}/${currentSlug}`
    : `${window.location.origin}/card/${card.id}`

  // 컴포넌트 마운트 시 슬러그 로드
  useEffect(() => {
    const loadCurrentSlug = async () => {
      try {
        const response = await fetch(`/api/slugs/current/${card.id}`)
        if (response.ok) {
          const data = await response.json()
          if (data.slug) {
            setCurrentSlug(data.slug)
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
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        whileHover={{ y: -2 }}
      >
        {/* Card Preview */}
        <div className="relative">
          <div className={`
            relative mx-auto mt-3 md:mt-4
            ${card.card_type === 'horizontal'
              ? 'w-32 h-20 md:w-40 md:h-24'
              : 'w-20 h-32 md:w-24 md:h-40'
            }
          `}>
            <Image
              src={card.front_image_url}
              alt={card.title}
              fill
              className="object-cover rounded-lg shadow-sm"
              onError={(e) => {
                console.error('Image load error:', card.front_image_url);
                // 에러 시 기본 이미지로 대체하거나 숨김 처리
                e.currentTarget.style.display = 'none';
              }}
              sizes="(max-width: 768px) 160px, 200px"
            />
          </div>
          
          {/* Card Type Badge */}
          <div className="absolute top-2 right-2">
            <span className={`
              inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
              ${card.card_type === 'horizontal' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
              }
            `}>
              {card.card_type}
            </span>
          </div>

          {/* Double-sided indicator */}
          {card.back_image_url && (
            <div className="absolute top-2 left-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                2-sided
              </span>
            </div>
          )}
        </div>

        {/* Card Info */}
        <div className="p-3 md:p-4">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 truncate">
            {card.title}
          </h3>
          <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">
            Created {formatDate(card.created_at)}
          </p>

          {/* Action Buttons */}
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Link
                href={`/my-card/${card.id}`}
                className="flex-1 bg-blue-600 text-white text-center py-2 px-2 md:px-3 rounded-md text-xs md:text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                {t('manage')}
              </Link>
              <button
                onClick={handleCopyUrl}
                className={`flex-1 py-2 px-2 md:px-3 rounded-md text-xs md:text-sm font-medium transition-colors ${
                  copySuccess
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {copySuccess ? (
                  <span className="flex items-center justify-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('copied')}
                  </span>
                ) : (
                  t('copyCardLink')
                )}
              </button>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setShowQRCode(true)}
                className="flex-1 bg-green-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
              >
                {t('qrCode')}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-1 bg-red-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-sm w-full"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('qrCode')}</h3>
              <button
                onClick={() => setShowQRCode(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-sm w-full"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('deleteBusinessCard')}</h3>
            <p className="text-gray-600 mb-6">
              {t('deleteConfirmMessage')} &quot;{card.title}&quot;? {t('deleteConfirmDescription')}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-400 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md font-medium hover:bg-red-700 transition-colors"
              >
                {t('delete')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}
