import { describe, it, expect } from 'vitest';
import {
  platformOptions,
  industryOptions,
  categoryOptions,
  businessModelOptions,
} from '@/data/options/platforms';
import { allTechnologies, technologyCategories } from '@/data/options/technologies';
import { featureOptions } from '@/data/options/features';
import { integrationOptions } from '@/data/options/integrations';
import { qualityOptions, qualityCategories } from '@/data/options/quality';
import { BLUEPRINT_PRESETS } from '@/data/presets';
import { getFilteredFeatures, getFilteredIntegrations } from '@/lib/question';
import { createEmptyBlueprint, ProjectType } from '@/types/blueprint';

describe('Blueprint Data & Mapping Integrity', () => {
  const allQualityOptions = Object.values(qualityOptions).flat();
  const validOptionIds = new Set<string>([
    ...platformOptions.map((o) => o.id),
    ...industryOptions.map((o) => o.id),
    ...categoryOptions.map((o) => o.id),
    ...businessModelOptions.map((o) => o.id),
    ...allTechnologies.map((o) => o.id),
    ...technologyCategories.map((c) => c.id),
    ...featureOptions.map((o) => o.id),
    ...integrationOptions.map((o) => o.id),
    ...allQualityOptions.map((o) => o.id),
    ...qualityCategories.map((c) => c.id),
  ]);

  it('has unique option IDs within each major catalog', () => {
    const checkUnique = (ids: string[]) => {
      expect(new Set(ids).size).toBe(ids.length);
    };

    checkUnique(allTechnologies.map((o) => o.id));
    checkUnique(featureOptions.map((o) => o.id));
    checkUnique(integrationOptions.map((o) => o.id));
    checkUnique(allQualityOptions.map((o) => o.id));
  });

  it('resolves every compatibleWith reference to a defined option ID', () => {
    const allOptions = [
      ...allTechnologies,
      ...featureOptions,
      ...integrationOptions,
      ...allQualityOptions,
    ];

    const unknownRefs: Array<{ optionId: string; ref: string }> = [];
    for (const option of allOptions) {
      for (const ref of option.compatibleWith) {
        if (!validOptionIds.has(ref)) {
          unknownRefs.push({ optionId: option.id, ref });
        }
      }
    }

    expect(unknownRefs).toEqual([]);
  });

  it('shows all features and integrations as recommended for Custom project type', () => {
    const bp = createEmptyBlueprint();
    bp.basics.projectType = ProjectType.Custom;

    const features = getFilteredFeatures(bp);
    const integrations = getFilteredIntegrations(bp);

    expect(features.recommended.length).toBe(featureOptions.length);
    expect(features.other).toHaveLength(0);
    expect(integrations.recommended.length).toBe(integrationOptions.length);
    expect(integrations.other).toHaveLength(0);
  });

  it('filters only defined integration IDs across every ProjectType', () => {
    const integrationIdSet = new Set(integrationOptions.map((i) => i.id));
    const featureIdSet = new Set(featureOptions.map((f) => f.id));

    for (const type of Object.values(ProjectType)) {
      const bp = createEmptyBlueprint();
      bp.basics.projectType = type;

      const filteredFeatures = getFilteredFeatures(bp);
      const filteredIntegrations = getFilteredIntegrations(bp);

      expect(filteredFeatures.recommended.length + filteredFeatures.other.length).toBe(
        featureOptions.length,
      );
      expect(filteredIntegrations.recommended.length + filteredIntegrations.other.length).toBe(
        integrationOptions.length,
      );

      for (const item of filteredFeatures.recommended) {
        expect(featureIdSet.has(item.id)).toBe(true);
      }
      for (const item of filteredIntegrations.recommended) {
        expect(integrationIdSet.has(item.id)).toBe(true);
      }
    }
  });

  it('validates that every starter preset references defined technology, feature, integration, and quality IDs', () => {
    expect(BLUEPRINT_PRESETS.length).toBeGreaterThanOrEqual(5);
    const integrationIdSet = new Set(integrationOptions.map((i) => i.id));
    const featureIdSet = new Set(featureOptions.map((f) => f.id));

    for (const preset of BLUEPRINT_PRESETS) {
      const bp = preset.build();
      expect(bp.basics.name.length).toBeGreaterThan(0);
      expect(bp.basics.projectType).not.toBeNull();

      for (const [cat, ids] of Object.entries(bp.technology)) {
        const catDef = technologyCategories.find((c) => c.id === cat);
        const catIds = new Set(catDef?.options.map((o) => o.id) ?? []);
        for (const id of ids) {
          expect(catIds.has(id)).toBe(true);
        }
      }

      for (const id of bp.features.selected) {
        expect(featureIdSet.has(id)).toBe(true);
      }

      for (const id of bp.integrations.selected) {
        expect(integrationIdSet.has(id)).toBe(true);
      }

      for (const [cat, ids] of Object.entries(bp.quality)) {
        const catIds = new Set(
          (qualityOptions[cat as keyof typeof qualityOptions] ?? []).map((o) => o.id),
        );
        for (const id of ids) {
          expect(catIds.has(id)).toBe(true);
        }
      }
    }
  });
});

