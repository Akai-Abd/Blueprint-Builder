'use client';

import { useState } from 'react';
import { Recommendation } from '@/types/blueprint';

interface RecommendationBadgeProps {
  recommendation: Recommendation;
}

export default function RecommendationBadge({ recommendation }: RecommendationBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <button
      type="button"
      className="rec-badge"
      aria-expanded={showTooltip}
      aria-label={`Recommended (${Math.round(recommendation.score)}% match): ${recommendation.reason}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      onClick={(e) => {
        e.stopPropagation();
        setShowTooltip((prev) => !prev);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          setShowTooltip(false);
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.stopPropagation();
        }
      }}
    >
      <span className="rec-badge__icon">⭐</span>
      <span className="rec-badge__text">Recommended</span>

      {showTooltip && (
        <span className="rec-badge__tooltip" role="tooltip">
          <span className="rec-badge__tooltip-arrow" />
          <span className="rec-badge__tooltip-text">{recommendation.reason}</span>
          <span className="rec-badge__tooltip-score">
            <span>Match score</span>
            <span className="rec-badge__score-bar">
              <span
                className="rec-badge__score-fill"
                style={{ width: `${Math.min(recommendation.score, 100)}%` }}
              />
            </span>
            <span>{Math.round(recommendation.score)}%</span>
          </span>
        </span>
      )}
    </button>
  );
}
