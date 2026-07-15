'use client';

import { useMemo } from 'react';
import { useBlueprintStore } from '@/stores/blueprintStore';
import { BuilderSectionId } from '@/types/blueprint';
import { allTechnologies } from '@/data/options/technologies';
import { featureOptions } from '@/data/options/features';
import { integrationOptions } from '@/data/options/integrations';
import { qualityOptions } from '@/data/options/quality';
import { validateBlueprint, getValidationSummary } from '@/lib/validation';
import { getOverallProgress } from '@/lib/progress';

interface ReviewScreenProps {
  onBack: () => void;
  onGenerate: () => void;
}

function fmt(val: string | null): string {
  if (!val) return '';
  return val.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function lookupName(id: string): string {
  const opt =
    allTechnologies.find((o) => o.id === id) ??
    featureOptions.find((o) => o.id === id) ??
    integrationOptions.find((o) => o.id === id) ??
    Object.values(qualityOptions).flat().find((o) => o.id === id);
  return opt?.name ?? fmt(id);
}

function lookupIcon(id: string): string {
  const opt =
    allTechnologies.find((o) => o.id === id) ??
    featureOptions.find((o) => o.id === id) ??
    integrationOptions.find((o) => o.id === id) ??
    Object.values(qualityOptions).flat().find((o) => o.id === id);
  return opt?.icon ?? '📦';
}

export default function ReviewScreen({ onBack, onGenerate }: ReviewScreenProps) {
  const blueprint = useBlueprintStore((s) => s.blueprint);
  const setActiveSection = useBlueprintStore((s) => s.setActiveSection);

  const validation = useMemo(() => validateBlueprint(blueprint), [blueprint]);
  const summary = useMemo(() => getValidationSummary(validation), [validation]);
  const progress = useMemo(() => getOverallProgress(blueprint), [blueprint]);

  const { basics, technology, features, integrations, quality } = blueprint;
  const techEntries: [string, string[]][] = Object.entries(technology).filter(([, ids]) => ids.length > 0);
  const qualityEntries: [string, string[]][] = Object.entries(quality).filter(([, ids]) => ids.length > 0);

  const handleJumpTo = (section: BuilderSectionId) => {
    setActiveSection(section);
    onBack();
  };

  return (
    <div className="review-screen animate-fade-in">
      {/* Header */}
      <div className="review-screen__header">
        <div>
          <h1 className="review-screen__title">Review Your Blueprint</h1>
          <p className="review-screen__subtitle">
            Review your project configuration before generating documentation.
          </p>
        </div>
        <div className="review-screen__actions">
          <button className="btn btn--ghost" onClick={onBack}>← Back to Builder</button>
          <button
            className="btn btn--primary"
            onClick={onGenerate}
            disabled={summary.hasErrors}
          >
            Generate Documents →
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="review-progress">
        <div className="review-progress__bar-wrapper">
          <div className="review-progress__bar">
            <div
              className="review-progress__fill"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <span className="review-progress__label">
            {progress.percentage}% complete — {progress.completedSections}/{progress.totalSections} sections
          </span>
        </div>
      </div>

      {/* Validation Alerts */}
      {validation.length > 0 && (
        <div className="review-alerts">
          {summary.hasErrors && (
            <div className="review-alert review-alert--error">
              <span className="review-alert__icon">🔴</span>
              <div className="review-alert__content">
                <strong>{summary.errors.length} error{summary.errors.length !== 1 ? 's' : ''}</strong> must be fixed before generating documents.
                <ul className="review-alert__list">
                  {summary.errors.map((e) => (
                    <li key={e.id}>
                      {e.message}
                      <button
                        className="review-alert__fix-btn"
                        onClick={() => handleJumpTo(e.section)}
                      >
                        Fix →
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {summary.warnings.length > 0 && (
            <div className="review-alert review-alert--warning">
              <span className="review-alert__icon">🟡</span>
              <div className="review-alert__content">
                <strong>{summary.warnings.length} warning{summary.warnings.length !== 1 ? 's' : ''}</strong>
                <ul className="review-alert__list">
                  {summary.warnings.map((w) => (
                    <li key={w.id}>
                      {w.message}
                      <button
                        className="review-alert__fix-btn"
                        onClick={() => handleJumpTo(w.section)}
                      >
                        Fix →
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review Cards Grid */}
      <div className="review-grid">

        {/* Project Basics */}
        <ReviewCard
          title="Project Basics"
          icon="📋"
          section={BuilderSectionId.ProjectBasics}
          onEdit={handleJumpTo}
        >
          <ReviewField label="Name" value={basics.name} />
          <ReviewField label="Type" value={fmt(basics.projectType)} />
          <ReviewField label="Category" value={basics.category} />
          <ReviewField label="Industry" value={basics.industry} />
          <ReviewField label="Audience" value={basics.targetAudience} />
          <ReviewField label="Business Model" value={fmt(basics.businessModel)} />
          {basics.description && (
            <div className="review-card__description">{basics.description}</div>
          )}
        </ReviewCard>

        {/* Platforms */}
        <ReviewCard
          title="Platforms"
          icon="🖥️"
          section={BuilderSectionId.Platforms}
          onEdit={handleJumpTo}
        >
          {basics.targetPlatforms.length > 0 ? (
            <div className="review-tags">
              {basics.targetPlatforms.map((p) => (
                <span key={p} className="review-tag">{fmt(p)}</span>
              ))}
            </div>
          ) : (
            <p className="review-card__empty">No platforms selected</p>
          )}
        </ReviewCard>

        {/* Technology Stack */}
        <ReviewCard
          title="Technology Stack"
          icon="⚙️"
          section={BuilderSectionId.Technology}
          onEdit={handleJumpTo}
          wide
        >
          {techEntries.length > 0 ? (
            <div className="review-tech-grid">
              {techEntries.map(([cat, ids]) => (
                <div key={cat} className="review-tech-group">
                  <span className="review-tech-group__label">{fmt(cat)}</span>
                  <div className="review-tags">
                    {ids.map((id) => (
                      <span key={id} className="review-tag review-tag--tech">
                        {lookupIcon(id)} {lookupName(id)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="review-card__empty">No technologies selected</p>
          )}
        </ReviewCard>

        {/* Features */}
        <ReviewCard
          title="Features"
          icon="✨"
          section={BuilderSectionId.Features}
          onEdit={handleJumpTo}
        >
          {features.selected.length > 0 ? (
            <div className="review-list">
              {features.selected.map((id) => (
                <div key={id} className="review-list-item">
                  <span className="review-list-item__icon">{lookupIcon(id)}</span>
                  <span className="review-list-item__name">{lookupName(id)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="review-card__empty">No features selected</p>
          )}
        </ReviewCard>

        {/* Integrations */}
        <ReviewCard
          title="Integrations"
          icon="🔗"
          section={BuilderSectionId.Integrations}
          onEdit={handleJumpTo}
        >
          {integrations.selected.length > 0 ? (
            <div className="review-list">
              {integrations.selected.map((id) => (
                <div key={id} className="review-list-item">
                  <span className="review-list-item__icon">{lookupIcon(id)}</span>
                  <span className="review-list-item__name">{lookupName(id)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="review-card__empty">No integrations selected</p>
          )}
        </ReviewCard>

        {/* Quality */}
        <ReviewCard
          title="Quality & Non-Functional"
          icon="🛡️"
          section={BuilderSectionId.Quality}
          onEdit={handleJumpTo}
        >
          {qualityEntries.length > 0 ? (
            <div className="review-tech-grid">
              {qualityEntries.map(([cat, ids]) => (
                <div key={cat} className="review-tech-group">
                  <span className="review-tech-group__label">{fmt(cat)}</span>
                  <div className="review-tags">
                    {ids.map((id) => (
                      <span key={id} className="review-tag">
                        {lookupName(id)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="review-card__empty">No quality options selected</p>
          )}
        </ReviewCard>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────

function ReviewCard({
  title,
  icon,
  section,
  onEdit,
  wide,
  children,
}: {
  title: string;
  icon: string;
  section: BuilderSectionId;
  onEdit: (s: BuilderSectionId) => void;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`review-card ${wide ? 'review-card--wide' : ''}`}>
      <div className="review-card__header">
        <span className="review-card__header-icon">{icon}</span>
        <h3 className="review-card__title">{title}</h3>
        <button
          className="review-card__edit-btn"
          onClick={() => onEdit(section)}
        >
          ✏️ Edit
        </button>
      </div>
      <div className="review-card__body">{children}</div>
    </div>
  );
}

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="review-field">
      <span className="review-field__label">{label}</span>
      <span className={`review-field__value ${!value ? 'review-field__value--empty' : ''}`}>
        {value || 'Not set'}
      </span>
    </div>
  );
}
