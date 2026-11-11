import { describe, it, expect } from 'vitest';
import { createEmptyBlueprint, ProjectType } from '@/types/blueprint';
import {
  deriveEnvVariables,
  documentTypes,
  generateDocuments,
  generateSingleDocument,
} from '@/lib/generation';

describe('generationEngine', () => {
  it('has 11 document types registered', () => {
    expect(documentTypes).toHaveLength(11);
  });

  it('includes acceptance criteria as a document type', () => {
    const ac = documentTypes.find((d) => d.id === 'acceptance-criteria');
    expect(ac).toBeDefined();
    expect(ac!.title).toBe('Acceptance Criteria');
  });

  it('generates selected documents and supports single-doc regeneration', () => {
    const bp = createEmptyBlueprint();
    bp.basics.name = 'Test';
    bp.basics.projectType = ProjectType.WebApp;
    bp.basics.domainNotes = 'Entities: Tenant, Invoice. Constraints: strict row isolation.';
    bp.features.selected = ['authentication', 'dashboard'];

    const docs = generateDocuments(bp, ['prd', 'acceptance-criteria']);
    expect(docs).toHaveLength(2);
    expect(docs[0].id).toBe('prd');
    expect(docs[0].content).toContain('Entities: Tenant, Invoice');
    expect(docs[1].id).toBe('acceptance-criteria');
    expect(docs[1].content).toContain('Given/When/Then');

    const single = generateSingleDocument(bp, 'readme');
    expect(single?.id).toBe('readme');
    expect(generateSingleDocument(bp, 'nonexistent')).toBeNull();
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

  it('tailors setup, testing, database schema, AI context, and Mermaid architecture to the chosen stack', () => {
    const bp = createEmptyBlueprint();
    bp.basics.name = 'DataPipe';
    bp.basics.projectType = ProjectType.API;
    bp.basics.domainNotes = 'Entities: PipelineRun, TelemetryEvent';
    bp.technology.backend = ['python', 'fastapi'];
    bp.technology.database = ['mongodb'];
    bp.technology.cache = ['redis-cache'];
    bp.technology.hosting = ['docker'];
    bp.integrations.selected = ['stripe', 'openai'];
    bp.features.selected = ['authentication', 'payments'];

    const [readme, db, arch, testing, aiContext] = generateDocuments(bp, [
      'readme',
      'database',
      'architecture',
      'testing',
      'ai-context',
    ]);

    expect(readme.content).toContain('pip install -r requirements.txt');
    expect(readme.content).toContain('pytest');

    expect(db.content).toContain('Document Collections');
    expect(db.content).toContain('"userId"');
    expect(db.content).not.toContain('CREATE TABLE users');

    expect(arch.content).toContain('```mermaid');
    expect(arch.content).toContain('flowchart TD');
    expect(arch.content).toContain('Entities: PipelineRun, TelemetryEvent');

    expect(testing.content).toContain('pytest');
    expect(testing.content).not.toContain('Jest, Vitest');

    expect(aiContext.content).toContain('Ruff');
    expect(aiContext.content).not.toContain('Use TypeScript strict mode');

    const envVars = deriveEnvVariables(bp);
    expect(envVars).toContain('DATABASE_URL=your_database_connection_url');
    expect(envVars).toContain('REDIS_URL=redis://localhost:6379');
    expect(envVars).toContain('STRIPE_SECRET_KEY=sk_test_your_stripe_key');
    expect(envVars).toContain('OPENAI_API_KEY=sk-your_openai_key');
  });
});
