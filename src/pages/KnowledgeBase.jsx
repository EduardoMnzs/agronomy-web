import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  FileText,
  File as FileIcon,
  MoreVertical,
  Trash2,
  Eye,
  Filter,
  Download,
  Calendar,
  Database,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import Toast from '../components/ui/Toast';
import CustomSelect from '../components/ui/CustomSelect';

const categories = [
  { id: 'todos', label: 'Todas as categorias' },
  { id: 'analise_solo', label: 'Análise de Solo' },
  { id: 'relatorio_safra', label: 'Relatório de Safra' },
  { id: 'clima', label: 'Dados Climáticos' },
  { id: 'maquinario', label: 'Manual de Maquinário' },
  { id: 'insumos', label: 'Tabela de Insumos' },
  { id: 'outro', label: 'Outro' },
];

const types = [
  { value: 'todos', label: 'Todos os tipos' },
  { value: 'pdf', label: 'Documentos (PDF)' },
  { value: 'xlsx', label: 'Planilhas (XLSX/XLS)' },
  { value: 'csv', label: 'Dados (CSV)' },
  { value: 'json', label: 'Estruturados (JSON)' },
  { value: 'docx', label: 'Textos (DOCX)' },
];

const dateFilters = [
  { value: 'hoje', label: 'Hoje' },
  { value: 'semana', label: 'Últimos 7 dias' },
  { value: 'mes', label: 'Este mês' },
  { value: 'ano', label: 'Este ano' },
];

