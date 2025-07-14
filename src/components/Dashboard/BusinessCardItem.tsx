'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import QRCodeGenerator from '@/components/QRCode/QRCodeGenerator'
import { Database } from '@/lib/supabase'

type BusinessCard = Database['public']['Tables']['business_cards']['Row']

interface BusinessCardItemProps {
  card: BusinessCard
  onDelete: () => void
}

export default function BusinessCardItem({ card, onDelete }: BusinessCardItemProps) {
  const [showQRCode, setShowQRCode] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const cardUrl = `${window.location.origin}/card/${card.id}`

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(cardUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  const handleDelete = () => {
    setShowDeleteConfirm(false)
    onDelete()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <>
      <motion.div
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        whileHover={{ y: -2 }}
      >
        {/* Card Preview */}
        <div className="relative">
          <div className={`
            relative mx-auto mt-3 md:mt-4
            ${card.card_type === 'horizontal'
              ? 'w-32 h-20 md:w-40 md:h-24'
              : 'w-20 h-32 md:w-24 md:h-40'
            }
          `}>
            <Image
              src={card.front_image_url}
              alt={card.title}
              fill
              className="object-cover rounded-lg shadow-sm"
              sizes="(max-width: 768px) 160px, 200px"
            />
          </div>
          
          {/* Card Type Badge */}
          <div className="absolute top-2 right-2">
            <span className={`
              inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
              ${card.card_type === 'horizontal' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
              }
            `}>
              {card.card_type}
            </span>
          </div>

          {/* Double-sided indicator */}
          {card.back_image_url && (
            <div className="absolute top-2 left-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                2-sided
              </span>
            </div>
          )}
        </div>

        {/* Card Info */}
        <div className="p-3 md:p-4">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 truncate">
            {card.title}
          </h3>
          <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">
            Created {formatDate(card.created_at)}
          </p>

          {/* Action Buttons */}
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Link
                href={`/my-card/${card.id}`}
                className="flex-1 bg-blue-600 text-white text-center py-2 px-2 md:px-3 rounded-md text-xs md:text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Manage
              </Link>
              <button
                onClick={handleCopyUrl}
                className={`flex-1 py-2 px-2 md:px-3 rounded-md text-xs md:text-sm font-medium transition-colors ${
                  copySuccess
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {copySuccess ? (
                  <span className="flex items-center justify-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </span>
                ) : (
                  'Copy Link'
                )}
              </button>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setShowQRCode(true)}
                className="flex-1 bg-green-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
              >
                QR Code
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-1 bg-red-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-sm w-full"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">QR Code</h3>
              <button
                onClick={() => setShowQRCode(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <QRCodeGenerator
              url={cardUrl}
              title={card.title}
            />
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-sm w-full"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Business Card</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete &quot;{card.title}&quot;? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}
