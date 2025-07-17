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

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

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

    if (qrCodeUrl) {
      ocrResult.finalResult.qr_code_url = qrCodeUrl;
    }

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
