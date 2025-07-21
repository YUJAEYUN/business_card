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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [editNickname, setEditNickname] = useState(card.nickname || card.business_cards.title)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [assignedCategories, setAssignedCategories] = useState<string[]>([])

  // 카드 URL 생성 (슬러그가 있으면 슬러그 URL, 없으면 기본 URL)
  const cardUrl = card.business_cards.custom_slug
    ? `${window.location.origin}/${card.business_cards.custom_slug}`
    : `${window.location.origin}/card/${card.business_cards.id}`

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault() // Link 클릭 방지
    e.stopPropagation()
    onUpdate({ is_favorite: !card.is_favorite })
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault() // Link 클릭 방지
    e.stopPropagation()
    setShowDeleteConfirm(true)
  }

  const handleNicknameUpdate = () => {
    if (editNickname.trim() !== (card.nickname || card.business_cards.title)) {
      onUpdate({ nickname: editNickname.trim() })
    }
    setIsEditingNickname(false)
  }

  const handleNicknameEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsEditingNickname(true)
  }

  const handleCategoryClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowCategoryModal(true)
  }

  // 카테고리 목록과 할당된 카테고리 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 카테고리 목록 가져오기
        const categoriesResponse = await fetch('/api/card-categories')
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData.categories || [])

        // 할당된 카테고리 가져오기
        const assignedResponse = await fetch(`/api/card-categories/map?wallet_item_id=${card.id}`)
        const assignedData = await assignedResponse.json()
        setAssignedCategories(assignedData.categoryIds || [])
      } catch (error) {
        console.error('Error fetching category data:', error)
      }
    }
    fetchData()
  }, [card.id])

  const handleCategoryToggle = async (categoryId: string, checked: boolean) => {
    try {
      if (checked) {
        await fetch('/api/card-categories/map', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet_item_id: card.id, category_id: categoryId })
        })
        setAssignedCategories(prev => [...prev, categoryId])
      } else {
        await fetch('/api/card-categories/map', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet_item_id: card.id, category_id: categoryId })
        })
        setAssignedCategories(prev => prev.filter(id => id !== categoryId))
      }


    } catch (error) {
      console.error('Error updating category assignment:', error)
    }
  }

  return (
    <>
      <motion.div
        className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 relative group border border-gray-100"
        whileHover={{ y: -6, scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        {/* 즐겨찾기 버튼 - 토스식 미니멀 디자인 */}
        <button
          onClick={handleFavoriteToggle}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-300 ${
            card.is_favorite
              ? 'text-yellow-500 hover:text-yellow-600 bg-white shadow-md'
              : 'text-gray-300 hover:text-yellow-500 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 shadow-sm'
          }`}
        >
          <svg className="w-4 h-4" fill={card.is_favorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>

        {/* 삭제 버튼 - 토스식 미니멀 디자인 */}
        <button
          onClick={handleDeleteClick}
          className="absolute top-3 left-3 z-10 p-2 rounded-full transition-all duration-300 text-gray-300 hover:text-red-500 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        {/* 카테고리 버튼 */}
        <button
          onClick={handleCategoryClick}
          className="absolute bottom-3 left-3 z-10 p-2 rounded-full transition-all duration-300 text-gray-300 hover:text-blue-500 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </button>

        {/* Card Preview - 크기 확대 */}
        <Link href={cardUrl} target="_blank" rel="noopener noreferrer" className="block">
          <div className="p-4">
            <div className={`
              relative mx-auto mb-3
              ${card.business_cards.card_type === 'horizontal'
                ? 'w-full aspect-[1.6/1] max-w-64'
                : 'w-full aspect-[1/1.6] max-w-40'
              }
            `}>
              <Image
                src={card.business_cards.front_image_url}
                alt={card.nickname || card.business_cards.title}
                fill
                className="object-cover rounded-xl"
                onError={(e) => {
                  console.error('Image load error:', card.business_cards.front_image_url);
                  e.currentTarget.style.display = 'none';
                }}
                sizes="(max-width: 640px) 200px, (max-width: 768px) 240px, (max-width: 1024px) 280px, 320px"
              />

              {/* Double-sided indicator - 토스식 배지 */}
              {card.business_cards.back_image_url && (
                <div className="absolute bottom-2 right-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-blue-600 text-white shadow-sm">
                    양면
                  </span>
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* 닉네임 편집 영역 */}
        <div className="px-4 pb-4">
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
                className="flex-1 text-sm font-medium text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
          ) : (
            <button
              onClick={handleNicknameEdit}
              className="w-full text-left group"
            >
              <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                {card.nickname || card.business_cards.title}
              </p>
              {card.nickname && card.nickname !== card.business_cards.title && (
                <p className="text-xs text-gray-500 mt-1 truncate">
                  원본: {card.business_cards.title}
                </p>
              )}
            </button>
          )}
        </div>

      </motion.div>

      {/* 삭제 확인 모달 - 토스식 디자인 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
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
                삭제된 명함은 복구할 수 없어요.
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
                onClick={() => {
                  onDelete()
                  setShowDeleteConfirm(false)
                }}
                className="flex-1 bg-red-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-red-700 transition-all duration-200"
              >
                삭제
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 카테고리 할당 모달 */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
          >
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                카테고리 설정
              </h3>
              <p className="text-sm text-gray-500">
                이 명함을 분류할 카테고리를 선택하세요
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={assignedCategories.includes(category.id)}
                    onChange={(e) => handleCategoryToggle(category.id, e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-900">{category.name}</span>
                </label>
              ))}
            </div>

            <button
              onClick={() => {
                setShowCategoryModal(false)
                // 카테고리 변경 후 페이지 새로고침
                window.location.reload()
              }}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200"
            >
              완료
            </button>
          </motion.div>
        </div>
      )}
    </>
  )
}
