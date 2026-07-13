import { Blueprint, ProjectType } from '@/types/blueprint';
import { Option } from '@/types/blueprint';
import { featureOptions } from '@/data/options/features';
import { integrationOptions } from '@/data/options/integrations';

// ─── Project Type → Relevant Feature IDs ─────────────────────────────

const PROJECT_TYPE_FEATURES: Record<string, string[]> = {
  [ProjectType.Website]: [
    'authentication', 'dashboard', 'analytics', 'search', 'settings',
    'localization', 'accessibility', 'dark-mode', 'comments', 'tags-categories',
    'export-import', 'email-system',
  ],
  [ProjectType.WebApp]: [
    'authentication', 'dashboard', 'user-profiles', 'notifications', 'messaging',
    'payments', 'file-uploads', 'analytics', 'admin-panel', 'reports', 'search',
    'settings', 'localization', 'accessibility', 'multi-tenancy', 'rbac',
    'audit-logging', 'onboarding', 'dark-mode', 'realtime-collaboration',
    'comments', 'export-import', 'webhooks', 'email-system', 'calendar-scheduling',
    'activity-feed', 'tags-categories', 'favorites-bookmarks', 'version-history',
  ],
  [ProjectType.Android]: [
    'authentication', 'dashboard', 'user-profiles', 'notifications', 'messaging',
    'payments', 'file-uploads', 'analytics', 'settings', 'localization',
    'accessibility', 'onboarding', 'dark-mode', 'activity-feed',
    'favorites-bookmarks', 'calendar-scheduling',
  ],
  [ProjectType.iOS]: [
    'authentication', 'dashboard', 'user-profiles', 'notifications', 'messaging',
    'payments', 'file-uploads', 'analytics', 'settings', 'localization',
    'accessibility', 'onboarding', 'dark-mode', 'activity-feed',
    'favorites-bookmarks', 'calendar-scheduling',
  ],
  [ProjectType.Desktop]: [
    'authentication', 'dashboard', 'user-profiles', 'notifications', 'file-uploads',
    'analytics', 'settings', 'localization', 'accessibility', 'dark-mode',
    'export-import', 'version-history', 'search',
  ],
  [ProjectType.API]: [
    'authentication', 'analytics', 'admin-panel', 'reports', 'search',
    'rbac', 'audit-logging', 'webhooks', 'email-system', 'export-import',
  ],
  [ProjectType.BrowserExtension]: [
    'authentication', 'notifications', 'analytics', 'settings', 'dark-mode',
    'favorites-bookmarks', 'export-import',
  ],
  [ProjectType.AIProduct]: [
    'authentication', 'dashboard', 'user-profiles', 'notifications', 'payments',
    'ai-features', 'file-uploads', 'analytics', 'admin-panel', 'reports',
    'settings', 'onboarding', 'export-import', 'webhooks', 'email-system',
    'activity-feed', 'version-history',
  ],
  [ProjectType.CLI]: [
    'authentication', 'analytics', 'settings', 'export-import', 'version-history',
  ],
};

// ─── Project Type → Relevant Integration IDs ─────────────────────────

const PROJECT_TYPE_INTEGRATIONS: Record<string, string[]> = {
  [ProjectType.Website]: [
    'firebase', 'supabase', 'cloudinary', 'google-apis', 'github-api',
    'resend', 'sendgrid', 'postmark', 'posthog', 'mixpanel', 'segment',
    'vercel-analytics', 'zapier',
  ],
  [ProjectType.WebApp]: [
    'stripe', 'razorpay', 'paddle', 'lemon-squeezy', 'firebase', 'supabase',
    'cloudinary', 'aws-services', 'google-apis', 'github-api', 'slack',
    'discord', 'twilio', 'openai', 'anthropic', 'google-ai', 'resend',
    'sendgrid', 'postmark', 'posthog', 'mixpanel', 'segment', 'mapbox',
    'zapier', 'vercel-analytics',
  ],
  [ProjectType.Android]: [
    'stripe', 'razorpay', 'firebase', 'supabase', 'cloudinary', 'google-apis',
    'twilio', 'openai', 'anthropic', 'google-ai', 'posthog', 'mixpanel',
    'segment', 'mapbox',
  ],
  [ProjectType.iOS]: [
    'stripe', 'razorpay', 'firebase', 'supabase', 'cloudinary', 'google-apis',
    'twilio', 'openai', 'anthropic', 'google-ai', 'posthog', 'mixpanel',
    'segment', 'mapbox',
  ],
  [ProjectType.Desktop]: [
    'firebase', 'supabase', 'cloudinary', 'aws-services', 'github-api',
    'openai', 'anthropic', 'google-ai', 'posthog', 'sentry',
  ],
  [ProjectType.API]: [
    'stripe', 'razorpay', 'paddle', 'firebase', 'supabase', 'aws-services',
    'github-api', 'slack', 'discord', 'twilio', 'openai', 'anthropic',
    'google-ai', 'resend', 'sendgrid', 'postmark', 'posthog', 'segment',
    'zapier', 'telegram-bot',
  ],
  [ProjectType.BrowserExtension]: [
    'firebase', 'supabase', 'google-apis', 'openai', 'anthropic', 'google-ai',
    'posthog',
  ],
  [ProjectType.AIProduct]: [
    'stripe', 'paddle', 'lemon-squeezy', 'firebase', 'supabase', 'cloudinary',
    'aws-services', 'openai', 'anthropic', 'google-ai', 'resend', 'sendgrid',
    'posthog', 'mixpanel', 'segment', 'vercel-analytics', 'zapier',
  ],
  [ProjectType.CLI]: [
    'github-api', 'openai', 'anthropic', 'google-ai', 'posthog',
  ],
};

