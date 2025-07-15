import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { createClient } from '@supabase/supabase-js';
import { processBusinessCardOCR, isOCREnabled } from '@/lib/ocr/processor';

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

    // 명함 소유권 확인 (명함이 이미 존재하는 경우)
    const { data: card } = await supabaseAdmin
      .from('business_cards')
      .select('user_id')
      .eq('id', businessCardId)
      .single();

    // 명함이 존재하고 소유자가 다른 경우 접근 거부
    if (card && card.user_id !== profile.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // 명함이 존재하지 않는 경우, 임시로 생성 (OCR 처리용)
    if (!card) {
      console.log(`Creating temporary business card entry for OCR processing: ${businessCardId}`);
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

    // OCR 결과를 데이터베이스에 저장
    const { error: ocrSaveError } = await supabaseAdmin
      .from('business_card_ocr_data')
      .upsert({
        business_card_id: businessCardId,
        extracted_text: ocrResult.tesseractResult?.text || '',
        confidence_score: ocrResult.confidence,
        language_detected: ocrResult.tesseractResult?.language || 'eng',
        extraction_method: ocrResult.method,
        raw_data: {
          tesseract: ocrResult.tesseractResult,
          openai: ocrResult.openaiResult,
          processing_time: ocrResult.processingTime
        }
      }, {
        onConflict: 'business_card_id'
      });

    if (ocrSaveError) {
      console.error('Failed to save OCR data:', ocrSaveError);
      // OCR 처리는 성공했으므로 결과는 반환
    }

    // 클릭 가능한 영역이 있으면 저장
    if (ocrResult.finalResult.clickable_zones && ocrResult.finalResult.clickable_zones.length > 0) {
      const zones = ocrResult.finalResult.clickable_zones.map(zone => ({
        business_card_id: businessCardId,
        zone_type: zone.type,
        zone_data: zone.data,
        coordinates: zone.coordinates,
        is_active: true
      }));

      const { error: zonesError } = await supabaseAdmin
        .from('interactive_zones')
        .insert(zones);

      if (zonesError) {
        console.error('Failed to save interactive zones:', zonesError);
      }
    }

    return NextResponse.json({
      success: true,
      data: ocrResult.finalResult,
      confidence: ocrResult.confidence,
      method: ocrResult.method,
      processing_time: ocrResult.processingTime,
      zones_count: ocrResult.finalResult.clickable_zones?.length || 0
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessCardId = searchParams.get('businessCardId');

    if (!businessCardId) {
      return NextResponse.json(
        { error: 'Business card ID is required' },
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

    // OCR 데이터 조회
    const { data: ocrData, error } = await supabaseAdmin
      .from('business_card_ocr_data')
      .select(`
        *,
        business_cards!inner(user_id)
      `)
      .eq('business_card_id', businessCardId)
      .single();

    if (error || !ocrData) {
      return NextResponse.json(
        { error: 'OCR data not found' },
        { status: 404 }
      );
    }

    // 소유권 확인
    if (ocrData.business_cards.user_id !== profile.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // 클릭 가능한 영역도 함께 조회
    const { data: zones } = await supabaseAdmin
      .from('interactive_zones')
      .select('*')
      .eq('business_card_id', businessCardId)
      .eq('is_active', true);

    return NextResponse.json({
      ocr_data: {
        extracted_text: ocrData.extracted_text,
        confidence_score: ocrData.confidence_score,
        language_detected: ocrData.language_detected,
        extraction_method: ocrData.extraction_method,
        created_at: ocrData.created_at,
        updated_at: ocrData.updated_at
      },
      interactive_zones: zones || [],
      raw_data: ocrData.raw_data
    });

  } catch (error) {
    console.error('Failed to fetch OCR data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch OCR data' },
      { status: 500 }
    );
  }
}
