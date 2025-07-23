'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/hooks/useTranslation'

interface OnboardingTutorialProps {
  isOpen: boolean
  onComplete: () => void
  onSkip: () => void
}

interface TutorialStep {
  id: number
  title: string
  description: string
  duration: number // in milliseconds
}

export default function OnboardingTutorial({
  isOpen,
  onComplete,
  onSkip
}: OnboardingTutorialProps) {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(0)

  const steps: TutorialStep[] = useMemo(() => [
    {
      id: 1,
      title: t('tutorialStep1Title'),
      description: t('tutorialStep1Desc'),
      duration: 4000
    },
    {
      id: 2,
      title: t('tutorialStep2Title'),
      description: t('tutorialStep2Desc'),
      duration: 10000
    },
    {
      id: 3,
      title: t('tutorialStep3Title'),
      description: t('tutorialStep3Desc'),
      duration: 4000
    },
    {
      id: 4,
      title: t('tutorialStep4Title'),
      description: t('tutorialStep4Desc'),
      duration: 4000
    }
  ], [t])

  const startTutorial = useCallback(() => {
    setCurrentStep(0)
  }, [])



  const handleSkip = useCallback(() => {
    onSkip()
  }, [onSkip])

  // 새로고침 기능 - 튜토리얼 처음부터 다시 시작
  const handleRestart = useCallback(() => {
    setCurrentStep(0)
  }, [])

  // 다음 단계로 이동
  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {

      onComplete()
    }
  }, [currentStep, steps.length, onComplete])

  // 이전 단계로 이동
  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  // Start tutorial when opened
  useEffect(() => {
    if (isOpen) {
      startTutorial()
    }
  }, [isOpen, startTutorial])

  if (!isOpen) return null

  const currentStepData = steps[currentStep]

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl max-w-md w-full mx-4 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="relative p-4 sm:p-6 pb-4 flex-shrink-0">
            {/* 새로고침 버튼 */}
            <button
              onClick={handleRestart}
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors"
              title="처음부터 다시보기"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            {/* 닫기 버튼 */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {t('userGuide')}
              </h2>
              <div className="flex justify-center space-x-2 mb-4">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-8 rounded-full transition-colors ${
                      index === currentStep
                        ? 'bg-blue-500'
                        : index < currentStep
                        ? 'bg-blue-300'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex-1 overflow-auto">
            {/* Animation Area - 토스식 그라데이션 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 mb-6 h-48 flex items-center justify-center">
              <TutorialAnimation key={currentStep} step={currentStep + 1} />
            </div>

            {/* Step Content */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {currentStepData?.title}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                {currentStepData?.description}
              </p>

              {/* Navigation Controls - 토스식 디자인 */}
              <div className="flex gap-3 mt-6">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="flex-1 py-4 px-4 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-200"
                  >
                    {t('previous')}
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className={`py-4 px-6 bg-blue-500 text-white rounded-2xl font-semibold hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl ${
                    currentStep === 0 ? 'flex-1' : 'flex-[2]'
                  }`}
                >
                  {currentStep === steps.length - 1 ? t('start') : t('next')}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// Tutorial Animation Component
function TutorialAnimation({ step }: { step: number }) {
  switch (step) {
    case 1:
      return <Step1Animation />
    case 2:
      return <Step2Animation />
    case 3:
      return <Step3Animation />
    case 4:
      return <Step4Animation />
    default:
      return null
  }
}

// Step 1: 명함 업로드 애니메이션
function Step1Animation() {
  const [showUpload, setShowUpload] = useState(false)
  const [showCard, setShowCard] = useState(false)

  useEffect(() => {
    const timer1 = setTimeout(() => setShowUpload(true), 500)
    const timer2 = setTimeout(() => setShowCard(true), 1500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  return (
    <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
      {/* Phone with camera */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative"
      >
        <div className="w-16 h-28 bg-gray-800 rounded-lg shadow-lg p-1">
          <div className="w-full h-full bg-gray-100 rounded-md relative overflow-hidden">
            {/* Camera icon */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
              <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586l-.707-.707A1 1 0 0013 4H7a1 1 0 00-.707.293L5.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Upload area */}
      {showUpload && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative"
        >
          <div className="w-20 h-20 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center bg-blue-50">
            <motion.svg
              className="w-8 h-8 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </motion.svg>
          </div>
        </motion.div>
      )}

      {/* Business card appears */}
      {showCard && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="absolute"
        >
          <div className="w-16 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg flex items-center justify-center">
            {/* Business card icon */}
            <div className="w-10 h-6 bg-white rounded-sm flex items-center justify-center">
              <div className="w-8 h-4 border border-gray-300 rounded-sm flex flex-col justify-center items-center">
                <div className="w-5 h-0.5 bg-gray-400 rounded mb-0.5"></div>
                <div className="w-3 h-0.5 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Step 2: AI 분석 애니메이션
function Step2Animation() {
  const [showScan, setShowScan] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setShowScan(true)
    }, 300)
    const timer2 = setTimeout(() => {
      setShowAnalysis(true)
    }, 1200)
    const timer3 = setTimeout(() => {
      setShowResults(true)
    }, 2400)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [])

  return (
    <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        {/* Mock business card */}
        <div className="w-32 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 text-white text-xs">
            <div className="font-bold">홍길동</div>
            <div className="text-xs opacity-80">개발자</div>
          </div>
        </div>

        {/* Scanning effect */}
        {showScan && (
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 40, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-1 h-full bg-white shadow-lg"
          />
        )}

        {/* Scan lines effect */}
        {showScan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
          />
        )}
      </motion.div>

      {/* AI processing indicator */}
      {showAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
          />

        </motion.div>
      )}

      {/* Results */}
      {showResults && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="flex space-x-2"
        >
          {/* Name icon */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center"
          >
            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </motion.div>

          {/* Company icon */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center"
          >
            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4z" clipRule="evenodd" />
            </svg>
          </motion.div>

          {/* Contact icon */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center"
          >
            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

// Step 3: QR코드 공유 애니메이션
function Step3Animation() {
  const [showCard, setShowCard] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [showPhone, setShowPhone] = useState(false)
  const [showScan, setShowScan] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    const timer1 = setTimeout(() => setShowCard(true), 300)
    const timer2 = setTimeout(() => setShowQR(true), 1000)
    const timer3 = setTimeout(() => setShowPhone(true), 1800)
    const timer4 = setTimeout(() => setShowScan(true), 2500)
    const timer5 = setTimeout(() => setShowSuccess(true), 3500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
      clearTimeout(timer5)
    }
  }, [])

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Business Card with QR */}
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={showCard ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="w-28 h-18 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-2 flex items-center justify-center"
        >
          {/* Business card icon */}
          <div className="w-8 h-6 bg-white rounded-sm flex items-center justify-center">
            <div className="w-6 h-4 border border-gray-300 rounded-sm flex flex-col justify-center items-center">
              <div className="w-3 h-0.5 bg-gray-400 rounded mb-0.5"></div>
              <div className="w-2 h-0.5 bg-gray-300 rounded"></div>
            </div>
          </div>
        </motion.div>

        {/* QR Code appearing */}
        {showQR && (
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="absolute -top-2 -right-2"
          >
            <div className="w-12 h-12 bg-white rounded-lg shadow-lg border-2 border-gray-200 flex items-center justify-center">
              <div className="w-8 h-8 bg-black rounded grid grid-cols-3 gap-px p-1">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className={`bg-white rounded-sm ${Math.random() > 0.5 ? 'bg-black' : ''}`} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Phone scanning */}
      {showPhone && (
        <motion.div
          initial={{ opacity: 0, x: 50, y: 20 }}
          animate={{ opacity: 1, x: 35, y: 10 }}
          transition={{ duration: 0.8 }}
          className="absolute"
        >
          <div className="w-16 h-28 bg-gray-800 rounded-lg shadow-lg p-1">
            <div className="w-full h-full bg-gray-100 rounded-md relative overflow-hidden">
              {/* Camera viewfinder */}
              {showScan && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-2 border-2 border-green-500 rounded"
                >
                  <div className="absolute top-1 left-1 w-2 h-2 border-l-2 border-t-2 border-green-500"></div>
                  <div className="absolute top-1 right-1 w-2 h-2 border-r-2 border-t-2 border-green-500"></div>
                  <div className="absolute bottom-1 left-1 w-2 h-2 border-l-2 border-b-2 border-green-500"></div>
                  <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-green-500"></div>
                </motion.div>
              )}

              {/* Success checkmark */}
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="absolute bottom-1 left-1/2 transform -translate-x-1/2"
                >
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Connecting lines */}
      {showScan && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="w-1 h-8 bg-green-400 rounded-full transform rotate-45"
          />
        </motion.div>
      )}
    </div>
  )
}

// Step 4: 자동 명함지갑 저장 애니메이션
function Step4Animation() {
  const [showPhone, setShowPhone] = useState(false)
  const [showCard, setShowCard] = useState(false)
  const [showSaving, setShowSaving] = useState(false)
  const [showWallet, setShowWallet] = useState(false)
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    const timer1 = setTimeout(() => setShowPhone(true), 300)
    const timer2 = setTimeout(() => setShowCard(true), 1000)
    const timer3 = setTimeout(() => setShowSaving(true), 1800)
    const timer4 = setTimeout(() => setShowWallet(true), 2500)
    const timer5 = setTimeout(() => setShowNotification(true), 3200)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
      clearTimeout(timer5)
    }
  }, [])

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Phone Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={showPhone ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        {/* Phone */}
        <div className="w-20 h-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg p-1">
          <div className="w-full h-full bg-gray-100 rounded-lg relative overflow-hidden flex flex-col">
            {/* Phone screen header */}
            <div className="h-6 bg-blue-500 flex items-center justify-center">
              {/* Wallet icon */}
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
              </svg>
            </div>

            {/* Cards area */}
            <div className="flex-1 p-1 relative">
              {/* Existing cards */}
              <div className="absolute top-1 left-1 w-3 h-4 bg-gray-300 rounded-sm"></div>
              <div className="absolute top-1 right-1 w-3 h-4 bg-gray-300 rounded-sm"></div>
            </div>
          </div>
        </div>

        {/* Card flying in */}
        {showCard && (
          <motion.div
            initial={{ opacity: 0, x: -40, y: -20, scale: 0.5 }}
            animate={{ opacity: 1, x: -8, y: 8, scale: 1 }}
            transition={{ duration: 1, type: "spring" }}
            className="absolute top-4 left-2"
          >
            <div className="w-6 h-8 bg-blue-500 rounded shadow-lg transform rotate-12 flex items-center justify-center">
              {/* Mini business card icon */}
              <div className="w-4 h-2 bg-white rounded-sm"></div>
            </div>
          </motion.div>
        )}

        {/* Saving animation */}
        {showSaving && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: 2 }}
              className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
            />
          </motion.div>
        )}

        {/* Success notification */}
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: -25 }}
            transition={{ duration: 0.5 }}
            className="absolute -top-6 left-1/2 transform -translate-x-1/2"
          >
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Floating particles */}
      {showWallet && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          className="absolute inset-0 pointer-events-none"
        >
          {[...Array(4)].map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: [0, 0.6, 0],
                scale: [0.5, 1, 1.2],
                x: [0, (Math.random() - 0.5) * 80],
                y: [0, (Math.random() - 0.5) * 80]
              }}
              transition={{
                delay: index * 0.3,
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1.5
              }}
              className="absolute w-2 h-2 bg-blue-400 rounded-full"
              style={{
                left: `${40 + index * 10}%`,
                top: `${40 + index * 10}%`
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
  )
}
