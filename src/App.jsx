import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Workbench from './pages/Workbench';
import Login from './pages/Login';
import Users from './pages/Users';
import IndexDocument from './pages/IndexDocument';
import KnowledgeBase from './pages/KnowledgeBase';
import PrivateRoute from './components/PrivateRoute';
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
        <Route path="/app" element={<PrivateRoute><Workbench /></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
        <Route path="/knowledge-base" element={<PrivateRoute><KnowledgeBase /></PrivateRoute>} />
        <Route path="/index-document" element={<PrivateRoute><IndexDocument /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
