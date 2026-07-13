'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  searchOptions,
  searchFilterCategories,
  getRecentlyUsed,
  getFavorites,
  getFavoriteIds,
  toggleFavorite,
  trackUsage,
  type SearchResult,
  type SearchableItem,
} from '@/lib/searchEngine';
import { useBlueprintStore } from '@/stores/blueprintStore';
import { BuilderSectionId, type Blueprint } from '@/types/blueprint';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SECTION_TYPE_TO_SECTION: Record<string, BuilderSectionId> = {
  technology: BuilderSectionId.Technology,
  feature: BuilderSectionId.Features,
  integration: BuilderSectionId.Integrations,
  quality: BuilderSectionId.Quality,
};

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const blueprint = useBlueprintStore((s) => s.blueprint);
  const toggleTechnology = useBlueprintStore((s) => s.toggleTechnology);
  const toggleFeature = useBlueprintStore((s) => s.toggleFeature);
  const toggleIntegration = useBlueprintStore((s) => s.toggleIntegration);
  const toggleQuality = useBlueprintStore((s) => s.toggleQuality);
  const setActiveSection = useBlueprintStore((s) => s.setActiveSection);

  // Main search results
  const results = useMemo(() => {
    if (activeFilter === 'favorites') {
      const favItems = getFavorites();
      if (query.trim()) {
        const q = query.toLowerCase();
        return favItems
          .filter((item) =>
            item.name.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.tags.some((t) => t.toLowerCase().includes(q))
          )
          .map((item) => ({ item, score: 0 }));
      }
      return favItems.map((item) => ({ item, score: 0 }));
    }
    const filter = activeFilter !== 'all' ? { sectionType: activeFilter } : undefined;
    return searchOptions(query, filter);
  }, [query, activeFilter]);

  // Recently used (shown only when no query and filter is "all")
  const recentItems = useMemo(() => {
    if (query.trim() || activeFilter !== 'all') return [];
    return getRecentlyUsed();
  }, [query, activeFilter]);

  // Reset state and focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveFilter('all');
      setFocusedIndex(0);
      setFavoriteIds(getFavoriteIds());
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Reset focus when results change
  const prevResultsLength = useRef(results.length);
  useEffect(() => {
    if (results.length !== prevResultsLength.current) {
      prevResultsLength.current = results.length;
      setFocusedIndex(0);
    }
  }, [results.length]);

  const isItemSelected = useCallback(
    (result: SearchResult): boolean => {
      const { item } = result;
      switch (item.sectionType) {
        case 'technology': {
          const cat = item.subCategory ?? item.category;
          const arr = blueprint.technology[cat as keyof Blueprint['technology']];
          return arr?.includes(item.id) ?? false;
        }
        case 'feature':
          return blueprint.features.selected.includes(item.id);
        case 'integration':
          return blueprint.integrations.selected.includes(item.id);
        case 'quality': {
          const cat = item.subCategory ?? item.category;
          const arr = blueprint.quality[cat as keyof Blueprint['quality']];
          return arr?.includes(item.id) ?? false;
        }
        default:
          return false;
      }
    },
    [blueprint]
  );

  const handleSelect = useCallback(
    (result: SearchResult) => {
      const { item } = result;
      trackUsage(item.id);
      switch (item.sectionType) {
        case 'technology': {
          const cat = item.subCategory ?? item.category;
          toggleTechnology(cat as keyof Blueprint['technology'], item.id);
          break;
        }
        case 'feature':
          toggleFeature(item.id);
          break;
        case 'integration':
          toggleIntegration(item.id);
          break;
        case 'quality': {
          const cat = item.subCategory ?? item.category;
          toggleQuality(cat as keyof Blueprint['quality'], item.id);
          break;
        }
      }
    },
    [toggleTechnology, toggleFeature, toggleIntegration, toggleQuality]
  );

  const handleToggleFavorite = useCallback(
    (e: React.MouseEvent, itemId: string) => {
      e.stopPropagation();
      toggleFavorite(itemId);
      setFavoriteIds(getFavoriteIds());
    },
    []
  );

  const handleNavigateToSection = useCallback(
    (result: SearchResult) => {
      const section = SECTION_TYPE_TO_SECTION[result.item.sectionType];
      if (section) {
        setActiveSection(section);
        onClose();
      }
    },
    [setActiveSection, onClose]
  );

  // Total items for keyboard navigation
  const totalItems = recentItems.length + results.length;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((i) => Math.min(i + 1, totalItems - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter': {
          e.preventDefault();
          // Determine which item is focused
          let targetResult: SearchResult | undefined;
          if (focusedIndex < recentItems.length) {
            targetResult = { item: recentItems[focusedIndex], score: 0 };
          } else {
            targetResult = results[focusedIndex - recentItems.length];
          }
          if (targetResult) {
            if (e.shiftKey) {
              handleNavigateToSection(targetResult);
            } else {
              handleSelect(targetResult);
            }
          }
          break;
        }
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'Tab': {
          // Focus trap
          const modal = modalRef.current;
          if (!modal) break;
          const focusables = modal.querySelectorAll<HTMLElement>(
            'button, input, [tabindex]:not([tabindex="-1"])'
          );
          if (focusables.length === 0) break;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
          break;
        }
      }
    },
    [totalItems, focusedIndex, recentItems, results, handleSelect, handleNavigateToSection, onClose]
  );

  // Scroll focused item into view
  useEffect(() => {
    const container = resultsRef.current;
    if (!container) return;
    const focused = container.querySelector('.search-result--focused');
    if (focused) {
      focused.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex]);

  if (!isOpen) return null;

  // Group results by section type
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    const key = r.item.sectionLabel;
    (acc[key] ??= []).push(r);
    return acc;
  }, {});

  let globalIdx = recentItems.length; // offset for recently used items

  const renderResultItem = (
    item: SearchableItem,
    idx: number,
    onClick: () => void,
  ) => {
    const result: SearchResult = { item, score: 0 };
    const selected = isItemSelected(result);
    const isFav = favoriteIds.has(item.id);
    return (
      <div
        key={item.id}
        className={`search-result ${idx === focusedIndex ? 'search-result--focused' : ''}`}
        onClick={onClick}
        onMouseEnter={() => setFocusedIndex(idx)}
      >
        <span className="search-result__icon">
          {item.icon ?? '📦'}
        </span>
        <div className="search-result__content">
          <div className="search-result__name">{item.name}</div>
          <div className="search-result__desc">
            {item.description}
          </div>
        </div>
        <div className="search-result__meta">
          <button
            className={`search-result__fav-btn ${isFav ? 'search-result__fav-btn--active' : ''}`}
            onClick={(e) => handleToggleFavorite(e, item.id)}
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFav ? '★' : '☆'}
          </button>
          {selected && (
            <span className="search-result__selected-badge">✓ Selected</span>
          )}
          <span className="search-result__section-badge">
            {item.sectionLabel}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="search-overlay" onClick={onClose}>
      <div
        className="search-modal"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search options"
      >
        {/* Input */}
        <div className="search-modal__input-wrapper">
          <span className="search-modal__icon">🔍</span>
          <input
            ref={inputRef}
            className="search-modal__input"
            type="text"
            placeholder="Search technologies, features, integrations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          <span className="search-modal__shortcut">ESC</span>
        </div>

        {/* Filters */}
        <div className="search-modal__filters">
          {searchFilterCategories.map((f) => (
            <button
              key={f.id}
              className={`search-filter ${activeFilter === f.id ? 'search-filter--active' : ''}`}
              onClick={() => setActiveFilter(f.id)}
            >
              <span>{f.icon}</span>
              {f.label}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="search-modal__results" ref={resultsRef}>
          {/* Recently Used (only when no query and filter is "all") */}
          {recentItems.length > 0 && (
            <div>
              <div className="search-modal__group-label">🕒 Recently Used</div>
              {recentItems.map((item, i) =>
                renderResultItem(item, i, () =>
                  handleSelect({ item, score: 0 })
                )
              )}
            </div>
          )}

          {totalItems === 0 ? (
            <div className="search-modal__empty">
              <span className="search-modal__empty-icon">🔎</span>
              <span className="search-modal__empty-text">
                {activeFilter === 'favorites'
                  ? 'No favorites yet. Click ☆ on any item to add it.'
                  : query
                  ? `No results for "${query}"`
                  : 'Start typing to search...'}
              </span>
            </div>
          ) : (
            Object.entries(grouped).map(([groupLabel, groupResults]) => (
              <div key={groupLabel}>
                <div className="search-modal__group-label">{groupLabel}</div>
                {groupResults.map((result) => {
                  const idx = globalIdx++;
                  return renderResultItem(result.item, idx, () =>
                    handleSelect(result)
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="search-modal__footer">
          <div className="search-modal__footer-keys">
            <span className="search-modal__footer-key">
              <kbd>↑↓</kbd> navigate
            </span>
            <span className="search-modal__footer-key">
              <kbd>↵</kbd> toggle
            </span>
            <span className="search-modal__footer-key">
              <kbd>⇧↵</kbd> go to section
            </span>
            <span className="search-modal__footer-key">
              <kbd>esc</kbd> close
            </span>
          </div>
          <span>{results.length} results</span>
        </div>
      </div>
    </div>
  );
}
