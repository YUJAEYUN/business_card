import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 모바일 호환성을 위한 설정
    flowType: 'pkce',
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true
  }
})

export type Database = {
  public: {
    Tables: {
      business_cards: {
        Row: {
          id: string
          user_id: string
          title: string
          front_image_url: string
          back_image_url: string | null
          card_type: 'horizontal' | 'vertical'
          custom_slug: string | null
          view_count: number
          is_public: boolean
          seo_title: string | null
          seo_description: string | null
          version_number: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          front_image_url: string
          back_image_url?: string | null
          card_type?: 'horizontal' | 'vertical'
          custom_slug?: string | null
          view_count?: number
          is_public?: boolean
          seo_title?: string | null
          seo_description?: string | null
          version_number?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          front_image_url?: string
          back_image_url?: string | null
          card_type?: 'horizontal' | 'vertical'
          custom_slug?: string | null
          view_count?: number
          is_public?: boolean
          seo_title?: string | null
          seo_description?: string | null
          version_number?: number
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      business_card_ocr_data: {
        Row: {
          id: string
          business_card_id: string
          extracted_text: string | null
          confidence_score: number | null
          language_detected: string | null
          extraction_method: string
          raw_data: Record<string, unknown> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_card_id: string
          extracted_text?: string | null
          confidence_score?: number | null
          language_detected?: string | null
          extraction_method?: string
          raw_data?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_card_id?: string
          extracted_text?: string | null
          confidence_score?: number | null
          language_detected?: string | null
          extraction_method?: string
          raw_data?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
      }
      interactive_zones: {
        Row: {
          id: string
          business_card_id: string
          zone_type: string
          zone_data: Record<string, unknown>
          coordinates: Record<string, unknown>
          is_active: boolean
          click_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_card_id: string
          zone_type: string
          zone_data: Record<string, unknown>
          coordinates: Record<string, unknown>
          is_active?: boolean
          click_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_card_id?: string
          zone_type?: string
          zone_data?: Record<string, unknown>
          coordinates?: Record<string, unknown>
          is_active?: boolean
          click_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      custom_slugs: {
        Row: {
          id: string
          business_card_id: string
          slug: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_card_id: string
          slug: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_card_id?: string
          slug?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      business_card_wallet: {
        Row: {
          id: string
          user_id: string
          business_card_id: string
          nickname: string | null
          tags: string[] | null
          is_favorite: boolean
          notes: string | null
          saved_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_card_id: string
          nickname?: string | null
          tags?: string[] | null
          is_favorite?: boolean
          notes?: string | null
          saved_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_card_id?: string
          nickname?: string | null
          tags?: string[] | null
          is_favorite?: boolean
          notes?: string | null
          saved_at?: string
          updated_at?: string
        }
      }
      business_card_analytics: {
        Row: {
          id: string
          business_card_id: string
          event_type: string
          event_data: Record<string, unknown> | null
          ip_address: string | null
          user_agent: string | null
          referrer: string | null
          country: string | null
          city: string | null
          created_at: string
        }
        Insert: {
          id?: string
          business_card_id: string
          event_type: string
          event_data?: Record<string, unknown> | null
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          country?: string | null
          city?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          business_card_id?: string
          event_type?: string
          event_data?: Record<string, unknown> | null
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          country?: string | null
          city?: string | null
          created_at?: string
        }
      }
      business_card_versions: {
        Row: {
          id: string
          business_card_id: string
          version_number: number
          front_image_url: string
          back_image_url: string | null
          card_type: string
          change_description: string | null
          is_current: boolean
          created_at: string
        }
        Insert: {
          id?: string
          business_card_id: string
          version_number: number
          front_image_url: string
          back_image_url?: string | null
          card_type?: string
          change_description?: string | null
          is_current?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          business_card_id?: string
          version_number?: number
          front_image_url?: string
          back_image_url?: string | null
          card_type?: string
          change_description?: string | null
          is_current?: boolean
          created_at?: string
        }
      }
    }
  }
}
