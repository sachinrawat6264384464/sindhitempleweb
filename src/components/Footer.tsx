import Link from "next/link";
import Image from "next/image";
import { Instagram, Youtube } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-[#f9d5a6]/30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 shrink-0 rounded-full overflow-hidden border border-[#f9d5a6] shadow-sm bg-white/95 p-0.5">
                <Image
                  src="/image.png"
                  alt="Amrapur Darbar Official Logo"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold text-stone-100">
                  सिंधी भजन लिरिक्स
                </span>
                <span className="text-xs text-[#f9d5a6] font-medium tracking-wide">
                  Shri Amarapur Vaani
                </span>
              </div>
            </div>
            <p className="text-sm text-stone-400 max-w-md leading-relaxed">
              Devotional reader for sacred Sindhi bhajans composed by Shri 1008 Sadguru Swami
              Teunram Ji Maharaj, with side-by-side Hindi script, Roman transliteration, and fast search.
            </p>

            {/* Official Social Media Channels */}
            <div className="pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#f9d5a6] block mb-2.5">
                Amrapur Darbar Official Channels
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={SITE_CONFIG.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-800/90 hover:bg-pink-950/50 border border-stone-700 hover:border-pink-500/60 text-xs font-medium text-stone-200 hover:text-pink-300 transition-colors group"
                >
                  <Instagram className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
                  <span>Instagram @amrapur_darbar</span>
                </a>
                <a
                  href={SITE_CONFIG.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-800/90 hover:bg-red-950/50 border border-stone-700 hover:border-red-500/60 text-xs font-medium text-stone-200 hover:text-red-300 transition-colors group"
                >
                  <Youtube className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                  <span>YouTube Channel</span>
                </a>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-stone-800/80 border border-stone-700/60 text-xs text-stone-300 leading-relaxed max-w-lg">
              <strong className="text-[#f9d5a6] font-semibold">Source:</strong> Shri Amarapur Vaani —
              Composed by Shri 1008 Sadguru Swami Teunram Ji Maharaj (Prem Prakash Mandal, Jaipur).
              Featuring 921 authentic sacred bhajans arranged across 25 classical Raags.
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#f9d5a6] mb-3">
              Categories
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/categories/raag-bhairav"
                  className="hover:text-[#f9d5a6] transition-colors"
                >
                  राग भैरव (Raag Bhairav)
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/raag-raamkali"
                  className="hover:text-[#f9d5a6] transition-colors"
                >
                  राग रामकली (Raag Raamkali)
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/raag-prabhaati"
                  className="hover:text-[#f9d5a6] transition-colors"
                >
                  राग प्रभाती (Raag Prabhaati)
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/raag-aasaa"
                  className="hover:text-[#f9d5a6] transition-colors"
                >
                  राग आसा (Raag Aasaa)
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/raag-bhairvi"
                  className="hover:text-[#f9d5a6] transition-colors"
                >
                  राग भैरवी (Raag Bhairvi)
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation & Documentation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#f9d5a6] mb-3">
              Information
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-[#f9d5a6] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/bhajans" className="hover:text-[#f9d5a6] transition-colors">
                  Bhajan Library
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#f9d5a6] transition-colors">
                  About &amp; Source Guide
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} {SITE_CONFIG.name}. Shri Amarapur Vaani.</p>
          <p className="flex items-center gap-1">
            Built with reverence for sacred devotional music.
          </p>
        </div>
      </div>
    </footer>
  );
}
