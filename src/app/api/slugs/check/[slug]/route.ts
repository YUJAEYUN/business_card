import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import slugify from 'slugify';

const RESERVED_SLUGS = [
  'admin', 'api', 'www', 'mail', 'ftp', 'localhost',
  'dashboard', 'create', 'login', 'signup', 'card',
  'my-card', 'wallet', 'analytics', 'settings',
  'help', 'support', 'contact', 'about', 'terms',
  'privacy', 'blog', 'news', 'docs', 'documentation',
  'app', 'mobile', 'download', 'static', 'assets',
  'public', 'private', 'secure', 'auth', 'oauth',
  'callback', 'webhook', 'health', 'status', 'ping'
];

interface SlugCheckParams {
  params: {
    slug: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: SlugCheckParams
) {
  try {
    const slug = params.slug.toLowerCase().trim();
    
    // 기본 검증
    const validation = validateSlug(slug);
    if (!validation.valid) {
      return NextResponse.json({
        available: false,
        reason: validation.reason,
        suggestions: generateSlugSuggestions(slug)
      });
    }

    // 데이터베이스 중복 검증
    const supabase = createClient();
    const { data: existingSlug } = await supabase
      .from('custom_slugs')
      .select('id, business_card_id')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    const available = !existingSlug;

    return NextResponse.json({
      available,
      reason: available ? null : 'This slug is already taken',
      suggestions: available ? [] : generateSlugSuggestions(slug)
    });

  } catch (error) {
    console.error('Slug check failed:', error);
    return NextResponse.json(
      { error: 'Failed to check slug availability' },
      { status: 500 }
    );
  }
}

function validateSlug(slug: string): { valid: boolean; reason?: string } {
  // 길이 검증
  if (slug.length < 3) {
    return { valid: false, reason: 'Slug must be at least 3 characters long' };
  }
  
  if (slug.length > 100) {
    return { valid: false, reason: 'Slug must be no more than 100 characters long' };
  }

  // 예약어 검증
  if (RESERVED_SLUGS.includes(slug)) {
    return { valid: false, reason: 'This slug is reserved and cannot be used' };
  }

  // 정규식 검증 (영문, 숫자, 하이픈, 언더스코어, 마침표만 허용)
  if (!/^[a-zA-Z0-9._-]+$/.test(slug)) {
    return { 
      valid: false, 
      reason: 'Slug can only contain letters, numbers, dots, hyphens, and underscores' 
    };
  }

  // 시작과 끝이 특수문자가 아닌지 확인
  if (/^[._-]|[._-]$/.test(slug)) {
    return { 
      valid: false, 
      reason: 'Slug cannot start or end with dots, hyphens, or underscores' 
    };
  }

  // 연속된 특수문자 방지
  if (/[._-]{2,}/.test(slug)) {
    return { 
      valid: false, 
      reason: 'Slug cannot contain consecutive special characters' 
    };
  }

  // 숫자로만 구성된 슬러그 방지 (UUID와 혼동 방지)
  if (/^\d+$/.test(slug)) {
    return { 
      valid: false, 
      reason: 'Slug cannot be only numbers' 
    };
  }

  return { valid: true };
}

function generateSlugSuggestions(originalSlug: string): string[] {
  const suggestions: string[] = [];
  const baseSlug = slugify(originalSlug, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });

  // 기본 제안들
  suggestions.push(`${baseSlug}-card`);
  suggestions.push(`${baseSlug}-biz`);
  suggestions.push(`my-${baseSlug}`);
  
  // 숫자 추가 제안들
  for (let i = 1; i <= 5; i++) {
    suggestions.push(`${baseSlug}${i}`);
    suggestions.push(`${baseSlug}-${i}`);
  }

  // 년도 추가
  const currentYear = new Date().getFullYear();
  suggestions.push(`${baseSlug}-${currentYear}`);

  // 중복 제거 및 유효성 검증
  return [...new Set(suggestions)]
    .filter(suggestion => validateSlug(suggestion).valid)
    .slice(0, 8); // 최대 8개 제안
}

// 슬러그 정규화 함수
export function normalizeSlug(input: string): string {
  return slugify(input, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
}

// 슬러그 생성 제안 API
export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const normalizedSlug = normalizeSlug(text);
    const suggestions = generateSlugSuggestions(normalizedSlug);

    // 각 제안의 가용성 확인
    const supabase = createClient();
    const availableSuggestions = [];

    for (const suggestion of suggestions) {
      const { data } = await supabase
        .from('custom_slugs')
        .select('id')
        .eq('slug', suggestion)
        .eq('is_active', true)
        .single();

      if (!data) {
        availableSuggestions.push(suggestion);
      }

      // 충분한 제안이 모이면 중단
      if (availableSuggestions.length >= 5) {
        break;
      }
    }

    return NextResponse.json({
      original: text,
      normalized: normalizedSlug,
      suggestions: availableSuggestions
    });

  } catch (error) {
    console.error('Slug suggestion failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate slug suggestions' },
      { status: 500 }
    );
  }
}
