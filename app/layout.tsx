import Script from "next/script";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/Analytics";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://theqexle.com"),
  title: {
    default: "theqexle | Simplify Complex Text Instantly with AI",
    template: "%s | theqexle",
  },
  description:
    "Transform complex jargon, legal documents, and technical writing into simple, easy-to-understand language. AI-powered text simplification with multiple personas: ELI5, TL;DR, Professional, and more. Support for images, audio, and 11+ languages.",
  keywords: [
    "theqexle",
    "plain english converter",
    "text simplifier",
    "simplify text",
    "jargon buster",
    "AI text simplification",
    "legal document simplifier",
    "technical writing simplifier",
    "ELI5 generator",
    "TL;DR generator",
    "easy to read",
    "5th grade reading level",
    "document analyzer",
    "image to text",
    "OCR simplifier",
    "multilingual text simplification",
  ],
  authors: [{ name: "Susith Alwis", url: "https://github.com/SusithD" }],
  creator: "Susith Alwis",
  publisher: "theqexle",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://theqexle.com",
    title: "theqexle | Simplify Complex Text Instantly with AI",
    description:
      "Transform complex jargon, legal documents, and technical writing into simple, easy-to-understand language. AI-powered text simplification with multiple personas.",
    siteName: "theqexle",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "theqexle - Plain English Converter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "theqexle | Simplify Complex Text Instantly with AI",
    description:
      "Transform complex jargon into plain English. AI-powered text simplification with ELI5, TL;DR, Professional modes and more.",
    creator: "@SusithD",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://theqexle.com",
  },
  category: "technology",
  verification: {
    // Add your verification tokens here when available
    // google: "your-google-verification-token",
    // yandex: "your-yandex-verification-token",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Analytics />
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-M9RPXVLYRC"
        ></Script>
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-M9RPXVLYRC');
          `}
        </Script>
      </body>
    </html>
  );
}
