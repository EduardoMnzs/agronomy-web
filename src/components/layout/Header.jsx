import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu, Sun, Moon } from 'lucide-react';

export default function Header({ title = 'Consulta', onOpenMobile, viewMode, setViewMode }) {
  return (
    <header className="h-16 bg-white dark:bg-[#323639] border-b border-gray-200 dark:border-[#2c3033] flex items-center justify-between px-4 md:px-8 shadow-sm z-0 flex-shrink-0 transition-colors duration-300">
      <HeaderLeft title={title} onOpenMobile={onOpenMobile} />
      <HeaderRight viewMode={viewMode} setViewMode={setViewMode} />
    </header>
  );
}

function HeaderLeft({ title, onOpenMobile }) {
  return (
    <div className="flex items-center gap-3">
      {/* Hamburger — mobile only */}
      <button
        onClick={onOpenMobile}
        className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 lg:hidden"
      >
        <Menu size={20} />
      </button>

      <h2 className="text-[#131E29] dark:text-white font-bold text-base md:text-lg truncate transition-colors duration-300">{title}</h2>
    </div>
  );
}

function HeaderRight({ viewMode, setViewMode }) {
  return (
    <div className="flex items-center gap-3 md:gap-6">
      <SearchInput />
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <NotificationButton />
        <div className="w-[1px] h-6 bg-gray-200 dark:bg-[#2c3033] hidden sm:block transition-colors duration-300" />
        <UserInfo />
      </div>
    </div>
  );
}

function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="cursor-pointer relative p-2 text-gray-400 hover:text-[#131E29] dark:hover:text-white transition-colors bg-gray-50 dark:bg-[#2c3033] rounded-full"
      title={isDark ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

function SearchInput() {
  return (
    <div className="relative hidden md:block">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Pesquisar..."
        className="pl-10 pr-4 py-2 text-xs border border-gray-200 dark:border-[#2c3033] rounded-full focus:outline-none focus:border-[#EC6608] focus:ring-2 focus:ring-[#EC6608]/10 transition-all bg-gray-50 dark:bg-[#2c3033] text-[#131E29] dark:text-white placeholder-gray-400 w-48 lg:w-64"
      />
    </div>
  );
}

function NotificationButton() {
  return (
    <button className="cursor-pointer relative p-2 text-gray-400 hover:text-[#131E29] dark:hover:text-white transition-colors bg-gray-50 dark:bg-[#2c3033] rounded-full">
      <Bell size={18} />
      <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#323639] transition-colors duration-300" />
    </button>
  );
}

function UserInfo() {
  return (
    <div className="flex items-center gap-2 md:gap-3 pl-1 md:pl-2">
      <div className="text-right hidden sm:block">
        <p className="text-xs font-bold text-[#131E29] dark:text-white leading-none transition-colors duration-300">Eduardo Menezes</p>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium transition-colors duration-300">Administrador</p>
      </div>
      <div className="w-9 h-9 rounded-full bg-[#EC6608] text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
        EM
      </div>
    </div>
  );
}
