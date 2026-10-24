"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Copy,
  Check,
  Share2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Tag,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { Bhajan, Category } from "@/lib/types";
import BhajanCard from "./BhajanCard";

interface LyricsReaderClientProps {
  bhajan: Bhajan;
  category: Category;
  prevBhajan: Bhajan | null;
  nextBhajan: Bhajan | null;
  relatedBhajans: Bhajan[];
}

export default function LyricsReaderClient({
  bhajan,
  category,
  prevBhajan,
  nextBhajan,
  relatedBhajans,
}: LyricsReaderClientProps) {
  // Script views: "hindi" (Devanagari), "roman" (Transliteration), "dual" (Side-by-side)
  const [activeScript, setActiveScript] = useState<"hindi" | "roman" | "dual">("hindi");

  // Font size steps: 0 (default/base), 1 (large), 2 (xl), -1 (small)
  const [fontSizeStep, setFontSizeStep] = useState<number>(0);

  // Copy feedback state
  const [copiedStatus, setCopiedStatus] = useState<"idle" | "success" | "error">("idle");
  const [shareStatus, setShareStatus] = useState<"idle" | "shared" | "copied" | "error">("idle");

  const fontSizeClasses = {
    [-1]: "text-base sm:text-lg leading-relaxed",
    0: "text-lg sm:text-xl leading-loose",
    1: "text-xl sm:text-2xl leading-loose",
    2: "text-2xl sm:text-3xl leading-loose",
  }[fontSizeStep] || "text-lg sm:text-xl leading-loose";

  // Build plain text for clipboard copy
  const getFullLyricsText = () => {
    let text = `${bhajan.title}\n(${bhajan.romanTitle})\nCategory: ${category.name} (${category.romanName})\n\n`;

    if (activeScript === "hindi" || activeScript === "dual") {
      text += "--- DEVANAGARI LYRICS ---\n\n";
      bhajan.lyrics.forEach((stanza, sIdx) => {
        text += `[Stanza ${sIdx + 1}]\n`;
        text += stanza.join("\n") + "\n\n";
      });
    }

    if (activeScript === "roman" || activeScript === "dual") {
      text += "--- ROMAN TRANSLITERATION ---\n\n";
      bhajan.romanLyrics.forEach((stanza, sIdx) => {
        text += `[Stanza ${sIdx + 1}]\n`;
        text += stanza.join("\n") + "\n\n";
      });
    }

    text += `Note: ${bhajan.source}\n`;
    return text;
  };

  const handleCopy = async () => {
    try {
      const text = getFullLyricsText();
      await navigator.clipboard.writeText(text);
      setCopiedStatus("success");
      setTimeout(() => setCopiedStatus("idle"), 3000);
    } catch (err) {
      console.error("Failed to copy lyrics:", err);
      setCopiedStatus("error");
      setTimeout(() => setCopiedStatus("idle"), 3000);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${bhajan.title} - ${bhajan.romanTitle}`,
      text: `${bhajan.title} (${bhajan.romanTitle}) - Sindhi Bhajan lyrics & transliteration.`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        setShareStatus("shared");
        setTimeout(() => setShareStatus("idle"), 3000);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          fallbackShareToClipboard();
        }
      }
    } else {
      fallbackShareToClipboard();
    }
  };

  const fallbackShareToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareStatus("copied");
      setTimeout(() => setShareStatus("idle"), 3000);
    } catch {
      setShareStatus("error");
      setTimeout(() => setShareStatus("idle"), 3000);
    }
  };

  return (
    <article className="space-y-8" itemScope itemType="https://schema.org/CreativeWork">
      {/* Bhajan Header */}
      <header className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href={`/categories/${category.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/70 hover:bg-amber-100 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
            <span>
              {category.name} ({category.romanName})
            </span>
          </Link>

          <span className="text-xs text-stone-500 font-medium">
            Order #{bhajan.displayOrder} in category
          </span>
        </div>

        <div>
          <h1
            itemProp="name"
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 leading-tight mb-2 devanagari-text"
            lang="hi"
          >
            {bhajan.title}
          </h1>
          <p className="font-serif text-lg sm:text-xl text-stone-600 italic">
            {bhajan.romanTitle}
          </p>
        </div>

        {/* First Line Highlight */}
        <blockquote className="bg-stone-50 p-4 rounded-xl border-l-4 border-amber-500 text-stone-700 text-sm sm:text-base font-serif italic">
          &ldquo;{bhajan.firstLine}&rdquo;
        </blockquote>

        {/* Tags & Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-stone-400 font-medium mr-1">Tags:</span>
            {bhajan.tags.map((tag) => (
              <Link
                key={tag}
                href={`/bhajans?tags=${tag}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 text-stone-600 hover:bg-amber-100 hover:text-amber-900 transition-colors"
              >
                <Tag className="w-3 h-3 text-stone-400" aria-hidden="true" />
                <span>{tag}</span>
              </Link>
            ))}
          </div>
          <span className="text-stone-400">Updated: {bhajan.updatedAt}</span>
        </div>
      </header>

      {/* Reader Controls Toolbar */}
      <section
        aria-label="Lyrics Display Controls"
        className="sticky top-20 z-30 bg-stone-900/95 text-stone-100 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-lg border border-stone-800 flex flex-wrap items-center justify-between gap-3"
      >
        {/* Script Selector Switch */}
        <div className="flex items-center gap-1 bg-stone-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveScript("hindi")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeScript === "hindi"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-stone-300 hover:text-white"
            }`}
            aria-pressed={activeScript === "hindi"}
          >
            हिंदी (Devanagari)
          </button>
          <button
            type="button"
            onClick={() => setActiveScript("roman")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeScript === "roman"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-stone-300 hover:text-white"
            }`}
            aria-pressed={activeScript === "roman"}
          >
            Roman Transliteration
          </button>
          <button
            type="button"
            onClick={() => setActiveScript("dual")}
            className={`hidden sm:inline-block px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeScript === "dual"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-stone-300 hover:text-white"
            }`}
            aria-pressed={activeScript === "dual"}
          >
            Side-by-Side (Dual)
          </button>
        </div>

        {/* Font Size & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Font Size Controls */}
          <div className="flex items-center bg-stone-800 rounded-xl p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setFontSizeStep((prev) => Math.max(-1, prev - 1))}
              disabled={fontSizeStep <= -1}
              className="p-1.5 text-stone-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Decrease font size (A-)"
              aria-label="Decrease font size"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-stone-300 font-mono text-xs">
              {fontSizeStep === 0 ? "A" : fontSizeStep > 0 ? `A+${fontSizeStep}` : "A-"}
            </span>
            <button
              type="button"
              onClick={() => setFontSizeStep((prev) => Math.min(2, prev + 1))}
              disabled={fontSizeStep >= 2}
              className="p-1.5 text-stone-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Increase font size (A+)"
              aria-label="Increase font size"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            {fontSizeStep !== 0 && (
              <button
                type="button"
                onClick={() => setFontSizeStep(0)}
                className="p-1 text-stone-400 hover:text-white ml-1 border-l border-stone-700 pl-1.5"
                title="Reset font size"
                aria-label="Reset font size"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              copiedStatus === "success"
                ? "bg-emerald-600 text-white"
                : copiedStatus === "error"
                ? "bg-rose-700 text-white"
                : "bg-stone-800 hover:bg-stone-700 text-stone-200"
            }`}
            title="Copy complete lyrics to clipboard"
          >
            {copiedStatus === "success" ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" aria-hidden="true" />
                <span>Copied!</span>
              </>
            ) : copiedStatus === "error" ? (
              <span>Copy failed</span>
            ) : (
              <>
                <Copy className="w-4 h-4 text-stone-400" aria-hidden="true" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              shareStatus === "shared" || shareStatus === "copied"
                ? "bg-amber-600 text-white"
                : shareStatus === "error"
                ? "bg-rose-700 text-white"
                : "bg-stone-800 hover:bg-stone-700 text-stone-200"
            }`}
            title="Share this bhajan"
          >
            {shareStatus === "copied" ? (
              <>
                <Check className="w-4 h-4 text-amber-200" aria-hidden="true" />
                <span>Link Copied</span>
              </>
            ) : shareStatus === "shared" ? (
              <>
                <Check className="w-4 h-4 text-amber-200" aria-hidden="true" />
                <span>Shared!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-stone-400" aria-hidden="true" />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Main Lyrics Body */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-stone-200/90 shadow-sm">
        {/* Notice that transliteration is not an English translation */}
        <div className="mb-6 p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            <strong>Script Note:</strong> Roman text is a phonetic transliteration of the Hindi sample
            verses for vocal chanting; it is not an English translation.
          </span>
        </div>

        {/* Dual Mode View */}
        {activeScript === "dual" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-stone-200">
            {/* Hindi Column */}
            <div className="space-y-8 font-serif" lang="hi">
              <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-amber-800 pb-2 border-b border-amber-200/70">
                देवनागरी लिरिक्स (Devanagari)
              </h2>
              {bhajan.lyrics.map((stanza, sIdx) => (
                <div key={sIdx} className="bhajan-stanza">
                  <div className="text-xs font-sans font-medium text-stone-400 mb-2">
                    पद {sIdx + 1}
                  </div>
                  {stanza.map((line, lIdx) => (
                    <p key={lIdx} className={`bhajan-line text-stone-900 ${fontSizeClasses}`}>
                      {line}
                    </p>
                  ))}
                </div>
              ))}
            </div>

            {/* Roman Column */}
            <div className="md:pl-8 pt-6 md:pt-0 space-y-8 font-serif" lang="en-IN">
              <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-amber-800 pb-2 border-b border-amber-200/70">
                Roman Transliteration
              </h2>
              {bhajan.romanLyrics.map((stanza, sIdx) => (
                <div key={sIdx} className="bhajan-stanza">
                  <div className="text-xs font-sans font-medium text-stone-400 mb-2">
                    Stanza {sIdx + 1}
                  </div>
                  {stanza.map((line, lIdx) => (
                    <p key={lIdx} className={`bhajan-line text-stone-800 ${fontSizeClasses}`}>
                      {line}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : activeScript === "hindi" ? (
          /* Single Hindi View */
          <div className="font-serif max-w-2xl mx-auto space-y-8 text-center sm:text-left" lang="hi">
            {bhajan.lyrics.map((stanza, sIdx) => (
              <div key={sIdx} className="bhajan-stanza bg-stone-50/50 p-6 rounded-2xl border border-stone-100">
                <div className="text-xs font-sans font-semibold text-amber-800 mb-3 uppercase tracking-wider">
                  पद {sIdx + 1}
                </div>
                {stanza.map((line, lIdx) => (
                  <p key={lIdx} className={`bhajan-line text-stone-900 ${fontSizeClasses}`}>
                    {line}
                  </p>
                ))}
              </div>
            ))}
          </div>
        ) : (
          /* Single Roman View */
          <div className="font-serif max-w-2xl mx-auto space-y-8 text-center sm:text-left" lang="en-IN">
            {bhajan.romanLyrics.map((stanza, sIdx) => (
              <div key={sIdx} className="bhajan-stanza bg-stone-50/50 p-6 rounded-2xl border border-stone-100">
                <div className="text-xs font-sans font-semibold text-amber-800 mb-3 uppercase tracking-wider">
                  Stanza {sIdx + 1}
                </div>
                {stanza.map((line, lIdx) => (
                  <p key={lIdx} className={`bhajan-line text-stone-800 ${fontSizeClasses}`}>
                    {line}
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Source and Demo Disclaimer Box */}
        <aside
          aria-label="Editorial Provenance"
          className="mt-12 p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-stone-700 text-xs sm:text-sm space-y-2"
        >
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-700" aria-hidden="true" />
            <span>Editorial & Provenance Status</span>
          </div>
          <p>
            <strong>Source Label:</strong> {bhajan.source}
          </p>
          <p className="text-stone-600">
            This demonstration text is composed for functional website evaluation. When preparing for
            production launch, replace this file with authentic Sindhi devotional lyrics from verified
            songbooks or community recordings.
          </p>
        </aside>
      </div>

      {/* In-category Previous / Next Navigation */}
      <nav
        aria-label="Category Bhajan Navigation"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2"
      >
        {prevBhajan ? (
          <Link
            href={`/bhajans/${prevBhajan.slug}`}
            className="group p-5 rounded-2xl bg-white border border-stone-200/90 hover:border-amber-400 hover:shadow-md transition-all flex items-center gap-3 text-left"
          >
            <div className="w-9 h-9 rounded-full bg-stone-100 group-hover:bg-amber-100 flex items-center justify-center text-stone-700 group-hover:text-amber-800 shrink-0 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block">
                Previous in {category.romanName}
              </span>
              <span className="font-serif font-bold text-stone-900 group-hover:text-amber-800 truncate block text-sm sm:text-base">
                {prevBhajan.title}
              </span>
              <span className="text-xs text-stone-500 truncate block">
                {prevBhajan.romanTitle}
              </span>
            </div>
          </Link>
        ) : (
          <div className="p-5 rounded-2xl border border-dashed border-stone-200 text-stone-400 text-xs flex items-center justify-center">
            First bhajan in this category
          </div>
        )}

        {nextBhajan ? (
          <Link
            href={`/bhajans/${nextBhajan.slug}`}
            className="group p-5 rounded-2xl bg-white border border-stone-200/90 hover:border-amber-400 hover:shadow-md transition-all flex items-center justify-between gap-3 text-right"
          >
            <div className="overflow-hidden w-full">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block">
                Next in {category.romanName}
              </span>
              <span className="font-serif font-bold text-stone-900 group-hover:text-amber-800 truncate block text-sm sm:text-base">
                {nextBhajan.title}
              </span>
              <span className="text-xs text-stone-500 truncate block">
                {nextBhajan.romanTitle}
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-stone-100 group-hover:bg-amber-100 flex items-center justify-center text-stone-700 group-hover:text-amber-800 shrink-0 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </div>
          </Link>
        ) : (
          <div className="p-5 rounded-2xl border border-dashed border-stone-200 text-stone-400 text-xs flex items-center justify-center">
            Last bhajan in this category
          </div>
        )}
      </nav>

      {/* Related Bhajans Section */}
      {relatedBhajans.length > 0 && (
        <section className="pt-8 border-t border-stone-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              Related Devotional Bhajans
            </h2>
            <Link
              href={`/categories/${category.slug}`}
              className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline"
            >
              View all in {category.romanName}
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedBhajans.map((rb) => (
              <BhajanCard key={rb.id} bhajan={rb} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
