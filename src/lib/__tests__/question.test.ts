import { describe, it, expect } from 'vitest';
import { createEmptyBlueprint, ProjectType } from '@/types/blueprint';
import {
  getFilteredFeatures,
  getFilteredIntegrations,
  getRelevantTechCategoryIds,
  getRelevantQualityCategoryIds,
} from '@/lib/question';

describe('questionEngine', () => {
  describe('getFilteredFeatures', () => {
    it('returns all features as recommended when no project type is set', () => {
      const bp = createEmptyBlueprint();
      const result = getFilteredFeatures(bp);
      expect(result.other).toHaveLength(0);
      expect(result.recommended.length).toBeGreaterThan(0);
    });

    it('splits features into recommended and other for Website type', () => {
      const bp = createEmptyBlueprint();
      bp.basics.projectType = ProjectType.Website;
      const result = getFilteredFeatures(bp);
      expect(result.recommended.length).toBeGreaterThan(0);
      expect(result.other.length).toBeGreaterThan(0);
      // Website should recommend search, analytics, settings
      const recIds = result.recommended.map((f) => f.id);
      expect(recIds).toContain('search');
      expect(recIds).toContain('analytics');
    });

    it('includes already selected features in recommended even if not relevant', () => {
      const bp = createEmptyBlueprint();
      bp.basics.projectType = ProjectType.CLI;
      bp.features.selected = ['messaging']; // Not a CLI feature
      const result = getFilteredFeatures(bp);
      const recIds = result.recommended.map((f) => f.id);
      expect(recIds).toContain('messaging');
    });

    it('recommends push-notification related features for mobile', () => {
      const bp = createEmptyBlueprint();
      bp.basics.projectType = ProjectType.Android;
      const result = getFilteredFeatures(bp);
      const recIds = result.recommended.map((f) => f.id);
      expect(recIds).toContain('notifications');
    });
  });

  describe('getFilteredIntegrations', () => {
    it('returns all integrations when no project type', () => {
      const bp = createEmptyBlueprint();
      const result = getFilteredIntegrations(bp);
      expect(result.other).toHaveLength(0);
    });

    it('recommends AI integrations for AI Product type', () => {
      const bp = createEmptyBlueprint();
      bp.basics.projectType = ProjectType.AIProduct;
      const result = getFilteredIntegrations(bp);
      const recIds = result.recommended.map((i) => i.id);
      expect(recIds).toContain('openai');
      expect(recIds).toContain('anthropic');
    });
  });

  describe('getRelevantTechCategoryIds', () => {
    it('returns null when no project type is set', () => {
      const bp = createEmptyBlueprint();
      expect(getRelevantTechCategoryIds(bp)).toBeNull();
    });

    it('excludes frontend for API-only projects', () => {
      const bp = createEmptyBlueprint();
      bp.basics.projectType = ProjectType.API;
      const cats = getRelevantTechCategoryIds(bp);
      expect(cats).not.toContain('frontend');
      expect(cats).toContain('backend');
    });
  });

  describe('getRelevantQualityCategoryIds', () => {
    it('excludes SEO for CLI projects', () => {
      const bp = createEmptyBlueprint();
      bp.basics.projectType = ProjectType.CLI;
      const cats = getRelevantQualityCategoryIds(bp);
      expect(cats).not.toContain('seo');
      expect(cats).toContain('security');
    });

    it('includes SEO for Website projects', () => {
      const bp = createEmptyBlueprint();
      bp.basics.projectType = ProjectType.Website;
      const cats = getRelevantQualityCategoryIds(bp);
      expect(cats).toContain('seo');
    });
  });
});
