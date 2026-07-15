'use client';

import { useMemo } from 'react';
import { useBlueprintStore } from '@/stores/blueprintStore';
import { Blueprint } from '@/types/blueprint';
import { qualityOptions, qualityCategories } from '@/data/options/quality';
import { getRelevantQualityCategoryIds } from '@/lib/question';
import OptionCard from '@/components/questions/OptionCard';

export default function QualitySection() {
  const blueprint = useBlueprintStore((s) => s.blueprint);
  const quality = blueprint.quality;
  const toggleQuality = useBlueprintStore((s) => s.toggleQuality);

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

  const hasProjectType = !!blueprint.basics.projectType;

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
    </div>
  );
}
