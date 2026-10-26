"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, Music2, ArrowRight, ChevronDown, Sparkles, Loader2 } from "lucide-react";
import { Category } from "@/lib/types";
import { normalizePhonetic, normalizeSearchText } from "@/lib/search";

export interface SearchIndexItem {
  id: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  title: string;
  romanTitle: string;
  firstLine: string;
  lyrics: string;
  romanLyrics: string;
  tags: string[];
  displayOrder: number;
}

interface HeroBhajanSearchProps {
  categories: Category[];
  totalBhajans: number;
}

const POPULAR_SUGGESTIONS = [
  { label: "सद्गुरु (Sadguru)", query: "सद्गुरु" },
  { label: "गोविंद (Govind)", query: "गोविंद" },
  { label: "हरिनाम (Harinaam)", query: "हरिनाम" },
  { label: "मुसाफ़िर (Musaaphir)", query: "मुसाफ़िर" },
  { label: "ज्ञान (Jnyaan)", query: "ज्ञान" },
  { label: "राग भैरव", category: "raag-bhairav" },
  { label: "राग प्रभाती", category: "raag-prabhaati" },
];

// Module-level cache for search index so it's only fetched once per user session
let cachedIndex: SearchIndexItem[] | null = null;
let indexFetchPromise: Promise<SearchIndexItem[]> | null = null;

async function loadSearchIndex(): Promise<SearchIndexItem[]> {
  if (cachedIndex) return cachedIndex;
  if (indexFetchPromise) return indexFetchPromise;

  indexFetchPromise = fetch("/search-index.json")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load search index");
      return res.json();
    })
    .then((data: SearchIndexItem[]) => {
      cachedIndex = data;
      return data;
    })
    .catch((err) => {
      console.error("Search index load error:", err);
      indexFetchPromise = null;
      return [];
    });

  return indexFetchPromise;
}

