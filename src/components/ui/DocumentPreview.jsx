import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, X, Loader2, AlertCircle, Database } from 'lucide-react';
import { marked } from 'marked';
import * as XLSX from 'xlsx';

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

export function SpreadsheetPreview({ sheets }) {
  const [activeSheet, setActiveSheet] = useState(0);
  if (!sheets || sheets.length === 0) return null;
  const { name, headers, rows } = sheets[activeSheet];
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
            {rows.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? 'bg-white dark:bg-[#323639]' : 'bg-gray-50/50 dark:bg-[#2c3033]/40'}>
                <td className="px-2 py-1.5 text-gray-400 text-right border-r border-gray-100 dark:border-gray-700 select-none">{ri + 1}</td>
                {headers.map((_, ci) => (
                  <td key={ci} className="px-3 py-1.5 text-gray-700 dark:text-gray-300 border-r border-gray-100 dark:border-gray-700 whitespace-nowrap">
                    {row[ci] !== undefined && row[ci] !== null ? String(row[ci]) : ''}
                  </td>
                ))}
              </tr>
            ))}
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

export default function DocumentPreviewModal({ doc, loading, error, content, onClose }) {
  const [blobUrl, setBlobUrl] = useState('');
  const [blobLoading, setBlobLoading] = useState(false);
  const ext = (doc.file_type || doc.type || '').toLowerCase();

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
              <p className="text-[10px] text-gray-400 uppercase font-medium mt-0.5">{CATEGORY_LABELS[doc.category] ?? doc.category} · {ext}</p>
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
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
              <Loader2 size={28} className="animate-spin text-[#EC6608]" />
              <p className="text-sm">Carregando documento...</p>
            </div>
          )}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-red-500">
              <AlertCircle size={28} />
              <p className="text-sm">{error}</p>
            </div>
          )}
          {!loading && !error && content && (
            <div>
              {ext === 'pdf' && pdfUrl && (
                blobLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Loader2 size={28} className="animate-spin text-[#EC6608]" />
                    <p className="text-sm text-gray-400">Carregando PDF...</p>
                  </div>
                ) : blobUrl ? (
                  <iframe
                    src={blobUrl}
                    title={doc.name}
                    className="w-full rounded-lg border border-gray-100 dark:border-gray-700"
                    style={{ height: '600px' }}
                  />
                ) : null
              )}
              {ext === 'pdf' && !pdfUrl && (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                  <FileText size={40} className="text-gray-300 dark:text-gray-600" />
                  <p className="text-sm text-center">Pré-visualização de PDF não disponível. Use a opção Baixar para acessar o arquivo.</p>
                </div>
              )}
              {ext === 'md' && mdHtml && (
                <div className="prose-answer" dangerouslySetInnerHTML={{ __html: mdHtml }} />
              )}
              {ext === 'json' && jsonText && (
                <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all font-mono bg-gray-50 dark:bg-[#2c3033] p-4 rounded-xl leading-relaxed">{jsonText}</pre>
              )}
              {ext === 'csv' && csvSheets && (
                <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700" style={{ fontSize: '100%' }}>
                  <SpreadsheetPreview sheets={csvSheets} />
                </div>
              )}
              {ext === 'csv' && !csvSheets && (
                <p className="text-xs text-gray-400 p-4">Não foi possível renderizar o CSV.</p>
              )}
              {['txt', 'docx'].includes(ext) && plainText && (
                <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-[#2c3033] p-4 rounded-xl leading-relaxed">{plainText}</pre>
              )}
              {['xlsx', 'xls'].includes(ext) && (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                  <Database size={40} className="text-gray-300 dark:text-gray-600" />
                  <p className="text-sm text-center font-medium text-gray-500 dark:text-gray-400">Planilhas não possuem pré-visualização.</p>
                  <p className="text-xs text-center max-w-xs">Use a opção <strong>Baixar</strong> para abrir no Excel ou Google Sheets.</p>
                </div>
              )}
              {!['pdf', 'md', 'json', 'csv', 'txt', 'docx', 'xlsx', 'xls'].includes(ext) && (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                  <FileText size={40} className="text-gray-300 dark:text-gray-600" />
                  <p className="text-sm text-center">Pré-visualização não disponível para este tipo de arquivo.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
