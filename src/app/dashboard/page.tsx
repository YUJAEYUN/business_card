'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Database } from '@/lib/supabase'
import BusinessCardItem from '@/components/Dashboard/BusinessCardItem'
import { useTranslation } from '@/hooks/useTranslation'
import Header from '@/components/layout/Header'

type BusinessCard = Database['public']['Tables']['business_cards']['Row']

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [cards, setCards] = useState<BusinessCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t } = useTranslation()

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
  useEffect(() => {
    if (user) {
      fetchBusinessCards()
    }
  }, [user, fetchBusinessCards])

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
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-gray-600 mt-1">{t('subtitle')}</p>
              {user && (
                <p className="text-blue-600 font-medium mt-2">
                  {t('welcome')} {user.name || user.email?.split('@')[0] || 'User'}!
                </p>
              )}
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                href="/create"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>{t('createNewCard')}</span>
              </Link>
            </div>
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


      </main>
    </div>
  )
}
