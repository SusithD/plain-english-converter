import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "theqexle | Simplify Complex Text Instantly",
  description:
    "Transform complex jargon, legal documents, and technical writing into simple, easy-to-understand language. Powered by AI.",
  keywords: [
    "theqexle",
    "plain english",
    "text simplifier",
    "simplify text",
    "jargon buster",
    "easy to read",
    "5th grade reading level",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
