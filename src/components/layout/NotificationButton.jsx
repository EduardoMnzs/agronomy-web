import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Inbox, UserPlus, ArrowRight } from 'lucide-react';
import useCurrentUser from '../../hooks/useCurrentUser';
import { accessRequests } from '../../api/api';

const POLL_INTERVAL_MS = 60_000; // 1 min

function timeAgo(iso) {
  if (!iso) return '';
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return '';
  const diff = (Date.now() - then.getTime()) / 1000;
  if (diff < 60) return 'agora';
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return `há ${m}min`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return `há ${h}h`;
  }
  const d = Math.floor(diff / 86400);
  return `há ${d}d`;
}

export default function NotificationButton() {
  const navigate = useNavigate();
  const { isAdmin } = useCurrentUser();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const fetchPending = useCallback(async () => {
    if (!isAdmin) { setItems([]); return; }
    try {
      const data = await accessRequests.list({ status: 'pending', limit: 10 });
      setItems(data.items ?? []);
    } catch {
      // silencioso — notificações não devem quebrar a UI
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchPending();
    if (!isAdmin) return;
    const interval = setInterval(fetchPending, POLL_INTERVAL_MS);
    const onChanged = () => fetchPending();
    window.addEventListener('access-requests:changed', onChanged);
    window.addEventListener('focus', onChanged);
    return () => {
      clearInterval(interval);
      window.removeEventListener('access-requests:changed', onChanged);
      window.removeEventListener('focus', onChanged);
    };
  }, [fetchPending, isAdmin]);

  useEffect(() => {
    const handler = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const count = items.length;
  const handleItemClick = () => {
    setOpen(false);
    navigate('/users?tab=requests');
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="cursor-pointer relative p-2 text-gray-400 hover:text-[#131E29] dark:hover:text-white transition-colors bg-gray-50 dark:bg-[#2c3033] rounded-full"
        title={count > 0 ? `${count} solicitação${count === 1 ? '' : 'ões'} pendente${count === 1 ? '' : 's'}` : 'Notificações'}
      >
        <Bell size={18} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-[#323639] flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#323639] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-[60]"
          >
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#131E29] dark:text-white">Notificações</h3>
              {count > 0 && (
                <span className="text-[10px] font-bold text-white bg-brand px-1.5 py-0.5 rounded-full">{count}</span>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {!isAdmin && (
                <EmptyState icon={Bell} text="Você não tem notificações." />
              )}
              {isAdmin && count === 0 && (
                <EmptyState icon={Bell} text="Nenhuma solicitação pendente." />
              )}
              {isAdmin && items.map((r) => (
                <button
                  key={r.id}
                  onClick={handleItemClick}
                  className="cursor-pointer w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-50 dark:border-gray-700/50 last:border-b-0 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0">
                    <UserPlus size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#131E29] dark:text-white truncate">
                      <strong>{r.full_name}</strong> solicitou acesso
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{r.email}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(r.created_at)}</p>
                  </div>
                  <ArrowRight size={12} className="text-gray-300 dark:text-gray-600 shrink-0 mt-2" />
                </button>
              ))}
            </div>

            {isAdmin && count > 0 && (
              <button
                onClick={handleItemClick}
                className="cursor-pointer w-full px-4 py-2.5 text-xs font-semibold text-brand hover:bg-brand/5 border-t border-gray-100 dark:border-gray-700 flex items-center justify-center gap-1.5"
              >
                <Inbox size={12} /> Ver todas as solicitações
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="px-4 py-8 text-center flex flex-col items-center gap-2">
      <Icon size={20} className="text-gray-300 dark:text-gray-600" />
      <p className="text-xs text-gray-400 dark:text-gray-500">{text}</p>
    </div>
  );
}
