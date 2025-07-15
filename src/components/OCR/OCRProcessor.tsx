'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BusinessCardData, OCRProcessingResult } from '@/lib/ocr/types';

interface OCRProcessorProps {
  businessCardId: string;
  imageFile: File;
  imageUrl?: string;
  onComplete?: (result: BusinessCardData) => void;
  onError?: (error: string) => void;
}

export default function OCRProcessor({
  businessCardId,
  imageFile,
  imageUrl,
  onComplete,
  onError
}: OCRProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [result, setResult] = useState<OCRProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processOCR = useCallback(async () => {
    if (!process.env.NEXT_PUBLIC_ENABLE_OCR) {
      setError('OCR feature is not enabled');
      onError?.('OCR feature is not enabled');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      setCurrentStep('Preparing image...');
      setProgress(10);

      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('businessCardId', businessCardId);
      if (imageUrl) {
        formData.append('imageUrl', imageUrl);
      }

      setCurrentStep('Processing with OCR...');
      setProgress(30);

      const response = await fetch('/api/ocr/extract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'OCR processing failed');
      }

      setCurrentStep('Analyzing results...');
      setProgress(80);

      const ocrResult = await response.json();
      
      setProgress(100);
      setCurrentStep('Complete!');
      
      setResult(ocrResult);
      onComplete?.(ocrResult.data);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [businessCardId, imageFile, imageUrl, onComplete, onError]);

  const formatConfidence = (confidence: number): string => {
    return `${Math.round(confidence * 100)}%`;
  };

  const getMethodBadgeColor = (method: string): string => {
    switch (method) {
      case 'openai': return 'bg-green-100 text-green-800';
      case 'tesseract': return 'bg-blue-100 text-blue-800';
      case 'hybrid': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          OCR Processing
        </h3>
        {!isProcessing && !result && !error && (
          <button
            onClick={processOCR}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start OCR
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{currentStep}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-blue-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Processing Animation */}
            <div className="flex items-center justify-center py-8">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 font-medium">OCR Processing Failed</span>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
            <button
              onClick={processOCR}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Retry
            </button>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Success Header */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-700 font-medium">OCR Processing Complete</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMethodBadgeColor(result.method)}`}>
                    {result.method.toUpperCase()}
                  </span>
                  <span className="text-green-600 font-medium">
                    {formatConfidence(result.confidence)}
                  </span>
                </div>
              </div>
              <p className="text-green-600 text-sm mt-1">
                Processed in {result.processing_time}ms • {result.zones_count} interactive zones found
              </p>
            </div>

            {/* Extracted Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.data.name && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{result.data.name}</p>
                </div>
              )}
              
              {result.data.title && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <label className="text-sm font-medium text-gray-700">Title</label>
                  <p className="text-gray-900">{result.data.title}</p>
                </div>
              )}
              
              {result.data.company && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <label className="text-sm font-medium text-gray-700">Company</label>
                  <p className="text-gray-900">{result.data.company}</p>
                </div>
              )}
              
              {result.data.email && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{result.data.email}</p>
                </div>
              )}
              
              {result.data.phone && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-gray-900">{result.data.phone}</p>
                </div>
              )}
              
              {result.data.website && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <label className="text-sm font-medium text-gray-700">Website</label>
                  <p className="text-gray-900">{result.data.website}</p>
                </div>
              )}
            </div>

            {/* Interactive Zones */}
            {result.data.clickable_zones && result.data.clickable_zones.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  Interactive Zones ({result.data.clickable_zones.length})
                </h4>
                <div className="space-y-2">
                  {result.data.clickable_zones.map((zone, index) => (
                    <div key={index} className="flex items-center justify-between bg-white rounded p-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          zone.type === 'email' ? 'bg-red-100 text-red-800' :
                          zone.type === 'phone' ? 'bg-green-100 text-green-800' :
                          zone.type === 'website' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {zone.type}
                        </span>
                        <span className="text-sm text-gray-900">{zone.data.value}</span>
                      </div>
                      {zone.confidence && (
                        <span className="text-xs text-gray-500">
                          {formatConfidence(zone.confidence)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <button
                onClick={processOCR}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Process Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
