import type { Metadata, Viewport } from "next";
import { Geist, Source_Serif_4 } from "next/font/google";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { paymentConfigured } from "@/lib/payment";
import { siteMetaDescription } from "@/lib/site-copy";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

const siteUrl = "https://www.aiautomatehelp.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f6f1e8",
};

export async function generateMetadata(): Promise<Metadata> {
  const description = siteMetaDescription(paymentConfigured());
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "AutomateAI — scoped automation, built to order",
      template: "%s · AutomateAI",
    },
    description,
    openGraph: {
      url: "./",
      siteName: "AutomateAI",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "AutomateAI",
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: "/icon.svg",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${sourceSerif.variable} bg-paper font-sans text-ink antialiased`}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
