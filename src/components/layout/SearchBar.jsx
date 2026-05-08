import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Loader2, MessageSquareText, FileText, FolderOpen, User as UserIcon, ArrowRight,
} from 'lucide-react';
import { search as searchApi } from '../../api/api';
import { useDocPreview } from '../../hooks/DocPreviewContext';

const FILE_COLORS = {
  pdf: 'text-red-500',
  xlsx: 'text-green-600',
  xls: 'text-green-600',
  csv: 'text-green-600',
  json: 'text-amber-500',
  docx: 'text-blue-500',
  md: 'text-purple-500',
};

const ROLE_LABEL = { admin: 'Administrador', user: 'Usuário' };

function useDebounced(value, delay) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function SearchBar() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const rootRef = useRef(null);
  const { openDocument } = useDocPreview();

  const debounced = useDebounced(q, 250);

  useEffect(() => {
    const term = debounced.trim();
    if (term.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    searchApi
      .run(term)
      .then((data) => { if (!cancelled) setResults(data); })
      .catch(() => { if (!cancelled) setResults(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [debounced]);

  useEffect(() => {
    const onClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const flatItems = (() => {
    if (!results) return [];
    const out = [];
    for (const c of results.conversations || []) out.push({ type: 'conv', id: c.id, data: c });
    for (const d of results.knowledge_documents || []) out.push({ type: 'kb', id: d.id, data: d });
    for (const d of results.my_documents || []) out.push({ type: 'mine', id: d.id, data: d });
    for (const u of results.users || []) out.push({ type: 'user', id: u.id, data: u });
    return out;
  })();

  const goTo = (item) => {
    setOpen(false);
    if (item.type === 'kb') {
      navigate('/knowledge-base');
      openDocument(item.data, 'kb');
      return;
    }
    if (item.type === 'mine') {
      navigate('/my-documents');
      openDocument(item.data, 'mine');
      return;
    }
    setQ('');
    setResults(null);
    if (item.type === 'conv') navigate(`/app/${item.id}`);
    else if (item.type === 'user') navigate('/users');
  };

  const onKeyDown = (e) => {
    if (!open || flatItems.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % flatItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + flatItems.length) % flatItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && activeIdx < flatItems.length) {
        goTo(flatItems[activeIdx]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  useEffect(() => { setActiveIdx(-1); }, [results]);

  const term = q.trim();
  const showDropdown = open && term.length >= 2;
  const totalHits =
    (results?.conversations?.length || 0) +
    (results?.knowledge_documents?.length || 0) +
    (results?.my_documents?.length || 0) +
    (results?.users?.length || 0);

  let runningIdx = -1;

  return (
    <div ref={rootRef} className="relative hidden md:block">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Pesquisar conversas, documentos…"
        className="pl-10 pr-8 py-2 text-xs border border-gray-200 dark:border-[#2c3033] rounded-full focus:outline-none focus:border-[#EC6608] focus:ring-2 focus:ring-[#EC6608]/10 transition-all bg-gray-50 dark:bg-[#2c3033] text-[#131E29] dark:text-white placeholder-gray-400 w-64 lg:w-80"
      />
      {loading && (
        <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
      )}

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 mt-2 bg-white dark:bg-[#323639] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-[60]"
          >
            <div className="max-h-[480px] overflow-y-auto">
              {!results && !loading && (
                <EmptyState text="Digite para pesquisar." />
              )}
              {results && totalHits === 0 && !loading && (
                <EmptyState text={`Nenhum resultado para "${term}".`} />
              )}
              {results?.conversations?.length > 0 && (
                <Group title="Conversas">
                  {results.conversations.map((c) => {
                    runningIdx += 1;
                    const idx = runningIdx;
                    return (
                      <ResultRow
                        key={`conv-${c.id}`}
                        active={activeIdx === idx}
                        onClick={() => goTo({ type: 'conv', id: c.id, data: c })}
                        onMouseEnter={() => setActiveIdx(idx)}
                      >
                        <MessageSquareText size={13} className="text-gray-400 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#131E29] dark:text-white truncate">{c.title}</p>
                          {c.snippet && (
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">{c.snippet}</p>
                          )}
                        </div>
                      </ResultRow>
                    );
                  })}
                </Group>
              )}

              {results?.knowledge_documents?.length > 0 && (
                <Group title="Base de conhecimento">
                  {results.knowledge_documents.map((d) => {
                    runningIdx += 1;
                    const idx = runningIdx;
                    return (
                      <ResultRow
                        key={`kb-${d.id}`}
                        active={activeIdx === idx}
                        onClick={() => goTo({ type: 'kb', id: d.id, data: d })}
                        onMouseEnter={() => setActiveIdx(idx)}
                      >
                        <FileText size={13} className={`${FILE_COLORS[d.file_type] || 'text-gray-400'} shrink-0 mt-0.5`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#131E29] dark:text-white truncate">{d.name}</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 uppercase truncate mt-0.5">
                            {d.file_type}{d.category ? ` · ${d.category}` : ''}
                          </p>
                        </div>
                      </ResultRow>
                    );
                  })}
                </Group>
              )}

              {results?.my_documents?.length > 0 && (
                <Group title="Meus documentos">
                  {results.my_documents.map((d) => {
                    runningIdx += 1;
                    const idx = runningIdx;
                    return (
                      <ResultRow
                        key={`mine-${d.id}`}
                        active={activeIdx === idx}
                        onClick={() => goTo({ type: 'mine', id: d.id, data: d })}
                        onMouseEnter={() => setActiveIdx(idx)}
                      >
                        <FolderOpen size={13} className={`${FILE_COLORS[d.file_type] || 'text-gray-400'} shrink-0 mt-0.5`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#131E29] dark:text-white truncate">{d.name}</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 uppercase truncate mt-0.5">
                            {d.file_type}{d.category ? ` · ${d.category}` : ''}
                          </p>
                        </div>
                      </ResultRow>
                    );
                  })}
                </Group>
              )}

              {results?.users?.length > 0 && (
                <Group title="Usuários">
                  {results.users.map((u) => {
                    runningIdx += 1;
                    const idx = runningIdx;
                    const initials = (u.full_name || '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
                    return (
                      <ResultRow
                        key={`user-${u.id}`}
                        active={activeIdx === idx}
                        onClick={() => goTo({ type: 'user', id: u.id, data: u })}
                        onMouseEnter={() => setActiveIdx(idx)}
                      >
                        <div className="w-6 h-6 rounded-full bg-[#EC6608] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          {initials || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#131E29] dark:text-white truncate">{u.full_name}</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {u.email} · {ROLE_LABEL[u.role] ?? u.role}
                          </p>
                        </div>
                      </ResultRow>
                    );
                  })}
                </Group>
              )}
            </div>

            <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-[#2c3033] flex items-center justify-between text-[10px] text-gray-400">
              <span>↑↓ para navegar · Enter para abrir · Esc para fechar</span>
              {totalHits > 0 && <span>{totalHits} resultado{totalHits === 1 ? '' : 's'}</span>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function Group({ title, children }) {
  return (
    <div>
      <div className="px-3 pt-3 pb-1">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}

function ResultRow({ children, onClick, onMouseEnter, active }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`cursor-pointer w-full px-3 py-2 flex items-start gap-2.5 text-left transition-colors ${
        active ? 'bg-[#EC6608]/10 dark:bg-[#EC6608]/15' : 'hover:bg-gray-50 dark:hover:bg-white/5'
      }`}
    >
      {children}
      <ArrowRight size={12} className={`shrink-0 mt-1.5 transition-colors ${active ? 'text-[#EC6608]' : 'text-gray-300 dark:text-gray-600'}`} />
    </button>
  );
}

function EmptyState({ text }) {
  return <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-6">{text}</p>;
}
