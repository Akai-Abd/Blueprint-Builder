'use client';

import { create } from 'zustand';
import {
  Blueprint,
  BuilderSectionId,
  BusinessModel,
  ProjectType,
  createEmptyBlueprint,
} from '@/types/blueprint';
import { getOverallProgress, getSectionProgress } from '@/lib/progress';

// ─── Store Interface ─────────────────────────────────────────────────

interface BlueprintStore {
  blueprint: Blueprint;
  isSaving: boolean;

  // Navigation
  setActiveSection: (section: BuilderSectionId) => void;
  goToNextSection: () => void;
  goToPrevSection: () => void;

  // Project Basics
  setProjectName: (name: string) => void;
  setProjectDescription: (description: string) => void;
  setDomainNotes: (domainNotes: string) => void;
  setCategory: (category: string) => void;
  setIndustry: (industry: string) => void;
  setProjectType: (type: ProjectType) => void;
  setTargetAudience: (audience: string) => void;
  setBusinessModel: (model: BusinessModel) => void;
  toggleTargetPlatform: (platform: ProjectType) => void;

  // Technology
  toggleTechnology: (category: keyof Blueprint['technology'], id: string) => void;

  // Features
  toggleFeature: (featureId: string) => void;

  // Integrations
  toggleIntegration: (integrationId: string) => void;

  // Quality
  toggleQuality: (category: keyof Blueprint['quality'], id: string) => void;

  // Blueprint Management
  resetBlueprint: () => void;
  loadBlueprint: (blueprint: Blueprint) => void;
  markComplete: () => void;

  // Computed
  getCompletionPercentage: () => number;
  getSectionCompletion: (section: BuilderSectionId) => number;
}

// ─── Section Order ───────────────────────────────────────────────────

const SECTION_ORDER: BuilderSectionId[] = [
  BuilderSectionId.ProjectBasics,
  BuilderSectionId.Platforms,
  BuilderSectionId.Technology,
  BuilderSectionId.Features,
  BuilderSectionId.Integrations,
  BuilderSectionId.Quality,
];

// ─── Helpers ─────────────────────────────────────────────────────────

function toggleInArray<T extends string>(arr: T[], id: T): T[] {
  return arr.includes(id) ? arr.filter((i) => i !== id) : [...arr, id];
}

// ─── Store ───────────────────────────────────────────────────────────

