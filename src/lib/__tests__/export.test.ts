import { describe, it, expect } from 'vitest';
import {
  buildRepoExportFiles,
  generateEnvExample,
  generateShareLink,
  importFromJSON,
  loadFromShareLink,
} from '@/lib/export';
import { generateDocuments } from '@/lib/generation';
import { createEmptyBlueprint } from '@/types/blueprint';

function makeJsonFile(content: string): File {
  return {
    text: async () => content,
  } as unknown as File;
}

describe('Export, Import & Share Links', () => {
  it('imports a valid blueprint JSON file', async () => {
    const bp = createEmptyBlueprint();
    bp.basics.name = 'Imported App';
    bp.features.selected = ['authentication'];

    const result = await importFromJSON(makeJsonFile(JSON.stringify(bp)));

    expect(result.success).toBe(true);
    expect(result.blueprint?.basics.name).toBe('Imported App');
    expect(result.blueprint?.features.selected).toEqual(['authentication']);
  });

  it('rejects malformed JSON and objects missing required sections', async () => {
    const invalidSyntax = await importFromJSON(makeJsonFile('{not-json'));
    expect(invalidSyntax.success).toBe(false);

    const missingFields = await importFromJSON(makeJsonFile(JSON.stringify({ basics: {} })));
    expect(missingFields.success).toBe(false);
    expect(missingFields.error).toContain('Missing required field');
  });

  it('roundtrips UTF-8 and emoji blueprint data through generateShareLink and loadFromShareLink', () => {
    const bp = createEmptyBlueprint();
    bp.basics.name = 'Café Studio 🚀';
    bp.basics.description = 'Multilingual résumé & analytics tool';
    bp.technology.frontend = ['nextjs'];

    const link = generateShareLink(bp);
    const sharedParam = link.split('?shared=')[1];
    expect(sharedParam).toBeTruthy();

    const decoded = loadFromShareLink(sharedParam);
    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBeTruthy();
    expect(decoded?.id).not.toBe(bp.id);
    expect(decoded?.status).toBe('draft');
    expect(decoded?.basics.name).toBe('Café Studio 🚀');
    expect(decoded?.technology.frontend).toEqual(['nextjs']);
  });

  it('returns null when loadFromShareLink receives invalid payloads', () => {
    expect(loadFromShareLink('not-valid-base64!!!')).toBeNull();
    const invalidShape = encodeURIComponent(btoa(JSON.stringify({ foo: 'bar' })));
    expect(loadFromShareLink(invalidShape)).toBeNull();
  });

  it('builds a repo-ready export file tree with README.md, AGENTS.md, .env.example, docs/*.md, and blueprint.json', () => {
    const bp = createEmptyBlueprint();
    bp.basics.name = 'LaunchKit';
    bp.technology.frontend = ['nextjs'];
    bp.technology.database = ['postgresql'];
    bp.technology.authentication = ['clerk'];
    bp.integrations.selected = ['stripe', 'resend'];

    const envExample = generateEnvExample(bp);
    expect(envExample).toContain('DATABASE_URL=');
    expect(envExample).toContain('CLERK_SECRET_KEY=');
    expect(envExample).toContain('STRIPE_SECRET_KEY=');
    expect(envExample).toContain('RESEND_API_KEY=');

    const docs = generateDocuments(bp, ['readme', 'ai-context', 'prd']);
    const files = buildRepoExportFiles(docs, bp);
    const paths = files.map((f) => f.path);

    expect(paths).toContain('README.md');
    expect(paths).toContain('AGENTS.md');
    expect(paths).toContain('.env.example');
    expect(paths).toContain('docs/prd.md');
    expect(paths).toContain('blueprint.json');
  });
});
