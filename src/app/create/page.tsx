'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import ImageUpload from '@/components/Upload/ImageUpload'
import FlipCard from '@/components/BusinessCard/FlipCard'
import { uploadBusinessCardImage, compressImage } from '@/lib/storage'
import { useTranslation } from '@/hooks/useTranslation'
import Header from '@/components/layout/Header'
import Link from 'next/link'
import DualOCRProcessor from '@/components/OCR/DualOCRProcessor'
import { BusinessCardData } from '@/lib/ocr/types'
import SlugInput from '@/components/SlugInput/SlugInput'

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
  customSlug?: string
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
  const [isSlugValid, setIsSlugValid] = useState(true)

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

  const startAutoOCR = async () => {
    if (!tempCardId) return;

    // 디버깅: 현재 이미지 상태 확인
    console.log('Starting OCR with images:', {
      frontImage: {
        hasFile: !!cardData.frontImage.file,
        fileName: cardData.frontImage.file?.name,
        hasPreview: !!cardData.frontImage.preview
      },
      backImage: {
        hasFile: !!cardData.backImage.file,
        fileName: cardData.backImage.file?.name,
        hasPreview: !!cardData.backImage.preview
      }
    });

    setCardData(prev => ({ ...prev, showOCR: true }));
  }

  const handleOCRComplete = useCallback((result: BusinessCardData) => {
    setCardData(prev => ({
      ...prev,
      ocrData: result,
      title: result.name || prev.title || 'Business Card'
    }));
  }, []);

  const handleOCRError = useCallback((error: string) => {
    setError(`OCR processing failed: ${error}`);
  }, []);







  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !cardData.frontImage.file || !cardData.title.trim()) {
      setError(t('fillRequiredFields'))
      return
    }

    if (!isSlugValid) {
      setError('Please fix the custom URL before creating the card')
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      // Use existing card ID or generate new one
      const cardId = tempCardId || crypto.randomUUID()

      // Compress and upload front image
      const compressedFrontImage = await compressImage(cardData.frontImage.file)
      const frontImageResult = await uploadBusinessCardImage(
        compressedFrontImage,
        'temp', // 임시 사용자 ID - API에서 실제 사용자 ID로 처리됨
        cardId,
        'front'
      )
      console.log('Front image upload result:', frontImageResult)

      let backImageUrl = null
      if (cardData.backImage.file) {
        const compressedBackImage = await compressImage(cardData.backImage.file)
        const backImageResult = await uploadBusinessCardImage(
          compressedBackImage,
          'temp', // 임시 사용자 ID - API에서 실제 사용자 ID로 처리됨
          cardId,
          'back'
        )
        backImageUrl = backImageResult.url
      }

      // Create business card via API
      const requestData = {
        title: cardData.title.trim(),
        frontImageUrl: frontImageResult.url,
        backImageUrl: backImageUrl,
        cardType: cardData.cardType,
        ocrData: cardData.ocrData,
        customSlug: cardData.customSlug
      };
      console.log('Creating business card with data:', requestData);

      const response = await fetch('/api/business-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create business card')
      }

      const result = await response.json()

      // Redirect to card management view
      router.push(`/my-card/${result.card.id}`)
    } catch (error) {
      console.error('Error creating business card:', error)
      setError(error instanceof Error ? error.message : t('failedToCreateCard'))
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
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 pt-24">
        {/* 페이지 헤더 */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
          </div>
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

              {/* Custom Slug Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('customUrlOptional')}
                </label>
                <SlugInput
                  value={cardData.customSlug || ''}
                  onChange={(slug) => setCardData(prev => ({ ...prev, customSlug: slug }))}
                  onValidationChange={setIsSlugValid}
                  placeholder="your-custom-url"
                  autoGenerate={true}
                  cardTitle={cardData.title}
                />
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
                      onClick={startAutoOCR}
                      disabled={cardData.showOCR}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {cardData.showOCR ? 'Processing...' : '🔍 Extract Information'}
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {cardData.backImage.file
                      ? 'Automatically extract contact information from both sides of your business card.'
                      : 'Automatically extract contact information from your business card image.'
                    }
                  </p>

                  {cardData.showOCR && tempCardId && (
                    <DualOCRProcessor
                      key={`ocr-${tempCardId}`} // 고유한 key로 변경
                      businessCardId={tempCardId}
                      frontImage={{
                        file: cardData.frontImage.file!,
                        url: cardData.frontImage.preview || undefined
                      }}
                      backImage={cardData.backImage.file ? {
                        file: cardData.backImage.file,
                        url: cardData.backImage.preview || undefined
                      } : undefined}
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

              {/* OCR Information Display */}
              {cardData.ocrData && (cardData.ocrData.phone || cardData.ocrData.email || cardData.ocrData.website || cardData.ocrData.company) && (
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      📋 Extracted Information
                    </h3>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                      Auto-detected
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Phone */}
                    {cardData.ocrData.phone && (
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">📞</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-900">Phone</p>
                          <p className="text-green-700">{cardData.ocrData.phone}</p>
                        </div>
                      </div>
                    )}

                    {/* Email */}
                    {cardData.ocrData.email && (
                      <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">📧</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-red-900">Email</p>
                          <p className="text-red-700">{cardData.ocrData.email}</p>
                        </div>
                      </div>
                    )}

                    {/* Website */}
                    {cardData.ocrData.website && (
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">🌐</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900">Website</p>
                          <p className="text-blue-700">{cardData.ocrData.website}</p>
                        </div>
                      </div>
                    )}

                    {/* Company */}
                    {cardData.ocrData.company && (
                      <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">🏢</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-purple-900">Company</p>
                          <p className="text-purple-700">{cardData.ocrData.company}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 mt-4">
                    💡 This information will be available as clickable contact options on your shared card
                  </p>
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
