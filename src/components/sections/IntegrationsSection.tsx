'use client';

import { useState, useMemo } from 'react';
import { useBlueprintStore } from '@/stores/blueprintStore';
import { getFilteredIntegrations } from '@/lib/question';
import OptionCard from '@/components/questions/OptionCard';
import SectionFilterBar, { filterSectionOptions } from '@/components/questions/SectionFilterBar';

export default function IntegrationsSection() {
  const blueprint = useBlueprintStore((s) => s.blueprint);
  const selectedIntegrations = blueprint.integrations.selected;
  const toggleIntegration = useBlueprintStore((s) => s.toggleIntegration);
  const [showOther, setShowOther] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedOnly, setSelectedOnly] = useState(false);

  const { recommended, other } = useMemo(
    () => getFilteredIntegrations(blueprint),
    [blueprint],
  );

  const hasFilter = query.trim().length > 0 || selectedOnly;
  const filteredRecommended = useMemo(
    () => filterSectionOptions(recommended, query, selectedOnly, selectedIntegrations),
    [recommended, query, selectedOnly, selectedIntegrations],
  );
  const filteredOther = useMemo(
    () => filterSectionOptions(other, query, selectedOnly, selectedIntegrations),
    [other, query, selectedOnly, selectedIntegrations],
  );
  const filteredAll = useMemo(
    () => [...filteredRecommended, ...filteredOther],
    [filteredRecommended, filteredOther],
  );

  const hasProjectType = !!blueprint.basics.projectType;

  return (
    <div className="section animate-fade-in">
      <div className="section__header">
        <h2 className="section__title">Integrations</h2>
        <p className="section__description">
          Connect third-party services and APIs. These integrations will be documented in your
          architecture overview and deployment guide.
          {hasProjectType && (
            <> Integrations are sorted by relevance to your project type.</>
          )}
        </p>
      </div>

      <SectionFilterBar
        query={query}
        onQueryChange={setQuery}
        selectedOnly={selectedOnly}
        onSelectedOnlyChange={setSelectedOnly}
        placeholder="Search integrations (e.g., Stripe, Resend, OpenAI)…"
        selectedCount={selectedIntegrations.length}
      />

      {hasFilter ? (
        filteredAll.length > 0 ? (
          <div className="section__group">
            <h3 className="section__group-title">
              <span className="section__group-icon">🔗</span>
              Matching Integrations
              <span className="section__group-count">{filteredAll.length} shown</span>
            </h3>
            <div className="option-grid">
              {filteredAll.map((option) => (
                <OptionCard
                  key={option.id}
                  option={option}
                  selected={selectedIntegrations.includes(option.id)}
                  onToggle={toggleIntegration}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="section-filter-empty">
            No matching integrations found.
          </div>
        )
      ) : (
        <>
          {/* Recommended integrations */}
          <div className="section__group">
            <h3 className="section__group-title">
              <span className="section__group-icon">🔗</span>
              {hasProjectType ? 'Recommended Services' : 'Third-Party Services'}
              <span className="section__group-count">{selectedIntegrations.length} selected</span>
            </h3>
            <div className="option-grid">
              {recommended.map((option) => (
                <OptionCard
                  key={option.id}
                  option={option}
                  selected={selectedIntegrations.includes(option.id)}
                  onToggle={toggleIntegration}
                />
              ))}
            </div>
          </div>

          {/* Other integrations (collapsible) */}
          {other.length > 0 && (
            <div className="section__group">
              <button
                className="section__group-toggle"
                onClick={() => setShowOther((prev) => !prev)}
                aria-expanded={showOther}
              >
                <h3 className="section__group-title">
                  <span className="section__group-icon">📦</span>
                  Other Integrations
                  <span className="section__group-count">{other.length} available</span>
                </h3>
                <span className="section__group-chevron">{showOther ? '▾' : '▸'}</span>
              </button>
              {showOther && (
                <div className="option-grid">
                  {other.map((option) => (
                    <OptionCard
                      key={option.id}
                      option={option}
                      selected={selectedIntegrations.includes(option.id)}
                      onToggle={toggleIntegration}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
