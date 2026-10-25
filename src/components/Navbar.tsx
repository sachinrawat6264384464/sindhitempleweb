"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Instagram, Youtube } from "lucide-react";
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#f9d5a6]/70 shadow-xs transition-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link
            href="/"
            className="flex items-center gap-3 text-stone-900 group py-1"
            aria-label={`${SITE_CONFIG.name} Home`}
          >
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-full overflow-hidden border border-[#e5be8d] shadow-xs group-hover:scale-105 transition-transform bg-[#f9d5a6]/30">
              <Image
                src="/image.png"
                alt="Amrapur Darbar Logo"
                fill
                sizes="44px"
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors block leading-tight">
                सिंधी भजन
              </span>
              <span className="text-[11px] sm:text-xs text-amber-900/90 font-medium tracking-wide">
                Shri Amarapur Vaani
              </span>
            </div>
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
                      ? "bg-[#f9d5a6]/60 text-stone-900 font-semibold border border-[#e5be8d]"
                      : "text-stone-700 hover:text-stone-900 hover:bg-[#f9d5a6]/20"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Social Links, Search CTA & Mobile Menu Toggle */}
          <div className="flex items-center gap-2">
            {/* Social Media Links */}
            <div className="hidden sm:flex items-center gap-1.5 border-r border-[#e5be8d]/60 pr-2 mr-1">
              <a
                href={SITE_CONFIG.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Amrapur Darbar on Instagram"
                className="p-1.5 text-stone-600 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
                title="Follow Amrapur Darbar on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={SITE_CONFIG.socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Amrapur Darbar on YouTube"
                className="p-1.5 text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Subscribe to Amrapur Darbar on YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-700 hover:bg-[#f9d5a6]/30 focus:outline-none focus:ring-2 focus:ring-[#f9d5a6]"
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
        <div className="lg:hidden border-t border-[#f9d5a6]/70 bg-white/98 px-4 pt-3 pb-6 shadow-xl animate-fadeIn">
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
                      ? "bg-[#f9d5a6]/60 text-stone-900 font-semibold border border-[#e5be8d]"
                      : "text-stone-700 hover:bg-[#f9d5a6]/20"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Social Links inside Mobile Drawer */}
          <div className="mt-4 pt-3 border-t border-[#e5be8d]/60 flex items-center justify-between">
            <span className="text-xs font-medium text-stone-600">Amrapur Darbar Social:</span>
            <div className="flex items-center gap-2">
              <a
                href={SITE_CONFIG.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-[#f9d5a6]/30 text-stone-800 hover:bg-[#f9d5a6]/60 border border-[#e5be8d]"
              >
                <Instagram className="w-3.5 h-3.5 text-pink-600" />
                <span>Instagram</span>
              </a>
              <a
                href={SITE_CONFIG.socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-[#f9d5a6]/30 text-stone-800 hover:bg-[#f9d5a6]/60 border border-[#e5be8d]"
              >
                <Youtube className="w-3.5 h-3.5 text-red-600" />
                <span>YouTube</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
