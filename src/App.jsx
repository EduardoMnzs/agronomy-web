import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Workbench from './pages/Workbench';
import Login from './pages/Login';
import Users from './pages/Users';
import IndexDocument from './pages/IndexDocument';

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
        <Route path="/login" element={<Login />} />
        <Route path="/app" element={<Workbench />} />
        <Route path="/users" element={<Users />} />
        <Route path="/index-document" element={<IndexDocument />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
