import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, File as FileIcon, Database, Plus, Trash2, Download, Calendar, Eye,
  Loader2, AlertCircle, CheckCircle2, Clock, X, FileUp, UploadCloud, Search,
} from 'lucide-react';
import Header from '../components/layout/Header';
import CustomSelect from '../components/ui/CustomSelect';
import Toast from '../components/ui/Toast';
import DocumentPreviewModal from '../components/ui/DocumentPreview';
import { myDocuments } from '../api/api';

const CATEGORY_LABELS = {
  solo: 'Solo',
  insumos: 'Insumos',
  sementes: 'Sementes',
  maquinas: 'Máquinas',
  herbicidas: 'Herbicidas',
  historico: 'Histórico',
  outro: 'Outro',
};

const categoryOptions = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }));

const typeOptions = [
  { value: 'pdf', label: 'Documentos (PDF)' },
  { value: 'xlsx', label: 'Planilhas (XLSX/XLS)' },
  { value: 'csv', label: 'Dados (CSV)' },
  { value: 'json', label: 'Estruturados (JSON)' },
  { value: 'docx', label: 'Textos (DOCX)' },
  { value: 'md', label: 'Markdown (MD)' },
];

const persistenceOptions = [
  { value: 'persistent', label: 'Permanentes' },
  { value: 'temporary', label: 'Temporários (24h)' },
];

const statusOptions = [
  { value: 'queued', label: 'Na fila' },
  { value: 'processing', label: 'Processando' },
  { value: 'done', label: 'Concluído' },
  { value: 'error', label: 'Erro' },
];

