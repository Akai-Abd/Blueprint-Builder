import { describe, it, expect } from 'vitest';
import { createEmptyBlueprint, ProjectType } from '@/types/blueprint';
import { generateDocuments, documentTypes } from '@/lib/generation';

describe('generationEngine', () => {
  it('has 11 document types registered', () => {
    expect(documentTypes).toHaveLength(11);
  });

  it('includes acceptance criteria as a document type', () => {
    const ac = documentTypes.find((d) => d.id === 'acceptance-criteria');
    expect(ac).toBeDefined();
    expect(ac!.title).toBe('Acceptance Criteria');
  });

  it('generates selected documents', () => {
    const bp = createEmptyBlueprint();
    bp.basics.name = 'Test';
    bp.basics.projectType = ProjectType.WebApp;
    bp.features.selected = ['authentication', 'dashboard'];

    const docs = generateDocuments(bp, ['prd', 'acceptance-criteria']);
    expect(docs).toHaveLength(2);
    expect(docs[0].id).toBe('prd');
    expect(docs[1].id).toBe('acceptance-criteria');
    expect(docs[1].content).toContain('Given/When/Then');
  });

  it('generates acceptance criteria for selected features', () => {
    const bp = createEmptyBlueprint();
    bp.basics.name = 'Test';
    bp.features.selected = ['authentication', 'payments'];

    const docs = generateDocuments(bp, ['acceptance-criteria']);
    expect(docs).toHaveLength(1);
    const ac = docs[0];
    expect(ac.content).toContain('Authentication');
    expect(ac.content).toContain('Payments');
    expect(ac.content).toContain('**Given**');
    expect(ac.content).toContain('**When**');
    expect(ac.content).toContain('**Then**');
  });
});
