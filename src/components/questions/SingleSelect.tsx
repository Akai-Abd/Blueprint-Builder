'use client';

// ─── Types ───────────────────────────────────────────────────────────

export interface SelectOption {
  id: string;
  label: string;
  icon?: string;
  description?: string;
}

interface SingleSelectProps {
  options: SelectOption[];
  value: string | null;
  onChange: (id: string) => void;
}

// ─── Component ───────────────────────────────────────────────────────

export default function SingleSelect({ options, value, onChange }: SingleSelectProps) {
  return (
    <div className="select-grid" role="radiogroup">
      {options.map((opt) => (
        <div
          key={opt.id}
          className={`select-card ${value === opt.id ? 'select-card--selected' : ''}`}
          onClick={() => onChange(opt.id)}
          role="radio"
          aria-checked={value === opt.id}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onChange(opt.id);
            }
          }}
        >
          {opt.icon && <span className="select-card__icon">{opt.icon}</span>}
          <span className="select-card__label">{opt.label}</span>
          {opt.description && (
            <span className="select-card__desc">{opt.description}</span>
          )}
        </div>
      ))}
    </div>
  );
}
