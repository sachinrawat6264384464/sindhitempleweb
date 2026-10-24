import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllCategories, getSearchIndex } from "@/lib/content";
import { SITE_CONFIG, getCanonicalUrl } from "@/lib/config";
import BhajanLibraryClient from "@/components/BhajanLibraryClient";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Bhajan Library — Search Devotional Lyrics & Chants",
  description:
    "Explore the complete collection of devotional bhajans with instant cross-script search, category filtering, and stanza-preserved reading views.",
  alternates: {
    canonical: getCanonicalUrl("/bhajans"),
  },
  // Ensure internal search/filter parameter combinations are treated safely
  robots: SITE_CONFIG.enableIndexing
    ? {
        index: true,
        follow: true,
      }
    : {
        index: false,
        follow: true,
      },
};

export default async function BhajansPage() {
  const [categories, searchIndex] = await Promise.all([
    getAllCategories(),
    getSearchIndex(),
  ]);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Devotional Bhajan Library",
    url: getCanonicalUrl("/bhajans"),
    description: "Full searchable library of devotional bhajans with Hindi and Roman scripts.",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: searchIndex.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: getCanonicalUrl(`/bhajans/${item.slug}`),
        name: item.title,
      })),
    },
  };

  return (
    <div className="space-y-6">
      <JsonLd data={collectionSchema} />

      <Breadcrumbs items={[{ label: "Bhajan Library", href: "/bhajans" }]} />

      <div className="space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
          Devotional Bhajan Library
        </h1>
        <p className="text-stone-600 text-sm sm:text-base max-w-3xl">
          Search across 8 demonstration bhajans using Hindi Devanagari or Roman phonetics. Filter
          by category, devotional theme tags, and script availability.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center text-stone-500 text-sm">
            Loading devotional library...
          </div>
        }
      >
        <BhajanLibraryClient
          initialRecords={searchIndex}
          categories={categories}
        />
      </Suspense>
    </div>
  );
}
