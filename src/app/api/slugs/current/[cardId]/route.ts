import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface CurrentSlugParams {
  params: {
    cardId: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: CurrentSlugParams
) {
  try {
    const resolvedParams = await params;

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify card ownership
    const { data: card } = await supabaseAdmin
      .from('business_cards')
      .select('id')
      .eq('id', resolvedParams.cardId)
      .eq('user_id', profile.id)
      .single()

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found or access denied' },
        { status: 404 }
      )
    }

    // Get current slug
    const { data: slugData } = await supabaseAdmin
      .from('custom_slugs')
      .select('slug')
      .eq('business_card_id', resolvedParams.cardId)
      .eq('is_active', true)
      .single()

    return NextResponse.json({
      slug: slugData?.slug || null
    })

  } catch (error) {
    console.error('Error fetching current slug:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}