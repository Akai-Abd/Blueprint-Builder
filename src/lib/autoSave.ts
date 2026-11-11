'use client';

import { Blueprint } from '@/types/blueprint';
import type { GeneratedDocument } from '@/lib/generation';

// ─── Storage Keys ────────────────────────────────────────────────────

const STORAGE_KEY = 'bb_blueprints';
const CURRENT_ID_KEY = 'bb_current_blueprint_id';
const GENERATED_DOCS_PREFIX = 'bb_generated_docs_';

export const EMPTY_GENERATED_DOCS: GeneratedDocument[] = [];
const docsSnapshotCache = new Map<string, { raw: string; docs: GeneratedDocument[] }>();
const docsListeners = new Set<() => void>();

function notifyDocsChanged(): void {
  for (const listener of docsListeners) {
    listener();
  }
}

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

/** Delete a blueprint by ID along with its cached generated documents. */
export function deleteBlueprint(id: string): void {
  writeAll(readAll().filter((s) => s.blueprint.id !== id));
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`${GENERATED_DOCS_PREFIX}${id}`);
    docsSnapshotCache.delete(id);
    notifyDocsChanged();
  }
  // Clear current ID if it matches
  if (getCurrentBlueprintId() === id) {
    clearCurrentBlueprintId();
  }
}

/** Duplicate a blueprint (including generated docs if present), returning the new copy. */
export function duplicateBlueprint(id: string): Blueprint | null {
  const original = getBlueprint(id);
  if (!original) return null;
  const copy: Blueprint = JSON.parse(JSON.stringify(original.blueprint));
  copy.id = crypto.randomUUID();
  copy.createdAt = new Date().toISOString();
  copy.updatedAt = new Date().toISOString();
  copy.basics.name = `${original.blueprint.basics.name || 'Untitled'} (Copy)`;
  saveBlueprint(copy);
  const docs = getGeneratedDocs(id);
  if (docs.length > 0) {
    saveGeneratedDocs(copy.id, docs);
  }
  return copy;
}

// ─── Generated Documents Persistence ─────────────────────────────────

/** Get persisted generated documents for a blueprint (referentially stable snapshot). */
export function getGeneratedDocs(blueprintId: string): GeneratedDocument[] {
  if (typeof window === 'undefined' || !blueprintId) return EMPTY_GENERATED_DOCS;
  const key = `${GENERATED_DOCS_PREFIX}${blueprintId}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      docsSnapshotCache.delete(blueprintId);
      return EMPTY_GENERATED_DOCS;
    }
    const cached = docsSnapshotCache.get(blueprintId);
    if (cached && cached.raw === raw) {
      return cached.docs;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY_GENERATED_DOCS;
    const validDocs = parsed.filter(
      (d): d is GeneratedDocument =>
        Boolean(d) && typeof d.id === 'string' && typeof d.content === 'string',
    );
    docsSnapshotCache.set(blueprintId, { raw, docs: validDocs });
    return validDocs;
  } catch {
    return EMPTY_GENERATED_DOCS;
  }
}

/** Persist generated documents for a blueprint cleanly without polluting share URLs. */
export function saveGeneratedDocs(blueprintId: string, docs: GeneratedDocument[]): void {
  if (typeof window === 'undefined' || !blueprintId) return;
  const key = `${GENERATED_DOCS_PREFIX}${blueprintId}`;
  if (docs.length === 0) {
    localStorage.removeItem(key);
    docsSnapshotCache.delete(blueprintId);
  } else {
    const copy: GeneratedDocument[] = JSON.parse(JSON.stringify(docs));
    const raw = JSON.stringify(copy);
    localStorage.setItem(key, raw);
    docsSnapshotCache.set(blueprintId, { raw, docs: copy });
  }
  notifyDocsChanged();
}

/** Subscribe to generated document changes across screens/tabs. */
export function subscribeGeneratedDocs(listener: () => void): () => void {
  docsListeners.add(listener);
  const handleStorage = (e: StorageEvent) => {
    if (!e.key || e.key.startsWith(GENERATED_DOCS_PREFIX)) {
      listener();
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }
  return () => {
    docsListeners.delete(listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
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
let pendingBlueprint: Blueprint | null = null;
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
  pendingBlueprint = blueprint;
  onSaveStart?.();
  saveTimer = setTimeout(() => {
    flushPendingSave();
  }, delayMs);
}

/** Persist any queued debounced blueprint immediately (e.g. on pagehide/unmount). */
export function flushPendingSave(): void {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  if (!pendingBlueprint) return;
  const toSave = pendingBlueprint;
  pendingBlueprint = null;
  saveBlueprint(toSave);
  setCurrentBlueprintId(toSave.id);
  onSaveEnd?.();
}
