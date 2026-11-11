import { describe, it, expect } from 'vitest';
import { importFromJSON, generateShareLink, loadFromShareLink } from '@/lib/export';
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
});
