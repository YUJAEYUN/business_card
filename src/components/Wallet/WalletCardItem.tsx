'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from '@/hooks/useTranslation'

interface WalletCard {
  id: string
  business_card_id: string
  nickname: string | null
  tags: string[]
  is_favorite: boolean
  notes: string | null
  saved_at: string
  business_cards: {
    id: string
    title: string
    front_image_url: string
    back_image_url: string | null
    card_type: 'horizontal' | 'vertical'
    custom_slug: string | null
    view_count: number
    created_at: string
    profiles: {
      full_name: string | null
      email: string
    }
    business_card_ocr_data?: {
      id: string
      extracted_text: string | null
      confidence_score: number | null
      language_detected: string | null
      raw_data: any
    }[]
  }
}

interface WalletCardItemProps {
  card: WalletCard
  onDelete: () => void
  onUpdate: (updates: Partial<WalletCard>) => void
}

export default function WalletCardItem({ card, onDelete, onUpdate }: WalletCardItemProps) {
  const { t } = useTranslation()
  const [showActions, setShowActions] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [editNickname, setEditNickname] = useState(card.nickname || card.business_cards.title)
  const [categories, setCategories] = useState<any[]>([]);
  const [assignedCategories, setAssignedCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/card-categories')
      .then(res => res.json())
      .then(data => setCategories(data.categories || []));
    fetch(`/api/card-categories/map?wallet_item_id=${card.id}`)
      .then(res => res.json())
      .then(data => setAssignedCategories(data.categoryIds || []));
  }, [card.id]);

  const handleCategoryToggle = async (categoryId: string, checked: boolean) => {
    if (checked) {
      await fetch('/api/card-categories/map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_item_id: card.id, category_id: categoryId })
      });
      setAssignedCategories(prev => [...prev, categoryId]);
    } else {
      await fetch('/api/card-categories/map', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_item_id: card.id, category_id: categoryId })
      });
      setAssignedCategories(prev => prev.filter(id => id !== categoryId));
    }
  };

  // 카드 URL 생성 (슬러그가 있으면 슬러그 URL, 없으면 기본 URL)
  const cardUrl = card.business_cards.custom_slug
    ? `${window.location.origin}/${card.business_cards.custom_slug}`
    : `${window.location.origin}/card/${card.business_cards.id}`

  const handleFavoriteToggle = () => {
    onUpdate({ is_favorite: !card.is_favorite })
  }

  const handleNicknameUpdate = () => {
    if (editNickname.trim() !== (card.nickname || card.business_cards.title)) {
      onUpdate({ nickname: editNickname.trim() })
    }
    setIsEditingNickname(false)
  }

  const handleDownloadVCard = () => {
    // TODO: vCard 다운로드 기능 구현
    console.log('Download vCard for:', card.business_cards.title)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // OCR 데이터에서 연락처 정보가 있는지 확인
  const hasContactInfo = () => {
    const ocrData = card.business_cards.business_card_ocr_data?.[0]?.raw_data
    if (!ocrData) return false

    return !!(ocrData.phone)
  }

  return (
    <>
      <motion.div
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative"
        whileHover={{ y: -2 }}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* 즐겨찾기 버튼 */}
        <button
          onClick={handleFavoriteToggle}
          className={`absolute top-2 right-2 z-10 p-1 rounded-full transition-colors ${
            card.is_favorite 
              ? 'text-yellow-500 hover:text-yellow-600' 
              : 'text-gray-400 hover:text-yellow-500'
          }`}
        >
          <svg className="w-5 h-5" fill={card.is_favorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>

        {/* Card Preview */}
        <Link href={cardUrl} target="_blank" rel="noopener noreferrer">
          <div className="relative">
            <div className={`
              relative mx-auto mt-3 md:mt-4
              ${card.business_cards.card_type === 'horizontal'
                ? 'w-32 h-20 md:w-40 md:h-24'
                : 'w-20 h-32 md:w-24 md:h-40'
              }
            `}>
              <Image
                src={card.business_cards.front_image_url}
                alt={card.nickname || card.business_cards.title}
                fill
                className="object-cover rounded-lg shadow-sm"
                onError={(e) => {
                  console.error('Image load error:', card.business_cards.front_image_url);
                  e.currentTarget.style.display = 'none';
                }}
                sizes="(max-width: 768px) 160px, 200px"
              />
            </div>
            
            {/* Double-sided indicator */}
            {card.business_cards.back_image_url && (
              <div className="absolute bottom-2 left-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  2-sided
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* Card Info */}
        <div className="p-4">
          {/* 닉네임/제목 */}
          <div className="mb-2">
            {isEditingNickname ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                  onBlur={handleNicknameUpdate}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNicknameUpdate()
                    if (e.key === 'Escape') {
                      setEditNickname(card.nickname || card.business_cards.title)
                      setIsEditingNickname(false)
                    }
                  }}
                  className="flex-1 text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            ) : (
              <button
                onClick={() => setIsEditingNickname(true)}
                className="text-left w-full group"
              >
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {card.nickname || card.business_cards.title}
                </h3>
              </button>
            )}
          </div>

          {/* 원본 제목 (닉네임이 다른 경우) */}
          {card.nickname && card.nickname !== card.business_cards.title && (
            <p className="text-xs text-gray-500 mb-2">
              원본: {card.business_cards.title}
            </p>
          )}

          {/* 소유자 정보 */}
          <p className="text-xs text-gray-500 mb-2">
            {t('savedBy')}: {card.business_cards.profiles.full_name || card.business_cards.profiles.email}
          </p>

          {/* 저장일 */}
          <p className="text-xs text-gray-500 mb-3">
            {t('savedAt')}: {formatDate(card.saved_at)}
          </p>

          {/* 태그 */}
          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {card.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 카테고리 할당 UI 추가 */}
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">카테고리 할당</div>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <label key={cat.id} className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={assignedCategories.includes(cat.id)}
                    onChange={e => handleCategoryToggle(cat.id, e.target.checked)}
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>

          {/* 액션 버튼들 */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: showActions ? 1 : 0,
              height: showActions ? 'auto' : 0
            }}
            className="flex flex-col sm:flex-row gap-2 overflow-hidden"
          >
            {hasContactInfo() && (
              <button
                onClick={handleDownloadVCard}
                className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-xs font-medium hover:bg-green-700 transition-colors"
              >
                {t('downloadVCard')}
              </button>
            )}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 text-white px-3 py-2 rounded text-xs font-medium hover:bg-red-700 transition-colors"
            >
              {t('delete')}
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('deleteFromWalletConfirm')}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded font-medium hover:bg-gray-300 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  onDelete()
                  setShowDeleteConfirm(false)
                }}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded font-medium hover:bg-red-700 transition-colors"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
