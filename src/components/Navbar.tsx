"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/bhajans", label: "Bhajan Library (921)" },
  { href: "/categories/raag-bhairav", label: "Raag Bhairav" },
  { href: "/categories/raag-raamkali", label: "Raag Raamkali" },
  { href: "/categories/raag-prabhaati", label: "Raag Prabhaati" },
  { href: "/categories/raag-aasaa", label: "Raag Aasaa" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 transition-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex flex-col text-stone-900 group py-1"
            aria-label={`${SITE_CONFIG.name} Home`}
          >
            <span className="font-serif text-xl font-bold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors block leading-tight">
              सिंधी भजन
            </span>
            <span className="text-xs text-amber-800 font-medium tracking-wide">
              Sindhi Bhajan Lyrics
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-amber-100/70 text-amber-900 font-semibold"
                      : "text-stone-700 hover:text-stone-900 hover:bg-stone-100/80"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Search CTA and Mobile Menu Toggle */}
          <div className="flex items-center gap-2">
            <Link
              href="/bhajans"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200/80 rounded-lg border border-stone-200 transition-colors"
              aria-label="Search Bhajans"
            >
              <Search className="w-4 h-4 text-stone-500" aria-hidden="true" />
              <span className="hidden sm:inline">Search lyrics...</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-700 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white/98 px-4 pt-3 pb-6 shadow-xl animate-fadeIn">
          <nav className="flex flex-col gap-1.5" aria-label="Mobile Navigation">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-amber-100 text-amber-900 font-semibold"
                      : "text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
