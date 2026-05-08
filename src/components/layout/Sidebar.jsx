import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, PanelLeftClose, PanelLeftOpen, Settings, LogOut, SquarePen,
  Folder, Book, Upload, Users, MoreHorizontal,
  Pin, Pencil, Trash2,
} from 'lucide-react';
import agronomyLogo from '../../assets/images/Agronomy-logo.png';
import { auth, conversations as convsApi } from '../../api/api';
import useCurrentUser from '../../hooks/useCurrentUser';

export default function Sidebar({ isMobileOpen, onCloseMobile, onSelectConversation, onNewConversation, activeConversationId, newConversationEntry, onConversationEntryAdded }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    convsApi.list().then(setConversations).catch(() => {});
  }, []);

  useEffect(() => {
    if (!newConversationEntry) return;
    setConversations((prev) => {
      if (prev.some((c) => c.id === newConversationEntry.id)) return prev;
      return [newConversationEntry, ...prev];
    });
    onConversationEntryAdded?.();
  }, [newConversationEntry]);

  const handlePin = async (id) => {
    const conv = conversations.find((c) => c.id === id);
    if (!conv) return;
    const newPinned = !conv.pinned;
    setConversations((prev) => prev.map((c) => c.id === id ? { ...c, pinned: newPinned } : c));
    await convsApi.patch(id, { pinned: newPinned }).catch(() => {});
  };

  const handleRename = async (id, newTitle) => {
    setConversations((prev) => prev.map((c) => c.id === id ? { ...c, title: newTitle } : c));
    await convsApi.patch(id, { title: newTitle }).catch(() => {});
  };

  const handleDelete = async (id) => {
    await convsApi.remove(id).catch(() => {});
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (id === activeConversationId) onNewConversation?.();
  };

  const handleClearAll = () => setConversations([]);

  const sharedProps = {
    isCollapsed,
    conversations,
    handlePin,
    handleRename,
    handleDelete,
    handleClearAll,
    onSelectConversation,
    onNewConversation,
    activeConversationId,
  };

  return (
    <>
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
              onClick={onCloseMobile}
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed inset-y-0 left-0 z-[70] w-64 bg-white dark:bg-[#323639] border-r border-gray-200 dark:border-transparent h-screen flex flex-col text-[#131E29] dark:text-white shadow-xl flex-shrink-0 lg:hidden overflow-hidden"
            >
              <SidebarInner {...sharedProps} onCloseMobile={onCloseMobile} onToggleCollapse={() => setIsCollapsed((v) => !v)} forceExpanded />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside className={`hidden lg:flex relative inset-y-0 left-0 z-30 bg-white dark:bg-[#323639] border-r border-gray-200 dark:border-transparent h-screen flex-col text-[#131E29] dark:text-white shadow-xl flex-shrink-0 overflow-hidden transition-[width,background-color,border-color] duration-300 ease-in-out ${isCollapsed ? 'w-[72px]' : 'w-64'}`}>
        <SidebarInner {...sharedProps} onCloseMobile={() => {}} onToggleCollapse={() => setIsCollapsed((v) => !v)} />
      </aside>
    </>
  );
}

