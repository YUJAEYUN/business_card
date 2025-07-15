'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import LoginButton from '@/components/auth/LoginButton'
import { useTranslation } from '@/hooks/useTranslation'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useEffect, useRef } from 'react'
export default function Home() {
  const { user, loading } = useAuth()
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const playVideo = async () => {
      try {
        console.log('Attempting to play video...')
        video.currentTime = 0
        await video.play()
        console.log('✅ Video started playing successfully')

        const fallback = document.querySelector('.video-fallback') as HTMLElement
        if (fallback) {
          fallback.style.display = 'none'
        }
      } catch (error) {
        console.error('❌ Video autoplay failed:', error)
        const fallback = document.querySelector('.video-fallback') as HTMLElement
        if (fallback) {
          fallback.style.display = 'block'
        }
      }
    }

    const handleCanPlay = () => {
      console.log('Video can play')
      playVideo()
    }

    const handleError = () => {
      console.error('Video error occurred')
      video.style.display = 'none'
      const fallback = document.querySelector('.video-fallback') as HTMLElement
      if (fallback) {
        fallback.style.display = 'block'
      }
    }

    // Set up event listeners
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)
    video.addEventListener('loadeddata', playVideo)
    
    if (video.readyState >= 3) {
      playVideo()
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
      video.removeEventListener('loadeddata', playVideo)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (video && !loading) {
      const timer = setTimeout(() => {
        if (video.paused) {
          video.play().catch(console.error)
        }
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [loading])

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return <div>Missing NEXT_PUBLIC_SUPABASE_URL</div>
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <div>Missing NEXT_PUBLIC_SUPABASE_ANON_KEY</div>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 md:py-6">
            <div className="flex items-center flex-1">
              <h1 className="text-base sm:text-lg md:text-2xl font-bold text-gray-900 truncate">{t('title')}</h1>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Video Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            controls={false}
            disablePictureInPicture
            className="w-full h-full object-cover z-0"
            style={{
              minHeight: '100vh',
              minWidth: '100vw'
            }}
            onError={(e) => {
              console.error('Video failed to load:', e)
              e.currentTarget.style.display = 'none'
            }}

          >
            <source src="/landing_video.mp4" type="video/mp4" />
            <source src="/landing_video.webm" type="video/webm" />
            Your browser does not support the video tag.
          </video>
          {/* Fallback Background */}
          <div className="video-fallback absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 z-0" style={{ display: 'none' }}></div>
          {/* Video Overlay - disabled for better video visibility */}
          {/* <div className="absolute inset-0 bg-black bg-opacity-20 z-10"></div> */}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-4 md:mb-6"
                  style={{
                    textShadow: '2px 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)'
                  }}>
                {t('heroTitle')}
                <span className="text-blue-300 block" style={{
                  textShadow: '2px 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)'
                }}>{t('heroSubtitle')}</span>
              </h1>
              <div className="p-6 mb-6 md:mb-8 max-w-3xl mx-auto">
                <p className="text-lg md:text-xl text-white font-semibold"
                   style={{
                     textShadow: '3px 3px 8px rgba(0,0,0,1), 0 0 15px rgba(0,0,0,0.8)'
                   }}>
                  {t('heroDescription')}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
            {user ? (
              <>
                <Link
                  href="/create"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors shadow-lg"
                >
                  {t('createYourCard')}
                </Link>
                <Link
                  href="/dashboard"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors shadow-lg border border-blue-600"
                >
                  {t('viewDashboard')}
                </Link>
              </>
            ) : (
              <div className="w-full max-w-md">
                <LoginButton />
                <p className="text-sm text-white mt-3 text-center font-medium"
                   style={{
                     textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                   }}>
                  {t('signInToStart')}
                </p>
              </div>
            )}
          </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          >
            <div className="bg-gray-50 rounded-lg p-6 shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">{t('easyUpload')}</h3>
              <p className="text-gray-600 text-center">{t('easyUploadDesc')}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">{t('flipAnimation')}</h3>
              <p className="text-gray-600 text-center">{t('flipAnimationDesc')}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">{t('easySharing')}</h3>
              <p className="text-gray-600 text-center">{t('easySharingDesc')}</p>
            </div>
          </motion.div>

          {/* Demo Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white rounded-lg p-8 shadow-lg max-w-md mx-auto"
          >
            <div className="w-64 h-40 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <p className="text-white font-semibold">{t('cardPreview')}</p>
            </div>
            <p className="text-gray-600 text-center">{t('uploadToSee')}</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p>&copy; 2025 {t('title')}. {t('footerText')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
