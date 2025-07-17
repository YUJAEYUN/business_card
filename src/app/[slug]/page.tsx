import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import SharedCardViewer from '@/components/CardViewer/SharedCardViewer'

interface CustomSlugPageProps {
  params: {
    slug: string
  }
}

export default async function CustomSlugPage({ params }: CustomSlugPageProps) {
  const resolvedParams = await params;
  const supabase = await createClient()

  // 슬러그로 명함 ID 찾기
  const { data: slugData, error: slugError } = await supabase
    .from('custom_slugs')
    .select('business_card_id')
    .eq('slug', resolvedParams.slug)
    .eq('is_active', true)
    .single()

  if (slugError || !slugData) {
    notFound()
  }

  // 명함 데이터 가져오기
  const { data: cardData, error: cardError } = await supabase
    .from('business_cards')
    .select('*')
    .eq('id', slugData.business_card_id)
    .single()

  if (cardError || !cardData) {
    notFound()
  }

  return <SharedCardViewer card={cardData} />
}

export async function generateMetadata({ params }: CustomSlugPageProps) {
  const resolvedParams = await params;
  const supabase = await createClient()

  const { data: slugData } = await supabase
    .from('custom_slugs')
    .select('business_card_id')
    .eq('slug', resolvedParams.slug)
    .eq('is_active', true)
    .single()

  if (!slugData) {
    return {
      title: 'Business Card Not Found',
    }
  }

  const { data: cardData } = await supabase
    .from('business_cards')
    .select('*')
    .eq('id', slugData.business_card_id)
    .single()

  const { data: ocrData } = await supabase
    .from('business_card_ocr_data')
    .select('*')
    .eq('business_card_id', slugData.business_card_id)
    .single()

  const name = ocrData?.name || 'Business Card'
  const company = ocrData?.company || ''
  const title = company ? `${name} - ${company}` : name

  return {
    title,
    description: `${name}의 디지털 명함을 확인하세요.`,
    openGraph: {
      title,
      description: `${name}의 디지털 명함을 확인하세요.`,
      images: cardData?.front_image_url ? [cardData.front_image_url] : [],
    },
  }
}