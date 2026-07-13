// ─── Enums ───────────────────────────────────────────────────────────

export enum ProjectType {
  Website = 'website',
  WebApp = 'web-app',
  Android = 'android',
  iOS = 'ios',
  Desktop = 'desktop',
  API = 'api',
  BrowserExtension = 'browser-extension',
  AIProduct = 'ai-product',
  CLI = 'cli',
  Custom = 'custom',
}

export enum BusinessModel {
  SaaS = 'saas',
  Marketplace = 'marketplace',
  Ecommerce = 'ecommerce',
  Subscription = 'subscription',
  Freemium = 'freemium',
  AdSupported = 'ad-supported',
  OpenSource = 'open-source',
  Enterprise = 'enterprise',
  Custom = 'custom',
}

export enum Difficulty {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
  Expert = 'expert',
}

export enum ValidationSeverity {
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
}

// ─── Builder Section ─────────────────────────────────────────────────

export enum BuilderSectionId {
  ProjectBasics = 'project-basics',
  Platforms = 'platforms',
  Technology = 'technology',
  Features = 'features',
  Integrations = 'integrations',
  Quality = 'quality',
}

export interface BuilderSection {
  id: BuilderSectionId;
  label: string;
  icon: string;
  description: string;
  requiredFields: string[];
}

// ─── Universal Option ────────────────────────────────────────────────

export interface Option {
  id: string;
  name: string;
  description: string;
  category: string;
  bestUseCases: string[];
  advantages: string[];
  limitations: string[];
  compatibleWith: string[];
  alternatives: string[];
  difficulty: Difficulty;
  popularity: number; // 0-100
  recommendationScore: number; // 0-100
  tags: string[];
  docsUrl?: string;
  icon?: string;
  futureNotes?: string;
}

// ─── Project Basics ──────────────────────────────────────────────────

export interface ProjectBasics {
  name: string;
  description: string;
  category: string;
  industry: string;
  projectType: ProjectType | null;
  targetPlatforms: ProjectType[];
  targetAudience: string;
  businessModel: BusinessModel | null;
}

// ─── Technology Selection ────────────────────────────────────────────

export interface TechnologySelection {
  frontend: string[];
  backend: string[];
  mobile: string[];
  desktop: string[];
  database: string[];
  storage: string[];
  orm: string[];
  authentication: string[];
  hosting: string[];
  cdn: string[];
  cache: string[];
  queue: string[];
  search: string[];
  monitoring: string[];
}

// ─── Feature Selection ───────────────────────────────────────────────

export interface FeatureSelection {
  selected: string[];
}

// ─── Integration Selection ───────────────────────────────────────────

export interface IntegrationSelection {
  selected: string[];
}

// ─── Quality Config ──────────────────────────────────────────────────

export interface QualityConfig {
  security: string[];
  performance: string[];
  seo: string[];
  accessibility: string[];
  testing: string[];
  monitoring: string[];
  deployment: string[];
}

// ─── Validation ──────────────────────────────────────────────────────

export interface ValidationResult {
  id: string;
  severity: ValidationSeverity;
  section: BuilderSectionId;
  field?: string;
  message: string;
  suggestion?: string;
}

// ─── Recommendation ──────────────────────────────────────────────────

export interface Recommendation {
  id: string;
  type: 'technology' | 'feature' | 'integration' | 'quality';
  optionId: string;
  reason: string;
  score: number;
  section: BuilderSectionId;
}

// ─── Blueprint ───────────────────────────────────────────────────────

export interface Blueprint {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'complete';
  basics: ProjectBasics;
  technology: TechnologySelection;
  features: FeatureSelection;
  integrations: IntegrationSelection;
  quality: QualityConfig;
  activeSection: BuilderSectionId;
}

// ─── Helpers ─────────────────────────────────────────────────────────

export function createEmptyBlueprint(id?: string): Blueprint {
  return {
    id: id ?? crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft',
    basics: {
      name: '',
      description: '',
      category: '',
      industry: '',
      projectType: null,
      targetPlatforms: [],
      targetAudience: '',
      businessModel: null,
    },
    technology: {
      frontend: [],
      backend: [],
      mobile: [],
      desktop: [],
      database: [],
      storage: [],
      orm: [],
      authentication: [],
      hosting: [],
      cdn: [],
      cache: [],
      queue: [],
      search: [],
      monitoring: [],
    },
    features: { selected: [] },
    integrations: { selected: [] },
    quality: {
      security: [],
      performance: [],
      seo: [],
      accessibility: [],
      testing: [],
      monitoring: [],
      deployment: [],
    },
    activeSection: BuilderSectionId.ProjectBasics,
  };
}

export const BUILDER_SECTIONS: BuilderSection[] = [
  {
    id: BuilderSectionId.ProjectBasics,
    label: 'Project Basics',
    icon: '📋',
    description: 'Define your project identity, type, and target audience.',
    requiredFields: ['name', 'projectType'],
  },
  {
    id: BuilderSectionId.Platforms,
    label: 'Platforms',
    icon: '🖥️',
    description: 'Choose target platforms for your project.',
    requiredFields: ['targetPlatforms'],
  },
  {
    id: BuilderSectionId.Technology,
    label: 'Technology',
    icon: '⚙️',
    description: 'Select your technology stack.',
    requiredFields: [],
  },
  {
    id: BuilderSectionId.Features,
    label: 'Features',
    icon: '✨',
    description: 'Pick the features your project needs.',
    requiredFields: [],
  },
  {
    id: BuilderSectionId.Integrations,
    label: 'Integrations',
    icon: '🔗',
    description: 'Connect third-party services and APIs.',
    requiredFields: [],
  },
  {
    id: BuilderSectionId.Quality,
    label: 'Quality',
    icon: '🛡️',
    description: 'Configure security, performance, SEO, and testing.',
    requiredFields: [],
  },
];
