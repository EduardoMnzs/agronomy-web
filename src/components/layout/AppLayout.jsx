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
      const last = [...(conv.messages ?? [])].reverse().find((m) => m.role === 'assistant');
      setCitations(last?.citations ?? []);
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
    setConversationId(id);
    setCitations(result.sources ?? []);
    setMessages((prev) => [...prev, { role: 'assistant', content: result.answer, citations: result.sources ?? [] }]);
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
