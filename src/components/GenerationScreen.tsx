'use client';

import { useState, useMemo, useCallback } from 'react';
import { useBlueprintStore } from '@/stores/blueprintStore';
import {
  documentTypes,
  type GeneratedDocument,
} from '@/lib/generation';
import { exportAsZIP } from '@/lib/export';
import {
  LLM_PROVIDERS,
  MODELS_BY_PROVIDER,
  type LLMProvider,
} from '@/lib/aiModels';

interface GenerationScreenProps {
  onBack: () => void;
  onExport?: (docs: GeneratedDocument[]) => void;
}

type GenerationState = 'select' | 'generating' | 'preview';
type DocProgressStatus = 'pending' | 'active' | 'done';

const GENERATION_CONCURRENCY = 3;

function readInitialProvider(): LLMProvider {
  if (typeof window === 'undefined') return 'google';
  const saved = localStorage.getItem('blueprint_llm_provider');
  return saved && (LLM_PROVIDERS as readonly string[]).includes(saved)
    ? (saved as LLMProvider)
    : 'google';
}

function readInitialModelId(provider: LLMProvider): string {
  if (typeof window === 'undefined') return MODELS_BY_PROVIDER[provider][0].id;
  return localStorage.getItem(`blueprint_${provider}_model`) || MODELS_BY_PROVIDER[provider][0].id;
}

function readInitialApiKeys(): Record<LLMProvider, string> {
  if (typeof window === 'undefined') {
    return { google: '', openai: '', anthropic: '', mistral: '', groq: '', cohere: '' };
  }
  return {
    google: localStorage.getItem('blueprint_google_api_key') || '',
    openai: localStorage.getItem('blueprint_openai_api_key') || '',
    anthropic: localStorage.getItem('blueprint_anthropic_api_key') || '',
    mistral: localStorage.getItem('blueprint_mistral_api_key') || '',
    groq: localStorage.getItem('blueprint_groq_api_key') || '',
    cohere: localStorage.getItem('blueprint_cohere_api_key') || '',
  };
}

