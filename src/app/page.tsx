'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import GoogleIdentityLogin from '@/components/auth/GoogleIdentityLogin'
import { useTranslation } from '@/hooks/useTranslation'
import Header from '@/components/layout/Header'
import InAppBrowserWarning from '@/components/auth/InAppBrowserWarning'
import ExampleBusinessCard from '@/components/ExampleCard/ExampleBusinessCard'
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
    <div className="w-full overflow-x-hidden">
      <Header />

      {/* Hero Section with Video Background */}
      <section className="hero-section relative h-screen w-full flex items-center justify-center overflow-hidden">
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
              height: '100vh',
              width: '100vw',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0
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
        <div className="relative z-10 w-full h-full flex items-center justify-center px-4 py-safe"
             style={{ minHeight: '100vh' }}>
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.h1
                className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-black text-white mb-4 md:mb-6 leading-tight"
                style={{
                  textShadow: '2px 2px 12px rgba(0,0,0,0.9), 0 0 30px rgba(0,0,0,0.6)'
                }}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {t('heroTitle')}
                <motion.span
                  className="text-blue-300 block"
                  style={{
                    textShadow: '2px 2px 12px rgba(0,0,0,0.9), 0 0 30px rgba(0,0,0,0.6)'
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  {t('heroSubtitle')}
                </motion.span>
              </motion.h1>

              <motion.div
                className="p-6 mb-8 md:mb-12 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <p className="text-lg md:text-xl text-gray-100 font-semibold leading-relaxed"
                   style={{
                     textShadow: '1px 1px 6px rgba(0,0,0,0.9)'
                   }}>
                  {t('heroDescription')}
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
            {user ? (
              <>
                <Link
                  href="/create"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-colors duration-200 shadow-lg"
                >
                  {t('createYourCard')}
                </Link>

                <Link
                  href="/dashboard"
                  className="bg-white/95 backdrop-blur-sm hover:bg-white text-blue-600 hover:text-blue-700 px-10 py-4 rounded-2xl font-bold text-lg transition-colors duration-200 shadow-lg border border-white/20"
                >
                  {t('viewDashboard')}
                </Link>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                className="w-full max-w-md"
              >
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl">
                  <GoogleIdentityLogin />
                  <motion.p
                    className="text-sm text-white mt-4 text-center font-semibold"
                    style={{
                      textShadow: '2px 2px 6px rgba(0,0,0,0.9)'
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    {t('signInToStart')}
                  </motion.p>
                </div>
              </motion.div>
            )}
          </motion.div>
          </div>
        </div>
      </section>

      {/* 예시 명함 섹션 */}
      <section className="w-full bg-gradient-to-br from-gray-50 to-blue-50 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              {t('clickCardTitle')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('clickCardDesc')}
              <br className="hidden sm:block" />
              {t('clickCardDesc2')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex justify-center relative"
          >
            <div className="w-80 h-48 md:w-96 md:h-60 relative">
              <ExampleBusinessCard className="w-full h-full" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-sm text-gray-500 mb-6">
              {t('clickCardHint')}
            </p>

            {!user && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="#hero"
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                  onClick={(e) => {
                    e.preventDefault()
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  {t('createMyCard')}
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Platform Introduction Section */}
      <section className="w-full bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 py-12 md:py-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-16"
          >
            <motion.h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 md:mb-6 px-2"
              style={{
                textShadow: '2px 2px 12px rgba(0,0,0,0.5)'
              }}
            >
              {t('newEraTitle')}
            </motion.h2>
            <motion.p
              className="text-lg sm:text-xl md:text-2xl text-blue-100 font-semibold mb-6 md:mb-8 px-2"
              style={{
                textShadow: '1px 1px 6px rgba(0,0,0,0.5)'
              }}
            >
              {t('newEraSubtitle')}
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 border border-white/20 shadow-2xl">
              <p className="text-base sm:text-lg md:text-xl text-white leading-relaxed mb-4 md:mb-6"
                 style={{
                   textShadow: '1px 1px 4px rgba(0,0,0,0.3)'
                 }}>
                {t('problemStatement')}
              </p>
              <p className="text-base sm:text-lg md:text-xl text-blue-100 font-semibold leading-relaxed mb-4 md:mb-6"
                 style={{
                   textShadow: '1px 1px 4px rgba(0,0,0,0.3)'
                 }}>
                {t('solutionStatement')}
              </p>
              <p className="text-base sm:text-lg md:text-xl text-white leading-relaxed"
                 style={{
                   textShadow: '1px 1px 4px rgba(0,0,0,0.3)'
                 }}>
                {t('platformDefinition')}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How Swivel Changes Your Business Section */}
      <section className="w-full bg-white py-12 md:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-4 px-2">
              {t('businessChangeTitle')}
            </h2>
          </motion.div>

          {/* AI Creation Feature */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12 md:mb-20"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="order-2 lg:order-1">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
                  {t('aiCreationTitle')}
                </h3>
                <div className="space-y-3 md:space-y-4">
                  <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
                    {t('aiCreationDesc1')}
                  </p>
                  <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
                    {t('aiCreationDesc2')}
                  </p>
                  <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
                    {t('aiCreationDesc3')}
                  </p>
                </div>
              </div>
              <div className="relative order-1 lg:order-2">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-lg">
                  <div className="w-full h-48 md:h-64 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl md:rounded-2xl flex items-center justify-center">
                    <div className="text-center text-white">
                      <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 md:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-base md:text-lg font-semibold">AI + OCR</p>
                      <p className="text-xs md:text-sm opacity-90">자동 정보 추출</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Visual Impact Feature */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12 md:mb-20"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-lg">
                  <div className="w-full h-48 md:h-64 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl md:rounded-2xl flex items-center justify-center">
                    <div className="text-center text-white">
                      <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 md:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <p className="text-base md:text-lg font-semibold">Card Flip</p>
                      <p className="text-xs md:text-sm opacity-90">부드러운 애니메이션</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
                  {t('visualImpactTitle')}
                </h3>
                <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
                  {t('visualImpactDesc')}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Smart Sharing Feature */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12 md:mb-20"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="order-2 lg:order-1">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
                  {t('smartShareTitle')}
                </h3>
                <div className="space-y-3 md:space-y-4">
                  <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
                    {t('smartShareDesc1')}
                  </p>
                  <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
                    {t('smartShareDesc2')}
                  </p>
                  <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
                    {t('smartShareDesc3')}
                  </p>
                </div>
              </div>
              <div className="relative order-1 lg:order-2">
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-lg">
                  <div className="w-full h-48 md:h-64 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl md:rounded-2xl flex items-center justify-center">
                    <div className="text-center text-white">
                      <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 md:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      <p className="text-base md:text-lg font-semibold">Smart Share</p>
                      <p className="text-xs md:text-sm opacity-90">QR + URL</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - 토스 스타일 */}
      <section className="w-full bg-white py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              {t('whyDigitalCard')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('whyDigitalCardDesc')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-200/50"
            >
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{t('easyUpload')}</h3>
              <p className="text-gray-600 text-center leading-relaxed">{t('easyUploadDesc')}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-green-200/50"
            >
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg"
                whileHover={{ scale: 1.1, rotate: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{t('flipAnimation')}</h3>
              <p className="text-gray-600 text-center leading-relaxed">{t('flipAnimationDesc')}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-purple-200/50"
            >
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{t('easySharing')}</h3>
              <p className="text-gray-600 text-center leading-relaxed">{t('easySharingDesc')}</p>
            </motion.div>
          </div>

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

      {/* Digital Wallet Management Section */}
      <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-4 md:mb-6 px-2">
              {t('walletManagementTitle')}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 mx-auto">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 text-center">{t('easyAccess')}</h3>
              <p className="text-sm md:text-base text-gray-600 text-center leading-relaxed">
                {t('walletManagementDesc1')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 mx-auto">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 text-center">{t('autoSave')}</h3>
              <p className="text-sm md:text-base text-gray-600 text-center leading-relaxed">
                {t('walletManagementDesc2')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 mx-auto">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 text-center">{t('realTimeUpdate')}</h3>
              <p className="text-sm md:text-base text-gray-600 text-center leading-relaxed">
                {t('walletManagementDesc3')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 mx-auto">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 text-center">{t('cardRecall')}</h3>
              <p className="text-sm md:text-base text-gray-600 text-center leading-relaxed">
                {t('walletManagementDesc4')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="w-full bg-white py-12 md:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-4 md:mb-6 px-2">
              {t('recommendationTitle')}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {[
              { key: 'recommendation1', icon: '👔', color: 'from-blue-500 to-blue-600' },
              { key: 'recommendation2', icon: '🔄', color: 'from-green-500 to-green-600' },
              { key: 'recommendation3', icon: '🚀', color: 'from-purple-500 to-purple-600' },
              { key: 'recommendation4', icon: '🤝', color: 'from-orange-500 to-orange-600' }
            ].map((item, index) => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className={`w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br ${item.color} rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 mx-auto text-xl md:text-2xl`}>
                  {item.icon}
                </div>
                <p className="text-sm md:text-base text-gray-700 text-center leading-relaxed font-medium">
                  {t(item.key as keyof typeof t)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="w-full bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 py-12 md:py-20 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-6 md:mb-8 px-2"
                style={{
                  textShadow: '2px 2px 12px rgba(0,0,0,0.3)'
                }}>
              {t('upgradeNetworking')}
            </h2>

            {!user && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="max-w-md mx-auto"
              >
                <div className="bg-white/10 backdrop-blur-md rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl">
                  <GoogleIdentityLogin />
                  <p className="text-white mt-3 md:mt-4 text-center font-semibold text-sm md:text-base"
                     style={{
                       textShadow: '1px 1px 4px rgba(0,0,0,0.5)'
                     }}>
                    {t('signInToStart')}
                  </p>
                </div>
              </motion.div>
            )}

            {user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center"
              >
                <Link
                  href="/create"
                  className="w-full sm:w-auto bg-white text-blue-600 hover:text-blue-700 px-8 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  {t('createYourCard')}
                </Link>
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-8 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-lg transition-colors duration-200 shadow-lg border border-white/20"
                >
                  {t('viewDashboard')}
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-white py-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p>&copy; 2025 {t('title')}. {t('footerText')}</p>
          </div>
        </div>
      </footer>

      {/* 인앱 브라우저 경고 모달 */}
      <InAppBrowserWarning />

      {/* 모바일 하단 네비게이션을 위한 여백 */}
      <div className="h-16 md:h-0"></div>
    </div>
  )
}
