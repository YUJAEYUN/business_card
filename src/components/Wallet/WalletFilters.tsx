'use client'

import { useState, useEffect } from 'react'
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
  const [searchInput, setSearchInput] = useState(filters.search)

  // filters.search가 변경되면 searchInput도 동기화
  useEffect(() => {
    setSearchInput(filters.search)
  }, [filters.search])

  const handleSearchSubmit = () => {
    onFiltersChange({ ...filters, search: searchInput })
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit()
    }
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
    setSearchInput('')
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
    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
      {/* 토스식 깔끔한 필터 */}
      <div className="flex flex-col gap-6">
        {/* 검색 */}
        <div className="w-full">
          <div className="relative flex gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
                placeholder="닉네임이나 이름으로 검색..."
              />
            </div>
            <button
              onClick={handleSearchSubmit}
              className="px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              검색
            </button>
          </div>
        </div>

        {/* 필터 버튼들 */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* 즐겨찾기 필터 */}
          <button
            onClick={handleFavoriteToggle}
            className={`
              inline-flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
              ${filters.favorite
                ? 'bg-yellow-100 text-yellow-800 shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <svg className="w-4 h-4 mr-2" fill={filters.favorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span className="hidden sm:inline">{filters.favorite ? '즐겨찾기' : '즐겨찾기만'}</span>
            <span className="sm:hidden">★</span>
          </button>

          {/* 필터 초기화 */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-3 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="hidden sm:inline">초기화</span>
            </button>
          )}
        </div>
      </div>


    </div>
  )
}
