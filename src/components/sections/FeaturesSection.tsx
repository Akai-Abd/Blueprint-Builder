'use client';

import { useState, useMemo } from 'react';
import { useBlueprintStore } from '@/stores/blueprintStore';
import { getFilteredFeatures } from '@/lib/question';
import OptionCard from '@/components/questions/OptionCard';

export default function FeaturesSection() {
  const blueprint = useBlueprintStore((s) => s.blueprint);
  const selectedFeatures = blueprint.features.selected;
  const toggleFeature = useBlueprintStore((s) => s.toggleFeature);
  const [showOther, setShowOther] = useState(false);

  const { recommended, other } = useMemo(
    () => getFilteredFeatures(blueprint),
    [blueprint],
  );

  const hasProjectType = !!blueprint.basics.projectType;

  return (
    <div className="section animate-fade-in">
      <div className="section__header">
        <h2 className="section__title">Features</h2>
        <p className="section__description">
          Select the features your project needs. Each feature will be included in your
          generated documentation with user stories and acceptance criteria.
          {hasProjectType && (
            <> Features are sorted by relevance to your project type.</>
          )}
        </p>
      </div>

      {/* Recommended features */}
      <div className="section__group">
        <h3 className="section__group-title">
          <span className="section__group-icon">✨</span>
          {hasProjectType ? 'Recommended Features' : 'Available Features'}
          <span className="section__group-count">{selectedFeatures.length} selected</span>
        </h3>
        <div className="option-grid">
          {recommended.map((option) => (
            <OptionCard
              key={option.id}
              option={option}
              selected={selectedFeatures.includes(option.id)}
              onToggle={toggleFeature}
            />
          ))}
        </div>
      </div>

      {/* Other features (collapsible) */}
      {other.length > 0 && (
        <div className="section__group">
          <button
            className="section__group-toggle"
            onClick={() => setShowOther((prev) => !prev)}
            aria-expanded={showOther}
          >
            <h3 className="section__group-title">
              <span className="section__group-icon">📦</span>
              Other Features
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
                  selected={selectedFeatures.includes(option.id)}
                  onToggle={toggleFeature}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
