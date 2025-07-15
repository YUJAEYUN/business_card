import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { createClient } from '@supabase/supabase-js';
import { processBusinessCardOCR, isOCREnabled } from '@/lib/ocr/processor';
import { detectQRCode, detectQRCodeFromUrl } from '@/lib/qr-detector';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // OCR 기능이 활성화되어 있는지 확인
    if (!isOCREnabled()) {
      return NextResponse.json(
        { error: 'OCR feature is not enabled' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const businessCardId = formData.get('businessCardId') as string;
    const imageUrl = formData.get('imageUrl') as string;

    if (!imageFile || !businessCardId) {
      return NextResponse.json(
        { error: 'Image file and business card ID are required' },
        { status: 400 }
      );
    }

    // NextAuth 세션 확인
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 사용자 프로필 조회
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // OCR 처리는 데이터베이스에 임시 레코드를 생성하지 않고 순수하게 이미지 처리만 수행

    // QR 코드 감지 시도
    let qrCodeUrl = null;
    try {
      if (imageFile) {
        qrCodeUrl = await detectQRCode(imageFile);
      } else if (imageUrl) {
        qrCodeUrl = await detectQRCodeFromUrl(imageUrl);
      }

      if (qrCodeUrl) {
        console.log('QR Code URL detected:', qrCodeUrl);
      }
    } catch (qrError) {
      console.warn('QR code detection failed:', qrError);
    }

    // OCR 처리 실행
    const ocrResult = await processBusinessCardOCR(
      imageFile,
      imageUrl,
      {
        enableTesseract: true,
        enableOpenAI: !!process.env.OPENAI_API_KEY,
        imagePreprocessing: true,
        language: ['eng', 'kor', 'jpn']
      }
    );

    // QR 코드 URL을 OCR 결과에 추가
    if (qrCodeUrl) {
      ocrResult.finalResult.qr_code_url = qrCodeUrl;
    }

    // OCR 처리 결과를 바로 반환 (데이터베이스에 저장하지 않음)



    return NextResponse.json({
      success: true,
      data: ocrResult.finalResult,
      confidence: ocrResult.confidence,
      method: ocrResult.method,
      processing_time: ocrResult.processingTime
    });

  } catch (error) {
    console.error('OCR extraction failed:', error);
    return NextResponse.json(
      { 
        error: 'OCR processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
