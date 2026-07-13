'use client';

import { Blueprint } from '@/types/blueprint';

// ─── Storage Keys ────────────────────────────────────────────────────

const STORAGE_KEY = 'bb_blueprints';
const CURRENT_ID_KEY = 'bb_current_blueprint_id';

// ─── Types ───────────────────────────────────────────────────────────

export interface SavedBlueprint {
  blueprint: Blueprint;
  savedAt: string;
}

// ─── Read / Write ────────────────────────────────────────────────────

function readAll(): SavedBlueprint[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(items: SavedBlueprint[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// ─── Public API ──────────────────────────────────────────────────────

/** Get all saved blueprints, most recently updated first. */
export function getAllBlueprints(): SavedBlueprint[] {
  return readAll().sort(
    (a, b) => new Date(b.blueprint.updatedAt).getTime() - new Date(a.blueprint.updatedAt).getTime()
  );
}

/** Get a single blueprint by ID. */
export function getBlueprint(id: string): SavedBlueprint | null {
  return readAll().find((s) => s.blueprint.id === id) ?? null;
}

/** Save (upsert) a blueprint. */
export function saveBlueprint(blueprint: Blueprint): void {
  const items = readAll();
  const idx = items.findIndex((s) => s.blueprint.id === blueprint.id);
  const entry: SavedBlueprint = {
    blueprint: JSON.parse(JSON.stringify(blueprint)),
    savedAt: new Date().toISOString(),
  };
  if (idx >= 0) {
    items[idx] = entry;
  } else {
    items.push(entry);
  }
  writeAll(items);
}

/** Delete a blueprint by ID. */
export function deleteBlueprint(id: string): void {
  writeAll(readAll().filter((s) => s.blueprint.id !== id));
  // Clear current ID if it matches
  if (getCurrentBlueprintId() === id) {
    clearCurrentBlueprintId();
  }
}

/** Duplicate a blueprint, returning the new copy. */
export function duplicateBlueprint(id: string): Blueprint | null {
  const original = getBlueprint(id);
  if (!original) return null;
  const copy: Blueprint = JSON.parse(JSON.stringify(original.blueprint));
  copy.id = crypto.randomUUID();
  copy.createdAt = new Date().toISOString();
  copy.updatedAt = new Date().toISOString();
  copy.basics.name = `${original.blueprint.basics.name || 'Untitled'} (Copy)`;
  saveBlueprint(copy);
  return copy;
}

// ─── Current Session ─────────────────────────────────────────────────

export function getCurrentBlueprintId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CURRENT_ID_KEY);
}

export function setCurrentBlueprintId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CURRENT_ID_KEY, id);
}

export function clearCurrentBlueprintId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CURRENT_ID_KEY);
}

// ─── Debounced Auto-Save ─────────────────────────────────────────────

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let onSaveStart: (() => void) | null = null;
let onSaveEnd: (() => void) | null = null;

export function setAutoSaveCallbacks(
  start: () => void,
  end: () => void,
): void {
  onSaveStart = start;
  onSaveEnd = end;
}

export function debouncedSave(blueprint: Blueprint, delayMs = 500): void {
  if (saveTimer) clearTimeout(saveTimer);
  onSaveStart?.();
  saveTimer = setTimeout(() => {
    saveBlueprint(blueprint);
    saveRevision(blueprint);
    setCurrentBlueprintId(blueprint.id);
    onSaveEnd?.();
    saveTimer = null;
  }, delayMs);
}

// ─── Persistent Revision History ─────────────────────────────────────

const REVISION_KEY_PREFIX = 'bb_revisions_';
const MAX_REVISIONS = 20;

export interface RevisionEntry {
  savedAt: string;
  snapshot: Blueprint;
}

export function saveRevision(blueprint: Blueprint): void {
  if (typeof window === 'undefined') return;
  try {
    const key = REVISION_KEY_PREFIX + blueprint.id;
    const raw = localStorage.getItem(key);
    let revisions: RevisionEntry[] = raw ? JSON.parse(raw) : [];

    // Don't save if nothing changed since last revision
    if (revisions.length > 0) {
      const lastSnapshot = JSON.stringify(revisions[0].snapshot);
      const current = JSON.stringify(blueprint);
      if (lastSnapshot === current) return;
    }

    revisions.unshift({
      savedAt: new Date().toISOString(),
      snapshot: JSON.parse(JSON.stringify(blueprint)),
    });

    if (revisions.length > MAX_REVISIONS) {
      revisions = revisions.slice(0, MAX_REVISIONS);
    }

    localStorage.setItem(key, JSON.stringify(revisions));
  } catch { /* storage full or unavailable */ }
}

export function getRevisionHistory(blueprintId: string): RevisionEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = REVISION_KEY_PREFIX + blueprintId;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function restoreRevision(
  blueprintId: string,
  revisionIndex: number,
): Blueprint | null {
  const revisions = getRevisionHistory(blueprintId);
  if (revisionIndex < 0 || revisionIndex >= revisions.length) return null;
  const snapshot = revisions[revisionIndex].snapshot;
  return {
    ...snapshot,
    updatedAt: new Date().toISOString(),
  };
}
