'use client';

import { useMemo } from 'react';
import { useBlueprintStore } from '@/stores/blueprintStore';
import { Blueprint } from '@/types/blueprint';
import { technologyCategories } from '@/data/options/technologies';
import { getRecommendationMap } from '@/lib/recommendation';
import { getRelevantTechCategoryIds } from '@/lib/question';
import OptionCard from '@/components/questions/OptionCard';

export default function TechnologySection() {
  const blueprint = useBlueprintStore((s) => s.blueprint);
  const technology = blueprint.technology;
  const toggleTechnology = useBlueprintStore((s) => s.toggleTechnology);

  const recMap = useMemo(() => getRecommendationMap(blueprint), [blueprint]);

  const relevantCategoryIds = useMemo(
    () => getRelevantTechCategoryIds(blueprint),
    [blueprint],
  );

  // Filter categories: show relevant first, then others
  const { primary, secondary } = useMemo(() => {
    if (!relevantCategoryIds) {
      return { primary: technologyCategories, secondary: [] };
    }
    const relevant = new Set(relevantCategoryIds);
    return {
      primary: technologyCategories.filter((cat) => relevant.has(cat.id)),
      secondary: technologyCategories.filter((cat) => !relevant.has(cat.id)),
    };
  }, [relevantCategoryIds]);

  const hasProjectType = !!blueprint.basics.projectType;

  return (
    <div className="section animate-fade-in">
      <div className="section__header">
        <h2 className="section__title">Technology Stack</h2>
        <p className="section__description">
          Choose the technologies for each layer of your application. Look for{' '}
          <strong>⭐ Recommended</strong> badges on options that pair well with your
          selections.
          {hasProjectType && (
            <> Categories are filtered by relevance to your project type.</>
          )}
        </p>
      </div>

      {primary.map((cat) => {
        const selectedIds = technology[cat.id as keyof Blueprint['technology']] ?? [];
        return (
          <div key={cat.id} className="section__group">
            <h3 className="section__group-title">
              <span className="section__group-icon">{cat.icon}</span>
              {cat.label}
              <span className="section__group-count">{selectedIds.length} selected</span>
            </h3>
            <div className="option-grid">
              {cat.options.map((option) => (
                <OptionCard
                  key={option.id}
                  option={option}
                  selected={selectedIds.includes(option.id)}
                  onToggle={(id) =>
                    toggleTechnology(cat.id as keyof Blueprint['technology'], id)
                  }
                  recommendation={recMap.get(option.id)}
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
            Other Technology Categories
            <span className="section__group-count">{secondary.length} categories</span>
          </summary>
          {secondary.map((cat) => {
            const selectedIds = technology[cat.id as keyof Blueprint['technology']] ?? [];
            return (
              <div key={cat.id} className="section__group">
                <h3 className="section__group-title">
                  <span className="section__group-icon">{cat.icon}</span>
                  {cat.label}
                  <span className="section__group-count">{selectedIds.length} selected</span>
                </h3>
                <div className="option-grid">
                  {cat.options.map((option) => (
                    <OptionCard
                      key={option.id}
                      option={option}
                      selected={selectedIds.includes(option.id)}
                      onToggle={(id) =>
                        toggleTechnology(cat.id as keyof Blueprint['technology'], id)
                      }
                      recommendation={recMap.get(option.id)}
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
