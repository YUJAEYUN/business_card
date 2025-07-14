'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import ImageUpload from '@/components/Upload/ImageUpload'
import FlipCard from '@/components/BusinessCard/FlipCard'
import { uploadBusinessCardImage, compressImage } from '@/lib/storage'
import { supabase } from '@/lib/supabase'
import { useTranslation } from '@/hooks/useTranslation'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import Link from 'next/link'

interface CardData {
  title: string
  cardType: 'horizontal' | 'vertical'
  frontImage: {
    file: File | null
    preview: string | null
  }
  backImage: {
    file: File | null
    preview: string | null
  }
}

export default function CreatePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [cardData, setCardData] = useState<CardData>({
    title: '',
    cardType: 'horizontal',
    frontImage: { file: null, preview: null },
    backImage: { file: null, preview: null },
  })
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { t } = useTranslation()

  // Redirect if not authenticated
  if (!loading && !user) {
    router.push('/')
    return null
  }

  const handleFrontImageSelect = (file: File, preview: string) => {
    setCardData(prev => ({
      ...prev,
      frontImage: { file, preview }
    }))
  }

  const handleBackImageSelect = (file: File, preview: string) => {
    setCardData(prev => ({
      ...prev,
      backImage: { file, preview }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !cardData.frontImage.file || !cardData.title.trim()) {
      setError(t('fillRequiredFields'))
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      // Get the correct Supabase user ID from profiles table
      let { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', user.email)
        .single()

      if (!profile) {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            email: user.email!,
            full_name: user.name || null,
            avatar_url: user.image || null
          })
          .select('id')
          .single()

        if (createError) {
          throw new Error('Failed to create user profile')
        }
        profile = newProfile
      }

      // Generate card ID
      const cardId = crypto.randomUUID()

      // Compress and upload front image
      const compressedFrontImage = await compressImage(cardData.frontImage.file)
      const frontImageResult = await uploadBusinessCardImage(
        compressedFrontImage,
        profile.id,
        cardId,
        'front'
      )

      let backImageUrl = null
      if (cardData.backImage.file) {
        const compressedBackImage = await compressImage(cardData.backImage.file)
        const backImageResult = await uploadBusinessCardImage(
          compressedBackImage,
          profile.id,
          cardId,
          'back'
        )
        backImageUrl = backImageResult.url
      }

      // Save to database
      const { error: dbError } = await supabase
        .from('business_cards')
        .insert({
          id: cardId,
          user_id: profile.id,
          title: cardData.title.trim(),
          front_image_url: frontImageResult.url,
          back_image_url: backImageUrl,
          card_type: cardData.cardType,
        })
        .select()
        .single()

      if (dbError) throw dbError

      // Redirect to card management view
      router.push(`/my-card/${cardId}`)
    } catch (error) {
      console.error('Error creating business card:', error)
      setError(t('failedToCreateCard'))
    } finally {
      setIsCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 모바일 헤더 */}
      <div className="bg-white shadow-sm md:hidden">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">{t('back')}</span>
            </Link>
            <LanguageSwitcher />
          </div>
          <div className="mt-3">
            <h1 className="text-lg font-bold text-gray-900">{t('title')}</h1>
            <p className="text-sm text-gray-600">{t('subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* 데스크톱 헤더 */}
        <div className="hidden md:block text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 transition-colors">
              ← {t('back')}
            </Link>
            <LanguageSwitcher />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-2 text-gray-600">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Input */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('cardTitle')} *
                </label>
                <input
                  type="text"
                  id="title"
                  value={cardData.title}
                  onChange={(e) => setCardData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={t('cardTitlePlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Card Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('cardType')}
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="horizontal"
                      checked={cardData.cardType === 'horizontal'}
                      onChange={(e) => setCardData(prev => ({ ...prev, cardType: e.target.value as 'horizontal' | 'vertical' }))}
                      className="mr-2"
                    />
                    {t('horizontal')}
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="vertical"
                      checked={cardData.cardType === 'vertical'}
                      onChange={(e) => setCardData(prev => ({ ...prev, cardType: e.target.value as 'horizontal' | 'vertical' }))}
                      className="mr-2"
                    />
                    {t('vertical')}
                  </label>
                </div>
              </div>

              {/* Front Image Upload */}
              <ImageUpload
                onImageSelect={handleFrontImageSelect}
                currentImage={cardData.frontImage.preview || undefined}
                label={`${t('frontImage')} *`}
                className="mb-6"
              />

              {/* Back Image Upload */}
              <ImageUpload
                onImageSelect={handleBackImageSelect}
                currentImage={cardData.backImage.preview || undefined}
                label={`${t('backImage')} (${t('optional')})`}
                className="mb-6"
              />

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isCreating || !cardData.frontImage.file || !cardData.title.trim()}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isCreating ? t('creating') : t('createCard')}
              </motion.button>
            </form>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('preview')}</h2>
            <div className="flex justify-center">
              {cardData.frontImage.preview ? (
                <FlipCard
                  frontImageUrl={cardData.frontImage.preview}
                  backImageUrl={cardData.backImage.preview || undefined}
                  cardType={cardData.cardType}
                />
              ) : (
                <div className={`
                  ${cardData.cardType === 'horizontal' ? 'w-80 h-48' : 'w-48 h-80'}
                  border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center
                `}>
                  <p className="text-gray-500 text-center">
                    {t('uploadFrontImage')}<br />{t('preview').toLowerCase()}
                  </p>
                </div>
              )}
            </div>
            {cardData.title && (
              <div className="mt-4 text-center">
                <h3 className="text-lg font-medium text-gray-900">{cardData.title}</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