const STATUS_META = {
  queued: { label: 'Na fila', icon: Clock, cls: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20' },
  processing: { label: 'Processando', icon: Loader2, cls: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20', spin: true },
  done: { label: 'Concluído', icon: CheckCircle2, cls: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20' },
  error: { label: 'Erro', icon: AlertCircle, cls: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20' },
};

export default function MyDocuments() {
  const { setIsMobileOpen } = useOutletContext();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'success' });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState([]);
  const [activeType, setActiveType] = useState([]);
  const [activePersistence, setActivePersistence] = useState([]);
  const [activeStatus, setActiveStatus] = useState([]);

  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [previewContent, setPreviewContent] = useState(null);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await myDocuments.list();
      setDocs(data ?? []);
    } catch (err) {
      setToast({ show: true, title: 'Erro', message: err.message || 'Falha ao carregar.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  useEffect(() => {
    const hasPending = docs.some((d) => d.status === 'queued' || d.status === 'processing');
    if (!hasPending) return;
    const timer = setInterval(async () => {
      try {
        const updated = await myDocuments.list();
        setDocs(updated ?? []);
      } catch {}
    }, 3000);
    return () => clearInterval(timer);
  }, [docs]);

  const handlePreview = async (doc) => {
    setPreviewDoc(doc);
    setPreviewContent(null);
    setPreviewError('');
    setPreviewLoading(true);
    try {
      const data = await myDocuments.get(doc.id);
      setPreviewContent(data);
    } catch (err) {
      setPreviewError(err.message || 'Não foi possível carregar o documento.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const filteredDocs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return docs.filter((d) => {
      if (q && !(d.name || '').toLowerCase().includes(q)) return false;
      if (activeCategory.length && !activeCategory.includes(d.category)) return false;
      if (activeType.length) {
        const ext = (d.file_type || '').toLowerCase();
        const matches = activeType.includes(ext) || (activeType.includes('xlsx') && ext === 'xls');
        if (!matches) return false;
      }
      if (activePersistence.length) {
        const persistent = !d.expires_at;
        if (persistent && !activePersistence.includes('persistent')) return false;
        if (!persistent && !activePersistence.includes('temporary')) return false;
      }
      if (activeStatus.length && !activeStatus.includes(d.status)) return false;
      return true;
    });
  }, [docs, searchQuery, activeCategory, activeType, activePersistence, activeStatus]);

  const hasActiveFilters = searchQuery !== '' || activeCategory.length > 0 || activeType.length > 0 || activePersistence.length > 0 || activeStatus.length > 0;

  const clearFilters = () => {
    setSearchQuery('');
    setActiveCategory([]);
    setActiveType([]);
    setActivePersistence([]);
    setActiveStatus([]);
  };

  const handleDelete = async () => {
    if (!docToDelete) return;
    setIsDeleting(true);
    try {
      await myDocuments.remove(docToDelete.id);
      setToast({ show: true, title: 'Documento removido', message: 'O arquivo foi excluído.', type: 'success' });
      setIsDeleteOpen(false);
      setDocToDelete(null);
      fetchDocs();
    } catch (err) {
      setToast({ show: true, title: 'Erro', message: err.message || 'Falha ao excluir.', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const data = await myDocuments.get(doc.id);
      const url = data?.url;
      if (!url) return;
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      let filename = data.original_filename || doc.original_filename || doc.name || 'download';
      const ext = (data.file_type || doc.file_type || '').toLowerCase();
      if (ext && !filename.toLowerCase().endsWith(`.${ext}`)) {
        filename = `${filename.replace(/\.[^.]+$/, '')}.${ext}`;
      }
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (err) {
      setToast({ show: true, title: 'Erro', message: err.message || 'Falha ao baixar.', type: 'error' });
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  return (
    <>
      <Header title="Meus Documentos" onOpenMobile={() => setIsMobileOpen(true)} />

      <main className="flex-1 p-4 lg:p-8 overflow-y-auto box-border">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto w-full flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#131E29] dark:text-white">Meus Documentos</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Arquivos pessoais para uso apenas nas suas consultas. Não ficam visíveis para outros usuários.
              </p>
            </div>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="cursor-pointer bg-[#EC6608] hover:bg-[#d95d07] text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
            >
              <Plus size={16} />
              Novo documento
            </button>
          </div>

          <div className="bg-white dark:bg-[#323639] border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar por nome do documento..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#2c3033] border border-transparent focus:bg-white dark:focus:bg-[#323639] focus:border-[#EC6608] rounded-xl text-sm text-[#131E29] dark:text-white placeholder-gray-400 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 min-w-0 lg:min-w-[620px]">
                <CustomSelect placeholder="Categorias" value={activeCategory} onChange={setActiveCategory} options={categoryOptions} multiple />
                <CustomSelect placeholder="Tipos" value={activeType} onChange={setActiveType} options={typeOptions} multiple />
                <CustomSelect placeholder="Permanência" value={activePersistence} onChange={setActivePersistence} options={persistenceOptions} multiple />
                <CustomSelect placeholder="Status" value={activeStatus} onChange={setActiveStatus} options={statusOptions} multiple />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between min-h-[24px]">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {filteredDocs.length} de {docs.length} {docs.length === 1 ? 'documento' : 'documentos'}
            </div>
            <AnimatePresence>
              {hasActiveFilters && (
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onClick={clearFilters}
                  className="cursor-pointer text-xs font-bold text-[#EC6608] hover:text-[#d95d07] flex items-center gap-1.5 transition-colors"
                >
                  <X size={14} />
                  Limpar Filtros
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 size={28} className="animate-spin text-[#EC6608]" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Carregando...</p>
            </div>
          ) : docs.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <h3 className="text-base font-semibold text-[#131E29] dark:text-white">Nenhum documento ainda</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                Adicione arquivos pessoais (análises de solo, históricos, laudos) para usar nas suas consultas.
              </p>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <h3 className="text-base font-semibold text-[#131E29] dark:text-white">Nenhum documento encontrado</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                Tente ajustar a busca ou filtros para encontrar o que procura.
              </p>
            </div>
          ) : (
            <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocs.map((doc) => (
                <DocCard
                  key={doc.id}
                  doc={doc}
                  onDelete={() => { setDocToDelete(doc); setIsDeleteOpen(true); }}
                  onDownload={() => handleDownload(doc)}
                  onPreview={() => handlePreview(doc)}
                  variants={itemVariants}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
      </main>

      <Toast
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        title={toast.title}
        message={toast.message}
        type={toast.type}
      />

      <AnimatePresence>
        {isUploadOpen && (
          <UploadModal
            onClose={() => setIsUploadOpen(false)}
            onSuccess={() => {
              setIsUploadOpen(false);
              setToast({ show: true, title: 'Documento enviado', message: 'O processamento começará em instantes.', type: 'success' });
              fetchDocs();
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteOpen && docToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => !isDeleting && setIsDeleteOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.93 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#323639] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-80 mx-4"
            >
              <h3 className="text-sm font-semibold text-[#131E29] dark:text-white mb-3">Excluir documento?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                O documento <strong className="text-gray-700 dark:text-gray-200">"{docToDelete.name}"</strong> será excluído permanentemente.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setIsDeleteOpen(false)}
                  disabled={isDeleting}
                  className="cursor-pointer px-4 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#2c3033] hover:bg-gray-200 rounded-lg disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="cursor-pointer px-4 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-60 flex items-center gap-2"
                >
                  {isDeleting && <Loader2 size={12} className="animate-spin" />}
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewDoc && (
          <DocumentPreviewModal
            doc={previewDoc}
            loading={previewLoading}
            error={previewError}
            content={previewContent}
            onClose={() => setPreviewDoc(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function DocCard({ doc, onDelete, onDownload, onPreview, variants }) {
  const ext = (doc.file_type || '').toLowerCase();
  const statusMeta = STATUS_META[doc.status] ?? STATUS_META.queued;

  const getFileIcon = () => {
    switch (ext) {
      case 'pdf': return <FileText className="text-red-500" />;
      case 'xlsx':
      case 'xls':
      case 'csv': return <Database className="text-green-600" />;
      case 'json': return <FileIcon className="text-amber-500" />;
      case 'docx': return <FileText className="text-blue-500" />;
      case 'md': return <FileText className="text-purple-500" />;
      default: return <FileIcon className="text-gray-400" />;
    }
  };

  const formattedDate = (() => {
    const raw = doc.indexed_at || doc.created_at;
    if (!raw) return '—';
    try {
      return new Date(raw).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return raw;
    }
  })();

  const canPreview = doc.status === 'done';

  return (
    <motion.div
      variants={variants}
      onClick={canPreview ? onPreview : undefined}
      className={`bg-white dark:bg-[#323639] border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group ${canPreview ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-[#2c3033] flex items-center justify-center shadow-inner">
          {getFileIcon()}
        </div>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium border ${statusMeta.cls}`}>
          {statusMeta.label}
        </span>
      </div>

      <h3 className="text-sm font-bold text-[#131E29] dark:text-white line-clamp-2 leading-tight mb-2" title={doc.name}>
        {doc.name}
      </h3>

      <div className="flex items-center gap-2 mb-3">
        <span className="px-2 py-0.5 rounded-md bg-[#EC6608]/10 text-[#EC6608] text-[10px] font-bold uppercase tracking-wider">
          {CATEGORY_LABELS[doc.category] ?? doc.category ?? '—'}
        </span>
        {ext && <span className="text-[10px] text-gray-400 font-medium uppercase">{ext}</span>}
        {doc.expires_at && (
          <span className="text-[10px] text-yellow-600 dark:text-yellow-400 font-medium">• Temporário</span>
        )}
      </div>

      {doc.status === 'error' && doc.status_message && (
        <p className="text-[11px] text-red-600 dark:text-red-400 mb-3 line-clamp-2" title={doc.status_message}>
          {doc.status_message}
        </p>
      )}

      <div className="pt-3 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
          <Calendar size={12} />
          <span className="text-[10px] font-medium">{formattedDate}</span>
        </div>
        <div className="flex items-center gap-1">
          {canPreview && (
            <button
              onClick={(e) => { e.stopPropagation(); onPreview?.(); }}
              title="Visualizar"
              className="cursor-pointer p-1.5 text-gray-400 hover:text-[#EC6608] hover:bg-[#EC6608]/10 rounded-md transition-colors"
            >
              <Eye size={14} />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDownload(); }}
            title="Baixar"
            className="cursor-pointer p-1.5 text-gray-400 hover:text-[#EC6608] hover:bg-[#EC6608]/10 rounded-md transition-colors"
          >
            <Download size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            title="Excluir"
            className="cursor-pointer p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function UploadModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('outro');
  const [description, setDescription] = useState('');
  const [persistent, setPersistent] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  const validExts = ['pdf', 'docx', 'csv', 'xlsx', 'xls', 'json', 'md'];

  const handleFile = (f) => {
    setError('');
    if (!f) return;
    if (f.size > 100 * 1024 * 1024) {
      setError('Arquivo excede 100 MB.');
      return;
    }
    const ext = f.name.split('.').pop().toLowerCase();
    if (!validExts.includes(ext)) {
      setError(`Formato não suportado. Use: ${validExts.join(', ').toUpperCase()}`);
      return;
    }
    setFile(f);
    if (!name) setName(f.name.replace(/\.[^/.]+$/, ''));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Selecione um arquivo.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('name', name);
      fd.append('category', category);
      if (description) fd.append('description', description);
      fd.append('persistent', persistent ? 'true' : 'false');
      await myDocuments.upload(fd);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Falha ao enviar.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={() => !submitting && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#323639] w-full max-w-lg rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/5">
          <h2 className="text-lg font-bold text-[#131E29] dark:text-white">Novo documento pessoal</h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="cursor-pointer p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
            }}
            onClick={() => !file && inputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
              isDragging
                ? 'border-[#EC6608] bg-[#EC6608]/5'
                : file
                ? 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#2c3033] cursor-default'
                : 'border-gray-200 dark:border-gray-700 hover:border-[#EC6608] cursor-pointer'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx,.csv,.xlsx,.xls,.json,.md"
              onChange={(e) => handleFile(e.target.files?.[0])}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-[#323639] border border-gray-200 dark:border-gray-600 flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-[#EC6608]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#131E29] dark:text-white truncate">{file.name}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = ''; }}
                  className="cursor-pointer p-1.5 text-gray-400 hover:text-red-500 rounded-md"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <UploadCloud size={28} className="mx-auto text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  Arraste um arquivo ou <span className="text-[#EC6608]">clique para selecionar</span>
                </p>
                <p className="text-[11px] text-gray-400">PDF, DOCX, CSV, XLSX, JSON, MD (até 100 MB)</p>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como você quer identificar este arquivo"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#2c3033] border border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-[#323639] focus:border-[#EC6608] rounded-lg text-sm text-[#131E29] dark:text-white outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
            <CustomSelect
              fullWidth
              placeholder="Selecione..."
              value={category}
              onChange={setCategory}
              options={categoryOptions}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Descrição (opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#2c3033] border border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-[#323639] focus:border-[#EC6608] rounded-lg text-sm text-[#131E29] dark:text-white outline-none resize-none"
            />
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-[#2c3033] rounded-lg">
            <input
              type="checkbox"
              id="persistent"
              checked={persistent}
              onChange={(e) => setPersistent(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#EC6608]"
            />
            <label htmlFor="persistent" className="flex-1 cursor-pointer">
              <p className="text-sm font-medium text-[#131E29] dark:text-white">Manter permanentemente</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Se desmarcado, o documento é apagado após 24 horas.
              </p>
            </label>
          </div>

          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2 flex items-start gap-2">
              <AlertCircle size={14} className="shrink-0 mt-0.5" /> {error}
            </p>
          )}

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !file}
              className="cursor-pointer bg-[#EC6608] hover:bg-[#d95d07] text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Enviar
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
