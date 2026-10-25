export interface Category {
  id: string;
  slug: string;
  name: string;
  romanName: string;
  description: string;
  displayOrder: number;
  updatedAt: string;
}

export interface Bhajan {
  id: string;
  slug: string;
  categoryId: string;
  title: string;
  romanTitle: string;
  firstLine: string;
  lyrics: string[][]; // Array of stanzas, each containing an array of lines
  romanLyrics: string[][]; // Transliterated stanzas
  alternateSpellings: string[];
  tags: string[];
  displayOrder: number;
  isDemo: boolean;
  source: string;
  updatedAt: string;
}

export interface SearchRecord {
  id: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  categorySlug?: string;
  title: string;
  romanTitle: string;
  firstLine: string;
  alternateSpellings: string[];
  tags: string[];
  normalizedLyricsSnippet: string;
  fullLyricsText?: string;
  fullRomanLyricsText?: string;
  hasHindi: boolean;
  hasRoman: boolean;
  displayOrder: number;
  isDemo: boolean;
}

export interface CategoryWithBhajans extends Category {
  bhajans: Bhajan[];
}
