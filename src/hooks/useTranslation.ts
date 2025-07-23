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

    // Image Editor
    editImage: '이미지 편집',
    rotate: '회전',
    scale: '크기',
    processing: '처리 중...',

    // Auth
    signIn: '로그인',
    signOut: '로그아웃',
    signUp: '회원가입',
    signInWithGoogle: 'Google로 로그인',
    signingIn: '로그인 중...',
    welcomeBack: '다시 오신 것을 환영합니다!',
    signInToAccount: '계정에 로그인하세요',
    signInWithGoogleSupabase: 'Google로 로그인',
    loginError: '로그인 중 오류가 발생했습니다.',
    mobileLoginError: '모바일에서 문제가 지속되면 데스크톱 브라우저를 사용해보세요.',

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

    // Platform Introduction Sections
    newEraTitle: 'Swivel을 통해 경험하는 명함의 새로운 시대',
    newEraSubtitle: '단순한 명함 교환을 넘어, 스마트한 네트워킹의 시작!',
    problemStatement: '아직도 종이 명함을 들고 다니며 정보가 바뀔 때마다 새로 만드느라 번거로우신가요? 어렵게 받은 명함은 주머니 속에서 잊히고, 기존 디지털 명함은 저장하고 관리하기 불편하셨나요?',
    solutionStatement: 'Swivel은 이 모든 문제점을 해결하고, 당신의 첫인상과 비즈니스 네트워킹을 혁신합니다.',
    platformDefinition: 'Swivel은 기존 종이 명함의 한계를 넘어, 당신의 명함을 시각적으로 압도적인 디지털 경험으로 전환하고, 간편한 관리와 끊김 없는 연결을 제공하는 혁신적인 플랫폼입니다.',

    // How Swivel Changes Your Business
    businessChangeTitle: 'Swivel, 어떻게 당신의 비즈니스를 변화시킬까요?',

    // Easy Card Creation
    aiCreationTitle: '초간편 명함 생성: AI가 돕는 마법 같은 변환',
    aiCreationDesc1: '"Create" 버튼을 누르는 순간, 당신의 명함은 새로운 생명을 얻습니다.',
    aiCreationDesc2: '종이 명함의 앞/뒷면 이미지를 업로드하기만 하면, Swivel의 AI와 OCR 기술을 접목한 에이전트가 명함 속 정보를 정확하게 분석하고 추출합니다.',
    aiCreationDesc3: '사용자는 추출된 정보를 최종 확인하고 필요시 수정하여, 단 몇 초 만에 완벽한 디지털 명함을 완성할 수 있습니다. 복잡한 디자인 도구 없이, 당신 명함의 본질을 그대로 디지털로 가져오세요.',

    // Visual Appeal
    visualImpactTitle: '압도적인 시각적 매력: 살아있는 \'카드 플립\' 명함',
    visualImpactDesc: '당신의 디지털 명함은 단순한 이미지가 아닙니다. 클릭하거나 스와이프할 때마다 앞뒷면이 부드럽게 전환되는 \'카드 플립\' 애니메이션이 적용되어, 상대방에게 강렬하고 잊을 수 없는 첫인상을 선사합니다. 당신의 전문성과 트렌디함을 동시에 어필하세요.',

    // Smart Sharing
    smartShareTitle: '스마트한 공유: 언제 어디서든, 누구에게나',
    smartShareDesc1: '생성된 당신의 디지털 명함은 고유한 웹 주소(URL)를 가집니다.',
    smartShareDesc2: '자동 생성된 QR 코드와 함께 언제, 어디서든 스마트폰으로 간편하게 공유할 수 있습니다.',
    smartShareDesc3: '명함을 받은 사람은 별도의 앱 설치 없이 웹 브라우저를 통해 당신의 명함을 바로 확인할 수 있습니다.',

    // Digital Wallet Management
    walletManagementTitle: '혁신적인 명함 관리: 내 손안의 \'디지털 명함 지갑\'',
    walletManagementDesc1: '상대방을 위한 초간편 접속: 명함을 받은 사람은 해당 URL에 접속 후, 구글 로그인 버튼 하나만 누르면 가입/로그인이 동시에 완료됩니다.',
    walletManagementDesc2: '자동 명함 저장: 공유받은 명함은 상대방의 \'디지털 명함 지갑\'에 자동으로 저장되어 체계적으로 관리됩니다. 잊어버리거나 잃어버릴 걱정이 없습니다.',
    walletManagementDesc3: '정보 최신화: 당신의 명함 정보가 바뀌었다면, Swivel 대시보드에서 한 번만 수정하세요. 이전에 공유했던 모든 사람의 명함 지갑에 자동으로 최신 정보가 반영되어, 늘 정확한 정보를 유지할 수 있습니다.',
    walletManagementDesc4: '명함 회수 기능: 더 이상 필요 없는 명함이 있다면, 대시보드에서 삭제하세요. 상대방의 명함 지갑에 저장된 당신의 명함도 자동으로 회수되어 개인 정보 관리와 관계 정리가 용이해집니다.',

    // Target Audience
    recommendationTitle: 'Swivel, 이런 분들께 강력 추천합니다!',
    recommendation1: '첫인상을 더욱 특별하고 전문적으로 만들고 싶은 비즈니스맨',
    recommendation2: '잦은 정보 변경으로 명함 재제작이 번거로웠던 분',
    recommendation3: '복잡한 명함 관리에서 벗어나 스마트한 네트워킹을 원하는 분',
    recommendation4: '명함 교환을 통해 효율적으로 인연을 만들고 관리하고 싶은 분',

    // Call to Action
    upgradeNetworking: 'Swivel에서 당신의 비즈니스 네트워킹을 한 단계 업그레이드하세요.',

    // Wallet Management Feature Titles
    easyAccess: '초간편 접속',
    autoSave: '자동 저장',
    realTimeUpdate: '실시간 업데이트',
    cardRecall: '명함 회수',

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
    qrCode: 'QR 코드',
    deleteCardTitle: '명함을 삭제하시겠어요?',
    deleteCardMessage: '명함이 영구적으로 삭제되며 복구할 수 없어요.',

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
    copyCardLink: '링크 복사',
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

    // Image Editor
    editImage: '画像編集',
    rotate: '回転',
    scale: 'スケール',
    processing: '処理中...',
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
    signInWithGoogleSupabase: 'Googleでログイン (Supabase)',
    loginError: 'ログイン中にエラーが発生しました。',
    mobileLoginError: 'モバイルで問題が続く場合は、デスクトップブラウザをお試しください。',

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

    // Platform Introduction Sections
    newEraTitle: 'Swivelで体験する名刺の新時代',
    newEraSubtitle: '単純な名刺交換を超えた、スマートなネットワーキングの始まり！',
    problemStatement: 'まだ紙の名刺を持ち歩き、情報が変わるたびに新しく作り直すのが面倒ですか？苦労して受け取った名刺はポケットの中で忘れられ、既存のデジタル名刺は保存や管理が不便でしたか？',
    solutionStatement: 'Swivelはこれらすべての問題を解決し、あなたの第一印象とビジネスネットワーキングを革新します。',
    platformDefinition: 'Swivelは従来の紙の名刺の限界を超え、あなたの名刺を視覚的に圧倒的なデジタル体験に変換し、簡単な管理と途切れのない接続を提供する革新的なプラットフォームです。',

    // How Swivel Changes Your Business
    businessChangeTitle: 'Swivel、どのようにあなたのビジネスを変えるのでしょうか？',

    // Easy Card Creation
    aiCreationTitle: '超簡単名刺作成：AIが支援する魔法のような変換',
    aiCreationDesc1: '"Create"ボタンを押した瞬間、あなたの名刺は新しい生命を得ます。',
    aiCreationDesc2: '紙の名刺の表/裏面画像をアップロードするだけで、SwivelのAIとOCR技術を組み合わせたエージェントが名刺内の情報を正確に分析・抽出します。',
    aiCreationDesc3: 'ユーザーは抽出された情報を最終確認し、必要に応じて修正することで、わずか数秒で完璧なデジタル名刺を完成させることができます。複雑なデザインツールなしに、あなたの名刺の本質をそのままデジタルに移しましょう。',

    // Visual Appeal
    visualImpactTitle: '圧倒的な視覚的魅力：生きている「カードフリップ」名刺',
    visualImpactDesc: 'あなたのデジタル名刺は単純な画像ではありません。クリックやスワイプするたびに表裏が滑らかに切り替わる「カードフリップ」アニメーションが適用され、相手に強烈で忘れられない第一印象を与えます。あなたの専門性とトレンディさを同時にアピールしましょう。',

    // Smart Sharing
    smartShareTitle: 'スマートな共有：いつでも、どこでも、誰にでも',
    smartShareDesc1: '作成されたあなたのデジタル名刺は固有のウェブアドレス（URL）を持ちます。',
    smartShareDesc2: '自動生成されたQRコードと共に、いつでも、どこでもスマートフォンで簡単に共有できます。',
    smartShareDesc3: '名刺を受け取った人は、別途アプリをインストールすることなく、ウェブブラウザを通じてあなたの名刺をすぐに確認できます。',

    // Digital Wallet Management
    walletManagementTitle: '革新的な名刺管理：手のひらの中の「デジタル名刺ウォレット」',
    walletManagementDesc1: '相手のための超簡単アクセス：名刺を受け取った人は該当URLにアクセス後、Googleログインボタンを一度押すだけで登録/ログインが同時に完了します。',
    walletManagementDesc2: '自動名刺保存：共有された名刺は相手の「デジタル名刺ウォレット」に自動的に保存され、体系的に管理されます。忘れたり紛失したりする心配がありません。',
    walletManagementDesc3: '情報の最新化：あなたの名刺情報が変わったら、Swivelダッシュボードで一度だけ修正してください。以前に共有したすべての人の名刺ウォレットに自動的に最新情報が反映され、常に正確な情報を維持できます。',
    walletManagementDesc4: '名刺回収機能：もう必要のない名刺があれば、ダッシュボードから削除してください。相手の名刺ウォレットに保存されたあなたの名刺も自動的に回収され、個人情報管理と関係整理が容易になります。',

    // Target Audience
    recommendationTitle: 'Swivel、こんな方に強くお勧めします！',
    recommendation1: '第一印象をより特別で専門的にしたいビジネスマン',
    recommendation2: '頻繁な情報変更で名刺の再作成が面倒だった方',
    recommendation3: '複雑な名刺管理から脱却してスマートなネットワーキングを望む方',
    recommendation4: '名刺交換を通じて効率的に人脈を作り管理したい方',

    // Call to Action
    upgradeNetworking: 'Swivelであなたのビジネスネットワーキングを一段階アップグレードしましょう。',

    // Wallet Management Feature Titles
    easyAccess: '超簡単アクセス',
    autoSave: '自動保存',
    realTimeUpdate: 'リアルタイム更新',
    cardRecall: '名刺回収',

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
    qrCode: 'QRコード',
    deleteCardTitle: '名刺を削除しますか？',
    deleteCardMessage: '名刺は永久に削除され、復元できません。',

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
    copyCardLink: 'リンクをコピー',
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

    // Image Editor
    editImage: 'Edit Image',
    rotate: 'Rotate',
    scale: 'Scale',
    processing: 'Processing...',
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
    signInWithGoogleSupabase: 'Sign in with Google (Supabase)',
    loginError: 'An error occurred during login.',
    mobileLoginError: 'If problems persist on mobile, try using a desktop browser.',

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

    // Platform Introduction Sections
    newEraTitle: 'Experience the New Era of Business Cards with Swivel',
    newEraSubtitle: 'Beyond simple card exchange, the beginning of smart networking!',
    problemStatement: 'Are you still carrying paper business cards and finding it tedious to remake them every time your information changes? Do the business cards you worked hard to receive get forgotten in your pocket, and are existing digital business cards inconvenient to save and manage?',
    solutionStatement: 'Swivel solves all these problems and revolutionizes your first impression and business networking.',
    platformDefinition: 'Swivel is an innovative platform that goes beyond the limitations of traditional paper business cards, transforming your cards into visually overwhelming digital experiences while providing easy management and seamless connections.',

    // How Swivel Changes Your Business
    businessChangeTitle: 'How Does Swivel Transform Your Business?',

    // Easy Card Creation
    aiCreationTitle: 'Ultra-Simple Card Creation: AI-Powered Magical Transformation',
    aiCreationDesc1: 'The moment you press the "Create" button, your business card gains new life.',
    aiCreationDesc2: 'Simply upload front/back images of your paper business card, and Swivel\'s AI and OCR technology agent will accurately analyze and extract the information from your card.',
    aiCreationDesc3: 'Users can review the extracted information and make necessary edits to complete a perfect digital business card in just seconds. Bring the essence of your business card to digital without complex design tools.',

    // Visual Appeal
    visualImpactTitle: 'Overwhelming Visual Appeal: Living \'Card Flip\' Business Cards',
    visualImpactDesc: 'Your digital business card is not just a simple image. With \'card flip\' animations that smoothly transition between front and back when clicked or swiped, it delivers a powerful and unforgettable first impression to others. Appeal to both your professionalism and trendiness simultaneously.',

    // Smart Sharing
    smartShareTitle: 'Smart Sharing: Anytime, Anywhere, to Anyone',
    smartShareDesc1: 'Your generated digital business card has a unique web address (URL).',
    smartShareDesc2: 'With automatically generated QR codes, you can easily share anytime, anywhere with your smartphone.',
    smartShareDesc3: 'Recipients can immediately view your business card through a web browser without installing any additional apps.',

    // Digital Wallet Management
    walletManagementTitle: 'Revolutionary Card Management: \'Digital Business Card Wallet\' in Your Hand',
    walletManagementDesc1: 'Ultra-simple access for recipients: After accessing the URL, recipients can complete registration/login simultaneously with just one click of the Google login button.',
    walletManagementDesc2: 'Automatic card saving: Shared business cards are automatically saved in the recipient\'s \'Digital Business Card Wallet\' for systematic management. No worries about forgetting or losing them.',
    walletManagementDesc3: 'Information updates: If your business card information changes, just edit it once in the Swivel dashboard. The latest information is automatically reflected in all previously shared recipients\' card wallets, maintaining accurate information at all times.',
    walletManagementDesc4: 'Card recall feature: If you have business cards that are no longer needed, delete them from the dashboard. Your business cards stored in recipients\' card wallets are also automatically recalled, making personal information management and relationship organization easy.',

    // Target Audience
    recommendationTitle: 'Swivel is Strongly Recommended for These People!',
    recommendation1: 'Businesspeople who want to make their first impression more special and professional',
    recommendation2: 'Those who found business card recreation tedious due to frequent information changes',
    recommendation3: 'Those who want to escape complex business card management and desire smart networking',
    recommendation4: 'Those who want to efficiently create and manage connections through business card exchange',

    // Call to Action
    upgradeNetworking: 'Upgrade your business networking to the next level with Swivel.',

    // Wallet Management Feature Titles
    easyAccess: 'Easy Access',
    autoSave: 'Auto Save',
    realTimeUpdate: 'Real-time Update',
    cardRecall: 'Card Recall',

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
    qrCode: 'QR Code',
    deleteCardTitle: 'Delete this card?',
    deleteCardMessage: 'This card will be permanently deleted and cannot be recovered.',

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
    copyCardLink: 'Copy Link',
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
