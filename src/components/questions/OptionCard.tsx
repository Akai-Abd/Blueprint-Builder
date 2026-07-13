'use client';

import { useState } from 'react';
import { Option, Difficulty, Recommendation } from '@/types/blueprint';
import RecommendationBadge from '@/components/RecommendationBadge';

interface OptionCardProps {
  option: Option;
  selected: boolean;
  onToggle: (id: string) => void;
  recommendation?: Recommendation;
}

const difficultyClass: Record<Difficulty, string> = {
  [Difficulty.Beginner]: 'option-card__badge--beginner',
  [Difficulty.Intermediate]: 'option-card__badge--intermediate',
  [Difficulty.Advanced]: 'option-card__badge--advanced',
  [Difficulty.Expert]: 'option-card__badge--expert',
};

export default function OptionCard({ option, selected, onToggle, recommendation }: OptionCardProps) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <div
        className={`option-card ${selected ? 'option-card--selected' : ''}`}
        onClick={() => onToggle(option.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle(option.id);
          }
        }}
      >
        {/* Info button */}
        <button
          className="option-card__detail-trigger"
          onClick={(e) => {
            e.stopPropagation();
            setShowDetail(true);
          }}
          title={`Learn more about ${option.name}`}
          aria-label={`Details for ${option.name}`}
        >
          ?
        </button>

        <div className="option-card__header">
          {option.icon && <span className="option-card__icon">{option.icon}</span>}
          <span className="option-card__name">{option.name}</span>
          <span className="option-card__check">{selected ? '✓' : ''}</span>
        </div>

        <p className="option-card__description">{option.description}</p>

        <div className="option-card__meta">
          <span className={`option-card__badge ${difficultyClass[option.difficulty]}`}>
            {option.difficulty}
          </span>
          {recommendation && <RecommendationBadge recommendation={recommendation} />}
          <div className="option-card__popularity">
            <div className="option-card__popularity-bar">
              <div
                className="option-card__popularity-fill"
                style={{ width: `${option.popularity}%` }}
              />
            </div>
            <span>{option.popularity}%</span>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {showDetail && (
        <OptionDetailPanel option={option} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
}

// ─── Detail Panel ────────────────────────────────────────────────────

function OptionDetailPanel({ option, onClose }: { option: Option; onClose: () => void }) {
  return (
    <>
      <div className="option-detail__overlay" onClick={onClose} />
      <div className="option-detail">
        <div className="option-detail__header">
          <div className="option-detail__title">
            {option.icon && <span>{option.icon}</span>}
            {option.name}
          </div>
          <button className="option-detail__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="option-detail__body">
          {/* Description */}
          <div className="option-detail__section">
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {option.description}
            </p>
          </div>

          {/* Best Use Cases */}
          {option.bestUseCases.length > 0 && (
            <div className="option-detail__section">
              <h4 className="option-detail__section-title">Best Use Cases</h4>
              <ul className="option-detail__list">
                {option.bestUseCases.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Advantages */}
          {option.advantages.length > 0 && (
            <div className="option-detail__section">
              <h4 className="option-detail__section-title">Advantages</h4>
              <ul className="option-detail__list">
                {option.advantages.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Limitations */}
          {option.limitations.length > 0 && (
            <div className="option-detail__section">
              <h4 className="option-detail__section-title">Limitations</h4>
              <ul className="option-detail__list option-detail__list--cons">
                {option.limitations.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {option.tags.length > 0 && (
            <div className="option-detail__section">
              <h4 className="option-detail__section-title">Tags</h4>
              <div className="option-detail__tags">
                {option.tags.map((t) => (
                  <span key={t} className="option-detail__tag">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Docs Link */}
          {option.docsUrl && (
            <div className="option-detail__section">
              <a
                href={option.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="option-detail__link"
              >
                📄 Official Documentation →
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
