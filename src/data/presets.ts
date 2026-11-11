import {
  Blueprint,
  BusinessModel,
  ProjectType,
  createEmptyBlueprint,
} from '@/types/blueprint';

export interface BlueprintPreset {
  id: string;
  label: string;
  icon: string;
  tagline: string;
  build: () => Blueprint;
}

function makePreset(
  overrides: {
    name: string;
    description: string;
    domainNotes?: string;
    category: string;
    industry: string;
    projectType: ProjectType;
    targetPlatforms: ProjectType[];
    targetAudience: string;
    businessModel: BusinessModel;
    technology?: Partial<Blueprint['technology']>;
    features?: string[];
    integrations?: string[];
    quality?: Partial<Blueprint['quality']>;
  },
): Blueprint {
  const base = createEmptyBlueprint();
  return {
    ...base,
    basics: {
      name: overrides.name,
      description: overrides.description,
      domainNotes: overrides.domainNotes ?? '',
      category: overrides.category,
      industry: overrides.industry,
      projectType: overrides.projectType,
      targetPlatforms: overrides.targetPlatforms,
      targetAudience: overrides.targetAudience,
      businessModel: overrides.businessModel,
    },
    technology: {
      ...base.technology,
      ...overrides.technology,
    },
    features: {
      selected: overrides.features ?? [],
    },
    integrations: {
      selected: overrides.integrations ?? [],
    },
    quality: {
      ...base.quality,
      ...overrides.quality,
    },
  };
}

