import Link from "next/link";
import { SITE_CONFIG } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold text-stone-100">
                सिंधी भजन लिरिक्स
              </span>
              <span className="text-xs text-amber-400 font-medium">
                Sindhi Bhajan Lyrics
              </span>
            </div>
            <p className="text-sm text-stone-400 max-w-md leading-relaxed">
              A serene devotional reader built for devotees, musicians, and singers. Features
              side-by-side Hindi script, Roman transliteration, and fast client search.
            </p>
            <div className="p-3 rounded-lg bg-stone-800/80 border border-stone-700/60 text-xs text-amber-200/90 leading-relaxed max-w-lg">
              <strong className="text-amber-300 font-semibold">Demo Notice:</strong> This version
              contains 8 demonstration samples across 4 sample categories. Replace with verified
              Sindhi devotional bhajans prior to production indexing.
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3">
              Categories
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/categories/guru-bhakti"
                  className="hover:text-amber-300 transition-colors"
                >
                  गुरु भक्ति (Guru Bhakti)
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/prarthana"
                  className="hover:text-amber-300 transition-colors"
                >
                  प्रार्थना (Prarthana)
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/naam-smaran"
                  className="hover:text-amber-300 transition-colors"
                >
                  नाम स्मरण (Naam Smaran)
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/aarti"
                  className="hover:text-amber-300 transition-colors"
                >
                  आरती (Aarti)
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation & Documentation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3">
              Information
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-amber-300 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/bhajans" className="hover:text-amber-300 transition-colors">
                  Bhajan Library
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber-300 transition-colors">
                  About & Source Guide
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} {SITE_CONFIG.name}. Demonstration framework.</p>
          <p className="flex items-center gap-1">
            Built with reverence for sacred devotional music.
          </p>
        </div>
      </div>
    </footer>
  );
}
