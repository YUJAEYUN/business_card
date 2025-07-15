'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BusinessCardData } from '@/lib/ocr/types';

interface DualOCRProcessorProps {
  businessCardId: string;
  frontImage: {
    file: File;
    url?: string;
  };
  backImage?: {
    file: File;
    url?: string;
  };
  onComplete?: (result: BusinessCardData) => void;
  onError?: (error: string) => void;
}

export default function DualOCRProcessor({
  businessCardId,
  frontImage,
  backImage,
  onComplete,
  onError
}: DualOCRProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<BusinessCardData | null>(null);
  const [processingSteps, setProcessingSteps] = useState<{
    front: 'pending' | 'processing' | 'completed' | 'error';
    back: 'pending' | 'processing' | 'completed' | 'error';
  }>({ front: 'pending', back: 'pending' });
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    console.log('useEffect called - starting OCR immediately');

    // Props 디버깅
    console.log('DualOCRProcessor props:', {
      businessCardId,
      frontImage: {
        hasFile: !!frontImage.file,
        fileName: frontImage.file?.name,
        hasUrl: !!frontImage.url
      },
      backImage: {
        hasFile: !!backImage?.file,
        fileName: backImage?.file?.name,
        hasUrl: !!backImage?.url
      }
    });

    let isMounted = true;

    const processOCR = async () => {
      if (!isMounted) return;

      setIsProcessing(true);
      setProgress(0);
      setError(null);
      setEditableData(null);

      try {
        // 앞면과 뒷면을 독립적으로 동시 처리
        const promises: Promise<{ side: string; data: BusinessCardData }>[] = [];

        // 앞면 처리 시작
        setProcessingSteps(prev => ({ ...prev, front: 'processing' }));
        const frontPromise = (async () => {
          console.log('Starting front side OCR...');
          const frontFormData = new FormData();
          frontFormData.append('image', frontImage.file);
          frontFormData.append('businessCardId', businessCardId);
          if (frontImage.url) {
            frontFormData.append('imageUrl', frontImage.url);
          }

          const response = await fetch('/api/ocr/extract', {
            method: 'POST',
            body: frontFormData,
          });

          console.log('Front side response status:', response.status);
          if (!response.ok) {
            throw new Error(`Front side OCR failed: ${response.statusText}`);
          }

          const result = await response.json();
          console.log('Front side result:', result);
          const data = result.data || result.finalResult || {};
          console.log('Front side extracted data:', data);
          return { side: 'front', data };
        })();

        promises.push(frontPromise);

        // 뒷면이 있으면 뒷면 처리 시작
        if (backImage?.file) {
          console.log('Starting back side OCR...');
          setProcessingSteps(prev => ({ ...prev, back: 'processing' }));
          const backPromise = (async () => {
            const backBusinessCardId = crypto.randomUUID(); // 독립적인 임시 ID
            console.log('Back side business card ID:', backBusinessCardId);
            const backFormData = new FormData();
            backFormData.append('image', backImage.file);
            backFormData.append('businessCardId', backBusinessCardId);
            if (backImage.url) {
              backFormData.append('imageUrl', backImage.url);
            }

            const response = await fetch('/api/ocr/extract', {
              method: 'POST',
              body: backFormData,
            });

            console.log('Back side response status:', response.status);
            if (!response.ok) {
              throw new Error(`Back side OCR failed: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Back side result:', result);
            const data = result.data || result.finalResult || {};
            console.log('Back side extracted data:', data);
            return { side: 'back', data };
          })();

          promises.push(backPromise);
        } else {
          console.log('No back image to process');
        }

        setCurrentStep('Processing both sides...');
        setProgress(50);

        // 모든 처리 완료 대기
        console.log('Waiting for all OCR processes to complete...');
        const results = await Promise.allSettled(promises);
        console.log('All OCR processes completed, results:', results);

        if (!isMounted) {
          console.log('Component unmounted after OCR completion');
          return;
        }

        let frontData: BusinessCardData = {};
        let backData: BusinessCardData = {};

        // 결과 처리
        results.forEach((result, index) => {
          console.log(`Processing result ${index}:`, result);
          if (result.status === 'fulfilled') {
            console.log(`Result ${index} fulfilled:`, result.value);
            if (result.value.side === 'front') {
              frontData = result.value.data;
              console.log('Front data extracted:', frontData);
              setProcessingSteps(prev => ({ ...prev, front: 'completed' }));
            } else if (result.value.side === 'back') {
              backData = result.value.data;
              console.log('Back data extracted:', backData);
              setProcessingSteps(prev => ({ ...prev, back: 'completed' }));
            }
          } else {
            console.log(`Result ${index} rejected:`, result.reason);
            // 첫 번째는 앞면, 두 번째는 뒷면
            if (index === 0) {
              setProcessingSteps(prev => ({ ...prev, front: 'error' }));
            } else {
              setProcessingSteps(prev => ({ ...prev, back: 'error' }));
            }
          }
        });

        // 데이터 병합
        console.log('Merging data - Front:', frontData, 'Back:', backData);
        const mergedData = {
          ...frontData,
          ...backData,
          // 중요한 정보는 앞면 우선, 없으면 뒷면 사용
          name: frontData.name || backData.name,
          title: frontData.title || backData.title,
          company: frontData.company || backData.company,
          phone: frontData.phone || backData.phone,
          email: frontData.email || backData.email,
          website: frontData.website || backData.website,
          address: frontData.address || backData.address,
          qr_code_url: frontData.qr_code_url || backData.qr_code_url
        };

        console.log('Final merged data:', mergedData);
        setProgress(100);
        setCurrentStep('Complete!');
        setEditableData(mergedData);
        console.log('OCR processing completed, showing results for user review');
        // onComplete는 사용자가 Save 버튼을 눌렀을 때만 호출

      } catch (err) {
        if (!isMounted) return;
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        setProcessingSteps(prev => ({
          front: prev.front === 'processing' ? 'error' : prev.front,
          back: prev.back === 'processing' ? 'error' : prev.back
        }));
        onError?.(errorMessage);
      } finally {
        if (isMounted) {
          setIsProcessing(false);
        }
      }
    };

    processOCR();

    return () => {
      console.log('DualOCRProcessor cleanup - setting isMounted to false');
      isMounted = false;
    };
  }, [hasStarted]); // eslint-disable-line react-hooks/exhaustive-deps



  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editableData) {
      onComplete?.(editableData);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleFieldChange = (field: keyof BusinessCardData, value: string) => {
    if (editableData) {
      setEditableData({
        ...editableData,
        [field]: value
      });
    }
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-red-50 border border-red-200 rounded-lg p-4"
      >
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-700 font-medium">OCR Processing Failed</span>
        </div>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </motion.div>
    );
  }

  if (isProcessing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-blue-900">Processing Business Card</h3>
          <span className="text-blue-600 font-medium">{progress}%</span>
        </div>

        <div className="space-y-4">
          <div className="w-full bg-blue-200 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <p className="text-blue-700 text-sm">{currentStep}</p>

          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                processingSteps.front === 'completed' ? 'bg-green-500' :
                processingSteps.front === 'processing' ? 'bg-blue-500 animate-pulse' :
                processingSteps.front === 'error' ? 'bg-red-500' :
                'bg-gray-300'
              }`}>
                {processingSteps.front === 'completed' && <span className="text-white text-xs">✓</span>}
                {processingSteps.front === 'error' && <span className="text-white text-xs">✗</span>}
              </div>
              <span className="text-sm">Front Side Analysis</span>
            </div>

            {backImage && (
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  processingSteps.back === 'completed' ? 'bg-green-500' :
                  processingSteps.back === 'processing' ? 'bg-blue-500 animate-pulse' :
                  processingSteps.back === 'error' ? 'bg-red-500' :
                  'bg-gray-300'
                }`}>
                  {processingSteps.back === 'completed' && <span className="text-white text-xs">✓</span>}
                  {processingSteps.back === 'error' && <span className="text-white text-xs">✗</span>}
                </div>
                <span className="text-sm">Back Side Analysis</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (editableData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-700 font-medium">
                OCR Processing Complete ({backImage ? 'Both Sides' : 'Front Side'})
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors"
                >
                  ✏️ Edit
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 transition-colors"
                  >
                    💾 Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-600 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-700 transition-colors"
                  >
                    ❌ Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="text-green-600 text-sm mt-1">
            {isEditing ? 'Edit the extracted information below' : 'Click Edit to modify the extracted information'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div className="bg-gray-50 rounded-lg p-3">
            <label className="text-sm font-medium text-gray-700 block mb-1">Name</label>
            {isEditing ? (
              <input
                type="text"
                value={editableData.name || ''}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="Enter name"
              />
            ) : (
              <p className="text-gray-900">{editableData.name || 'Not detected'}</p>
            )}
          </div>

          {/* Title */}
          <div className="bg-gray-50 rounded-lg p-3">
            <label className="text-sm font-medium text-gray-700 block mb-1">Title</label>
            {isEditing ? (
              <input
                type="text"
                value={editableData.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="Enter title"
              />
            ) : (
              <p className="text-gray-900">{editableData.title || 'Not detected'}</p>
            )}
          </div>

          {/* Company */}
          <div className="bg-gray-50 rounded-lg p-3">
            <label className="text-sm font-medium text-gray-700 block mb-1">Company</label>
            {isEditing ? (
              <input
                type="text"
                value={editableData.company || ''}
                onChange={(e) => handleFieldChange('company', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="Enter company"
              />
            ) : (
              <p className="text-gray-900">{editableData.company || 'Not detected'}</p>
            )}
          </div>

          {/* Email */}
          <div className="bg-gray-50 rounded-lg p-3">
            <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
            {isEditing ? (
              <input
                type="email"
                value={editableData.email || ''}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="Enter email"
              />
            ) : (
              <p className="text-gray-900">{editableData.email || 'Not detected'}</p>
            )}
          </div>

          {/* Phone */}
          <div className="bg-gray-50 rounded-lg p-3">
            <label className="text-sm font-medium text-gray-700 block mb-1">Phone</label>
            {isEditing ? (
              <input
                type="tel"
                value={editableData.phone || ''}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="Enter phone"
              />
            ) : (
              <p className="text-gray-900">{editableData.phone || 'Not detected'}</p>
            )}
          </div>

          {/* Website */}
          <div className="bg-gray-50 rounded-lg p-3">
            <label className="text-sm font-medium text-gray-700 block mb-1">Website</label>
            {isEditing ? (
              <input
                type="url"
                value={editableData.website || ''}
                onChange={(e) => handleFieldChange('website', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="Enter website"
              />
            ) : (
              <p className="text-gray-900">{editableData.website || 'Not detected'}</p>
            )}
          </div>

          {/* Address */}
          <div className="bg-gray-50 rounded-lg p-3 md:col-span-2">
            <label className="text-sm font-medium text-gray-700 block mb-1">Address</label>
            {isEditing ? (
              <textarea
                value={editableData.address || ''}
                onChange={(e) => handleFieldChange('address', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="Enter address"
                rows={2}
              />
            ) : (
              <p className="text-gray-900">{editableData.address || 'Not detected'}</p>
            )}
          </div>

          {/* QR Code URL */}
          {editableData.qr_code_url && (
            <div className="bg-yellow-50 rounded-lg p-3 md:col-span-2 border border-yellow-200">
              <label className="text-sm font-medium text-yellow-800 block mb-1">
                🔗 QR Code URL (Auto-detected)
              </label>
              <div className="flex items-center space-x-2">
                <p className="text-yellow-900 flex-1 break-all">{editableData.qr_code_url}</p>
                <button
                  onClick={() => window.open(editableData.qr_code_url, '_blank')}
                  className="bg-yellow-600 text-white px-2 py-1 rounded text-xs hover:bg-yellow-700 transition-colors"
                >
                  Open
                </button>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                This URL was automatically extracted from a QR code on the business card
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return null;
}
