import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

// Google ID 토큰 검증을 위한 함수
async function verifyGoogleToken(token: string) {
  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`)
    
    if (!response.ok) {
      throw new Error('Invalid token')
    }
    
    const payload = await response.json()
    
    // 토큰이 우리 앱을 위한 것인지 확인
    const clientId = process.env.AUTH_GOOGLE_ID
    if (payload.aud !== clientId) {
      throw new Error('Token audience mismatch')
    }
    
    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      sub: payload.sub, // Google user ID
    }
  } catch (error) {
    console.error('Token verification failed:', error)
    throw new Error('Token verification failed')
  }
}

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json()
    
    if (!credential) {
      return NextResponse.json(
        { success: false, error: 'No credential provided' },
        { status: 400 }
      )
    }

    // Google ID 토큰 검증
    const userInfo = await verifyGoogleToken(credential)
    
    // Supabase에 사용자 프로필 생성/업데이트
    const supabase = await createClient()
    
    // 기존 프로필 확인
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userInfo.email)
      .single()

    let userId: string

    if (!existingProfile) {
      // 새 프로필 생성
      userId = crypto.randomUUID()
      
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: userInfo.email,
          full_name: userInfo.name || null,
          avatar_url: userInfo.picture || null
        })

      if (createError) {
        console.error('Failed to create user profile:', createError)
        throw new Error('Failed to create user profile')
      }
    } else {
      userId = existingProfile.id
      
      // 기존 프로필 업데이트
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: userInfo.name || null,
          avatar_url: userInfo.picture || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Failed to update user profile:', updateError)
        // 업데이트 실패해도 로그인은 계속 진행
      }
    }

    // NextAuth 세션 생성을 위한 쿠키 설정
    // 이 부분은 NextAuth와의 호환성을 위해 필요할 수 있습니다
    const sessionToken = crypto.randomUUID()
    
    // 성공 응답
    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: userInfo.email,
        name: userInfo.name,
        image: userInfo.picture
      }
    })

  } catch (error) {
    console.error('Google One Tap authentication error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      },
      { status: 500 }
    )
  }
}
