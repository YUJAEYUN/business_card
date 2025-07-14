import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

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
    async session({ session, token }) {
      // 세션에 사용자 정보 추가
      if (token?.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, account, profile }) {
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
