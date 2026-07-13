import {
  Blueprint,
  BuilderSectionId,
  Recommendation,
} from '@/types/blueprint';
import { allTechnologies } from '@/data/options/technologies';

// ─── Compatibility Rules ─────────────────────────────────────────────

interface CompatibilityRule {
  if: { category: string; id: string };
  recommend: { category: string; ids: string[]; reason: string };
}

const COMPATIBILITY_RULES: CompatibilityRule[] = [
  {
    if: { category: 'frontend', id: 'nextjs' },
    recommend: {
      category: 'hosting',
      ids: ['vercel'],
      reason: 'Vercel is the official hosting platform for Next.js with zero-config deployment.',
    },
  },
  {
    if: { category: 'frontend', id: 'nextjs' },
    recommend: {
      category: 'orm',
      ids: ['prisma'],
      reason: 'Prisma integrates seamlessly with Next.js API routes and server components.',
    },
  },
  {
    if: { category: 'frontend', id: 'nextjs' },
    recommend: {
      category: 'database',
      ids: ['postgresql', 'supabase'],
      reason: 'PostgreSQL and Supabase pair excellently with Next.js for full-stack apps.',
    },
  },
  {
    if: { category: 'frontend', id: 'vue' },
    recommend: {
      category: 'hosting',
      ids: ['netlify', 'vercel'],
      reason: 'Netlify and Vercel offer great Vue.js/Nuxt.js deployment support.',
    },
  },
  {
    if: { category: 'backend', id: 'nodejs' },
    recommend: {
      category: 'database',
      ids: ['mongodb', 'postgresql'],
      reason: 'MongoDB and PostgreSQL have excellent Node.js drivers and ORM support.',
    },
  },
  {
    if: { category: 'backend', id: 'python' },
    recommend: {
      category: 'orm',
      ids: ['prisma'],
      reason: 'Prisma supports Python and provides type-safe database access.',
    },
  },
  {
    if: { category: 'database', id: 'postgresql' },
    recommend: {
      category: 'orm',
      ids: ['prisma', 'drizzle'],
      reason: 'Prisma and Drizzle provide excellent PostgreSQL support with type safety.',
    },
  },
  {
    if: { category: 'database', id: 'mongodb' },
    recommend: {
      category: 'orm',
      ids: ['mongoose'],
      reason: 'Mongoose is the de facto ODM for MongoDB in Node.js applications.',
    },
  },
  {
    if: { category: 'authentication', id: 'nextauth' },
    recommend: {
      category: 'frontend',
      ids: ['nextjs'],
      reason: 'NextAuth.js is purpose-built for Next.js authentication.',
    },
  },
  {
    if: { category: 'authentication', id: 'supabase-auth' },
    recommend: {
      category: 'database',
      ids: ['supabase'],
      reason: 'Supabase Auth integrates natively with the Supabase database platform.',
    },
  },
];

// ─── Missing Feature Rules ──────────────────────────────────────────

interface MissingRule {
  condition: (bp: Blueprint) => boolean;
  recommendation: Omit<Recommendation, 'id'>;
}

const MISSING_RULES: MissingRule[] = [
  {
    condition: (bp) =>
      bp.technology.authentication.length > 0 && bp.quality.security.length === 0,
    recommendation: {
      type: 'quality',
      optionId: 'security',
      reason: 'You have authentication configured but no security quality options. Consider adding HTTPS, CORS, and input validation.',
      score: 90,
      section: BuilderSectionId.Quality,
    },
  },
  {
    condition: (bp) =>
      bp.technology.frontend.length > 0 && bp.quality.performance.length === 0,
    recommendation: {
      type: 'quality',
      optionId: 'performance',
      reason: 'Adding performance optimizations like lazy loading and code splitting will improve your frontend user experience.',
      score: 75,
      section: BuilderSectionId.Quality,
    },
  },
  {
    condition: (bp) =>
      bp.technology.frontend.length > 0 && bp.quality.accessibility.length === 0,
    recommendation: {
      type: 'quality',
      optionId: 'accessibility',
      reason: 'Consider accessibility features to ensure your application is usable by everyone.',
      score: 70,
      section: BuilderSectionId.Quality,
    },
  },
  {
    condition: (bp) =>
      bp.technology.frontend.length > 0 && bp.quality.seo.length === 0 &&
      (bp.basics.projectType === 'website' || bp.basics.projectType === 'web-app'),
    recommendation: {
      type: 'quality',
      optionId: 'seo',
      reason: 'SEO optimization is important for web projects to improve discoverability.',
      score: 80,
      section: BuilderSectionId.Quality,
    },
  },
  {
    condition: (bp) =>
      (bp.technology.frontend.length > 0 || bp.technology.backend.length > 0) &&
      bp.quality.testing.length === 0,
    recommendation: {
      type: 'quality',
      optionId: 'testing',
      reason: 'Adding a testing strategy early helps maintain code quality as your project grows.',
      score: 85,
      section: BuilderSectionId.Quality,
    },
  },
  {
    condition: (bp) =>
      bp.technology.backend.length > 0 && bp.quality.monitoring.length === 0,
    recommendation: {
      type: 'quality',
      optionId: 'monitoring',
      reason: 'Backend services benefit from monitoring to detect issues before users do.',
      score: 65,
      section: BuilderSectionId.Quality,
    },
  },
  {
    condition: (bp) =>
      bp.technology.hosting.length === 0 &&
      (bp.technology.frontend.length > 0 || bp.technology.backend.length > 0),
    recommendation: {
      type: 'technology',
      optionId: 'hosting',
      reason: 'You have a tech stack selected but no hosting provider. Choose where to deploy your application.',
      score: 80,
      section: BuilderSectionId.Technology,
    },
  },
  {
    condition: (bp) =>
      bp.technology.database.length > 0 && bp.technology.orm.length === 0,
    recommendation: {
      type: 'technology',
      optionId: 'orm',
      reason: 'An ORM or data layer will simplify database operations and provide type safety.',
      score: 70,
      section: BuilderSectionId.Technology,
    },
  },
];

