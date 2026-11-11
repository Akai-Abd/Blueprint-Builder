import { describe, it, expect } from 'vitest';
import { generateRecommendations, getRecommendationMap } from '@/lib/recommendation';
import { allTechnologies } from '@/data/options/technologies';
import { qualityCategories } from '@/data/options/quality';
import { createEmptyBlueprint, ProjectType } from '@/types/blueprint';

describe('Recommendation Engine', () => {
  it('recommends valid technology IDs when Next.js is selected', () => {
    const bp = createEmptyBlueprint();
    bp.technology.frontend = ['nextjs'];

    const recs = generateRecommendations(bp);
    const ids = recs.map((r) => r.optionId);

    expect(ids).toContain('vercel');
    expect(ids).toContain('prisma');
    expect(ids).toContain('postgresql');
    expect(ids).not.toContain('supabase');
  });

  it('recommends postgresql when supabase-auth is selected', () => {
    const bp = createEmptyBlueprint();
    bp.technology.authentication = ['supabase-auth'];

    const recMap = getRecommendationMap(bp);
    expect(recMap.has('postgresql')).toBe(true);
    expect(recMap.has('supabase')).toBe(false);
  });

  it('only produces recommendations whose optionId exists in technologies or quality categories', () => {
    const bp = createEmptyBlueprint();
    bp.basics.projectType = ProjectType.WebApp;
    bp.technology.frontend = ['nextjs', 'react'];
    bp.technology.backend = ['nodejs', 'django'];
    bp.technology.authentication = ['supabase-auth'];
    bp.technology.database = ['mongodb'];

    const validIds = new Set<string>([
      ...allTechnologies.map((t) => t.id),
      'hosting',
      'orm',
      ...qualityCategories.map((c) => c.id),
    ]);

    const recs = generateRecommendations(bp);
    expect(recs.length).toBeGreaterThan(0);
    for (const rec of recs) {
      expect(validIds.has(rec.optionId)).toBe(true);
    }
  });
});
