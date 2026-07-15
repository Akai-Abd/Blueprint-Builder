'use client';

import { useBlueprintStore } from '@/stores/blueprintStore';
import ValidationPanel from '@/components/ValidationPanel';
import { useDebouncedBlueprint } from '@/hooks/useDebouncedBlueprint';

interface RightSummaryPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

/** Maps option IDs back to display names */
function formatEnum(val: string | null): string {
  if (!val) return '';
  return val
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function RightSummaryPanel({ isOpen, onClose }: RightSummaryPanelProps) {
  const blueprint = useDebouncedBlueprint();
  const { basics, technology, features, integrations, quality } = blueprint;

  const techEntries = Object.entries(technology).filter(([, arr]) => arr.length > 0);
  const qualityEntries = Object.entries(quality).filter(([, arr]) => arr.length > 0);

  return (
    <aside
      className={`builder-summary ${isOpen ? 'builder-summary--open' : ''}`}
      role="complementary"
      aria-label="Project summary"
    >
      <div className="builder-summary__header">
        <h2 className="builder-summary__title">
          <span aria-hidden="true">📊</span> Project Summary
        </h2>
        {onClose && (
          <button
            className="btn btn--ghost btn--icon btn--sm"
            onClick={onClose}
            aria-label="Close summary panel"
            style={{ marginLeft: 'auto' }}
          >
            ✕
          </button>
        )}
      </div>

      <div className="builder-summary__content">
        {/* Project Basics */}
        <div className="summary-group">
          <h3 className="summary-group__title">Project Basics</h3>
          <SummaryField label="Name" value={basics.name} />
          <SummaryField label="Type" value={formatEnum(basics.projectType)} />
          <SummaryField label="Industry" value={basics.industry} />
          <SummaryField label="Audience" value={basics.targetAudience} />
          <SummaryField label="Model" value={formatEnum(basics.businessModel)} />
        </div>

        {/* Platforms */}
        <div className="summary-group">
          <h3 className="summary-group__title">Platforms</h3>
          {basics.targetPlatforms.length > 0 ? (
            basics.targetPlatforms.map((p) => (
              <span key={p} className="summary-tag">{formatEnum(p)}</span>
            ))
          ) : (
            <p className="summary-group__empty">No platforms selected</p>
          )}
        </div>

        {/* Technology */}
        <div className="summary-group">
          <h3 className="summary-group__title">Technology Stack</h3>
          {techEntries.length > 0 ? (
            techEntries.map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  {formatEnum(cat)}:
                </span>{' '}
                {items.map((id: string) => (
                  <span key={id} className="summary-tag">{id}</span>
                ))}
              </div>
            ))
          ) : (
            <p className="summary-group__empty">No technologies selected</p>
          )}
        </div>

        {/* Features */}
        <div className="summary-group">
          <h3 className="summary-group__title">Features</h3>
          {features.selected.length > 0 ? (
            features.selected.map((f) => (
              <span key={f} className="summary-tag">{f}</span>
            ))
          ) : (
            <p className="summary-group__empty">No features selected</p>
          )}
        </div>

        {/* Integrations */}
        <div className="summary-group">
          <h3 className="summary-group__title">Integrations</h3>
          {integrations.selected.length > 0 ? (
            integrations.selected.map((i) => (
              <span key={i} className="summary-tag">{i}</span>
            ))
          ) : (
            <p className="summary-group__empty">No integrations selected</p>
          )}
        </div>

        {/* Quality */}
        <div className="summary-group">
          <h3 className="summary-group__title">Quality</h3>
          {qualityEntries.length > 0 ? (
            qualityEntries.map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  {formatEnum(cat)}:
                </span>{' '}
                {items.map((id: string) => (
                  <span key={id} className="summary-tag">{id}</span>
                ))}
              </div>
            ))
          ) : (
            <p className="summary-group__empty">No quality options selected</p>
          )}
        </div>

        {/* Validation Panel */}
        <ValidationPanel />
      </div>
    </aside>
  );
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-field">
      <span className="summary-field__label">{label}</span>
      <span className={`summary-field__value ${!value ? 'summary-field__value--empty' : ''}`}>
        {value || 'Not set'}
      </span>
    </div>
  );
}
