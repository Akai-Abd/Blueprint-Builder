'use client';

import { useState } from 'react';
import { Recommendation } from '@/types/blueprint';

interface RecommendationBadgeProps {
  recommendation: Recommendation;
}

export default function RecommendationBadge({ recommendation }: RecommendationBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="rec-badge"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="rec-badge__icon">⭐</span>
      <span className="rec-badge__text">Recommended</span>

      {showTooltip && (
        <div className="rec-badge__tooltip">
          <div className="rec-badge__tooltip-arrow" />
          <p className="rec-badge__tooltip-text">{recommendation.reason}</p>
          <div className="rec-badge__tooltip-score">
            <span>Match score</span>
            <div className="rec-badge__score-bar">
              <div
                className="rec-badge__score-fill"
                style={{ width: `${Math.min(recommendation.score, 100)}%` }}
              />
            </div>
            <span>{Math.round(recommendation.score)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
