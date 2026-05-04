import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import LeftColumn from '../components/workbench/LeftColumn';
import CenterColumn from '../components/workbench/CenterColumn';
import RightColumn from '../components/workbench/RightColumn';
import FocusView from '../components/workbench/FocusView';

export default function Workbench() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [viewMode, setViewMode] = useState('focus');
  const [hasAnswer, setHasAnswer] = useState(false);


  return (
    <div className="h-screen w-screen bg-[#F7F7FF] dark:bg-[#2c3033] flex overflow-hidden transition-colors duration-300">
      <Sidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Header
          title={viewMode === 'focus' ? 'Consulta Rápida' : 'Consulta Avançada'}
          onOpenMobile={() => setIsMobileOpen(true)}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
        <main className={`flex-1 ${viewMode === 'focus' ? 'p-0' : 'p-3'} lg:p-[14px] min-h-0 overflow-y-auto lg:overflow-hidden box-border`}>
          {viewMode === 'focus' ? (
            <FocusView onAdvancedClick={() => setViewMode('advanced')} />
          ) : (
            <div className="flex flex-col lg:grid lg:grid-cols-[260px_minmax(0,1fr)_320px] gap-[14px] lg:h-full">
              <div className="hidden lg:block lg:order-1 lg:h-full lg:min-h-0">
                <LeftColumn />
              </div>
              <div className="order-1 lg:order-2 lg:h-full lg:min-h-0">
                <CenterColumn onFocusClick={() => setViewMode('focus')} onAnswered={() => setHasAnswer(true)} />
              </div>
              <div className="block lg:order-3 lg:h-full lg:min-h-0 order-2">
                <RightColumn hasAnswer={hasAnswer} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
