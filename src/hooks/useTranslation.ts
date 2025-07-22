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
    preview: '미리보기',
    copied: '복사됨!',
    copyLink: '링크 복사',
    share: '공유',
    customUrl: '사용자 정의 URL',
    updateCard: '카드 업데이트',
    versionHistory: '버전 기록',
    update: '업데이트',
    updating: '업데이트 중...',
    current: '현재',
    version: '버전',
    versions: '버전들',
    changes: '변경사항',

    // Auth
    signIn: '로그인',
    signOut: '로그아웃',
    signUp: '회원가입',
    signInWithGoogle: 'Google로 로그인',
    signingIn: '로그인 중...',
    welcomeBack: '다시 오신 것을 환영합니다!',
    signInToAccount: '계정에 로그인하세요',

    // Home
    title: 'Swivel',
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
    footerText: '잃어버릴 걱정 없는 명함, 쌓여가는 인연. 당신의 네트워킹을 재정의합니다.',

    // Example Card Section
    clickCardTitle: '명함을 클릭해보세요',
    clickCardDesc: '실제 명함처럼 앞뒤로 뒤집어지는 애니메이션을 체험해보세요.',
    clickCardDesc2: 'QR 코드와 연락처 정보가 포함된 디지털 명함을 만들 수 있습니다.',
    clickCardHint: '💡 명함을 클릭하면 뒤집어집니다',
    createMyCard: '나만의 명함 만들기',

    // Features Section
    whyDigitalCard: '왜 디지털 명함인가요?',
    whyDigitalCardDesc: '종이 명함의 한계를 넘어선 새로운 경험을 제공합니다',

    // Navigation
    home: '홈',
    dashboard: '대시보드',
    createCard: '명함 만들기',
    wallet: '명함지갑',
    language: '언어',

    // Languages
    korean: '한국어',
    japanese: '日본語',
    english: 'English',
    selectLanguage: '언어 선택',

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
    myCards: '내 명함',
    cardWallet: '명함지갑',

    // Business Card Actions
    manage: '관리',
    copyLink: '링크 복사',
    copied: '복사됨',
    qrCode: 'QR 코드',
    delete: '삭제',
    deleteCardTitle: '명함을 삭제하시겠어요?',
    deleteCardMessage: '명함이 영구적으로 삭제되며 복구할 수 없어요.',
    cancel: '취소',

    // Wallet Filters
    searchByNickname: '닉네임이나 이름으로 검색...',
    search: '검색',
    all: '전체',
    favorites: '즐겨찾기',
    favoritesOnly: '즐겨찾기만',
    reset: '초기화',

    // Category Management
    addCategory: '+ 추가',
    add: '추가',
    edit: '수정',
    addCategoryTitle: '카테고리 추가',
    editCategoryTitle: '카테고리 수정',

    // Contact Information
    contactInfo: '연락처 정보',
    phone: '전화',
    email: '이메일',
    website: '웹사이트',
    saveToWallet: '명함을 지갑에 저장하세요',
    saveToWalletDesc: '로그인하면 이 명함을 자동으로 지갑에 저장하고 언제든지 다시 볼 수 있습니다',
    poweredBy: 'Powered by Digital Business Cards',

    // Wallet
    walletTitle: '명함지갑',
    walletSubtitle: '저장된 명함을 관리하세요',
    noWalletCards: '저장된 명함이 없습니다',
    noWalletCardsDescription: '다른 사람의 명함을 스캔하거나 링크를 통해 저장해보세요',
    searchPlaceholder: '명함 검색...',
    filterByTag: '태그로 필터',
    showFavorites: '즐겨찾기만 보기',
    allCards: '모든 명함',
    favoriteCards: '즐겨찾기',
    addToFavorites: '즐겨찾기 추가',
    removeFromFavorites: '즐겨찾기 제거',
    editNickname: '닉네임 편집',
    addNote: '메모 추가',
    editNote: '메모 편집',
    addTag: '태그 추가',
    removeTag: '태그 제거',
    downloadVCard: '연락처 저장',
    deleteFromWallet: '지갑에서 삭제',
    deleteFromWalletConfirm: '이 명함을 지갑에서 삭제하시겠습니까?',
    cardDeletedFromWallet: '명함이 지갑에서 삭제되었습니다',
    failedToLoadWallet: '명함지갑을 불러오는데 실패했습니다',
    failedToDeleteFromWallet: '명함지갑에서 삭제에 실패했습니다',
    savedBy: '저장자',
    savedAt: '저장일',
    nickname: '닉네임',
    notes: '메모',
    tags: '태그',
    cardSavedToWallet: '명함이 지갑에 저장되었습니다',
    cardAlreadyInWallet: '이미 지갑에 저장된 명함입니다',
    cannotSaveOwnCard: '자신의 명함은 지갑에 저장할 수 없습니다',

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
    creating: '생성 중...',
    createSuccess: '명함이 성공적으로 생성되었습니다!',
    failedToCreateCard: '명함 생성에 실패했습니다',
    fillRequiredFields: '필수 항목을 모두 입력해주세요',
    uploadingImages: '이미지 업로드 중...',
    savingCard: '명함 저장 중...',

    // Update Card
    updateBusinessCard: '명함 업데이트',
    changeDescription: '변경 설명',
    describeChanges: '변경 사항을 설명해주세요',
    enterCardTitle: '명함 제목을 입력하세요',
    processOCR: 'OCR 처리',
    hideOCR: 'OCR 숨기기',
    versionNumber: '버전 번호',
    selectVersionToView: '보려는 버전을 선택하세요',

    // Custom URL
    customUrlSettings: '커스텀 URL 설정',
    currentUrl: '현재 URL',
    slugAlreadyTaken: '이 슬러그는 이미 사용 중입니다',
    suggestions: '제안',
    showMoreSuggestions: '더 많은 제안 보기',
    hideSuggestions: '제안 숨기기',
    saving: '저장 중...',
    remove: '제거',
    customUrlOptional: '커스텀 URL (선택사항)',
    enterCustomUrl: '커스텀 URL을 입력하세요',
    autoGenerateFromTitle: '제목에서 자동 생성',
    customUrlHelp: '커스텀 URL은 3-100자 길이여야 하며 문자, 숫자, 점, 하이픈, 밑줄만 포함할 수 있습니다.',
    available: '사용 가능',
    yourCardWillBeAccessible: '카드는 다음 주소에서 접근할 수 있습니다',
    extractedInformation: '추출된 정보',
    directLink: '직접 링크',

    // How to Use
    howToUse: '사용 방법',
    clickOrTap: '클릭 또는 탭',
    tapCardToFlip: '카드를 탭하여 앞뒤로 뒤집기',
    shareCard: '공유',
    copyLinkOrShare: '링크를 복사하거나 소셜 미디어에서 공유',
    createAction: '생성',
    updateAction: '업데이트',
    updateYourCard: '명함을 업데이트하고 관리하기',
    copy: '복사',

    // Dashboard Card Actions
    manage: '관리',
    copyCardLink: '링크 복사',
    qrCode: 'QR 코드',
    deleteBusinessCard: '명함 삭제',
    deleteConfirmMessage: '정말로 삭제하시겠습니까?',
    deleteConfirmDescription: '이 작업은 되돌릴 수 없습니다.',

    // Account Management
    accountManagement: '계정 관리',
    deleteAccount: '회원 탈퇴'
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
    preview: 'プレビュー',
    copied: 'コピーしました！',
    copyLink: 'リンクをコピー',
    share: '共有',
    customUrl: 'カスタムURL',
    updateCard: 'カードを更新',
    versionHistory: 'バージョン履歴',
    update: '更新',
    updating: '更新中...',
    current: '現在',
    version: 'バージョン',
    versions: 'バージョン',
    changes: '変更',

    // Auth
    signIn: 'ログイン',
    signOut: 'ログアウト',
    signUp: '新規登録',
    signInWithGoogle: 'Googleでログイン',
    signingIn: 'ログイン中...',
    welcomeBack: 'おかえりなさい！',
    signInToAccount: 'アカウントにログインしてください',

    // Home
    title: 'Swivel',
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
    footerText: '紛失の心配がない名刺、積み重なる縁。あなたのネットワーキングを再定義します。',

    // Example Card Section
    clickCardTitle: '名刺をクリックしてみてください',
    clickCardDesc: '実際の名刺のように表裏にひっくり返るアニメーションを体験してください。',
    clickCardDesc2: 'QRコードと連絡先情報が含まれたデジタル名刺を作成できます。',
    clickCardHint: '💡 名刺をクリックするとひっくり返ります',
    createMyCard: '私だけの名刺を作成',

    // Features Section
    whyDigitalCard: 'なぜデジタル名刺なのか？',
    whyDigitalCardDesc: '紙の名刺の限界を超えた新しい体験を提供します',

    // Navigation
    home: 'ホーム',
    dashboard: 'ダッシュボード',
    createCard: '名刺作成',
    wallet: '名刺ウォレット',
    language: '言語',

    // Languages
    korean: '한국어',
    japanese: '日本語',
    english: 'English',
    selectLanguage: '言語を選択',

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
    myCards: 'マイ名刺',
    cardWallet: '名刺ウォレット',

    // Business Card Actions
    manage: '管理',
    copyLink: 'リンクをコピー',
    copied: 'コピーしました',
    qrCode: 'QRコード',
    delete: '削除',
    deleteCardTitle: '名刺を削除しますか？',
    deleteCardMessage: '名刺は永久に削除され、復元できません。',
    cancel: 'キャンセル',

    // Wallet Filters
    searchByNickname: 'ニックネームや名前で検索...',
    search: '検索',
    all: 'すべて',
    favorites: 'お気に入り',
    favoritesOnly: 'お気に入りのみ',
    reset: 'リセット',

    // Category Management
    addCategory: '+ 追加',
    add: '追加',
    edit: '編集',
    addCategoryTitle: 'カテゴリ追加',
    editCategoryTitle: 'カテゴリ編集',

    // Contact Information
    contactInfo: '連絡先情報',
    phone: '電話',
    email: 'メール',
    website: 'ウェブサイト',
    saveToWallet: '名刺をウォレットに保存',
    saveToWalletDesc: 'ログインすると、この名刺を自動的にウォレットに保存し、いつでも再度閲覧できます',
    poweredBy: 'Powered by Digital Business Cards',

    // Wallet
    walletTitle: '名刺ウォレット',
    walletSubtitle: '保存された名刺を管理',
    noWalletCards: '保存された名刺がありません',
    noWalletCardsDescription: '他の人の名刺をスキャンまたはリンクから保存してみてください',
    searchPlaceholder: '名刺を検索...',
    filterByTag: 'タグでフィルター',
    showFavorites: 'お気に入りのみ表示',
    allCards: 'すべての名刺',
    favoriteCards: 'お気に入り',
    addToFavorites: 'お気に入りに追加',
    removeFromFavorites: 'お気に入りから削除',
    editNickname: 'ニックネーム編集',
    addNote: 'メモ追加',
    editNote: 'メモ編集',
    addTag: 'タグ追加',
    removeTag: 'タグ削除',
    downloadVCard: '連絡先保存',
    deleteFromWallet: 'ウォレットから削除',
    deleteFromWalletConfirm: 'この名刺をウォレットから削除しますか？',
    cardDeletedFromWallet: '名刺がウォレットから削除されました',
    failedToLoadWallet: '名刺ウォレットの読み込みに失敗しました',
    failedToDeleteFromWallet: 'ウォレットからの削除に失敗しました',
    savedBy: '保存者',
    savedAt: '保存日',
    nickname: 'ニックネーム',
    notes: 'メモ',
    tags: 'タグ',
    cardSavedToWallet: '名刺がウォレットに保存されました',
    cardAlreadyInWallet: '既にウォレットに保存されている名刺です',
    cannotSaveOwnCard: '自分の名刺はウォレットに保存できません',

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
    creating: '作成中...',
    createSuccess: '名刺が正常に作成されました！',
    failedToCreateCard: '名刺の作成に失敗しました',
    fillRequiredFields: '必須項目をすべて入力してください',
    uploadingImages: '画像アップロード中...',
    savingCard: '名刺保存中...',

    // Update Card
    updateBusinessCard: '名刺を更新',
    changeDescription: '変更説明',
    describeChanges: '変更内容を説明してください',
    enterCardTitle: '名刺タイトルを入力してください',
    processOCR: 'OCR処理',
    hideOCR: 'OCRを隠す',
    versionNumber: 'バージョン番号',
    selectVersionToView: '表示するバージョンを選択してください',

    // Custom URL
    customUrlSettings: 'カスタムURL設定',
    currentUrl: '現在のURL',
    slugAlreadyTaken: 'このスラッグは既に使用されています',
    suggestions: '提案',
    showMoreSuggestions: 'さらに提案を表示',
    hideSuggestions: '提案を隠す',
    saving: '保存中...',
    remove: '削除',
    customUrlOptional: 'カスタムURL（オプション）',
    enterCustomUrl: 'カスタムURLを入力してください',
    autoGenerateFromTitle: 'タイトルから自動生成',
    customUrlHelp: 'カスタムURLは3-100文字の長さで、文字、数字、ドット、ハイフン、アンダースコアのみを含む必要があります。',
    available: '利用可能',
    yourCardWillBeAccessible: 'カードは次のアドレスでアクセス可能になります',
    extractedInformation: '抽出された情報',
    directLink: '直接リンク',

    // How to Use
    howToUse: '使用方法',
    clickOrTap: 'クリックまたはタップ',
    tapCardToFlip: 'カードをタップして表裏を切り替え',
    shareCard: '共有',
    copyLinkOrShare: 'リンクをコピーまたはソーシャルメディアで共有',
    createAction: '作成',
    updateAction: '更新',
    updateYourCard: '名刺を更新・管理する',
    copy: 'コピー',

    // Dashboard Card Actions
    manage: '管理',
    copyCardLink: 'リンクをコピー',
    qrCode: 'QRコード',
    deleteBusinessCard: '名刺を削除',
    deleteConfirmMessage: '本当に削除しますか？',
    deleteConfirmDescription: 'この操作は元に戻せません。',

    // Account Management
    accountManagement: 'アカウント管理',
    deleteAccount: 'アカウント削除'
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
    preview: 'Preview',
    copied: 'Copied!',
    copyLink: 'Copy Link',
    share: 'Share',
    customUrl: 'Custom URL',
    updateCard: 'Update Card',
    versionHistory: 'Version History',
    update: 'Update',
    updating: 'Updating...',
    current: 'Current',
    version: 'Version',
    versions: 'Versions',
    changes: 'Changes',

    // Auth
    signIn: 'Sign In',
    signOut: 'Sign Out',
    signUp: 'Sign Up',
    signInWithGoogle: 'Sign in with Google',
    signingIn: 'Signing in...',
    welcomeBack: 'Welcome back!',
    signInToAccount: 'Sign in to your account',

    // Home
    title: 'Swivel',
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
    footerText: 'Never lose a business card again. Build lasting connections. Redefine your networking.',

    // Example Card Section
    clickCardTitle: 'Click the Business Card',
    clickCardDesc: 'Experience the flip animation just like a real business card.',
    clickCardDesc2: 'Create digital business cards with QR codes and contact information.',
    clickCardHint: '💡 Click the card to flip it',
    createMyCard: 'Create My Card',

    // Features Section
    whyDigitalCard: 'Why Digital Business Cards?',
    whyDigitalCardDesc: 'Experience beyond the limitations of paper business cards',

    // Navigation
    home: 'Home',
    dashboard: 'Dashboard',
    createCard: 'Create Card',
    wallet: 'Card Wallet',
    language: 'Language',

    // Languages
    korean: '한국어',
    japanese: '日本語',
    english: 'English',
    selectLanguage: 'Select Language',

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
    myCards: 'My Cards',
    cardWallet: 'Card Wallet',

    // Business Card Actions
    manage: 'Manage',
    copyLink: 'Copy Link',
    copied: 'Copied',
    qrCode: 'QR Code',
    delete: 'Delete',
    deleteCardTitle: 'Delete this card?',
    deleteCardMessage: 'This card will be permanently deleted and cannot be recovered.',
    cancel: 'Cancel',

    // Wallet Filters
    searchByNickname: 'Search by nickname or name...',
    search: 'Search',
    all: 'All',
    favorites: 'Favorites',
    favoritesOnly: 'Favorites Only',
    reset: 'Reset',

    // Category Management
    addCategory: '+ Add',
    add: 'Add',
    edit: 'Edit',
    addCategoryTitle: 'Add Category',
    editCategoryTitle: 'Edit Category',

    // Contact Information
    contactInfo: 'Contact Information',
    phone: 'Phone',
    email: 'Email',
    website: 'Website',
    saveToWallet: 'Save card to wallet',
    saveToWalletDesc: 'Log in to automatically save this card to your wallet and view it anytime',
    poweredBy: 'Powered by Digital Business Cards',

    // Wallet
    walletTitle: 'Card Wallet',
    walletSubtitle: 'Manage your saved business cards',
    noWalletCards: 'No saved cards yet',
    noWalletCardsDescription: 'Scan or save other people\'s business cards through links',
    searchPlaceholder: 'Search cards...',
    filterByTag: 'Filter by tag',
    showFavorites: 'Show favorites only',
    allCards: 'All Cards',
    favoriteCards: 'Favorites',
    addToFavorites: 'Add to favorites',
    removeFromFavorites: 'Remove from favorites',
    editNickname: 'Edit nickname',
    addNote: 'Add note',
    editNote: 'Edit note',
    addTag: 'Add tag',
    removeTag: 'Remove tag',
    downloadVCard: 'Save contact',
    deleteFromWallet: 'Delete from wallet',
    deleteFromWalletConfirm: 'Are you sure you want to delete this card from wallet?',
    cardDeletedFromWallet: 'Card has been deleted from wallet',
    failedToLoadWallet: 'Failed to load card wallet',
    failedToDeleteFromWallet: 'Failed to delete from wallet',
    savedBy: 'Saved by',
    savedAt: 'Saved at',
    nickname: 'Nickname',
    notes: 'Notes',
    tags: 'Tags',
    cardSavedToWallet: 'Card saved to wallet',
    cardAlreadyInWallet: 'Card already saved in wallet',
    cannotSaveOwnCard: 'Cannot save your own card to wallet',

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
    creating: 'Creating...',
    createSuccess: 'Business card created successfully!',
    failedToCreateCard: 'Failed to create business card',
    fillRequiredFields: 'Please fill in all required fields',
    uploadingImages: 'Uploading images...',
    savingCard: 'Saving card...',

    // Update Card
    updateBusinessCard: 'Update Business Card',
    changeDescription: 'Change Description',
    describeChanges: 'Please describe the changes',
    enterCardTitle: 'Please enter card title',
    processOCR: 'Process OCR',
    hideOCR: 'Hide OCR',
    versionNumber: 'Version Number',
    selectVersionToView: 'Select version to view',

    // Custom URL
    customUrlSettings: 'Custom URL Settings',
    currentUrl: 'Current URL',
    slugAlreadyTaken: 'This slug is already taken',
    suggestions: 'Suggestions',
    showMoreSuggestions: 'Show more suggestions',
    hideSuggestions: 'Hide suggestions',
    saving: 'Saving...',
    remove: 'Remove',
    customUrlOptional: 'Custom URL (Optional)',
    enterCustomUrl: 'Enter your custom URL',
    autoGenerateFromTitle: 'Auto-generate from title',
    customUrlHelp: 'Custom URL must be 3-100 characters long and contain only letters, numbers, dots, hyphens, and underscores.',
    available: 'Available',
    yourCardWillBeAccessible: 'Your card will be accessible at',
    extractedInformation: 'Extracted Information',
    directLink: 'Direct Link',

    // How to Use
    howToUse: 'How to Use',
    clickOrTap: 'Click or Tap',
    tapCardToFlip: 'Tap the card to flip between front and back',
    shareCard: 'Share',
    copyLinkOrShare: 'Copy the link or share on social media',
    createAction: 'Create',
    updateAction: 'Update',
    updateYourCard: 'Update and manage your business card',
    copy: 'Copy',

    // Dashboard Card Actions
    manage: 'Manage',
    copyCardLink: 'Copy Link',
    qrCode: 'QR Code',
    deleteBusinessCard: 'Delete Business Card',
    deleteConfirmMessage: 'Are you sure you want to delete this?',
    deleteConfirmDescription: 'This action cannot be undone.',

    // Account Management
    accountManagement: 'Account Management',
    deleteAccount: 'Delete Account'
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
