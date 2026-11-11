import { describe, it, expect, beforeEach } from 'vitest';
import { getSectionProgress, getOverallProgress } from '@/lib/progress';
import { technologyCategories } from '@/data/options/technologies';
import { qualityCategories } from '@/data/options/quality';
import { useBlueprintStore } from '@/stores/blueprintStore';
import { BusinessModel, BuilderSectionId, ProjectType, createEmptyBlueprint } from '@/types/blueprint';

describe('Progress Calculation & Store Parity', () => {
  beforeEach(() => {
    useBlueprintStore.getState().resetBlueprint();
  });

  it('reaches 100% Technology completion when all 12 technology categories have selections', () => {
    const bp = createEmptyBlueprint();
    for (const cat of technologyCategories) {
      bp.technology[cat.id] = ['example-id'];
    }

    const techProgress = getSectionProgress(bp, BuilderSectionId.Technology);
    expect(techProgress.totalCount).toBe(12);
    expect(techProgress.filledCount).toBe(12);
    expect(techProgress.completion).toBe(100);
  });

  it('reaches 100% Quality completion when all 7 quality categories have selections', () => {
    const bp = createEmptyBlueprint();
    for (const cat of qualityCategories) {
      bp.quality[cat.id] = ['example-id'];
    }

    const qualityProgress = getSectionProgress(bp, BuilderSectionId.Quality);
    expect(qualityProgress.totalCount).toBe(7);
    expect(qualityProgress.filledCount).toBe(7);
    expect(qualityProgress.completion).toBe(100);
  });

  it('keeps store completion selectors aligned with progress helpers and marks blueprint complete', () => {
    const store = useBlueprintStore.getState();
    store.setProjectName('Full App');
    store.setProjectDescription('Complete blueprint');
    store.setProjectType(ProjectType.WebApp);
    store.setCategory('saas');
    store.setIndustry('technology');
    store.setTargetAudience('Developers');
    store.setBusinessModel(BusinessModel.Subscription);
    store.toggleTargetPlatform(ProjectType.WebApp);
    for (const cat of technologyCategories) {
      store.toggleTechnology(cat.id, `opt-${cat.id}`);
    }
    store.toggleFeature('authentication');
    store.toggleIntegration('stripe');
    for (const cat of qualityCategories) {
      store.toggleQuality(cat.id, `q-${cat.id}`);
    }

    const bp = useBlueprintStore.getState().blueprint;
    const overall = getOverallProgress(bp);
    expect(overall.percentage).toBe(100);
    expect(overall.completedSections).toBe(overall.totalSections);
    expect(useBlueprintStore.getState().getCompletionPercentage()).toBe(100);
    expect(
      useBlueprintStore.getState().getSectionCompletion(BuilderSectionId.Technology),
    ).toBe(100);

    useBlueprintStore.getState().markComplete();
    expect(useBlueprintStore.getState().blueprint.status).toBe('complete');
  });
});
