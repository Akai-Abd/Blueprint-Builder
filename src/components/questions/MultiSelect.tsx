'use client';

import { useState, useMemo } from 'react';
import { Option, Recommendation } from '@/types/blueprint';
import OptionCard from './OptionCard';

// ─── Props ───────────────────────────────────────────────────────────

interface MultiSelectProps {
  options: Option[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  recommendations?: Map<string, Recommendation>;
  /** Show a search filter above options when set has this many or more items */
  searchThreshold?: number;
}

// ─── Component ───────────────────────────────────────────────────────

export default function MultiSelect({
  options,
  selectedIds,
  onToggle,
  recommendations,
  searchThreshold = 12,
}: MultiSelectProps) {
  const [filter, setFilter] = useState('');

  const filteredOptions = useMemo(() => {
    if (!filter.trim()) return options;
    const q = filter.toLowerCase();
    return options.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        o.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [options, filter]);

  return (
    <div className="multi-select">
      {options.length >= searchThreshold && (
        <div className="multi-select__filter">
          <input
            className="form-input"
            type="text"
            placeholder={`Filter ${options.length} options…`}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter options"
          />
          {filter && (
            <span className="multi-select__filter-count">
              {filteredOptions.length} of {options.length}
            </span>
          )}
        </div>
      )}
      <div className="option-grid">
        {filteredOptions.map((option) => (
          <OptionCard
            key={option.id}
            option={option}
            selected={selectedIds.includes(option.id)}
            onToggle={onToggle}
            recommendation={recommendations?.get(option.id)}
          />
        ))}
      </div>
      {filter && filteredOptions.length === 0 && (
        <p className="multi-select__empty">
          No options match &ldquo;{filter}&rdquo;
        </p>
      )}
    </div>
  );
}
