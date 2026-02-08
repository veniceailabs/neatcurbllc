import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.neatcurbllc.com";
  const lastModified = new Date();

  return [
    {
      url: `${baseUrl}/site`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: `${baseUrl}/lead-intake`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8
    }
  ];
}
