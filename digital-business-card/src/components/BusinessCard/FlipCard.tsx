'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface FlipCardProps {
  frontImageUrl: string
  backImageUrl?: string
  cardType: 'horizontal' | 'vertical'
  className?: string
  onClick?: () => void
}

export default function FlipCard({
  frontImageUrl,
  backImageUrl,
  cardType,
  className = '',
  onClick,
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleClick = () => {
    if (backImageUrl) {
      setIsFlipped(!isFlipped)
    }
    onClick?.()
  }

  const cardDimensions = {
    horizontal: {
      width: 'w-80', // 320px
      height: 'h-48', // 192px
      aspectRatio: '5/3',
    },
    vertical: {
      width: 'w-48', // 192px
      height: 'h-80', // 320px
      aspectRatio: '3/5',
    },
  }

  const dimensions = cardDimensions[cardType]

  return (
    <div
      className={`relative ${dimensions.width} ${dimensions.height} cursor-pointer ${className}`}
      onClick={handleClick}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          duration: 0.6,
          ease: 'easeInOut',
        }}
      >
        {/* Front Side */}
        <motion.div
          className="absolute inset-0 w-full h-full rounded-lg shadow-lg overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <Image
            src={frontImageUrl}
            alt="Business card front"
            fill
            className="object-cover"
            sizes={`(max-width: 768px) 100vw, ${cardType === 'horizontal' ? '320px' : '192px'}`}
            priority
          />
        </motion.div>

        {/* Back Side */}
        {backImageUrl && (
          <motion.div
            className="absolute inset-0 w-full h-full rounded-lg shadow-lg overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <Image
              src={backImageUrl}
              alt="Business card back"
              fill
              className="object-cover"
              sizes={`(max-width: 768px) 100vw, ${cardType === 'horizontal' ? '320px' : '192px'}`}
            />
          </motion.div>
        )}

        {/* Flip Indicator */}
        {backImageUrl && (
          <div className="absolute bottom-2 right-2 z-10">
            <motion.div
              className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {isFlipped ? 'Front' : 'Back'}
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Touch/Click Hint */}
      {backImageUrl && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <div className="bg-black bg-opacity-70 text-white text-sm px-4 py-2 rounded-lg">
            Tap to flip
          </div>
        </motion.div>
      )}
    </div>
  )
}
