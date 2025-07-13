'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Database } from '@/lib/supabase'
import BusinessCardItem from '@/components/Dashboard/BusinessCardItem'

type BusinessCard = Database['public']['Tables']['business_cards']['Row']

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [cards, setCards] = useState<BusinessCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Fetch user's business cards
  useEffect(() => {
    if (user) {
      fetchBusinessCards()
    }
  }, [user])

  const fetchBusinessCards = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('business_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCards(data || [])
    } catch (error) {
      console.error('Error fetching business cards:', error)
      setError('Failed to load business cards')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCard = async (cardId: string) => {
    try {
      const { error } = await supabase
        .from('business_cards')
        .delete()
        .eq('id', cardId)
        .eq('user_id', user?.id)

      if (error) throw error

      // Remove from local state
      setCards(prev => prev.filter(card => card.id !== cardId))
    } catch (error) {
      console.error('Error deleting business card:', error)
      setError('Failed to delete business card')
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
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
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Business Cards</h1>
              <p className="text-gray-600">Manage your digital business cards</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/create"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Create New Card
              </Link>
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No business cards yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first digital business card to get started
            </p>
            <Link
              href="/create"
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Your First Card
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* Stats */}
        {cards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{cards.length}</div>
                <div className="text-sm text-gray-600">Total Cards</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {cards.filter(card => card.back_image_url).length}
                </div>
                <div className="text-sm text-gray-600">Double-sided Cards</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {cards.filter(card => card.card_type === 'horizontal').length}
                </div>
                <div className="text-sm text-gray-600">Horizontal Cards</div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
