// OCR 관련 타입 정의

export interface OCRWord {
  text: string;
  confidence: number;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
}

export interface OCRResult {
  text: string;
  confidence: number;
  words: OCRWord[];
  language?: string;
}

export interface BusinessCardData {
  // 개별 필드들 (UI 표시용)
  name?: string;
  title?: string;
  company?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  qr_code_url?: string;
  social?: {
    platform: string;
    handle: string;
  }[];

  // 데이터베이스 스키마와 일치하는 필드들
  extracted_text?: string;
  confidence_score?: number;
  language_detected?: string;
}

export interface OCRProcessingOptions {
  language?: string[];
  enableOpenAI?: boolean;
  enableTesseract?: boolean;
  imagePreprocessing?: boolean;
}

export interface OCRProcessingResult {
  tesseractResult?: OCRResult;
  openaiResult?: BusinessCardData;
  finalResult: BusinessCardData;
  confidence: number;
  processingTime: number;
  method: 'tesseract' | 'openai' | 'hybrid';
}
