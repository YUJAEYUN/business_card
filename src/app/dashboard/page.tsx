'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

type BusinessCard = Database['public']['Tables']['business_cards']['Row']

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

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'myCards' | 'wallet'>('myCards')
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
  const [categories, setCategories] = useState<any[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredWalletCards = useMemo(() => {
    return selectedCategory
      ? walletCards.filter(card => card.categoryIds && card.categoryIds.includes(selectedCategory))
      : walletCards.filter(card => !card.categoryIds || card.categoryIds.length === 0);
  }, [walletCards, selectedCategory]);

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
      const params = new URLSearchParams()
      if (walletFilters.search) params.append('search', walletFilters.search)
      if (walletFilters.tag) params.append('tag', walletFilters.tag)
      if (walletFilters.favorite) params.append('favorite', 'true')
      params.append('sortBy', walletFilters.sortBy)
      params.append('sortOrder', walletFilters.sortOrder)

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
      setWalletCards(data.items || [])
    } catch (error) {
      console.error('Error fetching wallet cards:', error)
      setError(t('failedToLoadWallet'))
    } finally {
      setIsWalletLoading(false)
    }
  }, [user, walletFilters, t])
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

  // useEffect에서 항상 카테고리 목록을 fetch
  useEffect(() => {
    const fetchCategories = () => {
      fetch('/api/card-categories')
        .then(res => res.json())
        .then(data => setCategories(data.categories || []));
    };
    fetchCategories();
  }, []);

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
                onClick={() => setActiveTab('myCards')}
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
                onClick={() => setActiveTab('wallet')}
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

        {/* 카테고리 관리 UI는 기존 탭 네비게이션 아래에만 표시, 단 activeTab === 'wallet'일 때만 렌더링 */}
        {activeTab === 'wallet' && (
          <>
            <div className="mb-6 flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-800">카테고리</h2>
              <button
                className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => { setEditingCategory(null); setShowCategoryModal(true); }}
              >
                + 추가
              </button>
              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center bg-gray-100 px-2 py-1 rounded">
                    <span>{cat.name}</span>
                    <button className="ml-1 text-xs text-blue-600" onClick={() => { setEditingCategory(cat); setShowCategoryModal(true); }}>수정</button>
                    <button className="ml-1 text-xs text-red-500" onClick={async () => {
                      await fetch(`/api/card-categories/${cat.id}`, { method: 'DELETE' });
                      // fetchCategories() 호출 필요
                    }}>삭제</button>
                  </div>
                ))}
              </div>
            </div>
            {/* 카테고리(폴더) 리스트에서 '전체' 버튼과 카테고리별 수정/삭제 버튼 제거 */}
            <div className="mb-4 flex gap-2">
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
          </>
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

        {/* 탭 내용 */}
        {activeTab === 'myCards' ? (
          // 내 명함 탭
          <>
            {cards.length === 0 ? (
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noCards')}</h3>
                <p className="text-gray-600 mb-6">
                  {t('noCardsDescription')}
                </p>
                <Link
                  href="/create"
                  className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {t('createFirstCard')}
                </Link>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {cards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
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
            {/* 명함지갑 필터 */}
            <WalletFilters
              filters={walletFilters}
              onFiltersChange={setWalletFilters}
            />

            {(isWalletLoading || isLoading) ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : walletCards.length === 0 ? (
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
              <DndProvider backend={HTML5Backend}>
                {/* 카테고리 박스 클릭 시 해당 카테고리에 할당된 명함만 리스트로 표시 */}
                <div className="flex gap-6">
                  {/* 카테고리(폴더) 리스트 - 드롭 타겟 */}
                  <div className="w-48">
                    <h3 className="font-bold mb-2">카테고리</h3>
                    {categories.map(cat => (
                      <CategoryDropTarget
                        key={cat.id}
                        category={cat}
                        onDropCard={async (walletItemId) => {
                          await fetch('/api/card-categories/map', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ wallet_item_id: walletItemId, category_id: cat.id })
                          });
                          // 카테고리별 명함 리스트 갱신 필요
                        }}
                      />
                    ))}
                  </div>
                  {/* 명함 카드 리스트 - 드래그 소스 */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {filteredWalletCards.map(card => (
                      <DraggableWalletCardItem key={card.id} card={card} onDelete={() => handleDeleteWalletCard(card.id)} onUpdate={(updates) => handleUpdateWalletCard(card.id, updates)} />
                    ))}
                  </div>
                </div>
              </DndProvider>
            )}
          </>
        )}

        {/* 카테고리 추가/수정 모달 UI */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-xs">
              <h3 className="text-lg font-bold mb-4">{editingCategory ? '카테고리 수정' : '카테고리 추가'}</h3>
              <input
                className="w-full border px-2 py-1 rounded mb-4"
                defaultValue={editingCategory?.name || ''}
                placeholder="카테고리 이름"
                id="categoryNameInput"
              />
              <div className="flex gap-2">
                <button
                  className="flex-1 bg-blue-600 text-white py-2 rounded"
                  onClick={async () => {
                    const name = (document.getElementById('categoryNameInput') as HTMLInputElement).value;
                    if (editingCategory) {
                      await fetch(`/api/card-categories/${editingCategory.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name })
                      });
                    } else {
                      await fetch('/api/card-categories', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name })
                      });
                    }
                    setShowCategoryModal(false);
                    // 카테고리 목록 갱신
                    fetch('/api/card-categories')
                      .then(res => res.json())
                      .then(data => setCategories(data.categories || []));
                  }}
                >
                  저장
                </button>
                <button className="flex-1 bg-gray-200 text-gray-700 py-2 rounded" onClick={() => setShowCategoryModal(false)}>
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

// CategoryDropTarget: 카테고리 드롭 타겟
function CategoryDropTarget({ category, onDropCard }: { category: any, onDropCard: (walletItemId: string) => void }) {
  const [{ isOver }, drop] = useDrop({
    accept: 'WALLET_CARD',
    drop: (item: { id: string }) => onDropCard(item.id),
    collect: monitor => ({ isOver: monitor.isOver() })
  });
  return (
    <div ref={drop} className={`p-3 mb-2 rounded border ${isOver ? 'bg-blue-100 border-blue-400' : 'bg-white border-gray-200'}`}
      style={{ minHeight: 48, cursor: 'pointer' }}>
      <span className="font-medium">{category.name}</span>
    </div>
  );
}

// DraggableWalletCardItem: 명함 카드 드래그 소스
function DraggableWalletCardItem(props: any) {
  const [{ isDragging }, drag] = useDrag({
    type: 'WALLET_CARD',
    item: { id: props.card.id },
    collect: monitor => ({ isDragging: monitor.isDragging() })
  });
  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <WalletCardItem {...props} />
    </div>
  );
}
