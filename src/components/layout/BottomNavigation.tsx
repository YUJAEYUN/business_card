'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from '@/hooks/useTranslation'

export default function BottomNavigation() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { t } = useTranslation()

  // 로그인하지 않은 사용자에게는 하단 네비게이션을 표시하지 않음
  if (!user) return null

  const navItems = [
    {
      href: '/',
      label: t('home'),
      icon: (active: boolean) => (
        <svg className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          {active && <path fill="currentColor" d="M9 21h6a2 2 0 002-2v-5h-2v5H9v-5H7v5a2 2 0 002 2zM12 3l7 7v1h-2v-1l-5-5-5 5v1H5v-1l7-7z"/>}
        </svg>
      )
    },
    {
      href: '/dashboard',
      label: t('dashboard'),
      icon: (active: boolean) => (
        <svg className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          {active && <path fill="currentColor" d="M7 3a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 2H7z"/>}
        </svg>
      )
    },
    {
      href: '/wallet',
      label: t('wallet'),
      icon: (active: boolean) => (
        <svg className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          {active && <path fill="currentColor" d="M5 9a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2v-6a2 2 0 00-2-2H5zM7 5a2 2 0 012-2h6a2 2 0 012 2v2H7V5z"/>}
        </svg>
      )
    },
    {
      href: '/create',
      label: t('createCard'),
      icon: (active: boolean) => (
        <svg className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          {active && <circle cx="12" cy="12" r="10" fill="currentColor"/>}
        </svg>
      )
    }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 md:hidden z-40 safe-area-pb">
      <div className="grid grid-cols-4 h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center space-y-0.5 transition-all duration-200 rounded-lg mx-1 my-1
                ${isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:bg-gray-100 active:scale-95'
                }
              `}
              onTouchStart={(e) => {
                e.currentTarget.classList.add('toss-bounce')
              }}
              onTouchEnd={(e) => {
                setTimeout(() => {
                  e.currentTarget.classList.remove('toss-bounce')
                }, 300)
              }}
            >
              <div className="transition-transform duration-200">
                {item.icon(isActive)}
              </div>
              <span className={`text-xs font-medium transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
