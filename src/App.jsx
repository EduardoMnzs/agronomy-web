import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Workbench from './pages/Workbench';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/workbench" replace />} />
        <Route path="/app" element={<Workbench />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
