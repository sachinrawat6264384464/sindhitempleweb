// Improved Devanagari to Phonetic Transliteration with Schwa Deletion
const DEVA_CONSONANTS = {
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

const DEVA_VOWELS = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
  'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
  'अं': 'an', 'अँ': 'an', 'ॐ': 'om'
};

const DEVA_MATRAS = {
  'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo',
  'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au'
};

export function devanagariToPhonetic(text) {
  if (!text) return "";
  const words = text.split(/(\s+|[^\u0900-\u097F]+)/);
  
  return words.map(chunk => {
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
            out += DEVA_CONSONANTS[ch] + 'a';
          }
        }
      } else if (DEVA_MATRAS[ch]) {
        out += DEVA_MATRAS[ch];
      } else if (ch === 'ं' || ch === 'ँ') {
        out += 'n';
      }
    }
    return out;
  }).join("");
}

export function normalizePhonetic(text) {
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

    // Specific word synonyms / roots
    if (/^(mai|main|me|mein|men|maen|mei)$/.test(w)) return "mai";
    if (/^(tu|tun|toon|too)$/.test(w)) return "tu";
    if (/^(satnam|satnaam|satanam|satnaama)$/.test(w)) return "satnam";
    if (/^(satguru|sadguru|sataguru)$/.test(w)) return "satguru";
    if (/^(dayal|dayalu|dayala)$/.test(w)) return "dayal";
    if (/^(guru|guroo)$/.test(w)) return "guru";
    if (/^(swami|svaami|swamee)$/.test(w)) return "swami";
    if (/^(teunram|teuram|teunraam|teu)$/.test(w)) return "teunram";
    if (/^(hari|haree|hare)$/.test(w)) return "hari";
    if (/^(bhajan|bhajana|bhajanu)$/.test(w)) return "bhajan";
    if (/^(raag|rag|raaga)$/.test(w)) return "raag";
    if (/^(jnyaan|gyan|giyan|dhyan)$/.test(w)) return "gyan";
    if (/^(prabhu|parbhu)$/.test(w)) return "prabhu";
    if (/^(sant|santo|santon|saadho|sadho)$/.test(w)) return "sant";

    // General phonetic sound collapsing:
    w = w.replace(/aa+/g, "a");
    w = w.replace(/ee+|ii+/g, "i");
    w = w.replace(/oo+|uu+/g, "u");
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

    if (w.length > 3 && (w.endsWith("n") || w.endsWith("m"))) {
      w = w.slice(0, -1);
    }

    return w;
  });

  return normalizedTokens.join(" ");
}

console.log("=== TESTS ===");
console.log("mai ->", normalizePhonetic("mai"));
console.log("me ->", normalizePhonetic("me"));
console.log("main ->", normalizePhonetic("main"));
console.log("mein ->", normalizePhonetic("mein"));
console.log("मैं ->", normalizePhonetic("मैं"));
console.log("में ->", normalizePhonetic("में"));
console.log("Satnam / सतनाम ->", normalizePhonetic("Satnam"), normalizePhonetic("सतनाम"));
console.log("Dayal / दयाल ->", normalizePhonetic("Dayal"), normalizePhonetic("दयाल"));
console.log("Guru / गुरु ->", normalizePhonetic("Guru"), normalizePhonetic("गुरु"));
console.log("Prabhu / प्रभु ->", normalizePhonetic("Prabhu"), normalizePhonetic("प्रभु"));
