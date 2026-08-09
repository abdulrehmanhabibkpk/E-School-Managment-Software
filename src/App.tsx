/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthSystem from './components/AuthSystem';
import Dashboard from './components/Dashboard';
import PublicAdmissionForm from './components/PublicAdmissionForm';
import SecurityGate from './components/SecurityGate';
import AssanSchoolPortal from './components/assan_school_portal/AssanSchoolPortal';
import { startRealTimeSync, stopRealTimeSync, pullGlobalData } from './syncService';
import { logActivity } from './utils/logger';
import { sanitizeLocalStorage } from './lib/dataSanitizer';

function ProtectedRoute({ children, isLoggedIn }: { children: React.ReactNode, isLoggedIn: boolean }) {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const handleLogout = () => {
    // Logout disabled as requested
  };

  useEffect(() => {
    pullGlobalData();
    startRealTimeSync();
    return () => {
      stopRealTimeSync();
    };
  }, []);

  useEffect(() => {
    // Clean up any duplicate IDs in local storage on startup
    sanitizeLocalStorage();
    
    // Preserve the old logic for ?form=admission for backward compatibility
    const params = new URLSearchParams(window.location.search);
    if (params.get('form') === 'admission') {
      window.history.replaceState({}, '', '/admission-form');
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="/admission-form" element={<PublicAdmissionForm />} />
        <Route path="/portal" element={<AssanSchoolPortal />} />
        <Route path="/landing" element={<AssanSchoolPortal />} />
        <Route path="/website" element={<AssanSchoolPortal />} />
        <Route 
          path="/dashboard/*" 
          element={<Dashboard onLogout={handleLogout} />} 
        />
        {/* Landing Page Website */}
        <Route path="/" element={<AssanSchoolPortal />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/portal" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

