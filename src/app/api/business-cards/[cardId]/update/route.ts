import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface UpdateCardParams {
  params: {
    cardId: string;
  };
}

export async function PUT(
  request: NextRequest,
  { params }: UpdateCardParams
) {
  try {
    const resolvedParams = await params;
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify card ownership
    const { data: card } = await supabaseAdmin
      .from('business_cards')
      .select('*')
      .eq('id', resolvedParams.cardId)
      .eq('user_id', profile.id)
      .single();

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found or access denied' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      title,
      frontImageUrl,
      backImageUrl,
      cardType,
      changeDescription,
      extractedData
    } = body;

    // Validate required fields
    if (!frontImageUrl) {
      return NextResponse.json(
        { error: 'Front image URL is required' },
        { status: 400 }
      );
    }

    // Create new version using the database function
    const { data: versionResult, error: versionError } = await supabaseAdmin
      .rpc('create_business_card_version', {
        card_id: resolvedParams.cardId,
        new_front_image_url: frontImageUrl,
        new_back_image_url: backImageUrl,
        new_card_type: cardType || card.card_type,
        change_desc: changeDescription || 'Image updated'
      });

    if (versionError) {
      console.error('Error creating version:', versionError);
      return NextResponse.json(
        { error: 'Failed to create new version' },
        { status: 500 }
      );
    }

    // Update title if provided
    if (title && title !== card.title) {
      const { error: titleError } = await supabaseAdmin
        .from('business_cards')
        .update({ title: title.trim() })
        .eq('id', resolvedParams.cardId);

      if (titleError) {
        console.error('Error updating title:', titleError);
      }
    }

    // Update extracted data if provided
    if (extractedData) {
      const { error: extractedDataError } = await supabaseAdmin
        .from('business_card_ocr_data')
        .upsert({
          business_card_id: resolvedParams.cardId,
          extracted_text: extractedData.extracted_text || '',
          confidence_score: extractedData.confidence_score || 0.9,
          language_detected: extractedData.language_detected || 'eng',
          extraction_method: 'openai',
          raw_data: extractedData, // 전체 추출된 데이터를 JSONB로 저장
          qr_code_url: extractedData.qr_code_url || null,
          updated_at: new Date().toISOString()
        });

      if (extractedDataError) {
        console.error('Error updating extracted data:', extractedDataError);
      }
    }

    // Get updated card data
    const { data: updatedCard } = await supabaseAdmin
      .from('business_cards')
      .select('*')
      .eq('id', resolvedParams.cardId)
      .single();

    return NextResponse.json({
      success: true,
      card: updatedCard,
      versionId: versionResult,
      message: 'Business card updated successfully'
    });

  } catch (error) {
    console.error('Error updating business card:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get card versions
export async function GET(
  request: NextRequest,
  { params }: UpdateCardParams
) {
  try {
    const resolvedParams = await params;
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify card ownership
    const { data: card } = await supabaseAdmin
      .from('business_cards')
      .select('id, user_id')
      .eq('id', resolvedParams.cardId)
      .eq('user_id', profile.id)
      .single();

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found or access denied' },
        { status: 404 }
      );
    }

    // Get all versions
    const { data: versions, error } = await supabaseAdmin
      .from('business_card_versions')
      .select('*')
      .eq('business_card_id', resolvedParams.cardId)
      .order('version_number', { ascending: false });

    if (error) {
      console.error('Error fetching versions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch versions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      versions: versions || []
    });

  } catch (error) {
    console.error('Error fetching card versions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
