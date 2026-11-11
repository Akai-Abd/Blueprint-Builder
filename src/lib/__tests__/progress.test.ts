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

  it('reaches 100% Technology completion when all categories have selections (projectType unset)', () => {
    const bp = createEmptyBlueprint();
    for (const cat of technologyCategories) {
      bp.technology[cat.id] = ['example-id'];
    }

    const techProgress = getSectionProgress(bp, BuilderSectionId.Technology);
    expect(techProgress.totalCount).toBe(technologyCategories.length);
    expect(techProgress.filledCount).toBe(technologyCategories.length);
    expect(techProgress.completion).toBe(100);
  });

  it('scopes Technology & Quality denominators to relevant categories for typed projects', () => {
    const bp = createEmptyBlueprint();
    bp.basics.projectType = ProjectType.WebApp;
    for (const cat of technologyCategories) {
      if (cat.id !== 'mobile' && cat.id !== 'desktop') {
        bp.technology[cat.id] = ['example-id'];
      }
    }
    const webTech = getSectionProgress(bp, BuilderSectionId.Technology);
    expect(webTech.totalCount).toBe(technologyCategories.length - 2);
    expect(webTech.completion).toBe(100);

    const androidBp = createEmptyBlueprint();
    androidBp.basics.projectType = ProjectType.Android;
    androidBp.technology.mobile = ['react-native'];
    const androidTech = getSectionProgress(androidBp, BuilderSectionId.Technology);
    expect(androidTech.totalCount).toBe(8);
    expect(androidTech.filledCount).toBe(1);

    const cliBp = createEmptyBlueprint();
    cliBp.basics.projectType = ProjectType.CLI;
    const cliQuality = getSectionProgress(cliBp, BuilderSectionId.Quality);
    expect(cliQuality.totalCount).toBe(3);
  });

  it('reaches 100% Quality completion when all 7 quality categories have selections', () => {
    const bp = createEmptyBlueprint();
    for (const cat of qualityCategories) {
      bp.quality[cat.id] = ['example-id'];
    }

    const qualityProgress = getSectionProgress(bp, BuilderSectionId.Quality);
    expect(qualityProgress.totalCount).toBe(qualityCategories.length);
    expect(qualityProgress.filledCount).toBe(qualityCategories.length);
    expect(qualityProgress.completion).toBe(100);
  });

  it('keeps store completion selectors aligned with progress helpers for scoped WebApp and marks complete', () => {
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
      if (cat.id !== 'mobile' && cat.id !== 'desktop') {
        store.toggleTechnology(cat.id, `opt-${cat.id}`);
      }
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
