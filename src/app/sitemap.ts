import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.neatcurbllc.com";
  const lastModified = new Date();

  return [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: `${baseUrl}/services`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.85
    },
    {
      url: `${baseUrl}/request-quote`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8
    },
    {
      url: `${baseUrl}/admin/login`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4
    }
  ];
}
