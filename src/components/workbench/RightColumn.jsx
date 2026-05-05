import { BookOpen, FileText } from 'lucide-react';
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

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-6">
      <Icon className="w-5 h-5 text-gray-300 dark:text-gray-600" />
      <p className="text-xs text-gray-400 dark:text-gray-500 max-w-[180px]">{text}</p>
    </div>
  );
}

export default function RightColumn({ citations }) {
  const hasCitations = citations && citations.length > 0;
  const previewDoc = hasCitations ? citations[0].doc_name : null;

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
      <Card className="flex-[3] min-h-[200px] lg:min-h-0 overflow-hidden">
        <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 shrink-0 transition-colors duration-300">
          Visualização
        </h2>
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {hasCitations ? (
              <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate font-mono mb-2 shrink-0" title={previewDoc}>
                  {previewDoc}
                </span>
                <div className="flex-1 overflow-auto rounded-lg bg-gray-100 dark:bg-[#2c3033] flex items-start justify-center p-3">
                  <div className="bg-white dark:bg-[#3a3f42] rounded shadow-md p-4 text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed w-full">
                    <p className="text-xs font-semibold text-[#131E29] dark:text-white mb-2">{previewDoc}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Selecione uma citação para visualizar o trecho do documento.
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty-preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                <EmptyState icon={FileText} text="A visualização das fontes aparecerá aqui após a primeira resposta." />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      <Card className="flex-[2] min-h-[160px] lg:min-h-0 overflow-hidden">
        <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 shrink-0 transition-colors duration-300">
          Citações
        </h2>

        <AnimatePresence mode="wait">
          {hasCitations ? (
            <motion.div
              key="citations"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 overflow-y-auto pr-1 -mr-1 flex flex-col gap-2"
            >
              {citations.map((source, i) => (
                <motion.div
                  key={`${source.doc_name}:${source.page}:${i}`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="border border-gray-100 dark:border-[#2c3033] bg-gray-50/50 dark:bg-[#2c3033] rounded-lg p-3 hover:border-orange-200 dark:hover:border-[#EC6608] hover:bg-white dark:hover:bg-[#323639] transition-colors duration-300 cursor-pointer group"
                >
                  <div className="flex items-start gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-[#EC6608] bg-orange-100 dark:bg-[#EC6608]/20 px-1.5 py-0.5 rounded leading-none shrink-0 mt-0.5">
                      {source.ref ?? `[${i + 1}]`}
                    </span>
                    <span className="text-xs font-medium text-[#131E29] dark:text-white truncate group-hover:text-[#EC6608] transition-colors duration-300">
                      {source.doc_name}
                    </span>
                    {source.page && (
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono ml-auto shrink-0 mt-0.5">
                        p. {source.page}
                      </span>
                    )}
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
              className="flex-1 flex flex-col items-center justify-center py-6 gap-3 text-center"
            >
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
