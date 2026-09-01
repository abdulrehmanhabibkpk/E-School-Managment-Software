import React, { useState } from 'react';
import { 
  Sparkles, MessageSquare, FileText, Calendar, 
  BookOpen, Brain, Zap, Copy, RefreshCw,
  CreditCard, Bell, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIAssistantModuleProps {
  onBack: () => void;
}

export default function AIAssistantModule({ onBack }: AIAssistantModuleProps) {
  const [activeTool, setActiveTool] = useState<'report-card' | 'fee-reminder' | 'notice' | 'quiz' | 'planner' | 'homework'>('report-card');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const tools = [
    { id: 'report-card', name: 'Report Card Comments', icon: FileText, desc: 'Generate personalized student feedback based on performance.' },
    { id: 'fee-reminder', name: 'Fee Reminders', icon: CreditCard, desc: 'Draft polite and professional fee payment reminders for parents.' },
    { id: 'notice', name: 'Notice Generator', icon: Bell, desc: 'Create school circulars and announcements for any event.' },
    { id: 'quiz', name: 'Quiz Generator', icon: Brain, desc: 'Generate test questions from a topic or text snippet.' },
    { id: 'planner', name: 'Event Planner', icon: Calendar, desc: 'Plan school functions, sports days, or exams with detailed schedules.' },
    { id: 'homework', name: 'Homework Helper', icon: BookOpen, desc: 'Explain complex topics or create homework tasks for students.' },
  ];

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setOutput('');

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: activeTool, input })
      });
      const data = await response.json();
      setOutput(data.text);
    } catch (error) {
      console.error(error);
      setOutput("Error generating content. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert('Copied to clipboard!');
  };

  return (
    <div className="flex flex-col h-full bg-[#F9FAFB] animate-fade-in">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              AI Education Assistant <Sparkles className="w-5 h-5 text-indigo-600" />
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider">
          <span className="hover:text-indigo-600 cursor-pointer" onClick={onBack}>Dashboard</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-600">AI Assistant</span>
        </div>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-y-auto custom-scrollbar">
        {/* Sidebar: Tools Selector */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-4">Select AI Tool</h3>
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => { setActiveTool(tool.id as any); setOutput(''); }}
              className={`w-full p-4 rounded-2xl border transition-all text-left flex items-start gap-4 ${
                activeTool === tool.id 
                  ? 'bg-white border-indigo-200 shadow-md ring-4 ring-indigo-50' 
                  : 'bg-transparent border-transparent hover:bg-slate-100 text-slate-500'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${activeTool === tool.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                <tool.icon className="w-5 h-5" />
              </div>
              <div>
                <div className={`text-sm font-black mb-0.5 ${activeTool === tool.id ? 'text-slate-800' : 'text-slate-600'}`}>{tool.name}</div>
                <div className="text-[10px] font-medium leading-relaxed opacity-70">{tool.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Main Content: Input & Output */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" /> 
                Provide Details for {tools.find(t => t.id === activeTool)?.name}
              </label>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={
                  activeTool === 'report-card' ? "e.g. Student Name: Ali, Performance: 85% in Math, 60% in English, very active in sports." :
                  activeTool === 'fee-reminder' ? "e.g. Month: September, Deadline: 10th, School Name: Bright Public School." :
                  "Enter any details, names, or topics here..."
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all min-h-[120px] resize-none"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !input.trim()}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              {isLoading ? "AI is generating..." : "Generate with Magic"}
            </button>
          </div>

          <AnimatePresence>
            {output && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Generated Content</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={copyToClipboard} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-indigo-600 transition-colors shadow-sm">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="p-8">
                  <div className="prose prose-slate max-w-none">
                    <div className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap text-sm italic">
                      "{output}"
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
