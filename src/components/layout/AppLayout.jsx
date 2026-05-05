import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { conversations as convsApi } from '../../api/api';

export default function AppLayout() {
  const navigate = useNavigate();
  const { convId: convIdParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [citations, setCitations] = useState([]);
  const [newConversationEntry, setNewConversationEntry] = useState(null);

  const loadConversation = async (id) => {
    try {
      const conv = await convsApi.get(id);
      setConversationId(conv.id);
      setMessages(conv.messages ?? []);
      const seen = new Set();
      const allCitations = (conv.messages ?? [])
        .filter((m) => m.role === 'assistant')
        .flatMap((m) => m.citations ?? [])
        .filter((c) => {
          const key = `${c.doc_name}:${c.page}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      setCitations(allCitations);
      navigate(`/app/${id}`);
      setIsMobileOpen(false);
    } catch {}
  };

  useEffect(() => {
    const convId = searchParams.get('conv');
    if (convId) {
      setSearchParams({}, { replace: true });
      loadConversation(convId);
    } else if (convIdParam && !conversationId) {
      loadConversation(convIdParam);
    }
  }, []);

  const onUserMessage = (text) => {
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
  };

  const onAssistantReply = (question, result) => {
    const id = result.conversation_id;
    const newSources = result.sources ?? [];
    setConversationId(id);
    setCitations((prev) => {
      const existing = new Set(prev.map((c) => `${c.doc_name}:${c.page}`));
      const fresh = newSources.filter((c) => !existing.has(`${c.doc_name}:${c.page}`));
      return [...prev, ...fresh];
    });
    setMessages((prev) => [...prev, { role: 'assistant', content: result.answer, citations: newSources }]);
    if (id) {
      setNewConversationEntry({
        id,
        title: question.slice(0, 60),
        pinned: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      navigate(`/app/${id}`, { replace: true });
    }
  };

  const resetConversation = () => {
    setConversationId(null);
    setMessages([]);
    setCitations([]);
    navigate('/app');
  };

  return (
    <div className="h-screen w-screen bg-[#F7F7FF] dark:bg-[#2c3033] flex overflow-hidden transition-colors duration-300">
      <Sidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        onSelectConversation={loadConversation}
        onNewConversation={resetConversation}
        activeConversationId={convIdParam}
        newConversationEntry={newConversationEntry}
        onConversationEntryAdded={() => setNewConversationEntry(null)}
      />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Outlet context={{ setIsMobileOpen, conversationId, messages, citations, onUserMessage, onAssistantReply, resetConversation }} />
      </div>
    </div>
  );
}
