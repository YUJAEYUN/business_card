import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET: 명함별 할당된 카테고리 목록 조회
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const wallet_item_id = searchParams.get('wallet_item_id')
  if (!wallet_item_id) return NextResponse.json({ error: 'wallet_item_id required' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('business_card_category_map')
    .select('category_id')
    .eq('business_card_wallet_id', wallet_item_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ categoryIds: data?.map(row => row.category_id) || [] })
}

// POST: 명함-카테고리 할당(추가)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { wallet_item_id, category_id } = await request.json()
  if (!wallet_item_id || !category_id) {
    return NextResponse.json({ error: 'wallet_item_id and category_id required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('business_card_category_map')
    .insert({ business_card_wallet_id: wallet_item_id, category_id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ mapping: data })
}

// DELETE: 명함-카테고리 할당 해제(삭제)
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { wallet_item_id, category_id } = await request.json()
  if (!wallet_item_id || !category_id) {
    return NextResponse.json({ error: 'wallet_item_id and category_id required' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('business_card_category_map')
    .delete()
    .eq('business_card_wallet_id', wallet_item_id)
    .eq('category_id', category_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
} 