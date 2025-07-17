'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from '@/hooks/useTranslation'

interface WalletFiltersState {
  search: string
  tag: string
  favorite: boolean
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

interface WalletFiltersProps {
  filters: WalletFiltersState
  onFiltersChange: (filters: WalletFiltersState) => void
}

export default function WalletFilters({ filters, onFiltersChange }: WalletFiltersProps) {
  const { t } = useTranslation()
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search })
  }

  const handleTagChange = (tag: string) => {
    onFiltersChange({ ...filters, tag })
  }

  const handleFavoriteToggle = () => {
    onFiltersChange({ ...filters, favorite: !filters.favorite })
  }

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    onFiltersChange({ ...filters, sortBy, sortOrder })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      tag: '',
      favorite: false,
      sortBy: 'saved_at',
      sortOrder: 'desc'
    })
  }

  const hasActiveFilters = filters.search || filters.tag || filters.favorite

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* 기본 필터 */}
      <div className="flex flex-col gap-4">
        {/* 검색 */}
        <div className="w-full">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('searchPlaceholder')}
            />
          </div>
        </div>

        {/* 버튼들 */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* 즐겨찾기 필터 */}
          <button
            onClick={handleFavoriteToggle}
            className={`
              inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${filters.favorite
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }
            `}
          >
            <svg className="w-4 h-4 mr-1 sm:mr-2" fill={filters.favorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span className="hidden sm:inline">{filters.favorite ? t('favoriteCards') : t('showFavorites')}</span>
            <span className="sm:hidden">★</span>
          </button>

          {/* 고급 필터 토글 */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <svg className={`w-4 h-4 mr-1 sm:mr-2 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span className="hidden sm:inline">필터</span>
          </button>

          {/* 필터 초기화 */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="hidden sm:inline">초기화</span>
            </button>
          )}
        </div>
      </div>

      {/* 고급 필터 */}
      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 pt-4 border-t border-gray-200"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 태그 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('filterByTag')}
              </label>
              <input
                type="text"
                value={filters.tag}
                onChange={(e) => handleTagChange(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="태그 입력..."
              />
            </div>

            {/* 정렬 기준 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                정렬 기준
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleSortChange(e.target.value, filters.sortOrder)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="saved_at">{t('savedAt')}</option>
                <option value="nickname">{t('nickname')}</option>
                <option value="is_favorite">즐겨찾기</option>
              </select>
            </div>

            {/* 정렬 순서 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                정렬 순서
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleSortChange(filters.sortBy, e.target.value as 'asc' | 'desc')}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="desc">내림차순</option>
                <option value="asc">오름차순</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
