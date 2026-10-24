import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { getAllCategories, getAllBhajans } from "@/lib/content";
import { SITE_CONFIG, getCanonicalUrl } from "@/lib/config";
import BhajanCard from "@/components/BhajanCard";
import HomeLyricsPreview from "@/components/HomeLyricsPreview";
import JsonLd from "@/components/JsonLd";

export const revalidate = false; // SSG static build

export default async function HomePage() {
  const categories = await getAllCategories();
  const allBhajans = await getAllBhajans();

  // Structured data (WebSite schema)
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    alternateName: "Sindhi Bhajans",
    url: SITE_CONFIG.siteUrl,
    description: SITE_CONFIG.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_CONFIG.siteUrl}/bhajans?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="space-y-16">
      <JsonLd data={websiteSchema} />

      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto pt-4 sm:pt-8 pb-2">
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-stone-900 tracking-tight leading-tight">
          सिंधी भजन लिरिक्स
          <span className="block text-xl sm:text-2xl md:text-3xl font-sans font-medium text-amber-800 mt-3">
            Devotional Bhajan Lyrics &amp; Transliteration
          </span>
        </h1>
      </section>

      {/* Categories Grid */}
      <section aria-labelledby="categories-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-stone-200 pb-4">
          <div>
            <h2
              id="categories-heading"
              className="font-serif text-2xl sm:text-3xl font-bold text-stone-900"
            >
              Browse by Category
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Select a devotional category to view authentic stanzas and chanting guides
            </p>
          </div>
          <Link
            href="/bhajans"
            className="text-xs sm:text-sm font-semibold text-amber-800 hover:text-amber-950 inline-flex items-center gap-1"
          >
            <span>View all 8 bhajans</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((category) => {
            const count = allBhajans.filter((b) => b.categoryId === category.id).length;
            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group bg-white p-6 rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-md hover:border-amber-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-amber-200/60">
                    <BookOpen className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-stone-900 group-hover:text-amber-800 transition-colors mb-1">
                    {category.name}
                  </h3>
                  <p className="text-xs font-semibold text-amber-800 mb-2">
                    {category.romanName}
                  </p>
                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                    {category.description}
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-amber-800">
                  <span className="text-stone-500 font-normal">{count} bhajans</span>
                  <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Demonstration Bhajans */}
      <section aria-labelledby="featured-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-stone-200 pb-4">
          <div>
            <h2
              id="featured-heading"
              className="font-serif text-2xl sm:text-3xl font-bold text-stone-900"
            >
              Featured Devotional Selections
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Sample compositions rendered with full stanza line breaks and Roman transliteration
            </p>
          </div>
          <Link
            href="/bhajans"
            className="text-xs sm:text-sm font-semibold text-amber-800 hover:text-amber-950 inline-flex items-center gap-1"
          >
            <span>Open Library &amp; Multi-Filters</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allBhajans.slice(0, 6).map((bhajan) => (
            <BhajanCard key={bhajan.id} bhajan={bhajan} />
          ))}
        </div>
      </section>

      {/* Interactive Live Lyrics Preview Section right before footer */}
      <HomeLyricsPreview bhajans={allBhajans} />
    </div>
  );
}
