import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 명함 목록 조회
export async function GET(request: NextRequest) {
  try {
    // NextAuth 세션 확인
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 사용자 프로필 조회
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!profile) {
      // 프로필이 없으면 자동 생성
      const userId = crypto.randomUUID();

      const { error: createError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          email: session.user.email,
          full_name: session.user.name || null,
          avatar_url: session.user.image || null
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Profile creation error:', createError);
        return NextResponse.json(
          { error: 'Failed to create user profile' },
          { status: 500 }
        );
      }

      // 새로 생성된 프로필로 빈 명함 목록 반환
      return NextResponse.json([], { status: 200 });
    }

    // 명함 목록 조회
    const { data: cards, error } = await supabaseAdmin
      .from('business_cards')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching business cards:', error);
      return NextResponse.json(
        { error: 'Failed to fetch business cards' },
        { status: 500 }
      );
    }

    return NextResponse.json(cards || [], { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/business-cards:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 명함 생성
export async function POST(request: NextRequest) {
  try {
    // NextAuth 세션 확인
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Business card creation request body:', body);

    const {
      title,
      frontImageUrl,
      backImageUrl,
      cardType,
      ocrData,
      customSlug
    } = body;

    console.log('Extracted fields:', { title, frontImageUrl, backImageUrl, cardType, ocrData, customSlug });

    if (!title || !frontImageUrl) {
      console.log('Validation failed - missing required fields:', { title: !!title, frontImageUrl: !!frontImageUrl });
      return NextResponse.json(
        { error: 'Title and front image URL are required' },
        { status: 400 }
      );
    }

    // 사용자 프로필 조회 또는 생성
    let { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!profile) {
      // 프로필이 없으면 생성
      const userId = crypto.randomUUID();

      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          email: session.user.email,
          full_name: session.user.name || null,
          avatar_url: session.user.image || null
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Profile creation error:', createError);
        return NextResponse.json(
          { error: 'Failed to create user profile' },
          { status: 500 }
        );
      }

      profile = newProfile;
    }

    // 명함 생성
    const cardId = crypto.randomUUID();

    const { data: card, error: cardError } = await supabaseAdmin
      .from('business_cards')
      .insert({
        id: cardId,
        user_id: profile.id,
        title: title.trim(),
        front_image_url: frontImageUrl,
        back_image_url: backImageUrl,
        card_type: cardType,
      })
      .select()
      .single();

    if (cardError) {
      console.error('Card creation error:', cardError);
      return NextResponse.json(
        { error: 'Failed to create business card' },
        { status: 500 }
      );
    }

    // Save custom slug if provided
    if (customSlug && customSlug.trim()) {
      const { error: slugError } = await supabaseAdmin
        .from('custom_slugs')
        .insert({
          business_card_id: cardId,
          slug: customSlug.trim().toLowerCase(),
          is_active: true
        });

      if (slugError) {
        console.error('Slug creation error:', slugError);
        // Don't fail the card creation if slug fails, just warn
        console.warn('Failed to save custom slug, but card was created successfully');
      }
    }

    if (ocrData) {
      const zonesToInsert = [];

      if (ocrData.phone) {
        zonesToInsert.push({
          id: crypto.randomUUID(),
          business_card_id: cardId,
          zone_type: 'phone',
          zone_data: {
            value: ocrData.phone,
            action: `tel:${ocrData.phone.replace(/[^\d+]/g, '')}`
          },
          coordinates: {
            x: 0, y: 0, width: 0, height: 0, side: 'front'
          },
          is_active: true
        });
      }

      if (ocrData.email) {
        zonesToInsert.push({
          id: crypto.randomUUID(),
          business_card_id: cardId,
          zone_type: 'email',
          zone_data: {
            value: ocrData.email,
            action: `mailto:${ocrData.email}`
          },
          coordinates: {
            x: 0, y: 0, width: 0, height: 0, side: 'front'
          },
          is_active: true
        });
      }

      if (ocrData.website) {
        const websiteUrl = ocrData.website.startsWith('http') ? ocrData.website : `https://${ocrData.website}`;
        zonesToInsert.push({
          id: crypto.randomUUID(),
          business_card_id: cardId,
          zone_type: 'website',
          zone_data: {
            value: ocrData.website,
            action: websiteUrl
          },
          coordinates: {
            x: 0, y: 0, width: 0, height: 0, side: 'front'
          },
          is_active: true
        });
      }

      if (zonesToInsert.length > 0) {
        const { error: zonesError } = await supabaseAdmin
          .from('interactive_zones')
          .insert(zonesToInsert);

        if (zonesError) {
          console.error('OCR zones creation error:', zonesError);
          console.warn('Failed to save OCR data as interactive zones, but card was created successfully');
        }
      }
    }

    return NextResponse.json({
      success: true,
      card: card,
      message: 'Business card created successfully'
    });

  } catch (error) {
    console.error('Business card creation failed:', error);
    return NextResponse.json(
      {
        error: 'Failed to create business card',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


