'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import FlipCard from '@/components/BusinessCard/FlipCard'
import ShareButtons from '@/components/Share/ShareButtons'
import SlugInput from '@/components/SlugInput/SlugInput'
import { Database } from '@/lib/supabase'

type BusinessCard = Database['public']['Tables']['business_cards']['Row']

interface CardViewerProps {
  card: BusinessCard
}

export default function CardViewer({ card }: CardViewerProps) {
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [showSlugEdit, setShowSlugEdit] = useState(false)
  const [currentSlug, setCurrentSlug] = useState('')
  const [isSlugValid, setIsSlugValid] = useState(true)
  const [isSavingSlug, setIsSavingSlug] = useState(false)
  const cardUrl = currentSlug ? `${window.location.origin}/${currentSlug}` : `${window.location.origin}/card/${card.id}`

  // Load current slug on component mount
  useEffect(() => {
    const loadCurrentSlug = async () => {
      try {
        const response = await fetch(`/api/slugs/current/${card.id}`)
        if (response.ok) {
          const data = await response.json()
          if (data.slug) {
            setCurrentSlug(data.slug)
          }
        }
      } catch (error) {
        console.error('Failed to load current slug:', error)
      }
    }

    loadCurrentSlug()
  }, [card.id])

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(cardUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  const handleSaveSlug = async () => {
    if (!isSlugValid || isSavingSlug) return

    setIsSavingSlug(true)
    try {
      const response = await fetch(`/api/slugs/update/${card.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug: currentSlug }),
      })

      if (response.ok) {
        setShowSlugEdit(false)
      } else {
        console.error('Failed to save slug')
      }
    } catch (error) {
      console.error('Error saving slug:', error)
    } finally {
      setIsSavingSlug(false)
    }
  }

  const handleDeleteSlug = async () => {
    if (isSavingSlug) return

    setIsSavingSlug(true)
    try {
      const response = await fetch(`/api/slugs/update/${card.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCurrentSlug('')
        setShowSlugEdit(false)
      } else {
        console.error('Failed to delete slug')
      }
    } catch (error) {
      console.error('Error deleting slug:', error)
    } finally {
      setIsSavingSlug(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{card.title}</h1>
          <p className="text-gray-600">Digital Business Card</p>
        </motion.div>

        {/* Card Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <FlipCard
            frontImageUrl={card.front_image_url}
            backImageUrl={card.back_image_url || undefined}
            cardType={card.card_type}
            className="shadow-2xl"
          />
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button
            onClick={handleCopyUrl}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              copySuccess
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {copySuccess ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Link
              </>
            )}
          </button>

          <button
            onClick={() => setShowSlugEdit(!showSlugEdit)}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Custom URL
          </button>

          <button
            onClick={() => setShowShareOptions(!showShareOptions)}
            className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Share
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Your Own
          </Link>
        </motion.div>

        {/* Slug Edit Section */}
        {showSlugEdit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex justify-center"
          >
            <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Custom URL Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current URL
                  </label>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {cardUrl}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom URL
                  </label>
                  <SlugInput
                    value={currentSlug}
                    onChange={setCurrentSlug}
                    onValidationChange={setIsSlugValid}
                    placeholder="your-custom-url"
                    autoGenerate={false}
                    cardTitle={card.title}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSaveSlug}
                    disabled={!isSlugValid || isSavingSlug}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSavingSlug ? 'Saving...' : 'Save'}
                  </button>
                  
                  {currentSlug && (
                    <button
                      onClick={handleDeleteSlug}
                      disabled={isSavingSlug}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Remove
                    </button>
                  )}
                  
                  <button
                    onClick={() => setShowSlugEdit(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Share Options */}
        {showShareOptions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex justify-center"
          >
            <ShareButtons
              url={cardUrl}
              title={card.title}
              description={`Check out ${card.title}'s digital business card`}
            />
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Use</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <p className="font-medium">Click or Tap</p>
                <p>Tap the card to flip between front and back</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </div>
                <p className="font-medium">Share</p>
                <p>Copy the link or share on social media</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="font-medium">Create</p>
                <p>Make your own digital business card</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
