'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface ExampleBusinessCardProps {
  className?: string
}

export default function ExampleBusinessCard({ className = '' }: ExampleBusinessCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleCardClick = () => {
    setIsFlipped(!isFlipped)
  }

  return (
    <div className={`perspective-1000 ${className}`}>
      <motion.div
        className="relative w-full h-full cursor-pointer preserve-3d group"
        onClick={handleCardClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        animate={{
          rotateY: isFlipped ? 180 : 0,
          scale: isHovered ? 1.05 : 1,
          y: isHovered ? -8 : 0
        }}
        transition={{
          duration: 0.6,
          ease: "easeInOut",
          scale: { duration: 0.3 },
          y: { duration: 0.3 }
        }}
        whileTap={{ scale: 0.95 }}
      >
        {/* 앞면 */}
        <motion.div
          className="absolute inset-0 w-full h-full backface-hidden rounded-2xl shadow-2xl overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 p-6 flex flex-col justify-between text-white relative">
            {/* 배경 패턴 - 애니메이션 추가 */}
            <div className="absolute inset-0 opacity-10">
              <motion.div
                className="absolute top-4 right-4 w-32 h-32 border border-white/20 rounded-full"
                animate={{
                  scale: isHovered ? 1.1 : 1,
                  rotate: isHovered ? 10 : 0
                }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="absolute bottom-4 left-4 w-24 h-24 border border-white/20 rounded-full"
                animate={{
                  scale: isHovered ? 1.2 : 1,
                  rotate: isHovered ? -15 : 0
                }}
                transition={{ duration: 0.3, delay: 0.1 }}
              />
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-white/10 rounded-full"
                animate={{
                  scale: isHovered ? 0.9 : 1,
                  rotate: isHovered ? 5 : 0
                }}
                transition={{ duration: 0.3, delay: 0.05 }}
              />
            </div>
            
            {/* 회사 로고 영역 */}
            <motion.div
              className="relative z-10"
              animate={{
                y: isHovered ? -2 : 0
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <motion.svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{
                    rotate: isHovered ? 5 : 0
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </motion.svg>
              </motion.div>
              <motion.h2
                className="text-sm font-semibold text-white/80 mb-1"
                animate={{
                  opacity: isHovered ? 1 : 0.8
                }}
                transition={{ duration: 0.3 }}
              >
                SWIVEL
              </motion.h2>
            </motion.div>

            {/* 메인 정보 */}
            <motion.div
              className="relative z-10"
              animate={{
                y: isHovered ? 2 : 0
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.h1
                className="text-2xl font-bold mb-2"
                animate={{
                  scale: isHovered ? 1.05 : 1
                }}
                transition={{ duration: 0.3 }}
              >
                홍길동
              </motion.h1>
              <motion.p
                className="text-lg text-blue-200 mb-4"
                animate={{
                  opacity: isHovered ? 1 : 0.8
                }}
                transition={{ duration: 0.3 }}
              >
                Senior Product Designer
              </motion.p>

              {/* 연락처 정보 */}
              <div className="text-sm">
                <motion.div
                  className="flex items-center space-x-2"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-white/90">hong@company.com</span>
                </motion.div>
                <motion.div
                  className="flex items-center space-x-2"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-white/90">+82 10-1234-5678</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* 뒷면 */}
        <motion.div
          className="absolute inset-0 w-full h-full backface-hidden rounded-2xl shadow-2xl overflow-hidden"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black p-6 flex flex-col justify-between text-white relative">
            {/* 배경 패턴 */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
              <div className="grid grid-cols-8 grid-rows-8 gap-1 h-full">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div key={i} className="bg-white/5 rounded-sm"></div>
                ))}
              </div>
            </div>

            {/* QR 코드 영역 */}
            <motion.div
              className="relative z-10 flex flex-col items-center justify-center h-full"
              animate={{
                scale: isHovered ? 1.05 : 1
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="w-32 h-32 bg-white rounded-2xl p-4 mb-4 shadow-xl"
                whileHover={{ scale: 1.1, rotate: 2 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="w-full h-full bg-black rounded-lg relative overflow-hidden">
                  {/* QR 코드 패턴 시뮬레이션 */}
                  <div className="grid grid-cols-8 grid-rows-8 gap-0.5 h-full p-1">
                    {[1,0,1,1,0,1,0,1,0,1,1,0,1,0,1,1,1,0,0,1,1,0,1,0,0,1,0,1,1,0,1,1,1,1,0,0,1,0,1,0,1,0,1,1,0,1,0,1,0,1,1,0,1,0,1,1,1,0,0,1,1,0,1,0].map((dot, i) => (
                      <motion.div
                        key={i}
                        className={`${dot ? 'bg-black' : 'bg-white'} rounded-sm`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.01, duration: 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.p
                className="text-center text-sm text-gray-300 mb-2"
                animate={{
                  opacity: isHovered ? 1 : 0.8
                }}
                transition={{ duration: 0.3 }}
              >
                QR 코드로 연락처 저장
              </motion.p>
              <motion.p
                className="text-center text-xs text-gray-400"
                animate={{
                  opacity: isHovered ? 0.8 : 0.6
                }}
                transition={{ duration: 0.3 }}
              >
                스마트폰으로 스캔하세요
              </motion.p>
            </motion.div>

            {/* 하단 정보 */}
            <div className="relative z-10 text-center">
              <p className="text-xs text-gray-400 mb-2">www.company.com</p>
              <div className="flex justify-center space-x-4 text-xs text-gray-500">
                <span>LinkedIn</span>
                <span>•</span>
                <span>Instagram</span>
                <span>•</span>
                <span>Twitter</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
