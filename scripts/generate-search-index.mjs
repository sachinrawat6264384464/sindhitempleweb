import fs from "fs";
import path from "path";

const contentDir = path.join(process.cwd(), "content");
const bhajansDir = path.join(contentDir, "bhajans");
const categoriesFile = path.join(contentDir, "categories.json");
const publicDir = path.join(process.cwd(), "public");
const outputFile = path.join(publicDir, "search-index.json");

console.log("Generating client search index for all bhajans...");

const categories = JSON.parse(fs.readFileSync(categoriesFile, "utf-8"));
const categoryMap = new Map();
for (const c of categories) {
  categoryMap.set(c.id, c.name);
}

const files = fs.readdirSync(bhajansDir).filter((f) => f.endsWith(".json"));
const index = [];

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(bhajansDir, file), "utf-8"));
  const tekText = Array.isArray(data.tek) ? data.tek.join(" ") : "";
  const rTekText = Array.isArray(data.romanTek) ? data.romanTek.join(" ") : "";
  const lText = (tekText + " " + (Array.isArray(data.lyrics) ? data.lyrics.map((st) => st.join(" ")).join(" ") : "")).trim();
  const rText = (rTekText + " " + (Array.isArray(data.romanLyrics) ? data.romanLyrics.map((st) => st.join(" ")).join(" ") : "")).trim();

  index.push({
    id: data.id,
    slug: data.slug,
    categoryId: data.categoryId,
    categoryName: categoryMap.get(data.categoryId) || data.categoryId,
    title: data.title,
    romanTitle: data.romanTitle,
    firstLine: data.firstLine || "",
    lyrics: lText,
    romanLyrics: rText,
    tags: data.tags || [],
    displayOrder: data.displayOrder || 0,
  });
}

index.sort((a, b) => a.displayOrder - b.displayOrder);

fs.writeFileSync(outputFile, JSON.stringify(index), "utf-8");
console.log(`✅ Generated ${outputFile} with ${index.length} bhajans for instant full-text search.`);
