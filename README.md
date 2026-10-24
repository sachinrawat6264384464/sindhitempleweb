# sindhitempleweb — Sindhi Bhajan Lyrics (सिंधी भजन लिरिक्स)

A modern, devotional reader for Sindhi bhajan lyrics, chants, and aartis built with **Next.js App Router**, **TypeScript**, and **Tailwind CSS**.

---

## ⚠️ Important Editorial Notice

> **“Demo content — replace with verified Sindhi bhajan lyrics.”**
>
> All 8 bhajans and 4 categories currently included are demonstration samples.
> The verses are written in Hindi with Roman phonetic transliteration to test layout, formatting, search indexing, and font sizing.
> **They do not constitute authentic Sindhi lyrics, historical translations, or canonical religious provenance.**
> By default, the entire site is protected with `noindex` until real, verified content is installed.

---

## 1. Key Features

- **Static Generation (SSG)**: All categories (`/categories/[slug]`) and bhajan detail pages (`/bhajans/[slug]`) are generated at build time for instant loading.
- **Initial HTML Lyric Delivery**: Full lyrics are present directly in the server-rendered HTML for search engine accessibility, text scrapers, and screen readers.
- **Preserved Stanza Formatting**: Stanzas and verses are stored as arrays of lines (`string[][]`), ensuring exact line breaks and spacing.
- **Dual Script Reading & Switcher**:
  - Pure Devanagari Hindi view
  - Roman transliteration view
  - Dual side-by-side view (desktop/tablet)
- **Reader Controls**:
  - Dynamic font-size adjustment (A-, Normal, A+, A+2)
  - One-click copy lyrics to clipboard with visual toast feedback
  - Share via Web Share API with instant fallback to clipboard link copy
  - In-category previous/next navigation
  - Related bhajans recommendations
- **Offline-First Instant Search**:
  - In-browser compact search index
  - Cross-script searching across Title, Roman Title, First Line, Lyrics, and Alternate Spellings
  - Multi-dimensional filters (Categories [OR], Tags [OR], Script availability, Sort)
  - Full bidirectional URL query parameter synchronization (`?q=...&categories=...&tags=...`)
- **Calm Devotional Aesthetics**:
  - Saffron, marigold gold, and warm parchment color palette
  - High-readability Noto Serif Devanagari typography
  - Fully responsive drawer navigation on mobile devices
  - Respects `prefers-reduced-motion`

---

## 2. Directory Structure

```
d:/sindhi website/
├── content/
│   ├── categories.json          # 4 demonstration categories
│   └── bhajans/                 # 8 individual demo bhajans (one JSON file each)
│       ├── satguru-charan-kamal-dhyaan.json
│       ├── guru-kripa-se-mukt-bhayi.json
│       ├── vinati-sun-he-prabhu-dayaala.json
│       ├── he-deva-tumhi-ek-sahara.json
│       ├── shri-ram-naam-ras-pijiye.json
│       ├── om-namah-shivaya-dhun-amrit.json
│       ├── deep-jale-mangal-aarti.json
│       └── sundar-jyoti-aarti-vandana.json
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout, fonts, demo banner, metadata
│   │   ├── page.tsx             # Home page with hero, categories, featured bhajans
│   │   ├── not-found.tsx        # Empathetic 404 page with search fallback
│   │   ├── sitemap.ts           # Dynamic sitemap respecting demo indexing safety
│   │   ├── robots.ts            # Crawler configuration for Googlebot, Bingbot, OAI-SearchBot
│   │   ├── bhajans/
│   │   │   ├── page.tsx         # Search & filter library page
│   │   │   └── [slug]/page.tsx  # Static lyric detail page with schema
│   │   ├── categories/
│   │   │   └── [slug]/page.tsx  # Category overview & bhajans listing
│   │   └── about/page.tsx       # Content notes, architecture & checklist
│   ├── components/
│   │   ├── Navbar.tsx           # Responsive header with mobile drawer
│   │   ├── Footer.tsx           # Devotional footer with links & disclaimer
│   │   ├── DemoBanner.tsx       # Prominent demo status banner
│   │   ├── BhajanCard.tsx       # Lyric preview card with badges
│   │   ├── BhajanLibraryClient.tsx # Search & multi-filter client engine
│   │   ├── LyricsReaderClient.tsx  # Interactive reader toolbar & views
│   │   ├── Breadcrumbs.tsx      # Accessible breadcrumbs
│   │   └── JsonLd.tsx           # Structured data script injector
│   └── lib/
│       ├── content.ts           # Abstraction layer for content access
│       ├── search.ts            # Unicode normalization & ranking engine
│       ├── types.ts             # TypeScript interfaces
│       └── config.ts            # Site configuration & canonical helpers
├── scripts/
│   └── validate-content.mjs     # Build-time schema and content validator
├── package.json
└── tailwind.config.ts
```

