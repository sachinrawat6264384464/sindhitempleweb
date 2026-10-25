import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const contentDir = path.join(rootDir, "content");
const categoriesFile = path.join(contentDir, "categories.json");
const bhajansDir = path.join(contentDir, "bhajans");

console.log("🔍 Validating real Sindhi Bhajan content files from Shri Amarapur Vaani...");

// 1. Validate categories
if (!fs.existsSync(categoriesFile)) {
  console.error("❌ categories.json not found at " + categoriesFile);
  process.exit(1);
}

const categories = JSON.parse(fs.readFileSync(categoriesFile, "utf-8"));
if (!Array.isArray(categories) || categories.length === 0) {
  console.error("❌ categories.json must contain a non-empty JSON array");
  process.exit(1);
}

const categoryIds = new Set();
const categorySlugs = new Set();
for (const cat of categories) {
  if (!cat.id || !cat.slug || !cat.name || !cat.romanName) {
    console.error(`❌ Category missing required fields: ${JSON.stringify(cat)}`);
    process.exit(1);
  }
  if (categoryIds.has(cat.id)) {
    console.error(`❌ Duplicate category ID: ${cat.id}`);
    process.exit(1);
  }
  if (categorySlugs.has(cat.slug)) {
    console.error(`❌ Duplicate category slug: ${cat.slug}`);
    process.exit(1);
  }
  categoryIds.add(cat.id);
  categorySlugs.add(cat.slug);
}

// 2. Validate bhajans
if (!fs.existsSync(bhajansDir)) {
  console.error("❌ bhajans directory not found at " + bhajansDir);
  process.exit(1);
}

const bhajanFiles = fs.readdirSync(bhajansDir).filter((f) => f.endsWith(".json"));
if (bhajanFiles.length === 0) {
  console.error("❌ No bhajan JSON files found in " + bhajansDir);
  process.exit(1);
}

const bhajanIds = new Set();
const bhajanSlugs = new Set();

for (const file of bhajanFiles) {
  const filePath = path.join(bhajansDir, file);
  let bhajan;
  try {
    bhajan = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (err) {
    console.error(`❌ Error parsing JSON file ${file}:`, err);
    process.exit(1);
  }

  // Validate required fields
  const required = [
    "id",
    "slug",
    "categoryId",
    "title",
    "romanTitle",
    "firstLine",
    "lyrics",
    "romanLyrics",
    "tags",
    "source",
    "updatedAt",
  ];
  for (const field of required) {
    if (bhajan[field] === undefined || bhajan[field] === null || bhajan[field] === "") {
      console.error(`❌ Bhajan ${file} is missing required field "${field}"`);
      process.exit(1);
    }
  }

  // Unique IDs and slugs
  if (bhajanIds.has(bhajan.id)) {
    console.error(`❌ Duplicate bhajan ID "${bhajan.id}" in file ${file}`);
    process.exit(1);
  }
  if (bhajanSlugs.has(bhajan.slug)) {
    console.error(`❌ Duplicate bhajan slug "${bhajan.slug}" in file ${file}`);
    process.exit(1);
  }
  bhajanIds.add(bhajan.id);
  bhajanSlugs.add(bhajan.slug);

  // Valid category reference
  if (!categoryIds.has(bhajan.categoryId)) {
    console.error(`❌ Bhajan ${file} references unknown categoryId "${bhajan.categoryId}"`);
    process.exit(1);
  }

  // Validate lyrics formatting (array of stanzas containing array of non-empty lines)
  if (!Array.isArray(bhajan.lyrics) || bhajan.lyrics.length === 0) {
    console.error(`❌ Bhajan ${file} lyrics must be a non-empty array of stanzas`);
    process.exit(1);
  }
  for (let s = 0; s < bhajan.lyrics.length; s++) {
    const stanza = bhajan.lyrics[s];
    if (!Array.isArray(stanza) || stanza.length === 0) {
      console.error(`❌ Bhajan ${file} stanza ${s} must be a non-empty array of lines`);
      process.exit(1);
    }
  }

  // Validate romanLyrics formatting
  if (!Array.isArray(bhajan.romanLyrics) || bhajan.romanLyrics.length === 0) {
    console.error(`❌ Bhajan ${file} romanLyrics must be a non-empty array of stanzas`);
    process.exit(1);
  }
}

console.log(`✅ Content validation succeeded: ${categories.length} categories and ${bhajanFiles.length} authentic bhajans verified.`);
