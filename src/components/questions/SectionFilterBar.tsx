'use client';

import type { Option } from '@/types/blueprint';

interface SectionFilterBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  selectedOnly: boolean;
  onSelectedOnlyChange: (selectedOnly: boolean) => void;
  placeholder?: string;
  selectedCount?: number;
}

/** Filter options by search query (name/description/tags) and optional selected-only mode. */
export function filterSectionOptions<T extends Option>(
  options: readonly T[],
  query: string,
  selectedOnly: boolean,
  selectedIds: readonly string[],
): T[] {
  const normalized = query.trim().toLowerCase();
  return options.filter((opt) => {
    if (selectedOnly && !selectedIds.includes(opt.id)) {
      return false;
    }
    if (!normalized) return true;
    return (
      opt.name.toLowerCase().includes(normalized) ||
      opt.description.toLowerCase().includes(normalized) ||
      opt.tags.some((t) => t.toLowerCase().includes(normalized))
    );
  });
}

/** Shared inline search + selected-only filter bar for option-grid builder sections. */
export default function SectionFilterBar({
  query,
  onQueryChange,
  selectedOnly,
  onSelectedOnlyChange,
  placeholder = 'Filter options by name, description, or tag…',
  selectedCount,
}: SectionFilterBarProps) {
  const hasFilter = query.trim().length > 0 || selectedOnly;

  return (
    <div className="section-filter-bar">
      <div className="section-filter-bar__search">
        <span className="section-filter-bar__icon" aria-hidden="true">🔍</span>
        <input
          type="text"
          className="section-filter-bar__input"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
        />
        {query && (
          <button
            type="button"
            className="section-filter-bar__clear-input"
            onClick={() => onQueryChange('')}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      <button
        type="button"
        className={`btn btn--ghost btn--sm section-filter-bar__toggle ${
          selectedOnly ? 'section-filter-bar__toggle--active' : ''
        }`}
        onClick={() => onSelectedOnlyChange(!selectedOnly)}
        aria-pressed={selectedOnly}
      >
        Selected only{selectedCount !== undefined ? ` (${selectedCount})` : ''}
      </button>

      {hasFilter && (
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => {
            onQueryChange('');
            onSelectedOnlyChange(false);
          }}
        >
          Reset
        </button>
      )}
    </div>
  );
}

