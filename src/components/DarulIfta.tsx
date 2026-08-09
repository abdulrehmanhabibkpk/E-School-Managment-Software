import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, Printer, FileText, BookOpen, Award, 
  PenTool, HelpCircle, CheckCircle2, Settings, Plus, 
  Trash, Eye, RefreshCw, Layers, ArrowLeft, GraduationCap
} from 'lucide-react';
import { generateNumericId } from '../lib/idUtils';

interface DarulIftaProps {
  onBack: () => void;
}

export default function DarulIfta({ onBack }: DarulIftaProps) {
  const [activeMode, setActiveMode] = useState<'fatwa' | 'exam'>('fatwa');
  const [systemSettings, setSystemSettings] = useState<any>({});
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // 1. Advisory Mode States
  const [fatwaData, setFatwaData] = useState({
    institutionName: 'Modern School Academy',
    fatwaNumber: 'Ref No: 2024/001-A',
    topic: 'Official School Policy Regarding Personal Electronics in Classrooms',
    category: 'Student Affairs / School Policies',
    istifta: `To the School Board,\n\nI am writing to inquire about the specific Shariah and institutional ruling regarding students bringing and using personal electronic devices (smartphones, tablets) during classroom hours. Does the school permit these for educational purposes, or is there a complete prohibition? Please provide a detailed advisory for the student handbook.\n\nFrom: Parent Representative Committee`,
    jawab: `Formal Advisory Response:\n\nHaving reviewed the inquiry, the institution provides the following guidance based on educational best practices and institutional ethics:\n\n1. Personal electronic devices are strictly prohibited during core instruction hours unless specifically authorized by the subject teacher for a defined academic activity.\n2. Inappropriate usage leads to significant distraction and potential misuse, which contradicts the disciplined environment required for effective learning.\n3. Students found with unauthorized devices will have them confiscated for a period of one week.\n\nTherefore, we advise all parents and students to adhere to the zero-tolerance policy regarding personal electronics to ensure the sanctity of the learning environment.\n\nModern School Administration`,
    muftiName: 'Senior Academic Advisor / Board of Trustees',
    sealPhrase: 'Institutional Guidance / Official Record'
  });

  // 2. Exam Mode States
  const [examData, setExamData] = useState({
    institutionName: 'Modern School Academy',
    examTitle: 'Annual Final Assessment 2024-25',
    subject: 'Computer Science & Information Technology',
    totalMarks: '100',
    timeAllowed: '3 Hours',
    dateHijri: 'June 15, 2025',
    instructions: 'Note: All questions are mandatory. Section A is multiple choice, Section B requires descriptive answers. Neatness and clear diagrams carry extra weight.',
    questions: [
      {
        id: 1,
        title: 'Define Cloud Computing and explain its fundamental service models (IaaS, PaaS, SaaS) with real-world examples.',
        marks: '20',
        orOption: 'Explain the OSI Model in detail, describing the primary function of each of the seven layers.',
        subQuestions: [
          '(1) What is the difference between Public and Private clouds?',
          '(2) List three benefits of using cloud-based storage for educational institutions.'
        ]
      },
      {
        id: 2,
        title: 'Discuss the impact of Artificial Intelligence on modern education and its ethical implications in the classroom.',
        marks: '20',
        orOption: '',
        subQuestions: [
          '(1) What is the role of Machine Learning in personalized student learning paths?',
          '(2) How can AI assist in administrative automation for schools?'
        ]
      }
    ]
  });

  useEffect(() => {
    const savedSystem = JSON.parse(localStorage.getItem('system_settings') || '{}');
    setSystemSettings(savedSystem);
    if (savedSystem.jamiaName) {
      setFatwaData(prev => ({ ...prev, institutionName: savedSystem.jamiaName }));
      setExamData(prev => ({ ...prev, institutionName: savedSystem.jamiaName }));
    }
  }, []);

  const handleAddQuestion = () => {
    setExamData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: generateNumericId(),
          title: `Question ${prev.questions.length + 1}: Enter your new question here...`,
          marks: '20',
          orOption: '',
          subQuestions: []
        }
      ]
    }));
  };

  const handleRemoveQuestion = (id: number) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }));
  };

  const handleUpdateQuestion = (id: number, key: string, value: any) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === id ? { ...q, [key]: value } : q)
    }));
  };

  const handleAddSubQuestion = (qId: number) => {
    const targetQ = examData.questions.find(q => q.id === qId);
    if (!targetQ) return;
    const currentSub = targetQ.subQuestions || [];
    const num = currentSub.length + 1;
    const newSub = [...currentSub, `(${num}) Enter sub-question...`];
    handleUpdateQuestion(qId, 'subQuestions', newSub);
  };

  const handleRemoveSubQuestion = (qId: number, index: number) => {
    const targetQ = examData.questions.find(q => q.id === qId);
    if (!targetQ) return;
    const newSub = (targetQ.subQuestions || []).filter((_, idx) => idx !== index);
    handleUpdateQuestion(qId, 'subQuestions', newSub);
  };

  const handleUpdateSubQuestion = (qId: number, index: number, value: string) => {
    const targetQ = examData.questions.find(q => q.id === qId);
    if (!targetQ) return;
    const newSub = [...(targetQ.subQuestions || [])];
    newSub[index] = value;
    handleUpdateQuestion(qId, 'subQuestions', newSub);
  };

  return (
    <div className={`min-h-screen flex flex-col h-full overflow-hidden transition-all duration-300 ${
      theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'
    }`} dir="ltr">
      {/* Top Header */}
      <header className={`h-20 border-b flex items-center justify-between px-8 shrink-0 relative z-20 no-print transition-all duration-300 ${
        theme === 'dark' ? 'bg-slate-900 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
      }`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className={`p-2.5 rounded-xl transition-all active:scale-95 ${
              theme === 'dark' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-500" />
              Institutional Publishing Portal
            </h1>
            <p className={`text-[10px] font-bold font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>DOCUMENT GENERATION & ADVISORY SYSTEM</p>
          </div>
        </div>

        {/* Mode Selector Toggle */}
        <div className={`p-1 rounded-2xl border flex gap-2 transition-all duration-300 ${
          theme === 'dark' ? 'bg-slate-850 border-white/5' : 'bg-slate-100 border-slate-200'
        }`}>
          <button 
            onClick={() => setActiveMode('fatwa')}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeMode === 'fatwa' 
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/10' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Advice & Advisory
          </button>
          <button 
            onClick={() => setActiveMode('exam')}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeMode === 'exam' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Exam Paper Maker
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            className={`p-3 rounded-xl transition-all active:scale-95 border ${
              theme === 'dark' 
                ? 'bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-750' 
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {theme === 'dark' ? <Settings className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
          </button>

          <button 
            onClick={() => window.print()}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg hover:brightness-110 active:scale-95 text-white ${
              activeMode === 'fatwa' ? 'bg-orange-600 shadow-orange-600/10' : 'bg-blue-600 shadow-blue-600/10'
            }`}
          >
            <Printer className="w-4 h-4" />
            Print Preview
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Control Panel */}
        <section className={`w-[400px] border-r flex flex-col overflow-y-auto p-6 custom-scrollbar no-print transition-all duration-300 ${
          theme === 'dark' ? 'bg-slate-900 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
            <Settings className="w-5 h-5 text-slate-400" />
            <h3 className="text-sm font-bold">Document Controls</h3>
          </div>

          {activeMode === 'fatwa' ? (
            <div className="space-y-6">
              <InputField label="Institution Header" value={fatwaData.institutionName} onChange={(v:any) => setFatwaData(prev => ({ ...prev, institutionName: v }))} />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Reference No" value={fatwaData.fatwaNumber} onChange={(v:any) => setFatwaData(prev => ({ ...prev, fatwaNumber: v }))} />
                <InputField label="Policy Category" value={fatwaData.category} onChange={(v:any) => setFatwaData(prev => ({ ...prev, category: v }))} />
              </div>
              <InputField label="Core Topic" value={fatwaData.topic} onChange={(v:any) => setFatwaData(prev => ({ ...prev, topic: v }))} />
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">The Inquiry</label>
                <textarea 
                  rows={4} value={fatwaData.istifta} onChange={(e) => setFatwaData(prev => ({ ...prev, istifta: e.target.value }))}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-xs outline-none focus:border-orange-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Official Response</label>
                <textarea 
                  rows={6} value={fatwaData.jawab} onChange={(e) => setFatwaData(prev => ({ ...prev, jawab: e.target.value }))}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-xs outline-none focus:border-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Authority Name" value={fatwaData.muftiName} onChange={(v:any) => setFatwaData(prev => ({ ...prev, muftiName: v }))} />
                <InputField label="Closing Seal" value={fatwaData.sealPhrase} onChange={(v:any) => setFatwaData(prev => ({ ...prev, sealPhrase: v }))} />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <InputField label="Institution Header" value={examData.institutionName} onChange={(v:any) => setExamData(prev => ({ ...prev, institutionName: v }))} />
              <InputField label="Assessment Title" value={examData.examTitle} onChange={(v:any) => setExamData(prev => ({ ...prev, examTitle: v }))} />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Subject" value={examData.subject} onChange={(v:any) => setExamData(prev => ({ ...prev, subject: v }))} />
                <InputField label="Total Marks" value={examData.totalMarks} onChange={(v:any) => setExamData(prev => ({ ...prev, totalMarks: v }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Time Limit" value={examData.timeAllowed} onChange={(v:any) => setExamData(prev => ({ ...prev, timeAllowed: v }))} />
                <InputField label="Date" value={examData.dateHijri} onChange={(v:any) => setExamData(prev => ({ ...prev, dateHijri: v }))} />
              </div>
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold">Manage Questions</h4>
                  <button onClick={handleAddQuestion} className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-lg text-[10px] font-bold">+ Add Q</button>
                </div>
                {examData.questions.map((q, idx) => (
                  <div key={q.id} className="bg-slate-800/50 p-4 rounded-xl space-y-3 relative group">
                    <button onClick={() => handleRemoveQuestion(q.id)} className="absolute top-2 right-2 text-slate-500 hover:text-red-500 transition-colors"><Trash size={12} /></button>
                    <InputField label={`Q${idx + 1} Text`} value={q.title} onChange={(v:any) => handleUpdateQuestion(q.id, 'title', v)} />
                    <div className="grid grid-cols-3 gap-2">
                      <InputField label="Marks" value={q.marks} onChange={(v:any) => handleUpdateQuestion(q.id, 'marks', v)} />
                      <div className="col-span-2">
                        <InputField label="OR Option" value={q.orOption} onChange={(v:any) => handleUpdateQuestion(q.id, 'orOption', v)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Paper Preview */}
        <section className={`flex-1 p-8 overflow-y-auto flex justify-center custom-scrollbar ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-200'}`}>
          <div className="min-w-[800px] w-[800px] bg-white text-black p-12 shadow-2xl relative border-8 border-double border-slate-100 min-h-[1130px] flex flex-col font-serif print:border-0 print:shadow-none print:p-0">
             
             <div className="flex justify-between items-start mb-10 pb-6 border-b-2 border-black">
                <div className="w-24 h-24 border-2 border-black rounded-full flex items-center justify-center p-2">
                   {systemSettings.monogram ? <img src={systemSettings.monogram} alt="Logo" className="w-full h-full object-contain" /> : <GraduationCap size={40} />}
                </div>
                <div className="flex-1 text-center px-6">
                   <h1 className="text-3xl font-black uppercase tracking-tight mb-2">{activeMode === 'fatwa' ? fatwaData.institutionName : examData.institutionName}</h1>
                   <div className="bg-black text-white px-8 py-1 rounded-full text-xs font-bold uppercase tracking-[0.2em] inline-block">
                      {activeMode === 'fatwa' ? 'Official Policy Advisory' : examData.examTitle}
                   </div>
                </div>
                <div className="w-24"></div>
             </div>

             {activeMode === 'fatwa' ? (
                <div className="flex-1 flex flex-col space-y-8">
                   <div className="grid grid-cols-2 gap-4 border-2 border-black p-4 text-xs font-bold uppercase tracking-widest">
                      <div>Ref: {fatwaData.fatwaNumber}</div>
                      <div className="text-right">Topic: {fatwaData.topic}</div>
                   </div>

                   <div className="space-y-4">
                      <div className="font-black text-sm uppercase tracking-widest bg-slate-50 p-2 inline-block">Institutional Inquiry</div>
                      <div className="p-6 border border-slate-200 leading-[1.8] text-justify italic text-slate-700">"{fatwaData.istifta}"</div>
                   </div>

                   <div className="flex-1 space-y-4 pt-4 border-t-2 border-double border-slate-100">
                      <div className="font-black text-sm uppercase tracking-widest bg-slate-900 text-white px-4 py-2 inline-block">Formal Ruling & Response</div>
                      <div className="p-8 border-2 border-black leading-[2.1] text-justify font-medium text-lg bg-slate-50/30">{fatwaData.jawab}</div>
                   </div>

                   <div className="flex justify-between items-end mt-12 pt-12 border-t border-slate-100">
                      <div className="flex flex-col items-center">
                         <div className="w-48 h-px bg-black mb-2"></div>
                         <span className="text-[10px] font-bold uppercase tracking-widest">Verified Academic Authority</span>
                      </div>
                      <div className="text-center font-black italic text-slate-300 select-none opacity-50">DOCUMENT CERTIFIED</div>
                      <div className="flex flex-col items-center">
                         <div className="w-48 h-px bg-black mb-2"></div>
                         <span className="text-[10px] font-bold uppercase tracking-widest">Official Institutional Seal</span>
                      </div>
                   </div>
                </div>
             ) : (
                <div className="flex-1 flex flex-col">
                   <div className="grid grid-cols-4 border-t-2 border-b-2 border-black py-4 mb-10 text-[10px] font-bold uppercase tracking-widest text-center">
                      <div className="border-r border-black">Subject: {examData.subject}</div>
                      <div className="border-r border-black">Max Marks: {examData.totalMarks}</div>
                      <div className="border-r border-black">Time: {examData.timeAllowed}</div>
                      <div>Date: {examData.dateHijri}</div>
                   </div>

                   <div className="bg-slate-50 border border-slate-200 p-4 mb-10 text-[11px] leading-relaxed">
                      <strong>IMPORTANT INSTRUCTIONS: </strong> {examData.instructions}
                   </div>

                   <div className="flex-1 space-y-10">
                      {examData.questions.map((q, idx) => (
                        <div key={q.id} className="space-y-4">
                           <div className="flex justify-between items-start font-bold">
                              <div className="flex-1 pr-12 text-lg">Question {idx + 1}: {q.title}</div>
                              <div className="font-mono text-sm">[{q.marks}]</div>
                           </div>
                           {q.orOption && (
                             <div className="space-y-2">
                                <div className="text-center font-black text-[10px] tracking-widest text-slate-300">--------------- OR ---------------</div>
                                <div className="text-lg italic text-slate-700 pl-12">{q.orOption}</div>
                             </div>
                           )}
                           <div className="pl-12 space-y-2">
                              {q.subQuestions.map((sub, sIdx) => (
                                <div key={sIdx} className="flex justify-between items-center text-sm font-medium italic border-b border-slate-50 pb-1">
                                   <span>{sub}</span>
                                   <span className="font-mono text-xs opacity-50">---</span>
                                </div>
                              ))}
                           </div>
                        </div>
                      ))}
                   </div>

                   <div className="flex justify-between items-end mt-12 pt-12 border-t-2 border-black">
                      <div className="flex flex-col items-center">
                         <div className="w-40 h-px bg-black mb-2"></div>
                         <span className="text-[10px] font-bold uppercase tracking-widest">Subject Specialist</span>
                      </div>
                      <div className="flex flex-col items-center">
                         <div className="w-40 h-px bg-black mb-2"></div>
                         <span className="text-[10px] font-bold uppercase tracking-widest">Head of Examinations</span>
                      </div>
                   </div>
                </div>
             )}
          </div>
        </section>
      </main>
    </div>
  );
}

const InputField = ({ label, value, onChange, placeholder, type = 'text' }: any) => (
  <div className="space-y-1.5 w-full">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-white"
    />
  </div>
);
