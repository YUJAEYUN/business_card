// Tesseract.js OCR 처리

import { createWorker } from 'tesseract.js';
import { OCRResult, OCRProcessingOptions } from './types';

export class TesseractOCR {
  private worker: Tesseract.Worker | null = null;
  private isInitialized = false;

  async initialize(options: OCRProcessingOptions = {}) {
    if (this.isInitialized) return;

    const languages = options.language || ['eng', 'kor', 'jpn'];
    
    try {
      this.worker = await createWorker(languages, 1, {
        logger: (m) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[Tesseract]', m);
          }
        },
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
        corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@v5.0.0',
        workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@v5.0.0/dist/worker.min.js',
      });

      // OCR 정확도 향상을 위한 파라미터 설정
      await this.worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@.-+()[]{}|\\/:;,!?\'\"#$%&*<>=~`^_',
        tessedit_pageseg_mode: 6, // Uniform block of text
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Tesseract worker:', error);
      throw error;
    }
  }

  async extractText(imageFile: File | string): Promise<OCRResult> {
    if (!this.worker) {
      await this.initialize();
    }

    if (!this.worker) {
      throw new Error('Failed to initialize Tesseract worker');
    }

    try {
      const startTime = Date.now();
      const { data } = await this.worker.recognize(imageFile);
      const processingTime = Date.now() - startTime;

      console.log(`[Tesseract] Processing completed in ${processingTime}ms`);

      return {
        text: data.text.trim(),
        confidence: data.confidence,
        words: data.words.map(word => ({
          text: word.text,
          confidence: word.confidence,
          bbox: word.bbox
        })),
        language: data.text.length > 0 ? this.detectLanguage(data.text) : undefined
      };
    } catch (error) {
      console.error('Tesseract OCR failed:', error);
      throw error;
    }
  }

  private detectLanguage(text: string): string {
    // 간단한 언어 감지 로직
    const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
    const japaneseRegex = /[ひらがなカタカナ一-龯]/;
    
    if (koreanRegex.test(text)) return 'kor';
    if (japaneseRegex.test(text)) return 'jpn';
    return 'eng';
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }

  // 이미지 전처리 (선택사항)
  async preprocessImage(imageFile: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // 이미지 그리기
        ctx.drawImage(img, 0, 0);

        // 대비 및 밝기 조정
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          // 그레이스케일 변환
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          
          // 대비 증가
          const contrast = 1.5;
          const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
          const newGray = factor * (gray - 128) + 128;
          
          data[i] = newGray;     // R
          data[i + 1] = newGray; // G
          data[i + 2] = newGray; // B
          // Alpha는 그대로 유지
        }

        ctx.putImageData(imageData, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const processedFile = new File([blob], imageFile.name, {
              type: 'image/png',
              lastModified: Date.now()
            });
            resolve(processedFile);
          } else {
            reject(new Error('Failed to process image'));
          }
        }, 'image/png');
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(imageFile);
    });
  }
}

// 싱글톤 인스턴스
let tesseractInstance: TesseractOCR | null = null;

export function getTesseractInstance(): TesseractOCR {
  if (!tesseractInstance) {
    tesseractInstance = new TesseractOCR();
  }
  return tesseractInstance;
}

export async function cleanupTesseract() {
  if (tesseractInstance) {
    await tesseractInstance.terminate();
    tesseractInstance = null;
  }
}
