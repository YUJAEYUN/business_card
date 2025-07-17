import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import SharedCardViewer from '@/components/CardViewer/SharedCardViewer'
import { BusinessCardData } from '@/lib/ocr/types'

interface CustomSlugPageProps {
  params: {
    slug: string
  }
}

async function getOCRData(cardId: string): Promise<BusinessCardData | null> {
  const supabase = await createClient()

  const { data: zones, error } = await supabase
    .from('interactive_zones')
    .select('*')
    .eq('business_card_id', cardId)
    .eq('is_active', true)

  if (error) {
    console.error('Failed to fetch OCR data:', error)
    return null
  }

  if (!zones || zones.length === 0) {
    return null
  }

  const ocrData: BusinessCardData = {
    name: '',
    title: '',
    company: '',
    phone: '',
    email: '',
    website: '',
    address: ''
  }

  zones.forEach(zone => {
    const zoneData = zone.zone_data as any
    if (zone.zone_type === 'phone' && zoneData.value) {
      ocrData.phone = zoneData.value
    } else if (zone.zone_type === 'email' && zoneData.value) {
      ocrData.email = zoneData.value
    } else if (zone.zone_type === 'website' && zoneData.value) {
      ocrData.website = zoneData.value
    }
  })

  return ocrData
}

export default async function CustomSlugPage({ params }: CustomSlugPageProps) {
  const resolvedParams = await params;
  const supabase = await createClient()

  const { data: slugData, error: slugError } = await supabase
    .from('custom_slugs')
    .select('business_card_id')
    .eq('slug', resolvedParams.slug)
    .eq('is_active', true)
    .single()

  if (slugError || !slugData) {
    notFound()
  }

  const { data: cardData, error: cardError } = await supabase
    .from('business_cards')
    .select('*')
    .eq('id', slugData.business_card_id)
    .single()

  if (cardError || !cardData) {
    notFound()
  }

  // OCR 데이터 로드
  const ocrData = await getOCRData(slugData.business_card_id)

  return <SharedCardViewer card={cardData} ocrData={ocrData || undefined} />
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