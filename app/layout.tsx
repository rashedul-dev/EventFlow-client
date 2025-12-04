import type React from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { BrandedToaster } from "@/components/ui/branded-toast";
import { QueryProvider } from "@/lib/api/query-client";
import { SupportChat } from "@/components/realtime/support-chat";
import "./globals.css";
import { GlobalErrorBoundary } from "@/lib/error";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "EventFlow | Modern Event Management Platform",
  description:
    "Create, discover, and manage unforgettable events. The all-in-one platform for event organizers and attendees.",
  keywords: ["events", "tickets", "event management", "concerts", "conferences", "festivals"],
  authors: [{ name: "EventFlow" }],
  creator: "EventFlow",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "EventFlow",
    title: "EventFlow | Modern Event Management Platform",
    description: "Create, discover, and manage unforgettable events.",
  },
  twitter: {
    card: "summary_large_image",
    title: "EventFlow | Modern Event Management Platform",
    description: "Create, discover, and manage unforgettable events.",
  },
  generator: "v0.app",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-background`}>
        <QueryProvider>
          <GlobalErrorBoundary>{children}</GlobalErrorBoundary>
          <BrandedToaster />
          <SupportChat />
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
