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
      const forwardedHost = request.headers.get('x-forwarded-host')
      const forwardedProto = request.headers.get('x-forwarded-proto')
      const host = request.headers.get('host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      // Determine the correct redirect URL
      let redirectUrl: string

      if (isLocalEnv) {
        // Local development - use origin as is
        redirectUrl = `${origin}${next}`
      } else if (forwardedHost && forwardedProto) {
        // Production with proper forwarded headers
        redirectUrl = `${forwardedProto}://${forwardedHost}${next}`
      } else if (forwardedHost) {
        // Production with forwarded host but no proto (assume https)
        redirectUrl = `https://${forwardedHost}${next}`
      } else if (host) {
        // Fallback to host header
        redirectUrl = `https://${host}${next}`
      } else {
        // Final fallback to origin
        redirectUrl = `${origin}${next}`
      }

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