export default function HeroBhajanSearch({ categories, totalBhajans }: HeroBhajanSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isFocused, setIsFocused] = useState(false);
  const [bhajans, setBhajans] = useState<SearchIndexItem[]>(cachedIndex || []);
  const [isLoading, setIsLoading] = useState(!cachedIndex);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pre-load the search index smoothly on mount
  useEffect(() => {
    if (!cachedIndex) {
      loadSearchIndex().then((data) => {
        setBhajans(data);
        setIsLoading(false);
      });
    } else {
      setBhajans(cachedIndex);
      setIsLoading(false);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Category bhajan count mapping
  const categoryCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const b of bhajans) {
      map.set(b.categoryId, (map.get(b.categoryId) || 0) + 1);
    }
    return map;
  }, [bhajans]);

  // Real-time full-text search with cross-script phonetic matching (Sindhi, Hindi, Hinglish)
  const searchResults = useMemo(() => {
    const rawQuery = query.trim();
    if (!rawQuery && selectedCategory === "all") {
      return [];
    }

    const matches: { bhajan: SearchIndexItem; matchedSnippet: string | null; score: number }[] = [];
    const normQ = normalizeSearchText(rawQuery);
    const pQ = normalizePhonetic(rawQuery);
    const qTokens = normQ ? normQ.split(" ").filter(Boolean) : [];
    const pTokens = pQ ? pQ.split(" ").filter(Boolean) : [];

    for (const b of bhajans) {
      // Category filter
      if (selectedCategory !== "all" && b.categoryId !== selectedCategory) {
        continue;
      }

      if (!rawQuery) {
        matches.push({ bhajan: b, matchedSnippet: null, score: 1 });
        continue;
      }

      let score = 0;
      let matchedSnippet: string | null = null;

      const normTitle = normalizeSearchText(b.title);
      const normRomanTitle = normalizeSearchText(b.romanTitle);
      const normFirstLine = normalizeSearchText(b.firstLine || "");
      const normLyrics = normalizeSearchText(b.lyrics || "");
      const normRomanLyrics = normalizeSearchText(b.romanLyrics || "");

      const pTitle = normalizePhonetic(b.title);
      const pRomanTitle = normalizePhonetic(b.romanTitle);
      const pFirstLine = normalizePhonetic(b.firstLine || "");
      const pLyrics = normalizePhonetic(b.lyrics || "");
      const pRomanLyrics = normalizePhonetic(b.romanLyrics || "");

      // Title exact or phrase match (highest weight)
      if (normTitle === normQ || normRomanTitle === normQ || pTitle === pQ || pRomanTitle === pQ) {
        score += 1000;
      } else if (normTitle.includes(normQ) || normRomanTitle.includes(normQ) || pTitle.includes(pQ) || pRomanTitle.includes(pQ)) {
        score += 500;
      }

      // First line match
      if (normFirstLine.includes(normQ) || pFirstLine.includes(pQ)) {
        score += 300;
      }

      // Tags match
      if (b.tags && b.tags.some((t) => normalizeSearchText(t).includes(normQ) || normalizePhonetic(t).includes(pQ))) {
        score += 150;
      }

      // Full lyrics match (search across ALL words in lyrics)
      const lyricsIdx = (b.lyrics || "").toLowerCase().indexOf(rawQuery.toLowerCase());
      const romanIdx = (b.romanLyrics || "").toLowerCase().indexOf(rawQuery.toLowerCase());

      if (lyricsIdx !== -1) {
        score += 200;
        const start = Math.max(0, lyricsIdx - 35);
        const end = Math.min(b.lyrics.length, lyricsIdx + rawQuery.length + 45);
        matchedSnippet = (start > 0 ? "... " : "") + b.lyrics.substring(start, end).trim() + (end < b.lyrics.length ? " ..." : "");
      } else if (romanIdx !== -1) {
        score += 200;
        const start = Math.max(0, romanIdx - 35);
        const end = Math.min(b.romanLyrics.length, romanIdx + rawQuery.length + 45);
        matchedSnippet = (start > 0 ? "... " : "") + b.romanLyrics.substring(start, end).trim() + (end < b.romanLyrics.length ? " ..." : "");
      } else if (pLyrics.includes(pQ) || pRomanLyrics.includes(pQ) || normLyrics.includes(normQ) || normRomanLyrics.includes(normQ)) {
        score += 180;
        matchedSnippet = (b.firstLine || b.romanTitle);
      }

      // Query tokens match
      for (const t of qTokens) {
        if (normTitle.includes(t) || normRomanTitle.includes(t)) score += 60;
        if (normFirstLine.includes(t)) score += 40;
        if (normLyrics.includes(t) || normRomanLyrics.includes(t)) score += 20;
      }

      for (const pt of pTokens) {
        if (pTitle.includes(pt) || pRomanTitle.includes(pt)) score += 60;
        if (pFirstLine.includes(pt)) score += 40;
        if (pLyrics.includes(pt) || pRomanLyrics.includes(pt)) score += 20;
      }

      if (score > 0) {
        matches.push({ bhajan: b, matchedSnippet, score });
      }
    }

    // Sort by relevance score
    matches.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.bhajan.displayOrder - b.bhajan.displayOrder;
    });

    return matches;
  }, [query, selectedCategory, bhajans]);

  const handleSuggestionClick = (item: { label: string; query?: string; category?: string }) => {
    if (item.category) {
      setSelectedCategory(item.category);
      if (!item.query) setQuery("");
    }
    if (item.query) {
      setQuery(item.query);
    }
    setIsFocused(true);
  };

  const handleSelectBhajan = (slug: string) => {
    setIsFocused(false);
    router.push(`/bhajans/${slug}`);
  };

  const showDropdown = isFocused && (query.trim().length > 0 || selectedCategory !== "all");
  const displayResults = searchResults.slice(0, 8);

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl mx-auto mt-6 text-left">
      {/* Search Bar with Category Dropdown */}
      <div
        className={`relative flex flex-col sm:flex-row items-stretch bg-white rounded-2xl sm:rounded-full border-2 transition-all shadow-md ${
          isFocused
            ? "border-[#e5be8d] ring-4 ring-[#f9d5a6]/40 shadow-lg"
            : "border-[#e5be8d]/80 hover:border-[#f9d5a6]"
        }`}
      >
        {/* Category Dropdown */}
        <div className="relative sm:border-r border-[#e5be8d]/60 sm:max-w-[210px] shrink-0 border-b sm:border-b-0">
          <label htmlFor="hero-category-select" className="sr-only">
            Select Raag / Category
          </label>
          <select
            id="hero-category-select"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setIsFocused(true);
            }}
            className="w-full h-full py-3 sm:py-3.5 pl-4 pr-9 bg-transparent text-xs sm:text-sm font-semibold text-stone-800 focus:outline-none appearance-none cursor-pointer rounded-t-2xl sm:rounded-l-full sm:rounded-tr-none hover:bg-[#f9d5a6]/15 transition-colors"
          >
            <option value="all">
              सभी 25 राग ({bhajans.length > 0 ? bhajans.length : totalBhajans} भजन)
            </option>
            {categories.map((cat) => {
              const count = categoryCountMap.get(cat.id);
              return (
                <option key={cat.id} value={cat.id}>
                  {cat.name} {count !== undefined ? `(${count})` : ""}
                </option>
              );
            })}
          </select>
          <ChevronDown
            className="w-4 h-4 text-stone-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
        </div>

        {/* Text Input Field */}
        <div className="relative flex-1 flex items-center">
          <div className="pl-4 sm:pl-3 pointer-events-none text-[#8a4b12]">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-[#8a4b12] animate-spin" aria-hidden="true" />
            ) : (
              <Search className="w-5 h-5 text-[#8a4b12]" aria-hidden="true" />
            )}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsFocused(true);
            }}
            onFocus={() => {
              setIsFocused(true);
              if (!cachedIndex) {
                loadSearchIndex().then((data) => {
                  setBhajans(data);
                  setIsLoading(false);
                });
              }
            }}
            placeholder="भजन शीर्षक, टेक, या बोल का कोई भी शब्द खोजें..."
            className="w-full py-3.5 pl-3 pr-10 bg-transparent text-sm sm:text-base text-stone-900 placeholder:text-stone-400 focus:outline-none font-medium"
            aria-label="Search bhajans by title or lyrics words"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setIsFocused(true);
              }}
              className="p-1.5 mr-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Action Button */}
        <div className="p-1 sm:p-1.5 flex items-center justify-end">
          <Link
            href={
              query.trim() || selectedCategory !== "all"
                ? `/bhajans?q=${encodeURIComponent(query.trim())}${
                    selectedCategory !== "all" ? `&category=${selectedCategory}` : ""
                  }`
                : "/bhajans"
            }
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl sm:rounded-full bg-[#f9d5a6] hover:bg-[#f4be77] text-[#381c09] text-xs sm:text-sm font-bold border border-[#e5be8d] shadow-xs transition-all active:scale-95"
          >
            <span>खोजें</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Popular Suggestions Pills */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2.5 px-2">
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8a4b12]">
          <Sparkles className="w-3 h-3" />
          <span>सुझाव:</span>
        </span>
        {POPULAR_SUGGESTIONS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSuggestionClick(item)}
            className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/90 hover:bg-[#f9d5a6]/40 text-stone-700 hover:text-[#381c09] border border-[#e5be8d]/70 transition-colors shadow-2xs"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Floating Instant Search Results Dropdown */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white rounded-2xl border border-[#e5be8d] shadow-2xl overflow-hidden animate-fadeIn">
          {/* Header Bar */}
          <div className="px-4 py-2.5 bg-[#f9d5a6]/25 border-b border-[#e5be8d]/60 flex items-center justify-between text-xs">
            <span className="font-semibold text-[#3b1e06] flex items-center gap-1.5">
              <Music2 className="w-3.5 h-3.5 text-[#8a4b12]" />
              <span>
                {searchResults.length} भजन मिले {selectedCategory !== "all" && `(राग में)`}
              </span>
            </span>
            <span className="text-stone-500 text-[11px]">
              क्लिक करके संपूर्ण पद व लिरिक्स पढ़ें
            </span>
          </div>

          {/* Results List */}
          {searchResults.length > 0 ? (
            <div className="max-h-[380px] overflow-y-auto divide-y divide-stone-100">
              {displayResults.map(({ bhajan, matchedSnippet }) => (
                <button
                  key={bhajan.id}
                  type="button"
                  onClick={() => handleSelectBhajan(bhajan.slug)}
                  className="w-full p-3.5 sm:p-4 text-left hover:bg-[#f9d5a6]/15 transition-colors flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#f9d5a6]/30 text-[#4a2a0d] border border-[#e5be8d]/60 shrink-0">
                        {bhajan.categoryName}
                      </span>
                      <h4 className="font-serif text-base sm:text-lg font-bold text-stone-900 group-hover:text-[#7a3e0f] transition-colors truncate">
                        {bhajan.title}
                      </h4>
                    </div>
                    <p className="text-xs text-stone-500 italic truncate pl-1">
                      {bhajan.romanTitle}
                    </p>

                    {/* Matching lyrics snippet if word was matched in lyrics */}
                    {matchedSnippet && (
                      <p className="text-xs text-stone-700 bg-stone-50 p-1.5 px-2.5 rounded-md border-l-2 border-[#e5be8d] font-serif leading-relaxed line-clamp-2">
                        <span className="text-[10px] uppercase font-sans font-semibold text-[#8a4b12] mr-1 block sm:inline">
                          लिरिक्स पंक्ति:
                        </span>
                        &ldquo;{matchedSnippet}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center text-xs font-semibold text-[#8a4b12] group-hover:translate-x-1 transition-transform self-center">
                    <span className="hidden sm:inline mr-1">लिरिक्स पढ़ें</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center space-y-2">
              <p className="font-serif text-base font-bold text-stone-800">
                कोई भजन नहीं मिला (&ldquo;{query}&rdquo;)
              </p>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                कृपया शब्द की वर्तनी जांचें, कोई अन्य शब्द टाइप करें, या राग की श्रेणी बदलकर देखें।
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSelectedCategory("all");
                }}
                className="mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#f9d5a6]/30 hover:bg-[#f9d5a6]/60 text-[#381c09] border border-[#e5be8d]"
              >
                खोज रीसेट करें
              </button>
            </div>
          )}

          {/* View All in Library Footer */}
          {searchResults.length > 8 && (
            <div className="p-2.5 bg-stone-50 border-t border-stone-200 text-center">
              <Link
                href={`/bhajans?q=${encodeURIComponent(query.trim())}${
                  selectedCategory !== "all" ? `&category=${selectedCategory}` : ""
                }`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8a4b12] hover:text-[#381c09]"
                onClick={() => setIsFocused(false)}
              >
                <span>सभी {searchResults.length} परिणाम भजन लाइब्रेरी में देखें</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
