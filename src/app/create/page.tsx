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
import OCRProcessor from '@/components/OCR/OCRProcessor'
import { BusinessCardData } from '@/lib/ocr/types'

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
  ocrData?: BusinessCardData
  showOCR?: boolean
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
  const [tempCardId, setTempCardId] = useState<string | null>(null)
  const { t } = useTranslation()

  // OCR 기능 활성화 여부 확인
  const isOCREnabled = process.env.NEXT_PUBLIC_ENABLE_OCR === 'true'

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

    // Generate temporary card ID for OCR processing
    if (!tempCardId) {
      setTempCardId(crypto.randomUUID())
    }
  }

  const handleBackImageSelect = (file: File, preview: string) => {
    setCardData(prev => ({
      ...prev,
      backImage: { file, preview }
    }))
  }

  const handleOCRComplete = (ocrData: BusinessCardData) => {
    setCardData(prev => ({
      ...prev,
      ocrData,
      title: ocrData.name || prev.title || 'Business Card'
    }))
  }

  const handleOCRError = (error: string) => {
    console.error('OCR Error:', error)
    setError(`OCR processing failed: ${error}`)
  }

  const toggleOCR = () => {
    setCardData(prev => ({
      ...prev,
      showOCR: !prev.showOCR
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

      // Use existing card ID or generate new one
      const cardId = tempCardId || crypto.randomUUID()

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

              {/* OCR Section */}
              {isOCREnabled && cardData.frontImage.file && (
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Smart Text Recognition
                    </h3>
                    <button
                      type="button"
                      onClick={toggleOCR}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm hover:bg-blue-200 transition-colors"
                    >
                      {cardData.showOCR ? 'Hide OCR' : 'Show OCR'}
                    </button>
                  </div>

                  {cardData.showOCR && tempCardId && (
                    <OCRProcessor
                      businessCardId={tempCardId}
                      imageFile={cardData.frontImage.file}
                      imageUrl={cardData.frontImage.preview || undefined}
                      onComplete={handleOCRComplete}
                      onError={handleOCRError}
                    />
                  )}

                  {cardData.ocrData && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">
                        Extracted Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        {cardData.ocrData.name && (
                          <div>
                            <span className="font-medium text-green-800">Name:</span>
                            <span className="ml-1 text-green-700">{cardData.ocrData.name}</span>
                          </div>
                        )}
                        {cardData.ocrData.title && (
                          <div>
                            <span className="font-medium text-green-800">Title:</span>
                            <span className="ml-1 text-green-700">{cardData.ocrData.title}</span>
                          </div>
                        )}
                        {cardData.ocrData.company && (
                          <div>
                            <span className="font-medium text-green-800">Company:</span>
                            <span className="ml-1 text-green-700">{cardData.ocrData.company}</span>
                          </div>
                        )}
                        {cardData.ocrData.email && (
                          <div>
                            <span className="font-medium text-green-800">Email:</span>
                            <span className="ml-1 text-green-700">{cardData.ocrData.email}</span>
                          </div>
                        )}
                        {cardData.ocrData.phone && (
                          <div>
                            <span className="font-medium text-green-800">Phone:</span>
                            <span className="ml-1 text-green-700">{cardData.ocrData.phone}</span>
                          </div>
                        )}
                        {cardData.ocrData.website && (
                          <div>
                            <span className="font-medium text-green-800">Website:</span>
                            <span className="ml-1 text-green-700">{cardData.ocrData.website}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

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
