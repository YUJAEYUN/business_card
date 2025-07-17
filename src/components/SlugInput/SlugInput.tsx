'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/hooks/useTranslation'

interface SlugInputProps {
  value: string
  onChange: (slug: string) => void
  onValidationChange: (isValid: boolean) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  autoGenerate?: boolean
  cardTitle?: string
}

interface SlugValidationResult {
  available: boolean
  reason?: string
  suggestions?: string[]
}

export default function SlugInput({ 
  value, 
  onChange, 
  onValidationChange,
  placeholder,
  className = "",
  disabled = false,
  autoGenerate = false,
  cardTitle = ""
}: SlugInputProps) {
  const { t } = useTranslation()
  const [validation, setValidation] = useState<SlugValidationResult | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  // Auto-generate slug from card title
  const generateSlugFromTitle = useCallback(async (title: string) => {
    if (!title.trim()) return

    try {
      const response = await fetch('/api/slugs/check/temp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: title }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.suggestions && data.suggestions.length > 0) {
          onChange(data.suggestions[0])
        } else if (data.normalized) {
          onChange(data.normalized)
        }
      }
    } catch (error) {
      console.error('Failed to generate slug:', error)
    }
  }, [onChange])

  useEffect(() => {
    if (autoGenerate && cardTitle && !value) {
      generateSlugFromTitle(cardTitle)
    }
  }, [autoGenerate, cardTitle, value, generateSlugFromTitle])


  // Debounced validation
  const validateSlug = useCallback(async (slug: string) => {
    if (!slug.trim()) {
      setValidation(null)
      onValidationChange(true)
      return
    }

    setIsChecking(true)
    
    try {
      const response = await fetch(`/api/slugs/check/${encodeURIComponent(slug)}`)
      
      if (response.ok) {
        const result = await response.json()
        setValidation(result)
        onValidationChange(result.available)
        
        if (!result.available && result.suggestions) {
          setSuggestions(result.suggestions)
        }
      } else {
        setValidation({ available: false, reason: 'Failed to check availability' })
        onValidationChange(false)
      }
    } catch (error) {
      console.error('Slug validation error:', error)
      setValidation({ available: false, reason: 'Network error' })
      onValidationChange(false)
    } finally {
      setIsChecking(false)
    }
  }, [onValidationChange])

  // Debounce validation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateSlug(value)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [value, validateSlug])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toLowerCase().replace(/[^a-zA-Z0-9._-]/g, '')
    onChange(newValue)
    setShowSuggestions(false)
  }

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion)
    setShowSuggestions(false)
  }

  const getValidationIcon = () => {
    if (isChecking) {
      return (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      )
    }
    
    if (!value.trim()) return null
    
    if (validation?.available) {
      return (
        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    }
    
    return (
      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
  }

  const getValidationMessage = () => {
    if (!value.trim()) return null
    
    if (validation?.available) {
      return (
        <p className="text-sm text-green-600 mt-1">
          ✓ {t('available')}! {t('yourCardWillBeAccessible')}: {typeof window !== 'undefined' ? window.location.origin : 'https://yoursite.com'}/{value}
        </p>
      )
    }
    
    if (validation?.reason) {
      return (
        <p className="text-sm text-red-600 mt-1">
          {validation.reason === 'This slug is already taken' ? t('slugAlreadyTaken') : validation.reason}
        </p>
      )
    }
    
    return null
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative">
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">{typeof window !== 'undefined' ? window.location.origin : 'https://yoursite.com'}/</span>
          <div className="flex-1 relative">
            <input
              type="text"
              value={value}
              onChange={handleInputChange}
              placeholder={placeholder || t('enterCustomUrl')}
              disabled={disabled}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
                validation?.available === false 
                  ? 'border-red-300 bg-red-50' 
                  : validation?.available === true 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-300'
              } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {getValidationIcon()}
            </div>
          </div>
        </div>
        
        {/* Auto-generate button */}
        {autoGenerate && cardTitle && (
          <button
            type="button"
            onClick={() => generateSlugFromTitle(cardTitle)}
            disabled={disabled}
            className="text-xs text-blue-600 hover:text-blue-800 mt-1 disabled:text-gray-400"
          >
            {t('autoGenerateFromTitle')}
          </button>
        )}
      </div>

      {/* Validation message */}
      <AnimatePresence>
        {getValidationMessage() && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {getValidationMessage()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions */}
      {!validation?.available && suggestions.length > 0 && (
        <div className="mt-2">
          <p className="text-sm text-gray-600 mb-2">{t('suggestions')}:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={disabled}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {suggestion}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="text-xs text-blue-600 hover:text-blue-800 mt-1"
          >
            {showSuggestions ? t('hideSuggestions') : t('showMoreSuggestions')}
          </button>
        </div>
      )}

      {/* Help text */}
      <p className="text-xs text-gray-500">
        {t('customUrlHelp')}
      </p>
    </div>
  )
}