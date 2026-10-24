import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllBhajans,
  getBhajanBySlug,
  getCategoryBySlug,
  getAdjacentBhajansInCategory,
  getRelatedBhajans,
} from "@/lib/content";
import { SITE_CONFIG, getCanonicalUrl } from "@/lib/config";
import LyricsReaderClient from "@/components/LyricsReaderClient";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";

interface BhajanPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const bhajans = await getAllBhajans();
  return bhajans.map((b) => ({
    slug: b.slug,
  }));
}

export async function generateMetadata({
  params,
}: BhajanPageProps): Promise<Metadata> {
  const bhajan = await getBhajanBySlug(params.slug);
  if (!bhajan) {
    return {
      title: "Bhajan Not Found",
    };
  }

  const category = await getCategoryBySlug(bhajan.categoryId);
  const categoryName = category ? `${category.name} (${category.romanName})` : bhajan.categoryId;

  const title = `${bhajan.title} (${bhajan.romanTitle}) — Lyrics & Transliteration`;
  const description = `Read full devotional lyrics for ${bhajan.title} in ${categoryName}. First line: “${bhajan.firstLine}”. Complete Devanagari and Roman transliteration.`;
  const canonicalUrl = getCanonicalUrl(`/bhajans/${bhajan.slug}`);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "article",
      modifiedTime: bhajan.updatedAt,
      tags: bhajan.tags,
    },
    robots: SITE_CONFIG.enableIndexing
      ? { index: true, follow: true }
      : { index: false, follow: true },
  };
}

export default async function BhajanDetailPage({ params }: BhajanPageProps) {
  const bhajan = await getBhajanBySlug(params.slug);

  if (!bhajan) {
    notFound();
  }

  const category = await getCategoryBySlug(bhajan.categoryId);
  if (!category) {
    notFound();
  }

  const [{ prev, next }, related] = await Promise.all([
    getAdjacentBhajansInCategory(bhajan.id, category.id),
    getRelatedBhajans(bhajan, 3),
  ]);

  // CreativeWork JSON-LD
  const creativeWorkSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: bhajan.title,
    alternateName: bhajan.romanTitle,
    inLanguage: ["hi", "en-IN"],
    genre: "Devotional Music / Bhajan",
    about: {
      "@type": "Thing",
      name: category.romanName,
      alternateName: category.name,
    },
    text: bhajan.lyrics.map((s) => s.join(" ")).join("\n\n"),
    keywords: bhajan.tags.join(", "),
    dateModified: bhajan.updatedAt,
    url: getCanonicalUrl(`/bhajans/${bhajan.slug}`),
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.siteUrl,
    },
  };

  // Breadcrumbs JSON-LD
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: getCanonicalUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: category.romanName,
        item: getCanonicalUrl(`/categories/${category.slug}`),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: bhajan.romanTitle,
        item: getCanonicalUrl(`/bhajans/${bhajan.slug}`),
      },
    ],
  };

  return (
    <div className="space-y-6">
      <JsonLd data={creativeWorkSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Breadcrumbs
        items={[
          { label: "Bhajans", href: "/bhajans" },
          { label: category.romanName, href: `/categories/${category.slug}` },
          { label: bhajan.romanTitle },
        ]}
      />

      {/* Semantic SSR lyrics fallback for crawlers & assistive technologies */}
      <noscript>
        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 mb-6">
          <h2 className="text-xl font-bold font-serif mb-2">{bhajan.title}</h2>
          <p className="italic text-stone-600 mb-4">{bhajan.romanTitle}</p>
          <div className="space-y-4">
            {bhajan.lyrics.map((st, i) => (
              <div key={i} className="space-y-1">
                {st.map((line, li) => (
                  <p key={li}>{line}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </noscript>

      {/* Interactive Reader Client Component */}
      <LyricsReaderClient
        bhajan={bhajan}
        category={category}
        prevBhajan={prev}
        nextBhajan={next}
        relatedBhajans={related}
      />
    </div>
  );
}
