import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { locales } from './i18n'

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/create']

// Create the internationalization middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'ko',
  localePrefix: 'as-needed'
})

export async function middleware(request: NextRequest) {
  // First, handle internationalization
  const response = intlMiddleware(request)
  
  // Get the pathname without locale prefix
  const pathname = request.nextUrl.pathname
  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/'
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathnameWithoutLocale.startsWith(route)
  )
  
  if (isProtectedRoute) {
    // Create a Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            // We can't set cookies in middleware, but we can read them
          },
          remove(name: string, options: any) {
            // We can't remove cookies in middleware, but we can read them
          },
        },
      }
    )

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      // Redirect to home page if not authenticated
      const locale = pathname.match(/^\/([a-z]{2})(?=\/|$)/)?.[1] || 'ko'
      const redirectUrl = new URL(`/${locale}`, request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }
  
  return response
}

export const config = {
  // Match only internationalized pathnames and protected routes
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',
    
    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(ko|ja|en)/:path*',
    
    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!_next|_vercel|.*\\..*).*)'
  ]
}
