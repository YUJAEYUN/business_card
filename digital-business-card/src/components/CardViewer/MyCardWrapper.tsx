'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import CardViewer from './CardViewer'
import { Database } from '@/lib/supabase'

type BusinessCard = Database['public']['Tables']['business_cards']['Row']

interface MyCardWrapperProps {
  card: BusinessCard
}

export default function MyCardWrapper({ card }: MyCardWrapperProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User not logged in, redirect to public view
        router.push(`/card/${card.id}`)
        return
      }

      if (card.user_id !== user.id) {
        // User doesn't own this card, redirect to public view
        router.push(`/card/${card.id}`)
        return
      }

      // User owns this card, show the management interface
      setIsChecking(false)
    }
  }, [user, loading, card.user_id, card.id, router])

  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <CardViewer card={card} />
}
