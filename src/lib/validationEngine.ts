import {
  Blueprint,
  BuilderSectionId,
  ValidationResult,
  ValidationSeverity,
} from '@/types/blueprint';

// ─── Validation Rules ────────────────────────────────────────────────

type ValidationRule = (blueprint: Blueprint) => ValidationResult | null;

const rules: ValidationRule[] = [
  // ── Required Fields ──────────────────────────────────────────────
  (b) =>
    !b.basics.name.trim()
      ? {
          id: 'missing-name',
          severity: ValidationSeverity.Error,
          section: BuilderSectionId.ProjectBasics,
          field: 'name',
          message: 'Project name is required.',
          suggestion: 'Enter a descriptive project name in Project Basics.',
        }
      : null,

  (b) =>
    !b.basics.projectType
      ? {
          id: 'missing-type',
          severity: ValidationSeverity.Error,
          section: BuilderSectionId.ProjectBasics,
          field: 'projectType',
          message: 'Project type must be selected.',
          suggestion: 'Choose a project type (Website, Web App, API, etc.) in Project Basics.',
        }
      : null,

  // ── Platforms ────────────────────────────────────────────────────
  (b) =>
    b.basics.targetPlatforms.length === 0
      ? {
          id: 'no-platforms',
          severity: ValidationSeverity.Warning,
          section: BuilderSectionId.Platforms,
          message: 'No target platforms selected.',
          suggestion: 'Select at least one platform to get relevant technology recommendations.',
        }
      : null,

  // ── Technology ──────────────────────────────────────────────────
  (b) => {
    const hasAnyTech = Object.values(b.technology).some((arr) => arr.length > 0);
    return !hasAnyTech
      ? {
          id: 'no-technology',
          severity: ValidationSeverity.Warning,
          section: BuilderSectionId.Technology,
          message: 'No technologies selected.',
          suggestion: 'Select at least a frontend and backend technology for your stack.',
        }
      : null;
  },

  (b) =>
    b.technology.frontend.length === 0 && b.technology.backend.length > 0
      ? {
          id: 'missing-frontend',
          severity: ValidationSeverity.Warning,
          section: BuilderSectionId.Technology,
          field: 'frontend',
          message: 'Backend selected but no frontend technology.',
          suggestion: 'Consider adding a frontend framework like React, Vue, or Next.js.',
        }
      : null,

  (b) =>
    b.technology.frontend.length > 0 && b.technology.database.length === 0 && b.technology.backend.length > 0
      ? {
          id: 'missing-database',
          severity: ValidationSeverity.Info,
          section: BuilderSectionId.Technology,
          field: 'database',
          message: 'Backend selected but no database.',
          suggestion: 'Consider adding a database like PostgreSQL or MongoDB.',
        }
      : null,

  // ── Conflicting Selections ──────────────────────────────────────
  (b) => {
    const frontendFrameworks = ['nextjs', 'react', 'vue', 'svelte', 'angular'];
    const selected = b.technology.frontend.filter((t) => frontendFrameworks.includes(t));
    if (selected.length > 2) {
      return {
        id: 'too-many-frameworks',
        severity: ValidationSeverity.Warning,
        section: BuilderSectionId.Technology,
        field: 'frontend',
        message: `${selected.length} frontend frameworks selected. This is unusual.`,
        suggestion: 'Most projects use one primary frontend framework. Consider removing extras.',
      };
    }
    return null;
  },

  // ── Features ────────────────────────────────────────────────────
  (b) =>
    b.features.selected.length === 0
      ? {
          id: 'no-features',
          severity: ValidationSeverity.Info,
          section: BuilderSectionId.Features,
          message: 'No features selected.',
          suggestion: 'Adding features helps generate more complete documentation.',
        }
      : null,

  (b) =>
    b.features.selected.includes('payments') && !b.integrations.selected.some((i) => ['stripe', 'razorpay'].includes(i))
      ? {
          id: 'payments-no-provider',
          severity: ValidationSeverity.Warning,
          section: BuilderSectionId.Integrations,
          message: 'Payments feature selected but no payment provider integration.',
          suggestion: 'Add Stripe or Razorpay in the Integrations section.',
        }
      : null,

  (b) =>
    b.features.selected.includes('authentication') && b.technology.authentication.length === 0
      ? {
          id: 'auth-no-provider',
          severity: ValidationSeverity.Warning,
          section: BuilderSectionId.Technology,
          message: 'Authentication feature selected but no auth technology chosen.',
          suggestion: 'Select an authentication technology like NextAuth, Clerk, or Supabase Auth.',
        }
      : null,

  (b) =>
    b.features.selected.includes('ai-features') &&
    !b.integrations.selected.some((i) => ['openai', 'anthropic', 'google-ai'].includes(i))
      ? {
          id: 'ai-no-provider',
          severity: ValidationSeverity.Warning,
          section: BuilderSectionId.Integrations,
          message: 'AI features selected but no AI provider integration.',
          suggestion: 'Add OpenAI, Anthropic, or Google AI in the Integrations section.',
        }
      : null,

  // ── Security ────────────────────────────────────────────────────
  (b) =>
    b.quality.security.length === 0 && b.features.selected.includes('authentication')
      ? {
          id: 'auth-no-security',
          severity: ValidationSeverity.Warning,
          section: BuilderSectionId.Quality,
          message: 'Authentication feature without security configuration.',
          suggestion: 'Add HTTPS/SSL, Input Validation, and Rate Limiting in the Quality section.',
        }
      : null,

  // ── Missing description ─────────────────────────────────────────
  (b) =>
    b.basics.name.trim() && !b.basics.description.trim()
      ? {
          id: 'missing-description',
          severity: ValidationSeverity.Info,
          section: BuilderSectionId.ProjectBasics,
          field: 'description',
          message: 'Project description is empty.',
          suggestion: 'A description improves the generated PRD and README quality.',
        }
      : null,
];

// ─── Validate ────────────────────────────────────────────────────────

export function validateBlueprint(blueprint: Blueprint): ValidationResult[] {
  return rules
    .map((rule) => rule(blueprint))
    .filter((result): result is ValidationResult => result !== null);
}

export function getValidationSummary(results: ValidationResult[]) {
  const errors = results.filter((r) => r.severity === ValidationSeverity.Error);
  const warnings = results.filter((r) => r.severity === ValidationSeverity.Warning);
  const infos = results.filter((r) => r.severity === ValidationSeverity.Info);

  return {
    errors,
    warnings,
    infos,
    hasErrors: errors.length > 0,
    hasWarnings: warnings.length > 0,
    isValid: errors.length === 0,
    total: results.length,
  };
}

export function getValidationForSection(
  results: ValidationResult[],
  section: BuilderSectionId
): ValidationResult[] {
  return results.filter((r) => r.section === section);
}
