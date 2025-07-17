import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', session.user.email)
      .single();

    // 모든 프로필 조회 (디버깅용)
    const { data: allProfiles, error: allProfilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .limit(10);

    return NextResponse.json({
      session: {
        user: session.user,
        expires: session.expires
      },
      profile: {
        data: profile,
        error: profileError
      },
      allProfiles: {
        data: allProfiles,
        error: allProfilesError,
        count: allProfiles?.length || 0
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { 
        error: 'Debug API failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
