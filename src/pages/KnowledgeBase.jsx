import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  FileText,
  File as FileIcon,
  MoreVertical,
  Trash2,
  Eye,
  Download,
  Calendar,
  Database,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Pencil,
  Tags,
  User as UserIcon,
} from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Header from '../components/layout/Header';
import Toast from '../components/ui/Toast';
import CustomSelect from '../components/ui/CustomSelect';
import TagInput from '../components/ui/TagInput';
import DocumentPreviewModal from '../components/ui/DocumentPreview';
import { documents } from '../api/api';
import useCurrentUser from '../hooks/useCurrentUser';
import useDebounced from '../hooks/useDebounced';

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

const ITEMS_PER_PAGE = 6;

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** i;
  return `${value >= 10 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`;
}

export default function KnowledgeBase() {
  const navigate = useNavigate();
  const { setIsMobileOpen } = useOutletContext();
  const { isAdmin } = useCurrentUser();
  const [searchQuery, setSearchQuery] = useState('');
  // A busca vai ao servidor — debounce evita uma request por tecla.
  const debouncedSearch = useDebounced(searchQuery, 350);
  const [activeCategory, setActiveCategory] = useState([]);
  const [activeType, setActiveType] = useState([]);
  const [activeTags, setActiveTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const mainRef = useRef(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [docToRename, setDocToRename] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [docToTag, setDocToTag] = useState(null);
  const [tagDraft, setTagDraft] = useState([]);
  const [isSavingTags, setIsSavingTags] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'success' });

  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [previewContent, setPreviewContent] = useState(null);

  const handleDownloadClick = async (doc) => {
    try {
      const data = await documents.get(doc.id);
      const url = data?.url;
      if (!url) return;
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      const ext = (data.file_type || doc.file_type || '').toLowerCase();
      let filename = data.original_filename || doc.original_filename || doc.name || 'download';
      if (ext && !filename.toLowerCase().endsWith(`.${ext}`)) {
        filename = `${filename.replace(/\.[^.]+$/, '')}.${ext}`;
      }
      a.download = filename;
      a.click();
      URL.revokeObjectURL(objectUrl);
    } catch {}
  };

  const handlePreviewClick = async (doc) => {
    setPreviewDoc(doc);
    setPreviewContent(null);
    setPreviewError('');
    setPreviewLoading(true);
    try {
      const data = await documents.get(doc.id);
      setPreviewContent(data);
    } catch (err) {
      setPreviewError(err.message || 'Não foi possível carregar o documento.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const [docs, setDocs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const data = await documents.stats();
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchDocs = async (page = 1) => {
    setLoading(true);
    setFetchError('');
    try {
      const params = { page, limit: ITEMS_PER_PAGE };
      if (debouncedSearch) params.search = debouncedSearch;
      // Multi-seleção vai inteira ao servidor (?category=a&category=b).
      if (activeCategory.length) params.category = activeCategory;
      if (activeTags.length) params.tags = activeTags;
      const data = await documents.list(params);
      setDocs(data.items ?? data);
      setTotal(data.total ?? (data.items ?? data).length);
    } catch (err) {
      setFetchError(err.message || 'Erro ao carregar documentos.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      setAvailableTags(await documents.tags());
    } catch {
      setAvailableTags([]);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeCategory, activeType, activeTags]);

  useEffect(() => {
    fetchDocs(currentPage);
  }, [currentPage, debouncedSearch, activeCategory, activeTags]);

  useEffect(() => {
    fetchStats();
    fetchTags();
  }, []);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const filteredDocs = activeType.length > 0
    ? docs.filter(doc => {
        const ext = (doc.file_type || doc.type || '').toLowerCase();
        return activeType.includes(ext) || (activeType.includes('xlsx') && ext === 'xls');
      })
    : docs;

  const clearFilters = () => {
    setSearchQuery('');
    setActiveCategory([]);
    setActiveType([]);
    setActiveTags([]);
  };

  const hasActiveFilters = searchQuery !== '' || activeCategory.length > 0
    || activeType.length > 0 || activeTags.length > 0;

  const handleDeleteClick = (doc) => {
    setDocToDelete(doc);
    setIsDeleteModalOpen(true);
  };

  const handleRenameClick = (doc) => {
    setDocToRename(doc);
    setRenameValue(doc.name || '');
  };

  const handleConfirmRename = async () => {
    const name = renameValue.trim();
    if (!name) return;
    setIsRenaming(true);
    try {
      const updated = await documents.update(docToRename.id, { name });
      setDocs((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      setDocToRename(null);
      setToast({ show: true, title: 'Documento renomeado', message: '', type: 'success' });
    } catch (err) {
      setToast({
        show: true,
        title: 'Erro ao renomear',
        message: err.message || 'Não foi possível renomear o documento.',
        type: 'error',
      });
    } finally {
      setIsRenaming(false);
    }
  };

  const handleTagClick = (doc) => {
    setDocToTag(doc);
    setTagDraft(Array.isArray(doc.tags) ? doc.tags : []);
  };

  const handleConfirmTags = async () => {
    setIsSavingTags(true);
    try {
      const updated = await documents.update(docToTag.id, { tags: tagDraft });
      setDocs((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      setDocToTag(null);
      // Uma tag nova/removida muda a lista global de filtros.
      fetchTags();
      setToast({ show: true, title: 'Tags atualizadas', message: '', type: 'success' });
    } catch (err) {
      setToast({
        show: true,
        title: 'Erro ao salvar tags',
        message: err.message || 'Não foi possível salvar as tags.',
        type: 'error',
      });
    } finally {
      setIsSavingTags(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await documents.remove(docToDelete.id);
      setToast({
        show: true,
        title: 'Documento removido',
        message: 'O arquivo foi excluído da base de conhecimento.',
        type: 'success',
      });
      setIsDeleteModalOpen(false);
      setDocToDelete(null);
      fetchDocs(currentPage);
      fetchStats();
    } catch (err) {
      setToast({
        show: true,
        title: 'Erro ao excluir',
        message: err.message || 'Não foi possível excluir o documento.',
        type: 'error',
      });
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <>
      <Header title="Base de Conhecimento" onOpenMobile={() => setIsMobileOpen(true)} />

        <main ref={mainRef} className="flex-1 p-4 lg:p-8 overflow-y-auto box-border">
          <div className="max-w-7xl mx-auto w-full space-y-6">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#131E29] dark:text-white">Documentos Indexados</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Gerencie e consulte todos os arquivos disponíveis para a IA.
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => navigate('/index-document')}
                  className="cursor-pointer bg-brand hover:bg-brand-dark text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <Plus size={18} />
                  Novo Documento
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: 'Total de Arquivos',
                  value: statsLoading && !stats ? '—' : (stats?.total_files ?? (loading ? '—' : total)),
                  icon: FileText,
                  color: 'text-brand',
                  bg: 'bg-brand/10',
                },
                {
                  label: 'Espaço Utilizado',
                  value: statsLoading && !stats ? '—' : formatBytes(stats?.storage_used_bytes ?? 0),
                  icon: Database,
                  color: 'text-brand',
                  bg: 'bg-brand/10',
                },
                {
                  label: 'Total de Consultas',
                  value: statsLoading && !stats ? '—' : (stats?.total_queries ?? 0).toLocaleString('pt-BR'),
                  icon: Search,
                  color: 'text-brand',
                  bg: 'bg-brand/10',
                },
                {
                  label: 'Saúde da Base',
                  value: statsLoading && !stats ? '—' : `${stats?.health_score ?? 0}%`,
                  icon: CheckCircle2,
                  color: 'text-brand',
                  bg: 'bg-brand/10',
                },
              ].map((kpi, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-[#323639] border border-gray-200 dark:border-gray-700 p-5 rounded-2xl shadow-sm flex items-center gap-4"
                >
                  <div className={`w-12 h-12 rounded-xl ${kpi.bg} flex items-center justify-center shrink-0`}>
                    <kpi.icon className={kpi.color} size={22} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{kpi.label}</p>
                    <p className="text-xl font-black text-[#131E29] dark:text-white mt-0.5">{kpi.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-white dark:bg-[#323639] border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Pesquisar por nome, arquivo ou descrição..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#2c3033] border border-transparent focus:bg-white dark:focus:bg-[#323639] focus:border-brand rounded-xl text-sm text-[#131E29] dark:text-white placeholder-gray-400 outline-none transition-all"
                  />
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-2 ${availableTags.length ? 'lg:grid-cols-3 lg:min-w-[520px]' : 'lg:min-w-[340px]'} gap-3 min-w-0`}>
                  <CustomSelect
                    placeholder="Categorias"
                    value={activeCategory}
                    onChange={setActiveCategory}
                    options={categoryOptions}
                    multiple
                  />
                  <CustomSelect
                    placeholder="Tipos"
                    value={activeType}
                    onChange={setActiveType}
                    options={typeOptions}
                    multiple
                  />
                  {availableTags.length > 0 && (
                    <CustomSelect
                      placeholder="Tags"
                      value={activeTags}
                      onChange={setActiveTags}
                      options={availableTags.map((tag) => ({ value: tag, label: tag }))}
                      multiple
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between min-h-[24px]">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {loading && docs.length === 0 ? 'Carregando...' : `${filteredDocs.length} documentos encontrados`}
              </div>
              <AnimatePresence>
                {hasActiveFilters && (
                  <motion.button
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    onClick={clearFilters}
                    className="cursor-pointer text-xs font-bold text-brand hover:text-brand-dark flex items-center gap-1.5 transition-colors"
                  >
                    <X size={14} />
                    Limpar Filtros
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {fetchError && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-500/10 p-4 rounded-xl">
                <AlertCircle size={16} className="shrink-0" />
                {fetchError}
              </div>
            )}

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {/* Só troca o grid pelo spinner na primeira carga — depois disso a
                  lista anterior fica na tela enquanto o filtro novo carrega. */}
              {loading && docs.length === 0 ? (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center gap-3">
                  <Loader2 size={28} className="animate-spin text-brand" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Carregando documentos...</p>
                </div>
              ) : filteredDocs.length > 0 ? (
                filteredDocs.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} canDelete={isAdmin} canEdit={isAdmin} onDelete={() => handleDeleteClick(doc)} onRename={() => handleRenameClick(doc)} onTags={() => handleTagClick(doc)} onPreview={() => handlePreviewClick(doc)} onDownload={() => handleDownloadClick(doc)} variants={itemVariants} />
                ))
              ) : (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                  <h3 className="text-lg font-bold text-[#131E29] dark:text-white">Nenhum documento encontrado</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                    Tente ajustar sua busca ou filtros para encontrar o que procura.
                  </p>
                </div>
              )}
            </motion.div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4 pb-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="cursor-pointer p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`cursor-pointer w-10 h-10 rounded-xl text-sm font-bold transition-all ${currentPage === i + 1
                        ? 'bg-brand text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="cursor-pointer p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </main>

      <Toast
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        title={toast.title}
        message={toast.message}
        type={toast.type}
      />

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

      <AnimatePresence>
        {docToRename && (
          <ActionModal onClose={() => setDocToRename(null)} title="Renomear documento">
            <input
              type="text"
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmRename(); }}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#2c3033] border border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-[#323639] focus:border-brand rounded-xl text-sm text-[#131E29] dark:text-white outline-none transition-all"
            />
            <ModalActions
              onCancel={() => setDocToRename(null)}
              onConfirm={handleConfirmRename}
              busy={isRenaming}
              disabled={!renameValue.trim()}
              confirmLabel="Salvar"
            />
          </ActionModal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {docToTag && (
          <ActionModal onClose={() => setDocToTag(null)} title="Tags do documento" wide>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
              Rótulos livres para filtrar a base. Enter ou vírgula adiciona; até 12 tags.
            </p>
            <TagInput value={tagDraft} onChange={setTagDraft} />
            <ModalActions
              onCancel={() => setDocToTag(null)}
              onConfirm={handleConfirmTags}
              busy={isSavingTags}
              confirmLabel="Salvar"
            />
          </ActionModal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteModalOpen && docToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 8 }}
              transition={{ duration: 0.18 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-[#323639] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-80 mx-4 text-left"
            >
              <h3 className="text-sm font-semibold text-[#131E29] dark:text-white mb-3">Excluir documento?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                O arquivo <strong className="text-gray-700 dark:text-gray-200">"{docToDelete.name}"</strong> será excluído permanentemente da base de conhecimento.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="cursor-pointer px-4 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#2c3033] hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="cursor-pointer px-4 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-lg transition-colors duration-200 flex items-center gap-1.5"
                >
                  {isDeleting && <Loader2 size={12} className="animate-spin" />}
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** Casca compartilhada dos modais de edição — overlay + card + título. */
function ActionModal({ title, children, onClose, wide = false }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 8 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-[#323639] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 ${wide ? 'w-[26rem]' : 'w-80'} mx-4 text-left`}
      >
        <h3 className="text-sm font-semibold text-[#131E29] dark:text-white mb-4">{title}</h3>
        {children}
      </motion.div>
    </motion.div>
  );
}

function ModalActions({ onCancel, onConfirm, busy, disabled, confirmLabel }) {
  return (
    <div className="flex gap-2 justify-end mt-6">
      <button
        onClick={onCancel}
        className="cursor-pointer px-4 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#2c3033] hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
      >
        Cancelar
      </button>
      <button
        onClick={onConfirm}
        disabled={busy || disabled}
        className="cursor-pointer px-4 py-1.5 text-xs font-semibold text-white bg-brand hover:bg-brand-dark disabled:opacity-50 rounded-lg transition-colors duration-200 flex items-center gap-1.5"
      >
        {busy && <Loader2 size={12} className="animate-spin" />}
        {confirmLabel}
      </button>
    </div>
  );
}

function DocumentCard({ doc, onDelete, onPreview, onDownload, onRename, onTags, canDelete, canEdit, variants }) {
  const [showOptions, setShowOptions] = useState(false);

  const ext = (doc.file_type || doc.type || '').toLowerCase();

  const getFileIcon = (type) => {
    switch (type) {
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
    const raw = doc.indexed_at || doc.created_at || doc.date;
    if (!raw) return '—';
    try {
      return new Date(raw).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return raw;
    }
  })();

  const categoryLabel = CATEGORY_LABELS[doc.category] ?? doc.category ?? '—';
  const tags = Array.isArray(doc.tags) ? doc.tags : [];

  return (
    <motion.div
      variants={variants}
      onClick={onPreview}
      className="cursor-pointer bg-white dark:bg-[#323639] border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group relative"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-[#2c3033] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
          {getFileIcon(ext)}
        </div>
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowOptions(!showOptions); }}
            className="cursor-pointer p-1.5 text-gray-400 hover:text-[#131E29] dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <MoreVertical size={18} />
          </button>

          <AnimatePresence>
            {showOptions && (
              <>
                <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowOptions(false); }} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 mt-1 w-48 bg-white dark:bg-[#323639] border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden"
                >
                  <button
                    onClick={() => { onPreview(); setShowOptions(false); }}
                    className="cursor-pointer w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
                  >
                    <Eye size={16} /> Visualizar
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDownload(); setShowOptions(false); }}
                    className="cursor-pointer w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
                  >
                    <Download size={16} /> Baixar
                  </button>
                  {canEdit && (
                    <>
                      <div className="h-px bg-gray-100 dark:bg-gray-700 mx-2" />
                      <button
                        onClick={(e) => { e.stopPropagation(); onRename(); setShowOptions(false); }}
                        className="cursor-pointer w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
                      >
                        <Pencil size={16} /> Renomear
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onTags(); setShowOptions(false); }}
                        className="cursor-pointer w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
                      >
                        <Tags size={16} /> Editar tags
                      </button>
                    </>
                  )}
                  {canDelete && (
                    <>
                      <div className="h-px bg-gray-100 dark:bg-gray-700 mx-2" />
                      <button
                        onClick={() => { onDelete(); setShowOptions(false); }}
                        className="cursor-pointer w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"
                      >
                        <Trash2 size={16} /> Excluir
                      </button>
                    </>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-[#131E29] dark:text-white line-clamp-2 leading-tight min-h-[0.75rem]" title={doc.name}>
          {doc.name}
        </h3>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-brand/10 text-brand text-[10px] font-bold uppercase tracking-wider">
            {categoryLabel}
          </span>
          {ext && (
            <span className="text-[10px] text-gray-400 font-medium uppercase">{ext}</span>
          )}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#2c3033] text-gray-600 dark:text-gray-300 text-[10px] font-medium"
              >
                {tag}
              </span>
            ))}
            {tags.length > 4 && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium text-gray-400" title={tags.join(', ')}>
                +{tags.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="pt-3 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <Calendar size={12} />
            <span className="text-[10px] font-medium">{formattedDate}</span>
          </div>
          {doc.indexed_by_name && (
            <div className="flex items-center gap-1 text-gray-400 min-w-0" title={`Indexado por ${doc.indexed_by_name}`}>
              <UserIcon size={11} className="shrink-0" />
              <span className="text-[10px] font-medium truncate">{doc.indexed_by_name}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
