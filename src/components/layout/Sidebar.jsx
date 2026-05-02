import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PanelLeftClose, PanelLeftOpen, Settings, LogOut, SquarePen, Clock, Folder, Book, Upload, Users, Sprout } from 'lucide-react';
import agronomyLogo from '../../assets/images/Agronomy-logo.png';

const NAV_ITEMS = [
  { id: 'consulta', label: 'Consulta', icon: SquarePen },
  { id: 'historico', label: 'Histórico', icon: Clock },
  { id: 'documentos', label: 'Meus documentos', icon: Folder },
  { id: 'base', label: 'Base de conhecimento', icon: Book },
  { id: 'indexar', label: 'Indexar documento', icon: Upload },
  { id: 'usuarios', label: 'Usuários', icon: Users },
];

const SidebarContent = ({ isCollapsed, currentRoute, onNavigate, onCloseMobile, onToggleCollapse }) => (
  <>
    <SidebarBrand isCollapsed={isCollapsed} onCloseMobile={onCloseMobile} />
    <SidebarNav
      currentRoute={currentRoute}
      onNavigate={onNavigate}
      isCollapsed={isCollapsed}
      onCloseMobile={onCloseMobile}
    />
    <CollapseToggle isCollapsed={isCollapsed} onToggle={onToggleCollapse} />
    <SidebarBottomActions isCollapsed={isCollapsed} onNavigate={onNavigate} onCloseMobile={onCloseMobile} />
    <SidebarFooter isCollapsed={isCollapsed} />
  </>
);

