import Fuse from 'fuse.js';
import { Option } from '@/types/blueprint';
import { allTechnologies } from '@/data/options/technologies';
import { featureOptions } from '@/data/options/features';
import { integrationOptions } from '@/data/options/integrations';
import { qualityOptions } from '@/data/options/quality';

// ─── Searchable Item ─────────────────────────────────────────────────

export interface SearchableItem extends Option {
  sectionLabel: string;
  sectionType: 'technology' | 'feature' | 'integration' | 'quality';
  subCategory?: string;
}

// ─── Build Searchable Index ──────────────────────────────────────────

function buildSearchIndex(): SearchableItem[] {
  const items: SearchableItem[] = [];

  // Technologies
  for (const tech of allTechnologies) {
    items.push({ ...tech, sectionLabel: 'Technology', sectionType: 'technology', subCategory: tech.category });
  }

  // Features
  for (const feat of featureOptions) {
    items.push({ ...feat, sectionLabel: 'Features', sectionType: 'feature' });
  }

  // Integrations
  for (const integ of integrationOptions) {
    items.push({ ...integ, sectionLabel: 'Integrations', sectionType: 'integration' });
  }

  // Quality options (flatten from record)
  for (const [cat, options] of Object.entries(qualityOptions)) {
    for (const opt of options) {
      items.push({ ...opt, sectionLabel: 'Quality', sectionType: 'quality', subCategory: cat });
    }
  }

  return items;
}

// ─── Fuse Instance ───────────────────────────────────────────────────

let searchIndex: SearchableItem[] | null = null;
let fuseInstance: Fuse<SearchableItem> | null = null;

function getFuse(): Fuse<SearchableItem> {
  if (!fuseInstance) {
    searchIndex = buildSearchIndex();
    fuseInstance = new Fuse(searchIndex, {
      keys: [
        { name: 'name', weight: 3 },
        { name: 'description', weight: 1.5 },
        { name: 'tags', weight: 2 },
        { name: 'category', weight: 1 },
        { name: 'sectionLabel', weight: 0.5 },
      ],
      threshold: 0.35,
      includeScore: true,
      minMatchCharLength: 2,
    });
  }
  return fuseInstance;
}

// ─── Search API ──────────────────────────────────────────────────────

export interface SearchResult {
  item: SearchableItem;
  score: number;
}

export function searchOptions(
  query: string,
  filter?: { sectionType?: string; category?: string }
): SearchResult[] {
  if (!query.trim()) {
    // Return popular items when no query
    let items = [...(searchIndex ?? buildSearchIndex())].sort((a, b) => b.popularity - a.popularity);
    if (filter?.sectionType) {
      items = items.filter((i) => i.sectionType === filter.sectionType);
    }
    if (filter?.category) {
      items = items.filter((i) => i.category === filter.category || i.subCategory === filter.category);
    }
    return items.slice(0, 20).map((item) => ({ item, score: 0 }));
  }

  const fuse = getFuse();
  let results = fuse.search(query, { limit: 30 });

  if (filter?.sectionType) {
    results = results.filter((r) => r.item.sectionType === filter.sectionType);
  }
  if (filter?.category) {
    results = results.filter(
      (r) => r.item.category === filter.category || r.item.subCategory === filter.category
    );
  }

  return results.map((r) => ({ item: r.item, score: r.score ?? 0 }));
}

export function getAllSearchableItems(): SearchableItem[] {
  return searchIndex ?? buildSearchIndex();
}

// ─── Recently Used ───────────────────────────────────────────────────

const RECENT_KEY = 'bb_recently_used';
const MAX_RECENT = 10;

export function trackUsage(itemId: string): void {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    let ids: string[] = raw ? JSON.parse(raw) : [];
    ids = ids.filter((id) => id !== itemId);
    ids.unshift(itemId);
    if (ids.length > MAX_RECENT) ids.length = MAX_RECENT;
    localStorage.setItem(RECENT_KEY, JSON.stringify(ids));
  } catch { /* localStorage unavailable */ }
}

export function getRecentlyUsed(): SearchableItem[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const ids: string[] = JSON.parse(raw);
    const allItems = searchIndex ?? buildSearchIndex();
    return ids
      .map((id) => allItems.find((item) => item.id === id))
      .filter((item): item is SearchableItem => item !== undefined);
  } catch {
    return [];
  }
}

// ─── Favorites ───────────────────────────────────────────────────────

const FAVORITES_KEY = 'bb_favorites';

export function toggleFavorite(itemId: string): boolean {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    let ids: string[] = raw ? JSON.parse(raw) : [];
    const wasFav = ids.includes(itemId);
    if (wasFav) {
      ids = ids.filter((id) => id !== itemId);
    } else {
      ids.push(itemId);
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
    return !wasFav; // returns new state
  } catch {
    return false;
  }
}

export function isFavorite(itemId: string): boolean {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return false;
    const ids: string[] = JSON.parse(raw);
    return ids.includes(itemId);
  } catch {
    return false;
  }
}

export function getFavorites(): SearchableItem[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const ids: string[] = JSON.parse(raw);
    const allItems = searchIndex ?? buildSearchIndex();
    return ids
      .map((id) => allItems.find((item) => item.id === id))
      .filter((item): item is SearchableItem => item !== undefined);
  } catch {
    return [];
  }
}

export function getFavoriteIds(): Set<string> {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

// ─── Filter Categories ───────────────────────────────────────────────

export const searchFilterCategories = [
  { id: 'all', label: 'All', icon: '🔍' },
  { id: 'favorites', label: 'Favorites', icon: '⭐' },
  { id: 'technology', label: 'Technology', icon: '⚙️' },
  { id: 'feature', label: 'Features', icon: '✨' },
  { id: 'integration', label: 'Integrations', icon: '🔗' },
  { id: 'quality', label: 'Quality', icon: '🛡️' },
] as const;