---

## 3. Getting Started

### Prerequisites
- Node.js 18.18+ or 20+ (tested on Node v24)
- npm 9+

### Installation
```bash
npm install
```

### Content Validation
Runs automatically before every build:
```bash
npm run prebuild
```

### Running Locally (Development Server)
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
```bash
npm run build
npm run start
```

---

## 4. Content Replacement Guide: Moving to Real Sindhi Bhajans

All content is cleanly decoupled into JSON files in `content/` and accessed through `src/lib/content.ts`.

### Step 1: Update Categories
Edit `content/categories.json`:
```json
[
  {
    "id": "guru-bhakti",
    "slug": "guru-bhakti",
    "name": "गुरु भक्ति",
    "romanName": "Guru Bhakti",
    "description": "Devotional compositions honoring the spiritual master...",
    "displayOrder": 1,
    "updatedAt": "2026-04-01"
  }
]
```

### Step 2: Add or Replace Bhajan JSON Files
Each bhajan must be placed in `content/bhajans/<unique-slug>.json`:
```json
{
  "id": "bhajan-sindhi-01",
  "slug": "palav-je-paaye-aaya",
  "categoryId": "prarthana",
  "title": "पलाव जे पाए आया",
  "romanTitle": "Palav Je Paaye Aaya",
  "firstLine": "पलाव जे पाए आया तो वटि दाता",
  "lyrics": [
    [
      "पलाव जे पाए आया तो वटि दाता,",
      "रखजो लाज मुहिंजी शहनशाह प्यारा।"
    ],
    [
      "असीं आहियूँ पापी तू आहीं बख्शिंदो,",
      "मेहर भरी नज़र कर मेहरबाना।"
    ]
  ],
  "romanLyrics": [
    [
      "Palav je paaye aaya to vati daata,",
      "Rakhjo laaj muhinji shahnshah pyaara."
    ],
    [
      "Aseen aahiyoon paapi tu aahin bakhshindo,",
      "Mehar bhari nazar kar meharbaana."
    ]
  ],
  "alternateSpellings": [
    "Palav Je Pae Aaya",
    "Palav Paya Aaya"
  ],
  "tags": ["sindhi", "prarthana", "palav", "surrender"],
  "displayOrder": 1,
  "isDemo": false,
  "source": "Sindhi Sant Bhajanavali (Verified 1978 Edition)",
  "updatedAt": "2026-04-15"
}
```

### Step 3: Run Build-Time Validation
```bash
node scripts/validate-content.mjs
```
The validator guarantees:
- Unique IDs and slugs
- Matching category references
- Correct 2-dimensional stanza arrays (`string[][]`)
- No empty lines or missing titles

---

## 5. Production Discovery & Search Engine Checklist

When you are ready to launch publicly with verified authentic content:

1. **Configure Production URL & Indexing Flag**
   In your production deployment environment (Vercel, Netlify, or server `.env.production`):
   ```env
   NEXT_PUBLIC_SITE_URL="https://your-bhajan-domain.com"
   NEXT_PUBLIC_ENABLE_INDEXING="true"
   ```
   Setting `NEXT_PUBLIC_ENABLE_INDEXING="true"` will:
   - Change robots meta tag from `noindex, follow` to `index, follow`.
   - Include all verified bhajan and category URLs in `sitemap.xml`.

2. **Verify in Google Search Console**
   - Add your property (Domain or URL prefix).
   - Verify ownership via DNS TXT record or HTML tag.
   - Submit your sitemap: `https://your-bhajan-domain.com/sitemap.xml`.

3. **Verify in Bing Webmaster Tools**
   - Import directly from Google Search Console or add domain verification.

4. **Crawler & AI Bot Access**
   - Our `src/app/robots.ts` allows `Googlebot`, `Bingbot`, and `OAI-SearchBot` (ChatGPT live search) to discover and index your public content.
   - OpenAI model training (`GPTBot`) is controlled independently via `ALLOW_AI_TRAINING=true` if you wish to allow training.

5. **Inspect Live URLs**
   - Run the URL Inspection tool in Google Search Console.
   - Confirm that Googlebot renders the complete lyrics directly from the initial HTML.

---

## 6. License
Designed for devotional literature preservation. Original demonstration layout and software code open under MIT License.
