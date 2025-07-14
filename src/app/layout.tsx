import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/SessionProvider";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
