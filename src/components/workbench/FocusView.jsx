import React, { useState, useEffect, useRef } from 'react';
import { Send, LayoutGrid, Loader2, Mic, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import agronomyLogo from '../../assets/images/Agronomy-logo.png';
import { query as queryApi, myDocuments as myDocsApi } from '../../api/api';
import MarkdownAnswer from '../ui/MarkdownAnswer';
import MessageFeedback from '../ui/MessageFeedback';
import useCurrentUser from '../../hooks/useCurrentUser';

export default function FocusView({ onAdvancedClick, messages, conversationId, onUserMessage, onAssistantReply, onCitationClick }) {
  const { firstName } = useCurrentUser();
  const [inputValue, setInputValue] = useState('');
  const [activeChip, setActiveChip] = useState('todos');
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState('');
  const [stepIndex, setStepIndex] = useState(0);
  const bottomRef = useRef(null);
  const scrollRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [myDocIds, setMyDocIds] = useState([]);

  useEffect(() => {
    myDocsApi.list()
      .then((docs) => {
        const ready = (docs ?? []).filter((d) => d.status === 'done').map((d) => d.id);
        setMyDocIds(ready);
      })
      .catch(() => setMyDocIds([]));
  }, []);

  const chips = [
    { id: 'todos', label: 'Todos os docs', scope: 'all' },
    { id: 'base', label: 'Só base', scope: 'kb' },
    { id: 'sessao', label: 'Só sessão', scope: 'mine' },
    { id: 'contexto', label: 'Contexto', scope: 'selection' },
  ];

  const suggestions = [
    'Qual a dose de calcário para soja em Latossolo com pH 4.8?',
    'Comparar BRS 1010IPRO vs M 5917 IPRO em região do MS',
    'Herbicidas pré-emergentes para controle de Conyza spp.',
    'Calibração de pulverizador para 80 L/ha de calda',
  ];

  const thinkingSteps = [
    'Buscando contexto na base de conhecimento...',
    'Analisando manuais e recomendações...',
    'Cruzando com os dados do seu talhão...',
    'Elaborando a resposta...',
  ];

  useEffect(() => {
    if (!showScrollBtn) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      const scope = chips.find((c) => c.id === activeChip)?.scope ?? 'all';
      const result = await queryApi.submit({ question, scope, myDocumentIds: myDocIds, conversationId });
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  const hasMessages = messages && messages.length > 0;

  if (hasMessages || thinking) {
    return (
      <div className="h-full w-full flex flex-col relative">
        <div ref={scrollRef} className="flex-1 overflow-y-auto w-full pt-4 lg:pt-6 pb-40">
          <div className="w-full max-w-[900px] mx-auto px-4 md:px-8 space-y-6">
            {messages.map((msg, i) =>
              msg.role === 'user' ? (
                <motion.div key={i} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="flex justify-end">
                  <div className="bg-gray-200 dark:bg-[#4A4D50] text-gray-900 dark:text-white px-5 py-4 rounded-3xl rounded-tr-sm max-w-[85%] md:max-w-[70%] shadow-sm text-[15px] leading-relaxed">
                    {msg.content}
                  </div>
                </motion.div>
              ) : (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex justify-start">
                  <div className="flex items-start gap-4 max-w-[95%] md:max-w-[85%]">
                    <div className="relative w-9 h-9 rounded-full bg-white dark:bg-[#323639] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <div className="absolute inset-0 rounded-full border border-gray-100 dark:border-gray-700"></div>
                      <img src={agronomyLogo} alt="Agronomy Logo" className="w-5 h-5 object-contain relative z-10" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <MarkdownAnswer text={msg.content} className="text-[15px]" citations={msg.citations} onCitationClick={onCitationClick} />
                      <MessageFeedback logId={msg.query_log_id} />
                    </div>
                  </div>
                </motion.div>
              )
            )}

            {thinking && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                <div className="flex items-start gap-4">
                  <div className="relative w-9 h-9 rounded-full bg-white dark:bg-[#323639] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <div className="absolute inset-0 rounded-full border-2 border-gray-100 dark:border-[#2c3033]"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#EC6608] animate-spin"></div>
                    <img src={agronomyLogo} alt="Agronomy Logo" className="w-5 h-5 object-contain animate-pulse relative z-10" />
                  </div>
                  <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">
                    <div className="relative h-6 w-[250px] sm:w-[320px] overflow-hidden">
                      <AnimatePresence mode="wait">
                        <motion.span key={stepIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="absolute left-0 top-0.5">
                          {thinkingSteps[stepIndex]}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
            <div ref={bottomRef} />
          </div>
        </div>

        <AnimatePresence>
          {showScrollBtn && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="cursor-pointer absolute bottom-32 left-1/2 -translate-x-1/2 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-[#323639] border border-gray-200 dark:border-gray-600 shadow-md text-gray-500 dark:text-gray-400 hover:border-[#EC6608] hover:text-[#EC6608] transition-colors"
            >
              <ArrowDown size={15} />
            </motion.button>
          )}
        </AnimatePresence>

        <div className="absolute bottom-0 left-0 right-0 pt-10 pb-6 px-4 md:px-8 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-[#F7F7FF] via-[#F7F7FF]/80 to-transparent transition-opacity duration-300 dark:opacity-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2c3033] via-[#2c3033]/80 to-transparent transition-opacity duration-300 opacity-0 dark:opacity-100" />
          <div className="relative max-w-[800px] mx-auto pointer-events-auto">
            <div className="bg-white dark:bg-[#323639] border border-gray-200 dark:border-gray-700 rounded-3xl shadow-lg p-2.5 flex items-center gap-2 transition-all duration-300 focus-within:border-[#EC6608]/50 focus-within:ring-2 focus-within:ring-[#EC6608]/10">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Faça uma pergunta de acompanhamento..."
                disabled={thinking}
                className="flex-1 bg-transparent px-4 py-2 outline-none text-base text-[#131E29] dark:text-white placeholder:text-gray-400 disabled:opacity-50"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleConsultar(); } }}
              />
              <button onClick={onAdvancedClick} title="Visualização Avançada" className="cursor-pointer p-2 text-gray-400 hover:text-[#EC6608] hover:bg-orange-50 dark:hover:bg-[#EC6608]/10 rounded-full transition-colors duration-300">
                <LayoutGrid className="w-5 h-5" />
              </button>
              <motion.button
                whileHover={!thinking ? { scale: 1.05 } : {}}
                whileTap={!thinking ? { scale: 0.95 } : {}}
                disabled={thinking}
                onClick={() => handleConsultar()}
                className={`cursor-pointer w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-sm
                  ${thinking ? 'bg-gray-200 dark:bg-[#2c3033] text-gray-500 cursor-not-allowed' :
                    inputValue.trim() ? 'bg-[#EC6608] text-white hover:bg-[#d95d07]' :
                    'bg-gray-100 dark:bg-[#2c3033] text-gray-500 dark:text-gray-400 hover:text-[#EC6608] dark:hover:text-[#EC6608]'
                  }`}
              >
                <AnimatePresence mode="wait">
                  {thinking ? (
                    <motion.div key="loading" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </motion.div>
                  ) : inputValue.trim() ? (
                    <motion.div key="send" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Send className="w-4 h-4 pr-0.5 pt-0.5" />
                    </motion.div>
                  ) : (
                    <motion.div key="mic" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Mic className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
            <div className="text-center mt-3">
              <p className="text-[10px] text-gray-400 dark:text-gray-500">
                A IA pode cometer erros. Considere verificar as fontes na visualização avançada.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="min-h-full flex flex-col items-center justify-center px-4 py-8 lg:px-8 lg:py-10">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full max-w-[800px] flex flex-col items-start">
          <div className="sticky top-0 z-20 w-full pt-4 pb-2 bg-[#F7F7FF] dark:bg-[#2c3033] transition-colors duration-300 sm:relative sm:pt-0 sm:pb-0 sm:bg-transparent">
            <motion.div variants={itemVariants} className="text-left mb-6 w-full">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#131E29] dark:text-white mb-2 transition-colors duration-300">
                Olá, <span className="text-[#EC6608]">{firstName}</span> 👋
              </h1>
              <p className="text-base text-gray-500 dark:text-gray-400 transition-colors duration-300">
                O que podemos analisar na safra hoje?
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="w-full bg-white dark:bg-[#323639] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-4 mb-6 focus-within:border-[#EC6608]/50 focus-within:ring-2 focus-within:ring-[#EC6608]/10 transition-all duration-300">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Pergunte algo — ex: dose de calcário, recomendação de cultivar, modo de ação de herbicida..."
                className="w-full h-[32px] outline-none text-base text-[#131E29] dark:text-white placeholder:text-gray-400 bg-transparent mb-4 transition-colors duration-300"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleConsultar(); } }}
              />
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-gray-100 dark:border-[#2c3033] gap-4 sm:gap-0 transition-colors duration-300">
                <div className="flex flex-wrap gap-1.5">
                  {chips.map((chip) => (
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} key={chip.id} onClick={() => setActiveChip(chip.id)} className={`cursor-pointer text-[10px] px-2.5 py-1.5 rounded-md transition-colors duration-300 ${activeChip === chip.id ? 'bg-gray-100 dark:bg-[#2c3033] text-[#131E29] dark:text-white font-medium border border-gray-300 dark:border-gray-600 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2c3033] border border-transparent'}`}>
                      {chip.label}
                    </motion.button>
                  ))}
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button onClick={onAdvancedClick} title="Visualização Avançada" className="cursor-pointer p-2 text-gray-400 hover:text-[#EC6608] hover:bg-orange-50 dark:hover:bg-[#EC6608]/10 rounded-full transition-colors duration-300">
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleConsultar()} className={`cursor-pointer w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-sm ${inputValue.trim() ? 'bg-[#EC6608] text-white hover:bg-[#d95d07]' : 'bg-gray-100 dark:bg-[#2c3033] text-gray-500 dark:text-gray-400 hover:text-[#EC6608] dark:hover:text-[#EC6608]'}`}>
                    <AnimatePresence mode="wait">
                      {inputValue.trim() ? (
                        <motion.div key="send" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          <Send className="w-4 h-4 pr-0.5 pt-0.5" />
                        </motion.div>
                      ) : (
                        <motion.div key="mic" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          <Mic className="w-4 h-4" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="w-full md:max-w-[90%] grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5 mx-auto">
            {suggestions.map((text, i) => (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={i} onClick={() => handleConsultar(text)} className="cursor-pointer text-left text-xs p-3.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-[#EC6608] dark:hover:border-[#EC6608] hover:bg-orange-50/50 dark:hover:bg-[#EC6608]/10 transition-colors duration-300 text-gray-600 dark:text-gray-300 shadow-sm bg-white dark:bg-[#323639]">
                {text}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
