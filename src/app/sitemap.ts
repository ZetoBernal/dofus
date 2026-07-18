import type { MetadataRoute } from "next";
import { GUIDES } from "@/lib/guides";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    ...GUIDES.map((g) => ({
      url: `${SITE_URL}/guias/${g.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
