/**
 * 인앱 브라우저 감지 유틸리티
 */

export interface BrowserInfo {
  isInAppBrowser: boolean
  browserType: string | null
  canUseOAuth: boolean
}

export function detectBrowser(): BrowserInfo {
  if (typeof window === 'undefined') {
    return {
      isInAppBrowser: false,
      browserType: null,
      canUseOAuth: true
    }
  }

  const userAgent = navigator.userAgent || ''
  
  // 인앱 브라우저 감지
  const isKakaoTalk = /KAKAOTALK/i.test(userAgent)
  const isNaver = /NAVER/i.test(userAgent)
  const isFacebook = /FBAN|FBAV/i.test(userAgent)
  const isInstagram = /Instagram/i.test(userAgent)
  const isLine = /Line/i.test(userAgent)
  const isWeChat = /MicroMessenger/i.test(userAgent)
  const isWhatsApp = /WhatsApp/i.test(userAgent)
  
  let browserType: string | null = null
  let isInAppBrowser = false

  if (isKakaoTalk) {
    browserType = 'kakaotalk'
    isInAppBrowser = true
  } else if (isNaver) {
    browserType = 'naver'
    isInAppBrowser = true
  } else if (isFacebook) {
    browserType = 'facebook'
    isInAppBrowser = true
  } else if (isInstagram) {
    browserType = 'instagram'
    isInAppBrowser = true
  } else if (isLine) {
    browserType = 'line'
    isInAppBrowser = true
  } else if (isWeChat) {
    browserType = 'wechat'
    isInAppBrowser = true
  } else if (isWhatsApp) {
    browserType = 'whatsapp'
    isInAppBrowser = true
  }

  // OAuth 지원 여부 (대부분의 인앱 브라우저는 OAuth를 제한함)
  const canUseOAuth = !isInAppBrowser

  return {
    isInAppBrowser,
    browserType,
    canUseOAuth
  }
}

export function openInExternalBrowser(url?: string): void {
  const targetUrl = url || window.location.href
  const browserInfo = detectBrowser()

  switch (browserInfo.browserType) {
    case 'kakaotalk':
      // 카카오톡에서 외부 브라우저로 열기
      window.open(`kakaotalk://web/openExternal?url=${encodeURIComponent(targetUrl)}`, '_self')
      break
    
    case 'naver':
      // 네이버 앱에서 외부 브라우저로 열기
      window.open(`naversearchapp://inappbrowser?url=${encodeURIComponent(targetUrl)}&target=new`, '_self')
      break
    
    default:
      // 기본적으로 새 창에서 열기
      window.open(targetUrl, '_blank')
      break
  }
}

export function getBrowserMessage(browserType: string | null): string {
  switch (browserType) {
    case 'kakaotalk':
      return '카카오톡 인앱 브라우저에서는 Google 로그인이 제한됩니다.'
    case 'naver':
      return '네이버 앱 브라우저에서는 Google 로그인이 제한됩니다.'
    case 'facebook':
      return '페이스북 인앱 브라우저에서는 Google 로그인이 제한됩니다.'
    case 'instagram':
      return '인스타그램 인앱 브라우저에서는 Google 로그인이 제한됩니다.'
    case 'line':
      return '라인 인앱 브라우저에서는 Google 로그인이 제한됩니다.'
    case 'wechat':
      return '위챗 인앱 브라우저에서는 Google 로그인이 제한됩니다.'
    case 'whatsapp':
      return '왓츠앱 인앱 브라우저에서는 Google 로그인이 제한됩니다.'
    default:
      return '인앱 브라우저에서는 Google 로그인이 제한됩니다.'
  }
}
