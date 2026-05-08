import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Workbench from './pages/Workbench';
import Login from './pages/Login';
import Users from './pages/Users';
import IndexDocument from './pages/IndexDocument';
import KnowledgeBase from './pages/KnowledgeBase';
import MyDocuments from './pages/MyDocuments';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import RequestAccess from './pages/RequestAccess';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/request-access" element={<RequestAccess />} />
        <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />
        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route path="/app" element={<Workbench />} />
          <Route path="/app/:convId" element={<Workbench />} />
          <Route path="/knowledge-base" element={<KnowledgeBase />} />
          <Route path="/my-documents" element={<MyDocuments />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
          <Route path="/access-requests" element={<Navigate to="/users?tab=requests" replace />} />
          <Route path="/index-document" element={<AdminRoute><IndexDocument /></AdminRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
