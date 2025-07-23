'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { resetTutorialStatus } from '@/lib/tutorial'

export default function TutorialDebug() {
  const { user } = useAuth()
  const [isResetting, setIsResetting] = useState(false)

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const handleResetTutorial = async () => {
    if (!user?.email) return

    setIsResetting(true)
    try {
      await resetTutorialStatus(user.email)
      // 자동으로 페이지 새로고침하여 튜토리얼이 다시 나타나도록 함
      window.location.reload()
    } catch (error) {
      console.error('Error resetting tutorial:', error)
      alert('튜토리얼 리셋에 실패했습니다.')
      setIsResetting(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleResetTutorial}
        disabled={isResetting || !user}
        className="bg-blue-500 hover:bg-red-600 text-white text-xs px-3 py-2 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isResetting ? '리셋 중...' : '사용가이드'}
      </button>
    </div>
  )
}
