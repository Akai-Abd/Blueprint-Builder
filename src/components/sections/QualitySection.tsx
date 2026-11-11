'use client';

import { useMemo, useState } from 'react';
import { useBlueprintStore } from '@/stores/blueprintStore';
import { Blueprint } from '@/types/blueprint';
import { qualityOptions, qualityCategories } from '@/data/options/quality';
import { getRelevantQualityCategoryIds } from '@/lib/question';
import OptionCard from '@/components/questions/OptionCard';
import SectionFilterBar, { filterSectionOptions } from '@/components/questions/SectionFilterBar';

export default function QualitySection() {
  const blueprint = useBlueprintStore((s) => s.blueprint);
  const quality = blueprint.quality;
  const toggleQuality = useBlueprintStore((s) => s.toggleQuality);
  const [query, setQuery] = useState('');
  const [selectedOnly, setSelectedOnly] = useState(false);

  const relevantCategoryIds = useMemo(
    () => getRelevantQualityCategoryIds(blueprint),
    [blueprint],
  );

  const { primary, secondary } = useMemo(() => {
    if (!relevantCategoryIds) {
      return { primary: [...qualityCategories], secondary: [] as typeof qualityCategories[number][] };
    }
    const relevant = new Set(relevantCategoryIds);
    return {
      primary: qualityCategories.filter((cat) => relevant.has(cat.id)),
      secondary: qualityCategories.filter((cat) => !relevant.has(cat.id)),
    };
  }, [relevantCategoryIds]);

  const totalSelected = useMemo(
    () => Object.values(quality).reduce((sum, arr) => sum + (arr?.length ?? 0), 0),
    [quality],
  );

  const hasFilter = query.trim().length > 0 || selectedOnly;
  const hasProjectType = !!blueprint.basics.projectType;

  const filteredCategories = useMemo(() => {
    const ordered = [...primary, ...secondary];
    return ordered
      .map((cat) => {
        const selectedIds = quality[cat.id as keyof Blueprint['quality']] ?? [];
        const options = filterSectionOptions(
          qualityOptions[cat.id] ?? [],
          query,
          selectedOnly,
          selectedIds,
        );
        return { cat, selectedIds, options };
      })
      .filter((entry) => entry.options.length > 0);
  }, [primary, secondary, quality, query, selectedOnly]);

  return (
    <div className="section animate-fade-in">
      <div className="section__header">
        <h2 className="section__title">Quality & Standards</h2>
        <p className="section__description">
          Configure security, performance, SEO, testing, and deployment standards. These choices
          shape your testing plan and deployment guide.
          {hasProjectType && (
            <> Categories are filtered by relevance to your project type.</>
          )}
        </p>
      </div>

      <SectionFilterBar
        query={query}
        onQueryChange={setQuery}
        selectedOnly={selectedOnly}
        onSelectedOnlyChange={setSelectedOnly}
        placeholder="Search quality standards (e.g., WCAG, CI/CD, Rate Limiting)…"
        selectedCount={totalSelected}
      />

      {hasFilter ? (
        filteredCategories.length > 0 ? (
          filteredCategories.map(({ cat, selectedIds, options }) => (
            <div key={cat.id} className="section__group">
              <h3 className="section__group-title">
                <span className="section__group-icon">{cat.icon}</span>
                {cat.label}
                <span className="section__group-count">{selectedIds.length} selected</span>
              </h3>
              <div className="option-grid">
                {options.map((option) => (
                  <OptionCard
                    key={option.id}
                    option={option}
                    selected={selectedIds.includes(option.id)}
                    onToggle={(id) =>
                      toggleQuality(cat.id as keyof Blueprint['quality'], id)
                    }
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="section-filter-empty">
            No matching quality standards found.
          </div>
        )
      ) : (
        <>
          {primary.map((cat) => {
            const options = qualityOptions[cat.id] ?? [];
            const selectedIds = quality[cat.id as keyof Blueprint['quality']] ?? [];

            return (
              <div key={cat.id} className="section__group">
                <h3 className="section__group-title">
                  <span className="section__group-icon">{cat.icon}</span>
                  {cat.label}
                  <span className="section__group-count">{selectedIds.length} selected</span>
                </h3>
                <div className="option-grid">
                  {options.map((option) => (
                    <OptionCard
                      key={option.id}
                      option={option}
                      selected={selectedIds.includes(option.id)}
                      onToggle={(id) =>
                        toggleQuality(cat.id as keyof Blueprint['quality'], id)
                      }
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Less relevant categories */}
          {secondary.length > 0 && (
            <details className="section__collapsed-group">
              <summary className="section__collapsed-summary">
                <span className="section__group-icon">📦</span>
                Other Quality Categories
                <span className="section__group-count">{secondary.length} categories</span>
              </summary>
              {secondary.map((cat) => {
                const options = qualityOptions[cat.id] ?? [];
                const selectedIds = quality[cat.id as keyof Blueprint['quality']] ?? [];

                return (
                  <div key={cat.id} className="section__group">
                    <h3 className="section__group-title">
                      <span className="section__group-icon">{cat.icon}</span>
                      {cat.label}
                      <span className="section__group-count">{selectedIds.length} selected</span>
                    </h3>
                    <div className="option-grid">
                      {options.map((option) => (
                        <OptionCard
                          key={option.id}
                          option={option}
                          selected={selectedIds.includes(option.id)}
                          onToggle={(id) =>
                            toggleQuality(cat.id as keyof Blueprint['quality'], id)
                          }
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </details>
          )}
        </>
      )}
    </div>
  );
}
