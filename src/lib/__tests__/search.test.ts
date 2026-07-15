import { describe, it, expect } from 'vitest';
import { searchOptions, getAllSearchableItems } from '@/lib/searchEngine';

describe('searchEngine', () => {
  it('builds a searchable index with all option types', () => {
    const items = getAllSearchableItems();
    expect(items.length).toBeGreaterThan(0);
    const types = new Set(items.map((i) => i.sectionType));
    expect(types.has('technology')).toBe(true);
    expect(types.has('feature')).toBe(true);
    expect(types.has('integration')).toBe(true);
    expect(types.has('quality')).toBe(true);
  });

  it('returns popular items when query is empty', () => {
    const results = searchOptions('');
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(20);
  });

  it('finds results for a known technology name', () => {
    const results = searchOptions('react');
    expect(results.length).toBeGreaterThan(0);
    const names = results.map((r) => r.item.name.toLowerCase());
    expect(names.some((n) => n.includes('react'))).toBe(true);
  });

  it('filters by section type', () => {
    const results = searchOptions('auth', { sectionType: 'feature' });
    results.forEach((r) => {
      expect(r.item.sectionType).toBe('feature');
    });
  });

  it('returns empty for nonsense queries', () => {
    const results = searchOptions('xyzabc123nonexistent');
    expect(results).toHaveLength(0);
  });
});
