import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "USDT Mining Lab - Premium Cloud Mining Platform",
  description: "Earn stable daily profit with USDT cloud mining. 4% daily returns, instant withdrawals, secure BEP20 network. Start mining today!",
  keywords: ["USDT", "Mining", "Cloud Mining", "Cryptocurrency", "BEP20", "USDT Mining", "Crypto Investment", "Daily Profit"],
  authors: [{ name: "USDT Mining Lab" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "USDT Mining Lab",
    description: "Premium Cloud Mining Platform - Earn 4% Daily Profit",
    url: "https://usdtmining.lab",
    siteName: "USDT Mining Lab",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "USDT Mining Lab",
    description: "Premium Cloud Mining Platform - Earn 4% Daily Profit",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
