import type { Metadata } from "next";
import { Suspense } from "react";
import { Playfair_Display, Inter } from "next/font/google";
import SmoothScroll from "@/components/ui/SmoothScroll";
import PageTransitionLoader from "@/components/ui/PageTransitionLoader";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Cleopatra — Handcrafted Pure Beauty from Germany",
  description:
    "Premium handmade cosmetics crafted in small batches using natural ingredients. Sustainable beauty from our German atelier.",
  keywords: [
    "handmade soap",
    "natural cosmetics",
    "German cosmetics",
    "organic beauty",
    "cold process soap",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-cream text-foreground font-sans antialiased">
        <SmoothScroll>{children}</SmoothScroll>
        <Suspense fallback={null}>
          <PageTransitionLoader />
        </Suspense>
      </body>
    </html>
  );
}
