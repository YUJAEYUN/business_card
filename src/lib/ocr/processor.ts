// OCR 통합 처리기

import { getTesseractInstance, cleanupTesseract } from './tesseract';
import { analyzeBusinessCardWithOpenAI, convertImageToBase64 } from './openai-vision';
import { 
  OCRProcessingOptions, 
  OCRProcessingResult, 
  BusinessCardData, 
  OCRResult 
} from './types';

export class OCRProcessor {
  private options: OCRProcessingOptions;

  constructor(options: OCRProcessingOptions = {}) {
    this.options = {
      enableTesseract: false, // Tesseract 비활성화
      enableOpenAI: true,
      imagePreprocessing: false,
      language: ['eng', 'kor', 'jpn'],
      ...options
    };
  }

  async processBusinessCard(
    imageFile: File,
    imageUrl?: string
  ): Promise<OCRProcessingResult> {
    const startTime = Date.now();
    let tesseractResult: OCRResult | undefined;
    let openaiResult: BusinessCardData | undefined;
    let finalResult: BusinessCardData = {};
    let confidence = 0;
    let method: 'tesseract' | 'openai' | 'hybrid' = 'hybrid';

    try {
      // OpenAI Vision API 처리만 사용 (Tesseract 비활성화)
      if (this.options.enableOpenAI && imageUrl) {
        try {
          openaiResult = await analyzeBusinessCardWithOpenAI(imageUrl);
          console.log('[OCR] OpenAI processing completed');
        } catch (error) {
          console.warn('[OCR] OpenAI processing failed:', error);
          throw new Error('OCR processing failed: OpenAI Vision API error');
        }
      } else {
        throw new Error('OCR processing failed: OpenAI Vision API not available');
      }

      // OpenAI 결과 사용
      if (openaiResult) {
        finalResult = openaiResult;
        confidence = 0.9; // OpenAI Vision API 기본 신뢰도
        method = 'openai';
      } else {
        throw new Error('No OCR results available');
      }

    } catch (error) {
      console.error('[OCR] Processing failed:', error);
      throw error;
    }

    const processingTime = Date.now() - startTime;

    return {
      tesseractResult,
      openaiResult,
      finalResult,
      confidence,
      processingTime,
      method
    };
  }

  private async processTesseract(imageFile: File): Promise<OCRResult> {
    const tesseract = getTesseractInstance();
    
    let processedFile = imageFile;
    
    // 이미지 전처리 (옵션)
    if (this.options.imagePreprocessing) {
      try {
        processedFile = await tesseract.preprocessImage(imageFile);
      } catch (error) {
        console.warn('[OCR] Image preprocessing failed, using original:', error);
      }
    }

    return await tesseract.extractText(processedFile);
  }

  private integrateResults(
    tesseractResult?: OCRResult,
    openaiResult?: BusinessCardData
  ): { data: BusinessCardData; confidence: number; method: 'tesseract' | 'openai' | 'hybrid' } {
    
    // OpenAI 결과만 있는 경우
    if (openaiResult && !tesseractResult) {
      return {
        data: openaiResult,
        confidence: this.calculateOpenAIConfidence(openaiResult),
        method: 'openai'
      };
    }

    // Tesseract 결과만 있는 경우
    if (tesseractResult && !openaiResult) {
      return {
        data: this.extractDataFromTesseract(tesseractResult),
        confidence: tesseractResult.confidence / 100,
        method: 'tesseract'
      };
    }

    // 둘 다 있는 경우 - 하이브리드 접근
    if (tesseractResult && openaiResult) {
      const hybridData = this.mergeResults(tesseractResult, openaiResult);
      return {
        data: hybridData,
        confidence: this.calculateHybridConfidence(tesseractResult, openaiResult),
        method: 'hybrid'
      };
    }

    // 둘 다 없는 경우
    return {
      data: {},
      confidence: 0,
      method: 'hybrid'
    };
  }

  private extractDataFromTesseract(result: OCRResult): BusinessCardData {
    const text = result.text;
    const data: BusinessCardData = {};

    // 간단한 패턴 매칭으로 정보 추출
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      data.email = emailMatch[0];
    }

    const phoneMatch = text.match(/[\+]?[\d\-\(\)\s]{10,}/);
    if (phoneMatch) {
      data.phone = phoneMatch[0].trim();
    }

    const websiteMatch = text.match(/(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (websiteMatch) {
      data.website = websiteMatch[0];
    }

    // 첫 번째 줄을 이름으로 추정 (간단한 휴리스틱)
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      if (firstLine.length < 50 && !firstLine.includes('@') && !firstLine.includes('www')) {
        data.name = firstLine;
      }
    }

    return data;
  }

  private mergeResults(
    tesseractResult: OCRResult,
    openaiResult: BusinessCardData
  ): BusinessCardData {
    const merged: BusinessCardData = { ...openaiResult };

    // Tesseract에서 추출한 텍스트로 OpenAI 결과 보완
    const tesseractData = this.extractDataFromTesseract(tesseractResult);

    // 이메일이 없으면 Tesseract 결과 사용
    if (!merged.email && tesseractData.email) {
      merged.email = tesseractData.email;
    }

    // 전화번호가 없으면 Tesseract 결과 사용
    if (!merged.phone && tesseractData.phone) {
      merged.phone = tesseractData.phone;
    }

    // 웹사이트가 없으면 Tesseract 결과 사용
    if (!merged.website && tesseractData.website) {
      merged.website = tesseractData.website;
    }

    return merged;
  }

  private calculateOpenAIConfidence(result: BusinessCardData): number {
    let score = 0;
    let fields = 0;

    if (result.name) { score += 0.2; fields++; }
    if (result.title) { score += 0.15; fields++; }
    if (result.company) { score += 0.15; fields++; }
    if (result.email) { score += 0.2; fields++; }
    if (result.phone) { score += 0.2; fields++; }
    if (result.website) { score += 0.1; fields++; }



    return fields > 0 ? Math.min(score, 1.0) : 0;
  }

  private calculateHybridConfidence(
    tesseractResult: OCRResult,
    openaiResult: BusinessCardData
  ): number {
    const tesseractConf = tesseractResult.confidence / 100;
    const openaiConf = this.calculateOpenAIConfidence(openaiResult);
    
    // 가중 평균 (OpenAI에 더 높은 가중치)
    return (tesseractConf * 0.3) + (openaiConf * 0.7);
  }

  async cleanup() {
    await cleanupTesseract();
  }
}

// 편의 함수들
export async function processBusinessCardOCR(
  imageFile: File,
  imageUrl?: string,
  options?: OCRProcessingOptions
): Promise<OCRProcessingResult> {
  const processor = new OCRProcessor(options);
  try {
    return await processor.processBusinessCard(imageFile, imageUrl);
  } finally {
    await processor.cleanup();
  }
}

export function isOCREnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_OCR === 'true';
}

export function isOpenAIEnabled(): boolean {
  return !!process.env.OPENAI_API_KEY && process.env.NEXT_PUBLIC_ENABLE_OCR === 'true';
}
