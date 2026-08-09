import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Lock, Mail, Landmark, Award, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PublicResultPortal from './PublicResultPortal';

interface AuthProps {
  onLogin: () => void;
}

export default function AuthSystem({ onLogin }: AuthProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResultPortal, setShowResultPortal] = useState(false);

  const [systemSettings, setSystemSettings] = useState(() => {
    const saved = localStorage.getItem('system_settings');
    return saved ? JSON.parse(saved) : {
      jamiaName: 'Modern School Academy',
      monogram: ''
    };
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('system_settings');
        if (saved) {
          setSystemSettings(JSON.parse(saved));
        }
      } catch (err) {}
    };
    window.addEventListener('storage_updated', handleUpdate);
    return () => window.removeEventListener('storage_updated', handleUpdate);
  }, []);

  const handleGoogleLogin = async () => {
    setError('Google login is currently disabled in local mode.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      // Mock Admin Login
      if (normalizedEmail === 'admin@school.com' && password === 'admin123') {
        localStorage.setItem('currentUser', normalizedEmail);
        localStorage.setItem('currentUserName', 'School Admin');
        localStorage.setItem('currentUserRole', 'Admin');
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('isSuperAdmin', 'true');
        localStorage.setItem('userStatus', 'accepted');
        localStorage.setItem('paymentStatus', 'paid');
        onLogin();
        navigate('/dashboard');
        return;
      }

      // Check Master credentials (backward compatibility)
      if (normalizedEmail === 'jamiaarabiasirajululoomjabori@gmail.com' && password === 'jamiaarabiasirajululoomjabori') {
         localStorage.setItem('currentUser', normalizedEmail);
         localStorage.setItem('currentUserName', 'System Admin');
         localStorage.setItem('currentUserRole', 'Admin');
         localStorage.setItem('isLoggedIn', 'true');
         localStorage.setItem('isSuperAdmin', 'true');
         localStorage.setItem('userStatus', 'accepted');
         localStorage.setItem('paymentStatus', 'paid');
         onLogin();
         navigate('/dashboard');
         return;
      }

      // Check local users
      let registeredUsers: any[] = [];
      const localUsersStr = localStorage.getItem('users');
      if (localUsersStr) {
        try {
          registeredUsers = JSON.parse(localUsersStr);
        } catch (e) {}
      }

      const foundLocal = registeredUsers.find((u: any) => 
        (u.username?.toLowerCase() === normalizedEmail || u.email?.toLowerCase() === normalizedEmail) && 
        u.password === password
      );

      if (foundLocal) {
        localStorage.setItem('currentUser', foundLocal.email || foundLocal.username);
        localStorage.setItem('currentUserName', foundLocal.username || (foundLocal.email || foundLocal.username).split('@')[0]);
        localStorage.setItem('currentUserRole', foundLocal.role || 'Teacher');
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('paymentStatus', 'paid');
        localStorage.setItem('userStatus', 'accepted');
        
        if (foundLocal.role === 'Admin') {
          localStorage.setItem('isSuperAdmin', 'true');
        }
        
        onLogin();
        navigate('/dashboard');
        return;
      }

      setError('Invalid username or password. Please try again.');
    } catch (err) {
      setError('A technical error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-slate-50 overflow-y-auto" dir="ltr">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[1000px] bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-slate-100 flex flex-col md:flex-row relative z-10 shadow-slate-200/50"
      >
        {/* Branding Side (Left) */}
        <div className="md:flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
               <circle cx="0" cy="0" r="50" fill="white" fillOpacity="0.1" />
               <circle cx="100" cy="100" r="30" fill="white" fillOpacity="0.1" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl overflow-hidden border border-white/20">
                {systemSettings.monogram ? (
                  <img src={systemSettings.monogram} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Landmark className="w-7 h-7 text-white" />
                )}
              </div>
              <div className="flex flex-col">
                 <span className="text-xl font-bold tracking-tight">{systemSettings.jamiaName}</span>
                 <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">Management Portal</span>
              </div>
            </div>
            
            <div className="space-y-8">
              <h1 className="text-5xl font-bold leading-tight tracking-tight">
                Modern <br />
                <span className="text-white/70">Education.</span>
              </h1>
              <div className="space-y-4">
                <p className="text-white/80 text-xl leading-relaxed">
                  A comprehensive, organized, and professional educational management system for {systemSettings.jamiaName}.
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-[10px] text-white/40 space-y-1 uppercase tracking-widest font-bold">
            <div>&copy; 2024 {systemSettings.jamiaName}</div>
            <div className="text-white/60">Professional ERP Solution V3</div>
          </div>
        </div>

        {/* Form Side (Right) */}
        <div className="md:flex-[1.2] p-8 md:p-16 flex flex-col justify-center bg-white">
          <div className="mb-10 text-left">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Sign In
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Use your credentials to access the administrative dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Username or Email</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all pl-12"
                  placeholder="Enter your username"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-bold text-slate-700">Password</label>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Protected Access</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all pl-12"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-xs font-bold">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>

            <div className="relative flex items-center justify-center my-6">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-[10px] text-slate-300 uppercase tracking-widest font-bold">OR</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            <button 
              type="button" 
              onClick={() => setShowResultPortal(true)}
              className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 py-4 rounded-2xl font-bold text-center transition-all flex items-center justify-center gap-2 border border-rose-100"
            >
              <Award className="w-5 h-5" />
              <span>Public Result Portal (Guest)</span>
            </button>
          </form>
        </div>
      </motion.div>
      <AnimatePresence>
        {showResultPortal && (
          <PublicResultPortal onClose={() => setShowResultPortal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
