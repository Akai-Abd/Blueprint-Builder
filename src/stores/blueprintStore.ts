'use client';

import { create } from 'zustand';
import {
  Blueprint,
  BuilderSectionId,
  BusinessModel,
  ProjectType,
  createEmptyBlueprint,
} from '@/types/blueprint';

// ─── History for Undo/Redo ───────────────────────────────────────────

interface HistoryEntry {
  blueprint: Blueprint;
  timestamp: number;
}

// ─── Store Interface ─────────────────────────────────────────────────

interface BlueprintStore {
  blueprint: Blueprint;
  history: HistoryEntry[];
  historyIndex: number;
  isSaving: boolean;

  // Navigation
  setActiveSection: (section: BuilderSectionId) => void;
  goToNextSection: () => void;
  goToPrevSection: () => void;

  // Project Basics
  setProjectName: (name: string) => void;
  setProjectDescription: (description: string) => void;
  setCategory: (category: string) => void;
  setIndustry: (industry: string) => void;
  setProjectType: (type: ProjectType) => void;
  setTargetAudience: (audience: string) => void;
  setBusinessModel: (model: BusinessModel) => void;
  toggleTargetPlatform: (platform: ProjectType) => void;

  // Technology
  addTechnology: (category: keyof Blueprint['technology'], id: string) => void;
  removeTechnology: (category: keyof Blueprint['technology'], id: string) => void;
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

  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

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

function pushHistory(state: BlueprintStore): Partial<BlueprintStore> {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push({
    blueprint: JSON.parse(JSON.stringify(state.blueprint)),
    timestamp: Date.now(),
  });
  // Keep max 50 history entries
  if (newHistory.length > 50) newHistory.shift();
  return { history: newHistory, historyIndex: newHistory.length - 1 };
}

function toggleInArray<T extends string>(arr: T[], id: T): T[] {
  return arr.includes(id) ? arr.filter((i) => i !== id) : [...arr, id];
}

// ─── Store ───────────────────────────────────────────────────────────

export const useBlueprintStore = create<BlueprintStore>((set, get) => {
  const initial = createEmptyBlueprint();
  return {
    blueprint: initial,
    history: [{ blueprint: JSON.parse(JSON.stringify(initial)), timestamp: Date.now() }],
    historyIndex: 0,
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
        ...pushHistory(s),
        blueprint: {
          ...s.blueprint,
          basics: { ...s.blueprint.basics, name },
          updatedAt: new Date().toISOString(),
        },
      })),

    setProjectDescription: (description) =>
      set((s) => ({
        ...pushHistory(s),
        blueprint: {
          ...s.blueprint,
          basics: { ...s.blueprint.basics, description },
          updatedAt: new Date().toISOString(),
        },
      })),

    setCategory: (category) =>
      set((s) => ({
        ...pushHistory(s),
        blueprint: {
          ...s.blueprint,
          basics: { ...s.blueprint.basics, category },
          updatedAt: new Date().toISOString(),
        },
      })),

    setIndustry: (industry) =>
      set((s) => ({
        ...pushHistory(s),
        blueprint: {
          ...s.blueprint,
          basics: { ...s.blueprint.basics, industry },
          updatedAt: new Date().toISOString(),
        },
      })),

    setProjectType: (type) =>
      set((s) => ({
        ...pushHistory(s),
        blueprint: {
          ...s.blueprint,
          basics: { ...s.blueprint.basics, projectType: type },
          updatedAt: new Date().toISOString(),
        },
      })),

    setTargetAudience: (audience) =>
      set((s) => ({
        ...pushHistory(s),
        blueprint: {
          ...s.blueprint,
          basics: { ...s.blueprint.basics, targetAudience: audience },
          updatedAt: new Date().toISOString(),
        },
      })),

    setBusinessModel: (model) =>
      set((s) => ({
        ...pushHistory(s),
        blueprint: {
          ...s.blueprint,
          basics: { ...s.blueprint.basics, businessModel: model },
          updatedAt: new Date().toISOString(),
        },
      })),

