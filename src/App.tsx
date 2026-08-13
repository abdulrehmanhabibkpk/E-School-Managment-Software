/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AuthSystem from './components/AuthSystem';
import Dashboard from './components/Dashboard';
import PublicAdmissionForm from './components/PublicAdmissionForm';
import SecurityGate from './components/SecurityGate';
import { LandingView } from './components/assan_school_portal/LandingView';
import { LoginView } from './components/assan_school_portal/LoginView';
import { AppProvider } from './context/AppContext';
import { ApolloProvider } from '@apollo/client';
import { getApolloClient } from './lib/apolloClient';
import { startRealTimeSync, stopRealTimeSync, pullGlobalData } from './syncService';
import { logActivity } from './utils/logger';
import { sanitizeLocalStorage } from './lib/dataSanitizer';

function ProtectedRoute({ children, isLoggedIn }: { children: React.ReactNode, isLoggedIn: boolean }) {
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function LandingRoute() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  return (
    <LandingView 
      onOpenLogin={() => navigate('/')}
      onLoginSuccess={() => navigate('/dashboard')}
    />
  );
}

export default function App() {
  const handleLogout = () => {
    localStorage.removeItem('isSuperAdmin');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUserName');
    localStorage.removeItem('currentUserRole');
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
    <ApolloProvider client={getApolloClient()}>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/accounts/login" element={<Navigate to="/" replace />} />
            <Route path="/admission-form" element={<PublicAdmissionForm />} />
            <Route path="/portal" element={<LandingRoute />} />
            <Route path="/landing" element={<LandingRoute />} />
            <Route path="/website" element={<LandingRoute />} />
            <Route path="/accounts/*" element={<LandingRoute />} />
            <Route 
              path="/dashboard/*" 
              element={<Dashboard onLogout={handleLogout} />} 
            />
            {/* Landing Page Website */}
            <Route path="/" element={<LandingRoute />} />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ApolloProvider>
  );
}

