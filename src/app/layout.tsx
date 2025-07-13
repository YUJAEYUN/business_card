import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
