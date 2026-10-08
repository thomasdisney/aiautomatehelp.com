import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

const site = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${site}/help`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];
}
