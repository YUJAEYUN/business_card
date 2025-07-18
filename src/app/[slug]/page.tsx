import { notFound } from 'next/navigation'

export default function CustomSlugPage() { notFound(); return null; }

export async function generateMetadata() {
  return {
    title: 'Business Card Not Found',
    description: 'Business Card Not Found',
    openGraph: {
      title: 'Business Card Not Found',
      description: 'Business Card Not Found',
      images: [],
    },
  }
}