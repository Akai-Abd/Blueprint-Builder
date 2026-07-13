'use client';

import { useBlueprintStore } from '@/stores/blueprintStore';
import { BUILDER_SECTIONS } from '@/types/blueprint';
import Image from 'next/image';

interface LeftNavigationProps {
  onBackToDashboard?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  onSectionChange?: () => void;
}

export default function LeftNavigation({
  onBackToDashboard,
  isOpen,
  onClose,
  onSectionChange,
}: LeftNavigationProps) {
  const activeSection = useBlueprintStore((s) => s.blueprint.activeSection);
  const setActiveSection = useBlueprintStore((s) => s.setActiveSection);
  const getSectionCompletion = useBlueprintStore((s) => s.getSectionCompletion);
  const getCompletionPercentage = useBlueprintStore((s) => s.getCompletionPercentage);

  const overallCompletion = getCompletionPercentage();

  const handleSectionClick = (sectionId: typeof activeSection) => {
    setActiveSection(sectionId);
    onSectionChange?.();
  };

  return (
    <aside
      className={`builder-nav ${isOpen ? 'builder-nav--open' : ''}`}
      role="navigation"
      aria-label="Builder sections"
    >
      {/* Logo */}
      <div className="builder-nav__header">
        <div className="builder-nav__logo">
          <div className="builder-nav__logo-icon" aria-hidden="true">
            <Image src="/logo-clean.jpg" alt="Blueprint Builder Logo" width={48} height={48} className="logo-glow-effect" />
          </div>
          <span className="builder-nav__title">Blueprint Builder</span>
        </div>
        {onBackToDashboard && (
          <button
            className="btn btn--ghost btn--sm"
            onClick={onBackToDashboard}
            style={{ marginTop: 'var(--space-sm)', width: '100%', justifyContent: 'flex-start' }}
            aria-label="Back to dashboard"
          >
            ← Dashboard
          </button>
        )}
        {/* Close button for mobile drawer */}
        {onClose && (
          <button
            className="btn btn--ghost btn--icon"
            onClick={onClose}
            aria-label="Close navigation"
            style={{ position: 'absolute', top: 'var(--space-md)', right: 'var(--space-md)', display: 'none' }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Section List */}
      <nav className="builder-nav__sections" aria-label="Builder steps">
        {BUILDER_SECTIONS.map((section) => {
          const completion = getSectionCompletion(section.id);
          const isActive = activeSection === section.id;

          return (
            <div
              key={section.id}
              className={`nav-item ${isActive ? 'nav-item--active' : ''}`}
              onClick={() => handleSectionClick(section.id)}
              role="button"
              tabIndex={0}
              aria-current={isActive ? 'step' : undefined}
              aria-label={`${section.label} — ${completion}% complete`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSectionClick(section.id);
                }
              }}
            >
              <span className="nav-item__icon" aria-hidden="true">{section.icon}</span>
              <div className="nav-item__content">
                <div className="nav-item__label">{section.label}</div>
                <div className="nav-item__desc">{section.description}</div>
              </div>
              <span
                className={`nav-item__badge ${
                  completion === 100
                    ? 'nav-item__badge--complete'
                    : completion > 0
                    ? 'nav-item__badge--partial'
                    : ''
                }`}
                aria-hidden="true"
              >
                {completion}%
              </span>
            </div>
          );
        })}
      </nav>

      {/* Progress */}
      <div className="progress-section" role="status" aria-label={`Overall progress: ${overallCompletion}%`}>
        <div className="progress-label">
          <span className="progress-label__text">Overall Progress</span>
          <span className="progress-label__value" aria-hidden="true">{overallCompletion}%</span>
        </div>
        <div className="progress-bar" role="progressbar" aria-valuenow={overallCompletion} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="progress-bar__fill"
            style={{ width: `${overallCompletion}%` }}
          />
        </div>
      </div>
    </aside>
  );
}
