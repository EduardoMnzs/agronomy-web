import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, X, Loader2, AlertCircle, Database } from 'lucide-react';
import { marked } from 'marked';
import * as XLSX from 'xlsx';
import DOMPurify from 'dompurify';

marked.use({ breaks: true, gfm: true });

export const CATEGORY_LABELS = {
  solo: 'Solo',
  insumos: 'Insumos',
  sementes: 'Sementes',
  maquinas: 'Máquinas',
  herbicidas: 'Herbicidas',
  historico: 'Histórico',
  outro: 'Outro',
};

const HIGHLIGHT_CLASS = 'bg-yellow-200 dark:bg-yellow-500/40 text-[#131E29] dark:text-white rounded px-0.5';

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeForMatch(s) {
  return (s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

function findHighlightTokens(raw) {
  if (!raw) return [];
  const text = String(raw).trim();
  if (!text) return [];
  const candidates = [];
  const first = text.split(/[\n.;]/)[0].trim();
  if (first && first.length >= 12) candidates.push(first);
  const words = text.split(/\s+/).filter((w) => w.length >= 4);
  const phrase = words.slice(0, 8).join(' ');
  if (phrase && !candidates.includes(phrase)) candidates.push(phrase);
  return candidates.slice(0, 3);
}

export function SpreadsheetPreview({ sheets, highlight }) {
  const [activeSheet, setActiveSheet] = useState(0);
  const rowRefs = useRef([]);
  if (!sheets || sheets.length === 0) return null;
  const { name, headers, rows } = sheets[activeSheet];

  const normHighlight = normalizeForMatch(highlight || '');

  useEffect(() => {
    if (!normHighlight) return;
    const idx = rows.findIndex((row) =>
      row.some((cell) => normalizeForMatch(String(cell ?? '')).includes(normHighlight.slice(0, 30))),
    );
    if (idx >= 0) {
      setTimeout(() => rowRefs.current[idx]?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 50);
    }
  }, [normHighlight, activeSheet, rows]);

  const isRowMatch = (row) =>
    normHighlight && row.some((cell) => normalizeForMatch(String(cell ?? '')).includes(normHighlight.slice(0, 30)));

  return (
    <div className="w-full flex flex-col" style={{ maxHeight: '500px' }}>
      {sheets.length > 1 && (
        <div className="flex gap-1 px-2 pt-2 border-b border-gray-100 dark:border-gray-700 overflow-x-auto shrink-0">
          {sheets.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveSheet(i)}
              className={`cursor-pointer whitespace-nowrap px-3 py-1.5 text-xs rounded-t-md font-medium border-b-2 transition-colors ${
                i === activeSheet
                  ? 'border-[#EC6608] text-[#EC6608] bg-[#EC6608]/5'
                  : 'border-transparent text-gray-500 hover:text-[#131E29] dark:hover:text-white'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2c3033]">
            <tr>
              <th className="px-2 py-1.5 text-gray-400 font-medium text-right border-b border-r border-gray-200 dark:border-gray-700 min-w-[32px]">#</th>
              {headers.map((h, i) => (
                <th key={i} className="px-3 py-1.5 text-left text-[#131E29] dark:text-gray-200 font-semibold border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => {
              const matched = isRowMatch(row);
              return (
                <tr
                  key={ri}
                  ref={(el) => { rowRefs.current[ri] = el; }}
                  className={
                    matched
                      ? 'bg-yellow-100 dark:bg-yellow-500/20'
                      : ri % 2 === 0
                      ? 'bg-white dark:bg-[#323639]'
                      : 'bg-gray-50/50 dark:bg-[#2c3033]/40'
                  }
                >
                  <td className="px-2 py-1.5 text-gray-400 text-right border-r border-gray-100 dark:border-gray-700 select-none">{ri + 1}</td>
                  {headers.map((_, ci) => (
                    <td key={ci} className="px-3 py-1.5 text-gray-700 dark:text-gray-300 border-r border-gray-100 dark:border-gray-700 whitespace-nowrap">
                      {row[ci] !== undefined && row[ci] !== null ? String(row[ci]) : ''}
                    </td>
                  ))}
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={headers.length + 1} className="px-4 py-8 text-center text-sm text-gray-400">Planilha vazia.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-3 py-2 text-[10px] text-gray-400 border-t border-gray-100 dark:border-gray-700 flex justify-between shrink-0">
        <span>{name}</span>
        <span>{rows.length} linhas · {headers.length} colunas</span>
      </div>
    </div>
  );
}

function HighlightedBlock({ html, highlight, className = '' }) {
  const containerRef = useRef(null);

  const finalHtml = useMemo(() => {
    const cleanHtml = DOMPurify.sanitize(html || '');
    if (!highlight || !cleanHtml) return cleanHtml;
    const tokens = findHighlightTokens(highlight);
    if (!tokens.length) return cleanHtml;
    let result = cleanHtml;
    for (const token of tokens) {
      const escaped = escapeRegExp(token);
      const re = new RegExp(`(?![^<]*>)${escaped}`, 'gi');
      result = result.replace(re, (m) => `<mark class="${HIGHLIGHT_CLASS}" data-ad-highlight>${m}</mark>`);
    }
    return result;
  }, [html, highlight]);

  useEffect(() => {
    if (!highlight || !containerRef.current) return;
    const first = containerRef.current.querySelector('[data-ad-highlight]');
    if (first) {
      setTimeout(() => first.scrollIntoView({ block: 'center', behavior: 'smooth' }), 50);
    }
  }, [finalHtml, highlight]);

  return (
    <div
      ref={containerRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: finalHtml }}
    />
  );
}

function HighlightedText({ text, highlight, className = '' }) {
  const containerRef = useRef(null);

  const html = useMemo(() => {
    const safe = escapeHtml(text || '');
    if (!highlight) return safe;
    const tokens = findHighlightTokens(highlight);
    if (!tokens.length) return safe;
    let result = safe;
    for (const token of tokens) {
      const escaped = escapeRegExp(escapeHtml(token));
      const re = new RegExp(escaped, 'gi');
      result = result.replace(re, (m) => `<mark class="${HIGHLIGHT_CLASS}" data-ad-highlight>${m}</mark>`);
    }
    return result;
  }, [text, highlight]);

  useEffect(() => {
    if (!highlight || !containerRef.current) return;
    const first = containerRef.current.querySelector('[data-ad-highlight]');
    if (first) {
      setTimeout(() => first.scrollIntoView({ block: 'center', behavior: 'smooth' }), 50);
    }
  }, [html, highlight]);

  return (
    <pre
      ref={containerRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function DocumentPreviewBody({ doc, loading, error, content, jumpToPage, highlight, pdfHeight = 600 }) {
  const [blobUrl, setBlobUrl] = useState('');
  const [blobLoading, setBlobLoading] = useState(false);
  const ext = (doc?.file_type || doc?.type || '').toLowerCase();

  const mdHtml = useMemo(() => {
    if (ext !== 'md') return '';
    const text = content?.content ?? content?.text ?? (typeof content === 'string' ? content : '');
    return text ? marked.parse(text) : '';
  }, [content, ext]);

  const jsonText = useMemo(() => {
    if (ext !== 'json') return '';
    const raw = content?.content ?? content?.text ?? (typeof content === 'string' ? content : '');
    if (!raw) return '';
    try { return JSON.stringify(JSON.parse(raw), null, 2); } catch { return raw; }
  }, [content, ext]);

  const csvSheets = useMemo(() => {
    if (ext !== 'csv') return null;
    const raw = content?.content ?? content?.text ?? (typeof content === 'string' ? content : '');
    if (!raw) return null;
    try {
      const wb = XLSX.read(raw, { type: 'string' });
      return wb.SheetNames.map((name) => {
        const ws = wb.Sheets[name];
        const json = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        const headers = json[0] ? json[0].map(String) : [];
        const rows = json.slice(1).filter((r) => r.some((c) => c !== ''));
        return { name, headers, rows };
      });
    } catch {
      return null;
    }
  }, [content, ext]);

  const plainText = useMemo(() => {
    if (!['txt', 'docx'].includes(ext)) return '';
    return content?.content ?? content?.text ?? (typeof content === 'string' ? content : '');
  }, [content, ext]);

  const pdfUrl = useMemo(() => {
    if (ext !== 'pdf') return '';
    return content?.url ?? content?.file_url ?? '';
  }, [content, ext]);

  useEffect(() => {
    if (!pdfUrl) return;
    let objectUrl;
    setBlobLoading(true);
    fetch(pdfUrl)
      .then((r) => r.blob())
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      })
      .catch(() => {})
      .finally(() => setBlobLoading(false));
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [pdfUrl]);

  const pdfSrc = useMemo(() => {
    if (!blobUrl) return '';
    const page = Number(jumpToPage);
    return Number.isFinite(page) && page > 0 ? `${blobUrl}#page=${page}` : blobUrl;
  }, [blobUrl, jumpToPage]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400 py-10">
        <Loader2 size={24} className="animate-spin text-[#EC6608]" />
        <p className="text-xs">Carregando documento...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-red-500 py-10">
        <AlertCircle size={22} />
        <p className="text-xs text-center">{error}</p>
      </div>
    );
  }
  if (!content) return null;

  return (
    <>
      {ext === 'pdf' && pdfUrl && (
        blobLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Loader2 size={24} className="animate-spin text-[#EC6608]" />
            <p className="text-xs text-gray-400">Carregando PDF...</p>
          </div>
        ) : pdfSrc ? (
          <iframe
            key={pdfSrc}
            src={pdfSrc}
            title={doc.name}
            className="w-full rounded-lg border border-gray-100 dark:border-gray-700"
            style={{ height: pdfHeight }}
          />
        ) : null
      )}
      {ext === 'pdf' && !pdfUrl && (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
          <FileText size={32} className="text-gray-300 dark:text-gray-600" />
          <p className="text-xs text-center">Pré-visualização de PDF não disponível.</p>
        </div>
      )}
      {ext === 'md' && mdHtml && (
        <HighlightedBlock html={mdHtml} highlight={highlight} className="prose-answer text-xs" />
      )}
      {ext === 'json' && jsonText && (
        <HighlightedText
          text={jsonText}
          highlight={highlight}
          className="text-[11px] text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all font-mono bg-gray-50 dark:bg-[#2c3033] p-3 rounded-lg leading-relaxed"
        />
      )}
      {ext === 'csv' && csvSheets && (
        <div className="rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700">
          <SpreadsheetPreview sheets={csvSheets} highlight={highlight} />
        </div>
      )}
      {ext === 'csv' && !csvSheets && (
        <p className="text-xs text-gray-400 p-3">Não foi possível renderizar o CSV.</p>
      )}
      {['txt', 'docx'].includes(ext) && plainText && (
        <HighlightedText
          text={plainText}
          highlight={highlight}
          className="text-[11px] text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-[#2c3033] p-3 rounded-lg leading-relaxed"
        />
      )}
      {['xlsx', 'xls'].includes(ext) && (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
          <Database size={32} className="text-gray-300 dark:text-gray-600" />
          <p className="text-xs text-center">Planilhas não possuem pré-visualização.</p>
        </div>
      )}
      {!['pdf', 'md', 'json', 'csv', 'txt', 'docx', 'xlsx', 'xls'].includes(ext) && (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
          <FileText size={32} className="text-gray-300 dark:text-gray-600" />
          <p className="text-xs text-center">Pré-visualização indisponível.</p>
        </div>
      )}
    </>
  );
}

export default function DocumentPreviewModal({ doc, loading, error, content, onClose, jumpToPage, highlight }) {
  const ext = (doc.file_type || doc.type || '').toLowerCase();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#323639] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col w-full max-w-4xl max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <FileText size={18} className="text-[#EC6608] shrink-0" />
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-[#131E29] dark:text-white truncate">{doc.name}</h3>
              <p className="text-[10px] text-gray-400 uppercase font-medium mt-0.5">
                {CATEGORY_LABELS[doc.category] ?? doc.category} · {ext}
                {jumpToPage ? <span className="ml-2 text-[#EC6608]">· pág. {jumpToPage}</span> : null}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-1.5 rounded-lg text-gray-400 hover:text-[#131E29] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors ml-4 shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5 min-h-0">
          <DocumentPreviewBody
            doc={doc}
            loading={loading}
            error={error}
            content={content}
            jumpToPage={jumpToPage}
            highlight={highlight}
            pdfHeight={600}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
