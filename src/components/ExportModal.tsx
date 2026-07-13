'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { useBlueprintStore } from '@/stores/blueprintStore';
import {
  documentTypes,
  generateDocuments,
  type GeneratedDocument,
} from '@/lib/generationEngine';
import {
  exportAsJSON,
  exportAsMarkdown,
  exportAsPDF,
  exportAsZIP,
  importFromJSON,
  generateShareLink,
} from '@/lib/exportEngine';
import { debouncedSave } from '@/lib/autoSave';

type ExportFormat = 'json' | 'markdown' | 'pdf' | 'zip' | 'share';
type ModalMode = 'export' | 'import';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  generatedDocs?: GeneratedDocument[];
  initialMode?: ModalMode;
}

const FORMAT_INFO: {
  id: ExportFormat;
  label: string;
  icon: string;
  desc: string;
}[] = [
  { id: 'json', label: 'JSON', icon: '📦', desc: 'Raw blueprint data — import later or integrate with tools' },
  { id: 'markdown', label: 'Markdown', icon: '📝', desc: 'All generated documents in a single .md file' },
  { id: 'pdf', label: 'PDF', icon: '📄', desc: 'Print-ready formatted document for sharing' },
  { id: 'zip', label: 'ZIP Archive', icon: '🗂️', desc: 'Bundled .md files + blueprint.json in one download' },
  { id: 'share', label: 'Share Link', icon: '🔗', desc: 'Shareable URL — anyone with the link can import your blueprint' },
];

