import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, X, Sparkles, Volume2, Loader2 } from 'lucide-react';
import { syncToServer } from '../syncService';

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<any>(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const commandTimeoutRef = useRef<any>(null);

  const startRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setError(null);
      } catch (e) {
        console.error('Failed to start recognition:', e);
      }
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'ur-PK';

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = (finalTranscript || interimTranscript).toLowerCase();
        setTranscript(text);

        // Wake word: Gemini / جیمنائی
        if (text.includes('جیمنائی') || text.includes('gemini')) {
          if (!isOpen) {
            setIsOpen(true);
            speak('جی، جیمنائی حاضر ہے۔ فرمایئے؟');
          } else if (event.results[event.results.length - 1].isFinal) {
            speak('جی، میں سن رہا ہوں۔ بتائیے؟');
          }
        }

        if (finalTranscript) {
          processCommand(finalTranscript.toLowerCase());
        } else if (interimTranscript) {
          if (commandTimeoutRef.current) clearTimeout(commandTimeoutRef.current);
          commandTimeoutRef.current = setTimeout(() => {
            if (interimTranscript.trim().length > 5) {
              processCommand(interimTranscript.toLowerCase());
            }
          }, 2500);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone permission denied.');
          setIsListening(false);
        } else if (event.error === 'network') {
          setError('Network error with speech recognition.');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        // Only restart if not an error that should stop us
        if (recognitionRef.current && !error) {
          try { recognitionRef.current.start(); } catch(e) {}
        }
      };

      // Do NOT start automatically in useEffect to avoid "not-allowed" without gesture
      // Recognition will be started when the user first clicks the assistant button

      if (synthesisRef.current && synthesisRef.current.onvoiceschanged !== undefined) {
        synthesisRef.current.onvoiceschanged = () => {
          synthesisRef.current.getVoices();
        };
      }
    }
  }, [error]);

  const toggleAssistant = () => {
    if (!isOpen) {
      setIsOpen(true);
      if (!isListening) {
        startRecognition();
      }
    } else {
      setIsOpen(false);
    }
  };

  const speak = (text: string) => {
    if (!synthesisRef.current) return;
    synthesisRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synthesisRef.current.getVoices();
    const urduVoice = voices.find((v: any) => v.lang.includes('ur') || v.lang.includes('hi'));
    if (urduVoice) {
      utterance.voice = urduVoice;
      utterance.lang = urduVoice.lang;
    } else {
      utterance.lang = 'ur-PK';
    }
    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;
    synthesisRef.current.speak(utterance);
    setResponse(text);
  };

  const processCommand = async (cmd: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setTranscript('');
    if (commandTimeoutRef.current) clearTimeout(commandTimeoutRef.current);

    const text = cmd.replace('جیمنائی', '').replace('gemini', '').trim();
    if (!text || text.length < 2) {
      setIsProcessing(false);
      return;
    }

    try {
      const context = {
        studentCount: JSON.parse(localStorage.getItem('students') || '[]').length,
        staffCount: JSON.parse(localStorage.getItem('staff') || '[]').length,
        currentPath: window.location.pathname,
      };

      const res = await fetch('/api/gemini/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, context }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Gemini API error');
      }
      const data = await res.json();
      
      if (data.response) {
        speak(data.response);
      }

      if (data.command) {
        const { type, target, payload } = data.command;
        if (type === 'NAVIGATE' && target) {
          const navId = `nav-${target}`;
          document.getElementById(navId)?.click();
        } else if (type === 'ADD_FINANCE' && payload) {
          const { amount, name, type: finType } = payload;
          const fin_transactions = JSON.parse(localStorage.getItem('fin_transactions') || '[]');
          const accounts = JSON.parse(localStorage.getItem('fin_accounts') || '[]');
          
          const newTrans = {
            id: `TR-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            title: `جیمنائی انٹری: ${name}`,
            contributor: name,
            headId: '1', accountId: '1', type: finType || 'income', amount: Number(amount)
          };

          localStorage.setItem('fin_transactions', JSON.stringify([newTrans, ...fin_transactions]));
          if (accounts.length > 0) {
            if (finType === 'expense') accounts[0].balance -= Number(amount);
            else accounts[0].balance += Number(amount);
            localStorage.setItem('fin_accounts', JSON.stringify(accounts));
          }
          window.dispatchEvent(new Event('storage_updated'));
          syncToServer();
        }
      }
    } catch (err) {
      console.error(err);
      speak('معذرت، جیمنائی کے ساتھ رابطہ نہیں ہو سکا۔');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4 no-print">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-80 bg-[#0a0f1c] rounded-[32px] shadow-2xl border border-white/10 overflow-hidden mb-4"
          >
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm tracking-widest uppercase">Gemini Assistant</h4>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-blue-100 uppercase font-bold">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-white/5 p-4 rounded-2xl min-h-[80px] flex flex-col gap-2 border border-white/5 relative group">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Listening...</span>
                <p className="text-sm font-urdu text-slate-200 leading-relaxed text-right" dir="rtl">
                  {transcript || 'کچھ بولیں یا "جیمنائی" پکاریں...'}
                </p>
                {isProcessing && (
                  <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  </div>
                )}
                {error && (
                  <div className="mt-2 text-[10px] text-rose-400 font-bold bg-rose-400/10 p-2 rounded-lg border border-rose-400/20">
                    {error === 'Microphone permission denied.' 
                      ? 'مائیکروفون کی اجازت نہیں ملی۔ براہ کرم براؤزر سیٹنگز میں اجازت دیں۔' 
                      : 'سسٹم میں کچھ مسئلہ ہے۔ دوبارہ کوشش کریں۔'}
                    <button 
                      onClick={(e) => { e.stopPropagation(); startRecognition(); }} 
                      className="ml-2 underline hover:text-rose-300"
                    >
                      دوبارہ کوشش کریں
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-cyan-600/10 p-4 rounded-2xl min-h-[80px] flex flex-col gap-2 border border-cyan-500/20">
                <div className="flex items-center justify-between">
                   <Volume2 className="w-3 h-3 text-cyan-400" />
                   <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Gemini Says:</span>
                </div>
                <p className="text-sm font-urdu text-cyan-100 leading-relaxed text-right" dir="rtl">
                  {response || 'جی، میں آپ کی مدد کے لیے تیار ہوں۔'}
                </p>
              </div>

              <div className="flex justify-center relative">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all relative ${
                    isListening ? 'bg-cyan-600/20' : 'bg-slate-800'
                  }`}>
                  {isListening && (
                    <motion.div 
                      animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 bg-cyan-500 rounded-full"
                    />
                  )}
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-cyan-600 shadow-2xl shadow-cyan-500/50' : 'bg-slate-700'}`}>
                    <Mic className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center gap-1.5 h-4">
                {isListening && [1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [4, 16, 4], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                    className="w-1 bg-cyan-500 rounded-full"
                  />
                ))}
              </div>

              <div className="text-center space-y-2">
                <p className="text-[10px] text-slate-500 font-urdu italic">مثال: "جیمنائی، تمام طلبہ کا ریکارڈ دکھاؤ"</p>
                <p className="text-[10px] text-slate-500 font-urdu italic">"جیمنائی، 500 روپے چندہ جمع کرو"</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleAssistant}
        className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-2xl relative overflow-hidden group ${
          isOpen ? 'bg-rose-600 text-white' : 'bg-[#0a0f1c] text-white border border-white/10'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? <X className="w-7 h-7" /> : <Sparkles className="w-7 h-7 text-cyan-400" />}
        {!isOpen && isListening && (
           <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 border-2 border-cyan-500/50 rounded-2xl"
           />
        )}
      </motion.button>
    </div>
  );
}
