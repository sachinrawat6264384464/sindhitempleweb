import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import {
  getAllCategories,
  getCategoryBySlug,
  getCategoryWithBhajans,
} from "@/lib/content";
import { SITE_CONFIG, getCanonicalUrl } from "@/lib/config";
import BhajanCard from "@/components/BhajanCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((cat) => ({
    slug: cat.slug,
  }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  const title = `${category.name} (${category.romanName}) — Bhajan Lyrics`;
  const description = `${category.description} Read lyrics in Hindi and Roman transliteration.`;
  const canonicalUrl = getCanonicalUrl(`/categories/${category.slug}`);

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
      type: "website",
    },
    robots: SITE_CONFIG.enableIndexing
      ? { index: true, follow: true }
      : { index: false, follow: true },
  };
}

export default async function CategoryDetailPage({ params }: CategoryPageProps) {
  const categoryData = await getCategoryWithBhajans(params.slug);

  if (!categoryData) {
    notFound();
  }

  const allCategories = await getAllCategories();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${categoryData.name} (${categoryData.romanName})`,
    description: categoryData.description,
    url: getCanonicalUrl(`/categories/${categoryData.slug}`),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: categoryData.bhajans.length,
      itemListElement: categoryData.bhajans.map((bhajan, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: getCanonicalUrl(`/bhajans/${bhajan.slug}`),
        name: bhajan.title,
      })),
    },
  };

  return (
    <div className="space-y-8">
      <JsonLd data={jsonLd} />

      <Breadcrumbs
        items={[
          { label: "Categories", href: "/bhajans" },
          { label: `${categoryData.name} (${categoryData.romanName})` },
        ]}
      />

      {/* Category Header Card */}
      <header className="bg-white p-6 sm:p-10 rounded-3xl border border-stone-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
            <BookOpen className="w-5 h-5" aria-hidden="true" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
            Devotional Category
          </span>
        </div>

        <div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 leading-tight">
            {categoryData.name}
          </h1>
          <p className="text-lg sm:text-xl font-medium text-amber-800 mt-1">
            {categoryData.romanName}
          </p>
        </div>

        <p className="text-stone-600 text-sm sm:text-base max-w-2xl leading-relaxed">
          {categoryData.description}
        </p>

        <div className="pt-3 border-t border-stone-100 flex items-center gap-4 text-xs text-stone-500">
          <span>{categoryData.bhajans.length} demo bhajans in this category</span>
          <span>•</span>
          <span>Updated: {categoryData.updatedAt}</span>
        </div>
      </header>

      {/* Category Bhajans Grid */}
      <section aria-labelledby="category-bhajans-heading" className="space-y-4">
        <h2 id="category-bhajans-heading" className="font-serif text-2xl font-bold text-stone-900">
          Bhajans in this Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categoryData.bhajans.map((bhajan) => (
            <BhajanCard
              key={bhajan.id}
              bhajan={bhajan}
              categoryName={`${categoryData.name} (${categoryData.romanName})`}
            />
          ))}
        </div>
      </section>

      {/* Other Categories Switcher */}
      <nav aria-label="Other categories" className="pt-8 border-t border-stone-200 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">
          Other Categories
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {allCategories
            .filter((c) => c.slug !== categoryData.slug)
            .map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="p-4 rounded-xl bg-white border border-stone-200 hover:border-amber-400 hover:shadow-sm transition-all"
              >
                <span className="font-serif font-bold text-stone-900 text-sm block">
                  {cat.name}
                </span>
                <span className="text-xs text-amber-800 font-medium">
                  {cat.romanName}
                </span>
              </Link>
            ))}
        </div>
      </nav>
    </div>
  );
}
