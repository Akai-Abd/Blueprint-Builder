'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAllBlueprints,
  deleteBlueprint,
  duplicateBlueprint,
  type SavedBlueprint,
} from '@/lib/autoSave';
import { createEmptyBlueprint } from '@/types/blueprint';
import { saveBlueprint, setCurrentBlueprintId } from '@/lib/autoSave';
import { getOverallProgress } from '@/lib/progressEngine';
import { importFromJSON } from '@/lib/exportEngine';
import { DashboardSkeleton } from '@/components/LoadingSkeleton';
import Image from 'next/image';

type StatusFilter = 'all' | 'draft' | 'complete';

export default function DashboardPage() {
  const router = useRouter();
  const [blueprints, setBlueprints] = useState<SavedBlueprint[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);
  const deleteDialogRef = useRef<HTMLDivElement>(null);

  // Load blueprints on mount
  useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect -- hydration guard requires setState
    setBlueprints(getAllBlueprints());
  }, []);

  const filtered = useMemo(() => {
    let items = blueprints;
    if (statusFilter !== 'all') {
      items = items.filter((s) => s.blueprint.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (s) =>
          s.blueprint.basics.name.toLowerCase().includes(q) ||
          s.blueprint.basics.description.toLowerCase().includes(q) ||
          s.blueprint.basics.category.toLowerCase().includes(q)
      );
    }
    return items;
  }, [blueprints, search, statusFilter]);

  const handleCreate = useCallback(() => {
    const bp = createEmptyBlueprint();
    saveBlueprint(bp);
    setCurrentBlueprintId(bp.id);
    router.push(`/builder?id=${bp.id}`);
  }, [router]);

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/builder?id=${id}`);
    },
    [router]
  );

  const handleDuplicate = useCallback((id: string) => {
    const copy = duplicateBlueprint(id);
    if (copy) {
      setBlueprints(getAllBlueprints());
    }
  }, []);

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteBlueprint(deleteTarget);
    setBlueprints(getAllBlueprints());
    setDeleteTarget(null);
  }, [deleteTarget]);

  const getCompletion = useCallback((saved: SavedBlueprint): number => {
    return getOverallProgress(saved.blueprint).percentage;
  }, []);

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await importFromJSON(file);
    if (result.success && result.blueprint) {
      saveBlueprint(result.blueprint);
      setCurrentBlueprintId(result.blueprint.id);
      router.push(`/builder?id=${result.blueprint.id}`);
    } else {
      alert(result.error ?? 'Failed to import blueprint.');
    }
    // Reset input so the same file can be re-selected
    e.target.value = '';
  }, [router]);

  const handleDeleteKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setDeleteTarget(null);
      return;
    }
    if (e.key === 'Tab') {
      const dialog = deleteDialogRef.current;
      if (!dialog) return;
      const focusables = dialog.querySelectorAll<HTMLElement>('button');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  const formatDate = useCallback((iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  }, []);

  if (!mounted) {
    return (
      <div className="dashboard animate-fade-in">
        <div className="dashboard__header">
          <div className="dashboard__logo">
            <div className="skeleton skeleton--avatar" />
            <div>
              <div className="skeleton skeleton--text-lg" style={{ width: 200 }} />
              <div className="skeleton skeleton--text" style={{ width: 140 }} />
            </div>
          </div>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  const hasBlueprints = blueprints.length > 0;

  return (
    <div className="dashboard animate-fade-in" role="main" aria-label="Blueprint dashboard">
      {/* Header */}
      <div className="dashboard__header">
        <div className="dashboard__logo">
          <div className="dashboard__logo-icon">
            <Image src="/logo-clean.jpg" alt="Blueprint Builder Logo" width={80} height={80} className="logo-glow-effect" />
          </div>
          <div>
            <h1 className="dashboard__title">Blueprint Builder</h1>
            <p className="dashboard__subtitle">
              {hasBlueprints
                ? `${blueprints.length} blueprint${blueprints.length !== 1 ? 's' : ''} saved`
                : 'Create your first project blueprint'}
            </p>
          </div>
        </div>
        <div className="dashboard__header-actions">
          <button
            className="btn btn--ghost"
            onClick={() => importFileRef.current?.click()}
            aria-label="Import blueprint from JSON"
          >
            📥 Import
          </button>
          <input
            ref={importFileRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
          <button className="btn btn--primary" onClick={handleCreate} aria-label="Create new blueprint">
            ＋ New Blueprint
          </button>
        </div>
      </div>

      {/* Toolbar (only if there are blueprints) */}
      {hasBlueprints && (
        <div className="dashboard__toolbar">
          <div className="dashboard__search">
            <span className="dashboard__search-icon" aria-hidden="true">🔍</span>
            <input
              className="dashboard__search-input"
              placeholder="Search blueprints…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search blueprints"
            />
          </div>
          <button
            className={`btn btn--ghost dashboard__filter-btn ${statusFilter === 'all' ? 'dashboard__filter-btn--active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All
          </button>
          <button
            className={`btn btn--ghost dashboard__filter-btn ${statusFilter === 'draft' ? 'dashboard__filter-btn--active' : ''}`}
            onClick={() => setStatusFilter('draft')}
          >
            Drafts
          </button>
          <button
            className={`btn btn--ghost dashboard__filter-btn ${statusFilter === 'complete' ? 'dashboard__filter-btn--active' : ''}`}
            onClick={() => setStatusFilter('complete')}
          >
            Complete
          </button>
        </div>
      )}

      {/* Grid */}
      {hasBlueprints ? (
        <div className="dashboard__grid stagger-enter">
          {/* Create new card */}
          <div
            className="create-card"
            onClick={handleCreate}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
            }}
          >
            <div className="create-card__icon">＋</div>
            <span className="create-card__label">Create New Blueprint</span>
            <span className="create-card__desc">
              Start a new project from scratch
            </span>
          </div>

          {/* Blueprint cards */}
          {filtered.map((saved) => {
            const bp = saved.blueprint;
            const completion = getCompletion(saved);
            const techCount = Object.values(bp.technology).flat().length;
            const featureCount = bp.features.selected.length;

            return (
              <div
                key={bp.id}
                className="blueprint-card"
                onClick={() => handleEdit(bp.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEdit(bp.id);
                }}
              >
                <div className="blueprint-card__header">
                  <span className="blueprint-card__name">
                    {bp.basics.name || 'Untitled Blueprint'}
                  </span>
                  <span
                    className={`blueprint-card__status blueprint-card__status--${bp.status}`}
                  >
                    {bp.status}
                  </span>
                </div>

                {bp.basics.description && (
                  <p className="blueprint-card__desc">{bp.basics.description}</p>
                )}

                <div className="blueprint-card__meta">
                  <span className="blueprint-card__meta-item">
                    🕐 {formatDate(bp.updatedAt)}
                  </span>
                  {techCount > 0 && (
                    <span className="blueprint-card__meta-item">
                      ⚙️ {techCount} tech
                    </span>
                  )}
                  {featureCount > 0 && (
                    <span className="blueprint-card__meta-item">
                      ✨ {featureCount} features
                    </span>
                  )}
                </div>

                <div className="blueprint-card__progress">
                  <div
                    className="blueprint-card__progress-fill"
                    style={{ width: `${completion}%` }}
                  />
                </div>

                <div
                  className="blueprint-card__actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="btn btn--ghost"
                    onClick={() => handleEdit(bp.id)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn--ghost"
                    onClick={() => handleDuplicate(bp.id)}
                  >
                    📋 Duplicate
                  </button>
                  <button
                    className="btn btn--ghost btn--danger"
                    onClick={() => setDeleteTarget(bp.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="dashboard__empty">
          <div className="dashboard__empty-icon flex justify-center">
            <Image src="/logo-clean.jpg" alt="Blueprint Builder Logo" width={128} height={128} className="logo-glow-effect" style={{ opacity: 0.8 }} />
          </div>
          <h2 className="dashboard__empty-title">No Blueprints Yet</h2>
          <p className="dashboard__empty-desc">
            Create your first project blueprint to get started. Define your tech stack,
            features, integrations, and generate implementation-ready documentation.
          </p>
          <button className="btn btn--primary" onClick={handleCreate}>
            ＋ Create Your First Blueprint
          </button>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div
          className="delete-confirm-overlay"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="delete-confirm-dialog animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleDeleteKeyDown}
            ref={deleteDialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-label="Delete confirmation"
          >
            <h3 className="delete-confirm-dialog__title">🗑️ Delete Blueprint</h3>
            <p className="delete-confirm-dialog__message">
              Are you sure you want to delete this blueprint? This action cannot be
              undone and all data will be permanently lost.
            </p>
            <div className="delete-confirm-dialog__actions">
              <button
                className="btn btn--ghost"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button className="btn btn--danger-solid" onClick={handleDelete}>
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
