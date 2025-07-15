import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import MyCardWrapper from '@/components/CardViewer/MyCardWrapper'
import { Database } from '@/lib/supabase'

type BusinessCard = Database['public']['Tables']['business_cards']['Row']

interface MyCardPageProps {
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



export async function generateMetadata({ params }: MyCardPageProps) {
  const { id } = await params
  const card = await getBusinessCard(id)
  
  if (!card) {
    return {
      title: 'Business Card Not Found',
    }
  }

  return {
    title: `Manage ${card.title} - Digital Business Card`,
    description: `Manage and share ${card.title}'s digital business card`,
  }
}

export default async function MyCardPage({ params }: MyCardPageProps) {
  const { id } = await params
  const card = await getBusinessCard(id)

  if (!card) {
    notFound()
  }

  return <MyCardWrapper card={card} />
}
