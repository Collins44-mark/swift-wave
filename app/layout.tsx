import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import { NavigationProgress } from "@/components/navigation/NavigationProgress";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Swift Wave Group of Companies",
    template: "%s",
  },
  description:
    "Swift Wave Group — international multi-division organization delivering excellence across industries.",
  icons: {
    icon: "/assets/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
          <link rel="stylesheet" href="/css/styles.css?v=outfit-cart-2" />
      </head>
      <body className="min-h-screen w-full overflow-x-hidden">
        <Script
          src="https://cdn.tailwindcss.com"
          strategy="beforeInteractive"
        />
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
