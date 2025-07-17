import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 명함 지갑 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const tag = searchParams.get('tag') || '';
    const favorite = searchParams.get('favorite') === 'true';
    const sortBy = searchParams.get('sortBy') || 'saved_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Check authentication
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
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // 쿼리 빌더 시작
    let query = supabaseAdmin
      .from('business_card_wallet')
      .select(`
        *,
        business_cards (
          id,
          title,
          front_image_url,
          back_image_url,
          card_type,
          custom_slug,
          view_count,
          created_at,
          profiles (
            full_name,
            email
          )
        )
      `)
      .eq('user_id', profile.id);

    // 검색 필터
    if (search) {
      query = query.or(`
        nickname.ilike.%${search}%,
        notes.ilike.%${search}%,
        business_cards.title.ilike.%${search}%
      `);
    }

    // 태그 필터
    if (tag) {
      query = query.contains('tags', [tag]);
    }

    // 즐겨찾기 필터
    if (favorite) {
      query = query.eq('is_favorite', true);
    }

    // 정렬
    const validSortFields = ['saved_at', 'updated_at', 'nickname'];
    const validSortOrders = ['asc', 'desc'];
    
    if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder)) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    }

    // 페이지네이션
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: walletItems, error, count } = await query;

    if (error) {
      console.error('Failed to fetch wallet items:', error);
      return NextResponse.json(
        { error: 'Failed to fetch wallet items' },
        { status: 500 }
      );
    }

    // 전체 개수 조회 (페이지네이션용)
    const { count: totalCount } = await supabaseAdmin
      .from('business_card_wallet')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id);

    return NextResponse.json({
      items: walletItems || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Wallet fetch failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet' },
      { status: 500 }
    );
  }
}

// 명함을 지갑에 저장
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      business_card_id, 
      nickname, 
      tags = [], 
      is_favorite = false, 
      notes = '',
      source = 'manual'
    } = body;

    if (!business_card_id) {
      return NextResponse.json(
        { error: 'Business card ID is required' },
        { status: 400 }
      );
    }

    // Check authentication
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

    // 명함 존재 확인
    const { data: card, error: cardError } = await supabaseAdmin
      .from('business_cards')
      .select('id, user_id, title')
      .eq('id', business_card_id)
      .single();

    if (cardError || !card) {
      return NextResponse.json(
        { error: 'Business card not found' },
        { status: 404 }
      );
    }

    // 자신의 명함인지 확인
    if (card.user_id === profile.id) {
      return NextResponse.json(
        { error: 'Cannot save your own business card to wallet' },
        { status: 400 }
      );
    }

    // 이미 저장되어 있는지 확인
    const { data: existing } = await supabaseAdmin
      .from('business_card_wallet')
      .select('id')
      .eq('user_id', profile.id)
      .eq('business_card_id', business_card_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Business card already saved in wallet' },
        { status: 409 }
      );
    }

    // 지갑에 저장
    const { data: walletItem, error: saveError } = await supabaseAdmin
      .from('business_card_wallet')
      .insert({
        user_id: profile.id,
        business_card_id,
        nickname: nickname || card.title,
        tags: Array.isArray(tags) ? tags : [],
        is_favorite,
        notes
      })
      .select(`
        *,
        business_cards (
          id,
          title,
          front_image_url,
          back_image_url,
          card_type,
          custom_slug,
          profiles (
            full_name,
            email
          )
        )
      `)
      .single();

    if (saveError) {
      console.error('Failed to save to wallet:', saveError);
      return NextResponse.json(
        { error: 'Failed to save business card to wallet' },
        { status: 500 }
      );
    }

    // 분석 데이터 기록
    await supabaseAdmin
      .from('business_card_analytics')
      .insert({
        business_card_id,
        event_type: 'wallet_save',
        event_data: { source, manual: source === 'manual' }
      });

    return NextResponse.json({
      success: true,
      data: walletItem
    });

  } catch (error) {
    console.error('Wallet save failed:', error);
    return NextResponse.json(
      { error: 'Failed to save to wallet' },
      { status: 500 }
    );
  }
}

// 지갑 아이템 업데이트
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      wallet_item_id,
      nickname,
      tags,
      is_favorite,
      notes
    } = body;

    if (!wallet_item_id) {
      return NextResponse.json(
        { error: 'Wallet item ID is required' },
        { status: 400 }
      );
    }

    // Check authentication
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
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // 업데이트할 데이터 준비
    const updateData: any = {};
    if (nickname !== undefined) updateData.nickname = nickname;
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
    if (is_favorite !== undefined) updateData.is_favorite = is_favorite;
    if (notes !== undefined) updateData.notes = notes;

    // 지갑 아이템 업데이트
    const { data: updatedItem, error } = await supabaseAdmin
      .from('business_card_wallet')
      .update(updateData)
      .eq('id', wallet_item_id)
      .eq('user_id', profile.id)
      .select(`
        *,
        business_cards (
          id,
          title,
          front_image_url,
          back_image_url,
          card_type,
          custom_slug,
          profiles (
            full_name,
            email
          )
        )
      `)
      .single();

    if (error) {
      console.error('Failed to update wallet item:', error);
      return NextResponse.json(
        { error: 'Failed to update wallet item' },
        { status: 500 }
      );
    }

    if (!updatedItem) {
      return NextResponse.json(
        { error: 'Wallet item not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedItem
    });

  } catch (error) {
    console.error('Wallet update failed:', error);
    return NextResponse.json(
      { error: 'Failed to update wallet item' },
      { status: 500 }
    );
  }
}

// 지갑에서 명함 제거
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletItemId = searchParams.get('id');

    if (!walletItemId) {
      return NextResponse.json(
        { error: 'Wallet item ID is required' },
        { status: 400 }
      );
    }

    // Check authentication
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
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // 지갑 아이템 삭제
    const { error } = await supabaseAdmin
      .from('business_card_wallet')
      .delete()
      .eq('id', walletItemId)
      .eq('user_id', profile.id);

    if (error) {
      console.error('Failed to delete wallet item:', error);
      return NextResponse.json(
        { error: 'Failed to delete wallet item' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Business card removed from wallet'
    });

  } catch (error) {
    console.error('Wallet delete failed:', error);
    return NextResponse.json(
      { error: 'Failed to remove from wallet' },
      { status: 500 }
    );
  }
}
