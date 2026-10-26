import { SearchRecord } from "./types";

const DEVA_CONSONANTS: Record<string, string> = {
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
  'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
  'क़': 'q', 'ख़': 'kh', 'ग़': 'gh', 'ज़': 'z', 'ड़': 'r', 'ढ़': 'rh', 'फ़': 'f',
  'ॻ': 'g', 'ॼ': 'j', 'ॾ': 'd', 'ॿ': 'b'
};

const DEVA_VOWELS: Record<string, string> = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
  'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
  'अं': 'an', 'अँ': 'an', 'ॐ': 'om'
};

const DEVA_MATRAS: Record<string, string> = {
  'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo',
  'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au'
};

/**
 * Phonetic Devanagari to Roman transliteration with terminal schwa deletion.
 */
export function devanagariToPhonetic(text: string): string {
  if (!text) return "";
  const words = text.split(/(\s+|[^\u0900-\u097F]+)/);

  return words
    .map((chunk) => {
      if (!/[\u0900-\u097F]/.test(chunk)) return chunk;
      let out = "";
      const len = chunk.length;
      for (let i = 0; i < len; i++) {
        const ch = chunk[i];
        if (DEVA_VOWELS[ch]) {
          out += DEVA_VOWELS[ch];
        } else if (DEVA_CONSONANTS[ch]) {
          const next = i + 1 < len ? chunk[i + 1] : null;
          if (next === '्') {
            out += DEVA_CONSONANTS[ch];
            i++; // skip virama
          } else if (next && DEVA_MATRAS[next]) {
            out += DEVA_CONSONANTS[ch] + DEVA_MATRAS[next];
            i++; // skip matra
          } else {
            // Terminal schwa deletion: Hindi/Sindhi words don't pronounce final inherent 'a'
            if (i === len - 1) {
              out += DEVA_CONSONANTS[ch];
            } else {
              out += DEVA_CONSONANTS[ch] + "a";
            }
          }
        } else if (DEVA_MATRAS[ch]) {
          out += DEVA_MATRAS[ch];
        } else if (ch === 'ं' || ch === 'ँ') {
          out += 'n';
        }
      }
      return out;
    })
    .join("");
}

/**
 * Normalizes text for search indexing and querying:
 * - Handles cross-script queries (Devanagari <-> Roman)
 * - Equates spelling variations (e.g. mai / me / main / mein / मैं / में)
 * - Collapses repeated vowels and aspirated/unaspirated consonants
 */
export function normalizePhonetic(text: string): string {
  if (!text) return "";

  let t = text;
  if (/[\u0900-\u097F]/.test(t)) {
    t = devanagariToPhonetic(t);
  }

  t = t.normalize("NFKD").toLowerCase();
  t = t.replace(/[^a-z0-9\s]/g, " ");

  const tokens = t.split(/\s+/).filter(Boolean);
  const normalizedTokens = tokens.map((word) => {
    let w = word;

    // Specific word synonyms / roots (Sindhi & Hindi Bhajan vocabulary)
    if (/^(mai|main|me|mein|men|maen|mei)$/.test(w)) return "mai";
    if (/^(tu|tun|toon|too)$/.test(w)) return "tu";
    if (/^(satnam|satnaam|satanam|satnaama)$/.test(w)) return "satnam";
    if (/^(satguru|sadguru|sataguru)$/.test(w)) return "satguru";
    if (/^(dayal|dayalu|dayala|dayaa)$/.test(w)) return "dayal";
    if (/^(guru|guroo)$/.test(w)) return "guru";
    if (/^(swami|svaami|swamee)$/.test(w)) return "swami";
    if (/^(teunram|teuram|teunraam|teu)$/.test(w)) return "teunram";
    if (/^(hari|haree|hare)$/.test(w)) return "hari";
    if (/^(bhajan|bhajana|bhajanu)$/.test(w)) return "bhajan";
    if (/^(raag|rag|raaga)$/.test(w)) return "raag";
    if (/^(jnyaan|gyan|giyan|dhyan)$/.test(w)) return "gyan";
    if (/^(prabhu|parbhu)$/.test(w)) return "prabhu";
    if (/^(sant|santo|santon|saadho|sadho)$/.test(w)) return "sant";
    if (/^(naam|nam|naamu)$/.test(w)) return "naam";
    if (/^(paap|paapu)$/.test(w)) return "paap";
    if (/^(charan|charnan|charnau)$/.test(w)) return "charan";

    // General phonetic sound collapsing:
    w = w.replace(/aa+/g, "a");
    w = w.replace(/ee+|ii+/g, "i");
    w = w.replace(/oo+|uu+/g, "u");
    w = w.replace(/ai+|ay+|ei+|ey+/g, "e");
    w = w.replace(/au+|ou+/g, "o");

    // Consonant collapses
    w = w.replace(/w/g, "v");
    w = w.replace(/sh/g, "s");
    w = w.replace(/z/g, "j");
    w = w.replace(/chh/g, "ch");
    w = w.replace(/kh/g, "k");
    w = w.replace(/gh/g, "g");
    w = w.replace(/th/g, "t");
    w = w.replace(/dh/g, "d");
    w = w.replace(/bh/g, "b");
    w = w.replace(/ph/g, "f");

    // Trailing nasal removal (e.g. main -> mai, daasan -> daasa)
    if (w.length > 3 && (w.endsWith("n") || w.endsWith("m"))) {
      w = w.slice(0, -1);
    }

    return w;
  });

  return normalizedTokens.join(" ");
}

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
 * Performs fast, multi-dimensional search and rank over bhajans
 */
