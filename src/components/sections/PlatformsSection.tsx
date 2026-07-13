'use client';

import { useBlueprintStore } from '@/stores/blueprintStore';
import { platformOptions } from '@/data/options/platforms';

export default function PlatformsSection() {
  const targetPlatforms = useBlueprintStore((s) => s.blueprint.basics.targetPlatforms);
  const toggleTargetPlatform = useBlueprintStore((s) => s.toggleTargetPlatform);

  return (
    <div className="section animate-fade-in">
      <div className="section__header">
        <h2 className="section__title">Target Platforms</h2>
        <p className="section__description">
          Select all platforms your project will target. You can choose multiple platforms — the
          technology recommendations will adapt accordingly.
        </p>
      </div>

      <div className="section__group">
        <h3 className="section__group-title">
          <span className="section__group-icon">🖥️</span>
          Platforms
          <span className="section__group-count">{targetPlatforms.length} selected</span>
        </h3>
        <div className="option-grid">
          {platformOptions.map((platform) => {
            const isSelected = targetPlatforms.includes(platform.id);
            return (
              <div
                key={platform.id}
                className={`option-card ${isSelected ? 'option-card--selected' : ''}`}
                onClick={() => toggleTargetPlatform(platform.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleTargetPlatform(platform.id);
                  }
                }}
              >
                <div className="option-card__header">
                  <span className="option-card__icon">{platform.icon}</span>
                  <span className="option-card__name">{platform.label}</span>
                  <span className="option-card__check">{isSelected ? '✓' : ''}</span>
                </div>
                <p className="option-card__description">{platform.description}</p>
                <div className="option-card__meta">
                  {platform.examples.slice(0, 3).map((ex) => (
                    <span key={ex} className="option-card__badge">{ex}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
