# Phase 2a 구현 가이드

## 1. 개발 환경 설정

### 1.1 필요한 패키지 설치
```bash
# OCR 관련
npm install tesseract.js
npm install openai

# 이미지 처리
npm install sharp
npm install canvas

# 유틸리티
npm install slugify
npm install validator
npm install country-list
npm install geoip-lite

# 타입 정의
npm install -D @types/canvas
```

### 1.2 환경 변수 추가
```env
# .env.local
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_ENABLE_OCR=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

---

## 2. OCR 기능 구현

### 2.1 Tesseract.js 설정
```typescript
// lib/ocr/tesseract.ts
import { createWorker } from 'tesseract.js';

export class TesseractOCR {
  private worker: Tesseract.Worker | null = null;

  async initialize() {
    this.worker = await createWorker(['eng', 'kor', 'jpn'], 1, {
      logger: m => console.log(m),
      langPath: 'https://tessdata.projectnaptha.com/4.0.0',
    });
  }

  async extractText(imageFile: File): Promise<OCRResult> {
    if (!this.worker) await this.initialize();
    
    const { data } = await this.worker!.recognize(imageFile);
    
    return {
      text: data.text,
      confidence: data.confidence,
      words: data.words.map(word => ({
        text: word.text,
        confidence: word.confidence,
        bbox: word.bbox
      }))
    };
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}
```

### 2.2 OpenAI Vision API 연동
```typescript
// lib/ocr/openai-vision.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeBusinessCard(imageUrl: string): Promise<BusinessCardData> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze this business card image and extract structured information. 
            Return JSON with: name, title, company, phone, email, website, address, 
            and clickable_zones with coordinates for each field.`
          },
          {
            type: "image_url",
            image_url: { url: imageUrl }
          }
        ]
      }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content!);
}
```

---

## 3. 인터랙티브 존 구현

### 3.1 Zone Editor 컴포넌트
```typescript
// components/ZoneEditor/ZoneEditor.tsx
'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface Zone {
  id: string;
  type: 'phone' | 'email' | 'website' | 'address' | 'social' | 'custom';
  coordinates: { x: number; y: number; width: number; height: number };
  data: any;
  side: 'front' | 'back';
}

export default function ZoneEditor({ 
  imageUrl, 
  zones, 
  onZonesChange 
}: {
  imageUrl: string;
  zones: Zone[];
  onZonesChange: (zones: Zone[]) => void;
}) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentZone, setCurrentZone] = useState<Partial<Zone> | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setCurrentZone({
      coordinates: { x, y, width: 0, height: 0 },
      side: 'front'
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !currentZone || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    setCurrentZone({
      ...currentZone,
      coordinates: {
        ...currentZone.coordinates!,
        width: currentX - currentZone.coordinates!.x,
        height: currentY - currentZone.coordinates!.y
      }
    });
  };

  const handleMouseUp = () => {
    if (currentZone && currentZone.coordinates) {
      // 최소 크기 검증
      if (Math.abs(currentZone.coordinates.width) > 10 && 
          Math.abs(currentZone.coordinates.height) > 10) {
        // Zone 타입 선택 모달 표시
        openZoneTypeModal(currentZone);
      }
    }
    
    setIsDrawing(false);
    setCurrentZone(null);
  };

  return (
    <div className="relative">
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Business card"
        className="max-w-full h-auto"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      
      {/* 기존 존들 렌더링 */}
      {zones.map(zone => (
        <motion.div
          key={zone.id}
          className="absolute border-2 border-blue-500 bg-blue-500/20"
          style={{
            left: zone.coordinates.x,
            top: zone.coordinates.y,
            width: zone.coordinates.width,
            height: zone.coordinates.height
          }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="absolute -top-6 left-0 bg-blue-500 text-white px-2 py-1 text-xs rounded">
            {zone.type}
          </div>
        </motion.div>
      ))}
      
      {/* 현재 그리는 존 */}
      {currentZone && currentZone.coordinates && (
        <div
          className="absolute border-2 border-red-500 bg-red-500/20"
          style={{
            left: currentZone.coordinates.x,
            top: currentZone.coordinates.y,
            width: currentZone.coordinates.width,
            height: currentZone.coordinates.height
          }}
        />
      )}
    </div>
  );
}
```

---

## 4. 커스텀 슬러그 구현

### 4.1 슬러그 검증 API
```typescript
// app/api/slugs/check/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';
import slugify from 'slugify';

const RESERVED_SLUGS = [
  'admin', 'api', 'www', 'mail', 'ftp', 'localhost',
  'dashboard', 'create', 'login', 'signup', 'card',
  'my-card', 'wallet', 'analytics', 'settings'
];

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug.toLowerCase();
  
  // 기본 검증
  if (slug.length < 3 || slug.length > 100) {
    return NextResponse.json({ 
      available: false, 
      reason: 'Length must be between 3 and 100 characters' 
    });
  }
  
  // 예약어 검증
  if (RESERVED_SLUGS.includes(slug)) {
    return NextResponse.json({ 
      available: false, 
      reason: 'This slug is reserved' 
    });
  }
  
  // 정규식 검증
  if (!/^[a-zA-Z0-9._-]+$/.test(slug)) {
    return NextResponse.json({ 
      available: false, 
      reason: 'Only letters, numbers, dots, hyphens, and underscores allowed' 
    });
  }
  
  // 데이터베이스 중복 검증
  const { data } = await supabase
    .from('custom_slugs')
    .select('id')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  
  return NextResponse.json({ 
    available: !data,
    reason: data ? 'This slug is already taken' : null
  });
}
```

### 4.2 동적 라우팅 구현
```typescript
// app/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import SharedCardViewer from '@/components/CardViewer/SharedCardViewer';

interface SlugPageProps {
  params: { slug: string };
}

async function getCardBySlug(slug: string) {
  const supabase = createClient();
  
  const { data: customSlug } = await supabase
    .from('custom_slugs')
    .select(`
      business_card_id,
      business_cards (*)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  
  return customSlug?.business_cards || null;
}