export const BLUEPRINT_PRESETS: BlueprintPreset[] = [
  {
    id: 'saas-web-app',
    label: 'SaaS Web App',
    icon: '☁️',
    tagline: 'Next.js, PostgreSQL, Prisma, Auth & Stripe',
    build: () =>
      makePreset({
        name: 'SaaS Platform',
        description: 'Multi-tenant SaaS application with team workspaces, subscriptions, and analytics dashboard.',
        domainNotes: 'Entities: Organization, Membership, User, Subscription, AuditLog. Constraints: strict tenant isolation.',
        category: 'saas',
        industry: 'technology',
        projectType: ProjectType.WebApp,
        targetPlatforms: [ProjectType.WebApp],
        targetAudience: 'Teams and small-to-midsize businesses',
        businessModel: BusinessModel.SaaS,
        technology: {
          frontend: ['nextjs', 'tailwindcss', 'shadcn-ui'],
          backend: ['nodejs'],
          database: ['postgresql'],
          orm: ['prisma'],
          authentication: ['nextauth'],
          hosting: ['vercel'],
          monitoring: ['sentry'],
        },
        features: [
          'authentication',
          'dashboard',
          'user-profiles',
          'payments',
          'settings',
          'multi-tenancy',
          'rbac',
        ],
        integrations: ['stripe', 'resend', 'posthog'],
        quality: {
          security: ['https-ssl', 'input-validation', 'rate-limiting', 'cors-config'],
          performance: ['caching-strategy', 'db-query-optimization'],
          seo: ['meta-tags', 'sitemap'],
          accessibility: ['wcag-compliance', 'keyboard-navigation'],
          testing: ['unit-testing', 'e2e-testing', 'ci-cd'],
          monitoring: ['error-tracking', 'uptime-monitoring'],
          deployment: ['db-migrations', 'containerization'],
        },
      }),
  },
  {
    id: 'backend-api',
    label: 'Backend API',
    icon: '🔌',
    tagline: 'Python FastAPI, PostgreSQL, Redis & Docker',
    build: () =>
      makePreset({
        name: 'Core API Service',
        description: 'High-throughput REST API service with background workers, caching, and webhook delivery.',
        domainNotes: 'Entities: ApiKey, WebhookEndpoint, DeliveryAttempt, Job. Constraints: idempotent mutations, OpenAPI 3.1 schema.',
        category: 'developer-tool',
        industry: 'technology',
        projectType: ProjectType.API,
        targetPlatforms: [ProjectType.API],
        targetAudience: 'Developers and partner integrations',
        businessModel: BusinessModel.SaaS,
        technology: {
          backend: ['python', 'fastapi'],
          database: ['postgresql'],
          orm: ['sqlalchemy'],
          authentication: ['auth0'],
          hosting: ['docker', 'fly-io'],
          cache: ['redis-cache'],
          monitoring: ['grafana-prometheus'],
        },
        features: ['authentication', 'webhooks', 'audit-logging', 'search'],
        integrations: ['stripe', 'aws-services', 'postmark'],
        quality: {
          security: ['https-ssl', 'input-validation', 'rate-limiting', 'cors-config'],
          performance: ['caching-strategy', 'db-query-optimization'],
          testing: ['unit-testing', 'integration-testing', 'ci-cd'],
          monitoring: ['error-tracking', 'log-aggregation'],
          deployment: ['containerization', 'db-migrations'],
        },
      }),
  },
  {
    id: 'ai-agent',
    label: 'AI Assistant',
    icon: '🤖',
    tagline: 'Next.js, Drizzle, Clerk, Inngest & LLMs',
    build: () =>
      makePreset({
        name: 'AI Workspace Assistant',
        description: 'Streaming AI assistant with document ingestion, prompt workflows, and usage metering.',
        domainNotes: 'Entities: Conversation, Message, KnowledgeDocument, UsageQuota. Constraints: stream responses < 500ms TTFT, strict token budgets.',
        category: 'productivity',
        industry: 'technology',
        projectType: ProjectType.AIProduct,
        targetPlatforms: [ProjectType.WebApp, ProjectType.API],
        targetAudience: 'Knowledge workers and product teams',
        businessModel: BusinessModel.Freemium,
        technology: {
          frontend: ['nextjs', 'tailwindcss'],
          backend: ['nodejs'],
          database: ['postgresql'],
          orm: ['drizzle'],
          authentication: ['clerk'],
          hosting: ['vercel'],
          queue: ['inngest'],
          monitoring: ['sentry'],
        },
        features: [
          'authentication',
          'ai-features',
          'dashboard',
          'file-uploads',
          'payments',
          'export-import',
        ],
        integrations: ['openai', 'anthropic', 'stripe', 'posthog'],
        quality: {
          security: ['https-ssl', 'input-validation', 'rate-limiting'],
          performance: ['caching-strategy', 'edge-computing'],
          accessibility: ['keyboard-navigation'],
          testing: ['unit-testing', 'integration-testing', 'ci-cd'],
          monitoring: ['error-tracking', 'log-aggregation'],
          deployment: ['feature-flags', 'db-migrations'],
        },
      }),
  },
  {
    id: 'mobile-app',
    label: 'Mobile App',
    icon: '📱',
    tagline: 'React Native, Hono, Supabase & Push',
    build: () =>
      makePreset({
        name: 'Mobile Companion App',
        description: 'Cross-platform iOS and Android app with offline sync, push notifications, and cloud media.',
        domainNotes: 'Entities: DeviceToken, UserProfile, SyncCheckpoint, MediaAsset. Constraints: offline-first mutations with conflict resolution.',
        category: 'productivity',
        industry: 'technology',
        projectType: ProjectType.Android,
        targetPlatforms: [ProjectType.Android, ProjectType.iOS],
        targetAudience: 'iOS and Android consumers on the go',
        businessModel: BusinessModel.Freemium,
        technology: {
          mobile: ['react-native'],
          backend: ['nodejs', 'hono'],
          database: ['postgresql'],
          orm: ['drizzle'],
          authentication: ['supabase-auth'],
          storage: ['supabase-storage'],
          hosting: ['railway'],
          monitoring: ['sentry'],
        },
        features: [
          'authentication',
          'user-profiles',
          'notifications',
          'file-uploads',
          'onboarding',
          'dark-mode',
        ],
        integrations: ['supabase', 'posthog'],
        quality: {
          security: ['https-ssl', 'input-validation', 'encryption-at-rest'],
          performance: ['caching-strategy', 'lazy-loading'],
          accessibility: ['screen-reader', 'color-contrast'],
          testing: ['unit-testing', 'e2e-testing', 'ci-cd'],
          monitoring: ['error-tracking', 'uptime-monitoring'],
          deployment: ['feature-flags', 'db-migrations'],
        },
      }),
  },
  {
    id: 'cli-tool',
    label: 'CLI Tool',
    icon: '⌨️',
    tagline: 'Go, SQLite, Automated Releases & CI',
    build: () =>
      makePreset({
        name: 'DevCLI Tool',
        description: 'Fast cross-platform command-line tool with local SQLite state and structured JSON/table output.',
        domainNotes: 'Entities: ConfigProfile, LocalCacheEntry, CommandRun. Constraints: single static binary, sub-50ms startup, exit codes follow UNIX conventions.',
        category: 'developer-tool',
        industry: 'technology',
        projectType: ProjectType.CLI,
        targetPlatforms: [ProjectType.CLI],
        targetAudience: 'Software engineers and DevOps teams',
        businessModel: BusinessModel.OpenSource,
        technology: {
          backend: ['go'],
          database: ['sqlite'],
          monitoring: ['sentry'],
        },
        features: ['settings', 'export-import', 'audit-logging'],
        integrations: ['github-api'],
        quality: {
          security: ['input-validation', 'dependency-scanning'],
          performance: ['caching-strategy'],
          testing: ['unit-testing', 'integration-testing', 'ci-cd'],
          monitoring: ['error-tracking'],
          deployment: [],
        },
      }),
  },
];

