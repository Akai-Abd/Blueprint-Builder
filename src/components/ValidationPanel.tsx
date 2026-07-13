'use client';

import { useMemo } from 'react';
import { useBlueprintStore } from '@/stores/blueprintStore';
import { BUILDER_SECTIONS, BuilderSectionId, ValidationSeverity } from '@/types/blueprint';
import { validateBlueprint, getValidationSummary } from '@/lib/validationEngine';

const SEVERITY_ICON: Record<ValidationSeverity, string> = {
  [ValidationSeverity.Error]: '🔴',
  [ValidationSeverity.Warning]: '🟡',
  [ValidationSeverity.Info]: '🔵',
};

const SEVERITY_CLASS: Record<ValidationSeverity, string> = {
  [ValidationSeverity.Error]: 'validation-item--error',
  [ValidationSeverity.Warning]: 'validation-item--warning',
  [ValidationSeverity.Info]: 'validation-item--info',
};

export default function ValidationPanel() {
  const blueprint = useBlueprintStore((s) => s.blueprint);
  const setActiveSection = useBlueprintStore((s) => s.setActiveSection);

  const results = useMemo(() => validateBlueprint(blueprint), [blueprint]);
  const summary = useMemo(() => getValidationSummary(results), [results]);

  if (results.length === 0) {
    return (
      <div className="validation-panel">
        <div className="validation-panel__header">
          <span className="validation-panel__title">
            ✅ Validation
          </span>
          <span className="validation-panel__count validation-panel__count--success">
            All clear
          </span>
        </div>
      </div>
    );
  }

  const sectionLabel = (id: BuilderSectionId) =>
    BUILDER_SECTIONS.find((s) => s.id === id)?.label ?? id;

  return (
    <div className="validation-panel">
      <div className="validation-panel__header">
        <span className="validation-panel__title">
          ⚡ Validation
        </span>
        <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
          {summary.errors.length > 0 && (
            <span className="validation-panel__count validation-panel__count--error">
              {summary.errors.length} error{summary.errors.length !== 1 ? 's' : ''}
            </span>
          )}
          {summary.warnings.length > 0 && (
            <span className="validation-panel__count validation-panel__count--warning">
              {summary.warnings.length} warning{summary.warnings.length !== 1 ? 's' : ''}
            </span>
          )}
          {summary.infos.length > 0 && (
            <span className="validation-panel__count validation-panel__count--info">
              {summary.infos.length} info
            </span>
          )}
        </div>
      </div>

      {results.map((result) => (
        <div
          key={result.id}
          className={`validation-item ${SEVERITY_CLASS[result.severity]}`}
          onClick={() => setActiveSection(result.section)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setActiveSection(result.section);
            }
          }}
        >
          <span className="validation-item__icon">
            {SEVERITY_ICON[result.severity]}
          </span>
          <div className="validation-item__content">
            <div className="validation-item__message">{result.message}</div>
            {result.suggestion && (
              <div className="validation-item__suggestion">{result.suggestion}</div>
            )}
          </div>
          <span className="validation-item__section">{sectionLabel(result.section)}</span>
        </div>
      ))}
    </div>
  );
}

/** Compact validation summary for use in the action bar */
export function ValidationSummaryBadge() {
  const blueprint = useBlueprintStore((s) => s.blueprint);
  const results = useMemo(() => validateBlueprint(blueprint), [blueprint]);
  const summary = useMemo(() => getValidationSummary(results), [results]);

  if (results.length === 0) {
    return (
      <div className="validation-summary">
        <span className="validation-dot validation-dot--success" />
        <span className="validation-summary__text">All valid</span>
      </div>
    );
  }

  return (
    <div className="validation-summary">
      {summary.hasErrors && <span className="validation-dot validation-dot--error" />}
      {summary.hasWarnings && !summary.hasErrors && (
        <span className="validation-dot validation-dot--warning" />
      )}
      <span className="validation-summary__text">
        {summary.total} issue{summary.total !== 1 ? 's' : ''}
      </span>
    </div>
  );
}