    toggleTargetPlatform: (platform) =>
      set((s) => ({
        ...pushHistory(s),
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
    addTechnology: (category, id) =>
      set((s) => ({
        ...pushHistory(s),
        blueprint: {
          ...s.blueprint,
          technology: {
            ...s.blueprint.technology,
            [category]: [...s.blueprint.technology[category], id],
          },
          updatedAt: new Date().toISOString(),
        },
      })),

    removeTechnology: (category, id) =>
      set((s) => ({
        ...pushHistory(s),
        blueprint: {
          ...s.blueprint,
          technology: {
            ...s.blueprint.technology,
            [category]: s.blueprint.technology[category].filter((i) => i !== id),
          },
          updatedAt: new Date().toISOString(),
        },
      })),

    toggleTechnology: (category, id) =>
      set((s) => ({
        ...pushHistory(s),
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
        ...pushHistory(s),
        blueprint: {
          ...s.blueprint,
          features: { selected: toggleInArray(s.blueprint.features.selected, featureId) },
          updatedAt: new Date().toISOString(),
        },
      })),

    // ── Integrations ──────────────────────────────────────────────────
    toggleIntegration: (integrationId) =>
      set((s) => ({
        ...pushHistory(s),
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
        ...pushHistory(s),
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
      const fresh = createEmptyBlueprint();
      set({
        blueprint: fresh,
        history: [{ blueprint: JSON.parse(JSON.stringify(fresh)), timestamp: Date.now() }],
        historyIndex: 0,
      });
    },

    loadBlueprint: (blueprint) =>
      set({
        blueprint,
        history: [{ blueprint: JSON.parse(JSON.stringify(blueprint)), timestamp: Date.now() }],
        historyIndex: 0,
      }),

    // ── Undo/Redo ─────────────────────────────────────────────────────
    undo: () =>
      set((s) => {
        if (s.historyIndex <= 0) return s;
        const newIndex = s.historyIndex - 1;
        return {
          historyIndex: newIndex,
          blueprint: JSON.parse(JSON.stringify(s.history[newIndex].blueprint)),
        };
      }),

    redo: () =>
      set((s) => {
        if (s.historyIndex >= s.history.length - 1) return s;
        const newIndex = s.historyIndex + 1;
        return {
          historyIndex: newIndex,
          blueprint: JSON.parse(JSON.stringify(s.history[newIndex].blueprint)),
        };
      }),

    canUndo: () => get().historyIndex > 0,
    canRedo: () => get().historyIndex < get().history.length - 1,

    // ── Computed ──────────────────────────────────────────────────────
    getCompletionPercentage: () => {
      const s = get();
      let total = 0;
      let filled = 0;

      // Basics: name, description, projectType, industry, audience, businessModel
      const basicsFields = [
        s.blueprint.basics.name,
        s.blueprint.basics.description,
        s.blueprint.basics.projectType,
        s.blueprint.basics.industry,
        s.blueprint.basics.targetAudience,
        s.blueprint.basics.businessModel,
      ];
      total += basicsFields.length;
      filled += basicsFields.filter(Boolean).length;

      // Platforms
      total += 1;
      if (s.blueprint.basics.targetPlatforms.length > 0) filled += 1;

      // Technology: at least one selection in any category
      total += 1;
      const techValues = Object.values(s.blueprint.technology);
      if (techValues.some((arr) => arr.length > 0)) filled += 1;

      // Features
      total += 1;
      if (s.blueprint.features.selected.length > 0) filled += 1;

      // Integrations
      total += 1;
      if (s.blueprint.integrations.selected.length > 0) filled += 1;

      // Quality
      total += 1;
      const qualityValues = Object.values(s.blueprint.quality);
      if (qualityValues.some((arr) => arr.length > 0)) filled += 1;

      return Math.round((filled / total) * 100);
    },

    getSectionCompletion: (section) => {
      const s = get();
      switch (section) {
        case BuilderSectionId.ProjectBasics: {
          const fields = [
            s.blueprint.basics.name,
            s.blueprint.basics.description,
            s.blueprint.basics.projectType,
            s.blueprint.basics.category,
            s.blueprint.basics.industry,
            s.blueprint.basics.targetAudience,
            s.blueprint.basics.businessModel,
          ];
          return Math.round((fields.filter(Boolean).length / fields.length) * 100);
        }
        case BuilderSectionId.Platforms:
          return s.blueprint.basics.targetPlatforms.length > 0 ? 100 : 0;
        case BuilderSectionId.Technology: {
          const cats = Object.values(s.blueprint.technology);
          const filled = cats.filter((a) => a.length > 0).length;
          return Math.round((filled / Math.max(cats.length, 1)) * 100);
        }
        case BuilderSectionId.Features:
          return s.blueprint.features.selected.length > 0 ? 100 : 0;
        case BuilderSectionId.Integrations:
          return s.blueprint.integrations.selected.length > 0 ? 100 : 0;
        case BuilderSectionId.Quality: {
          const cats = Object.values(s.blueprint.quality);
          const filled = cats.filter((a) => a.length > 0).length;
          return Math.round((filled / Math.max(cats.length, 1)) * 100);
        }
        default:
          return 0;
      }
    },
  };
});