export const useBlueprintStore = create<BlueprintStore>((set, get) => {
  const initial = createEmptyBlueprint();
  return {
    blueprint: initial,
    isSaving: false,

    // ── Navigation ────────────────────────────────────────────────────
    setActiveSection: (section) =>
      set((s) => ({
        blueprint: { ...s.blueprint, activeSection: section, updatedAt: new Date().toISOString() },
      })),

    goToNextSection: () =>
      set((s) => {
        const idx = SECTION_ORDER.indexOf(s.blueprint.activeSection);
        if (idx < SECTION_ORDER.length - 1) {
          return {
            blueprint: {
              ...s.blueprint,
              activeSection: SECTION_ORDER[idx + 1],
              updatedAt: new Date().toISOString(),
            },
          };
        }
        return s;
      }),

    goToPrevSection: () =>
      set((s) => {
        const idx = SECTION_ORDER.indexOf(s.blueprint.activeSection);
        if (idx > 0) {
          return {
            blueprint: {
              ...s.blueprint,
              activeSection: SECTION_ORDER[idx - 1],
              updatedAt: new Date().toISOString(),
            },
          };
        }
        return s;
      }),

    // ── Project Basics ────────────────────────────────────────────────
    setProjectName: (name) =>
      set((s) => ({
        blueprint: {
          ...s.blueprint,
          basics: { ...s.blueprint.basics, name },
          updatedAt: new Date().toISOString(),
        },
      })),

    setProjectDescription: (description) =>
      set((s) => ({
        blueprint: {
          ...s.blueprint,
          basics: { ...s.blueprint.basics, description },
          updatedAt: new Date().toISOString(),
        },
      })),

    setDomainNotes: (domainNotes) =>
      set((s) => ({
        blueprint: {
          ...s.blueprint,
          basics: { ...s.blueprint.basics, domainNotes },
          updatedAt: new Date().toISOString(),
        },
      })),

    setCategory: (category) =>
      set((s) => ({
        blueprint: {
          ...s.blueprint,
          basics: { ...s.blueprint.basics, category },
          updatedAt: new Date().toISOString(),
        },
      })),

    setIndustry: (industry) =>
      set((s) => ({
        blueprint: {
          ...s.blueprint,
          basics: { ...s.blueprint.basics, industry },
          updatedAt: new Date().toISOString(),
        },
      })),

    setProjectType: (type) =>
      set((s) => ({
        blueprint: {
          ...s.blueprint,
          basics: { ...s.blueprint.basics, projectType: type },
          updatedAt: new Date().toISOString(),
        },
      })),

    setTargetAudience: (audience) =>
      set((s) => ({
        blueprint: {
          ...s.blueprint,
          basics: { ...s.blueprint.basics, targetAudience: audience },
          updatedAt: new Date().toISOString(),
        },
      })),

    setBusinessModel: (model) =>
      set((s) => ({
        blueprint: {
          ...s.blueprint,
          basics: { ...s.blueprint.basics, businessModel: model },
          updatedAt: new Date().toISOString(),
        },
      })),

    toggleTargetPlatform: (platform) =>
      set((s) => ({
        blueprint: {
          ...s.blueprint,
          basics: {
            ...s.blueprint.basics,
            targetPlatforms: toggleInArray(s.blueprint.basics.targetPlatforms, platform),
          },
          updatedAt: new Date().toISOString(),
        },
      })),

    // ── Technology ────────────────────────────────────────────────────
    toggleTechnology: (category, id) =>
      set((s) => ({
        blueprint: {
          ...s.blueprint,
          technology: {
            ...s.blueprint.technology,
            [category]: toggleInArray(s.blueprint.technology[category], id),
          },
          updatedAt: new Date().toISOString(),
        },
      })),

    // ── Features ──────────────────────────────────────────────────────
    toggleFeature: (featureId) =>
      set((s) => ({
        blueprint: {
          ...s.blueprint,
          features: { selected: toggleInArray(s.blueprint.features.selected, featureId) },
          updatedAt: new Date().toISOString(),
        },
      })),

    // ── Integrations ──────────────────────────────────────────────────
    toggleIntegration: (integrationId) =>
      set((s) => ({
        blueprint: {
          ...s.blueprint,
          integrations: {
            selected: toggleInArray(s.blueprint.integrations.selected, integrationId),
          },
          updatedAt: new Date().toISOString(),
        },
      })),

    // ── Quality ───────────────────────────────────────────────────────
    toggleQuality: (category, id) =>
      set((s) => ({
        blueprint: {
          ...s.blueprint,
          quality: {
            ...s.blueprint.quality,
            [category]: toggleInArray(s.blueprint.quality[category], id),
          },
          updatedAt: new Date().toISOString(),
        },
      })),

    // ── Blueprint Management ──────────────────────────────────────────
    resetBlueprint: () => {
      set({ blueprint: createEmptyBlueprint() });
    },

    loadBlueprint: (blueprint) => {
      set({ blueprint });
    },

    markComplete: () =>
      set((s) => ({
        blueprint: {
          ...s.blueprint,
          status: 'complete',
          updatedAt: new Date().toISOString(),
        },
      })),

    // ── Computed ──────────────────────────────────────────────────────
    getCompletionPercentage: () => getOverallProgress(get().blueprint).percentage,

    getSectionCompletion: (section) => getSectionProgress(get().blueprint, section).completion,
  };
});
