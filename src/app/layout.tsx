import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { DevNav } from "@/components/DevNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LegalSimple.ai - AI Legal Assistant",
  description: "AI-powered legal intake assistant and court document drafting for Arizona, Nevada, and Texas. Family Law, Personal Injury, Estate Planning.",
  keywords: ["legal", "AI", "court documents", "family law", "personal injury", "estate planning", "Arizona", "Nevada", "Texas"],
};

const MOCK_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-right" />
        {MOCK_MODE && <DevNav />}
      </body>
    </html>
  );
}
