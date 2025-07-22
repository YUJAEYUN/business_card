import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import SharedCardViewer from '@/components/CardViewer/SharedCardViewer'
import { Database } from '@/lib/supabase'
import { BusinessCardData } from '@/lib/ocr/types'

type BusinessCard = Database['public']['Tables']['business_cards']['Row']

interface CardPageProps {
  params: Promise<{
    id: string
    locale: string
  }>
}

async function getBusinessCard(id: string): Promise<BusinessCard | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('business_cards')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data
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

export async function generateMetadata({ params }: CardPageProps) {
  const { id } = await params
  const card = await getBusinessCard(id)
  
  if (!card) {
    return {
      title: 'Card Not Found - Swivel',
    }
  }

  return {
    title: `${card.title} - Swivel`,
    description: `View ${card.title}'s digital business card on Swivel`,
    openGraph: {
      title: `${card.title} - Swivel`,
      description: `View ${card.title}'s digital business card on Swivel`,
      images: [card.front_image_url],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${card.title} - Swivel`,
      description: `View ${card.title}'s digital business card on Swivel`,
      images: [card.front_image_url],
    },
  }
}

export default async function CardPage({ params }: CardPageProps) {
  const { id } = await params
  const card = await getBusinessCard(id)

  if (!card) {
    notFound()
  }

  // OCR 데이터 로드
  const ocrData = await getOCRData(id)

  return <SharedCardViewer card={card} ocrData={ocrData || undefined} />
}
