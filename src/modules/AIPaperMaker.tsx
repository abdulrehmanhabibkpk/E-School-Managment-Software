/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Sparkles, FileDown, Loader2, Plus, Trash2, FileText, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Question {
  text: string;
  marks: number;
  options?: string[];
}

interface Section {
  sectionTitle: string;
  questions: Question[];
}

interface Paper {
  title: string;
  sections: Section[];
}

export default function AIPaperMaker() {
  const [loading, setLoading] = useState(false);
  const [paper, setPaper] = useState<Paper | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState({
    subject: '',
    className: '',
    difficulty: 'Medium',
    topics: '',
    marks: 100,
    questionTypes: ['MCQ', 'Short', 'Long']
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      setError(null);
      const response = await fetch('/api/generate-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setPaper(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate paper. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!paper) return;
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(paper, null, 2)], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${paper.title.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Paper Maker</h1>
        <p className="text-slate-500 mt-1">Generate professional exam papers in seconds using AI.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm h-fit">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Sparkles size={20} className="text-indigo-600" />
            Configuration
          </h3>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <input 
                type="text" 
                placeholder="e.g. Mathematics"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={config.subject}
                onChange={(e) => setConfig({...config, subject: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Class / Grade</label>
              <input 
                type="text" 
                placeholder="e.g. 10th Grade"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={config.className}
                onChange={(e) => setConfig({...config, className: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
              <select 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={config.difficulty}
                onChange={(e) => setConfig({...config, difficulty: e.target.value})}
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Specific Topics</label>
              <textarea 
                placeholder="e.g. Calculus, Trigonometry, Algebra"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-24 resize-none"
                value={config.topics}
                onChange={(e) => setConfig({...config, topics: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Total Marks: {config.marks}</label>
              <input 
                type="range" 
                min="10" 
                max="100" 
                step="5"
                className="w-full accent-indigo-600"
                value={config.marks}
                onChange={(e) => setConfig({...config, marks: parseInt(e.target.value)})}
              />
            </div>

            <button 
              disabled={loading || !config.subject || !config.className}
              onClick={handleGenerate}
              className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:bg-indigo-300 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate Paper
                </>
              )}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {paper ? (
              <motion.div
                key="paper-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-12 border border-slate-200 rounded-2xl shadow-sm min-h-[600px] relative group"
              >
                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={handleDownload}
                    className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                    title="Download PDF"
                  >
                    <FileDown size={20} />
                  </button>
                  <button 
                    onClick={() => setPaper(null)}
                    className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="text-center border-b-2 border-double border-slate-200 pb-8 mb-8">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                      E
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">EduCore International School</h2>
                      <p className="text-sm text-slate-500 font-medium">Annual Examination Session 2024-25</p>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 underline decoration-indigo-500/30 underline-offset-8 decoration-2">{paper.title}</h3>
                  <div className="flex justify-between mt-8 text-sm font-semibold text-slate-600">
                    <span>Subject: {config.subject}</span>
                    <span>Class: {config.className}</span>
                    <span>Max Marks: {config.marks}</span>
                    <span>Time: 3 Hours</span>
                  </div>
                </div>

                <div className="space-y-8">
                  {paper.sections.map((section, sIdx) => (
                    <div key={sIdx}>
                      <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">
                        {section.sectionTitle}
                      </h4>
                      <div className="space-y-6">
                        {section.questions.map((q, qIdx) => (
                          <div key={qIdx} className="flex justify-between gap-4">
                            <div className="flex-1">
                              <p className="text-slate-800 leading-relaxed">
                                <span className="font-bold mr-2">Q{qIdx + 1}.</span>
                                {q.text}
                              </p>
                              {q.options && (
                                <div className="grid grid-cols-2 gap-2 mt-3 ml-6">
                                  {q.options.map((opt, oIdx) => (
                                    <div key={oIdx} className="text-sm text-slate-600">
                                      ({String.fromCharCode(97 + oIdx)}) {opt}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <span className="text-sm font-bold text-slate-400 shrink-0">[{q.marks}]</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-16 pt-8 border-t border-slate-100 text-center italic text-slate-400 text-sm">
                  --- END OF QUESTION PAPER ---
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl h-[600px] flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm mb-6">
                  <FileText size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">No Paper Generated</h3>
                <p className="text-slate-500 mt-2 max-w-sm">
                  Configure the parameters on the left and click "Generate Paper" to create a custom exam paper.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
