'use client';

import { useMemo, useEffect } from 'react';
import { useBlueprintStore } from '@/stores/blueprintStore';
import { BUILDER_SECTIONS, BuilderSectionId } from '@/types/blueprint';
import ProjectBasicsSection from '@/components/sections/ProjectBasicsSection';
import PlatformsSection from '@/components/sections/PlatformsSection';
import TechnologySection from '@/components/sections/TechnologySection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import IntegrationsSection from '@/components/sections/IntegrationsSection';
import QualitySection from '@/components/sections/QualitySection';
import { ValidationSummaryBadge } from '@/components/ValidationPanel';
import { generateRecommendations } from '@/lib/recommendationEngine';
import ErrorBoundary from '@/components/ErrorBoundary';
import type { SaveStatus } from './BuilderLayout';

const SECTION_COMPONENTS: Record<BuilderSectionId, React.ComponentType> = {
  [BuilderSectionId.ProjectBasics]: ProjectBasicsSection,
  [BuilderSectionId.Platforms]: PlatformsSection,
  [BuilderSectionId.Technology]: TechnologySection,
  [BuilderSectionId.Features]: FeaturesSection,
  [BuilderSectionId.Integrations]: IntegrationsSection,
  [BuilderSectionId.Quality]: QualitySection,
};

interface MainPanelProps {
  onOpenSearch: () => void;
  onReview: () => void;
  onToggleAI: () => void;
  saveStatus?: SaveStatus;
  onExport?: () => void;
  onToggleNav?: () => void;
  onToggleSummary?: () => void;
}

export default function MainPanel({
  onOpenSearch,
  onReview,
  onToggleAI,
  saveStatus = 'idle',
  onExport,
  onToggleNav,
  onToggleSummary,
}: MainPanelProps) {
  const activeSection = useBlueprintStore((s) => s.blueprint.activeSection);
  const section = BUILDER_SECTIONS.find((s) => s.id === activeSection);
  const undo = useBlueprintStore((s) => s.undo);
  const redo = useBlueprintStore((s) => s.redo);
  const canUndo = useBlueprintStore((s) => s.canUndo);
  const canRedo = useBlueprintStore((s) => s.canRedo);

  // Global Ctrl+Z / Ctrl+Y
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const ActiveComponent = SECTION_COMPONENTS[activeSection];

  return (
    <main className="builder-main" role="main" aria-label="Builder content">
      {/* Header */}
      <div className="builder-main__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          {/* Hamburger for mobile */}
          {onToggleNav && (
            <button
              className="hamburger-btn"
              onClick={onToggleNav}
              aria-label="Open navigation menu"
            >
              ☰
            </button>
          )}
          <div className="builder-main__title-group">
            <span className="builder-main__section-label">
              Step {BUILDER_SECTIONS.findIndex((s) => s.id === activeSection) + 1} of{' '}
              {BUILDER_SECTIONS.length}
            </span>
            <h1 className="builder-main__section-title">{section?.label ?? 'Builder'}</h1>
          </div>
        </div>
        <div className="builder-main__actions">
          {/* Save Indicator */}
          <SaveIndicator status={saveStatus} />
          {/* Search Trigger */}
          <button
            className="search-trigger"
            onClick={onOpenSearch}
            aria-label="Search options (Ctrl+K)"
          >
            <span aria-hidden="true">🔍</span>
            <span className="search-trigger__text">Search options…</span>
            <kbd className="search-trigger__kbd" aria-hidden="true">⌘K</kbd>
          </button>
          <AIToggleButton onClick={onToggleAI} />
          {onExport && (
            <button
              className="btn btn--ghost btn--sm"
              title="Export"
              onClick={onExport}
              aria-label="Export blueprint"
            >
              📤
            </button>
          )}
          {/* Summary toggle for tablet/mobile */}
          {onToggleSummary && (
            <button
              className="summary-toggle-btn"
              onClick={onToggleSummary}
              aria-label="Toggle project summary panel"
            >
              📊
            </button>
          )}
          <button
            className="btn btn--ghost btn--sm"
            title="Undo (Ctrl+Z)"
            onClick={undo}
            disabled={!canUndo()}
            aria-label="Undo last change"
          >
            ↩
          </button>
          <button
            className="btn btn--ghost btn--sm"
            title="Redo (Ctrl+Y)"
            onClick={redo}
            disabled={!canRedo()}
            aria-label="Redo last change"
          >
            ↪
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="builder-main__content" key={activeSection}>
        <ErrorBoundary fallbackTitle={`Failed to load ${section?.label ?? 'section'}`}>
          <ActiveComponent />
        </ErrorBoundary>
      </div>

      {/* Sticky Action Bar */}
      <ActionBar onReview={onReview} />
    </main>
  );
}

