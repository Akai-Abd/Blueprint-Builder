'use client';

// ─── Props ───────────────────────────────────────────────────────────

interface TextInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  hint?: string;
  label?: string;
  required?: boolean;
  validationMessage?: string;
}

// ─── Component ───────────────────────────────────────────────────────

export default function TextInput({
  id,
  value,
  onChange,
  placeholder,
  maxLength,
  multiline = false,
  hint,
  label,
  required,
  validationMessage,
}: TextInputProps) {
  const hasError = !!validationMessage;
  const showCounter = maxLength !== undefined;

  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={id}>
          {label}
          {required && <span className="form-label__required">*</span>}
        </label>
      )}
      {multiline ? (
        <textarea
          id={id}
          className={`form-input form-textarea ${hasError ? 'form-input--error' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
        />
      ) : (
        <input
          id={id}
          className={`form-input ${hasError ? 'form-input--error' : ''}`}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
        />
      )}
      <div className="form-input__footer">
        {hasError ? (
          <p className="form-error" id={`${id}-error`} role="alert">
            {validationMessage}
          </p>
        ) : hint ? (
          <p className="form-hint">{hint}</p>
        ) : null}
        {showCounter && (
          <span className="form-hint">{value.length}/{maxLength}</span>
        )}
      </div>
    </div>
  );
}
