'use client'

import { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { motion } from 'framer-motion'

interface QRCodeGeneratorProps {
  url: string
  title: string
  size?: number
  className?: string
}

export default function QRCodeGenerator({ 
  url, 
  title, 
  size = 200, 
  className = '' 
}: QRCodeGeneratorProps) {
  const qrRef = useRef<SVGSVGElement>(null)

  const downloadQRCode = () => {
    if (!qrRef.current) return

    try {
      // Create a canvas to convert SVG to image
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const svgData = new XMLSerializer().serializeToString(qrRef.current)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const svgUrl = URL.createObjectURL(svgBlob)

      const img = new Image()
      img.onload = () => {
        canvas.width = size
        canvas.height = size
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, size, size)
        ctx.drawImage(img, 0, 0, size, size)

        // Download the image
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_qr_code.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
          }
        }, 'image/png')

        URL.revokeObjectURL(svgUrl)
      }
      img.src = svgUrl
    } catch (error) {
      console.error('Error downloading QR code:', error)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      // TODO: Show success toast
      console.log('URL copied to clipboard')
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  return (
    <div className={`text-center ${className}`}>
      <div className="bg-white p-4 rounded-lg inline-block shadow-sm">
        <QRCodeSVG
          ref={qrRef}
          value={url}
          size={size}
          level="M"
          bgColor="#ffffff"
          fgColor="#000000"
          marginSize={4}
          title={`QR Code for ${title}`}
        />
      </div>
      
      <div className="mt-4 space-y-3">
        <p className="text-sm text-gray-600 font-medium">{title}</p>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <motion.button
            onClick={downloadQRCode}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PNG
          </motion.button>
          
          <motion.button
            onClick={copyToClipboard}
            className="flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy URL
          </motion.button>
        </div>
        
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border break-all">
          {url}
        </div>
      </div>
    </div>
  )
}
