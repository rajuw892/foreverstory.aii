import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers/theme-provider";
import { ThemeToggle } from "./components/theme-toggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ForeverStory.ai - Turn Your Love Story Into an Animated Movie",
  description:
    "Transform your love story into a beautiful animated video in just 5 minutes. Choose from Studio Ghibli, Pixar, Anime, Disney, and Arcane styles. 12 languages supported.",
  keywords: [
    "love story video",
    "animated love story",
    "couple video maker",
    "AI video generator",
    "Ghibli style video",
    "wedding video",
    "anniversary gift",
  ],
  authors: [{ name: "ForeverStory.ai" }],
  openGraph: {
    title: "ForeverStory.ai - Turn Your Love Story Into an Animated Movie",
    description:
      "Transform your love story into a beautiful animated video in just 5 minutes.",
    type: "website",
    url: "https://foreverstory.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "ForeverStory.ai - Turn Your Love Story Into an Animated Movie",
    description:
      "Transform your love story into a beautiful animated video in just 5 minutes.",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f43f6e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#FFFBF5] text-gray-900 transition-colors duration-700 dark:bg-[#0F172A] dark:text-[#F1F5F9]`}
      >
        <ThemeProvider>
          <div className="fixed right-4 top-4 z-50 hidden md:flex">
            <ThemeToggle />
          </div>
          <div className="fixed right-4 bottom-6 z-50 md:hidden">
            <ThemeToggle className="shadow-[0_0_30px_rgba(96,165,250,0.35)]" />
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
