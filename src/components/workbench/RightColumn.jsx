import React from 'react';
import { FileText, ZoomIn, ZoomOut, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '' }) => (
  <motion.div 
    variants={{
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    }}
    className={`bg-white dark:bg-[#323639] border border-gray-200 dark:border-transparent rounded-[12px] p-[14px] shadow-[0_1px_3px_rgba(19,30,41,.06)] dark:shadow-sm flex flex-col transition-colors duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

export default function RightColumn() {
  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
      }}
      className="flex flex-col gap-[14px] h-full overflow-hidden"
    >
      <Card className="shrink-0 h-[260px] !p-0 overflow-hidden flex flex-col border-gray-200 dark:border-[#2c3033] transition-colors duration-300">
        <div className="bg-white dark:bg-[#323639] border-b border-gray-200 dark:border-[#2c3033] p-2 flex items-center justify-between shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-2 overflow-hidden pr-2">
            <FileText className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-xs font-medium text-[#131E29] dark:text-white truncate transition-colors duration-300">Embrapa_Calagem_Recomendacoes.pdf</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-[#2c3033] rounded text-gray-500 dark:text-gray-400 transition-colors duration-300">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono w-8 text-center transition-colors duration-300">100%</span>
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-[#2c3033] rounded text-gray-500 dark:text-gray-400 transition-colors duration-300">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 bg-slate-100/80 dark:bg-[#2c3033] p-4 flex items-start justify-center overflow-auto relative transition-colors duration-300">
          <div className="w-full max-w-[200px] h-[300px] bg-white shadow-md border border-gray-200 dark:border-gray-300 p-4 flex flex-col gap-2 transition-colors duration-300">
            {/* Mock PDF Content (Keep it light to look like paper) */}
            <div className="h-2 w-3/4 bg-gray-200 rounded mb-2"></div>
            <div className="h-1.5 w-full bg-gray-100 rounded"></div>
            <div className="h-1.5 w-full bg-gray-100 rounded"></div>
            <div className="h-1.5 w-5/6 bg-gray-100 rounded"></div>
            
            <div className="mt-4 h-2 w-1/2 bg-gray-200 rounded mb-2"></div>
            <div className="h-1.5 w-full bg-orange-100 border border-orange-200 rounded"></div>
            <div className="h-1.5 w-full bg-orange-100 border border-orange-200 rounded"></div>
            <div className="h-1.5 w-4/5 bg-orange-100 border border-orange-200 rounded"></div>
            <div className="h-1.5 w-full bg-gray-100 rounded mt-2"></div>
          </div>
          
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-gray-800/80 dark:bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-2 transition-colors duration-300">
            <button className="hover:text-[#EC6608] transition-colors"><ChevronLeft className="w-3 h-3" /></button>
            <span>Pág 14 / 42</span>
            <button className="hover:text-[#EC6608] transition-colors"><ChevronRight className="w-3 h-3" /></button>
          </div>
        </div>
      </Card>

      <Card className="flex-1 overflow-hidden">
        <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 shrink-0 transition-colors duration-300">Citações</h2>
        <div className="flex-1 overflow-y-auto pr-3 pl-1 py-1 -mr-3 -ml-1 -my-1 flex flex-col gap-3">
          
          <motion.div 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="border border-gray-100 dark:border-[#2c3033] bg-gray-50/50 dark:bg-[#2c3033] rounded-lg p-3 hover:border-orange-200 dark:hover:border-[#EC6608] hover:bg-white dark:hover:bg-[#323639] transition-colors duration-300 cursor-pointer group"
          >
            <div className="flex items-start gap-2 mb-1.5">
              <span className="text-[10px] font-bold text-[#EC6608] bg-orange-100 dark:bg-[#EC6608]/20 px-1.5 py-0.5 rounded leading-none shrink-0 mt-0.5 transition-colors duration-300">1</span>
              <span className="text-xs font-medium text-[#131E29] dark:text-white truncate group-hover:text-[#EC6608] transition-colors duration-300">Embrapa_Calagem_Recomendacoes.pdf</span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono ml-auto shrink-0 mt-0.5 transition-colors duration-300">p. 14</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed transition-colors duration-300">
              "Para a cultura da soja no bioma Cerrado, o método mais indicado para cálculo da Necessidade de Calagem (NC) é o da Saturação por Bases, utilizando como meta (V2) o valor de 60%..."
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="border border-gray-100 dark:border-[#2c3033] bg-gray-50/50 dark:bg-[#2c3033] rounded-lg p-3 hover:border-orange-200 dark:hover:border-[#EC6608] hover:bg-white dark:hover:bg-[#323639] transition-colors duration-300 cursor-pointer group"
          >
            <div className="flex items-start gap-2 mb-1.5">
              <span className="text-[10px] font-bold text-[#EC6608] bg-orange-100 dark:bg-[#EC6608]/20 px-1.5 py-0.5 rounded leading-none shrink-0 mt-0.5 transition-colors duration-300">2</span>
              <span className="text-xs font-medium text-[#131E29] dark:text-white truncate group-hover:text-[#EC6608] transition-colors duration-300">Manual_Manejo_Solo_Cerrado.pdf</span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono ml-auto shrink-0 mt-0.5 transition-colors duration-300">p. 82</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed transition-colors duration-300">
              "A aplicação deve ser realizada a lanço com incorporação na camada de 0 a 20 cm. O uso de calcário dolomítico é recomendado em solos com teores de Mg inferiores a 0,5 cmolc/dm³."
            </p>
          </motion.div>

        </div>
      </Card>
    </motion.div>
  );
}
