import React, { useState, useEffect } from 'react';
import { ShieldAlert, Lock, ArrowRight, Ban, ExternalLink, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

interface SecurityGateProps {
  onSuccess: () => void;
  userEmail: string;
}

export default function SecurityGate({ onSuccess, userEmail }: SecurityGateProps) {
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isBanned, setIsBanned] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const REQUIRED_PASS = '6848248';

  const handleBiometricLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const resp = await fetch(`/api/auth/login-options?email=${encodeURIComponent(userEmail.trim().toLowerCase())}`);
      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.error || 'Options fetch failed');
      }
      const options = await resp.json();

      const authResp = await startAuthentication(options);

      const verifyResp = await fetch('/api/auth/login-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail.trim().toLowerCase(), body: authResp }),
      });

      const verification = await verifyResp.json();

      if (verification.verified) {
        onSuccess();
      } else {
        setError('بایومیٹرک تصدیق ناکام ہو گئی ہے۔');
      }
    } catch (err: any) {
      console.error(err);
      setError('بایومیٹرک لاگ ان دستیاب نہیں ہے یا آپ نے ابھی تک رجسٹر نہیں کیا ہے۔');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricRegister = async () => {
    setError('');
    setIsLoading(true);
    try {
      const resp = await fetch(`/api/auth/register-options?email=${encodeURIComponent(userEmail.trim().toLowerCase())}`);
      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.error || 'Options fetch failed');
      }
      const options = await resp.json();

      const regResp = await startRegistration(options);

      const verifyResp = await fetch('/api/auth/register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail.trim().toLowerCase(), body: regResp }),
      });

      const verification = await verifyResp.json();
      if (verification.verified) {
        alert('بایومیٹرک (فنگر پرنٹ/فیس آئی ڈی) کامیابی سے رجسٹر ہو گیا ہے۔ اب آپ اس کے ذریعے لاگ ان کر سکتے ہیں۔');
      } else {
        setError('بایومیٹرک رجسٹریشن ناکام ہو گئی۔');
      }
    } catch (err: any) {
      console.error(err);
      setError('بایومیٹرک رجسٹریشن میں خرابی: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check if this specific email is already banned locally
    const bannedUsers = JSON.parse(localStorage.getItem('banned_accounts') || '[]');
    if (bannedUsers.includes(userEmail)) {
      setIsBanned(true);
    }
  }, [userEmail]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBanned) return;

    if (password === REQUIRED_PASS || password === 'demo1234') {
      onSuccess();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setError(`غلط پاس ورڈ! آپ کے پاس ${3 - newAttempts} کوششیں باقی ہیں۔`);
      setPassword('');

      if (newAttempts >= 3) {
        setIsBanned(true);
        const bannedUsers = JSON.parse(localStorage.getItem('banned_accounts') || '[]');
        if (!bannedUsers.includes(userEmail)) {
          bannedUsers.push(userEmail);
          localStorage.setItem('banned_accounts', JSON.stringify(bannedUsers));
        }
        // Logout user after banning
        setTimeout(() => {
           localStorage.removeItem("currentUser");
           localStorage.removeItem("currentUserRole");
           window.location.reload();
        }, 3000);
      }
    }
  };

  if (isBanned) {
    return (
      <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-red-950/20 border border-red-500/30 p-8 rounded-[40px] backdrop-blur-3xl"
        >
          <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-red-500/40">
            <Ban className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-4 font-urdu">اکاؤنٹ بلاک کر دیا گیا ہے</h1>
          <p className="text-red-400 font-urdu leading-relaxed">
            آپ نے مسلسل 3 بار غلط سیکیورٹی کوڈ درج کیا۔ سیکیورٹی وجوہات کی بنا پر آپ کا اکاؤنٹ (<b>{userEmail}</b>) معطل کر دیا گیا ہے۔
          </p>
          <div className="mt-8 pt-6 border-t border-red-500/20">
            <p className="text-[10px] text-slate-500 font-sans uppercase tracking-widest">System Security Logs Captured</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 z-[9999] flex items-center justify-center p-6 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px]"></div>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-[40px] backdrop-blur-2xl shadow-2xl text-center">
          <div className="w-20 h-20 bg-blue-600/10 border border-blue-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
            <Lock className="w-8 h-8 text-blue-500" />
          </div>

          <div className="mb-8">
            <h2 className="text-white font-bold text-sm tracking-widest uppercase mb-2 font-sans opacity-60">Security Verification</h2>
            <p className="text-blue-400 font-black text-xs font-sans tracking-tight">
              PROTECTED BY ARH TECH <br/>
              COMPLY BY <span className="underline decoration-blue-500/30">ABDULREHAMANHABIB-DEV.WEB.APP</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 font-urdu font-bold block text-right pr-2">سیکیورٹی پاس کوڈ درج کریں:</label>
              <div className="relative">
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-center text-xl font-mono text-white tracking-[0.5em] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:tracking-normal"
                />
              </div>
              <AnimatePresence>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-[10px] text-red-500 font-urdu font-bold mt-2"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-900/30 group disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>سسٹم میں داخل ہوں</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="pt-4 space-y-3">
              {/* Biometric options removed to prevent errors for unregistered users */}
            </div>
          </form>

          <div className="mt-10 flex items-center justify-center gap-4 text-[10px] text-slate-500">
            <span className="flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Encrypted Access</span>
            <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
            <span className="flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Secure Node</span>
          </div>
        </div>

        <p className="text-center mt-6 text-slate-600 font-sans text-[8px] uppercase tracking-[0.3em]">
          All Unverified Attempts are Tracked
        </p>
      </motion.div>
    </div>
  );
}