const mockDocuments = [
  {
    id: 1,
    name: 'Análise de Solo - Setor Norte 2024',
    category: 'analise_solo',
    categoryLabel: 'Análise de Solo',
    type: 'pdf',
    size: '2.4 MB',
    date: '15 Mai, 2024',
    createdAt: new Date('2024-05-15'),
    owner: 'Eduardo Menezes'
  },
  {
    id: 2,
    name: 'Relatório Safra Milho - Fazenda Esperança',
    category: 'relatorio_safra',
    categoryLabel: 'Relatório de Safra',
    type: 'xlsx',
    size: '1.1 MB',
    date: '12 Mai, 2024',
    createdAt: new Date('2024-05-12'),
    owner: 'Eduardo Menezes'
  },
  {
    id: 3,
    name: 'Histórico Pluviométrico - 2023',
    category: 'clima',
    categoryLabel: 'Dados Climáticos',
    type: 'csv',
    size: '0.8 MB',
    date: '08 Mai, 2024',
    createdAt: new Date('2024-05-08'),
    owner: 'Eduardo Menezes'
  },
  {
    id: 4,
    name: 'Manual Trator John Deere 6150J',
    category: 'maquinario',
    categoryLabel: 'Manual de Maquinário',
    type: 'pdf',
    size: '15.7 MB',
    date: '01 Mai, 2024',
    createdAt: new Date('2024-05-01'),
    owner: 'Eduardo Menezes'
  },
  {
    id: 5,
    name: 'Preços Insumos - Fertilizantes Q2',
    category: 'insumos',
    categoryLabel: 'Tabela de Insumos',
    type: 'json',
    size: '0.2 MB',
    date: '28 Abr, 2024',
    createdAt: new Date('2024-04-28'),
    owner: 'Eduardo Menezes'
  },
  {
    id: 6,
    name: 'Manual de Boas Práticas Agrícolas - 2024',
    category: 'outro',
    categoryLabel: 'Outro',
    type: 'docx',
    size: '0.5 MB',
    date: '20 Mai, 2024',
    createdAt: new Date('2024-05-20'),
    owner: 'Eduardo Menezes'
  },
  {
    id: 7,
    name: 'Manejo de Pragas - Safra Verão',
    category: 'outro',
    categoryLabel: 'Outro',
    type: 'pdf',
    size: '3.1 MB',
    date: '18 Mai, 2024',
    createdAt: new Date('2024-05-18'),
    owner: 'Eduardo Menezes'
  },
  {
    id: 8,
    name: 'Inventário de Defensivos - Galpão 02',
    category: 'insumos',
    categoryLabel: 'Tabela de Insumos',
    type: 'xlsx',
    size: '1.2 MB',
    date: '16 Mai, 2024',
    createdAt: new Date('2024-05-16'),
    owner: 'Eduardo Menezes'
  },
  {
    id: 9,
    name: 'Calibração Pulverizador Case IH 3230',
    category: 'maquinario',
    categoryLabel: 'Manual de Maquinário',
    type: 'pdf',
    size: '2.8 MB',
    date: '14 Mai, 2024',
    createdAt: new Date('2024-05-14'),
    owner: 'Eduardo Menezes'
  },
  {
    id: 10,
    name: 'Custos Produção Soja 24/25',
    category: 'relatorio_safra',
    categoryLabel: 'Relatório de Safra',
    type: 'xlsx',
    size: '0.9 MB',
    date: '10 Mai, 2024',
    createdAt: new Date('2024-05-10'),
    owner: 'Eduardo Menezes'
  },
  {
    id: 11,
    name: 'Análise de Solo - Gleba Santa Rita',
    category: 'analise_solo',
    categoryLabel: 'Análise de Solo',
    type: 'pdf',
    size: '1.8 MB',
    date: '07 Mai, 2024',
    createdAt: new Date('2024-05-07'),
    owner: 'Eduardo Menezes'
  },
  {
    id: 12,
    name: 'Previsão Trimestral - El Niño 2024',
    category: 'clima',
    categoryLabel: 'Dados Climáticos',
    type: 'pdf',
    size: '4.2 MB',
    date: '05 Mai, 2024',
    createdAt: new Date('2024-05-05'),
    owner: 'Eduardo Menezes'
  },
  {
    id: 13,
    name: 'Mapa de Calor - Infestação de Lagarta',
    category: 'outro',
    categoryLabel: 'Outro',
    type: 'json',
    size: '5.6 MB',
    date: '03 Mai, 2024',
    createdAt: new Date('2024-05-03'),
    owner: 'Eduardo Menezes'
  },
  {
    id: 14,
    name: 'Planilha de Irrigação - Pivô 01',
    category: 'clima',
    categoryLabel: 'Dados Climáticos',
    type: 'xlsx',
    size: '0.6 MB',
    date: '01 Mai, 2024',
    createdAt: new Date('2024-05-01'),
    owner: 'Eduardo Menezes'
  },
  {
    id: 15,
    name: 'Certificado de Calibração Balança',
    category: 'outro',
    categoryLabel: 'Outro',
    type: 'pdf',
    size: '1.1 MB',
    date: '29 Abr, 2024',
    createdAt: new Date('2024-04-29'),
    owner: 'Eduardo Menezes'
  },
  {
    id: 16,
    name: 'Cronograma de Plantio - Inverno',
    category: 'relatorio_safra',
    categoryLabel: 'Relatório de Safra',
    type: 'docx',
    size: '0.3 MB',
    date: '27 Abr, 2024',
    createdAt: new Date('2024-04-27'),
    owner: 'Eduardo Menezes'
  },
  {
    id: 17,
    name: 'Análise Foliar - Milho Safrinha',
    category: 'analise_solo',
    categoryLabel: 'Análise de Solo',
    type: 'pdf',
    size: '2.1 MB',
    date: '25 Abr, 2024',
    createdAt: new Date('2024-04-25'),
    owner: 'Eduardo Menezes'
  },
  {
    id: 18,
    name: 'Catálogo de Peças - Plantadeira Tatu',
    category: 'maquinario',
    categoryLabel: 'Manual de Maquinário',
    type: 'pdf',
    size: '12.4 MB',
    date: '23 Abr, 2024',
    createdAt: new Date('2024-04-23'),
    owner: 'Eduardo Menezes'
  }
];

const ITEMS_PER_PAGE = 6;

