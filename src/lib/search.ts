import { SearchRecord } from "./types";

/**
 * Normalizes text for search indexing and querying:
 * - NFKD Unicode normalization
 * - Lowercases Roman text
 * - Strips punctuation marks
 * - Collapses whitespace
 * Preserves Devanagari and Roman characters accurately.
 */
export function normalizeSearchText(text: string): string {
  if (!text) return "";
  return text
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export interface FilterState {
  query: string;
  categories: string[];
  tags: string[];
  script: "all" | "hindi" | "roman" | "both";
  sortBy: "relevance" | "title" | "order";
}

export interface SearchResultItem {
  record: SearchRecord;
  score: number;
}

/**
 * Performs local in-memory search and multi-dimensional filtering
 * Same filter dimension uses OR (e.g., category A OR category B)
 * Different filter dimensions use AND (categories AND tags AND script AND search)
 */
export function filterAndRankBhajans(
  records: SearchRecord[],
  filters: FilterState
): SearchResultItem[] {
  const normQuery = normalizeSearchText(filters.query);
  const queryTokens = normQuery ? normQuery.split(" ").filter(Boolean) : [];

  const results: SearchResultItem[] = [];

  for (const record of records) {
    // 1. Dimension: Categories (OR within dimension)
    if (filters.categories.length > 0 && !filters.categories.includes(record.categoryId)) {
      continue;
    }

    // 2. Dimension: Tags (OR within dimension)
    if (filters.tags.length > 0) {
      const hasAnyTag = filters.tags.some((t) => record.tags.includes(t));
      if (!hasAnyTag) {
        continue;
      }
    }

    // 3. Dimension: Script
    if (filters.script === "hindi" && !record.hasHindi) {
      continue;
    }
    if (filters.script === "roman" && !record.hasRoman) {
      continue;
    }
    if (filters.script === "both" && (!record.hasHindi || !record.hasRoman)) {
      continue;
    }

    // 4. Dimension: Search Query Scoring
    let score = 0;

    if (queryTokens.length > 0) {
      const normTitle = normalizeSearchText(record.title);
      const normRomanTitle = normalizeSearchText(record.romanTitle);
      const normFirstLine = normalizeSearchText(record.firstLine);
      const normAliases = record.alternateSpellings.map((a) => normalizeSearchText(a));
      const normTags = record.tags.map((t) => normalizeSearchText(t));
      const fullLyrics = (record.fullLyricsText || "") + " " + (record.fullRomanLyricsText || "") + " " + (record.normalizedLyricsSnippet || "");
      const normFullLyrics = normalizeSearchText(fullLyrics);

      // Exact title match gets highest score
      if (normTitle === normQuery || normRomanTitle === normQuery) {
        score += 1000;
      } else if (normTitle.includes(normQuery) || normRomanTitle.includes(normQuery)) {
        score += 500;
      }

      // Check first line match
      if (normFirstLine.includes(normQuery)) {
        score += 300;
      }

      // Check alternate spellings/aliases (cross-script stored transliterations)
      if (normAliases.some((a) => a.includes(normQuery))) {
        score += 250;
      }

      // Check full lyrics match for whole phrase
      if (normFullLyrics.includes(normQuery)) {
        score += 180;
      }

      // Check tags
      if (normTags.some((t) => t.includes(normQuery))) {
        score += 150;
      }

      // Check individual query tokens across fields
      for (const token of queryTokens) {
        if (normTitle.includes(token) || normRomanTitle.includes(token)) {
          score += 60;
        }
        if (normFirstLine.includes(token)) {
          score += 40;
        }
        if (normAliases.some((a) => a.includes(token))) {
          score += 30;
        }
        if (normTags.some((t) => t.includes(token))) {
          score += 20;
        }
        if (normFullLyrics.includes(token)) {
          score += 15;
        }
      }

      // If a query was specified but no match occurred, skip this record
      if (score === 0) {
        continue;
      }
    }

    results.push({ record, score });
  }

  // Sorting
  results.sort((a, b) => {
    if (filters.sortBy === "title") {
      return a.record.romanTitle.localeCompare(b.record.romanTitle);
    }
    if (filters.sortBy === "order") {
      return a.record.displayOrder - b.record.displayOrder;
    }
    // Default: relevance
    if (filters.query && b.score !== a.score) {
      return b.score - a.score;
    }
    return a.record.displayOrder - b.record.displayOrder;
  });

  return results;
}

/**
 * Extracts a matching snippet line from bhajan lyrics for query preview
 */
export function findMatchingSnippet(record: SearchRecord, query: string): string | null {
  if (!query || query.trim().length === 0) return null;
  const normQuery = normalizeSearchText(query);
  if (!normQuery) return null;

  // Split into lines from full lyrics
  const combined = `${record.fullLyricsText || ""}\n${record.fullRomanLyricsText || ""}\n${record.firstLine || ""}`;
  const lines = combined.split(/[\n\r]+/);

  // 1. Exact phrase match in a line
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (normalizeSearchText(trimmed).includes(normQuery)) {
      return trimmed;
    }
  }

  // 2. Token match in a line
  const tokens = normQuery.split(" ").filter((t) => t.length >= 3);
  for (const token of tokens) {
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (normalizeSearchText(trimmed).includes(token)) {
        return trimmed;
      }
    }
  }

  return null;
}
