import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { AuthProvider } from "@/contexts/AuthContext";
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';

export const metadata: Metadata = {
  title: "Digital Business Card - Create & Share Beautiful Cards",
  description: "Create stunning digital business cards with flip animations. Upload your card images and share them with a unique URL and QR code.",
  keywords: "digital business card, business card, QR code, card flip animation, professional networking",
  authors: [{ name: "Digital Business Card" }],
  openGraph: {
    title: "Digital Business Card - Create & Share Beautiful Cards",
    description: "Create stunning digital business cards with flip animations. Upload your card images and share them with a unique URL and QR code.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital Business Card - Create & Share Beautiful Cards",
    description: "Create stunning digital business cards with flip animations. Upload your card images and share them with a unique URL and QR code.",
  },
};

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
