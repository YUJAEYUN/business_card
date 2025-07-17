'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/hooks/useTranslation'
import ImageUpload from '@/components/Upload/ImageUpload'
import FlipCard from '@/components/BusinessCard/FlipCard'
import { uploadBusinessCardImage, compressImage } from '@/lib/storage'
import { BusinessCardData } from '@/lib/ocr/types'



interface UpdateCardModalProps {
  isOpen: boolean
  onClose: () => void
  card: {
    id: string
    title: string
    front_image_url: string
    back_image_url: string | null
    card_type: 'horizontal' | 'vertical'
  }
  onUpdate: (updatedCard: any) => void
}

interface ImageData {
  file: File | null
  preview: string
  url?: string
}

export default function UpdateCardModal({ 
  isOpen, 
  onClose, 
  card, 
  onUpdate 
}: UpdateCardModalProps) {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState(card.title)
  const [cardType, setCardType] = useState<'horizontal' | 'vertical'>(card.card_type)
  const [changeDescription, setChangeDescription] = useState('')
  const [extractedData, setExtractedData] = useState<BusinessCardData | null>(null)
  const [editableData, setEditableData] = useState<BusinessCardData | null>(null)
  const [isEditingData, setIsEditingData] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const [frontImage, setFrontImage] = useState<ImageData>({
    file: null,
    preview: card.front_image_url,
    url: card.front_image_url
  })
  
  const [backImage, setBackImage] = useState<ImageData>({
    file: null,
    preview: card.back_image_url || '',
    url: card.back_image_url || undefined
  })



  // Reset form when card changes
  useEffect(() => {
    setTitle(card.title)
    setCardType(card.card_type)
    setChangeDescription('')
    setFrontImage({
      file: null,
      preview: card.front_image_url,
      url: card.front_image_url
    })
    setBackImage({
      file: null,
      preview: card.back_image_url || '',
      url: card.back_image_url || undefined
    })
    setExtractedData(null)
    setIsAnalyzing(false)
    setError(null)
  }, [card])

  const handleFrontImageSelect = (file: File, preview: string) => {
    setFrontImage({ file, preview })
    setExtractedData(null) // 새 이미지 선택 시 기존 분석 결과 초기화
  }

  const handleBackImageSelect = (file: File, preview: string) => {
    setBackImage({ file, preview })
  }

  const handleRemoveBackImage = () => {
    setBackImage({ file: null, preview: '', url: undefined })
  }

  const analyzeBusinessCard = async () => {
    if (!frontImage.file && !frontImage.url) {
      setError('No image to analyze')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      let imageUrl = frontImage.url

      // 새로운 이미지가 업로드된 경우 임시로 업로드
      if (frontImage.file) {
        const compressedImage = await compressImage(frontImage.file)
        const uploadResult = await uploadBusinessCardImage(
          compressedImage,
          'temp',
          card.id,
          'front'
        )
        imageUrl = uploadResult.url
      }

      if (!imageUrl) {
        throw new Error('Failed to get image URL for analysis')
      }

      // API 라우트를 통해 서버에서 OpenAI Vision API로 이미지 분석
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze image')
      }

      const analysisResult = await response.json()
      setExtractedData(analysisResult)
      setEditableData({ ...analysisResult }) // 편집 가능한 복사본 생성

      // 추출된 이름으로 제목 자동 업데이트 (기존 제목이 비어있는 경우만)
      if (analysisResult.name && !title.trim()) {
        setTitle(analysisResult.name)
      }

    } catch (error) {
      console.error('Business card analysis failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to analyze business card')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleUpdate = async () => {
    if (!frontImage.file && !frontImage.url) {
      setError('Front image is required')
      return
    }

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      let frontImageUrl = frontImage.url
      let backImageUrl = backImage.url

      // Upload new front image if changed
      if (frontImage.file) {
        const compressedFrontImage = await compressImage(frontImage.file)
        const frontResult = await uploadBusinessCardImage(
          compressedFrontImage,
          'temp',
          card.id,
          'front'
        )
        frontImageUrl = frontResult.url
      }

      // Upload new back image if changed
      if (backImage.file) {
        const compressedBackImage = await compressImage(backImage.file)
        const backResult = await uploadBusinessCardImage(
          compressedBackImage,
          'temp',
          card.id,
          'back'
        )
        backImageUrl = backResult.url
      }

      // Update business card
      const response = await fetch(`/api/business-cards/${card.id}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          frontImageUrl,
          backImageUrl,
          cardType,
          changeDescription: changeDescription.trim() || 'Image updated',
          extractedData: editableData || extractedData // 편집된 데이터 우선 사용
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update business card')
      }

      const result = await response.json()
      onUpdate(result.card)
      onClose()

    } catch (error) {
      console.error('Error updating business card:', error)
      setError(error instanceof Error ? error.message : 'Failed to update business card')
    } finally {
      setIsLoading(false)
    }
  }

  const hasChanges = () => {
    return (
      frontImage.file !== null ||
      backImage.file !== null ||
      title !== card.title ||
      cardType !== card.card_type ||
      changeDescription.trim() !== ''
    )
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {t('updateBusinessCard')}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left side - Form */}
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('cardTitle')}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('enterCardTitle')}
                  />
                </div>

                {/* Card Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('cardType')}
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="horizontal"
                        checked={cardType === 'horizontal'}
                        onChange={(e) => setCardType(e.target.value as 'horizontal' | 'vertical')}
                        className="mr-2"
                      />
                      {t('horizontal')}
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="vertical"
                        checked={cardType === 'vertical'}
                        onChange={(e) => setCardType(e.target.value as 'horizontal' | 'vertical')}
                        className="mr-2"
                      />
                      {t('vertical')}
                    </label>
                  </div>
                </div>

                {/* Change Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('changeDescription')}
                  </label>
                  <textarea
                    value={changeDescription}
                    onChange={(e) => setChangeDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder={t('describeChanges')}
                  />
                </div>

                {/* Image Uploads */}
                <div className="space-y-4">
                  <ImageUpload
                    onImageSelect={handleFrontImageSelect}
                    currentImage={frontImage.preview}
                    label={t('frontImage')}
                  />

                  <div className="relative">
                    <ImageUpload
                      onImageSelect={handleBackImageSelect}
                      currentImage={backImage.preview}
                      label={t('backImage')}
                    />
                    {backImage.preview && (
                      <button
                        onClick={handleRemoveBackImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                {/* AI Image Analysis */}
                {(frontImage.file || frontImage.url) && (
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        AI Image Analysis
                      </h3>
                      <button
                        type="button"
                        onClick={analyzeBusinessCard}
                        disabled={isAnalyzing}
                        className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {isAnalyzing ? 'Analyzing...' : '🤖 Analyze Image'}
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Extract business information from the card image using AI
                    </p>

                    {extractedData && editableData && (
                      <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-purple-800">
                            {t('extractedInformation')}
                          </h4>
                          <button
                            type="button"
                            onClick={() => {
                              if (isEditingData) {
                                // 편집 모드에서 나갈 때 제목도 업데이트
                                if (editableData?.name && !title.trim()) {
                                  setTitle(editableData.name)
                                }
                              }
                              setIsEditingData(!isEditingData)
                            }}
                            className="text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                          >
                            {isEditingData ? 'Save' : 'Edit'}
                          </button>
                        </div>

                        {isEditingData ? (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-purple-700 mb-1">Name</label>
                              <input
                                type="text"
                                value={editableData.name || ''}
                                onChange={(e) => setEditableData({...editableData, name: e.target.value})}
                                className="w-full px-2 py-1 text-sm border border-purple-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-purple-700 mb-1">Job Title</label>
                              <input
                                type="text"
                                value={editableData.title || ''}
                                onChange={(e) => setEditableData({...editableData, title: e.target.value})}
                                className="w-full px-2 py-1 text-sm border border-purple-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-purple-700 mb-1">Company</label>
                              <input
                                type="text"
                                value={editableData.company || ''}
                                onChange={(e) => setEditableData({...editableData, company: e.target.value})}
                                className="w-full px-2 py-1 text-sm border border-purple-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-purple-700 mb-1">Phone</label>
                              <input
                                type="text"
                                value={editableData.phone || ''}
                                onChange={(e) => setEditableData({...editableData, phone: e.target.value})}
                                className="w-full px-2 py-1 text-sm border border-purple-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-purple-700 mb-1">Email</label>
                              <input
                                type="email"
                                value={editableData.email || ''}
                                onChange={(e) => setEditableData({...editableData, email: e.target.value})}
                                className="w-full px-2 py-1 text-sm border border-purple-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-purple-700 mb-1">Website</label>
                              <input
                                type="url"
                                value={editableData.website || ''}
                                onChange={(e) => setEditableData({...editableData, website: e.target.value})}
                                className="w-full px-2 py-1 text-sm border border-purple-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-purple-700 mb-1">Address</label>
                              <textarea
                                value={editableData.address || ''}
                                onChange={(e) => setEditableData({...editableData, address: e.target.value})}
                                rows={2}
                                className="w-full px-2 py-1 text-sm border border-purple-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-purple-700 space-y-1">
                            {editableData.name && <div><strong>Name:</strong> {editableData.name}</div>}
                            {editableData.title && <div><strong>Job Title:</strong> {editableData.title}</div>}
                            {editableData.company && <div><strong>Company:</strong> {editableData.company}</div>}
                            {editableData.phone && <div><strong>Phone:</strong> {editableData.phone}</div>}
                            {editableData.email && <div><strong>Email:</strong> {editableData.email}</div>}
                            {editableData.website && <div><strong>Website:</strong> {editableData.website}</div>}
                            {editableData.address && <div><strong>Address:</strong> {editableData.address}</div>}
                          </div>
                        )}
                        <p className="text-xs text-purple-600 mt-2">
                          This information will be saved with the updated card for future reference
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right side - Preview */}
              <div className="flex flex-col items-center justify-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {t('preview')}
                </h3>
                <div className="w-full max-w-sm">
                  <FlipCard
                    frontImageUrl={frontImage.preview}
                    backImageUrl={backImage.preview || undefined}
                    cardType={cardType}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleUpdate}
                disabled={isLoading || !hasChanges()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? t('updating') : t('updateCard')}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
