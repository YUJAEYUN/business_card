import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface UpdateSlugParams {
  params: {
    cardId: string
  }
}

export async function PUT(
  request: NextRequest,
  { params }: UpdateSlugParams
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

    const { slug } = await request.json()

    // Validate slug
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { error: 'Invalid slug' },
        { status: 400 }
      )
    }

    // Check if slug is available
    const { data: existingSlug } = await supabaseAdmin
      .from('custom_slugs')
      .select('business_card_id')
      .eq('slug', slug.toLowerCase().trim())
      .eq('is_active', true)
      .single()

    if (existingSlug && existingSlug.business_card_id !== resolvedParams.cardId) {
      return NextResponse.json(
        { error: 'Slug is already taken' },
        { status: 409 }
      )
    }

    // Deactivate existing slug for this card
    await supabaseAdmin
      .from('custom_slugs')
      .update({ is_active: false })
      .eq('business_card_id', resolvedParams.cardId)

    // Create or update slug
    const { error: slugError } = await supabaseAdmin
      .from('custom_slugs')
      .upsert({
        business_card_id: resolvedParams.cardId,
        slug: slug.toLowerCase().trim(),
        is_active: true
      })

    if (slugError) {
      console.error('Error saving slug:', slugError)
      return NextResponse.json(
        { error: 'Failed to save slug' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      slug: slug.toLowerCase().trim()
    })

  } catch (error) {
    console.error('Error updating slug:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: UpdateSlugParams
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

    // Deactivate slug
    const { error: deleteError } = await supabaseAdmin
      .from('custom_slugs')
      .update({ is_active: false })
      .eq('business_card_id', resolvedParams.cardId)

    if (deleteError) {
      console.error('Error deleting slug:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete slug' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true
    })

  } catch (error) {
    console.error('Error deleting slug:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}