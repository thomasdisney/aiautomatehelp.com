import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { SITE_URL } from "@/lib/site-config";
import "./globals.css";

// Fonts are self-hosted from /public/fonts (OFL, see NOTICES.md). No web-font
// download from Google or any other host.
const description =
  "notjunk.si turns a spare computer into a coding agent you run from your phone. You approve every change.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#e3e8e2",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "notjunk.si",
    template: "%s | notjunk.si",
  },
  description,
  openGraph: {
    url: "./",
    siteName: "notjunk.si",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "notjunk.si",
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
        className="antialiased"
      >
        <a
          href="#main"
          className="skip-link"
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
