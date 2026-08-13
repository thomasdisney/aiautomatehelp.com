import type { MetadataRoute } from "next";

const site = "https://www.aiautomatehelp.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${site}/status`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${site}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${site}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}
