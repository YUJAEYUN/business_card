'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { useTranslation } from '@/hooks/useTranslation'

interface ImageEditorProps {
  imageUrl: string
  onSave: (editedFile: File) => void
  onCancel: () => void
  aspectRatio?: number
}

export default function ImageEditor({
  imageUrl,
  onSave,
  onCancel,
  aspectRatio
}: ImageEditorProps) {
  const { t } = useTranslation()
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    
    // Set initial crop to center with aspect ratio if provided
    const initialCrop = aspectRatio
      ? makeAspectCrop(
          {
            unit: '%',
            width: 80,
          },
          aspectRatio,
          width,
          height
        )
      : centerCrop(
          {
            unit: '%',
            width: 80,
            height: 80,
          },
          width,
          height
        )
    
    setCrop(initialCrop)
  }, [aspectRatio])

  const handleRotate = (direction: 'left' | 'right') => {
    const newRotation = direction === 'left' 
      ? rotation - 90 
      : rotation + 90
    setRotation(newRotation % 360)
  }

  const handleReset = () => {
    setRotation(0)
    setScale(1)
    if (imgRef.current) {
      const { width, height } = imgRef.current
      const initialCrop = aspectRatio
        ? makeAspectCrop(
            {
              unit: '%',
              width: 80,
            },
            aspectRatio,
            width,
            height
          )
        : centerCrop(
            {
              unit: '%',
              width: 80,
              height: 80,
            },
            width,
            height
          )
      setCrop(initialCrop)
    }
  }

  const getCroppedImg = useCallback(async (): Promise<File | null> => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      return null
    }

    const image = imgRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return null
    }

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    // Set canvas size to the crop size
    canvas.width = completedCrop.width * scaleX
    canvas.height = completedCrop.height * scaleY

    // Apply transformations
    ctx.save()
    
    // Move to center for rotation
    ctx.translate(canvas.width / 2, canvas.height / 2)
    
    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180)
    
    // Apply scale
    ctx.scale(scale, scale)
    
    // Draw the cropped image
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      -canvas.width / 2,
      -canvas.height / 2,
      canvas.width,
      canvas.height
    )
    
    ctx.restore()

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'edited-image.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now(),
          })
          resolve(file)
        } else {
          resolve(null)
        }
      }, 'image/jpeg', 0.9)
    })
  }, [completedCrop, rotation, scale])

  const handleSave = async () => {
    setIsProcessing(true)
    try {
      const editedFile = await getCroppedImg()
      if (editedFile) {
        onSave(editedFile)
      }
    } catch (error) {
      console.error('Error processing image:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('editImage') || 'Edit Image'}
          </h2>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[calc(90vh-140px)] overflow-auto">
          {/* Controls */}
          <div className="mb-4 flex flex-wrap gap-4 items-center justify-center">
            {/* Rotation Controls */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                {t('rotate') || 'Rotate'}:
              </span>
              <button
                onClick={() => handleRotate('left')}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                ↺ 90°
              </button>
              <button
                onClick={() => handleRotate('right')}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                ↻ 90°
              </button>
            </div>

            {/* Scale Control */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                {t('scale') || 'Scale'}:
              </span>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-gray-600 w-8">
                {scale.toFixed(1)}x
              </span>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            >
              {t('reset') || 'Reset'}
            </button>
          </div>

          {/* Image Crop Area */}
          <div className="flex justify-center">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              minWidth={50}
              minHeight={50}
            >
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Edit"
                onLoad={onImageLoad}
                style={{
                  transform: `rotate(${rotation}deg) scale(${scale})`,
                  maxWidth: '100%',
                  maxHeight: '60vh',
                }}
              />
            </ReactCrop>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            {t('cancel') || 'Cancel'}
          </button>
          <button
            onClick={handleSave}
            disabled={isProcessing || !completedCrop}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing 
              ? (t('processing') || 'Processing...') 
              : (t('save') || 'Save')
            }
          </button>
        </div>

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />
      </motion.div>
    </div>
  )
}
