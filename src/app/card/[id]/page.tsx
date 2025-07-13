import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import SharedCardViewer from '@/components/CardViewer/SharedCardViewer'
import { Database } from '@/lib/supabase'

type BusinessCard = Database['public']['Tables']['business_cards']['Row']

interface CardPageProps {
  params: Promise<{
    id: string
    locale: string
  }>
}

async function getBusinessCard(id: string): Promise<BusinessCard | null> {
  const supabase = createClient()
  
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

export async function generateMetadata({ params }: CardPageProps) {
  const { id } = await params
  const card = await getBusinessCard(id)
  
  if (!card) {
    return {
      title: 'Business Card Not Found',
    }
  }

  return {
    title: `${card.title} - Digital Business Card`,
    description: `View ${card.title}'s digital business card`,
    openGraph: {
      title: `${card.title} - Digital Business Card`,
      description: `View ${card.title}'s digital business card`,
      images: [card.front_image_url],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${card.title} - Digital Business Card`,
      description: `View ${card.title}'s digital business card`,
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

  return <SharedCardViewer card={card} />
}
