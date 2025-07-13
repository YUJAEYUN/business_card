'use client'

import { useState, useEffect, useCallback } from 'react'

export type Locale = 'ko' | 'ja' | 'en'

const translations = {
  ko: {
    // Common
    loading: '로딩 중...',
    error: '오류가 발생했습니다',
    save: '저장',
    cancel: '취소',
    delete: '삭제',
    edit: '편집',
    create: '생성',
    back: '뒤로',
    next: '다음',
    previous: '이전',
    close: '닫기',
    confirm: '확인',
    optional: '선택사항',

    // Auth
    signIn: '로그인',
    signOut: '로그아웃',
    signUp: '회원가입',
    signInWithGoogle: 'Google로 로그인',
    welcomeBack: '다시 오신 것을 환영합니다!',
    signInToAccount: '계정에 로그인하세요',

    // Home
    title: 'Digital Business Card',
    heroTitle: '멋진 디지털 명함을',
    heroSubtitle: '만들어보세요',
    heroDescription: '기존 명함을 아름다운 플립 애니메이션, QR 코드, 간편한 공유 기능이 있는 인터랙티브 디지털 경험으로 변환하세요.',
    createYourCard: '명함 만들기',
    viewDashboard: '대시보드 보기',
    signInToStart: '시작하려면 로그인하세요',
    easyUpload: '간편한 업로드',
    easyUploadDesc: '기존 명함 이미지를 업로드하기만 하면 나머지는 저희가 처리합니다.',
    flipAnimation: '플립 애니메이션',
    flipAnimationDesc: '모든 기기에서 완벽하게 작동하는 아름다운 카드 플립 애니메이션.',
    easySharing: '간편한 공유',
    easySharingDesc: 'URL, QR 코드 또는 소셜 미디어를 통해 공유하세요. 네트워킹 이벤트에 완벽합니다.',
    cardPreview: '명함 미리보기',
    uploadToSee: '명함을 업로드하여 마법을 경험해보세요!',
    footerText: '더 나은 네트워킹을 위해 ❤️로 만들었습니다.',

    // Navigation
    home: '홈',
    dashboard: '대시보드',
    createCard: '명함 만들기',
    language: '언어',

    // Languages
    korean: '한국어',
    japanese: '日본語',
    english: 'English',

    // Dashboard
    subtitle: '디지털 명함 관리',
    welcome: '환영합니다!',
    createNewCard: '새 명함 만들기',
    noCards: '아직 명함이 없습니다',
    noCardsDescription: '첫 번째 디지털 명함을 만들어보세요',
    createFirstCard: '첫 명함 만들기',
    statistics: '통계',
    totalCards: '총 명함 수',
    doubleSidedCards: '양면 명함',
    horizontalCards: '가로형 명함',
    deleteCardConfirm: '이 명함을 삭제하시겠습니까?',
    cardDeleted: '명함이 삭제되었습니다',
    failedToLoadCards: '명함을 불러오는데 실패했습니다',
    failedToDeleteCard: '명함 삭제에 실패했습니다',

    // Create
    cardTitle: '명함 제목',
    cardTitlePlaceholder: '명함 제목을 입력하세요',
    cardType: '명함 유형',
    horizontal: '가로형',
    vertical: '세로형',
    frontImage: '앞면 이미지',
    backImage: '뒷면 이미지',
    uploadFrontImage: '앞면 이미지 업로드',
    uploadBackImage: '뒷면 이미지 업로드',
    preview: '미리보기',
    creating: '생성 중...',
    createSuccess: '명함이 성공적으로 생성되었습니다!',
    failedToCreateCard: '명함 생성에 실패했습니다',
    fillRequiredFields: '필수 항목을 모두 입력해주세요',
    uploadingImages: '이미지 업로드 중...',
    savingCard: '명함 저장 중...'
  },
  ja: {
    // Common
    loading: '読み込み中...',
    error: 'エラーが発生しました',
    save: '保存',
    cancel: 'キャンセル',
    delete: '削除',
    edit: '編集',
    create: '作成',
    back: '戻る',
    next: '次へ',
    previous: '前へ',
    close: '閉じる',
    confirm: '確認',
    optional: '任意',

    // Auth
    signIn: 'ログイン',
    signOut: 'ログアウト',
    signUp: '新規登録',
    signInWithGoogle: 'Googleでログイン',
    welcomeBack: 'おかえりなさい！',
    signInToAccount: 'アカウントにログインしてください',

    // Home
    title: 'Digital Business Card',
    heroTitle: '美しいデジタル名刺を',
    heroSubtitle: '作成しましょう',
    heroDescription: '従来の名刺を美しいフリップアニメーション、QRコード、簡単な共有機能を備えたインタラクティブなデジタル体験に変換します。',
    createYourCard: '名刺を作成',
    viewDashboard: 'ダッシュボードを見る',
    signInToStart: '開始するにはログインしてください',
    easyUpload: '簡単アップロード',
    easyUploadDesc: '既存の名刺画像をアップロードするだけで、残りは私たちが処理します。',
    flipAnimation: 'フリップアニメーション',
    flipAnimationDesc: 'すべてのデバイスで完璧に動作する美しいカードフリップアニメーション。',
    easySharing: '簡単共有',
    easySharingDesc: 'URL、QRコード、またはソーシャルメディアで共有。ネットワーキングイベントに最適です。',
    cardPreview: '名刺プレビュー',
    uploadToSee: '名刺をアップロードして魔法を体験してください！',
    footerText: 'より良いネットワーキングのために❤️で作られました。',

    // Navigation
    home: 'ホーム',
    dashboard: 'ダッシュボード',
    createCard: '名刺作成',
    language: '言語',

    // Languages
    korean: '한국어',
    japanese: '日本語',
    english: 'English',

    // Dashboard
    subtitle: 'デジタル名刺を管理',
    welcome: 'ようこそ！',
    createNewCard: '新しい名刺を作成',
    noCards: 'まだ名刺がありません',
    noCardsDescription: '最初のデジタル名刺を作成して始めましょう',
    createFirstCard: '最初の名刺を作成',
    statistics: '統計',
    totalCards: '総名刺数',
    doubleSidedCards: '両面名刺',
    horizontalCards: '横型名刺',
    deleteCardConfirm: 'この名刺を削除しますか？',
    cardDeleted: '名刺が削除されました',
    failedToLoadCards: '名刺の読み込みに失敗しました',
    failedToDeleteCard: '名刺の削除に失敗しました',

    // Create
    cardTitle: '名刺タイトル',
    cardTitlePlaceholder: '名刺タイトルを入力してください',
    cardType: '名刺タイプ',
    horizontal: '横型',
    vertical: '縦型',
    frontImage: '表面画像',
    backImage: '裏面画像',
    uploadFrontImage: '表面画像をアップロード',
    uploadBackImage: '裏面画像をアップロード',
    preview: 'プレビュー',
    creating: '作成中...',
    createSuccess: '名刺が正常に作成されました！',
    failedToCreateCard: '名刺の作成に失敗しました',
    fillRequiredFields: '必須項目をすべて入力してください',
    uploadingImages: '画像アップロード中...',
    savingCard: '名刺保存中...'
  },
  en: {
    // Common
    loading: 'Loading...',
    error: 'An error occurred',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    close: 'Close',
    confirm: 'Confirm',
    optional: 'Optional',

    // Auth
    signIn: 'Sign In',
    signOut: 'Sign Out',
    signUp: 'Sign Up',
    signInWithGoogle: 'Sign in with Google',
    welcomeBack: 'Welcome back!',
    signInToAccount: 'Sign in to your account',

    // Home
    title: 'Digital Business Card',
    heroTitle: 'Create Stunning',
    heroSubtitle: 'Digital Business Cards',
    heroDescription: 'Transform your traditional business cards into interactive digital experiences with beautiful flip animations, QR codes, and easy sharing.',
    createYourCard: 'Create Your Card',
    viewDashboard: 'View Dashboard',
    signInToStart: 'Sign in to get started',
    easyUpload: 'Easy Upload',
    easyUploadDesc: 'Simply upload your existing business card images and we\'ll handle the rest.',
    flipAnimation: 'Flip Animation',
    flipAnimationDesc: 'Beautiful card flip animations that work perfectly on all devices.',
    easySharing: 'Easy Sharing',
    easySharingDesc: 'Share via URL, QR code, or social media. Perfect for networking events.',
    cardPreview: 'Card Preview',
    uploadToSee: 'Upload your card to see the magic!',
    footerText: 'Made with ❤️ for better networking.',

    // Navigation
    home: 'Home',
    dashboard: 'Dashboard',
    createCard: 'Create Card',
    language: 'Language',

    // Languages
    korean: '한국어',
    japanese: '日本語',
    english: 'English',

    // Dashboard
    subtitle: 'Manage your digital business cards',
    welcome: 'Welcome!',
    createNewCard: 'Create New Card',
    noCards: 'No business cards yet',
    noCardsDescription: 'Create your first digital business card to get started',
    createFirstCard: 'Create Your First Card',
    statistics: 'Statistics',
    totalCards: 'Total Cards',
    doubleSidedCards: 'Double-sided Cards',
    horizontalCards: 'Horizontal Cards',
    deleteCardConfirm: 'Are you sure you want to delete this card?',
    cardDeleted: 'Card has been deleted',
    failedToLoadCards: 'Failed to load business cards',
    failedToDeleteCard: 'Failed to delete business card',

    // Create
    cardTitle: 'Card Title',
    cardTitlePlaceholder: 'Enter card title',
    cardType: 'Card Type',
    horizontal: 'Horizontal',
    vertical: 'Vertical',
    frontImage: 'Front Image',
    backImage: 'Back Image',
    uploadFrontImage: 'Upload Front Image',
    uploadBackImage: 'Upload Back Image',
    preview: 'Preview',
    creating: 'Creating...',
    createSuccess: 'Business card created successfully!',
    failedToCreateCard: 'Failed to create business card',
    fillRequiredFields: 'Please fill in all required fields',
    uploadingImages: 'Uploading images...',
    savingCard: 'Saving card...'
  }
}

export function useTranslation() {
  const [locale, setLocale] = useState<Locale>('ko')

  useEffect(() => {
    // Get locale from localStorage or cookie
    const savedLocale = localStorage.getItem('locale') as Locale
    if (savedLocale && ['ko', 'ja', 'en'].includes(savedLocale)) {
      setLocale(savedLocale)
    }
  }, [])

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale)
    localStorage.setItem('locale', newLocale)
    // 페이지 새로고침으로 언어 변경 즉시 반영
    window.location.reload()
  }

  const t = useCallback((key: keyof typeof translations.ko) => {
    return translations[locale][key] || translations.ko[key] || key
  }, [locale])

  return { t, locale, changeLocale }
}