export default function KnowledgeBase() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState([]);
  const [activeType, setActiveType] = useState([]);
  const [activeDate, setActiveDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const mainRef = React.useRef(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'success' });
  const navigate = useNavigate();

  const filteredDocs = mockDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory.length === 0 || activeCategory.includes('todos') || activeCategory.includes(doc.category);
    const matchesType = activeType.length === 0 || activeType.includes('todos') ||
      activeType.includes(doc.type) ||
      (activeType.includes('xlsx') && doc.type === 'xls');

    let matchesDate = true;
    if (activeDate) {
      const now = new Date();
      const docDate = new Date(doc.createdAt);
      if (activeDate === 'hoje') {
        matchesDate = docDate.toDateString() === now.toDateString();
      } else if (activeDate === 'semana') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        matchesDate = docDate >= weekAgo;
      } else if (activeDate === 'mes') {
        matchesDate = docDate.getMonth() === now.getMonth() && docDate.getFullYear() === now.getFullYear();
      } else if (activeDate === 'ano') {
        matchesDate = docDate.getFullYear() === now.getFullYear();
      }
    }

    return matchesSearch && matchesCategory && matchesType && matchesDate;
  });

  const totalPages = Math.ceil(filteredDocs.length / ITEMS_PER_PAGE);
  const paginatedDocs = filteredDocs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory, activeType, activeDate]);

  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  const clearFilters = () => {
    setSearchQuery('');
    setActiveCategory([]);
    setActiveType([]);
    setActiveDate('');
  };

  const hasActiveFilters = searchQuery !== '' || activeCategory.length > 0 || activeType.length > 0 || activeDate !== '';

  const handleDeleteClick = (doc) => {
    setDocToDelete(doc);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    setToast({
      show: true,
      title: 'Documento removido',
      message: 'O arquivo foi excluído da base de conhecimento.',
      type: 'success'
    });
    setIsDeleteModalOpen(false);
    setDocToDelete(null);
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
    <div className="h-screen w-screen bg-[#F7F7FF] dark:bg-[#2c3033] flex overflow-hidden transition-colors duration-300">
      <Sidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
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
                { label: 'Total de Arquivos', value: mockDocuments.length, icon: FileText, color: 'text-[#EC6608]', bg: 'bg-[#EC6608]/10' },
                { label: 'Espaço Utilizado', value: '45.8 MB', icon: Database, color: 'text-[#EC6608]', bg: 'bg-[#EC6608]/10' },
                { label: 'Total de Consultas', value: '1.240', icon: Search, color: 'text-[#EC6608]', bg: 'bg-[#EC6608]/10' },
                { label: 'Saúde da Base', value: '98.2%', icon: CheckCircle2, color: 'text-[#EC6608]', bg: 'bg-[#EC6608]/10' },
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0 lg:min-w-[500px]">
                  <CustomSelect
                    placeholder="Categorias"
                    value={activeCategory}
                    onChange={setActiveCategory}
                    options={categories.filter(c => c.id !== 'todos').map(c => ({ value: c.id, label: c.label }))}
                    multiple
                  />
                  <CustomSelect
                    placeholder="Tipos"
                    value={activeType}
                    onChange={setActiveType}
                    options={types.filter(t => t.value !== 'todos')}
                    multiple
                  />
                  <CustomSelect
                    placeholder="Todo o período"
                    value={activeDate}
                    onChange={setActiveDate}
                    options={dateFilters}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between min-h-[24px]">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {filteredDocs.length} documentos encontrados
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

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {paginatedDocs.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} onDelete={() => handleDeleteClick(doc)} variants={itemVariants} />
              ))}

              {paginatedDocs.length === 0 && (
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
      </div>

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
                  className="cursor-pointer px-4 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-200"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DocumentCard({ doc, onDelete, variants }) {
  const [showOptions, setShowOptions] = useState(false);

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return <FileText className="text-red-500" />;
      case 'xlsx':
      case 'xls':
      case 'csv': return <Database className="text-green-600" />;
      case 'json': return <FileIcon className="text-amber-500" />;
      case 'docx': return <FileText className="text-blue-500" />;
      default: return <FileIcon className="text-blue-500" />;
    }
  };

  return (
    <motion.div
      variants={variants}
      className="bg-white dark:bg-[#323639] border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group relative"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-[#2c3033] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
          {getFileIcon(doc.type)}
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
            {doc.categoryLabel}
          </span>
          <span className="text-[10px] text-gray-400 font-medium">
            {doc.size}
          </span>
        </div>

        <div className="pt-3 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <Calendar size={12} />
            <span className="text-[10px] font-medium">{doc.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[8px] font-bold text-gray-500 dark:text-gray-400">
              {doc.owner.split(' ').map(n => n[0]).join('')}
            </div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium truncate max-w-[80px]">{doc.owner}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
