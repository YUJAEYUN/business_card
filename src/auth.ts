import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  pages: {
    signIn: '/',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Google OAuth 로그인 시 Supabase에 사용자 프로필 생성
      if (account?.provider === 'google' && user.email) {
        try {
          // 기존 프로필 확인
          const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('email', user.email)
            .single()

          // 프로필이 없으면 생성
          if (!existingProfile) {
            const userId = crypto.randomUUID()

            const { error: createError } = await supabaseAdmin
              .from('profiles')
              .insert({
                id: userId,
                email: user.email,
                full_name: user.name || null,
                avatar_url: user.image || null
              })

            if (createError) {
              console.error('Failed to create user profile:', createError)
              // 프로필 생성 실패해도 로그인은 허용
            } else {
              console.log('User profile created successfully:', user.email)
            }
          }
        } catch (error) {
          console.error('Error during sign in callback:', error)
          // 에러가 발생해도 로그인은 허용
        }
      }
      return true
    },
    async session({ session, token }) {
      // 세션에 사용자 정보 추가
      if (token?.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, account }) {
      // JWT 토큰에 사용자 정보 추가
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
      }
      return token
    },
    async redirect({ url, baseUrl }) {
      // 로그인 후 리다이렉트 처리
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard`
    }
  },
  session: {
    strategy: "jwt"
  },
  debug: process.env.NODE_ENV === "development",
}

export default NextAuth(authOptions)

// NextAuth.js 타입 확장
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
  }
}