// ─── Public API ──────────────────────────────────────────────────────

/** All selected tech IDs across every category */
function getAllSelectedTech(bp: Blueprint): string[] {
  return Object.values(bp.technology).flat();
}

/**
 * Generate compatibility-based recommendations for a specific option.
 * Returns recommendations for options that are compatible with current selections.
 */
export function getRecommendationsForOption(
  optionId: string,
  blueprint: Blueprint,
): Recommendation[] {
  const selectedTech = getAllSelectedTech(blueprint);
  const recommendations: Recommendation[] = [];

  // Check if any selected tech has this option in its compatibleWith list
  for (const techId of selectedTech) {
    const techOption = allTechnologies.find((t) => t.id === techId);
    if (!techOption) continue;

    if (techOption.compatibleWith.includes(optionId)) {
      recommendations.push({
        id: `compat-${techId}-${optionId}`,
        type: 'technology',
        optionId,
        reason: `Recommended with ${techOption.name} — compatible stack pairing.`,
        score: techOption.recommendationScore,
        section: BuilderSectionId.Technology,
      });
    }
  }

  return recommendations;
}

/**
 * Generate all recommendations for the current blueprint state.
 */
export function generateRecommendations(blueprint: Blueprint): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const selectedTech = getAllSelectedTech(blueprint);

  // 1. Compatibility-based recommendations from rules
  for (const rule of COMPATIBILITY_RULES) {
    const catKey = rule.if.category as keyof Blueprint['technology'];
    const selected = blueprint.technology[catKey] ?? [];
    if (!selected.includes(rule.if.id)) continue;

    for (const recId of rule.recommend.ids) {
      // Don't recommend already-selected items
      if (selectedTech.includes(recId)) continue;

      recommendations.push({
        id: `rule-${rule.if.id}-${recId}`,
        type: 'technology',
        optionId: recId,
        reason: rule.recommend.reason,
        score: 85,
        section: BuilderSectionId.Technology,
      });
    }
  }

  // 2. compatibleWith field from option data
  for (const techId of selectedTech) {
    const techOption = allTechnologies.find((t) => t.id === techId);
    if (!techOption) continue;

    for (const compatId of techOption.compatibleWith) {
      if (selectedTech.includes(compatId)) continue;
      // Avoid duplicating rule-based recommendations
      if (recommendations.some((r) => r.optionId === compatId)) continue;

      const compatOption = allTechnologies.find((t) => t.id === compatId);
      if (!compatOption) continue;

      recommendations.push({
        id: `compat-${techId}-${compatId}`,
        type: 'technology',
        optionId: compatId,
        reason: `${compatOption.name} pairs well with ${techOption.name} in your stack.`,
        score: compatOption.recommendationScore * 0.8,
        section: BuilderSectionId.Technology,
      });
    }
  }

  // 3. Missing feature/quality rules
  for (const rule of MISSING_RULES) {
    if (rule.condition(blueprint)) {
      recommendations.push({
        ...rule.recommendation,
        id: `missing-${rule.recommendation.optionId}-${rule.recommendation.type}`,
      });
    }
  }

  // Sort by score descending
  recommendations.sort((a, b) => b.score - a.score);

  return recommendations;
}

/**
 * Get recommendations filtered for a specific section.
 */
export function getRecommendationsForSection(
  blueprint: Blueprint,
  section: BuilderSectionId,
): Recommendation[] {
  return generateRecommendations(blueprint).filter((r) => r.section === section);
}

/**
 * Check if a specific option has any active recommendations.
 */
export function getOptionRecommendation(
  optionId: string,
  blueprint: Blueprint,
): Recommendation | undefined {
  return generateRecommendations(blueprint).find((r) => r.optionId === optionId);
}

/**
 * Get a lookup map of optionId → Recommendation for fast badge rendering.
 */
export function getRecommendationMap(
  blueprint: Blueprint,
): Map<string, Recommendation> {
  const map = new Map<string, Recommendation>();
  for (const rec of generateRecommendations(blueprint)) {
    // Keep highest-scored recommendation per option
    const existing = map.get(rec.optionId);
    if (!existing || rec.score > existing.score) {
      map.set(rec.optionId, rec);
    }
  }
  return map;
}
