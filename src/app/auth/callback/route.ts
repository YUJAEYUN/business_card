import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('OAuth Callback Debug:', {
    code: code ? 'present' : 'missing',
    searchParams: Object.fromEntries(searchParams.entries()),
    origin,
    next,
    headers: {
      'x-forwarded-host': request.headers.get('x-forwarded-host'),
      'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
      'host': request.headers.get('host')
    }
  })

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    console.log('Code exchange result:', { error })

    if (!error) {
      // Vercel에서는 간단하게 origin 사용
      const redirectUrl = `${origin}${next}`

      console.log('Redirecting to:', redirectUrl)
      return NextResponse.redirect(redirectUrl)
    } else {
      console.error('OAuth code exchange failed:', error)
    }
  }

  // return the user to an error page with instructions
  console.log('Redirecting to error page')
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
