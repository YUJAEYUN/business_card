import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email: userEmail, name: userName, image: userImage } = body

    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 })
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', userEmail)
      .single()

    if (profileError) {
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('profiles')
        .insert({
          email: userEmail,
          full_name: userName || null,
          avatar_url: userImage || null
        })
        .select('id')
        .single()

      if (createError) {
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
      }

      const { data, error } = await supabaseAdmin
        .from('business_cards')
        .select('*')
        .eq('user_id', newProfile.id)
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch business cards' }, { status: 500 })
      }

      return NextResponse.json(data || [])
    }

    const { data, error } = await supabaseAdmin
      .from('business_cards')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch business cards' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


