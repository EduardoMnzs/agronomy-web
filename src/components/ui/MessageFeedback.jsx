import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { query as queryApi } from '../../api/api';

export default function MessageFeedback({ logId, initialRating, initialText }) {
  const [rating, setRating] = useState(initialRating ?? null);
  const [text, setText] = useState(initialText ?? '');
  const [expanded, setExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(initialRating != null);

  if (!logId) return null;

  const send = async (newRating, newText) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await queryApi.feedback(logId, { rating: newRating, feedbackText: newText });
      setRating(newRating);
      setSaved(true);
      if (newText !== undefined) setText(newText);
    } catch {
      // mantém estado anterior em caso de erro — silencioso
    } finally {
      setSubmitting(false);
    }
  };

  const handleClick = (value) => {
    if (rating === value) return; // já marcado, não-op
    send(value, text);
    if (value === -1) setExpanded(true); // dislike abre textarea pra coletar motivo
  };

  return (
    <div className="mt-2 flex flex-col gap-1.5">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => handleClick(1)}
          disabled={submitting}
          title="Resposta útil"
          className={`cursor-pointer p-1.5 rounded-md transition-colors ${
            rating === 1
              ? 'text-green-600 bg-green-50 dark:bg-green-500/10'
              : 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10'
          } disabled:opacity-50`}
        >
          <ThumbsUp size={13} />
        </button>
        <button
          type="button"
          onClick={() => handleClick(-1)}
          disabled={submitting}
          title="Resposta ruim"
          className={`cursor-pointer p-1.5 rounded-md transition-colors ${
            rating === -1
              ? 'text-red-600 bg-red-50 dark:bg-red-500/10'
              : 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10'
          } disabled:opacity-50`}
        >
          <ThumbsDown size={13} />
        </button>
        {submitting && <Loader2 size={12} className="animate-spin text-gray-400 ml-1" />}
        {saved && !submitting && (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[10px] text-gray-400 flex items-center gap-1 ml-1"
          >
            <Check size={10} /> registrado
          </motion.span>
        )}
        {rating != null && !expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="cursor-pointer ml-auto text-[10px] text-gray-400 hover:text-brand underline transition-colors"
          >
            {text ? 'editar comentário' : 'adicionar comentário'}
          </button>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={2000}
              rows={2}
              placeholder="Conte o que poderia ser melhor (opcional)..."
              className="w-full text-xs px-2 py-1.5 bg-gray-50 dark:bg-[#2c3033] border border-gray-200 dark:border-transparent focus:border-brand rounded-md outline-none resize-none text-[#131E29] dark:text-white placeholder-gray-400"
            />
            <div className="flex items-center justify-end gap-2 mt-1">
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="cursor-pointer text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  send(rating ?? 1, text);
                  setExpanded(false);
                }}
                disabled={submitting}
                className="cursor-pointer text-[10px] font-semibold text-white bg-brand hover:bg-brand-dark px-2 py-1 rounded-md transition-colors disabled:opacity-60"
              >
                enviar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
