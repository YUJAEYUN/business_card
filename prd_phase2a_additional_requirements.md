# Phase 2a 추가 요구사항 상세 명세서

## 개요
기존 PRD ver2.md의 Phase 2a 요구사항을 구체적으로 구현하기 위한 상세 기술 명세서입니다.

---

## FR7. 클릭 가능한 영역 설정 및 데이터 연결 (Interactive Zones with Data)

### 7.1 OCR 기능 구현
**기술 스택:**
- **Tesseract.js**: 클라이언트 사이드 OCR 처리
- **OpenAI Vision API**: 고급 이미지 분석 및 정보 추출

**구현 세부사항:**
```typescript
// OCR 처리 플로우
1. 명함 이미지 업로드 시 자동 OCR 실행
2. Tesseract.js로 1차 텍스트 추출
3. OpenAI Vision API로 구조화된 데이터 추출
4. 신뢰도 점수 기반 결과 선택
5. 사용자 검토 및 수정 인터페이스 제공
```

**데이터 구조:**
- `business_card_ocr_data` 테이블: OCR 결과 저장
- 추출 정보: 이름, 직책, 회사명, 전화번호, 이메일, 웹사이트, 주소
- 신뢰도 점수 및 언어 감지 결과 포함

### 7.2 자동 클릭 영역 인식
**OpenAI Vision API 활용:**
```typescript
// 프롬프트 예시
"Analyze this business card image and identify clickable areas. 
Return coordinates and types for: phone numbers, email addresses, 
websites, social media handles, and addresses. 
Format: {type, coordinates: {x, y, width, height}, data, confidence}"
```

**영역 타입:**
- `phone`: 전화번호 (tel: 링크)
- `email`: 이메일 주소 (mailto: 링크)
- `website`: 웹사이트 URL
- `address`: 주소 (지도 링크)
- `social`: 소셜 미디어 계정
- `custom`: 사용자 정의 영역

### 7.3 수동 영역 설정 인터페이스
**기능:**
- 드래그 앤 드롭으로 영역 선택
- 영역별 데이터 입력 폼
- 실시간 미리보기
- 영역 편집/삭제 기능

---

## FR8. 사용자 정의 단축 URL 구현 (Custom Slugs)

### 8.1 URL 구조
```
기본: yourdomain.com/card/[UUID]
커스텀: yourdomain.com/[custom-slug]
```

### 8.2 슬러그 규칙
- 길이: 3-100자
- 허용 문자: 영문, 숫자, 하이픈(-), 언더스코어(_), 마침표(.)
- 중복 불가
- 예약어 제한 (admin, api, www, mail 등)

### 8.3 구현 기능
- 슬러그 중복 검사 API
- 실시간 유효성 검증
- 슬러그 변경 이력 관리
- SEO 최적화 (title, description 설정)

---

## FR9. 디지털 명함 지갑 자동 저장 플로우

### 9.1 자동 저장 조건
```typescript
// 자동 저장 트리거
1. QR 코드 스캔으로 접근
2. 공유 URL 클릭으로 접근
3. 로그인 상태인 사용자
4. 자신의 명함이 아닌 경우
5. 이미 저장되지 않은 명함
```

### 9.2 지갑 기능
**기본 기능:**
- 자동/수동 명함 저장
- 닉네임 설정
- 태그 분류
- 즐겨찾기
- 개인 메모

**고급 기능:**
- 검색 및 필터링
- 연락처 그룹 관리
- vCard 내보내기
- 명함 정보 업데이트 알림

---

## FR10. 명함 이미지 업데이트 기능 (Maintain URL)

### 10.1 버전 관리 시스템
```typescript
// 버전 관리 플로우
1. 기존 명함 URL 유지
2. 새 이미지 업로드
3. 버전 번호 증가
4. 이전 버전 보관
5. 클릭 영역 재설정 옵션
```

### 10.2 업데이트 프로세스
- 기존 URL 및 QR 코드 유지
- 점진적 업데이트 (A/B 테스트 가능)
- 변경 이력 추적
- 롤백 기능

---

## 기술 구현 가이드

### API 엔드포인트 설계

```typescript
// OCR 처리
POST /api/ocr/extract
POST /api/ocr/analyze-zones

// 인터랙티브 존 관리
GET /api/cards/[id]/zones
POST /api/cards/[id]/zones
PUT /api/cards/[id]/zones/[zoneId]
DELETE /api/cards/[id]/zones/[zoneId]

// 커스텀 슬러그
GET /api/slugs/check/[slug]
POST /api/cards/[id]/slug
PUT /api/cards/[id]/slug

// 명함 지갑
GET /api/wallet
POST /api/wallet/save
PUT /api/wallet/[id]
DELETE /api/wallet/[id]

// 버전 관리
GET /api/cards/[id]/versions
POST /api/cards/[id]/update
POST /api/cards/[id]/rollback/[version]

// 분석
GET /api/cards/[id]/analytics
POST /api/analytics/track
```

### 프론트엔드 컴포넌트

```typescript
// 새로운 컴포넌트들
- OCRProcessor: OCR 처리 및 결과 표시
- ZoneEditor: 클릭 영역 편집기
- SlugManager: 커스텀 URL 관리
- WalletViewer: 명함 지갑 인터페이스
- VersionHistory: 버전 관리 UI
- AnalyticsDashboard: 통계 대시보드
```

### 성능 최적화

**이미지 처리:**
- WebP 포맷 사용
- 다중 해상도 지원
- CDN 캐싱
- 지연 로딩

**OCR 최적화:**
- 클라이언트 사이드 처리 우선
- 서버 사이드 백업
- 결과 캐싱
- 배치 처리

---

## 보안 고려사항

### 데이터 보호
- OCR 데이터 암호화
- 개인정보 마스킹
- 접근 권한 제어
- 데이터 보존 정책

### API 보안
- Rate limiting
- 입력 검증
- SQL injection 방지
- XSS 방지

---

## 테스트 계획

### 단위 테스트
- OCR 정확도 테스트
- 영역 감지 정확도
- 슬러그 유효성 검증
- 버전 관리 로직

### 통합 테스트
- 전체 플로우 테스트
- 성능 테스트
- 보안 테스트
- 사용성 테스트

---

## 배포 계획

### Phase 2a.1 (우선순위 높음)
1. OCR 기본 기능
2. 커스텀 슬러그
3. 명함 지갑 기본 기능

### Phase 2a.2 (후속 개발)
1. 고급 영역 편집
2. 상세 분석 기능
3. 버전 관리 고도화

---

## 성공 지표 (KPI)

### 기술 지표
- OCR 정확도: >90%
- 영역 감지 정확도: >85%
- 페이지 로딩 시간: <3초
- API 응답 시간: <500ms

### 사용자 지표
- 명함 지갑 사용률: >60%
- 커스텀 슬러그 사용률: >40%
- 클릭 영역 활용률: >70%
- 사용자 만족도: >4.5/5.0