export default function Sidebar({ isMobileOpen, onCloseMobile }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('consulta');

  const onToggleCollapse = () => setIsCollapsed(!isCollapsed);
  const onNavigate = (id) => setCurrentRoute(id);

  return (
    <>
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 z-20 lg:hidden"
              onClick={onCloseMobile}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-[#323639] border-r border-gray-200 dark:border-transparent h-screen flex flex-col text-[#131E29] dark:text-white shadow-xl flex-shrink-0 lg:hidden overflow-hidden"
            >
              <SidebarContent 
                isCollapsed={false} 
                currentRoute={currentRoute} 
                onNavigate={onNavigate} 
                onCloseMobile={onCloseMobile} 
                onToggleCollapse={onToggleCollapse} 
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside
        className={`
          hidden lg:flex relative inset-y-0 left-0 z-30
          bg-white dark:bg-[#323639] border-r border-gray-200 dark:border-transparent h-screen flex-col text-[#131E29] dark:text-white shadow-xl flex-shrink-0
          overflow-hidden transition-[width,background-color,border-color] duration-300 ease-in-out
          ${isCollapsed ? 'w-[72px]' : 'w-64'}
        `}
      >
        <SidebarContent 
          isCollapsed={isCollapsed} 
          currentRoute={currentRoute} 
          onNavigate={onNavigate} 
          onCloseMobile={onCloseMobile} 
          onToggleCollapse={onToggleCollapse} 
        />
      </aside>
    </>
  );
}

function SidebarBrand({ isCollapsed, onCloseMobile }) {
  return (
    <div className={`px-4 flex items-center border-b border-gray-100 dark:border-white/5 h-16 flex-shrink-0 transition-colors duration-300 ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
      <img src={agronomyLogo} alt="Agronomy Logo" className="w-8 h-8 object-contain flex-shrink-0" />

      <div className={`flex flex-col min-w-0 flex-1 transition-[opacity] duration-150 ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100 delay-150'}`}>
        <div className="text-xl tracking-tight leading-none whitespace-nowrap text-[#131E29] dark:text-white transition-colors duration-300">
          <span className="font-bold">AGRONO</span>
          <span className="font-light">MY</span>
        </div>
        <p className="text-[10px] text-[#EC6608] font-mono uppercase tracking-[0.2em] mt-1 whitespace-nowrap">
          Knowledge
        </p>
      </div>

      <button
        onClick={onCloseMobile}
        className={`flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:text-[#131E29] dark:text-white/30 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex-shrink-0 lg:hidden ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <X size={16} />
      </button>
    </div>
  );
}

function SidebarNav({ currentRoute, onNavigate, isCollapsed, onCloseMobile }) {
  function handleNavigate(id) {
    onNavigate(id);
    onCloseMobile();
  }

  return (
    <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
      <div className={`text-[10px] font-bold text-gray-400 dark:text-white/30 mb-4 px-2 uppercase tracking-widest mt-2 whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100 delay-150'}`}>
        Navegação
      </div>
      {NAV_ITEMS.map((item) => (
        <NavItem
          key={item.id}
          item={item}
          isActive={currentRoute === item.id}
          isCollapsed={isCollapsed}
          onClick={() => handleNavigate(item.id)}
        />
      ))}
    </nav>
  );
}

function NavItem({ item, isActive, isCollapsed, onClick }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      title={isCollapsed ? item.label : undefined}
      className={`cursor-pointer w-full flex items-center px-3 py-3 rounded-sm transition-colors duration-200 text-sm
        ${isCollapsed ? 'justify-center gap-0' : 'gap-3'}
        ${isActive
          ? 'bg-[#EC6608] text-white font-semibold shadow-sm'
          : 'text-gray-500 dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#131E29] dark:hover:text-white'
        }`}
    >
      <Icon size={18} className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400 dark:text-white/40'}`} />
      <span className={`whitespace-nowrap overflow-hidden transition-[opacity,width] duration-150 ${isCollapsed ? 'opacity-0 w-0 min-w-0' : 'opacity-100 delay-150'}`}>
        {item.label}
      </span>
    </button>
  );
}

function CollapseToggle({ isCollapsed, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="hidden cursor-pointer lg:flex items-center justify-center gap-2 w-full py-3 border-t border-gray-100 dark:border-white/5 text-gray-500 dark:text-white/60 hover:text-[#131E29] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-200 flex-shrink-0 text-sm"
    >
      {isCollapsed
        ? <PanelLeftOpen size={18} className="text-gray-400 dark:text-white/40 flex-shrink-0" />
        : <>
          <PanelLeftClose size={18} className="text-gray-400 dark:text-white/40 flex-shrink-0" />
          <span className="whitespace-nowrap">Recolher</span>
        </>
      }
    </button>
  );
}

function SidebarBottomActions({ isCollapsed, onNavigate, onCloseMobile }) {
  return (
    <div className="p-3 border-t border-gray-100 dark:border-white/5 space-y-1 transition-colors duration-300">
      <button
        onClick={() => { onNavigate('settings'); onCloseMobile(); }}
        className={`cursor-pointer w-full flex items-center px-3 py-3 rounded-sm transition-colors duration-200 text-sm text-gray-500 dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#131E29] dark:hover:text-white ${isCollapsed ? 'justify-center gap-0' : 'gap-3'}`}
        title={isCollapsed ? 'Configurações' : undefined}
      >
        <Settings size={18} className="flex-shrink-0 text-gray-400 dark:text-white/40" />
        <span className={`whitespace-nowrap overflow-hidden transition-[opacity,width] duration-150 ${isCollapsed ? 'opacity-0 w-0 min-w-0' : 'opacity-100 delay-150'}`}>
          Configurações
        </span>
      </button>
      <button
        onClick={() => { console.log('logout'); }}
        className={`cursor-pointer w-full flex items-center px-3 py-3 rounded-sm transition-colors duration-200 text-sm text-red-500/80 dark:text-red-400/80 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 ${isCollapsed ? 'justify-center gap-0' : 'gap-3'}`}
        title={isCollapsed ? 'Sair' : undefined}
      >
        <LogOut size={18} className="flex-shrink-0 text-red-500/60 dark:text-red-400/60" />
        <span className={`whitespace-nowrap overflow-hidden transition-[opacity,width] duration-150 ${isCollapsed ? 'opacity-0 w-0 min-w-0' : 'opacity-100 delay-150'}`}>
          Sair
        </span>
      </button>
    </div>
  );
}

function SidebarFooter({ isCollapsed }) {
  return (
    <div className={`bg-gray-50 dark:bg-[#2c3033] border-t border-gray-100 dark:border-white/5 text-[10px] font-medium text-gray-400 dark:text-white/20 text-center uppercase tracking-tighter flex-shrink-0 overflow-hidden whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 py-0 h-0' : 'opacity-100 p-4 delay-150'}`}>
      AGRONOMY ASSISTANT <br />
      &copy; 2026 EDUARDO MENEZES
    </div>
  );
}