import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  debouncedSave,
  flushPendingSave,
  getBlueprint,
  duplicateBlueprint,
  deleteBlueprint,
  getCurrentBlueprintId,
  saveBlueprint,
  setAutoSaveCallbacks,
} from '@/lib/autoSave';
import { createEmptyBlueprint } from '@/types/blueprint';

describe('Auto-Save & Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    flushPendingSave();
    setAutoSaveCallbacks(() => {}, () => {});
    vi.useRealTimers();
  });

  it('flushes queued debounced saves immediately and cancels the timer', () => {
    const onStart = vi.fn();
    const onEnd = vi.fn();
    setAutoSaveCallbacks(onStart, onEnd);

    const bp = createEmptyBlueprint();
    bp.basics.name = 'Unsaved Work';

    debouncedSave(bp, 500);
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(getBlueprint(bp.id)).toBeNull();

    flushPendingSave();
    expect(onEnd).toHaveBeenCalledTimes(1);
    expect(getBlueprint(bp.id)?.blueprint.basics.name).toBe('Unsaved Work');
    expect(getCurrentBlueprintId()).toBe(bp.id);

    vi.advanceTimersByTime(1000);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('duplicates and deletes saved blueprints cleanly', () => {
    const bp = createEmptyBlueprint();
    bp.basics.name = 'Original Blueprint';
    saveBlueprint(bp);

    const copy = duplicateBlueprint(bp.id);
    expect(copy).not.toBeNull();
    expect(copy?.id).not.toBe(bp.id);
    expect(copy?.basics.name).toBe('Original Blueprint (Copy)');
    expect(getBlueprint(copy!.id)).not.toBeNull();

    deleteBlueprint(bp.id);
    expect(getBlueprint(bp.id)).toBeNull();
  });
});

