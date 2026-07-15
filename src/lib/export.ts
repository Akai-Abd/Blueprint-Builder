'use client';

import type { Blueprint } from '@/types/blueprint';
import type { GeneratedDocument } from '@/lib/generationEngine';

// ─── Export as JSON ──────────────────────────────────────────────────

export function exportAsJSON(blueprint: Blueprint): void {
  const data = JSON.stringify(blueprint, null, 2);
  downloadFile(data, `${sanitize(blueprint.basics.name || 'blueprint')}.json`, 'application/json');
}

// ─── Import from JSON ────────────────────────────────────────────────

export interface ImportResult {
  success: boolean;
  blueprint?: Blueprint;
  error?: string;
}

export async function importFromJSON(file: File): Promise<ImportResult> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    // Validate required top-level fields
    if (!data || typeof data !== 'object') {
      return { success: false, error: 'Invalid JSON structure.' };
    }

    const requiredKeys: (keyof Blueprint)[] = [
      'basics', 'technology', 'features', 'integrations', 'quality',
    ];
    for (const key of requiredKeys) {
      if (!(key in data)) {
        return { success: false, error: `Missing required field: "${key}".` };
      }
    }

    // Validate basics
    if (!data.basics || typeof data.basics.name !== 'string') {
      return { success: false, error: 'Invalid or missing "basics.name".' };
    }

    // Generate a new ID to avoid collisions
    const blueprint: Blueprint = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      activeSection: data.activeSection ?? 'project-basics',
    };

    return { success: true, blueprint };
  } catch {
    return { success: false, error: 'Failed to parse JSON file.' };
  }
}

// ─── Share Link ──────────────────────────────────────────────────────

export function generateShareLink(blueprint: Blueprint): string {
  try {
    const json = JSON.stringify(blueprint);
    const encoded = btoa(unescape(encodeURIComponent(json)));
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    return `${base}/builder?shared=${encodeURIComponent(encoded)}`;
  } catch {
    return '';
  }
}

export function loadFromShareLink(encoded: string): Blueprint | null {
  try {
    const json = decodeURIComponent(escape(atob(decodeURIComponent(encoded))));
    const data = JSON.parse(json);
    if (!data?.basics) return null;
    return {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
    };
  } catch {
    return null;
  }
}

// ─── Export as Markdown ──────────────────────────────────────────────

export function exportAsMarkdown(docs: GeneratedDocument[]): void {
  const content = docs
    .map((doc) => `# ${doc.title}\n\n${doc.content}`)
    .join('\n\n---\n\n');
  downloadFile(content, 'blueprint-documents.md', 'text/markdown');
}

// ─── Export as PDF (via print) ───────────────────────────────────────

export function exportAsPDF(docs: GeneratedDocument[]): void {
  const content = docs
    .map((doc) => `<h1>${escapeHtml(doc.title)}</h1>\n${markdownToHtml(doc.content)}`)
    .join('<hr style="page-break-after: always;" />');

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Blueprint Documents</title>
  <style>
    body { font-family: 'Inter', -apple-system, sans-serif; color: #1a1a2e; padding: 40px; line-height: 1.7; max-width: 800px; margin: 0 auto; }
    h1 { color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 32px; }
    h2 { color: #334155; margin-top: 24px; }
    h3 { color: #475569; margin-top: 16px; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.9em; }
    pre { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    ul, ol { padding-left: 24px; }
    li { margin-bottom: 4px; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 32px 0; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
    th { background: #f8fafc; font-weight: 600; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>${content}</body>
</html>`);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 300);
}

// ─── Export as ZIP ───────────────────────────────────────────────────

export async function exportAsZIP(
  docs: GeneratedDocument[],
  blueprint: Blueprint,
): Promise<void> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  // Add each document as an .md file
  for (const doc of docs) {
    zip.file(`${sanitize(doc.id)}.md`, `# ${doc.title}\n\n${doc.content}`);
  }

  // Add raw blueprint JSON
  zip.file('blueprint.json', JSON.stringify(blueprint, null, 2));

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitize(blueprint.basics.name || 'blueprint')}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Helpers ─────────────────────────────────────────────────────────

function downloadFile(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function sanitize(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    || 'blueprint';
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Minimal markdown → HTML converter for print view. */
function markdownToHtml(md: string): string {
  // Escape HTML entities first to prevent XSS, then apply markdown patterns
  const escaped = escapeHtml(md);
  return escaped
    // Code blocks
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr />')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    // Paragraphs (double newlines)
    .replace(/\n\n/g, '</p><p>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}
