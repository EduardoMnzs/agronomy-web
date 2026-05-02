import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import LeftColumn from '../components/workbench/LeftColumn';
import CenterColumn from '../components/workbench/CenterColumn';
import RightColumn from '../components/workbench/RightColumn';

export default function Workbench() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="h-screen w-screen bg-[#F7F7FF] dark:bg-[#2c3033] flex overflow-hidden transition-colors duration-300">
      <Sidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Consulta" onOpenMobile={() => setIsMobileOpen(true)} />
        <main className="flex-1 p-3 lg:p-[14px] overflow-y-auto lg:overflow-hidden box-border">
          <div className="flex flex-col lg:grid lg:grid-cols-[260px_minmax(0,1fr)_320px] gap-[14px] lg:h-full">
            <div className="order-2 lg:order-1 h-[450px] lg:h-full lg:min-h-0">
              <LeftColumn />
            </div>
            <div className="order-1 lg:order-2 h-[80vh] lg:h-full lg:min-h-0">
              <CenterColumn />
            </div>
            <div className="order-3 lg:order-3 h-[450px] lg:h-full lg:min-h-0">
              <RightColumn />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
