import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://www.proconnectsa.co.za";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE}/providers`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/providers/browse`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE}/how-it-works`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/request-quote`, changeFrequency: "weekly", priority: 0.7 },
  ];

  // Seed popular categories and cities
  const categories = ["plumbing", "electrical", "cleaning", "painting"];
  const cities = ["Johannesburg", "Cape%20Town", "Durban", "Pretoria"];

  const categoryRoutes = categories.map((c) => ({
    url: `${SITE}/providers/category/${c}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
  const cityRoutes = cities.map((c) => ({
    url: `${SITE}/providers/city/${c}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...cityRoutes];
}