function SidebarInner({ isCollapsed, forceExpanded, onCloseMobile, onToggleCollapse, conversations, handlePin, handleRename, handleDelete, handleClearAll, onSelectConversation, onNewConversation, activeConversationId }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useCurrentUser();
  const collapsed = forceExpanded ? false : isCollapsed;

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -14 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 320, damping: 26 } },
  };

  return (
    <div className="flex flex-col h-full">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={`px-4 flex items-center border-b border-gray-100 dark:border-white/5 h-16 flex-shrink-0 transition-colors duration-300 ${collapsed ? 'justify-center' : 'gap-3'}`}
      >
        <img src={agronomyLogo} alt="Agronomy Logo" className="w-8 h-8 object-contain flex-shrink-0" />
        <div className={`flex flex-col min-w-0 flex-1 transition-[opacity] duration-150 ${collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100 delay-150'}`}>
          <div className="text-xl tracking-tight leading-none whitespace-nowrap text-[#131E29] dark:text-white">
            <span className="font-bold">AGRONO</span><span className="font-light">MY</span>
          </div>
          <p className="text-[10px] text-[#EC6608] font-mono uppercase tracking-[0.2em] mt-1">Knowledge</p>
        </div>
        <button onClick={onCloseMobile} className={`flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:text-[#131E29] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex-shrink-0 lg:hidden ${collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <X size={16} />
        </button>
      </motion.div>

      <motion.div
        key={`nova-${collapsed}`}
        initial={{ opacity: 0, x: -14 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26, delay: 0.1 }}
        className="px-3 pt-3 pb-2 flex-shrink-0"
      >
        <SidebarItem icon={SquarePen} label="Nova consulta" collapsed={collapsed} accent onClick={() => { onNewConversation?.(); navigate('/app'); onCloseMobile(); }} />
      </motion.div>

      <motion.div
        key={`content-${collapsed}`}
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-5"
      >
        <motion.div variants={itemVariants}>
          <Section label={isAdmin ? 'Administração' : 'Biblioteca'} collapsed={collapsed}>
            <SidebarItem icon={Book} label="Base de conhecimento" collapsed={collapsed} active={location.pathname === '/knowledge-base'} onClick={() => { navigate('/knowledge-base'); onCloseMobile(); }} />
            <SidebarItem icon={Folder} label="Meus documentos" collapsed={collapsed} active={location.pathname === '/my-documents'} onClick={() => { navigate('/my-documents'); onCloseMobile(); }} />
            {isAdmin && (
              <>
                <SidebarItem icon={Upload} label="Indexar documento" collapsed={collapsed} active={location.pathname === '/index-document'} onClick={() => { navigate('/index-document'); onCloseMobile(); }} />
                <SidebarItem icon={Users} label="Usuários" collapsed={collapsed} active={location.pathname === '/users'} onClick={() => { navigate('/users'); onCloseMobile(); }} />
              </>
            )}
          </Section>
        </motion.div>
        {!collapsed && (
          <motion.div variants={itemVariants}>
            <Section label="Conversas" collapsed={collapsed}>
              <AnimatePresence initial={false}>
                {[...conversations].sort((a, b) => {
                  if (b.pinned !== a.pinned) return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
                  return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
                }).map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    collapsed={collapsed}
                    active={activeConversationId === conv.id}
                    onPin={handlePin}
                    onRename={handleRename}
                    onDelete={handleDelete}
                    onSelect={onSelectConversation}
                  />
                ))}
              </AnimatePresence>
              {conversations.length === 0 && (
                <p className="text-[11px] text-gray-400 dark:text-white/30 px-2 py-1">Nenhuma conversa ainda.</p>
              )}
            </Section>
          </motion.div>
        )}
      </motion.div>

      <button
        onClick={onToggleCollapse}
        className="hidden lg:flex cursor-pointer items-center justify-center gap-2 w-full py-3 border-t border-gray-100 dark:border-white/5 text-gray-500 dark:text-white/60 hover:text-[#131E29] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-200 flex-shrink-0 text-sm"
      >
        {collapsed
          ? <PanelLeftOpen size={18} className="text-gray-400 dark:text-white/40" />
          : <><PanelLeftClose size={18} className="text-gray-400 dark:text-white/40" /><span className="whitespace-nowrap">Recolher</span></>
        }
      </button>

      <div className="p-3 border-t border-gray-100 dark:border-white/5 space-y-1">
        <SidebarItem icon={Settings} label="Configurações" collapsed={collapsed} />
        <SidebarItem icon={LogOut} label="Sair" collapsed={collapsed} danger onClick={() => { auth.logout(); window.location.href = '/login'; }} />
      </div>

      <div className={`bg-gray-50 dark:bg-[#2c3033] border-t border-gray-100 dark:border-white/5 flex-shrink-0 overflow-hidden whitespace-nowrap transition-[padding,height,background-color,border-color] duration-300 ${collapsed ? 'py-0 h-0' : 'p-4'}`}>
        <span className={`block text-[10px] font-medium text-gray-400 dark:text-white/20 text-center uppercase tracking-tighter transition-opacity duration-300 ${collapsed ? 'opacity-0' : 'opacity-100 delay-150'}`}>
          AGRONOMY ASSISTANT <br /> &copy; 2026 EDUARDO MENEZES
        </span>
      </div>
    </div>
  );
}

function Section({ label, collapsed, children }) {
  return (
    <div className="space-y-0.5">
      {!collapsed && (
        <div className="flex items-center justify-between px-2 mb-1">
          <span className="text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest">{label}</span>
        </div>
      )}
      {children}
    </div>
  );
}

function SidebarItem({ icon: Icon, label, collapsed, accent, active, muted, danger, truncate, onClick }) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`cursor-pointer w-full flex items-center px-3 py-2.5 rounded-lg transition-colors duration-200 text-sm
        ${collapsed ? 'justify-center' : 'gap-2.5'}
        ${accent ? 'bg-[#EC6608] text-white hover:bg-[#d95d07] font-semibold shadow-sm' : ''}
        ${active ? 'bg-[#EC6608]/10 dark:bg-[#EC6608]/20 text-[#EC6608] font-medium' : ''}
        ${muted ? 'text-gray-400 dark:text-white/30 hover:bg-gray-50 dark:hover:bg-white/5 border border-dashed border-gray-200 dark:border-white/10' : ''}
        ${danger ? 'text-red-500/80 dark:text-red-400/80 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600' : ''}
        ${!accent && !active && !muted && !danger ? 'text-gray-500 dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#131E29] dark:hover:text-white' : ''}`}
    >
      {Icon && <Icon size={16} className="flex-shrink-0" />}
      {!collapsed && (
        <span className={`flex-1 text-left whitespace-nowrap ${truncate ? 'overflow-hidden text-ellipsis' : ''}`}>
          {label}
        </span>
      )}
    </button>
  );
}

