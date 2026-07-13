import { describe, it, expect } from 'vitest';
import { createEmptyBlueprint, ProjectType } from '@/types/blueprint';
import { validateBlueprint } from '@/lib/validationEngine';

describe('validationEngine', () => {
  it('reports errors for empty blueprint', () => {
    const bp = createEmptyBlueprint();
    const results = validateBlueprint(bp);
    const errors = results.filter((r) => r.severity === 'error');
    expect(errors.length).toBeGreaterThan(0);
    // Should report missing name
    const nameError = errors.find((e) => e.field === 'name' || e.message.toLowerCase().includes('name'));
    expect(nameError).toBeDefined();
  });

  it('reduces errors when required fields are filled', () => {
    const bp = createEmptyBlueprint();
    bp.basics.name = 'Test Project';
    bp.basics.projectType = ProjectType.WebApp;
    const results = validateBlueprint(bp);
    const errors = results.filter((r) => r.severity === 'error');
    // Should have fewer errors now
    const nameError = errors.find((e) => e.field === 'name');
    expect(nameError).toBeUndefined();
  });
});