export default function GenerationScreen({ onBack, onExport }: GenerationScreenProps) {
  const blueprint = useBlueprintStore((s) => s.blueprint);
  const markComplete = useBlueprintStore((s) => s.markComplete);

  const [selectedDocs, setSelectedDocs] = useState<string[]>(
    () => documentTypes.map((d) => d.id),
  );
  const [state, setState] = useState<GenerationState>('select');
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDocument[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [docStatuses, setDocStatuses] = useState<DocProgressStatus[]>([]);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [provider, setProvider] = useState<LLMProvider>(readInitialProvider);
  const [modelId, setModelId] = useState<string>(() => readInitialModelId(readInitialProvider()));
  const [apiKeys, setApiKeys] = useState<Record<LLMProvider, string>>(readInitialApiKeys);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as LLMProvider;
    setProvider(val);
    localStorage.setItem('blueprint_llm_provider', val);

    const savedModel = localStorage.getItem(`blueprint_${val}_model`);
    setModelId(savedModel || MODELS_BY_PROVIDER[val][0].id);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setModelId(val);
    localStorage.setItem(`blueprint_${provider}_model`, val);
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setApiKeys((prev) => ({ ...prev, [provider]: val }));
    localStorage.setItem(`blueprint_${provider}_api_key`, val);
  };

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
      .filter((d): d is (typeof documentTypes)[number] => d !== undefined);

    if (docsToGenerate.length === 0) return;

    setState('generating');
    setDocStatuses(docsToGenerate.map((_, idx) => (idx === 0 ? 'active' : 'pending')));

    const results: GeneratedDocument[] = new Array(docsToGenerate.length);
    const activeApiKey = apiKeys[provider].trim() || undefined;
    let skipNetwork = false;

    const generateOne = async (index: number) => {
      const doc = docsToGenerate[index];
      setDocStatuses((prev) => prev.map((s, idx) => (idx === index ? 'active' : s)));

      if (skipNetwork) {
        results[index] = {
          id: doc.id,
          title: doc.title,
          icon: doc.icon,
          description: doc.description,
          content: doc.generate(blueprint),
        };
        setDocStatuses((prev) => prev.map((s, idx) => (idx === index ? 'done' : s)));
        return;
      }

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blueprint,
            documentTitle: doc.title,
            documentDescription: doc.description,
            apiKey: activeApiKey,
            provider,
            modelId,
          }),
        });

        if (res.status === 401 && !activeApiKey) {
          skipNetwork = true;
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `API returned ${res.status}`);
        }

        const data = await res.json();
        results[index] = {
          id: doc.id,
          title: doc.title,
          icon: doc.icon,
          description: doc.description,
          content: data.text,
        };
      } catch (err) {
        console.error(
          `Failed to generate ${doc.title} via LLM, falling back to static generator:`,
          err,
        );
        results[index] = {
          id: doc.id,
          title: doc.title,
          icon: doc.icon,
          description: doc.description,
          content: doc.generate(blueprint),
        };
      }

      setDocStatuses((prev) => prev.map((s, idx) => (idx === index ? 'done' : s)));
    };

    // Probe first item when no client key is set so 401 skips unnecessary extra requests
    let startIndex = 0;
    if (!activeApiKey) {
      await generateOne(0);
      startIndex = 1;
    }

    let cursor = startIndex;
    const workerCount = Math.min(GENERATION_CONCURRENCY, docsToGenerate.length - startIndex);
    const workers = Array.from({ length: Math.max(workerCount, 0) }, async () => {
      while (cursor < docsToGenerate.length) {
        const idx = cursor++;
        await generateOne(idx);
      }
    });
    await Promise.all(workers);

    markComplete();
    setGeneratedDocs(results);
    setActiveDocId(results[0]?.id ?? null);
    setState('preview');
  }, [selectedDocs, blueprint, apiKeys, provider, modelId, markComplete]);

  const activeDoc = useMemo(
    () => generatedDocs.find((d) => d.id === activeDocId) ?? null,
    [generatedDocs, activeDocId],
  );

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
          </div>
          <div className="generation-screen__actions">
            <button className="btn btn--ghost" onClick={onBack}>← Back to Review</button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', gap: '8px', width: '250px' }}>
                <select
                  value={provider}
                  onChange={handleProviderChange}
                  aria-label="LLM provider"
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    flex: 1,
                  }}
                >
                  <option value="google">Google (Gemini)</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="mistral">Mistral</option>
                  <option value="groq">Groq</option>
                  <option value="cohere">Cohere</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '8px', width: '250px' }}>
                <select
                  value={modelId}
                  onChange={handleModelChange}
                  aria-label="LLM model"
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    flex: 1,
                  }}
                >
                  {MODELS_BY_PROVIDER[provider].map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </div>
              <input
                type="password"
                aria-label="Provider API Key"
                placeholder={`Optional: ${provider.charAt(0).toUpperCase() + provider.slice(1)} API Key`}
                value={apiKeys[provider]}
                onChange={handleApiKeyChange}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  width: '250px',
                }}
              />
              <button
                className="btn btn--primary"
                onClick={handleGenerate}
                disabled={selectedDocs.length === 0}
              >
                🚀 Generate {selectedDocs.length} Document{selectedDocs.length !== 1 ? 's' : ''}
              </button>
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
          <span className="generation-sidebar__count">{generatedDocs.length}</span>
        </div>
        <div className="generation-sidebar__list">
          {generatedDocs.map((doc) => (
            <button
              key={doc.id}
              className={`generation-sidebar__item ${
                activeDocId === doc.id ? 'generation-sidebar__item--active' : ''
              }`}
              onClick={() => setActiveDocId(doc.id)}
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
        {activeDoc ? (
          <>
            <div className="generation-preview__header">
              <div className="generation-preview__title-group">
                <span className="generation-preview__icon">{activeDoc.icon}</span>
                <h2 className="generation-preview__title">{activeDoc.title}</h2>
              </div>
              <div className="generation-preview__actions">
                <button
                  className="btn btn--ghost btn--sm"
                  onClick={handleCopy}
                >
                  {copyFeedback === 'error' ? '❌ Copy failed' : copyFeedback === activeDoc.id ? '✅ Copied!' : '📋 Copy'}
                </button>
                <button className="btn btn--ghost btn--sm" onClick={handleDownload}>
                  ⬇ Download
                </button>
              </div>
            </div>
            <div className="generation-preview__content">
              <pre className="generation-preview__markdown">{activeDoc.content}</pre>
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