function ConversationItem({ conv, collapsed, active, onPin, onRename, onDelete, onSelect }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [renaming, setRenaming] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [draft, setDraft] = useState(conv.title);
  const btnRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      const menu = document.getElementById('sidebar-ctx-menu');
      if (menu && !menu.contains(e.target) && btnRef.current && !btnRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  useEffect(() => {
    if (renaming && inputRef.current) inputRef.current.focus();
  }, [renaming]);

  const openMenu = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, left: rect.right - 160 });
    }
    setMenuOpen((v) => !v);
  };

  const commitRename = () => {
    if (draft.trim()) onRename(conv.id, draft.trim());
    setRenaming(false);
  };

  if (collapsed) {
    return (
      <button title={conv.title} className="cursor-pointer w-full flex items-center justify-center px-3 py-2.5 rounded-lg text-gray-500 dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#131E29] dark:hover:text-white transition-colors duration-200">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-white/30" />
      </button>
    );
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className={`relative group flex items-center gap-1.5 px-2 py-2 rounded-lg transition-colors duration-200 cursor-pointer ${active ? 'bg-[#EC6608]/10 dark:bg-[#EC6608]/15' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
        onClick={() => !renaming && onSelect?.(conv.id)}
      >
        {renaming ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenaming(false); }}
            className="flex-1 text-xs bg-transparent border-b border-[#EC6608] outline-none text-[#131E29] dark:text-white"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className={`flex-1 text-xs truncate ${active ? 'text-[#EC6608] font-medium' : 'text-gray-600 dark:text-white/70'}`}>{conv.title}</span>
        )}

        {conv.pinned ? (
          <span className="relative flex-shrink-0 w-6 h-6 flex items-center justify-center">
            <Pin size={11} className={`text-[#EC6608] transition-opacity absolute ${menuOpen ? 'opacity-0' : 'group-hover:opacity-0'}`} />
            <button
              ref={btnRef}
              onClick={(e) => { e.stopPropagation(); openMenu(); }}
              className={`cursor-pointer p-1 rounded text-gray-400 hover:text-[#131E29] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all absolute ${menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'}`}
            >
              <MoreHorizontal size={14} />
            </button>
          </span>
        ) : (
          <button
            ref={btnRef}
            onClick={(e) => { e.stopPropagation(); openMenu(); }}
            className="cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded text-gray-400 hover:text-[#131E29] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
          >
            <MoreHorizontal size={14} />
          </button>
        )}
      </motion.div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="sidebar-ctx-menu"
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.15 }}
            style={{ top: menuPos.top, left: menuPos.left }}
            className="fixed z-[9999] w-40 bg-white dark:bg-[#2c3033] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-1 overflow-hidden"
          >
            <ContextMenuItem icon={Pin} label={conv.pinned ? 'Desafixar' : 'Fixar'} onClick={() => { onPin(conv.id); setMenuOpen(false); }} />
            <ContextMenuItem icon={Pencil} label="Renomear" onClick={() => { setRenaming(true); setMenuOpen(false); }} />
            <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
            <ContextMenuItem icon={Trash2} label="Excluir" danger onClick={() => { setConfirmDelete(true); setMenuOpen(false); }} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDelete && (
          <DeleteConfirmModal
            label={conv.title}
            onConfirm={() => { onDelete(conv.id); setConfirmDelete(false); }}
            onCancel={() => setConfirmDelete(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function ContextMenuItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors duration-150
        ${danger
          ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#131E29] dark:hover:text-white'
        }`}
    >
      <Icon size={13} className="flex-shrink-0" />
      {label}
    </button>
  );
}

function DeleteConfirmModal({ label, onConfirm, onCancel }) {
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 8 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#323639] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-80 mx-4"
      >
        <h3 className="text-sm font-semibold text-[#131E29] dark:text-white mb-3">Excluir conversa?</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
          A conversa <strong className="text-gray-700 dark:text-gray-200">"{label}"</strong> será excluída permanentemente e não poderá ser recuperada.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="cursor-pointer px-4 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#2c3033] hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="cursor-pointer px-4 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-200"
          >
            Excluir
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
