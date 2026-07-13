'use client';

import { ReactNode } from 'react';

// ─── Question Definition ─────────────────────────────────────────────

export interface QuestionDefinition {
  id: string;
  label: string;
  description?: string;
  required?: boolean;
  tooltip?: string;
  examples?: string[];
  type: 'text' | 'textarea' | 'single-select' | 'multi-select';
}

// ─── Props ───────────────────────────────────────────────────────────

interface QuestionRendererProps {
  question: QuestionDefinition;
  children: ReactNode;
}

// ─── Component ───────────────────────────────────────────────────────

export default function QuestionRenderer({ question, children }: QuestionRendererProps) {
  return (
    <div className="question" role="group" aria-labelledby={`q-label-${question.id}`}>
      <label className="question__label" id={`q-label-${question.id}`}>
        {question.label}
        {question.required && <span className="form-label__required">*</span>}
      </label>
      {question.description && (
        <p className="question__description">{question.description}</p>
      )}
      {question.tooltip && (
        <p className="question__tooltip" role="note">
          💡 {question.tooltip}
        </p>
      )}
      <div className="question__content">{children}</div>
      {question.examples && question.examples.length > 0 && (
        <p className="question__examples">
          Examples: {question.examples.join(', ')}
        </p>
      )}
    </div>
  );
}
