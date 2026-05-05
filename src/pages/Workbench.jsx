import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/layout/Header';
import LeftColumn from '../components/workbench/LeftColumn';
import CenterColumn from '../components/workbench/CenterColumn';
import RightColumn from '../components/workbench/RightColumn';
import FocusView from '../components/workbench/FocusView';

export default function Workbench() {
  const { setIsMobileOpen, conversationId, messages, citations, onUserMessage, onAssistantReply } = useOutletContext();
  const [viewMode, setViewMode] = useState('focus');
  const [selectedKnowledgeIds, setSelectedKnowledgeIds] = useState([]);

  return (
    <>
      <Header
        title={viewMode === 'focus' ? 'Consulta Rápida' : 'Consulta Avançada'}
        onOpenMobile={() => setIsMobileOpen(true)}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
      <main className={`flex-1 ${viewMode === 'focus' ? 'p-0' : 'p-3'} lg:p-[14px] min-h-0 overflow-y-auto lg:overflow-hidden box-border`}>
        {viewMode === 'focus' ? (
          <FocusView
            onAdvancedClick={() => setViewMode('advanced')}
            messages={messages}
            conversationId={conversationId}
            onUserMessage={onUserMessage}
            onAssistantReply={onAssistantReply}
          />
        ) : (
          <div className="flex flex-col lg:grid lg:grid-cols-[260px_minmax(0,1fr)_320px] gap-[14px] lg:h-full">
            <div className="hidden lg:block lg:order-1 lg:h-full lg:min-h-0">
              <LeftColumn
                selectedIds={selectedKnowledgeIds}
                onSelectionChange={setSelectedKnowledgeIds}
              />
            </div>
            <div className="order-1 lg:order-2 lg:h-full lg:min-h-0">
              <CenterColumn
                onFocusClick={() => setViewMode('focus')}
                selectedKnowledgeIds={selectedKnowledgeIds}
                messages={messages}
                conversationId={conversationId}
                onUserMessage={onUserMessage}
                onAssistantReply={onAssistantReply}
              />
            </div>
            <div className="block lg:order-3 lg:h-full lg:min-h-0 order-2">
              <RightColumn citations={citations} />
            </div>
          </div>
        )}
      </main>
    </>
  );
}
