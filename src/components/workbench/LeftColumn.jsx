import React, { useState } from 'react';
import { Database, FileText } from 'lucide-react';
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

export default function LeftColumn() {
  const [baseDocs, setBaseDocs] = useState({
    'Manual_Manejo_Solo_Cerrado.pdf': true,
    'Catalogo_Sementes_Soja_2026.pdf': true,
    'Embrapa_Calagem_Recomendacoes.pdf': false,
    'Herbicidas_Pre_Emergentes.pdf': false
  });

  const [myDocs, setMyDocs] = useState({
    'analise_solo_talhao_7.pdf': true,
    'fotos_lavoura_aerea.pdf': false,
    'registros_aplicacao.csv': false
  });

  const handleSelectAll = () => {
    setBaseDocs(Object.keys(baseDocs).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    setMyDocs(Object.keys(myDocs).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
  };

  const handleClear = () => {
    setBaseDocs(Object.keys(baseDocs).reduce((acc, key) => ({ ...acc, [key]: false }), {}));
    setMyDocs(Object.keys(myDocs).reduce((acc, key) => ({ ...acc, [key]: false }), {}));
  };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
      }}
      className="flex flex-col gap-[14px] h-full overflow-hidden"
    >
      <Card className="shrink-0">
        <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 transition-colors duration-300">Contexto</h2>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400 transition-colors duration-300">Cultura</span>
            <span className="font-semibold text-[#131E29] dark:text-white transition-colors duration-300">Soja</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400 transition-colors duration-300">Região</span>
            <span className="font-semibold text-[#131E29] dark:text-white transition-colors duration-300">MS — Cerrado</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400 transition-colors duration-300">pH</span>
            <span className="font-mono font-semibold text-[#131E29] dark:text-white transition-colors duration-300">4.8</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400 transition-colors duration-300">V%</span>
            <span className="font-mono font-semibold text-[#131E29] dark:text-white transition-colors duration-300">32</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400 transition-colors duration-300">CTC</span>
            <span className="font-mono font-semibold text-[#131E29] dark:text-white transition-colors duration-300">8.5</span>
          </div>
        </div>
      </Card>

      <Card className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center mb-3 shrink-0">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">Documentos</h2>
          <div className="flex items-center gap-2">
            <button onClick={handleSelectAll} className="cursor-pointer text-[10px] text-gray-400 hover:text-[#EC6608] dark:hover:text-[#EC6608] transition-colors">Tudo</button>
            <span className="text-gray-300 dark:text-gray-600 text-[10px]">|</span>
            <button onClick={handleClear} className="cursor-pointer text-[10px] text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">Limpar</button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 -mr-2 flex flex-col gap-5">
          <div>
            <h3 className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-2.5 flex items-center gap-1.5 uppercase transition-colors duration-300">
              Base de conhecimento
            </h3>
            <div className="flex flex-col gap-2.5">
              {Object.entries(baseDocs).map(([doc, checked]) => (
                <label key={doc} className="flex items-start gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={checked}
                    onChange={() => setBaseDocs({ ...baseDocs, [doc]: !checked })}
                    className="mt-[3px] w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2c3033] accent-[#EC6608] transition-colors duration-300 cursor-pointer" 
                  />
                  <span className="text-sm text-[#131E29] dark:text-gray-200 group-hover:text-[#EC6608] truncate transition-colors duration-300">
                    {doc}
                  </span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-2.5 flex items-center gap-1.5 uppercase transition-colors duration-300">
              Meus documentos
            </h3>
            <div className="flex flex-col gap-2.5">
              {Object.entries(myDocs).map(([doc, checked]) => (
                <label key={doc} className="flex items-start gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={checked}
                    onChange={() => setMyDocs({ ...myDocs, [doc]: !checked })}
                    className="mt-[3px] w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2c3033] accent-[#EC6608] transition-colors duration-300 cursor-pointer" 
                  />
                  <span className="text-sm text-[#131E29] dark:text-gray-200 group-hover:text-[#EC6608] truncate transition-colors duration-300">
                    {doc}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
