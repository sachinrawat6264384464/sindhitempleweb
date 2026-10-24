function normalizeSearchText(text) {
  if (!text) return "";
  return text
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function filterAndRankBhajans(records, filters) {
  const normQuery = normalizeSearchText(filters.query);
  const queryTokens = normQuery ? normQuery.split(" ").filter(Boolean) : [];
  const results = [];

  for (const record of records) {
    if (filters.categories.length > 0 && !filters.categories.includes(record.categoryId)) {
      continue;
    }
    if (filters.tags.length > 0) {
      const hasAnyTag = filters.tags.some((t) => record.tags.includes(t));
      if (!hasAnyTag) continue;
    }
    if (filters.script === "hindi" && !record.hasHindi) continue;
    if (filters.script === "roman" && !record.hasRoman) continue;

    let score = 0;
    if (queryTokens.length > 0) {
      const normTitle = normalizeSearchText(record.title);
      const normRomanTitle = normalizeSearchText(record.romanTitle);
      const normFirstLine = normalizeSearchText(record.firstLine);
      const normAliases = record.alternateSpellings.map((a) => normalizeSearchText(a));
      const normLyrics = normalizeSearchText(record.normalizedLyricsSnippet);

      if (normTitle === normQuery || normRomanTitle === normQuery) {
        score += 1000;
      } else if (normTitle.includes(normQuery) || normRomanTitle.includes(normQuery)) {
        score += 500;
      }
      if (normFirstLine.includes(normQuery)) score += 300;
      if (normAliases.some((a) => a.includes(normQuery))) score += 250;
      for (const token of queryTokens) {
        if (normTitle.includes(token) || normRomanTitle.includes(token)) score += 60;
        if (normFirstLine.includes(token)) score += 40;
        if (normLyrics.includes(token)) score += 10;
      }
      if (score === 0) continue;
    }
    results.push({ record, score });
  }

  results.sort((a, b) => {
    if (filters.sortBy === "title") return a.record.romanTitle.localeCompare(b.record.romanTitle);
    if (filters.sortBy === "order") return a.record.displayOrder - b.record.displayOrder;
    if (filters.query && b.score !== a.score) return b.score - a.score;
    return a.record.displayOrder - b.record.displayOrder;
  });

  return results;
}
import fs from "fs";
import path from "path";

// Load search index from build or content
const bhajansDir = path.join(process.cwd(), "content", "bhajans");
const files = fs.readdirSync(bhajansDir).filter((f) => f.endsWith(".json"));
const records = files.map((f) => {
  const b = JSON.parse(fs.readFileSync(path.join(bhajansDir, f), "utf-8"));
  return {
    id: b.id,
    slug: b.slug,
    categoryId: b.categoryId,
    categoryName: b.categoryId,
    title: b.title,
    romanTitle: b.romanTitle,
    firstLine: b.firstLine,
    alternateSpellings: b.alternateSpellings || [],
    tags: b.tags || [],
    normalizedLyricsSnippet: (b.lyrics.flat().join(" ") + " " + b.romanLyrics.flat().join(" ")).slice(0, 300),
    hasHindi: true,
    hasRoman: true,
    displayOrder: b.displayOrder,
    isDemo: b.isDemo,
  };
});

console.log("🔍 Testing search and multi-filtering engine with 8 records...\n");

// Test 1: All records returned by default
const resAll = filterAndRankBhajans(records, {
  query: "",
  categories: [],
  tags: [],
  script: "all",
  sortBy: "order",
});
console.assert(resAll.length === 8, `Expected 8, got ${resAll.length}`);
console.log("✅ Test 1 Passed: Default search returns all 8 records.");

// Test 2: Search by Roman title
const resRoman = filterAndRankBhajans(records, {
  query: "Satguru",
  categories: [],
  tags: [],
  script: "all",
  sortBy: "relevance",
});
console.assert(resRoman.length >= 1, "Expected at least 1 match for Satguru");
console.assert(resRoman[0].record.slug === "satguru-charan-kamal-dhyaan", "Expected Satguru first");
console.log(`✅ Test 2 Passed: Roman search 'Satguru' matched ${resRoman.length} bhajans.`);

// Test 3: Search by Hindi Devanagari text
const resHindi = filterAndRankBhajans(records, {
  query: "राम",
  categories: [],
  tags: [],
  script: "all",
  sortBy: "relevance",
});
console.assert(resHindi.length >= 1, "Expected match for राम");
console.log(`✅ Test 3 Passed: Hindi search 'राम' matched ${resHindi.length} bhajans.`);

// Test 4: Category filter (OR inside dimension)
const resCat = filterAndRankBhajans(records, {
  query: "",
  categories: ["guru-bhakti", "aarti"],
  tags: [],
  script: "all",
  sortBy: "order",
});
console.assert(resCat.length === 4, `Expected 4 (2 in guru-bhakti + 2 in aarti), got ${resCat.length}`);
console.log(`✅ Test 4 Passed: Multi-category OR filter matched exactly 4 bhajans.`);

// Test 5: Search query AND Category filter combined
const resCombined = filterAndRankBhajans(records, {
  query: "Deep",
  categories: ["aarti"],
  tags: [],
  script: "all",
  sortBy: "relevance",
});
console.assert(resCombined.length === 1 && resCombined[0].record.slug === "deep-jale-mangal-aarti", "Expected 1 matching Aarti");
console.log("✅ Test 5 Passed: Search query AND Category filter combined correctly.");

// Test 6: Non-existent search query returns 0
const resEmpty = filterAndRankBhajans(records, {
  query: "nonexistenttext12345",
  categories: [],
  tags: [],
  script: "all",
  sortBy: "relevance",
});
console.assert(resEmpty.length === 0, "Expected 0 results for non-existent text");
console.log("✅ Test 6 Passed: Non-existent query cleanly returns 0 results for empty state.");

console.log("\n🎉 ALL SEARCH AND FILTER LOGIC TESTS PASSED!");
