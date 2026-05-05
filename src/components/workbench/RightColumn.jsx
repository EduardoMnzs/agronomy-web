import { useState } from 'react';
import { BookOpen, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Card = ({ children, className = '' }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
    }}
    className={`bg-white dark:bg-[#323639] border border-gray-200 dark:border-transparent rounded-[12px] p-[14px] shadow-[0_1px_3px_rgba(19,30,41,.06)] dark:shadow-sm flex flex-col transition-colors duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

const MOCK_CITATIONS = [
  {
    ref: '[1]',
    doc_name: 'Embrapa_Calagem_Recomendacoes.pdf',
    page: 42,
    section: 'A fórmula padrão para o cálculo da NC pelo método da Saturação por Bases é: NC (t/ha) = CTC × (V2 - V1) / PRNT',
  },
  {
    ref: '[2]',
    doc_name: 'Manual_Calcario_Dolomítico.pdf',
    page: 17,
    section: 'Recomenda-se a aplicação a lanço com incorporação profunda (0-20 cm), preferencialmente de calcário dolomítico.',
  },
];

function PdfMockViewer({ docName }) {
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);
  const totalPages = 3;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2 shrink-0 gap-1">
        <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate flex-1 font-mono" title={docName}>
          {docName}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom((z) => Math.max(50, z - 25))}
            className="cursor-pointer p-1 rounded text-gray-400 hover:text-[#EC6608] hover:bg-orange-50 dark:hover:bg-[#EC6608]/10 transition-colors"
          >
            <ZoomOut size={13} />
          </button>
          <span className="text-[10px] text-gray-400 font-mono w-8 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(200, z + 25))}
            className="cursor-pointer p-1 rounded text-gray-400 hover:text-[#EC6608] hover:bg-orange-50 dark:hover:bg-[#EC6608]/10 transition-colors"
          >
            <ZoomIn size={13} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-lg bg-gray-100 dark:bg-[#2c3033] flex items-start justify-center p-3">
        <div
          className="bg-white dark:bg-[#3a3f42] rounded shadow-md p-6 text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed"
          style={{ width: `${zoom}%`, minWidth: 160, maxWidth: '100%', transition: 'width 0.2s' }}
        >
          <p className="font-bold text-[#131E29] dark:text-white text-sm mb-3">
            Capítulo 4 — Necessidade de Calagem
          </p>
          <p className="mb-2">
            A <strong className="text-[#EC6608]">necessidade de calagem (NC)</strong> pelo método da saturação por bases leva em conta a CTC do solo, a saturação atual e a desejada para a cultura.
          </p>
          <div className="bg-gray-50 dark:bg-[#2c3033] rounded p-3 font-mono text-xs text-[#EC6608] my-3 border border-gray-200 dark:border-gray-700">
            NC (t/ha) = CTC × (V2 − V1) / PRNT
          </div>
          <p className="mb-2">
            Para soja recomenda-se <strong>V2 = 60%</strong>. Com CTC = 8,5 e V1 = 32, PRNT = 90:
          </p>
          <p className="font-mono text-[#EC6608] font-semibold">NC = 8,5 × (60 − 32) / 90 = 2,64 t/ha</p>
          <p className="mt-3 text-gray-400 dark:text-gray-500 text-[10px]">p. {page} de {totalPages}</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mt-2 shrink-0">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="cursor-pointer p-1 rounded text-gray-400 hover:text-[#EC6608] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={15} />
        </button>
        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="cursor-pointer p-1 rounded text-gray-400 hover:text-[#EC6608] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

export default function RightColumn({ citations }) {
  const activeCitations = (citations && citations.length > 0) ? citations : null;
  const displayCitations = activeCitations ?? MOCK_CITATIONS;
  const hasAnswer = !!activeCitations;
  const previewDoc = displayCitations[0]?.doc_name ?? 'Embrapa_Calagem_Recomendacoes.pdf';

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
      }}
      className="flex flex-col gap-[14px] h-auto lg:h-full overflow-visible lg:overflow-hidden"
    >
      <Card className="flex-1 min-h-[260px] lg:min-h-0 overflow-hidden">
        <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 shrink-0 transition-colors duration-300">
          Visualização
        </h2>
        <div className="flex-1 overflow-hidden">
          <PdfMockViewer docName={previewDoc} />
        </div>
      </Card>

      <Card className="shrink-0 max-h-[280px] overflow-hidden">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">
            Citações
          </h2>
          {!hasAnswer && (
            <span className="text-[10px] text-gray-300 dark:text-gray-600 italic">exemplo</span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {displayCitations.length > 0 ? (
            <motion.div
              key="citations"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 overflow-y-auto pr-1 -mr-1 flex flex-col gap-2"
            >
              {displayCitations.map((source) => (
                <motion.div
                  key={source.ref}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="border border-gray-100 dark:border-[#2c3033] bg-gray-50/50 dark:bg-[#2c3033] rounded-lg p-3 hover:border-orange-200 dark:hover:border-[#EC6608] hover:bg-white dark:hover:bg-[#323639] transition-colors duration-300 cursor-pointer group"
                >
                  <div className="flex items-start gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-[#EC6608] bg-orange-100 dark:bg-[#EC6608]/20 px-1.5 py-0.5 rounded leading-none shrink-0 mt-0.5">
                      {source.ref}
                    </span>
                    <span className="text-xs font-medium text-[#131E29] dark:text-white truncate group-hover:text-[#EC6608] transition-colors duration-300">
                      {source.doc_name}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono ml-auto shrink-0 mt-0.5">
                      p. {source.page}
                    </span>
                  </div>
                  {source.section && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                      {source.section}
                    </p>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-6 gap-3 text-center"
            >
              <BookOpen className="w-5 h-5 text-gray-300 dark:text-gray-600" />
              <p className="text-xs text-gray-400 dark:text-gray-500">
                As citações aparecerão aqui após a resposta.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
