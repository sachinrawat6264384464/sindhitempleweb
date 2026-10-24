import Link from "next/link";
import { AlertTriangle, Info } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

export default function DemoBanner() {
  return (
    <aside
      aria-label="Demonstration Notice"
      className="bg-amber-50 border-b border-amber-200/80 text-amber-950 px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
          <span>
            <strong className="font-semibold text-amber-900">{SITE_CONFIG.demoNoticeText}</strong>{" "}
            <span className="text-amber-800/90 hidden md:inline">
              Demonstration collection with Hindi and Roman transliteration. Not historical or canonical provenance.
            </span>
          </span>
        </div>
        <Link
          href="/about"
          className="inline-flex items-center gap-1 text-amber-900 hover:text-amber-950 underline underline-offset-2 shrink-0 font-semibold"
        >
          <Info className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Content notes & guide</span>
        </Link>
      </div>
    </aside>
  );
}
