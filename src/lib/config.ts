export const SITE_CONFIG = {
  name: "Sindhi Bhajan Lyrics",
  shortName: "Sindhi Bhajans",
  tagline: "Devotional lyrics collection with Hindi & Roman script reading",
  description:
    "A clean, devotional reader for Sindhi bhajans featuring Hindi text, Roman transliteration, stanza-preserved formatting, and fast offline-first search.",
  // Production canonical base URL configurable via environment variable:
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "https://sindhibhajans.example.com").replace(/\/$/, ""),
  
  // Demo indexing safety flag:
  // By default false: prevents search engines from indexing demonstration/unverified content.
  // Set NEXT_PUBLIC_ENABLE_INDEXING="true" in production once real verified lyrics are loaded.
  enableIndexing: process.env.NEXT_PUBLIC_ENABLE_INDEXING === "true",

  demoNoticeText: "Demo content — replace with verified Sindhi bhajan lyrics.",
  editorialNotice:
    "Demonstration collection only. Do not claim historical provenance, religious authority, or verified Sindhi translations. Content is provided in Hindi script and Roman transliteration for functional preview.",
  
  contactEmail: "admin@sindhibhajans.example.com",
};

export function getCanonicalUrl(path: string = ""): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_CONFIG.siteUrl}${cleanPath === "/" ? "" : cleanPath}`;
}
