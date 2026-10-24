import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, BookOpen, CheckCircle2, ShieldCheck } from "lucide-react";
import { SITE_CONFIG, getCanonicalUrl } from "@/lib/config";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "About & Content Architecture — Sindhi Bhajan Lyrics",
  description:
    "Learn about the devotional reader architecture, demonstration content status, JSON content replacement instructions, and the production launch checklist.",
  alternates: {
    canonical: getCanonicalUrl("/about"),
  },
  robots: SITE_CONFIG.enableIndexing
    ? { index: true, follow: true }
    : { index: false, follow: true },
};

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Sindhi Bhajan Lyrics Reader",
    description: "Documentation and editorial notes regarding devotional bhajan content and architecture.",
    url: getCanonicalUrl("/about"),
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.siteUrl,
    },
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <JsonLd data={jsonLd} />

      <Breadcrumbs items={[{ label: "About & Content Sources" }]} />

      {/* Main Title */}
      <header className="space-y-3">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
          <span>Documentation &amp; Editorial Standards</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 leading-tight">
          About the Bhajan Reader &amp; Sources
        </h1>
        <p className="text-stone-600 text-base sm:text-lg leading-relaxed">
          A high-performance devotional lyrics reader built with Next.js App Router, TypeScript, and
          Tailwind CSS. Designed for rapid offline-first browsing, legible chanting layouts, and easy
          content governance.
        </p>
      </header>

      {/* Strict Demo Disclaimer Card */}
      <section
        aria-label="Editorial Notice"
        className="p-6 sm:p-8 rounded-3xl bg-amber-50 border border-amber-200 text-stone-800 space-y-4 shadow-sm"
      >
        <div className="flex items-center gap-3 text-amber-950">
          <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0" aria-hidden="true" />
          <h2 className="font-serif text-xl sm:text-2xl font-bold">
            Demonstration Content Notice
          </h2>
        </div>
        <p className="text-sm sm:text-base leading-relaxed text-stone-700">
          <strong>Important:</strong> All 8 bhajans and 4 categories currently in this codebase are
          sample demonstration compositions. They are labeled clearly as:
        </p>
        <blockquote className="p-3 bg-white/80 rounded-xl border-l-4 border-amber-600 font-mono text-xs sm:text-sm text-stone-900">
          &ldquo;{SITE_CONFIG.demoNoticeText}&rdquo;
        </blockquote>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          These samples are provided in Hindi script and Roman transliteration to demonstrate the
          reader interface, search indexing, and typography. They do not constitute authentic Sindhi
          translations, historical manuscripts, or canonical sectarian literature.
        </p>
      </section>

      {/* Content Architecture & JSON Storage Guide */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">
            Local JSON Content Architecture
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            Content is stored cleanly in local JSON files without a database, allowing zero-latency
            static builds and simple version control. All UI components access content via reusable
            functions in <code className="px-1.5 py-0.5 rounded bg-stone-100 font-mono text-xs">src/lib/content.ts</code>,
            ensuring you can transition to a SQL/NoSQL database in the future without rewriting UI logic.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-900">
            File Structure
          </h3>
          <div className="bg-stone-900 text-stone-200 p-4 rounded-2xl font-mono text-xs overflow-x-auto space-y-1">
            <p className="text-stone-400">// Categories registry</p>
            <p className="text-amber-400">content/categories.json</p>
            <p className="text-stone-400 mt-2">// Individual bhajan files (one JSON file per bhajan)</p>
            <p>content/bhajans/satguru-charan-kamal-dhyaan.json</p>
            <p>content/bhajans/guru-kripa-se-mukt-bhayi.json</p>
            <p>content/bhajans/vinati-sun-he-prabhu-dayaala.json</p>
            <p>content/bhajans/he-deva-tumhi-ek-sahara.json</p>
            <p>content/bhajans/shri-ram-naam-ras-pijiye.json</p>
            <p>content/bhajans/om-namah-shivaya-dhun-amrit.json</p>
            <p>content/bhajans/deep-jale-mangal-aarti.json</p>
            <p>content/bhajans/sundar-jyoti-aarti-vandana.json</p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-900">
            JSON Schema Fields
          </h3>
          <ul className="text-xs sm:text-sm text-stone-700 space-y-2 list-disc list-inside">
            <li>
              <strong className="text-stone-900">id</strong>: Unique string identifier (e.g. <code className="bg-stone-100 px-1 py-0.5 rounded">bhajan-gb-01</code>)
            </li>
            <li>
              <strong className="text-stone-900">slug</strong>: URL path segment (e.g. <code className="bg-stone-100 px-1 py-0.5 rounded">satguru-charan-kamal-dhyaan</code>)
            </li>
            <li>
              <strong className="text-stone-900">categoryId</strong>: Matching category identifier
            </li>
            <li>
              <strong className="text-stone-900">title &amp; romanTitle</strong>: Devanagari and Latin phonetic titles
            </li>
            <li>
              <strong className="text-stone-900">lyrics</strong>: Array of stanzas containing arrays of lines (<code className="bg-stone-100 px-1 py-0.5 rounded">string[][]</code>)
            </li>
            <li>
              <strong className="text-stone-900">romanLyrics</strong>: Roman phonetic transliteration stanzas (<code className="bg-stone-100 px-1 py-0.5 rounded">string[][]</code>)
            </li>
            <li>
              <strong className="text-stone-900">alternateSpellings</strong>: Cross-script aliases and search keywords
            </li>
            <li>
              <strong className="text-stone-900">tags</strong>: Devotional topics for multi-filter discovery
            </li>
          </ul>
        </div>
      </section>

      {/* Guide: Replacing Demo Content with Real Bhajans */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-700" />
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            How to Replace Demo Content with Verified Real Bhajans
          </h2>
        </div>

        <ol className="space-y-4 text-xs sm:text-sm text-stone-700 list-decimal list-inside">
          <li className="leading-relaxed">
            <strong className="text-stone-900">Gather Authentic Lyrics:</strong> Transcribe verified
            Sindhi devotional songs from authentic songbooks, community recordings, or verified audio.
          </li>
          <li className="leading-relaxed">
            <strong className="text-stone-900">Update Categories:</strong> Edit{" "}
            <code className="bg-stone-100 px-1 py-0.5 rounded">content/categories.json</code> with
            your chosen thematic categories.
          </li>
          <li className="leading-relaxed">
            <strong className="text-stone-900">Create or Overwrite Bhajan Files:</strong> Add your
            new JSON files into <code className="bg-stone-100 px-1 py-0.5 rounded">content/bhajans/</code>.
            Ensure <code className="bg-stone-100 px-1 py-0.5 rounded">isDemo</code> is set to <code className="text-amber-800">false</code> and update the <code className="bg-stone-100 px-1 py-0.5 rounded">source</code> attribute with accurate bibliographic references.
          </li>
          <li className="leading-relaxed">
            <strong className="text-stone-900">Run Validation:</strong> Run{" "}
            <code className="bg-stone-100 px-1 py-0.5 rounded font-mono">npm run prebuild</code> to
            verify unique slugs, required fields, and non-empty stanzas.
          </li>
          <li className="leading-relaxed">
            <strong className="text-stone-900">Enable Production Indexing:</strong> In your environment
            variables (or <code className="bg-stone-100 px-1 py-0.5 rounded">.env.production</code>), set:
            <pre className="mt-2 bg-stone-900 text-amber-300 p-3 rounded-xl font-mono text-xs">
NEXT_PUBLIC_ENABLE_INDEXING="true"&#10;NEXT_PUBLIC_SITE_URL="https://your-production-domain.com"
            </pre>
          </li>
          <li className="leading-relaxed">
            <strong className="text-stone-900">Deploy:</strong> Trigger a new static build and deploy.
            Because all pages are statically pre-rendered at build time, any content update requires a
            fresh build/deploy.
          </li>
        </ol>
      </section>

      {/* Production Discovery & Search Engine Checklist */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-700" />
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            Production Discovery &amp; Search Engine Checklist
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Follow these sequential steps when transitioning this website from demo mode to public
          production launch:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-stone-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>1. HTTPS &amp; Canonical Domain</span>
            </div>
            <p className="text-stone-600 text-xs">
              Ensure SSL/TLS is active with automated certificate renewal. Set your exact production
              URL in <code className="bg-white px-1 py-0.5 rounded border border-stone-200">NEXT_PUBLIC_SITE_URL</code>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-stone-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>2. Verified Real Content</span>
            </div>
            <p className="text-stone-600 text-xs">
              Confirm all demo placeholder notices are removed and that authentic devotional verses
              have been reviewed for spelling accuracy and stanza flow.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-stone-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>3. Search Console Verification</span>
            </div>
            <p className="text-stone-600 text-xs">
              Verify domain ownership in Google Search Console and Bing Webmaster Tools via DNS TXT
              record.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-stone-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>4. Submit Generated Sitemap</span>
            </div>
            <p className="text-stone-600 text-xs">
              Submit <code className="bg-white px-1 py-0.5 rounded border border-stone-200">/sitemap.xml</code> in
              Google Search Console. Ensure no demo pages or internal filter query parameters are listed.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-stone-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>5. Inspect URL &amp; Live Test</span>
            </div>
            <p className="text-stone-600 text-xs">
              Use URL Inspection tool on the homepage, a category page, and a bhajan page to confirm
              that Googlebot renders the full lyrics from the initial HTML.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-stone-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>6. Bot Crawler Configuration</span>
            </div>
            <p className="text-stone-600 text-xs">
              Our <code className="bg-white px-1 py-0.5 rounded border border-stone-200">robots.ts</code> explicitly
              allows Googlebot, Bingbot, and OAI-SearchBot (ChatGPT search indexer) while managing
              GPTBot training access separately.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
