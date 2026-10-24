import { MetadataRoute } from "next";
import { getAllCategories, getAllBhajans } from "@/lib/content";
import { SITE_CONFIG, getCanonicalUrl } from "@/lib/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Demo Indexing Safety:
  // If indexing is disabled (demo mode), exclude demo bhajan pages from the sitemap to prevent indexing
  if (!SITE_CONFIG.enableIndexing) {
    return [
      {
        url: getCanonicalUrl("/"),
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1.0,
      },
      {
        url: getCanonicalUrl("/about"),
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
    ];
  }

  const [categories, bhajans] = await Promise.all([
    getAllCategories(),
    getAllBhajans(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: getCanonicalUrl("/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: getCanonicalUrl("/bhajans"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: getCanonicalUrl("/about"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: getCanonicalUrl(`/categories/${cat.slug}`),
    lastModified: new Date(cat.updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const bhajanEntries: MetadataRoute.Sitemap = bhajans
    .filter((b) => !b.isDemo || SITE_CONFIG.enableIndexing)
    .map((bhajan) => ({
      url: getCanonicalUrl(`/bhajans/${bhajan.slug}`),
      lastModified: new Date(bhajan.updatedAt),
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  return [...staticEntries, ...categoryEntries, ...bhajanEntries];
}
