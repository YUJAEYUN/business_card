'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/hooks/useTranslation'
import Image from 'next/image'

interface Version {
  id: string
  version_number: number
  front_image_url: string
  back_image_url: string | null
  card_type: string
  change_description: string | null
  is_current: boolean
  created_at: string
}

interface VersionHistoryProps {
  cardId: string
  isOpen: boolean
  onClose: () => void
}

export default function VersionHistory({ cardId, isOpen, onClose }: VersionHistoryProps) {
  const { t } = useTranslation()
  const [versions, setVersions] = useState<Version[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null)

  useEffect(() => {
    if (isOpen && cardId) {
      fetchVersions()
    }
  }, [isOpen, cardId])

  const fetchVersions = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/business-cards/${cardId}/update`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch versions')
      }

      const data = await response.json()
      setVersions(data.versions)
      
      // Set current version as selected by default
      const currentVersion = data.versions.find((v: Version) => v.is_current)
      if (currentVersion) {
        setSelectedVersion(currentVersion)
      }

    } catch (error) {
      console.error('Error fetching versions:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch versions')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
          className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {t('versionHistory')}
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

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
                {/* Version List */}
                <div className="lg:col-span-1 border-r pr-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {t('versions')} ({versions.length})
                  </h3>
                  <div className="space-y-2 overflow-y-auto max-h-full">
                    {versions.map((version) => (
                      <motion.div
                        key={version.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedVersion?.id === version.id
                            ? 'bg-blue-100 border-blue-300'
                            : 'bg-gray-50 hover:bg-gray-100'
                        } ${version.is_current ? 'ring-2 ring-green-300' : ''}`}
                        onClick={() => setSelectedVersion(version)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">
                                v{version.version_number}
                              </span>
                              {version.is_current && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  {t('current')}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {formatDate(version.created_at)}
                            </p>
                            {version.change_description && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {version.change_description}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Version Preview */}
                <div className="lg:col-span-2">
                  {selectedVersion ? (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {t('version')} {selectedVersion.version_number}
                          {selectedVersion.is_current && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {t('current')}
                            </span>
                          )}
                        </h3>
                        <div className="text-sm text-gray-500">
                          {formatDate(selectedVersion.created_at)}
                        </div>
                      </div>

                      {selectedVersion.change_description && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>{t('changes')}:</strong> {selectedVersion.change_description}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Front Image */}
                        <div>
                          <h4 className="text-md font-medium text-gray-700 mb-2">
                            {t('frontImage')}
                          </h4>
                          <div className="relative aspect-[1.6/1] bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                              src={selectedVersion.front_image_url}
                              alt="Front image"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>

                        {/* Back Image */}
                        {selectedVersion.back_image_url && (
                          <div>
                            <h4 className="text-md font-medium text-gray-700 mb-2">
                              {t('backImage')}
                            </h4>
                            <div className="relative aspect-[1.6/1] bg-gray-100 rounded-lg overflow-hidden">
                              <Image
                                src={selectedVersion.back_image_url}
                                alt="Back image"
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">{t('cardType')}:</span>
                            <span className="ml-2 text-gray-600">
                              {selectedVersion.card_type === 'horizontal' ? t('horizontal') : t('vertical')}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">{t('versionNumber')}:</span>
                            <span className="ml-2 text-gray-600">{selectedVersion.version_number}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      {t('selectVersionToView')}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="flex justify-end mt-6 pt-6 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