// ─── Project Type → Relevant Tech Category IDs ───────────────────────

const PROJECT_TYPE_TECH_CATEGORIES: Record<string, string[]> = {
  [ProjectType.Website]: [
    'frontend', 'backend', 'database', 'orm', 'authentication', 'hosting',
    'storage', 'cdn', 'cache', 'search', 'monitoring',
  ],
  [ProjectType.WebApp]: [
    'frontend', 'backend', 'database', 'orm', 'authentication', 'hosting',
    'storage', 'cdn', 'cache', 'queue', 'search', 'monitoring',
  ],
  [ProjectType.Android]: [
    'backend', 'database', 'orm', 'authentication', 'hosting',
    'storage', 'monitoring',
  ],
  [ProjectType.iOS]: [
    'backend', 'database', 'orm', 'authentication', 'hosting',
    'storage', 'monitoring',
  ],
  [ProjectType.Desktop]: [
    'frontend', 'backend', 'database', 'orm', 'authentication', 'hosting',
    'storage', 'monitoring',
  ],
  [ProjectType.API]: [
    'backend', 'database', 'orm', 'authentication', 'hosting',
    'cache', 'queue', 'search', 'monitoring',
  ],
  [ProjectType.BrowserExtension]: [
    'frontend', 'backend', 'database', 'authentication', 'storage', 'monitoring',
  ],
  [ProjectType.AIProduct]: [
    'frontend', 'backend', 'database', 'orm', 'authentication', 'hosting',
    'storage', 'cdn', 'cache', 'queue', 'monitoring',
  ],
  [ProjectType.CLI]: [
    'backend', 'database', 'orm', 'monitoring',
  ],
};

// ─── Project Type → Relevant Quality Category IDs ────────────────────

const PROJECT_TYPE_QUALITY: Record<string, string[]> = {
  [ProjectType.Website]: [
    'security', 'performance', 'seo', 'accessibility', 'testing', 'monitoring', 'deployment',
  ],
  [ProjectType.WebApp]: [
    'security', 'performance', 'seo', 'accessibility', 'testing', 'monitoring', 'deployment',
  ],
  [ProjectType.Android]: [
    'security', 'performance', 'accessibility', 'testing', 'monitoring', 'deployment',
  ],
  [ProjectType.iOS]: [
    'security', 'performance', 'accessibility', 'testing', 'monitoring', 'deployment',
  ],
  [ProjectType.Desktop]: [
    'security', 'performance', 'accessibility', 'testing', 'monitoring', 'deployment',
  ],
  [ProjectType.API]: [
    'security', 'performance', 'testing', 'monitoring', 'deployment',
  ],
  [ProjectType.BrowserExtension]: [
    'security', 'performance', 'accessibility', 'testing', 'deployment',
  ],
  [ProjectType.AIProduct]: [
    'security', 'performance', 'testing', 'monitoring', 'deployment',
  ],
  [ProjectType.CLI]: [
    'security', 'testing', 'deployment',
  ],
};

// ─── Public API ──────────────────────────────────────────────────────

export interface FilteredOptions<T = Option> {
  /** Options recommended for the selected project type (shown first). */
  recommended: T[];
  /** Other available options (shown in a collapsible section). */
  other: T[];
}

/**
 * Filter features based on the current blueprint's project type.
 * When no project type is selected, returns all features as recommended.
 */
export function getFilteredFeatures(blueprint: Blueprint): FilteredOptions {
  const projectType = blueprint.basics.projectType;
  if (!projectType) {
    return { recommended: featureOptions, other: [] };
  }

  const relevantIds = PROJECT_TYPE_FEATURES[projectType] ?? [];
  // Also include features already selected by the user (even if not "recommended")
  const selectedIds = new Set(blueprint.features.selected);

  const recommended: Option[] = [];
  const other: Option[] = [];

  for (const feature of featureOptions) {
    if (relevantIds.includes(feature.id) || selectedIds.has(feature.id)) {
      recommended.push(feature);
    } else {
      other.push(feature);
    }
  }

  return { recommended, other };
}

/**
 * Filter integrations based on the current blueprint's project type.
 */
export function getFilteredIntegrations(blueprint: Blueprint): FilteredOptions {
  const projectType = blueprint.basics.projectType;
  if (!projectType) {
    return { recommended: integrationOptions, other: [] };
  }

  const relevantIds = PROJECT_TYPE_INTEGRATIONS[projectType] ?? [];
  const selectedIds = new Set(blueprint.integrations.selected);

  const recommended: Option[] = [];
  const other: Option[] = [];

  for (const integration of integrationOptions) {
    if (relevantIds.includes(integration.id) || selectedIds.has(integration.id)) {
      recommended.push(integration);
    } else {
      other.push(integration);
    }
  }

  return { recommended, other };
}

/**
 * Get the list of relevant tech category IDs for the current project type.
 * Returns all categories when no project type is selected.
 */
export function getRelevantTechCategoryIds(blueprint: Blueprint): string[] | null {
  const projectType = blueprint.basics.projectType;
  if (!projectType) return null; // Show all
  return PROJECT_TYPE_TECH_CATEGORIES[projectType] ?? null;
}

/**
 * Get the list of relevant quality category IDs for the current project type.
 * Returns all categories when no project type is selected.
 */
export function getRelevantQualityCategoryIds(blueprint: Blueprint): string[] | null {
  const projectType = blueprint.basics.projectType;
  if (!projectType) return null; // Show all
  return PROJECT_TYPE_QUALITY[projectType] ?? null;
}
