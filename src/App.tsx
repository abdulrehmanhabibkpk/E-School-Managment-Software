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
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [hasPassedGate, setHasPassedGate] = useState(() => {
    return sessionStorage.getItem('passed_security_gate') === 'true';
  });

  const handleLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
    logActivity('User Logged In', 'Security');
    pullGlobalData();
  };

  const handlePassGate = () => {
    sessionStorage.setItem('passed_security_gate', 'true');
    setHasPassedGate(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('passed_security_gate');
    setHasPassedGate(false);
    setIsLoggedIn(false);
  };

  useEffect(() => {
    if (isLoggedIn) {
      pullGlobalData(); // Initial data fetch
      startRealTimeSync();
      return () => {
        stopRealTimeSync();
      };
    }
  }, [isLoggedIn]);

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
        <Route path="/login" element={<AuthSystem onLogin={handleLogin} />} />
        <Route path="/admission-form" element={<PublicAdmissionForm />} />
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              {hasPassedGate ? (
                <Dashboard onLogout={handleLogout} />
              ) : (
                <SecurityGate 
                  onSuccess={handlePassGate} 
                  userEmail={localStorage.getItem('currentUser') || 'Unknown'} 
                />
              )}
            </ProtectedRoute>
          } 
        />
        {/* Redirect base / or /dashboard without trailing slash to dashboard */}
        <Route path="/" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

