export const SITE_CONFIG = {
  name: "Sindhi Bhajan Lyrics",
  shortName: "Sindhi Bhajans",
  tagline: "Devotional lyrics collection with Hindi & Roman script reading",
  description:
    "Shri Amarapur Vaani — Complete sacred devotional collection of 921 bhajans composed by Shri 1008 Sadguru Swami Teunram Ji Maharaj, arranged across 25 classical Raags with Roman transliteration.",
  // Production canonical base URL configurable via environment variable:
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "https://sindhibhajans.example.com").replace(/\/$/, ""),
  
  // Production indexing flag:
  enableIndexing: process.env.NEXT_PUBLIC_ENABLE_INDEXING === "true",

  demoNoticeText: "Shri Amarapur Vaani — Sadguru Swami Teunram Ji Maharaj",
  editorialNotice:
    "Authentic sacred compositions from Shri Amarapur Vaani (Prem Prakash Mandal, Jaipur) by Shri 1008 Sadguru Swami Teunram Ji Maharaj, featuring 921 bhajans across 25 classical Raags.",
  
  contactEmail: "admin@sindhibhajans.example.com",
  socialLinks: {
    instagram: "https://www.instagram.com/amrapur_darbar?igsh=MTNyejFlMDFzYW42MA%3D%3D",
    youtube: "https://www.youtube.com/channel/UCCzZEZI_Vv-A-1_TAF2fRLw",
  },
};

export function getCanonicalUrl(path: string = ""): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_CONFIG.siteUrl}${cleanPath === "/" ? "" : cleanPath}`;
}