function ActionBar({ onReview }: { onReview: () => void }) {
  const activeSection = useBlueprintStore((s) => s.blueprint.activeSection);
  const goToNextSection = useBlueprintStore((s) => s.goToNextSection);
  const goToPrevSection = useBlueprintStore((s) => s.goToPrevSection);
  const undo = useBlueprintStore((s) => s.undo);
  const redo = useBlueprintStore((s) => s.redo);
  const canUndo = useBlueprintStore((s) => s.canUndo);
  const canRedo = useBlueprintStore((s) => s.canRedo);

  const currentIdx = BUILDER_SECTIONS.findIndex((s) => s.id === activeSection);
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === BUILDER_SECTIONS.length - 1;

  return (
    <div className="action-bar" role="toolbar" aria-label="Section navigation">
      <div className="action-bar__left">
        <button
          className="btn btn--ghost"
          disabled={isFirst}
          onClick={goToPrevSection}
          aria-label="Go to previous section"
        >
          ← Back
        </button>
        {/* Mobile undo/redo buttons */}
        <div className="action-bar__undo-redo">
          <button
            className="btn btn--ghost btn--sm"
            onClick={undo}
            disabled={!canUndo()}
            aria-label="Undo"
            title="Undo"
          >
            ↩
          </button>
          <button
            className="btn btn--ghost btn--sm"
            onClick={redo}
            disabled={!canRedo()}
            aria-label="Redo"
            title="Redo"
          >
            ↪
          </button>
        </div>
        <span className="action-bar__step-info" aria-live="polite">
          Step {currentIdx + 1} of {BUILDER_SECTIONS.length}
        </span>
      </div>
      <div className="action-bar__center">
        <ValidationSummaryBadge />
      </div>
      <div className="action-bar__right">
        {isLast ? (
          <button
            className="btn btn--primary"
            onClick={onReview}
            aria-label="Review and generate blueprint"
          >
            Review &amp; Generate →
          </button>
        ) : (
          <button
            className="btn btn--primary"
            onClick={goToNextSection}
            aria-label="Continue to next section"
          >
            Continue →
          </button>
        )}
      </div>
    </div>
  );
}

function AIToggleButton({ onClick }: { onClick: () => void }) {
  const blueprint = useBlueprintStore((s) => s.blueprint);
  const recCount = useMemo(
    () => generateRecommendations(blueprint).length,
    [blueprint],
  );

  return (
    <button
      className="ai-toggle-btn"
      onClick={onClick}
      title="Open AI Assistant"
      aria-label={`Open AI Assistant${recCount > 0 ? ` — ${recCount} recommendations` : ''}`}
    >
      <span className="ai-toggle-btn__dot" aria-hidden="true" />
      <span>✨ AI Assistant</span>
      {recCount > 0 && (
        <span className="ai-toggle-btn__badge" aria-hidden="true">{recCount > 9 ? '9+' : recCount}</span>
      )}
    </button>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null;

  return (
    <span
      className={`save-indicator save-indicator--${status}`}
      role="status"
      aria-live="polite"
      aria-label={status === 'saving' ? 'Saving changes' : 'Changes saved'}
    >
      <span className="save-indicator__dot" aria-hidden="true" />
      {status === 'saving' ? 'Saving…' : 'Saved ✓'}
    </span>
  );
}