export default async function SlugPage({ params }: SlugPageProps) {
  const card = await getCardBySlug(params.slug);
  
  if (!card) {
    notFound();
  }
  
  return <SharedCardViewer card={card} />;
}
```

---

## 5. 명함 지갑 구현

### 5.1 자동 저장 로직
```typescript
// lib/wallet/auto-save.ts
export async function autoSaveToWallet(
  viewerUserId: string,
  cardId: string,
  source: 'qr' | 'url' | 'share'
) {
  const supabase = createClient();
  
  // 자신의 명함인지 확인
  const { data: card } = await supabase
    .from('business_cards')
    .select('user_id')
    .eq('id', cardId)
    .single();
  
  if (card?.user_id === viewerUserId) {
    return; // 자신의 명함은 저장하지 않음
  }
  
  // 이미 저장되어 있는지 확인
  const { data: existing } = await supabase
    .from('business_card_wallet')
    .select('id')
    .eq('user_id', viewerUserId)
    .eq('business_card_id', cardId)
    .single();
  
  if (existing) {
    return; // 이미 저장됨
  }
  
  // 지갑에 저장
  await supabase
    .from('business_card_wallet')
    .insert({
      user_id: viewerUserId,
      business_card_id: cardId,
      notes: `Auto-saved from ${source}`
    });
  
  // 분석 데이터 기록
  await supabase
    .from('business_card_analytics')
    .insert({
      business_card_id: cardId,
      event_type: 'wallet_save',
      event_data: { source, auto: true }
    });
}
```

---

## 6. 분석 및 통계

### 6.1 분석 데이터 수집
```typescript
// lib/analytics/tracker.ts
export async function trackEvent(
  cardId: string,
  eventType: string,
  eventData?: any,
  request?: NextRequest
) {
  const supabase = createClient();
  
  // IP 및 위치 정보 수집
  const ip = request?.ip || 
    request?.headers.get('x-forwarded-for') || 
    request?.headers.get('x-real-ip');
  
  const userAgent = request?.headers.get('user-agent');
  const referrer = request?.headers.get('referer');
  
  await supabase
    .from('business_card_analytics')
    .insert({
      business_card_id: cardId,
      event_type: eventType,
      event_data: eventData,
      ip_address: ip,
      user_agent: userAgent,
      referrer: referrer
    });
}
```

---

## 7. 배포 및 테스트

### 7.1 마이그레이션 실행
```bash
# Supabase CLI로 마이그레이션 실행
supabase db push

# 또는 SQL 편집기에서 직접 실행
# supabase/migrations/002_phase2a_features.sql 파일 내용 복사하여 실행
```

### 7.2 테스트 시나리오
```typescript
// tests/phase2a.test.ts
describe('Phase 2a Features', () => {
  test('OCR text extraction', async () => {
    // OCR 기능 테스트
  });
  
  test('Custom slug validation', async () => {
    // 슬러그 검증 테스트
  });
  
  test('Auto wallet save', async () => {
    // 자동 저장 테스트
  });
  
  test('Interactive zones', async () => {
    // 클릭 영역 테스트
  });
});
```

---

## 8. 성능 최적화

### 8.1 이미지 최적화
- WebP 포맷 사용
- 다중 해상도 지원
- CDN 캐싱 설정

### 8.2 데이터베이스 최적화
- 적절한 인덱스 설정
- 쿼리 최적화
- 연결 풀링

### 8.3 프론트엔드 최적화
- 코드 스플리팅
- 지연 로딩
- 메모이제이션
