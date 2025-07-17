import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import slugify from 'slugify';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    const resolvedParams = await params;
    const slug = resolvedParams.slug.toLowerCase().trim();
    
    const validation = validateSlug(slug);
    if (!validation.valid) {
      return NextResponse.json({
        available: false,
        reason: validation.reason,
        suggestions: generateSlugSuggestions(slug)
      });
    }

    const { data: existingSlug } = await supabaseAdmin
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
  if (slug.length < 3) {
    return { valid: false, reason: 'Slug must be at least 3 characters long' };
  }
  
  if (slug.length > 100) {
    return { valid: false, reason: 'Slug must be no more than 100 characters long' };
  }
  if (RESERVED_SLUGS.includes(slug)) {
    return { valid: false, reason: 'This slug is reserved and cannot be used' };
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(slug)) {
    return { 
      valid: false, 
      reason: 'Slug can only contain letters, numbers, dots, hyphens, and underscores' 
    };
  }

  if (/^[._-]|[._-]$/.test(slug)) {
    return { 
      valid: false, 
      reason: 'Slug cannot start or end with dots, hyphens, or underscores' 
    };
  }
  if (/[._-]{2,}/.test(slug)) {
    return { 
      valid: false, 
      reason: 'Slug cannot contain consecutive special characters' 
    };
  }

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

  suggestions.push(`${baseSlug}-card`);
  suggestions.push(`${baseSlug}-biz`);
  suggestions.push(`my-${baseSlug}`);
  
  for (let i = 1; i <= 5; i++) {
    suggestions.push(`${baseSlug}${i}`);
    suggestions.push(`${baseSlug}-${i}`);
  }

  const currentYear = new Date().getFullYear();
  suggestions.push(`${baseSlug}-${currentYear}`);

  return [...new Set(suggestions)]
    .filter(suggestion => validateSlug(suggestion).valid)
    .slice(0, 8); // 최대 8개 제안
}

export function normalizeSlug(input: string): string {
  return slugify(input, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
}

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

    const availableSuggestions = [];

    for (const suggestion of suggestions) {
      const { data } = await supabaseAdmin
        .from('custom_slugs')
        .select('id')
        .eq('slug', suggestion)
        .eq('is_active', true)
        .single();

      if (!data) {
        availableSuggestions.push(suggestion);
      }

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
