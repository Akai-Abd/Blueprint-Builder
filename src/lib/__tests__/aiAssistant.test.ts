import { describe, it, expect } from 'vitest';
import {
  extractOptionActions,
  getAssistantReply,
  isOptionActionSelected,
} from '@/lib/aiAssistant';
import { BuilderSectionId, ProjectType, createEmptyBlueprint } from '@/types/blueprint';

describe('aiAssistant option actions & reply metadata', () => {
  it('extracts matching catalog option actions in appearance order without false-positive common nouns', () => {
    const content =
      'Consider using **Next.js** with PostgreSQL, Prisma, and Jetpack Compose. Let us go search for alternatives.';
    const actions = extractOptionActions(content);
    const ids = actions.map((a) => a.id);

    expect(ids).toEqual(['nextjs', 'postgresql', 'prisma', 'jetpack-compose']);
    expect(ids).not.toContain('go');
    expect(ids).not.toContain('search');
  });

  it('tracks whether an extracted option action is already selected on the blueprint', () => {
    const bp = createEmptyBlueprint();
    bp.technology.database = ['postgresql'];
    bp.features.selected = ['payments'];

    const [pg, redis, payments] = extractOptionActions(
      'Recommended: **PostgreSQL**, **Redis**, and **Payments**.',
    );

    expect(pg.id).toBe('postgresql');
    expect(isOptionActionSelected(bp, pg)).toBe(true);
    expect(redis.id).toBe('redis');
    expect(isOptionActionSelected(bp, redis)).toBe(false);
    expect(payments.id).toBe('payments');
    expect(isOptionActionSelected(bp, payments)).toBe(true);
  });

  it('returns explicit offline mode metadata for quick actions', async () => {
    const bp = createEmptyBlueprint();
    bp.basics.projectType = ProjectType.Android;

    const reply = await getAssistantReply(
      'suggest-stack',
      bp,
      BuilderSectionId.Technology,
    );

    expect(reply.mode).toBe('offline');
    expect(reply.content).toContain('Jetpack Compose');
    expect(extractOptionActions(reply.content).some((a) => a.id === 'jetpack-compose')).toBe(true);
  });
});

