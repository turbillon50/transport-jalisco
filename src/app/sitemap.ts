import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://mtempresarial.life";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/sign-in`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/sign-up`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/role`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];
}
