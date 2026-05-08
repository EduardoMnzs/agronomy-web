import React, { useState, useEffect, useRef } from 'react';
import useCurrentUser from '../../hooks/useCurrentUser';
import { Send, Mic, MessageSquareText, Loader2, Target, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import agronomyLogo from '../../assets/images/Agronomy-logo.png';
import { query as queryApi } from '../../api/api';
import MarkdownAnswer from '../ui/MarkdownAnswer';

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

const thinkingSteps = [
  'Buscando contexto na base de conhecimento...',
  'Analisando manuais e recomendações...',
  'Cruzando com os dados do seu talhão...',
  'Elaborando a resposta...',
];

export default function CenterColumn({ onFocusClick, selectedKnowledgeIds, messages, conversationId, onUserMessage, onAssistantReply, onCitationClick }) {
  const { firstName } = useCurrentUser();
  const [inputValue, setInputValue] = useState('');
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState('');
  const [activeChip, setActiveChip] = useState('contexto');
  const [stepIndex, setStepIndex] = useState(0);
  const bottomRef = useRef(null);
  const scrollRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { staggerChildren: 0.1 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  const chips = [
    { id: 'todos', label: 'Todos os docs' },
    { id: 'base', label: 'Só base' },
    { id: 'sessao', label: 'Só sessão' },
    { id: 'contexto', label: 'Contexto' },
  ];

  const scrollThreadToBottom = (behavior = 'smooth') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  };

  useEffect(() => {
    if (!showScrollBtn) scrollThreadToBottom();
  }, [messages, thinking]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollBtn(distFromBottom > 120);
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const handleConsultar = async (text = inputValue) => {
    if (!text.trim() || thinking) return;
    const question = text.trim();
    setInputValue('');
    setThinking(true);
    setStepIndex(0);
    setError('');
    onUserMessage(question);

    try {
      const knowledgeIds = activeChip === 'sessao'
        ? []
        : selectedKnowledgeIds.filter((id) => Number.isInteger(id) || /^\d+$/.test(id)).map(Number);
      const myDocumentIds = selectedKnowledgeIds
        .filter((id) => typeof id === 'string' && id.startsWith('user_'))
        .map((id) => Number(id.slice(5)))
        .filter((n) => Number.isFinite(n));
      const result = await queryApi.submit({ question, knowledgeIds, myDocumentIds, conversationId });
      onAssistantReply(question, result);
    } catch (err) {
      setError(err.message || 'Erro ao consultar.');
    } finally {
      setThinking(false);
    }
  };

  useEffect(() => {
    let interval;
    if (thinking) {
      interval = setInterval(() => setStepIndex((p) => (p + 1) % thinkingSteps.length), 1000);
    }
    return () => clearInterval(interval);
  }, [thinking]);

  const hasMessages = messages && messages.length > 0;
  const status = thinking ? 'thinking' : hasMessages ? 'answered' : 'idle';

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
      className="flex flex-col gap-[14px] lg:h-full lg:overflow-hidden"
    >
      <AnimatePresence>
        {status === 'idle' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0, padding: 0, overflow: 'hidden' }}
            transition={{ duration: 0.3 }}
            className="pt-2 px-2 shrink-0"
          >
            <h2 className="text-xl font-bold text-[#131E29] dark:text-white transition-colors duration-300">
              Olá, <span className="text-[#EC6608]">{firstName}</span> 👋
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 transition-colors duration-300">
              O que podemos analisar na safra hoje?
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="shrink-0 relative group focus-within:border-[#EC6608]/50 dark:focus-within:border-[#EC6608]/50 transition-colors duration-300">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={thinking}
          placeholder={thinking ? 'Processando resposta...' : 'Digite sua pergunta aqui...'}
          className="w-full h-[60px] resize-none outline-none text-sm text-[#131E29] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent mb-2 transition-colors duration-300 disabled:opacity-50"
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleConsultar(); } }}
        />
        <div className="flex items-center justify-between mt-auto border-t border-gray-100 dark:border-[#2c3033] pt-3 gap-2">
          <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
            {chips.map((chip) => (
              <motion.button
                whileHover={!thinking ? { scale: 1.05 } : {}}
                whileTap={!thinking ? { scale: 0.95 } : {}}
                key={chip.id}
                disabled={thinking}
                onClick={() => setActiveChip(chip.id)}
                className={`text-[10px] px-2.5 py-1.5 rounded-md transition-colors duration-300 ${activeChip === chip.id
                  ? 'bg-gray-100 dark:bg-[#2c3033] text-[#131E29] dark:text-white font-medium border border-gray-300 dark:border-gray-600 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2c3033] border border-transparent'
                } ${thinking ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {chip.label}
              </motion.button>
            ))}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <motion.button
              whileHover={!thinking ? { scale: 1.05 } : {}}
              whileTap={!thinking ? { scale: 0.95 } : {}}
              onClick={onFocusClick}
              title="Modo Foco"
              className="cursor-pointer p-2 text-gray-400 hover:text-[#EC6608] hover:bg-orange-50 dark:hover:bg-[#EC6608]/10 rounded-full transition-colors duration-300"
            >
              <Target className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={!thinking ? { scale: 1.05 } : {}}
              whileTap={!thinking ? { scale: 0.95 } : {}}
              onClick={() => handleConsultar()}
              disabled={thinking}
              className={`cursor-pointer p-2 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 relative overflow-hidden w-8 h-8
                ${thinking
                  ? 'bg-gray-100 dark:bg-[#2c3033] text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : inputValue.trim()
                    ? 'bg-[#EC6608] text-white hover:bg-[#d95d07] shadow-sm'
                    : 'bg-gray-100 dark:bg-[#2c3033] text-gray-500 dark:text-gray-400 hover:text-[#EC6608] dark:hover:text-[#EC6608]'
                }`}
            >
              <AnimatePresence mode="wait">
                {thinking ? (
                  <motion.div key="loading" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </motion.div>
                ) : inputValue.trim() ? (
                  <motion.div key="send" initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 45 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                    <Send className="w-4 h-4 pr-0.5 pt-0.5" />
                  </motion.div>
                ) : (
                  <motion.div key="mic" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                    <Mic className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </Card>

      <Card className="flex-1 overflow-hidden max-h-[60vh] lg:max-h-none">
        <AnimatePresence mode="wait">
          {status === 'answered' || status === 'thinking' ? (
            <motion.div key="thread" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col h-full min-h-0 relative">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100 dark:border-[#2c3033] shrink-0 transition-colors duration-300">
                <h2 className="text-sm font-semibold text-[#131E29] dark:text-white transition-colors duration-300">Resposta</h2>
              </div>
              <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto pr-2 -mr-2 space-y-4 transition-colors duration-300">
                {messages.map((msg, i) => (
                  msg.role === 'user' ? (
                    <div key={i} className="flex justify-end">
                      <div className="bg-gray-100 dark:bg-[#2c3033] text-gray-800 dark:text-gray-200 text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[80%]">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="flex justify-start">
                      <div className="flex items-start gap-2 max-w-[90%]">
                        <div className="w-6 h-6 rounded-full bg-white dark:bg-[#2c3033] border border-gray-100 dark:border-gray-700 flex items-center justify-center shrink-0 mt-0.5">
                          <img src={agronomyLogo} className="w-3.5 h-3.5 object-contain" />
                        </div>
                        <MarkdownAnswer text={msg.content} className="text-sm" citations={msg.citations} onCitationClick={onCitationClick} />
                      </div>
                    </div>
                  )
                ))}
                {thinking && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-2 max-w-[90%]">
                      <div className="w-6 h-6 rounded-full bg-white dark:bg-[#2c3033] border border-gray-100 dark:border-gray-700 flex items-center justify-center shrink-0 mt-0.5">
                        <img src={agronomyLogo} className="w-3.5 h-3.5 object-contain animate-pulse" />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 pt-0.5">
                        <AnimatePresence mode="wait">
                          <motion.span key={stepIndex} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                            {thinkingSteps[stepIndex]}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                )}
                {error && <p className="text-xs text-red-500">{error}</p>}
                <div ref={bottomRef} />
              </div>
              <AnimatePresence>
                {showScrollBtn && (
                  <motion.button
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => scrollThreadToBottom()}
                    className="cursor-pointer absolute bottom-2 inset-x-0 mx-auto w-fit flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#2c3033] border border-gray-200 dark:border-gray-600 shadow-md text-xs font-medium text-gray-600 dark:text-gray-300 hover:border-[#EC6608] hover:text-[#EC6608] transition-colors z-10 whitespace-nowrap"
                  >
                    <ArrowDown size={13} />
                    Ir para o final
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div key="empty" variants={containerVariants} initial="hidden" animate="show" exit="exit" className="flex-1 flex flex-col items-center justify-center text-center p-6 h-full">
              <motion.div variants={itemVariants} className="w-12 h-12 bg-gray-50 dark:bg-[#2c3033] rounded-2xl flex items-center justify-center mb-4 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                <MessageSquareText className="w-6 h-6 text-gray-400" />
              </motion.div>
              <motion.h3 variants={itemVariants} className="text-sm font-semibold text-[#131E29] dark:text-white mb-1 transition-colors duration-300">Pronto para consultar</motion.h3>
              <motion.p variants={itemVariants} className="text-xs text-gray-500 dark:text-gray-400 mb-6 max-w-[250px] transition-colors duration-300">
                Digite uma pergunta acima ou escolha uma das sugestões.
              </motion.p>
              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-2 w-full max-w-[540px]">
                {[
                  'Qual a necessidade de calagem (NC) para este talhão?',
                  'Melhor herbicida para controle de buva resistente?',
                  'Comparar cultivares BRS 1010 IPRO e M 5917 IPRO.',
                  'Impacto do estresse hídrico no enchimento de grãos?',
                ].map((text, i) => (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={i} onClick={() => handleConsultar(text)} className="cursor-pointer text-left text-xs p-3.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-[#EC6608] dark:hover:border-[#EC6608] hover:bg-orange-50/50 dark:hover:bg-[#EC6608]/10 transition-colors duration-300 text-gray-600 dark:text-gray-300 shadow-sm">
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
