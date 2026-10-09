import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { SITE_URL } from "@/lib/site-config";
import "./globals.css";

// System fonts only: no web-font download from Google or any other host.
const description =
  "Junk Drawer Agents turns a spare computer into a coding agent you run from your phone. You approve every change.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f6f1e8",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Junk Drawer Agents",
    template: "%s | Junk Drawer Agents",
  },
  description,
  openGraph: {
    url: "./",
    siteName: "Junk Drawer Agents",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Junk Drawer Agents",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="bg-paper font-sans text-ink antialiased"
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
