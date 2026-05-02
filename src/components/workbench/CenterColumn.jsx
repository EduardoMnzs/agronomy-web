import React, { useState, useEffect } from 'react';
import { Send, Mic, Sparkles, CheckCircle2, MessageSquareText, Sprout, Bug, FlaskConical, CloudRain, Loader2, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import agronomyLogo from '../../assets/images/Agronomy-logo.png';


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

const thinkingSteps = [
  "Buscando contexto na base de conhecimento...",
  "Analisando manuais e recomendações...",
  "Cruzando com os dados do seu talhão...",
  "Elaborando a resposta..."
];

export default function CenterColumn({ onFocusClick, onAnswered }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('idle');

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { staggerChildren: 0.1 }
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };
  const [activeChip, setActiveChip] = useState('contexto');
  const [stepIndex, setStepIndex] = useState(0);

  const chips = [
    { id: 'todos', label: 'Todos os docs' },
    { id: 'base', label: 'Só base' },
    { id: 'sessao', label: 'Só sessão' },
    { id: 'contexto', label: 'Contexto' },
  ];

  const handleConsultar = (text = query) => {
    if (text.trim() && status === 'idle') {
      setQuery(text);
      setStatus('thinking');
      setStepIndex(0);

      setTimeout(() => {
        setStatus('answered');
        if (onAnswered) onAnswered();
      }, 4000);
    }
  };

  useEffect(() => {
    let interval;
    if (status === 'thinking') {
      interval = setInterval(() => {
        setStepIndex(prev => (prev + 1) % thinkingSteps.length);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
      }}
      className="flex flex-col gap-[14px] h-full overflow-hidden"
    >
      <AnimatePresence>
        {status === 'idle' && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0, padding: 0, overflow: 'hidden' }}
            transition={{ duration: 0.3 }}
            className="pt-2 px-2 shrink-0"
          >
            <h2 className="text-xl font-bold text-[#131E29] dark:text-white transition-colors duration-300">
              Olá, <span className="text-[#EC6608]">Eduardo</span> 👋
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 transition-colors duration-300">
              O que podemos analisar na safra hoje?
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="shrink-0 relative group focus-within:border-[#EC6608]/50 dark:focus-within:border-[#EC6608]/50 transition-colors duration-300">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={status === 'thinking'}
          placeholder={status === 'thinking' ? 'Processando resposta...' : 'Digite sua pergunta aqui...'}
          className="w-full h-[60px] resize-none outline-none text-sm text-[#131E29] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent mb-2 transition-colors duration-300 disabled:opacity-50"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleConsultar();
            }
          }}
        />

        <div className="flex justify-between items-center mt-auto border-t border-gray-100 dark:border-[#2c3033] pt-3">
          <div className="flex flex-wrap gap-1.5">
            {chips.map(chip => (
              <motion.button
                whileHover={status !== 'thinking' ? { scale: 1.05 } : {}}
                whileTap={status !== 'thinking' ? { scale: 0.95 } : {}}
                key={chip.id}
                disabled={status === 'thinking'}
                onClick={() => setActiveChip(chip.id)}
                className={`text-[10px] px-2.5 py-1.5 rounded-md transition-colors duration-300 ${activeChip === chip.id
                    ? 'bg-gray-100 dark:bg-[#2c3033] text-[#131E29] dark:text-white font-medium border border-gray-300 dark:border-gray-600 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2c3033] border border-transparent'
                  } ${status === 'thinking' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {chip.label}
              </motion.button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <motion.button
              whileHover={status !== 'thinking' ? { scale: 1.05 } : {}}
              whileTap={status !== 'thinking' ? { scale: 0.95 } : {}}
              onClick={onFocusClick}
              title="Modo Foco"
              className="cursor-pointer p-2 text-gray-400 hover:text-[#EC6608] hover:bg-orange-50 dark:hover:bg-[#EC6608]/10 rounded-full transition-colors duration-300"
            >
              <Target className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={status !== 'thinking' ? { scale: 1.05 } : {}}
              whileTap={status !== 'thinking' ? { scale: 0.95 } : {}}
              onClick={() => handleConsultar()}
              disabled={status === 'thinking'}
              className={`cursor-pointer p-2 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 relative overflow-hidden w-8 h-8
                ${status === 'thinking'
                  ? 'bg-gray-100 dark:bg-[#2c3033] text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : query.trim()
                    ? 'bg-[#EC6608] text-white hover:bg-[#d95d07] shadow-sm'
                    : 'bg-gray-100 dark:bg-[#2c3033] text-gray-500 dark:text-gray-400 hover:text-[#EC6608] dark:hover:text-[#EC6608]'
                }`}
            >
              <AnimatePresence mode="wait">
                {status === 'thinking' ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </motion.div>
                ) : query.trim() ? (
                  <motion.div
                    key="send"
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 45 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Send className="w-4 h-4 pr-0.5 pt-0.5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="mic"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Mic className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </Card>

      <Card className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {status === 'answered' ? (
            <motion.div
              key="answer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col h-full"
            >
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100 dark:border-[#2c3033] shrink-0 transition-colors duration-300">
                <h2 className="text-sm font-semibold text-[#131E29] dark:text-white transition-colors duration-300">Resposta</h2>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 -mr-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300 space-y-4 transition-colors duration-300">
                <p>
                  Para a cultura de <strong className="text-[#131E29] dark:text-white">Soja</strong> em Latossolo Vermelho na região do <strong className="text-[#131E29] dark:text-white">MS — Cerrado</strong> com os parâmetros atuais de solo (pH <span className="font-mono text-gray-500 dark:text-gray-400">4.8</span>, V% <span className="font-mono text-gray-500 dark:text-gray-400">32</span>, CTC <span className="font-mono text-gray-500 dark:text-gray-400">8.5</span>), é recomendada a aplicação de calcário para elevar a saturação por bases.
                </p>
                <p>
                  A fórmula padrão para o cálculo da Necessidade de Calagem (NC) pelo método da Saturação por Bases é:
                </p>
                <div className="bg-gray-50 dark:bg-[#2c3033] p-3 rounded-lg font-mono text-xs border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-300">
                  NC (t/ha) = CTC × (V2 - V1) / PRNT
                </div>
                <p>
                  Onde:
                  <br />• CTC = 8.5
                  <br />• V2 (Desejada para soja) = 60%
                  <br />• V1 (Atual) = 32%
                  <br />• PRNT (Exemplo) = 90%
                </p>
                <p>
                  Substituindo os valores:
                  <br />
                  <span className="font-mono bg-[#EC6608]/10 dark:bg-[#EC6608]/20 text-[#EC6608] px-1.5 py-0.5 rounded dark:border dark:border-[#EC6608]/30 transition-colors duration-300">
                    NC = 8.5 × (60 - 32) / 90 = 2.64 t/ha
                  </span>
                  <sup className="text-[#EC6608] ml-1 font-semibold">[1]</sup>
                </p>
                <p>
                  Recomenda-se a aplicação a lanço com incorporação profunda (0-20 cm), preferencialmente de calcário dolomítico, visando também o suprimento de magnésio que costuma ser limitante nesta região. <sup className="text-[#EC6608] ml-0.5 font-semibold">[2]</sup>
                </p>
              </div>
            </motion.div>
          ) : status === 'thinking' ? (
            <motion.div
              key="thinking"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col items-center justify-center text-center p-6 h-full"
            >
              <div className="relative flex items-center justify-center mb-8">
                <div className="absolute w-16 h-16 rounded-full border-4 border-gray-100 dark:border-[#2c3033]"></div>
                <div className="absolute w-16 h-16 rounded-full border-4 border-transparent border-t-[#EC6608] dark:border-t-[#EC6608] animate-spin"></div>
                <img src={agronomyLogo} alt="Loading" className="w-6 h-6 object-contain animate-pulse opacity-90" />
              </div>

              <div className="h-6 relative w-full flex justify-center items-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={stepIndex}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="absolute text-sm font-medium text-[#131E29] dark:text-gray-300"
                  >
                    {thinkingSteps[stepIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex-1 flex flex-col items-center justify-center text-center p-6 h-full"
            >
              <motion.div variants={itemVariants} className="w-12 h-12 bg-gray-50 dark:bg-[#2c3033] rounded-2xl flex items-center justify-center mb-4 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                <MessageSquareText className="w-6 h-6 text-gray-400" />
              </motion.div>
              <motion.h3 variants={itemVariants} className="text-sm font-semibold text-[#131E29] dark:text-white mb-1 transition-colors duration-300">Pronto para consultar</motion.h3>
              <motion.p variants={itemVariants} className="text-xs text-gray-500 dark:text-gray-400 mb-6 max-w-[250px] transition-colors duration-300">
                Digite uma pergunta acima ou escolha uma das sugestões baseadas no contexto atual.
              </motion.p>
              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-2 w-full max-w-[540px]">
                {[
                  "Qual a necessidade de calagem (NC) para este talhão?",
                  "Melhor herbicida para controle de buva resistente?",
                  "Comparar cultivares BRS 1010 IPRO e M 5917 IPRO.",
                  "Impacto do estresse hídrico no enchimento de grãos?"
                ].map((text, i) => (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    key={i}
                    onClick={() => { handleConsultar(text); }}
                    className="cursor-pointer text-left text-xs p-3.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-[#EC6608] dark:hover:border-[#EC6608] hover:bg-orange-50/50 dark:hover:bg-[#EC6608]/10 transition-colors duration-300 text-gray-600 dark:text-gray-300 shadow-sm"
                  >
                    {text}
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
