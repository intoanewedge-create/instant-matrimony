import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeStyleInjector } from "@/components/theme-style-injector";
import { PwaRegister } from "@/components/pwa-register";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-poppins",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "InstantMatrimony | Verified Matches & Lifetime Partnerships",
    template: "%s | InstantMatrimony",
  },
  description: "Find your ideal life partner with India's premier verified matrimonial platform. Features advanced AI compatibility, secure privacy controls, and direct communication.",
  keywords: ["matrimony", "wedding", "marriage portal", "shaadi", "verified match", "partner search"],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "InstantMatrimony - Verified Matches & Lifetime Partnerships",
    description: "Connect with verified single professionals across communities with maximum privacy.",
    url: "https://instantmatrimony.com",
    siteName: "InstantMatrimony",
    locale: "en_IN",
    type: "website",
  },
};

import { Suspense } from "react";
import { TopNavigationProgressBar } from "@/components/ui/top-navigation-progress-bar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-rose-500 selection:text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <ToastProvider>
            <Suspense fallback={null}>
              <TopNavigationProgressBar />
            </Suspense>
            <ThemeStyleInjector />
            {children}
            <PwaRegister />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

