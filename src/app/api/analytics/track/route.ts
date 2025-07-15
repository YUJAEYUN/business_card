import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessCardId, eventType, eventData } = body;

    if (!businessCardId || !eventType) {
      return NextResponse.json(
        { error: 'Business card ID and event type are required' },
        { status: 400 }
      );
    }

    // IP 및 위치 정보 수집
    const ip = request.ip || 
      request.headers.get('x-forwarded-for') || 
      request.headers.get('x-real-ip') ||
      'unknown';
    
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referrer = request.headers.get('referer') || null;

    // 국가/도시 정보는 나중에 geoip-lite 등으로 추가 가능
    let country = null;
    let city = null;

    // 간단한 지역 감지 (선택사항)
    try {
      // geoip-lite를 사용한 위치 감지 (패키지가 설치되어 있다면)
      // const geoip = require('geoip-lite');
      // const geo = geoip.lookup(ip);
      // if (geo) {
      //   country = geo.country;
      //   city = geo.city;
      // }
    } catch (error) {
      // 지역 감지 실패는 무시
    }

    // 분석 데이터 저장
    const { error: analyticsError } = await supabaseAdmin
      .from('business_card_analytics')
      .insert({
        business_card_id: businessCardId,
        event_type: eventType,
        event_data: eventData || null,
        ip_address: ip,
        user_agent: userAgent,
        referrer: referrer,
        country: country,
        city: city
      });

    if (analyticsError) {
      console.error('Failed to save analytics:', analyticsError);
      return NextResponse.json(
        { error: 'Failed to save analytics data' },
        { status: 500 }
      );
    }

    // 특정 이벤트에 대한 추가 처리
    if (eventType === 'view') {
      // 조회수 증가 - 현재 값을 가져와서 +1
      const { data: currentCard } = await supabaseAdmin
        .from('business_cards')
        .select('view_count')
        .eq('id', businessCardId)
        .single();

      const newViewCount = (currentCard?.view_count || 0) + 1;

      await supabaseAdmin
        .from('business_cards')
        .update({ view_count: newViewCount })
        .eq('id', businessCardId);
    } else if (eventType === 'zone_click') {
      // 클릭된 존의 클릭 수 증가
      if (eventData?.zoneId) {
        // 클릭 수 증가 - 현재 값을 가져와서 +1
        const { data: currentZone } = await supabaseAdmin
          .from('interactive_zones')
          .select('click_count')
          .eq('id', eventData.zoneId)
          .single();

        const newClickCount = (currentZone?.click_count || 0) + 1;

        await supabaseAdmin
          .from('interactive_zones')
          .update({ click_count: newClickCount })
          .eq('id', eventData.zoneId);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Analytics data saved successfully'
    });

  } catch (error) {
    console.error('Analytics tracking failed:', error);
    return NextResponse.json(
      { error: 'Failed to track analytics' },
      { status: 500 }
    );
  }
}

// 분석 데이터 조회 (명함 소유자용)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessCardId = searchParams.get('businessCardId');
    const eventType = searchParams.get('eventType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!businessCardId) {
      return NextResponse.json(
        { error: 'Business card ID is required' },
        { status: 400 }
      );
    }

    // 기본 쿼리 구성
    let query = supabaseAdmin
      .from('business_card_analytics')
      .select('*')
      .eq('business_card_id', businessCardId)
      .order('created_at', { ascending: false })
      .limit(limit);

    // 이벤트 타입 필터
    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    // 날짜 범위 필터
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: analytics, error } = await query;

    if (error) {
      console.error('Failed to fetch analytics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch analytics data' },
        { status: 500 }
      );
    }

    // 통계 요약 생성
    const summary = {
      totalEvents: analytics?.length || 0,
      eventTypes: {} as Record<string, number>,
      recentActivity: analytics?.slice(0, 10) || []
    };

    analytics?.forEach(event => {
      summary.eventTypes[event.event_type] = (summary.eventTypes[event.event_type] || 0) + 1;
    });

    return NextResponse.json({
      analytics: analytics || [],
      summary
    });

  } catch (error) {
    console.error('Analytics fetch failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
