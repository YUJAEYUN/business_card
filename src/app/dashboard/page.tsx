'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Database } from '@/lib/supabase'
import BusinessCardItem from '@/components/Dashboard/BusinessCardItem'
import WalletCardItem from '@/components/Wallet/WalletCardItem'
import WalletFilters from '@/components/Wallet/WalletFilters'
import { useTranslation } from '@/hooks/useTranslation'
import Header from '@/components/layout/Header'


type BusinessCard = Database['public']['Tables']['business_cards']['Row']

interface WalletCard {
  id: string
  business_card_id: string
  nickname: string | null
  tags: string[]
  is_favorite: boolean
  notes: string | null
  saved_at: string
  business_card_category_map?: {
    category_id: string
  }[]
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

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'myCards' | 'wallet'>(() => {
    // localStorage에서 마지막 활성 탭 상태 복원
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('dashboardActiveTab') as 'myCards' | 'wallet') || 'myCards'
    }
    return 'myCards'
  })
  const [cards, setCards] = useState<BusinessCard[]>([])
  const [walletCards, setWalletCards] = useState<WalletCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isWalletLoading, setIsWalletLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [walletFilters, setWalletFilters] = useState<WalletFiltersState>({
    search: '',
    tag: '',
    favorite: false,
    sortBy: 'saved_at',
    sortOrder: 'desc'
  })
  const { t } = useTranslation()
  const [categories, setCategories] = useState<any[]>([])
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // 탭 변경 함수 (localStorage에 저장)
  const handleTabChange = (tab: 'myCards' | 'wallet') => {
    setActiveTab(tab)
    localStorage.setItem('dashboardActiveTab', tab)
  }

  // 카테고리별 필터링된 명함 목록
  const [filteredWalletCards, setFilteredWalletCards] = useState<WalletCard[]>([])

  // 카테고리 및 검색 필터링된 명함 가져오기
  useEffect(() => {
    const fetchFilteredCards = async () => {
      let filtered = walletCards

      // 1. 카테고리 필터링
      if (selectedCategory !== 'all') {
        try {
          const categoryFiltered = []
          for (const card of walletCards) {
            try {
              const response = await fetch(`/api/card-categories/map?wallet_item_id=${card.id}`)
              const data = await response.json()
              if (data.categoryIds?.includes(selectedCategory)) {
                categoryFiltered.push(card)
              }
            } catch (error) {
              console.error(`Error checking categories for card ${card.id}:`, error)
            }
          }
          filtered = categoryFiltered
        } catch (error) {
          console.error('Error fetching filtered cards:', error)
          filtered = []
        }
      }

      // 2. 검색 필터링 (닉네임 또는 원본 제목으로 검색)
      if (walletFilters.search.trim()) {
        const searchTerm = walletFilters.search.toLowerCase()
        filtered = filtered.filter(card => {
          const nickname = (card.nickname || '').toLowerCase()
          const title = card.business_cards.title.toLowerCase()
          const ownerName = (card.business_cards.profiles.full_name || '').toLowerCase()

          return nickname.includes(searchTerm) ||
                 title.includes(searchTerm) ||
                 ownerName.includes(searchTerm)
        })
      }

      // 3. 즐겨찾기 필터링
      if (walletFilters.favorite) {
        filtered = filtered.filter(card => card.is_favorite)
      }

      setFilteredWalletCards(filtered)
    }

    fetchFilteredCards()
  }, [selectedCategory, walletCards, walletFilters.search, walletFilters.favorite])



  const fetchBusinessCards = useCallback(async () => {
    if (!user?.email) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/business-cards', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setCards(data || [])
    } catch (error) {
      console.error('Error fetching business cards:', error)
      setError('Failed to load business cards')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const fetchWalletCards = useCallback(async () => {
    if (!user?.email) return

    try {
      setIsWalletLoading(true)

      // 필터 없이 모든 명함 가져오기
      const response = await fetch('/api/wallet', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setWalletCards(data.items || [])
    } catch (error) {
      console.error('Error fetching wallet cards:', error)
      setError(t('failedToLoadWallet'))
    } finally {
      setIsWalletLoading(false)
    }
  }, [user, t])
  useEffect(() => {
    if (user) {
      fetchBusinessCards()
      fetchWalletCards() // 초기 로딩 시에도 명함지갑 데이터 가져오기
    }
  }, [user, fetchBusinessCards, fetchWalletCards])

  useEffect(() => {
    if (user && activeTab === 'wallet') {
      fetchWalletCards()
    }
  }, [user, activeTab, fetchWalletCards])

  // 카테고리 목록 가져오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/card-categories')
        const data = await response.json()
        setCategories(data.categories || [])
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])



  const handleDeleteCard = async (cardId: string) => {
    if (!user?.email) return

    try {
      const response = await fetch('/api/business-cards/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cardId,
          email: user.email
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setCards(prev => prev.filter(card => card.id !== cardId))
    } catch {
      setError(t('failedToDeleteCard'))
    }
  }

  const handleDeleteWalletCard = async (walletItemId: string) => {
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

      setWalletCards(prev => prev.filter(card => card.id !== walletItemId))
    } catch (error) {
      console.error('Error deleting wallet card:', error)
      setError(t('failedToDeleteFromWallet'))
    }
  }

  const handleUpdateWalletCard = async (walletItemId: string, updates: Partial<WalletCard>) => {
    if (!user?.email) return

    try {
      const response = await fetch('/api/wallet', {
        method: 'PUT',
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

      const result = await response.json()
      setWalletCards(prev => prev.map(card =>
        card.id === walletItemId ? result.data : card
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

  // 대시보드 상단에 카테고리 관리 UI 추가
  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto" aria-label="Tabs">
              <button
                onClick={() => handleTabChange('myCards')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors flex-shrink-0 ${activeTab === 'myCards' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-xs sm:text-sm">{t('myCards')}</span>
                  <span className="bg-gray-100 text-gray-600 py-0.5 px-1.5 sm:px-2 rounded-full text-xs">{cards.length}</span>
                </div>
              </button>
              <button
                onClick={() => handleTabChange('wallet')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors flex-shrink-0 ${activeTab === 'wallet' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="text-xs sm:text-sm">{t('cardWallet')}</span>
                  <span className="bg-gray-100 text-gray-600 py-0.5 px-1.5 sm:px-2 rounded-full text-xs">{walletCards.length}</span>
                </div>
              </button>
            </nav>
          </div>
        </div>



        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* 탭 내용 */}
        {activeTab === 'myCards' ? (
          // 내 명함 탭
          <>
            {cards.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="mx-auto w-16 h-16 text-gray-300 mb-6">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t('noCards')}</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
                  {t('noCardsDescription')}
                </p>
                <Link
                  href="/create"
                  className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {t('createFirstCard')}
                </Link>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {cards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <BusinessCardItem
                      card={card}
                      onDelete={() => handleDeleteCard(card.id)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        ) : (
          // 명함지갑 탭
          <>
            {/* 카테고리 관리 UI */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">카테고리</h3>
                <button
                  onClick={() => {
                    setEditingCategory(null)
                    setShowCategoryModal(true)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200"
                >
                  + 추가
                </button>
              </div>

              {/* 카테고리 필터 버튼들 */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                    selectedCategory === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  전체
                </button>
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                        selectedCategory === cat.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                    <button
                      onClick={() => {
                        setEditingCategory(cat)
                        setShowCategoryModal(true)
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('이 카테고리를 삭제하시겠습니까?')) {
                          try {
                            await fetch(`/api/card-categories/${cat.id}`, { method: 'DELETE' })
                            const response = await fetch('/api/card-categories')
                            const data = await response.json()
                            setCategories(data.categories || [])
                            if (selectedCategory === cat.id) {
                              setSelectedCategory('all')
                            }
                          } catch (error) {
                            console.error('Error deleting category:', error)
                          }
                        }
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 명함지갑 필터 */}
            <WalletFilters
              filters={walletFilters}
              onFiltersChange={setWalletFilters}
            />

            {(isWalletLoading || isLoading) ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredWalletCards.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="mx-auto w-16 h-16 text-gray-300 mb-6">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t('noWalletCards')}</h3>
                <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
                  {t('noWalletCardsDescription')}
                </p>
              </motion.div>
            ) : (
              // 토스식 깔끔한 그리드 레이아웃 - 명함 크기에 맞게 조정
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredWalletCards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <WalletCardItem
                      card={card}
                      onDelete={() => handleDeleteWalletCard(card.id)}
                      onUpdate={(updates) => handleUpdateWalletCard(card.id, updates)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* 카테고리 추가/수정 모달 */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                {editingCategory ? '카테고리 수정' : '카테고리 추가'}
              </h3>
              <input
                type="text"
                defaultValue={editingCategory?.name || ''}
                placeholder="카테고리 이름을 입력하세요"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6"
                id="categoryNameInput"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
                >
                  취소
                </button>
                <button
                  onClick={async () => {
                    const input = document.getElementById('categoryNameInput') as HTMLInputElement
                    const name = input.value.trim()
                    if (!name) return

                    try {
                      if (editingCategory) {
                        await fetch(`/api/card-categories/${editingCategory.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ name })
                        })
                      } else {
                        await fetch('/api/card-categories', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ name })
                        })
                      }

                      // 카테고리 목록 새로고침
                      const response = await fetch('/api/card-categories')
                      const data = await response.json()
                      setCategories(data.categories || [])
                      setShowCategoryModal(false)
                    } catch (error) {
                      console.error('Error saving category:', error)
                    }
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200"
                >
                  {editingCategory ? '수정' : '추가'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

      </main>
    </div>
  )
}


