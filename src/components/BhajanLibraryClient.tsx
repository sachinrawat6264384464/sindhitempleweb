"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  X,
  SlidersHorizontal,
  RotateCcw,
  BookOpen,
  Filter,
  Check,
} from "lucide-react";
import { SearchRecord, Category } from "@/lib/types";
import { filterAndRankBhajans, FilterState } from "@/lib/search";
import BhajanCard from "./BhajanCard";

interface BhajanLibraryClientProps {
  initialRecords: SearchRecord[];
  categories: Category[];
}

export default function BhajanLibraryClient({
  initialRecords,
  categories,
}: BhajanLibraryClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Extract all unique tags across records
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    initialRecords.forEach((r) => r.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [initialRecords]);

  // Read initial filter values from URL searchParams
  const getInitialFilters = useCallback((): FilterState => {
    const q = searchParams.get("q") || "";
    const catParam = searchParams.get("categories");
    const categoriesList = catParam ? catParam.split(",").filter(Boolean) : [];
    const tagParam = searchParams.get("tags");
    const tagsList = tagParam ? tagParam.split(",").filter(Boolean) : [];
    const scriptParam = (searchParams.get("script") || "all") as FilterState["script"];
    const sortParam = (searchParams.get("sort") || "relevance") as FilterState["sortBy"];

    return {
      query: q,
      categories: categoriesList,
      tags: tagsList,
      script: ["all", "hindi", "roman", "both"].includes(scriptParam) ? scriptParam : "all",
      sortBy: ["relevance", "title", "order"].includes(sortParam) ? sortParam : "relevance",
    };
  }, [searchParams]);

  const [filters, setFilters] = useState<FilterState>(getInitialFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Synchronize state when browser back/forward changes URL search parameters
  useEffect(() => {
    setFilters(getInitialFilters());
  }, [getInitialFilters]);

  // Update URL search parameters when filters change
  const updateUrl = useCallback(
    (newFilters: FilterState) => {
      const params = new URLSearchParams();

      if (newFilters.query.trim()) {
        params.set("q", newFilters.query.trim());
      }
      if (newFilters.categories.length > 0) {
        params.set("categories", newFilters.categories.join(","));
      }
      if (newFilters.tags.length > 0) {
        params.set("tags", newFilters.tags.join(","));
      }
      if (newFilters.script !== "all") {
        params.set("script", newFilters.script);
      }
      if (newFilters.sortBy !== "relevance") {
        params.set("sort", newFilters.sortBy);
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [pathname, router]
  );

  const handleQueryChange = (q: string) => {
    const next = { ...filters, query: q };
    setFilters(next);
    updateUrl(next);
  };

  const handleClearQuery = () => {
    const next = { ...filters, query: "" };
    setFilters(next);
    updateUrl(next);
  };

  const toggleCategory = (catId: string) => {
    const exists = filters.categories.includes(catId);
    const updated = exists
      ? filters.categories.filter((c) => c !== catId)
      : [...filters.categories, catId];
    const next = { ...filters, categories: updated };
    setFilters(next);
    updateUrl(next);
  };

  const toggleTag = (tag: string) => {
    const exists = filters.tags.includes(tag);
    const updated = exists
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    const next = { ...filters, tags: updated };
    setFilters(next);
    updateUrl(next);
  };

  const handleScriptChange = (script: FilterState["script"]) => {
    const next = { ...filters, script };
    setFilters(next);
    updateUrl(next);
  };

  const handleSortChange = (sortBy: FilterState["sortBy"]) => {
    const next = { ...filters, sortBy };
    setFilters(next);
    updateUrl(next);
  };

  const handleResetAll = () => {
    const clean: FilterState = {
      query: "",
      categories: [],
      tags: [],
      script: "all",
      sortBy: "relevance",
    };
    setFilters(clean);
    updateUrl(clean);
  };

  const isFiltered =
    Boolean(filters.query) ||
    filters.categories.length > 0 ||
    filters.tags.length > 0 ||
    filters.script !== "all" ||
    filters.sortBy !== "relevance";

  // Filter and rank results
  const filteredResults = useMemo(() => {
    return filterAndRankBhajans(initialRecords, filters);
  }, [initialRecords, filters]);

  return (
    <div className="space-y-6">
      {/* Search Header Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200/90 shadow-sm space-y-4">
        <div className="relative">
          <label htmlFor="bhajan-search-input" className="sr-only">
            Search bhajans by title, Roman title, lyrics, alternate spellings, or tags
          </label>
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-stone-400" aria-hidden="true" />
          </div>
          <input
            id="bhajan-search-input"
            type="search"
            value={filters.query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search by title (हिंदी / Roman), first line, lyrics, or tags..."
            className="block w-full pl-11 pr-10 py-3 text-stone-900 bg-stone-50/70 border border-stone-200 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white placeholder-stone-400 transition-colors"
          />
          {filters.query && (
            <button
              type="button"
              onClick={handleClearQuery}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 focus:outline-none"
              aria-label="Clear search input"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Quick controls bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-stone-50 font-medium text-stone-700 hover:bg-stone-100"
              aria-expanded={mobileFiltersOpen}
            >
              <Filter className="w-4 h-4 text-amber-700" aria-hidden="true" />
              <span>Filters {isFiltered && "(Active)"}</span>
            </button>

            <span className="text-stone-600 font-medium">
              <strong className="text-stone-900">{filteredResults.length}</strong>{" "}
              {filteredResults.length === 1 ? "bhajan found" : "bhajans found"}
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <label htmlFor="sort-select" className="text-stone-500 font-medium hidden sm:inline">
              Sort by:
            </label>
            <select
              id="sort-select"
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value as FilterState["sortBy"])}
              className="bg-stone-50 border border-stone-200 text-stone-800 text-xs sm:text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="relevance">Relevance</option>
              <option value="title">Title (A-Z)</option>
              <option value="order">Original Order</option>
            </select>

            {isFiltered && (
              <button
                type="button"
                onClick={handleResetAll}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-amber-800 hover:text-amber-950 hover:bg-amber-50 rounded-lg transition-colors font-medium"
                title="Reset all filters and query"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Filters Sidebar + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Filters Panel (Desktop sidebar & Mobile collapsible) */}
        <aside
          className={`lg:block bg-white p-5 rounded-2xl border border-stone-200/90 shadow-sm space-y-6 ${
            mobileFiltersOpen ? "block" : "hidden"
          }`}
          aria-label="Filter Options"
        >
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2 font-semibold text-stone-900 text-sm">
              <SlidersHorizontal className="w-4 h-4 text-amber-600" aria-hidden="true" />
              <span>Multi-Filters</span>
            </div>
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetAll}
                className="text-xs text-amber-700 hover:text-amber-900 font-medium underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Dimension 1: Categories (OR) */}
          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Categories (OR)
            </legend>
            <div className="space-y-1.5">
              {categories.map((cat) => {
                const checked = filters.categories.includes(cat.id);
                return (
                  <label
                    key={cat.id}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs sm:text-sm transition-colors ${
                      checked
                        ? "bg-amber-50 text-amber-950 font-semibold border border-amber-200"
                        : "text-stone-700 hover:bg-stone-50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                          checked
                            ? "bg-amber-600 border-amber-600 text-white"
                            : "border-stone-300 bg-white"
                        }`}
                      >
                        {checked && <Check className="w-3 h-3" />}
                      </div>
                      <span>{cat.name}</span>
                    </div>
                    <span className="text-[11px] text-stone-400 font-normal">
                      {cat.romanName}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* Dimension 2: Available Script */}
          <fieldset className="space-y-2 pt-2 border-t border-stone-100">
            <legend className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Available Script
            </legend>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {(
                [
                  { id: "all", label: "All Scripts" },
                  { id: "hindi", label: "Devanagari" },
                  { id: "roman", label: "Roman" },
                  { id: "both", label: "Both" },
                ] as const
              ).map((scriptOpt) => (
                <button
                  key={scriptOpt.id}
                  type="button"
                  onClick={() => handleScriptChange(scriptOpt.id)}
                  className={`py-1.5 px-2 rounded-lg border text-center font-medium transition-colors ${
                    filters.script === scriptOpt.id
                      ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                      : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  {scriptOpt.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Dimension 3: Tags (OR) */}
          {allTags.length > 0 && (
            <fieldset className="space-y-2 pt-2 border-t border-stone-100">
              <legend className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Themes & Tags (OR)
              </legend>
              <div className="flex flex-wrap gap-1.5">
                {allTags.map((tag) => {
                  const active = filters.tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        active
                          ? "bg-amber-700 text-white border-amber-700 font-medium"
                          : "bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200/70"
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}
        </aside>

        {/* Results Grid */}
        <section className="lg:col-span-3 space-y-4" aria-label="Search and Filter Results">
          {filteredResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResults.map(({ record }) => (
                <BhajanCard key={record.id} bhajan={record} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-dashed border-stone-300">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-serif font-bold text-stone-900 mb-2">
                No devotional bhajans found
              </h3>
              <p className="text-sm text-stone-500 max-w-md mx-auto mb-6">
                We couldn&apos;t find any bhajans matching your current search query and filters.
                Try relaxing your filter criteria or clearing the search terms.
              </p>
              <button
                type="button"
                onClick={handleResetAll}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm transition-colors shadow-sm"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span>Reset all filters</span>
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