export default function ExportModal({ isOpen, onClose, generatedDocs, initialMode = 'export' }: ExportModalProps) {
  const blueprint = useBlueprintStore((s) => s.blueprint);
  const loadBlueprint = useBlueprintStore((s) => s.loadBlueprint);
  const [mode, setMode] = useState<ModalMode>(initialMode);
  const [format, setFormat] = useState<ExportFormat>('markdown');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>(
    documentTypes.map((d) => d.id)
  );
  const [exporting, setExporting] = useState(false);

  // Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const needsDocs = format !== 'json' && format !== 'share';
  const [shareLink, setShareLink] = useState('');

  const docs = useMemo(() => {
    if (!needsDocs) return [];
    if (generatedDocs && generatedDocs.length > 0) {
      return generatedDocs.filter((d) => selectedDocIds.includes(d.id));
    }
    const allDocs = generateDocuments(blueprint, documentTypes.map((d) => d.id));
    return allDocs.filter((d) => selectedDocIds.includes(d.id));
  }, [needsDocs, generatedDocs, selectedDocIds, blueprint]);

  const toggleDoc = useCallback((id: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  }, []);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      switch (format) {
        case 'json':
          exportAsJSON(blueprint);
          break;
        case 'markdown':
          exportAsMarkdown(docs);
          break;
        case 'pdf':
          exportAsPDF(docs);
          break;
        case 'zip':
          await exportAsZIP(docs, blueprint);
          break;
        case 'share': {
          const link = generateShareLink(blueprint);
          setShareLink(link);
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(link);
          }
          break;
        }
      }
    } finally {
      setExporting(false);
    }
  }, [format, blueprint, docs]);

  const handleImport = useCallback(async () => {
    if (!importFile) return;
    setImporting(true);
    setImportError(null);
    setImportSuccess(false);

    const result = await importFromJSON(importFile);
    if (result.success && result.blueprint) {
      loadBlueprint(result.blueprint);
      debouncedSave(result.blueprint);
      setImportSuccess(true);
      setTimeout(() => onClose(), 1200);
    } else {
      setImportError(result.error ?? 'Import failed.');
    }
    setImporting(false);
  }, [importFile, loadBlueprint, onClose]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImportError(null);
    setImportSuccess(false);
    if (file) {
      if (!file.name.endsWith('.json')) {
        setImportError('Please select a .json file.');
        setImportFile(null);
      } else {
        setImportFile(file);
      }
    }
  }, []);

  // Focus trap
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key === 'Tab') {
      const modal = modalRef.current;
      if (!modal) return;
      const focusables = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
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
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="export-overlay" onClick={onClose}>
      <div
        className="export-modal animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'export' ? 'Export Blueprint' : 'Import Blueprint'}
      >
        {/* Header */}
        <div className="export-modal__header">
          <div>
            <h2 className="export-modal__title">
              {mode === 'export' ? '📤 Export Blueprint' : '📥 Import Blueprint'}
            </h2>
            <p className="export-modal__subtitle">
              {mode === 'export'
                ? 'Choose a format and select documents to include.'
                : 'Upload a previously exported JSON blueprint file.'}
            </p>
          </div>
          <button className="btn btn--ghost btn--icon" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Mode Tabs */}
        <div className="export-modal__tabs">
          <button
            className={`export-tab ${mode === 'export' ? 'export-tab--active' : ''}`}
            onClick={() => setMode('export')}
          >
            📤 Export
          </button>
          <button
            className={`export-tab ${mode === 'import' ? 'export-tab--active' : ''}`}
            onClick={() => setMode('import')}
          >
            📥 Import
          </button>
        </div>

        {mode === 'export' ? (
          <>
            {/* Format Selection */}
            <div className="export-modal__section">
              <h3 className="export-modal__section-title">Export Format</h3>
              <div className="export-format-grid">
                {FORMAT_INFO.map((f) => (
                  <button
                    key={f.id}
                    className={`export-format-card ${format === f.id ? 'export-format-card--active' : ''}`}
                    onClick={() => setFormat(f.id)}
                  >
                    <span className="export-format-card__icon">{f.icon}</span>
                    <span className="export-format-card__label">{f.label}</span>
                    <span className="export-format-card__desc">{f.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Document Selection (hidden for JSON) */}
            {needsDocs && (
              <div className="export-modal__section">
                <div className="export-modal__section-header">
                  <h3 className="export-modal__section-title">Documents to Include</h3>
                  <div className="export-modal__section-actions">
                    <button
                      className="btn btn--ghost btn--sm"
                      onClick={() => setSelectedDocIds(documentTypes.map((d) => d.id))}
                    >
                      Select All
                    </button>
                    <button
                      className="btn btn--ghost btn--sm"
                      onClick={() => setSelectedDocIds([])}
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                <div className="export-doc-list">
                  {documentTypes.map((doc) => {
                    const isSelected = selectedDocIds.includes(doc.id);
                    return (
                      <label key={doc.id} className="export-doc-item">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleDoc(doc.id)}
                          className="export-doc-item__checkbox"
                        />
                        <span className="export-doc-item__icon">{doc.icon}</span>
                        <span className="export-doc-item__name">{doc.title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Share Link Result */}
            {format === 'share' && shareLink && (
              <div className="export-modal__section">
                <h3 className="export-modal__section-title">Share Link</h3>
                <div className="share-link-box">
                  <input
                    className="form-input share-link-box__input"
                    readOnly
                    value={shareLink}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    className="btn btn--ghost btn--sm"
                    onClick={async () => {
                      await navigator.clipboard.writeText(shareLink);
                    }}
                  >
                    📋 Copy
                  </button>
                </div>
                <p className="form-hint" style={{ marginTop: 'var(--space-xs)' }}>
                  ✅ Link copied to clipboard! Share it with anyone to let them import this blueprint.
                </p>
              </div>
            )}

            {/* Export Actions */}
            <div className="export-modal__footer">
              <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
              <button
                className="btn btn--primary"
                onClick={handleExport}
                disabled={exporting || (needsDocs && selectedDocIds.length === 0)}
              >
                {exporting ? (
                  <>
                    <span className="export-spinner" />
                    {format === 'share' ? 'Generating…' : 'Exporting…'}
                  </>
                ) : format === 'share' ? (
                  <>🔗 Generate Share Link</>
                ) : (
                  <>⬇ Download {FORMAT_INFO.find((f) => f.id === format)?.label}</>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Import Section */}
            <div className="export-modal__section">
              <div className="import-dropzone" onClick={() => fileInputRef.current?.click()}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <span className="import-dropzone__icon">📁</span>
                {importFile ? (
                  <span className="import-dropzone__filename">{importFile.name}</span>
                ) : (
                  <span className="import-dropzone__text">
                    Click to select a <strong>.json</strong> blueprint file
                  </span>
                )}
              </div>

              {importError && (
                <p className="import-message import-message--error" role="alert">
                  ❌ {importError}
                </p>
              )}
              {importSuccess && (
                <p className="import-message import-message--success" role="status">
                  ✅ Blueprint imported successfully! Redirecting…
                </p>
              )}
            </div>

            {/* Import Actions */}
            <div className="export-modal__footer">
              <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
              <button
                className="btn btn--primary"
                onClick={handleImport}
                disabled={!importFile || importing || importSuccess}
              >
                {importing ? (
                  <>
                    <span className="export-spinner" />
                    Importing…
                  </>
                ) : (
                  <>📥 Import Blueprint</>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
