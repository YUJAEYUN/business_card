'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import WalletCardItem from '@/components/Wallet/WalletCardItem'
import WalletFilters from '@/components/Wallet/WalletFilters'
import { useTranslation } from '@/hooks/useTranslation'
import Header from '@/components/layout/Header'

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

interface WalletFiltersState {
  search: string
  tag: string
  favorite: boolean
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export default function WalletPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [cards, setCards] = useState<WalletCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<WalletFiltersState>({
    search: '',
    tag: '',
    favorite: false,
    sortBy: 'saved_at',
    sortOrder: 'desc'
  })
  const { t } = useTranslation()
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // [useState, allTags, selectedGroup, filteredCards 관련 코드를 컴포넌트 최상단(early return문 위)로 이동]
  const allTags = Array.from(new Set(cards.flatMap(card => card.tags))).filter(Boolean);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const filteredCards = selectedGroup === 'all'
    ? cards
    : cards.filter(card => card.tags.includes(selectedGroup));

  useEffect(() => {
    fetch('/api/card-categories')
      .then(res => res.json())
      .then(data => setCategories(data.categories || []));
  }, []);

  const fetchWalletCards = useCallback(async () => {
    if (!user?.email) return

    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.tag) params.append('tag', filters.tag)
      if (filters.favorite) params.append('favorite', 'true')
      params.append('sortBy', filters.sortBy)
      params.append('sortOrder', filters.sortOrder)

      const response = await fetch(`/api/wallet?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setCards(data.items || [])
    } catch (error) {
      console.error('Error fetching wallet cards:', error)
      setError(t('failedToLoadWallet'))
    } finally {
      setIsLoading(false)
    }
  }, [user, filters, t])

  useEffect(() => {
    if (user) {
      fetchWalletCards()
    }
  }, [user, fetchWalletCards])

  const handleDeleteCard = async (walletItemId: string) => {
    if (!user?.email) return

    try {
      const response = await fetch('/api/wallet', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          wallet_item_id: walletItemId
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setCards(prev => prev.filter(card => card.id !== walletItemId))
    } catch (error) {
      console.error('Error deleting wallet card:', error)
      setError(t('failedToDeleteFromWallet'))
    }
  }

  const handleUpdateCard = async (walletItemId: string, updates: Partial<WalletCard>) => {
    if (!user?.email) return

    try {
      const response = await fetch('/api/wallet', {
        method: 'PUT', // PATCH → PUT
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          wallet_item_id: walletItemId,
          ...updates
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const updatedCard = await response.json()
      setCards(prev => prev.map(card => 
        card.id === walletItemId ? updatedCard : card
      ))
    } catch (error) {
      console.error('Error updating wallet card:', error)
      setError(t('failedToDeleteFromWallet'))
    }
  }

  // Redirect if not authenticated
  if (!loading && !user) {
    router.push('/')
    return null
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('walletTitle')}</h1>
              <p className="text-gray-600 mt-1">{t('walletSubtitle')}</p>
              {user && (
                <p className="text-blue-600 font-medium mt-2">
                  {t('welcome')} {user.name || user.email?.split('@')[0] || 'User'}!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 필터 */}
        <WalletFilters 
          filters={filters}
          onFiltersChange={setFilters}
        />

        {/* WalletFilters 위에 카테고리 탭/버튼 UI 추가 */}
        <div className="mb-4 flex gap-2">
          <button
            className={`px-3 py-1 rounded ${selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setSelectedCategory('all')}
          >
            {t('all')}
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`px-3 py-1 rounded ${selectedCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* [WalletFilters 위에 카테고리 관리 UI(카테고리 목록, 추가/수정/삭제 버튼 및 모달) 자동 추가] */}
        {allTags.length > 0 && (
          <div className="mb-4 flex gap-2">
            <button
              className={`px-3 py-1 rounded ${selectedGroup === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setSelectedGroup('all')}
            >
              {t('all')}
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                className={`px-3 py-1 rounded ${selectedGroup === tag ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                onClick={() => setSelectedGroup(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6"
          >
            {error}
          </motion.div>
        )}

        {filteredCards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="mx-auto w-24 h-24 text-gray-400 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noWalletCards')}</h3>
            <p className="text-gray-600 mb-6">
              {t('noWalletCardsDescription')}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {filteredCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <WalletCardItem
                  card={card}
                  onDelete={() => handleDeleteCard(card.id)}
                  onUpdate={(updates) => handleUpdateCard(card.id, updates)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
