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
} from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Header from '../components/layout/Header';
import Toast from '../components/ui/Toast';
import CustomSelect from '../components/ui/CustomSelect';
import { documents } from '../api/api';

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

export default function KnowledgeBase() {
  const navigate = useNavigate();
  const { setIsMobileOpen } = useOutletContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState([]);
  const [activeType, setActiveType] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const mainRef = useRef(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'success' });

  const [docs, setDocs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const fetchDocs = async (page = 1) => {
    setLoading(true);
    setFetchError('');
    try {
      const params = { page, limit: ITEMS_PER_PAGE };
      if (searchQuery) params.search = searchQuery;
      if (activeCategory.length === 1) params.category = activeCategory[0];
      const data = await documents.list(params);
      setDocs(data.items ?? data);
      setTotal(data.total ?? (data.items ?? data).length);
    } catch (err) {
      setFetchError(err.message || 'Erro ao carregar documentos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory, activeType]);

  useEffect(() => {
    fetchDocs(currentPage);
  }, [currentPage, searchQuery, activeCategory]);

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
  };

  const hasActiveFilters = searchQuery !== '' || activeCategory.length > 0 || activeType.length > 0;

  const handleDeleteClick = (doc) => {
    setDocToDelete(doc);
    setIsDeleteModalOpen(true);
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
              <button
                onClick={() => navigate('/index-document')}
                className="cursor-pointer bg-[#EC6608] hover:bg-[#d95d07] text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Plus size={18} />
                Novo Documento
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total de Arquivos', value: loading ? '—' : total, icon: FileText, color: 'text-[#EC6608]', bg: 'bg-[#EC6608]/10' },
                { label: 'Espaço Utilizado', value: '—', icon: Database, color: 'text-[#EC6608]', bg: 'bg-[#EC6608]/10' },
                { label: 'Total de Consultas', value: '—', icon: Search, color: 'text-[#EC6608]', bg: 'bg-[#EC6608]/10' },
                { label: 'Saúde da Base', value: '—', icon: CheckCircle2, color: 'text-[#EC6608]', bg: 'bg-[#EC6608]/10' },
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
                    placeholder="Pesquisar por nome do documento..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#2c3033] border border-transparent focus:bg-white dark:focus:bg-[#323639] focus:border-[#EC6608] rounded-xl text-sm text-[#131E29] dark:text-white placeholder-gray-400 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0 lg:min-w-[340px]">
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
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between min-h-[24px]">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {loading ? 'Carregando...' : `${filteredDocs.length} documentos encontrados`}
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
              {loading ? (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center gap-3">
                  <Loader2 size={28} className="animate-spin text-[#EC6608]" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Carregando documentos...</p>
                </div>
              ) : filteredDocs.length > 0 ? (
                filteredDocs.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} onDelete={() => handleDeleteClick(doc)} variants={itemVariants} />
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
                        ? 'bg-[#EC6608] text-white'
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

function DocumentCard({ doc, onDelete, variants }) {
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

  return (
    <motion.div
      variants={variants}
      className="bg-white dark:bg-[#323639] border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group relative"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-[#2c3033] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
          {getFileIcon(ext)}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="cursor-pointer p-1.5 text-gray-400 hover:text-[#131E29] dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <MoreVertical size={18} />
          </button>

          <AnimatePresence>
            {showOptions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowOptions(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-1 w-48 bg-white dark:bg-[#323639] border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden"
                >
                  <button className="cursor-pointer w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left">
                    <Eye size={16} /> Visualizar
                  </button>
                  <button className="cursor-pointer w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left">
                    <Download size={16} /> Baixar
                  </button>
                  <div className="h-px bg-gray-100 dark:bg-gray-700 mx-2" />
                  <button
                    onClick={() => { onDelete(); setShowOptions(false); }}
                    className="cursor-pointer w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"
                  >
                    <Trash2 size={16} /> Excluir
                  </button>
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
          <span className="px-2 py-0.5 rounded-md bg-[#EC6608]/10 text-[#EC6608] text-[10px] font-bold uppercase tracking-wider">
            {categoryLabel}
          </span>
          {ext && (
            <span className="text-[10px] text-gray-400 font-medium uppercase">{ext}</span>
          )}
        </div>

        <div className="pt-3 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <Calendar size={12} />
            <span className="text-[10px] font-medium">{formattedDate}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
