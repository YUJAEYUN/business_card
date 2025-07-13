import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

// Can be imported from a shared config
export const locales = ['ko', 'ja', 'en'] as const
export type Locale = typeof locales[number]

export default getRequestConfig(async () => {
  // Get locale from cookie or use default
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'ko'

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  }
})
