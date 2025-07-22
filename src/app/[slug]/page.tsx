import { notFound } from 'next/navigation'

export default function CustomSlugPage() { notFound(); return null; }

export async function generateMetadata() {
  return {
    title: 'Card Not Found - Swivel',
    description: 'Card Not Found - Swivel',
    openGraph: {
      title: 'Card Not Found - Swivel',
      description: 'Card Not Found - Swivel',
      images: [],
    },
  }
}