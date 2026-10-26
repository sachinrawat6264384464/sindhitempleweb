import fs from "fs";
import { normalizePhonetic } from "./test-advanced-search.mjs";

const index = JSON.parse(fs.readFileSync("./public/search-index.json", "utf-8"));
console.log(`Loaded ${index.length} bhajans from search-index.json.`);

function searchBhajans(query) {
  const normQ = normalizePhonetic(query);
  const qTokens = normQ.split(/\s+/).filter(Boolean);

  const results = [];
  for (const b of index) {
    const normTitle = normalizePhonetic(b.title);
    const normRomanTitle = normalizePhonetic(b.romanTitle);
    const normFirstLine = normalizePhonetic(b.firstLine);
    const normLyrics = normalizePhonetic(b.lyrics);
    const normRomanLyrics = normalizePhonetic(b.romanLyrics);

    let score = 0;
    if (normTitle === normQ || normRomanTitle === normQ) score += 1000;
    else if (normTitle.includes(normQ) || normRomanTitle.includes(normQ)) score += 500;
    
    if (normFirstLine.includes(normQ)) score += 300;

    for (const t of qTokens) {
      if (normTitle.includes(t) || normRomanTitle.includes(t)) score += 80;
      if (normFirstLine.includes(t)) score += 50;
      if (normLyrics.includes(t) || normRomanLyrics.includes(t)) score += 20;
    }

    if (score > 0) {
      results.push({ id: b.id, title: b.title, romanTitle: b.romanTitle, score });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}

console.log("\n1. Searching for 'mai': found", searchBhajans("mai").length, "matches");
console.log("2. Searching for 'me': found", searchBhajans("me").length, "matches");
console.log("3. Searching for 'main': found", searchBhajans("main").length, "matches");
console.log("4. Searching for 'मैं': found", searchBhajans("मैं").length, "matches");
console.log("5. Searching for 'में': found", searchBhajans("में").length, "matches");

console.log("\nSample top 3 for 'mai':", searchBhajans("mai").slice(0, 3));
console.log("Sample top 3 for 'मैं':", searchBhajans("मैं").slice(0, 3));