export function filterAndRankBhajans(
  records: SearchRecord[],
  filters: FilterState
): SearchResultItem[] {
  const rawQuery = filters.query.trim();
  const normQuery = normalizeSearchText(rawQuery);
  const phoneticQuery = normalizePhonetic(rawQuery);

  const queryTokens = normQuery ? normQuery.split(" ").filter(Boolean) : [];
  const phoneticTokens = phoneticQuery ? phoneticQuery.split(" ").filter(Boolean) : [];

  const results: SearchResultItem[] = [];

  for (const record of records) {
    // 1. Dimension: Categories
    if (filters.categories.length > 0 && !filters.categories.includes(record.categoryId)) {
      continue;
    }

    // 2. Dimension: Tags
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

    if (queryTokens.length > 0 || phoneticTokens.length > 0) {
      const normTitle = normalizeSearchText(record.title);
      const normRomanTitle = normalizeSearchText(record.romanTitle);
      const normFirstLine = normalizeSearchText(record.firstLine);
      const normAliases = record.alternateSpellings.map((a) => normalizeSearchText(a));
      const normTags = record.tags.map((t) => normalizeSearchText(t));
      const fullLyrics = `${record.fullLyricsText || ""} ${record.fullRomanLyricsText || ""} ${record.normalizedLyricsSnippet || ""}`;
      const normFullLyrics = normalizeSearchText(fullLyrics);

      const pTitle = normalizePhonetic(record.title);
      const pRomanTitle = normalizePhonetic(record.romanTitle);
      const pFirstLine = normalizePhonetic(record.firstLine);
      const pLyrics = normalizePhonetic(fullLyrics);

      // Exact matches
      if (normTitle === normQuery || normRomanTitle === normQuery || pTitle === phoneticQuery || pRomanTitle === phoneticQuery) {
        score += 1000;
      } else if (normTitle.includes(normQuery) || normRomanTitle.includes(normQuery) || pTitle.includes(phoneticQuery) || pRomanTitle.includes(phoneticQuery)) {
        score += 500;
      }

      // First line match
      if (normFirstLine.includes(normQuery) || pFirstLine.includes(phoneticQuery)) {
        score += 300;
      }

      // Aliases
      if (normAliases.some((a) => a.includes(normQuery) || normalizePhonetic(a).includes(phoneticQuery))) {
        score += 250;
      }

      // Whole phrase in lyrics
      if (normFullLyrics.includes(normQuery) || pLyrics.includes(phoneticQuery)) {
        score += 200;
      }

      // Tags
      if (normTags.some((t) => t.includes(normQuery) || normalizePhonetic(t).includes(phoneticQuery))) {
        score += 150;
      }

      // Token matches
      for (const token of queryTokens) {
        if (normTitle.includes(token) || normRomanTitle.includes(token)) score += 60;
        if (normFirstLine.includes(token)) score += 40;
        if (normAliases.some((a) => a.includes(token))) score += 30;
        if (normFullLyrics.includes(token)) score += 20;
      }

      for (const pToken of phoneticTokens) {
        if (pTitle.includes(pToken) || pRomanTitle.includes(pToken)) score += 60;
        if (pFirstLine.includes(pToken)) score += 40;
        if (pLyrics.includes(pToken)) score += 20;
      }

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
  const pQuery = normalizePhonetic(query);

  const combined = `${record.fullLyricsText || ""}\n${record.fullRomanLyricsText || ""}\n${record.firstLine || ""}`;
  const lines = combined.split(/[\n\r]+/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (normalizeSearchText(trimmed).includes(normQuery) || normalizePhonetic(trimmed).includes(pQuery)) {
      return trimmed;
    }
  }

  const tokens = pQuery.split(" ").filter((t) => t.length >= 2);
  for (const token of tokens) {
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (normalizePhonetic(trimmed).includes(token)) {
        return trimmed;
      }
    }
  }

  return null;
}
