import fs from "fs";
import path from "path";
import { Category, Bhajan, CategoryWithBhajans, SearchRecord } from "./types";

const contentDir = path.join(process.cwd(), "content");
const categoriesFilePath = path.join(contentDir, "categories.json");
const bhajansDirPath = path.join(contentDir, "bhajans");

// In-memory cache for static read efficiency within Node runtime
let cachedCategories: Category[] | null = null;
let cachedBhajans: Bhajan[] | null = null;

/**
 * Reusable function to fetch all categories.
 * Can be swapped with a database query without changing UI consumers.
 */
export async function getAllCategories(): Promise<Category[]> {
  if (cachedCategories) {
    return cachedCategories;
  }
  const fileContent = fs.readFileSync(categoriesFilePath, "utf-8");
  const categories: Category[] = JSON.parse(fileContent);
  categories.sort((a, b) => a.displayOrder - b.displayOrder);
  cachedCategories = categories;
  return categories;
}

/**
 * Get category by its slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getAllCategories();
  const found = categories.find((c) => c.slug === slug);
  return found || null;
}

/**
 * Reusable function to fetch all bhajans.
 * In production or with a DB, this can be swapped directly.
 */
export async function getAllBhajans(): Promise<Bhajan[]> {
  if (cachedBhajans) {
    return cachedBhajans;
  }
  if (!fs.existsSync(bhajansDirPath)) {
    return [];
  }
  const files = fs.readdirSync(bhajansDirPath).filter((f) => f.endsWith(".json"));
  const bhajans: Bhajan[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(bhajansDirPath, file), "utf-8");
    const parsed = JSON.parse(raw) as Bhajan;
    bhajans.push(parsed);
  }

  bhajans.sort((a, b) => a.displayOrder - b.displayOrder);
  cachedBhajans = bhajans;
  return bhajans;
}

/**
 * Get bhajan by slug directly from file
 */
export async function getBhajanBySlug(slug: string): Promise<Bhajan | null> {
  const filePath = path.join(bhajansDirPath, `${slug}.json`);
  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw) as Bhajan;
    } catch (e) {
      console.error(`Error reading bhajan file ${filePath}:`, e);
    }
  }
  const bhajans = await getAllBhajans();
  const found = bhajans.find((b) => b.slug === slug);
  return found || null;
}

// Category map cache
let cachedCategoryBhajanMap: Map<string, Bhajan[]> | null = null;

/**
 * Get all bhajans belonging to a specific category ID
 */
export async function getBhajansByCategory(categoryId: string): Promise<Bhajan[]> {
  if (cachedCategoryBhajanMap && cachedCategoryBhajanMap.has(categoryId)) {
    return cachedCategoryBhajanMap.get(categoryId)!;
  }

  const bhajans = await getAllBhajans();
  if (!cachedCategoryBhajanMap) {
    cachedCategoryBhajanMap = new Map();
    for (const b of bhajans) {
      if (!cachedCategoryBhajanMap.has(b.categoryId)) {
        cachedCategoryBhajanMap.set(b.categoryId, []);
      }
      cachedCategoryBhajanMap.get(b.categoryId)!.push(b);
    }
    for (const list of cachedCategoryBhajanMap.values()) {
      list.sort((a, b) => a.displayOrder - b.displayOrder);
    }
  }

  return cachedCategoryBhajanMap.get(categoryId) || [];
}

/**
 * Get category with its bhajans populated
 */
export async function getCategoryWithBhajans(slug: string): Promise<CategoryWithBhajans | null> {
  const category = await getCategoryBySlug(slug);
  if (!category) return null;
  const bhajans = await getBhajansByCategory(category.id);
  return {
    ...category,
    bhajans,
  };
}

/**
 * Get previous and next bhajans within the same category for navigation
 */
export async function getAdjacentBhajansInCategory(
  bhajanId: string,
  categoryId: string
): Promise<{ prev: Bhajan | null; next: Bhajan | null }> {
  const categoryBhajans = await getBhajansByCategory(categoryId);
  const currentIndex = categoryBhajans.findIndex((b) => b.id === bhajanId);

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  const prev = currentIndex > 0 ? categoryBhajans[currentIndex - 1] : null;
  const next = currentIndex < categoryBhajans.length - 1 ? categoryBhajans[currentIndex + 1] : null;

  return { prev, next };
}

/**
 * Get related bhajans sharing category (excluding current)
 */
export async function getRelatedBhajans(currentBhajan: Bhajan, limit: number = 3): Promise<Bhajan[]> {
  const categoryBhajans = await getBhajansByCategory(currentBhajan.categoryId);
  const others = categoryBhajans.filter((b) => b.id !== currentBhajan.id);
  return others.slice(0, limit);
}

/**
 * Generate lightweight search index for in-browser client searching
 */
export async function getSearchIndex(): Promise<SearchRecord[]> {
  const bhajans = await getAllBhajans();
  const categories = await getAllCategories();
  const categoryMap = new Map<string, { name: string; slug: string }>();
  for (const c of categories) {
    categoryMap.set(c.id, { name: c.name, slug: c.slug });
  }

  return bhajans.map((b) => {
    // Flatten lyrics to a searchable snippet
    const flattenedLyrics = b.lyrics.map((st) => st.join(" ")).join(" ");
    const flattenedRoman = b.romanLyrics.map((st) => st.join(" ")).join(" ");
    const snippet = (flattenedLyrics + " " + flattenedRoman).slice(0, 400);
    const catInfo = categoryMap.get(b.categoryId);

    return {
      id: b.id,
      slug: b.slug,
      categoryId: b.categoryId,
      categoryName: catInfo?.name || b.categoryId,
      categorySlug: catInfo?.slug || b.categoryId,
      title: b.title,
      romanTitle: b.romanTitle,
      firstLine: b.firstLine,
      alternateSpellings: b.alternateSpellings || [],
      tags: b.tags || [],
      normalizedLyricsSnippet: snippet,
      hasHindi: Array.isArray(b.lyrics) && b.lyrics.length > 0,
      hasRoman: Array.isArray(b.romanLyrics) && b.romanLyrics.length > 0,
      displayOrder: b.displayOrder,
      isDemo: b.isDemo,
    };
  });
}
