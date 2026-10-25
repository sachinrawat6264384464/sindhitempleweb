import { BookOpen, Info } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

export default function DemoBanner() {
  return (
    <aside
      aria-label="Book Information"
      className="bg-[#f9d5a6] border-b border-[#e5be8d] text-[#4a2a0d] px-4 py-2.5 text-xs sm:text-sm font-medium select-none cursor-default shadow-xs"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <BookOpen className="w-4 h-4 text-[#8a4b12] shrink-0" aria-hidden="true" />
          <span>
            <strong className="font-semibold text-[#3b1e06]">{SITE_CONFIG.demoNoticeText}</strong>{" "}
            <span className="text-[#5c3714] hidden md:inline">
              • 921 authentic bhajans arranged across 25 classical Raags with Roman transliteration.
            </span>
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 text-[#5c3714] shrink-0 font-medium select-none">
          <Info className="w-3.5 h-3.5 text-[#8a4b12]" aria-hidden="true" />
          <span>Book Details &amp; Index</span>
        </div>
      </div>
    </aside>
  );
}
