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
import ParentPortal from './components/ParentPortal';
import { AppProvider } from './context/AppContext';
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
  const isParentLoggedIn = localStorage.getItem('isParentLoggedIn') === 'true';

  useEffect(() => {
    if (isLoggedIn) {
      if (isParentLoggedIn) {
        navigate('/parent-portal', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isLoggedIn, isParentLoggedIn, navigate]);

  return (
    <LandingView 
      onOpenLogin={() => navigate('/')}
      onLoginSuccess={() => {
        const isParent = localStorage.getItem('isParentLoggedIn') === 'true';
        if (isParent) {
          navigate('/parent-portal');
        } else {
          navigate('/dashboard');
        }
      }}
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
    localStorage.removeItem('isParentLoggedIn');
    localStorage.removeItem('parent_portal_cnic');
    localStorage.removeItem('parent_portal_students');
    window.dispatchEvent(new Event('storage_updated'));
  };

  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [isParentLoggedIn, setIsParentLoggedIn] = useState(() => localStorage.getItem('isParentLoggedIn') === 'true');

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
      setIsParentLoggedIn(localStorage.getItem('isParentLoggedIn') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage_updated', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn && !isParentLoggedIn) {
      pullGlobalData().then(() => {
        startRealTimeSync();
      });
    }
    return () => {
      stopRealTimeSync();
    };
  }, [isLoggedIn, isParentLoggedIn]);

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
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/accounts/login" element={<Navigate to="/" replace />} />
          <Route path="/admission-form" element={<PublicAdmissionForm />} />
          <Route path="/parent-portal" element={<ParentPortal onLogout={handleLogout} />} />
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
  );
}

