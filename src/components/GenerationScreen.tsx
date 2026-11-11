'use client';

import { useState, useMemo, useCallback } from 'react';
import { useBlueprintStore } from '@/stores/blueprintStore';
import {
  documentTypes,
  generateSingleDocument,
  type DocumentType,
  type GeneratedDocument,
} from '@/lib/generation';
import { exportAsZIP } from '@/lib/export';
import {
  hasConfiguredApiKey,
  type AISettings,
} from '@/lib/aiSettings';
import AISettingsControl, {
  AIModeBadge,
  useAISettings,
} from '@/components/AISettingsControl';
import type { Blueprint } from '@/types/blueprint';

interface GenerationScreenProps {
  onBack: () => void;
  onExport?: (docs: GeneratedDocument[]) => void;
  initialDocs?: GeneratedDocument[];
  onDocsChange?: (docs: GeneratedDocument[]) => void;
}

type GenerationState = 'select' | 'generating' | 'preview';
type DocProgressStatus = 'pending' | 'active' | 'done';

const GENERATION_CONCURRENCY = 3;

interface DocRequestResult {
  doc: GeneratedDocument;
  fellBack: boolean;
  fallbackReason?: string;
  shouldSkipNetwork?: boolean;
}

async function generateOneDocument(params: {
  blueprint: Blueprint;
  docType: DocumentType;
  aiSettings: AISettings;
  skipNetwork?: boolean;
  refinement?: string;
  existingContent?: string;
}): Promise<DocRequestResult> {
  const { blueprint, docType, aiSettings, skipNetwork, refinement, existingContent } = params;
  const fallbackDoc =
    generateSingleDocument(blueprint, docType.id) ?? {
      id: docType.id,
      title: docType.title,
      icon: docType.icon,
      description: docType.description,
      content: docType.generate(blueprint),
    };

  if (skipNetwork) {
    return { doc: fallbackDoc, fellBack: false };
  }

  const activeApiKey = aiSettings.apiKey.trim() || undefined;

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blueprint,
        documentTitle: docType.title,
        documentDescription: docType.description,
        refinement: refinement?.trim() || undefined,
        existingContent,
        apiKey: activeApiKey,
        provider: aiSettings.provider,
        modelId: aiSettings.modelId,
      }),
    });

    if (res.status === 401 && !activeApiKey) {
      // Expected unauthenticated local fallback when no client key is configured
      return { doc: fallbackDoc, fellBack: false, shouldSkipNetwork: true };
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `API returned HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      doc: {
        id: docType.id,
        title: docType.title,
        icon: docType.icon,
        description: docType.description,
        content: data.text,
      },
      fellBack: false,
    };
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'Request failed';
    console.error(
      `Failed to generate ${docType.title} via LLM, falling back to static generator:`,
      err,
    );
    return {
      doc: fallbackDoc,
      fellBack: true,
      fallbackReason: reason,
    };
  }
}

export default function GenerationScreen({
  onBack,
  onExport,
  initialDocs = [],
  onDocsChange,
}: GenerationScreenProps) {
  const blueprint = useBlueprintStore((s) => s.blueprint);
  const markComplete = useBlueprintStore((s) => s.markComplete);
  const aiSettings = useAISettings();
  const isLiveMode = hasConfiguredApiKey(aiSettings);

  const [selectedDocs, setSelectedDocs] = useState<string[]>(() =>
    initialDocs.length > 0
      ? initialDocs.map((d) => d.id)
      : documentTypes.map((d) => d.id),
  );
  const [state, setState] = useState<GenerationState>(
    () => (initialDocs.length > 0 ? 'preview' : 'select'),
  );
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDocument[]>(initialDocs);
  const [activeDocId, setActiveDocId] = useState<string | null>(
    () => initialDocs[0]?.id ?? null,
  );
  const [docStatuses, setDocStatuses] = useState<DocProgressStatus[]>([]);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [refinement, setRefinement] = useState('');
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const toggleDoc = useCallback((id: string) => {
    setSelectedDocs((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedDocs(documentTypes.map((d) => d.id));
  }, []);

  const selectNone = useCallback(() => {
    setSelectedDocs([]);
  }, []);

  const handleGenerate = useCallback(async () => {
    const docsToGenerate = selectedDocs
      .map((id) => documentTypes.find((d) => d.id === id))
      .filter((d): d is DocumentType => d !== undefined);

    if (docsToGenerate.length === 0) return;

    setState('generating');
    setFallbackNotice(null);
    setIsEditing(false);
    setDocStatuses(docsToGenerate.map((_, idx) => (idx === 0 ? 'active' : 'pending')));

    const results: GeneratedDocument[] = new Array(docsToGenerate.length);
    const activeApiKey = aiSettings.apiKey.trim() || undefined;
    let skipNetwork = !activeApiKey;
    let fallbackCount = 0;
    let firstReason: string | undefined;

    const runOne = async (index: number) => {
      const docType = docsToGenerate[index];
      setDocStatuses((prev) => prev.map((s, idx) => (idx === index ? 'active' : s)));

      const outcome = await generateOneDocument({
        blueprint,
        docType,
        aiSettings,
        skipNetwork,
      });

      if (outcome.shouldSkipNetwork) {
        skipNetwork = true;
      }
      if (outcome.fellBack) {
        fallbackCount += 1;
        if (!firstReason && outcome.fallbackReason) {
          firstReason = outcome.fallbackReason;
        }
      }

      results[index] = outcome.doc;
      setDocStatuses((prev) => prev.map((s, idx) => (idx === index ? 'done' : s)));
    };

    // Run first item first when no key is set so unauthenticated 401 probe skips remaining requests
    let startIndex = 0;
    if (!activeApiKey) {
      skipNetwork = false;
      await runOne(0);
      startIndex = 1;
    }

    let cursor = startIndex;
    const workerCount = Math.min(GENERATION_CONCURRENCY, docsToGenerate.length - startIndex);
    const workers = Array.from({ length: Math.max(workerCount, 0) }, async () => {
      while (cursor < docsToGenerate.length) {
        const idx = cursor++;
        await runOne(idx);
      }
    });
    await Promise.all(workers);

    if (fallbackCount > 0) {
      setFallbackNotice(
        `Live AI failed for ${fallbackCount} document${fallbackCount !== 1 ? 's' : ''}${
          firstReason ? ` (${firstReason})` : ''
        } — offline templates were used instead.`,
      );
    }

    markComplete();
    setGeneratedDocs(results);
    onDocsChange?.(results);
    setActiveDocId(results[0]?.id ?? null);
    setState('preview');
  }, [selectedDocs, blueprint, aiSettings, markComplete, onDocsChange]);

  const activeDoc = useMemo(
    () => generatedDocs.find((d) => d.id === activeDocId) ?? null,
    [generatedDocs, activeDocId],
  );

  const handleEditDocContent = useCallback(
    (docId: string, content: string) => {
      const nextDocs = generatedDocs.map((d) =>
        d.id === docId ? { ...d, content } : d,
      );
      setGeneratedDocs(nextDocs);
      onDocsChange?.(nextDocs);
    },
    [generatedDocs, onDocsChange],
  );

  const handleRegenerateDoc = useCallback(async () => {
    if (!activeDoc || regeneratingId) return;
    const docType = documentTypes.find((d) => d.id === activeDoc.id);
    if (!docType) return;

    setRegeneratingId(activeDoc.id);
    const outcome = await generateOneDocument({
      blueprint,
      docType,
      aiSettings,
      skipNetwork: !hasConfiguredApiKey(aiSettings),
      refinement,
      existingContent: refinement.trim() ? activeDoc.content : undefined,
    });

    if (outcome.fellBack) {
      setFallbackNotice(
        `Live AI failed regenerating ${docType.title}${
          outcome.fallbackReason ? ` (${outcome.fallbackReason})` : ''
        } — offline template used instead.`,
      );
    } else if (hasConfiguredApiKey(aiSettings)) {
      setFallbackNotice(null);
    }

    const nextDocs = generatedDocs.map((d) =>
      d.id === activeDoc.id ? outcome.doc : d,
    );
    setGeneratedDocs(nextDocs);
    onDocsChange?.(nextDocs);
    setRefinement('');
    setRegeneratingId(null);
  }, [activeDoc, regeneratingId, blueprint, aiSettings, refinement, generatedDocs, onDocsChange]);

  const handleCopy = useCallback(async () => {
    if (!activeDoc) return;
    try {
      await navigator.clipboard.writeText(activeDoc.content);
      setCopyFeedback(activeDoc.id);
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch {
      setCopyFeedback('error');
      setTimeout(() => setCopyFeedback(null), 3000);
    }
  }, [activeDoc]);

  const handleDownload = useCallback(() => {
    if (!activeDoc) return;
    const blob = new Blob([activeDoc.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDoc.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeDoc]);

  const handleDownloadAll = useCallback(async () => {
    const currentBlueprint = useBlueprintStore.getState().blueprint;
    await exportAsZIP(generatedDocs, currentBlueprint);
  }, [generatedDocs]);

  // ─── Selection View ──────────────────────────────────────────────
  if (state === 'select') {
    return (
      <div className="generation-screen animate-fade-in">
        <div className="generation-screen__header">
          <div>
            <h1 className="generation-screen__title">Generate Documents</h1>
            <p className="generation-screen__subtitle">
              Select which documents to generate from your blueprint.
            </p>
            <div style={{ marginTop: '8px' }}>
              <AIModeBadge settings={aiSettings} />
            </div>
          </div>
          <div className="generation-screen__actions">
            <button className="btn btn--ghost" onClick={onBack}>← Back to Review</button>
            <div className="generation-ai-box">
              <AISettingsControl settings={aiSettings} />
              <div className="generation-ai-box__buttons">
                {generatedDocs.length > 0 && (
                  <button
                    className="btn btn--ghost btn--sm"
                    onClick={() => setState('preview')}
                  >
                    View Saved Docs ({generatedDocs.length})
                  </button>
                )}
                <button
                  className="btn btn--primary"
                  onClick={handleGenerate}
                  disabled={selectedDocs.length === 0}
                >
                  🚀 {isLiveMode ? 'Generate with AI' : 'Generate Templates'} ({selectedDocs.length})
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="generation-select-actions">
          <button className="btn btn--ghost btn--sm" onClick={selectAll}>Select All</button>
          <button className="btn btn--ghost btn--sm" onClick={selectNone}>Deselect All</button>
          <span className="generation-select-count">
            {selectedDocs.length} of {documentTypes.length} selected
          </span>
        </div>

        <div className="generation-doc-grid">
          {documentTypes.map((doc) => {
            const isSelected = selectedDocs.includes(doc.id);
            return (
              <div
                key={doc.id}
                className={`generation-doc-card ${isSelected ? 'generation-doc-card--selected' : ''}`}
                onClick={() => toggleDoc(doc.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleDoc(doc.id);
                  }
                }}
              >
                <div className="generation-doc-card__check">
                  {isSelected ? '✓' : ''}
                </div>
                <span className="generation-doc-card__icon">{doc.icon}</span>
                <h3 className="generation-doc-card__title">{doc.title}</h3>
                <p className="generation-doc-card__desc">{doc.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── Generating View ─────────────────────────────────────────────
  if (state === 'generating') {
    const docsToGenerate = selectedDocs
      .map((id) => documentTypes.find((d) => d.id === id))
      .filter((d): d is (typeof documentTypes)[number] => d !== undefined);
    const doneCount = docStatuses.filter((s) => s === 'done').length;
    const progressPct = docsToGenerate.length > 0
      ? Math.round((doneCount / docsToGenerate.length) * 100)
      : 0;

    return (
      <div className="generation-screen animate-fade-in">
        <div className="generation-progress-view">
          <div className="generation-progress-view__spinner">⚡</div>
          <h2 className="generation-progress-view__title">Generating Documents…</h2>
          <div className="generation-progress-view__bar-wrapper">
            <div className="generation-progress-view__bar">
              <div
                className="generation-progress-view__fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="generation-progress-view__label">
              {doneCount} / {docsToGenerate.length}
            </span>
          </div>
          <div className="generation-progress-view__items">
            {docsToGenerate.map((doc, i) => {
              const status = docStatuses[i] ?? 'pending';
              return (
                <div
                  key={doc.id}
                  className={`generation-progress-item ${
                    status === 'done'
                      ? 'generation-progress-item--done'
                      : status === 'active'
                      ? 'generation-progress-item--active'
                      : ''
                  }`}
                >
                  <span className="generation-progress-item__icon">
                    {status === 'done' ? '✅' : status === 'active' ? '⏳' : '⬜'}
                  </span>
                  <span>{doc.icon} {doc.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─── Preview View ────────────────────────────────────────────────
  return (
    <div className="generation-screen generation-screen--preview animate-fade-in">
      {/* Sidebar with doc list */}
      <div className="generation-sidebar">
        <div className="generation-sidebar__header">
          <h3 className="generation-sidebar__title">📄 Documents</h3>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => {
              setIsEditing(false);
              setState('select');
            }}
            title="Select documents or AI settings"
          >
            ↻ Re-run ({generatedDocs.length})
          </button>
        </div>
        <div className="generation-sidebar__mode">
          <AIModeBadge settings={aiSettings} />
        </div>
        <div className="generation-sidebar__list">
          {generatedDocs.map((doc) => (
            <button
              key={doc.id}
              className={`generation-sidebar__item ${
                activeDocId === doc.id ? 'generation-sidebar__item--active' : ''
              }`}
              onClick={() => {
                setIsEditing(false);
                setActiveDocId(doc.id);
              }}
            >
              <span>{doc.icon}</span>
              <span>{doc.title}</span>
            </button>
          ))}
        </div>
        <div className="generation-sidebar__actions">
          <button className="btn btn--ghost btn--sm" onClick={onBack}>
            ← Back
          </button>
          {onExport && (
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => onExport(generatedDocs)}
            >
              📤 Export
            </button>
          )}
          <button className="btn btn--primary btn--sm" onClick={handleDownloadAll}>
            ⬇ Download All
          </button>
        </div>
      </div>

      {/* Preview panel */}
      <div className="generation-preview">
        {fallbackNotice && (
          <div className="generation-fallback-banner" role="status">
            <span>⚠️ {fallbackNotice}</span>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setFallbackNotice(null)}
              aria-label="Dismiss warning"
            >
              ✕
            </button>
          </div>
        )}
        {activeDoc ? (
          <>
            <div className="generation-preview__header">
              <div className="generation-preview__title-group">
                <span className="generation-preview__icon">{activeDoc.icon}</span>
                <h2 className="generation-preview__title">{activeDoc.title}</h2>
              </div>
              <div className="generation-preview__actions">
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => setIsEditing((prev) => !prev)}
                >
                  {isEditing ? '👁️ Preview' : '✏️ Edit'}
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={handleCopy}
                >
                  {copyFeedback === 'error' ? '❌ Copy failed' : copyFeedback === activeDoc.id ? '✅ Copied!' : '📋 Copy'}
                </button>
                <button type="button" className="btn btn--ghost btn--sm" onClick={handleDownload}>
                  ⬇ Download
                </button>
              </div>
            </div>

            <div className="generation-refine-bar">
              <input
                type="text"
                className="generation-refine-bar__input"
                aria-label="Refinement instruction"
                placeholder={
                  isLiveMode
                    ? 'Refine this doc (e.g., "Focus on webhook retries & RLS")...'
                    : 'Add an API key under Re-run to refine with AI; regenerating now uses updated blueprint template'
                }
                value={refinement}
                onChange={(e) => setRefinement(e.target.value)}
                disabled={!isLiveMode || regeneratingId === activeDoc.id}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleRegenerateDoc();
                  }
                }}
              />
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={handleRegenerateDoc}
                disabled={regeneratingId === activeDoc.id}
              >
                {regeneratingId === activeDoc.id ? '⏳ Regenerating…' : '↻ Regenerate'}
              </button>
            </div>

            <div className="generation-preview__content">
              {isEditing ? (
                <textarea
                  className="generation-preview__editor"
                  aria-label={`Edit ${activeDoc.title} Markdown`}
                  value={activeDoc.content}
                  onChange={(e) => handleEditDocContent(activeDoc.id, e.target.value)}
                />
              ) : (
                <pre className="generation-preview__markdown">{activeDoc.content}</pre>
              )}
            </div>
          </>
        ) : (
          <div className="generation-preview__empty">
            <span>📄</span>
            <p>Select a document to preview</p>
          </div>
        )}
      </div>
    </div>
  );
}
