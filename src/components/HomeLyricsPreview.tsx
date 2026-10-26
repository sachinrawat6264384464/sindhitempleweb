"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Copy, Check, ArrowRight, Music2 } from "lucide-react";
import { Bhajan } from "@/lib/types";

interface HomeLyricsPreviewProps {
  bhajans: Bhajan[];
}

export default function HomeLyricsPreview({ bhajans }: HomeLyricsPreviewProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [activeScript, setActiveScript] = useState<"hindi" | "roman">("hindi");
  const [copied, setCopied] = useState<boolean>(false);

  const selectedBhajan = bhajans[selectedIndex] || bhajans[0];

  const handleCopy = async () => {
    if (!selectedBhajan) return;
    const text =
      activeScript === "hindi"
        ? selectedBhajan.lyrics.map((st) => st.join("\n")).join("\n\n")
        : selectedBhajan.romanLyrics.map((st) => st.join("\n")).join("\n\n");

    try {
      await navigator.clipboard.writeText(
        `${selectedBhajan.title} (${selectedBhajan.romanTitle})\n\n${text}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <section
      aria-labelledby="live-lyrics-heading"
      className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-sm space-y-6"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#e5be8d]/40 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f9d5a6]/40 text-[#4a2a0d] border border-[#e5be8d] mb-2">
            <Music2 className="w-3.5 h-3.5 text-[#8a4b12]" aria-hidden="true" />
            <span>लाइव लिरिक्स रीडर • Live Lyrics Reader</span>
          </div>
          <h2
            id="live-lyrics-heading"
            className="font-serif text-2xl sm:text-3xl font-bold text-stone-900"
          >
            संपूर्ण भजन पद व लिरिक्स (Instant Lyrics Reader)
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm mt-1">
            नीचे किसी भी भजन पर क्लिक करें और उसके सम्पूर्ण पद और पंक्तियाँ यहीं पढ़ें
          </p>
        </div>

        {/* Script toggle */}
        <div className="inline-flex items-center bg-[#f9d5a6]/20 p-1 rounded-xl self-start sm:self-auto text-xs font-semibold border border-[#e5be8d]/40">
          <button
            type="button"
            onClick={() => setActiveScript("hindi")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeScript === "hindi"
                ? "bg-[#f9d5a6] text-[#381c09] font-bold shadow-xs border border-[#e5be8d]"
                : "text-stone-700 hover:text-stone-900"
            }`}
          >
            हिंदी (Devanagari)
          </button>
          <button
            type="button"
            onClick={() => setActiveScript("roman")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeScript === "roman"
                ? "bg-[#f9d5a6] text-[#381c09] font-bold shadow-xs border border-[#e5be8d]"
                : "text-stone-700 hover:text-stone-900"
            }`}
          >
            Roman Chanting
          </button>
        </div>
      </div>

      {/* Bhajan Selector Tabs / Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {bhajans.map((bhajan, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <button
              key={bhajan.id}
              type="button"
              onClick={() => {
                setSelectedIndex(idx);
                setCopied(false);
              }}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-left border transition-all ${
                isSelected
                  ? "bg-[#f9d5a6]/40 border-[#e5be8d] text-[#381c09] font-bold shadow-xs ring-1 ring-[#f9d5a6]"
                  : "bg-white border-stone-200 text-stone-700 hover:bg-[#f9d5a6]/15 hover:border-[#e5be8d]/60"
              }`}
            >
              <div className="text-xs sm:text-sm font-serif font-bold truncate max-w-[170px] sm:max-w-none">
                {bhajan.title}
              </div>
              <div className="text-[11px] text-stone-500 truncate max-w-[170px] sm:max-w-none">
                {bhajan.romanTitle}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Bhajan Lyrics Display Card */}
      {selectedBhajan && (
        <div className="bg-[#FAF8F5] rounded-2xl p-6 sm:p-8 border border-[#e5be8d]/60 space-y-6">
          {/* Header of selected bhajan */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5be8d]/50 pb-4">
            <div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-white border border-[#e5be8d] text-[#4a2a0d] inline-block mb-1.5">
                {selectedBhajan.categoryId.replace("-", " ").toUpperCase()}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                {selectedBhajan.title}
              </h3>
              <p className="text-stone-600 text-sm italic">
                {selectedBhajan.romanTitle}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                  copied
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-stone-700 border-[#e5be8d] hover:bg-[#f9d5a6]/20"
                }`}
                title="Copy lyrics"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#8a4b12]" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <Link
                href={`/bhajans/${selectedBhajan.slug}`}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#f9d5a6] hover:bg-[#f4be77] text-[#381c09] border border-[#e5be8d] transition-colors shadow-xs"
              >
                <span>Full Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Actual Verses / Stanzas */}
          <div className="space-y-6 max-w-2xl">
            {activeScript === "hindi" ? (
              selectedBhajan.lyrics.map((stanza, sIdx) => (
                <div
                  key={sIdx}
                  className={`p-4 sm:p-5 rounded-xl border shadow-2xs font-serif ${
                    sIdx === 0
                      ? "bg-amber-50/80 border-amber-200"
                      : "bg-white/80 border-stone-200/70"
                  }`}
                  lang="hi"
                >
                  <div className="text-[11px] font-sans font-bold uppercase tracking-wider mb-2">
                    {sIdx === 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-amber-200 text-amber-950">
                        टेक (Tek)
                      </span>
                    ) : (
                      <span className="text-amber-800">पद {sIdx}</span>
                    )}
                  </div>
                  {stanza.map((line, lIdx) => (
                    <p
                      key={lIdx}
                      className={`text-base sm:text-lg leading-relaxed devanagari-text mb-1 ${
                        sIdx === 0 ? "font-semibold text-amber-950" : "text-stone-900"
                      }`}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              ))
            ) : (
              selectedBhajan.romanLyrics.map((stanza, sIdx) => (
                <div
                  key={sIdx}
                  className={`p-4 sm:p-5 rounded-xl border shadow-2xs font-serif ${
                    sIdx === 0
                      ? "bg-amber-50/80 border-amber-200"
                      : "bg-white/80 border-stone-200/70"
                  }`}
                  lang="en-IN"
                >
                  <div className="text-[11px] font-sans font-bold uppercase tracking-wider mb-2">
                    {sIdx === 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-amber-200 text-amber-950">
                        Tek (Refrain)
                      </span>
                    ) : (
                      <span className="text-amber-800">Verse {sIdx}</span>
                    )}
                  </div>
                  {stanza.map((line, lIdx) => (
                    <p
                      key={lIdx}
                      className={`text-base sm:text-lg leading-relaxed mb-1 ${
                        sIdx === 0 ? "font-semibold text-amber-950" : "text-stone-800"
                      }`}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Quick link to read all */}
          <div className="pt-2 text-xs text-stone-500 flex items-center justify-between">
            <span>
              Order #{selectedBhajan.displayOrder} • Demo content
            </span>
            <Link
              href={`/bhajans/${selectedBhajan.slug}`}
              className="text-amber-800 hover:text-amber-950 font-semibold underline underline-offset-2 inline-flex items-center gap-1"
            >
              <span>इस भजन का पूरा लिरिक्स पेज खोलें</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
