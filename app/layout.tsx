import type { Metadata } from "next";
import { Geist, Source_Serif_4 } from "next/font/google";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AutomateAI — scoped automation, built to order",
    template: "%s · AutomateAI",
  },
  description:
    "One repetitive workflow at a time. Fixed quote after a brief. Paid before I start. No retainers, no fake case studies.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AutomateAI — scoped automation, built to order",
    description:
      "One repetitive workflow at a time. Fixed quote after a brief. Paid before I start.",
    url: siteUrl,
    siteName: "AutomateAI",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "AutomateAI",
    url: siteUrl,
    description:
      "Scoped AI automation built to order for small businesses. Fixed quote after a brief.",
  };

  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${sourceSerif.variable} bg-paper font-sans text-ink antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
