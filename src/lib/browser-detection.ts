/**
 * 인앱 브라우저 감지 및 처리 유틸리티
 */

export interface BrowserInfo {
  isInApp: boolean
  platform: 'kakao' | 'naver' | 'facebook' | 'instagram' | 'line' | 'other' | 'normal'
  userAgent: string
}

/**
 * 현재 브라우저가 인앱 브라우저인지 감지
 */
export function detectBrowser(): BrowserInfo {
  if (typeof window === 'undefined') {
    return {
      isInApp: false,
      platform: 'normal',
      userAgent: ''
    }
  }

  const userAgent = window.navigator.userAgent.toLowerCase()

  // 카카오톡 인앱 브라우저
  if (userAgent.includes('kakaotalk')) {
    return {
      isInApp: true,
      platform: 'kakao',
      userAgent
    }
  }

  // 네이버 앱 인앱 브라우저
  if (userAgent.includes('naver') || userAgent.includes('whale')) {
    return {
      isInApp: true,
      platform: 'naver',
      userAgent
    }
  }

  // 페이스북 인앱 브라우저
  if (userAgent.includes('fban') || userAgent.includes('fbav')) {
    return {
      isInApp: true,
      platform: 'facebook',
      userAgent
    }
  }

  // 인스타그램 인앱 브라우저
  if (userAgent.includes('instagram')) {
    return {
      isInApp: true,
      platform: 'instagram',
      userAgent
    }
  }

  // 라인 인앱 브라우저
  if (userAgent.includes('line')) {
    return {
      isInApp: true,
      platform: 'line',
      userAgent
    }
  }

  // 일반 브라우저 (Chrome, Safari, Firefox 등)는 인앱브라우저가 아님
  return {
    isInApp: false,
    platform: 'normal',
    userAgent
  }
}

/**
 * 크롬 브라우저로 직접 열기
 */
export function openInChrome(url: string = window.location.href): void {
  const userAgent = navigator.userAgent.toLowerCase()

  // iOS 기기인지 확인
  const isIOS = /iphone|ipad|ipod/.test(userAgent)
  // Android 기기인지 확인
  const isAndroid = /android/.test(userAgent)

  if (isIOS) {
    // iOS에서 Chrome으로 열기
    const chromeUrl = url.replace(/^https?:\/\//, 'googlechrome://')
    window.location.href = chromeUrl

    // Chrome이 설치되지 않은 경우를 대비해 Safari로 폴백
    setTimeout(() => {
      window.location.href = url
    }, 1000)
  } else if (isAndroid) {
    // Android에서 Chrome으로 열기
    const intent = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`
    window.location.href = intent

    // Chrome이 설치되지 않은 경우를 대비해 기본 브라우저로 폴백
    setTimeout(() => {
      window.location.href = url
    }, 1000)
  } else {
    // 데스크톱이나 기타 플랫폼에서는 그냥 현재 URL로 이동
    window.location.href = url
  }
}

/**
 * 외부 브라우저로 열기 URL 생성 (레거시)
 */
export function getExternalBrowserUrl(currentUrl: string, platform: BrowserInfo['platform']): string {
  const encodedUrl = encodeURIComponent(currentUrl)

  switch (platform) {
    case 'kakao':
      // 카카오톡에서 외부 브라우저로 열기
      return `kakaotalk://web/openExternal?url=${encodedUrl}`

    case 'naver':
      // 네이버에서 외부 브라우저로 열기
      return `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.android.chrome;end`

    default:
      // 기본적으로 현재 URL 반환
      return currentUrl
  }
}

/**
 * 플랫폼별 안내 메시지
 */
export function getInAppBrowserMessage(platform: BrowserInfo['platform'], language: 'ko' | 'en' | 'ja' = 'ko'): string {
  const messages = {
    ko: {
      kakao: '카카오톡 인앱 브라우저에서는 Google 로그인이 제한됩니다.\n우측 상단 메뉴(⋯)를 눌러 "다른 브라우저에서 열기"를 선택해주세요.',
      naver: '네이버 앱에서는 Google 로그인이 제한됩니다.\n외부 브라우저에서 열어주세요.',
      facebook: '페이스북 앱에서는 Google 로그인이 제한됩니다.\n외부 브라우저에서 열어주세요.',
      instagram: '인스타그램 앱에서는 Google 로그인이 제한됩니다.\n외부 브라우저에서 열어주세요.',
      line: '라인 앱에서는 Google 로그인이 제한됩니다.\n외부 브라우저에서 열어주세요.',
      other: '현재 앱에서는 Google 로그인이 제한될 수 있습니다.\n외부 브라우저에서 열어주세요.',
      normal: ''
    },
    en: {
      kakao: 'Google login is restricted in KakaoTalk in-app browser.\nPlease tap the menu (⋯) and select "Open in external browser".',
      naver: 'Google login is restricted in Naver app.\nPlease open in external browser.',
      facebook: 'Google login is restricted in Facebook app.\nPlease open in external browser.',
      instagram: 'Google login is restricted in Instagram app.\nPlease open in external browser.',
      line: 'Google login is restricted in Line app.\nPlease open in external browser.',
      other: 'Google login may be restricted in this app.\nPlease open in external browser.',
      normal: ''
    },
    ja: {
      kakao: 'カカオトークのアプリ内ブラウザではGoogleログインが制限されています。\n右上のメニュー(⋯)から「外部ブラウザで開く」を選択してください。',
      naver: 'ネイバーアプリではGoogleログインが制限されています。\n外部ブラウザで開いてください。',
      facebook: 'Facebookアプリではグーグルログインが制限されています。\n外部ブラウザで開いてください。',
      instagram: 'InstagramアプリではGoogleログインが制限されています。\n外部ブラウザで開いてください。',
      line: 'LINEアプリではGoogleログインが制限されています。\n外部ブラウザで開いてください。',
      other: 'このアプリではGoogleログインが制限される場合があります。\n外部ブラウザで開いてください。',
      normal: ''
    }
  }

  return messages[language][platform] || messages[language].other
}
