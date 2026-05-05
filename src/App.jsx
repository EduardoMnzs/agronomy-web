import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Workbench from './pages/Workbench';
import Login from './pages/Login';
import Users from './pages/Users';
import IndexDocument from './pages/IndexDocument';
import KnowledgeBase from './pages/KnowledgeBase';
import PrivateRoute from './components/PrivateRoute';
import AppLayout from './components/layout/AppLayout';
import { session } from './api/api';

function App() {
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={session.isAuthenticated() ? <Navigate to="/app" replace /> : <Login />} />
        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route path="/app" element={<Workbench />} />
          <Route path="/app/:convId" element={<Workbench />} />
          <Route path="/users" element={<Users />} />
          <Route path="/knowledge-base" element={<KnowledgeBase />} />
          <Route path="/index-document" element={<IndexDocument />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
