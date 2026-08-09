import React, { useState, useEffect } from 'react';
import { 
  PenTool, Plus, Trash2, Printer, ArrowRight, Save, 
  FileText, Book, GraduationCap, Clock, CheckCircle2, ChevronLeft,
  Settings, Download, Upload, Sparkles, Loader2, AlertCircle, Wand2, X
} from 'lucide-react';
import { exportToExcel, importFromExcel } from '../excelUtils';
import { motion, AnimatePresence } from 'motion/react';
import { generateUniqueId } from '../lib/idUtils';

interface QuestionPart {
  id: string;
  text: string;
  marks: number;
  fontFamily?: string;
}

interface Question {
  id: string;
  text: string;
  marks: number;
  fontFamily?: string;
  parts?: QuestionPart[];
}

interface Paper {
  id: string;
  book: string;
  grade: string;
  time: string;
  totalMarks: number;
  note: string;
  noteFontFamily?: string;
  year: string;
  examName: string;
  questions: Question[];
}

interface PaperMakerProps {
  onBack: () => void;
}

// Helper function to render mixed Urdu and Arabic text with correct fonts
const renderMixedText = (text: string, defaultFont: string = 'font-urdu') => {
  if (!text) return null;

  // Split by brackets / quotes «...» first to allow manual Arabic override
  const quoteParts = text.split(/(«[^»]+»)/g);

  return quoteParts.map((part, index) => {
    if (part.startsWith('«') && part.endsWith('»')) {
      // Manual Arabic text block
      const innerText = part.slice(1, -1);
      return (
        <span key={index} className="font-classic" dir="rtl">
          {innerText}
        </span>
      );
    }

    // Split non-quoted text into segments to detect Arabic vs Urdu automatically
    // We split by spaces/newlines but preserve them
    const subParts = part.split(/(\s+)/g);

    return subParts.map((subPart, subIdx) => {
      if (/^\s+$/.test(subPart)) {
        return subPart; // Preserve spaces/newlines
      }

      // Check if this word/segment is Arabic.
      // Arabic diacritics (harakat): [\u064B-\u0652\u0670\u0654\u0655]
      // Arabic-only characters like ك (\u0643), ه (\u0647), ي (\u064A), ى (\u0649)
      const hasDiacritics = /[\u064B-\u0652\u0670\u0654\u0655]/.test(subPart);
      const hasArabicLetters = /[كهدأإؤئيى]/.test(subPart);
      const hasUrduLetters = /[پچٹڈڑژکگںہھھیے\u06A9\u06C1\u06BE\u06D2\u06CC]/.test(subPart);

      const isArabic = (hasDiacritics || hasArabicLetters) && !hasUrduLetters;
      const fontClass = isArabic ? 'font-classic' : defaultFont;

      return (
        <span key={`${index}-${subIdx}`} className={fontClass}>
          {subPart}
        </span>
      );
    });
  });
};

const getArabicQuestionLabel = (index: number): string => {
  const labels = [
    'السؤال الأول',
    'السؤال الثاني',
    'السؤال الثالث',
    'السؤال الرابع',
    'السؤال الخامس',
    'السؤال السادس',
    'السؤال السابع',
    'السؤال الثامن',
    'السؤال التاسع',
    'السؤال العاشر',
    'السؤال الحادي عشر',
    'السؤال الثاني عشر',
    'السؤال الثالث عشر',
    'السؤال الرابع عشر',
    'السؤال الخامس عشر',
    'السؤال السادس عشر',
    'السؤال السابع عشر',
    'السؤال الثامن عشر',
    'السؤال التاسع عشر',
    'السؤال العشرون'
  ];
  return labels[index] || `السؤال رقم ${index + 1}`;
};

export default function PaperMaker({ onBack }: PaperMakerProps) {
  const [view, setView] = useState<'list' | 'editor' | 'print'>('list');
  const [papers, setPapers] = useState<Paper[]>([]);
  const [currentPaper, setCurrentPaper] = useState<Paper | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [layoutSettings, setLayoutSettings] = useState({
    margin: 40,
    fontSize: 22,
    spacing: 32,
    titleSize: 36,
    fontWeight: 'font-medium',
    fontFamily: 'font-urdu',
    customLogo: '' as string,
    printType: 'paper' as 'paper' | 'booklet'
  });

  const [systemSettings] = useState(() => {
    const saved = localStorage.getItem('system_settings');
    const parsed = saved ? JSON.parse(saved) : {
      jamiaName: 'الجامعۃ العربیہ سراج العلوم مانسهره',
      monogram: ''
    };
    if (parsed.jamiaName !== 'الجامعۃ العربیہ سراج العلوم مانسهره') {
        parsed.jamiaName = 'الجامعۃ العربیہ سراج العلوم مانسهره';
        localStorage.setItem('system_settings', JSON.stringify(parsed));
    }
    return parsed;
  });

  const [availableGrades, setAvailableGrades] = useState<string[]>([]);
  const [examTypes, setExamTypes] = useState<string[]>(['جائزہ', 'سہ ماہی', 'ششماہی', 'سالانہ امتحان', 'ضمنی امتحان']);

  const [showAiModal, setShowAiModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiConfig, setAiConfig] = useState({
    subject: '',
    className: '',
    difficulty: 'درمیانہ',
    topics: '',
    marks: 100,
    questionTypes: ['MCQ', 'Short', 'Long']
  });

  const handleGenerateAiPaper = async () => {
    if (!aiConfig.subject || !aiConfig.className) {
      setAiError('برائے مہربانی مضمون اور درجہ درج کریں۔');
      return;
    }
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/generate-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: aiConfig.subject,
          className: aiConfig.className,
          difficulty: aiConfig.difficulty,
          topics: aiConfig.topics,
          marks: aiConfig.marks,
          questionTypes: aiConfig.questionTypes,
          language: 'urdu'
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const questionsList: Question[] = [];
      let qNum = 1;

      if (data.sections && Array.isArray(data.sections)) {
        data.sections.forEach((sec: any) => {
          if (sec.questions && Array.isArray(sec.questions)) {
            sec.questions.forEach((q: any) => {
              let qText = q.text || '';
              if (q.options && Array.isArray(q.options) && q.options.length > 0) {
                qText += '\n' + q.options.join(' | ');
              }
              const arabicLabel = getArabicQuestionLabel(qNum - 1);
              questionsList.push({
                id: generateUniqueId('q'),
                text: `${arabicLabel}: ${qText}`,
                marks: Number(q.marks) || 10,
                fontFamily: 'font-urdu'
              });
              qNum++;
            });
          }
        });
      }

      if (questionsList.length === 0) {
        questionsList.push({
          id: generateUniqueId('q'),
          text: `السؤال الأول: ${data.title || aiConfig.subject} کے متعلق سوالات حل کریں۔`,
          marks: aiConfig.marks,
          fontFamily: 'font-urdu'
        });
      }

      if (view === 'editor' && currentPaper) {
        const updatedPaper = {
          ...currentPaper,
          book: aiConfig.subject || currentPaper.book,
          grade: aiConfig.className || currentPaper.grade,
          questions: [...currentPaper.questions, ...questionsList]
        };
        setCurrentPaper(updatedPaper);
        const updatedPapers = papers.map(p => p.id === updatedPaper.id ? updatedPaper : p);
        saveToStorage(updatedPapers);
      } else {
        const newPaper: Paper = {
          id: generateUniqueId('paper'),
          book: aiConfig.subject,
          grade: aiConfig.className,
          time: 'المحدد : ثلاث ساعات',
          totalMarks: aiConfig.marks,
          note: 'تمام سوالات لازمی ہیں۔ خوشخطی کے اضافی نمبر ہوں گے۔',
          noteFontFamily: 'font-urdu',
          year: '1447ھ',
          examName: 'سالانہ امتحان',
          questions: questionsList
        };
        const updated = [newPaper, ...papers];
        saveToStorage(updated);
        setCurrentPaper(newPaper);
        setView('editor');
      }

      setShowAiModal(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'پرچہ تیار کرنے میں خرابی پیش آئی۔');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    const savedPapers = localStorage.getItem('jamia_papers');
    if (savedPapers) {
      setPapers(JSON.parse(savedPapers));
    }

    try {
      const savedGradesList = JSON.parse(localStorage.getItem('grades_list') || '[]');
      if (Array.isArray(savedGradesList) && savedGradesList.length > 0) {
        setAvailableGrades(Array.from(new Set(savedGradesList.map((g: any) => g?.name).filter(Boolean))) as string[]);
      } else {
        const savedGrades = JSON.parse(localStorage.getItem('grades') || '[]');
        if (Array.isArray(savedGrades) && savedGrades.length > 0) {
          setAvailableGrades(savedGrades.map((g: any) => g?.name).filter(Boolean));
        } else {
          setAvailableGrades(['اولیٰ', 'ثانیہ', 'ثالثہ', 'رابعہ', 'خامسہ', 'سادسہ', 'سابعہ', 'دورہ حدیث']);
        }
      }
    } catch (e) {
      setAvailableGrades(['اولیٰ', 'ثانیہ', 'ثالثہ', 'رابعہ', 'خامسہ', 'سادسہ', 'سابعہ', 'دورہ حدیث']);
    }

    const savedExams = JSON.parse(localStorage.getItem('exams') || '[]');
    if (savedExams.length > 0) {
      setExamTypes(Array.from(new Set([...savedExams, 'جائزہ', 'سہ ماہی', 'ششماہی', 'سالانہ امتحان'])));
    }
  }, []);

  const saveToStorage = (updatedPapers: Paper[]) => {
    localStorage.setItem('jamia_papers', JSON.stringify(updatedPapers));
    setPapers(updatedPapers);
  };

  const handleCreateNew = () => {
    const newPaper: Paper = {
      id: generateUniqueId('paper'),
      book: '',
      grade: '',
      time: 'المحدد : ثلاث ساعات',
      totalMarks: 100,
      note: 'تمام سوالات لازمی ہیں۔ خوشخطی کے اضافی نمبر ہوں گے۔',
      noteFontFamily: 'font-urdu',
      year: '1447ھ',
      examName: 'سالانہ امتحان',
      questions: [
        { id: '1', text: 'السؤال الأول:', marks: 33 }
      ]
    };
    setCurrentPaper(newPaper);
    setView('editor');
  };

  const handleEdit = (paper: Paper) => {
    setCurrentPaper({ ...paper });
    setView('editor');
  };

  const handleSave = () => {
    if (!currentPaper) return;
    
    // Save custom typed grade to available grades if it doesn't already exist
    if (currentPaper.grade && currentPaper.grade.trim()) {
      const trimmedGrade = currentPaper.grade.trim();
      if (!availableGrades.includes(trimmedGrade)) {
        const newGrades = [...availableGrades, trimmedGrade];
        setAvailableGrades(newGrades);
        
        try {
          const savedGradesList = JSON.parse(localStorage.getItem('grades_list') || '[]');
          const existsInSaved = savedGradesList.some((g: any) => g?.name === trimmedGrade);
          if (!existsInSaved) {
            const updatedGradesList = [...savedGradesList, { id: Date.now().toString(), name: trimmedGrade }];
            localStorage.setItem('grades_list', JSON.stringify(updatedGradesList));
          }
        } catch (err) {
          console.error(err);
        }
      }
    }

    let updatedPapers;
    const exists = papers.find(p => p.id === currentPaper.id);
    
    if (exists) {
      updatedPapers = papers.map(p => p.id === currentPaper.id ? currentPaper : p);
    } else {
      updatedPapers = [currentPaper, ...papers];
    }
    
    saveToStorage(updatedPapers);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleDelete = (id: string) => {
    if (confirm('کیا آپ اس پرچہ کو حذف کرنا چاہتے ہیں؟')) {
      const updated = papers.filter(p => p.id !== id);
      saveToStorage(updated);
    }
  };

  const addQuestion = () => {
    if (!currentPaper) return;
    const nextIndex = currentPaper.questions.length;
    const newQuestion: Question = {
      id: generateUniqueId('q'),
      text: `${getArabicQuestionLabel(nextIndex)}:`,
      marks: 33,
      fontFamily: 'font-urdu'
    };
    setCurrentPaper({
      ...currentPaper,
      questions: [...currentPaper.questions, newQuestion]
    });
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    if (!currentPaper) return;
    const updatedQuestions = currentPaper.questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    );
    setCurrentPaper({ ...currentPaper, questions: updatedQuestions });
  };

  const removeQuestion = (id: string) => {
    if (!currentPaper) return;
    setCurrentPaper({
      ...currentPaper,
      questions: currentPaper.questions.filter(q => q.id !== id)
    });
  };

  const addQuestionPart = (questionId: string) => {
    if (!currentPaper) return;
    const updatedQuestions = currentPaper.questions.map(q => {
      if (q.id === questionId) {
        const parts = q.parts || [];
        const partLabels = ['الف', 'ب', 'ج', 'د', 'ہ', 'و', 'ز', 'ح', 'ط', 'ی'];
        const newLabel = partLabels[parts.length % partLabels.length];
        return {
          ...q,
          parts: [...parts, { id: generateUniqueId('part'), text: `(${newLabel}): `, marks: 0, fontFamily: 'font-urdu' }]
        };
      }
      return q;
    });
    setCurrentPaper({ ...currentPaper, questions: updatedQuestions });
  };

  const updateQuestionPart = (questionId: string, partId: string, field: keyof QuestionPart, value: any) => {
    if (!currentPaper) return;
    const updatedQuestions = currentPaper.questions.map(q => {
      if (q.id === questionId && q.parts) {
        return {
          ...q,
          parts: q.parts.map(p => p.id === partId ? { ...p, [field]: value } : p)
        };
      }
      return q;
    });
    setCurrentPaper({ ...currentPaper, questions: updatedQuestions });
  };

  const removeQuestionPart = (questionId: string, partId: string) => {
    if (!currentPaper) return;
    const updatedQuestions = currentPaper.questions.map(q => {
      if (q.id === questionId && q.parts) {
        return { ...q, parts: q.parts.filter(p => p.id !== partId) };
      }
      return q;
    });
    setCurrentPaper({ ...currentPaper, questions: updatedQuestions });
  };

  if (view === 'print' && currentPaper) {
    return (
      <div className="print-wrapper min-h-screen bg-slate-100 p-8 flex flex-col items-center overflow-auto">
        {/* Controls - No Print */}
        <div className="w-full max-w-7xl mb-8 no-print grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-2 col-span-2">
             <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">پرنٹ کی قسم (Print Type)</span>
             </div>
             <div className="flex gap-2">
                <button 
                  onClick={() => setLayoutSettings(prev => ({ ...prev, printType: 'paper' }))}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${layoutSettings.printType === 'paper' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  سوالیہ پرچہ
                </button>
                <button 
                  onClick={() => setLayoutSettings(prev => ({ ...prev, printType: 'booklet' }))}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${layoutSettings.printType === 'booklet' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  جوابی کاپی (Booklet)
                </button>
             </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-2">
             <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">اوپر/نیچے کا فاصلہ</span>
             </div>
             <input 
                type="range" min="10" max="60" step="2"
                value={layoutSettings.margin}
                onChange={(e) => setLayoutSettings(prev => ({ ...prev, margin: parseInt(e.target.value) }))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
             />
             <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>سائیڈ کا حاشیہ</span>
                <input 
                    type="range" min="0" max="50" step="2"
                    value={layoutSettings.spacing || 32}
                    onChange={(e) => setLayoutSettings(prev => ({ ...prev, spacing: parseInt(e.target.value) }))}
                    className="w-20 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                />
             </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-2">
             <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">فونٹ (Font)</span>
             </div>
             <select 
               value={layoutSettings.fontFamily}
               onChange={(e) => setLayoutSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
               className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold outline-none cursor-pointer"
             >
                <option value="font-faiz">Faiz Lahori Nastaleeq</option>
                <option value="font-urdu">Lahori Nastaleeq</option>
                <option value="font-classic">Arabic</option>
                <option value="font-naskh">خطِ نسخ (Naskh)</option>
                <option value="font-ruqah">خطِ رقعہ (Ruq'ah)</option>
                <option value="font-diwani">خطِ طغریٰ یا دیوانی (Thuluth / Diwani)</option>
             </select>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-2">
             <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">لکھائی</span>
             </div>
             <input 
                type="range" min="12" max="48" step="1"
                value={layoutSettings.fontSize}
                onChange={(e) => setLayoutSettings(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
             />
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-2">
             <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">فاصلہ</span>
             </div>
             <input 
                type="range" min="10" max="100" step="2"
                value={layoutSettings.spacing}
                onChange={(e) => setLayoutSettings(prev => ({ ...prev, spacing: parseInt(e.target.value) }))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
             />
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-2">
             <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">لوگو</span>
             </div>
             <label className="w-full bg-slate-50 border border-slate-200 border-dashed rounded-lg p-1.5 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-all">
                <span className="text-[10px] font-bold text-slate-500">نیا لوگو</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                     const reader = new FileReader();
                     reader.onload = (ev) => setLayoutSettings(prev => ({ ...prev, customLogo: ev.target?.result as string }));
                     reader.readAsDataURL(e.target.files[0]);
                  }
                }} />
             </label>
             {layoutSettings.customLogo && (
               <button onClick={() => setLayoutSettings(prev => ({ ...prev, customLogo: '' }))} className="text-[10px] text-red-500 font-bold text-center">ہٹائیں</button>
             )}
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex gap-2 items-center justify-center">
            <button 
              onClick={() => setView('editor')}
              className="flex-1 bg-slate-800 text-white px-2 py-3 rounded-lg font-urdu font-bold text-[10px] text-center"
            >
              واپس
            </button>
            <button 
              onClick={() => window.print()}
              className="flex-1 bg-emerald-600 text-white px-2 py-3 rounded-lg font-urdu font-bold text-[10px] flex items-center justify-center gap-1"
            >
              <Printer className="w-3 h-3" />
              پرنٹ
            </button>
          </div>
        </div>

        {/* Paper Container */}
        {layoutSettings.printType === 'paper' && (
          <div 
            id="exam-paper" 
            style={{ padding: `${layoutSettings.margin}mm ${layoutSettings.spacing || 0}mm` }}
            className="w-[210mm] min-h-[297mm] bg-white text-black shadow-2xl relative flex flex-col"
          >
            {/* Traditional Double Line Border removed per user request */}
            {/* <div className="absolute inset-[10mm] border-[3px] border-black pointer-events-none z-0"></div>
            <div className="absolute inset-[11.5mm] border border-black pointer-events-none z-0"></div> */}

            <div className="relative z-10 w-full h-full px-6 pt-0" dir="rtl">
               {/* Header Section */}
               <div className="flex justify-between items-start mb-0">
                  {/* Empty Right for Symmetry */}
                  <div className="w-24"></div>

                  {/* Center Content */}
                  <div className="flex-1 flex flex-col items-center text-center">
                     <h1 style={{ fontSize: `${layoutSettings.titleSize}px`, lineHeight: '1.2' }} className={`font-black text-black mb-1 drop-shadow-sm ${layoutSettings.fontFamily}`}>
                        {systemSettings.jamiaName}
                     </h1>
                     {/* <div className="flex items-center gap-4 border-b-2 border-black pb-1 px-8">
                        <span className={`text-xl font-bold tracking-wide ${layoutSettings.fontFamily}`}>{currentPaper.examName}</span>
                     </div> */}
                  </div>

                  {/* Top Left Logo */}
                  <div className="w-24 flex justify-end">
                     {(layoutSettings.customLogo || systemSettings.monogram) ? (
                        <img 
                          src={layoutSettings.customLogo || systemSettings.monogram} 
                          className="w-20 h-20 object-contain grayscale" 
                          alt="Logo" 
                        />
                     ) : (
                        <div className="w-20 h-20 border-[3px] border-black rounded-full flex items-center justify-center p-1">
                           <div className="w-full h-full border border-black rounded-full flex flex-col items-center justify-center text-[8px] font-bold text-center">
                              لوگو<br/>یہاں<br/>لگائیں
                           </div>
                        </div>
                     )}
                  </div>
               </div>

               {/* Info Bar */}
               <div className={`border-y-[2px] border-black py-2.5 my-0 flex justify-between items-center px-4 font-black text-lg bg-white font-classic`}>
                  <div className="flex gap-2"><span>مجموع الدرجات:</span> <span>{currentPaper.totalMarks}</span></div>
                  <div className="flex gap-2"><span>المادة:</span> <span>{currentPaper.book || 'عربی ادب'}</span></div>
                  <div className="flex gap-2"><span>الدرجة:</span> <span>{currentPaper.grade || '---'}</span></div>
                  <div className="flex gap-2"><span>الاختبار:</span> <span>{currentPaper.examName || '---'}</span></div>
                  <div className="flex gap-2"><span>الوقت:</span> <span>{currentPaper.time}</span></div>
               </div>

               {/* Optional Note */}
               {currentPaper.note && (
                  <div className={`text-center font-bold text-sm mb-6 border border-black p-2 mx-8 rounded-sm ${currentPaper.noteFontFamily || 'font-urdu'}`}>
                     {currentPaper.note}
                  </div>
               )}

               {/* Questions Body */}
               <div style={{ gap: `${layoutSettings.spacing}px` }} className="flex flex-col mt-6 font-urdu">
                  {currentPaper.questions.map((q, idx) => {
                     // Check if question contains 'یا' to format it uniquely
                     const isOr = q.text.trim() === 'یا' || q.text.trim() === 'أو';
                     
                     if (isOr) {
                        return (
                           <div key={q.id} className="flex items-center justify-center gap-4 my-4">
                              <div className="flex-1 h-[2px] border-b-2 border-dashed border-black opacity-40"></div>
                              <span className="font-black text-2xl px-4 border border-black rounded-full pb-1 pt-2 bg-white">یا</span>
                              <div className="flex-1 h-[2px] border-b-2 border-dashed border-black opacity-40"></div>
                           </div>
                        );
                     }

                     return (
                        <div key={q.id} className="flex flex-col gap-1">
                           <div className="relative text-justify flex gap-2">
                              {/* The actual text */}
                              <span 
                                style={{ fontSize: `${layoutSettings.fontSize}px`, lineHeight: '1.8' }}
                                className={`text-black whitespace-pre-wrap flex-1`}
                              >
                                 {renderMixedText(q.text, q.fontFamily || 'font-urdu')}
                              </span>
                              {/* Marks aligned to left */}
                              {q.marks > 0 && (
                                 <span className="font-bold pt-2 text-sm">[{q.marks}]</span>
                              )}
                           </div>
                           {q.parts && q.parts.length > 0 && (
                              <div className="flex flex-col gap-2 mt-2 mr-8">
                                 {q.parts.map(part => (
                                    <div key={part.id} className="relative text-justify flex gap-2">
                                       <span 
                                         style={{ fontSize: `${layoutSettings.fontSize * 0.9}px`, lineHeight: '1.8' }}
                                         className={`text-black whitespace-pre-wrap flex-1`}
                                       >
                                          {renderMixedText(part.text, part.fontFamily || q.fontFamily || 'font-urdu')}
                                       </span>
                                       {part.marks > 0 && (
                                          <span className="font-bold pt-1 text-xs">[{part.marks}]</span>
                                       )}
                                    </div>
                                 ))}
                              </div>
                           )}
                        </div>
                     );
                  })}
               </div>
            </div>
          </div>
        )}

        {/* Answer Booklet Print Layout */}
        {layoutSettings.printType === 'booklet' && (
          <div 
            id="booklet-cover" 
            className="w-[210mm] min-h-[297mm] bg-white text-black shadow-2xl relative p-10 flex flex-col items-center"
          >
             <div className="w-full p-1.5 h-full flex flex-col relative">
                <div className="w-full border-2 border-black h-full p-8 flex flex-col items-center relative bg-[#fdfdfc]">
                   
                   {/* Decorative Corners */}
                   <div className="absolute top-0 right-0 w-12 h-12 border-l-2 border-b-2 border-black"></div>
                   <div className="absolute top-0 left-0 w-12 h-12 border-r-2 border-b-2 border-black"></div>
                   <div className="absolute bottom-0 right-0 w-12 h-12 border-l-2 border-t-2 border-black"></div>
                   <div className="absolute bottom-0 left-0 w-12 h-12 border-r-2 border-t-2 border-black"></div>
                   
                   {/* Logo */}
                   <div className="mb-6">
                     {(layoutSettings.customLogo || systemSettings.monogram) ? (
                        <img 
                          src={layoutSettings.customLogo || systemSettings.monogram} 
                          className="w-28 h-28 object-contain grayscale" 
                          alt="Logo" 
                        />
                     ) : (
                        <div className="w-28 h-28 border-4 border-black rounded-full flex items-center justify-center p-1">
                           <div className="w-full h-full border-[2px] border-black rounded-full"></div>
                        </div>
                     )}
                   </div>

                   {/* Title */}
                   <h1 className="text-xl font-bold mb-1 text-center" style={{ fontFamily: 'Jameel Noori Nastaleeq, Noto Nastaliq Urdu' }}>
                      {systemSettings.jamiaName}
                   </h1>
                   <h2 className="text-sm font-semibold mb-4 text-center" style={{ fontFamily: 'Jameel Noori Nastaleeq, Noto Nastaliq Urdu' }}>
                      سالانہ امتحان
                   </h2>
                   <div className="text-sm font-bold tracking-widest border-b-2 border-black pb-2 px-12 mb-12">
                      جوابی کاپی (امتحانی دفتر)
                   </div>

                   {/* Exam Details Box */}
                   <div className="w-full max-w-lg border-2 border-black mb-12">
                      <div className="grid grid-cols-2 text-xl font-bold font-urdu">
                         <div className="border-b border-l border-black p-3 text-center">امتحان: {currentPaper.examName}</div>
                         <div className="border-b border-black p-3 text-center">سال: {currentPaper.year}</div>
                      </div>
                      <div className="border-b border-black p-3 text-right font-bold text-xl flex justify-between">
                         <span>مضمون: {currentPaper.book || '____________________'}</span>
                      </div>
                      <div className="border-b border-black p-3 text-right font-bold text-xl flex justify-between">
                         <span>درجہ: {currentPaper.grade || '____________________'}</span>
                      </div>
                      <div className="p-3 text-right font-bold text-xl flex gap-2 items-center">
                         <span>وقت:</span> <span>{currentPaper.time}</span>
                         <span className="mr-auto ml-12">کل نمبر: {currentPaper.totalMarks}</span>
                      </div>
                   </div>

                   {/* Student Info Table */}
                   <div className="w-full max-w-xl mb-12">
                      <table className="w-full border-collapse border-2 border-black font-urdu text-xl">
                         <tbody>
                            <tr>
                               <td className="border-2 border-black p-4 w-32 font-bold bg-black/5 text-center">رولنمبر</td>
                               <td className="border-2 border-black p-4 text-center font-bold tracking-widest text-2xl">
                                  {/* Empty boxes for roll number */}
                                  <div className="flex gap-2 justify-center">
                                     <div className="w-8 h-10 border border-black"></div>
                                     <div className="w-8 h-10 border border-black"></div>
                                     <div className="w-8 h-10 border border-black"></div>
                                     <div className="w-8 h-10 border border-black"></div>
                                     <div className="w-8 h-10 border border-black"></div>
                                  </div>
                               </td>
                            </tr>
                            <tr>
                               <td className="border-2 border-black p-4 font-bold bg-black/5 text-center">نام طالب علم</td>
                               <td className="border-2 border-black p-4"></td>
                            </tr>
                            <tr>
                               <td className="border-2 border-black p-4 font-bold bg-black/5 text-center">ولدیت</td>
                               <td className="border-2 border-black p-4"></td>
                            </tr>
                            <tr>
                               <td className="border-2 border-black p-4 font-bold bg-black/5 text-center">دستخط نگران</td>
                               <td className="border-2 border-black p-4"></td>
                            </tr>
                         </tbody>
                      </table>
                   </div>

                   <div className="mt-auto w-full text-center">
                      <div className="border-t-[3px] border-black border-dashed pt-6 mb-4 font-black text-xl font-urdu">
                         (یہ حصہ ممتحن پُر کرے گا)
                      </div>
                      <table className="mx-auto border-collapse border-[3px] border-black w-80 text-center">
                         <tbody>
                            <tr>
                               <td className="border-[3px] border-black p-3 font-black text-xl bg-black/5">حاصل کردہ نمبر</td>
                               <td className="border-[3px] border-black p-3 w-40"></td>
                            </tr>
                            <tr>
                               <td className="border-[3px] border-black p-3 font-black text-xl bg-black/5">دستخط ممتحن</td>
                               <td className="border-[3px] border-black p-3"></td>
                            </tr>
                         </tbody>
                      </table>
                   </div>
                </div>
             </div>
          </div>
        )}

        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .no-print {
              display: none !important;
            }
            .print-wrapper {
              background: transparent !important;
              padding: 0 !important;
              margin: 0 !important;
              min-height: auto !important;
              overflow: visible !important;
              display: block !important;
            }
            #exam-paper, #booklet-cover { 
              box-shadow: none !important; 
              border: none !important;
              margin: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              height: auto !important;
              page-break-after: always;
              page-break-inside: avoid;
            }
            @page { 
              size: A4; 
              margin: 0; 
            }
          }
        `}} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden font-urdu">
      {/* Toast Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-8 py-3 rounded-2xl shadow-xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>پرچہ کامیابی سے محفوظ کر لیا گیا ہے!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
           {view === 'list' ? (
             <>
               <button 
                  onClick={onBack}
                  className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  واپس
                </button>
                <button 
                  onClick={() => exportToExcel(papers, 'papers_record')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl transition-all font-urdu font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 text-sm"
                >
                  <Download className="w-4 h-4" />
                  ایکسل ایکسپورٹ
                </button>
                
                <label className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition-all font-urdu font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 cursor-pointer text-sm">
                  <Upload className="w-4 h-4" />
                  ایکسل اپلوڈ
                  <input 
                    type="file" 
                    accept=".xlsx, .xls" 
                    className="hidden" 
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        try {
                          const data = await importFromExcel(e.target.files[0]);
                          const merged = [...papers, ...data];
                          setPapers(merged);
                          localStorage.setItem('jamia_papers', JSON.stringify(merged));
                          alert('ڈیٹا کامیابی سے اپلوڈ ہو گیا۔');
                        } catch (err) {
                          alert('ایکسل فائل پڑھنے میں خرابی۔');
                        }
                      }
                    }} 
                  />
                </label>
             </>
           ) : (
              <button 
                onClick={() => setView('list')}
                className="bg-slate-800 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-900 transition-all font-urdu"
              >
                <ChevronLeft className="w-4 h-4" />
                واپس (Back)
              </button>
           )}
           
           {view === 'editor' && (
             <button 
                onClick={() => setView('print')}
                className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all font-urdu shadow-lg shadow-emerald-500/20"
              >
                <Printer className="w-4 h-4" />
                پرنٹ ریویو
              </button>
           )}
        </div>

        <div className="flex flex-col items-end text-right">
           <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900">
                {view === 'editor' ? 'Board Paper (Maker)' : 'پیپر میکر (Board Paper Maker)'}
              </h1>
              <div className="w-10 h-10 bg-[#1e293b] rounded-xl flex items-center justify-center text-white">
                <FileText className="w-6 h-6" />
              </div>
           </div>
           <p className="text-slate-400 text-xs mt-1">امتحانی پرچہ جات کی تیاری، ڈیزائن اور پرنٹنگ</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 custom-scrollbar">
        {view === 'list' ? (
          <div className="max-w-6xl mx-auto space-y-8">
             <div className="flex flex-wrap gap-3 items-center justify-between">
                <div className="flex flex-wrap gap-3 items-center">
                  <button 
                    onClick={handleCreateNew}
                    className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
                  >
                    <Plus className="w-6 h-6" />
                    <span>نیا پرچہ بنائیں</span>
                  </button>

                  <button 
                    onClick={() => {
                      setAiConfig({
                        subject: '',
                        className: availableGrades[0] || 'اولیٰ',
                        difficulty: 'درمیانہ',
                        topics: '',
                        marks: 100,
                        questionTypes: ['MCQ', 'Short', 'Long']
                      });
                      setAiError(null);
                      setShowAiModal(true);
                    }}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
                  >
                    <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                    <span>AI سے پرچہ بنائیں</span>
                  </button>
                </div>
                <div className="text-slate-400 text-sm font-urdu">کل پرچہ جات: {papers.length}</div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                {papers.map((paper) => (
                  <motion.div 
                    layoutId={paper.id}
                    key={paper.id} 
                    className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-blue-500/10 transition-all group relative overflow-hidden flex flex-col h-[380px]"
                  >
                    <div className="absolute top-6 left-6 bg-blue-50 text-blue-600 text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest shadow-sm">{paper.year}</div>
                    
                    <div className="flex flex-col items-center text-center mt-8 flex-1">
                       <div className="w-24 h-24 bg-slate-50 text-slate-800 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                          <FileText className="w-10 h-10" />
                       </div>
                       <h3 className="text-2xl font-black text-slate-900 mb-2 truncate w-full px-4">{paper.book || 'بغیر نام'}</h3>
                       <div className="flex items-center gap-2 text-slate-400">
                          <GraduationCap size={14} />
                          <span className="text-sm font-bold">درجہ: {paper.grade || '---'}</span>
                       </div>
                    </div>

                    <div className="mt-auto pt-8 flex items-center justify-between gap-4">
                       <div className="flex gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(paper.id); }}
                            className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
                            title="Delete"
                          >
                             <Trash2 size={20} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEdit(paper); setView('print'); }}
                            className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                            title="Print Preview"
                          >
                             <Printer size={20} />
                          </button>
                       </div>
                       <button 
                         onClick={() => handleEdit(paper)}
                         className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                       >
                         ایڈٹ کریں
                       </button>
                    </div>
                  </motion.div>
                ))}
                {papers.length === 0 && (
                  <div className="col-span-full py-32 text-center text-slate-300">
                    <PenTool className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="font-urdu">کوئی پرچہ موجود نہیں ہے۔ نیا پرچہ بنانے کے لیے بٹن پر کلک کریں۔</p>
                  </div>
                )}
             </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pb-32">
             {/* Left: Question Editor */}
             <div className="lg:col-span-7 space-y-6">
                <div className="bg-white rounded-[40px] shadow-2xl p-10 border border-slate-100 flex flex-col min-h-[600px]">
                   <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-50">
                      <div className="flex gap-2">
                        <button 
                          onClick={addQuestion}
                          className="bg-blue-50 text-blue-600 px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                           <Plus className="w-4 h-4" />
                           <span>نیا سوال</span>
                        </button>
                        <button 
                          onClick={() => {
                            setAiConfig({
                              subject: currentPaper?.book || '',
                              className: currentPaper?.grade || availableGrades[0] || 'اولیٰ',
                              difficulty: 'درمیانہ',
                              topics: '',
                              marks: currentPaper?.totalMarks || 100,
                              questionTypes: ['MCQ', 'Short', 'Long']
                            });
                            setAiError(null);
                            setShowAiModal(true);
                          }}
                          className="bg-purple-50 text-purple-600 px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                        >
                           <Sparkles className="w-4 h-4 text-purple-600" />
                           <span>AI سے سوالات لائیں</span>
                        </button>
                      </div>
                      <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                         سوالات ترتیب دیں
                      </h2>
                   </div>

                   <div className="space-y-6">
                      <AnimatePresence>
                        {currentPaper?.questions.map((q, index) => (
                           <motion.div 
                             key={q.id}
                             initial={{ opacity: 0, x: 20 }}
                             animate={{ opacity: 1, x: 0 }}
                             exit={{ opacity: 0, scale: 0.95 }}
                             className="flex gap-4 items-start"
                           >
                              <div className="bg-slate-50 w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-slate-400 shadow-inner">
                                 {index + 1}
                              </div>
                              <div className="flex-1 bg-slate-50 rounded-[2rem] p-6 border border-slate-200 group relative">
                                 <textarea 
                                   value={q.text}
                                   onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                                   className={"w-full bg-transparent border-none outline-none text-right " + (q.fontFamily || 'font-urdu') + " text-lg resize-none min-h-[100px]"}
                                   placeholder="سوال یہاں لکھیں..."
                                   dir="rtl"
                                 />
                                 <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200">
                                    <div className="flex items-center gap-2">
                                       <button 
                                         onClick={() => removeQuestion(q.id)}
                                         className="text-red-300 hover:text-red-500 transition-colors"
                                       >
                                         <Trash2 size={16} />
                                       </button>
                                       <select 
                                         value={q.fontFamily || 'font-urdu'}
                                         onChange={(e) => updateQuestion(q.id, 'fontFamily', e.target.value)}
                                         className="text-xs font-bold bg-slate-100 p-1.5 rounded-lg border border-slate-200 outline-none cursor-pointer"
                                       >
                                         <option value="font-faiz">Urdu (Faiz Lahori)</option>
                                         <option value="font-urdu">Urdu (Jameel)</option>
                                         <option value="font-classic">Arabic (Amiri)</option>
                                         <option value="font-noto">Noto Nastaliq</option>
                                         <option value="font-scheherazade">Scheherazade</option>
                                         <option value="font-lateef">Lateef</option>
                                         <option value="font-katibeh">Katibeh</option>
                                         <option value="font-harmattan">Harmattan</option>
                                       </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                       <span className="text-[10px] font-bold text-slate-400">نمبر:</span>
                                       <input 
                                         type="number" 
                                         value={q.marks}
                                         onChange={(e) => updateQuestion(q.id, 'marks', parseInt(e.target.value) || 0)}
                                         className="w-16 bg-white border border-slate-200 rounded-lg text-center font-mono py-1 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                                       />
                                    </div>
                                 </div>
                                                 {/* Parts / Juzz UI */}
                                  <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
                                     {q.parts && q.parts.map((part, pIdx) => (
                                        <div key={part.id} className="flex gap-4 items-start pl-8">
                                           <div className="bg-white w-8 h-8 rounded-lg flex items-center justify-center font-urdu text-sm font-bold text-blue-600 shadow-sm border border-blue-100 shrink-0">
                                              {['الف', 'ب', 'ج', 'د', 'ہ', 'و', 'ز', 'ح', 'ط', 'ی'][pIdx % 10]}
                                           </div>
                                           <div className="flex-1 bg-white rounded-xl p-4 border border-slate-200">
                                              <textarea 
                                                 value={part.text}
                                                 onChange={(e) => updateQuestionPart(q.id, part.id, 'text', e.target.value)}
                                                 className={"w-full bg-transparent border-none outline-none text-right " + (part.fontFamily || 'font-urdu') + " text-base resize-none min-h-[60px]"}
                                                 placeholder="جزو کا سوال یہاں لکھیں..."
                                                 dir="rtl"
                                              />
                                              <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                                                 <div className="flex items-center gap-2">
                                                   <button 
                                                      onClick={() => removeQuestionPart(q.id, part.id)}
                                                      className="text-red-300 hover:text-red-500 transition-colors"
                                                   >
                                                      <Trash2 size={14} />
                                                   </button>
                                                   <select 
                                                      value={part.fontFamily || 'font-urdu'}
                                                      onChange={(e) => updateQuestionPart(q.id, part.id, 'fontFamily', e.target.value)}
                                                      className="text-[10px] font-bold bg-slate-100 p-1 rounded-lg border border-slate-200 outline-none cursor-pointer"
                                                   >
                                                      <option value="font-faiz">Urdu (Faiz Lahori)</option>
                                                      <option value="font-urdu">Urdu (Jameel)</option>
                                                      <option value="font-classic">Arabic (Amiri)</option>
                                                      <option value="font-noto">Noto Nastaliq</option>
                                                      <option value="font-scheherazade">Scheherazade</option>
                                                      <option value="font-lateef">Lateef</option>
                                                      <option value="font-katibeh">Katibeh</option>
                                                      <option value="font-harmattan">Harmattan</option>
                                          <option value="font-naskh">خطِ نسخ (Naskh)</option>
                                          <option value="font-ruqah">خطِ رقعہ (Ruq'ah)</option>
                                          <option value="font-diwani">خطِ طغریٰ یا دیوانی (Thuluth / Diwani)</option>
                                          <option value="font-naskh">خطِ نسخ (Naskh)</option>
                                          <option value="font-ruqah">خطِ رقعہ (Ruq'ah)</option>
                                          <option value="font-diwani">خطِ طغریٰ یا دیوانی (Thuluth / Diwani)</option>
                                          <option value="font-naskh">خطِ نسخ (Naskh)</option>
                                          <option value="font-ruqah">خطِ رقعہ (Ruq'ah)</option>
                                          <option value="font-diwani">خطِ طغریٰ یا دیوانی (Thuluth / Diwani)</option>
                                                   </select>
                                                 </div>
                                                 <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-slate-400">نمبر:</span>
                                                    <input 
                                                       type="number" 
                                                       value={part.marks}
                                                       onChange={(e) => updateQuestionPart(q.id, part.id, 'marks', parseInt(e.target.value) || 0)}
                                                       className="w-14 bg-slate-50 border border-slate-200 rounded-lg text-center font-mono py-1 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm"
                                                    />
                                                 </div>
                                              </div>
                                           </div>
                                        </div>
                                     ))}
                                     <div className="pl-8 mt-2">
                                       <button 
                                          onClick={() => addQuestionPart(q.id)}
                                          className="text-xs font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-all"
                                       >
                                          <Plus size={14} />
                                          جزو شامل کریں
                                       </button>
                                     </div>
                                  </div>
                               </div>
                           </motion.div>
                        ))}
                      </AnimatePresence>
                   </div>
                </div>
             </div>

             {/* Right: Paper Meta */}
             <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-[40px] shadow-2xl p-10 border border-slate-100 space-y-8 sticky top-8">
                   <div className="flex items-center gap-3 pb-6 border-b border-slate-50 justify-end">
                      <h2 className="text-xl font-black text-slate-800">پیپر کی معلومات</h2>
                      <Settings className="w-5 h-5 text-slate-400" />
                   </div>

                   <div className="space-y-6" dir="rtl">
                      <div className="space-y-2">
                         <label className="text-right block text-xs font-bold text-slate-500 mr-2">امتحان منتخب کریں</label>
                         <div className="relative">
                            <FileText className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select 
                               value={currentPaper?.examName}
                               onChange={(e) => setCurrentPaper(prev => prev ? { ...prev, examName: e.target.value } : null)}
                               className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-urdu font-bold appearance-none"
                            >
                               {examTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                         </div>
                      </div>

                      <div className="space-y-2">
                         <label className="text-right block text-xs font-bold text-slate-500 mr-2">کتاب منتخب کریں</label>
                         <div className="relative">
                            <Book className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                              type="text" 
                              value={currentPaper?.book}
                              onChange={(e) => setCurrentPaper(prev => prev ? { ...prev, book: e.target.value } : null)}
                              placeholder="کتاب کا نام"
                              className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-urdu font-bold"
                            />
                         </div>
                      </div>

                      <div className="space-y-2">
                         <label className="text-right block text-xs font-bold text-slate-500 mr-2">درجہ (دستی لکھیں یا نیچے سے منتخب کریں)</label>
                         <div className="relative">
                            <GraduationCap className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                               type="text"
                               value={currentPaper?.grade || ''}
                               onChange={(e) => setCurrentPaper(prev => prev ? { ...prev, grade: e.target.value } : null)}
                               placeholder="درجہ لکھیں یا نیچے سے منتخب کریں..."
                               className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-urdu font-bold text-right text-slate-700"
                            />
                         </div>
                         <div className="flex flex-wrap gap-1.5 justify-start mt-2 max-h-[120px] overflow-y-auto p-1 bg-slate-50/50 rounded-xl border border-slate-100">
                            {availableGrades.map(g => (
                               <button
                                  key={g}
                                  type="button"
                                  onClick={() => setCurrentPaper(prev => prev ? { ...prev, grade: g } : null)}
                                  className={`px-3 py-1 text-xs rounded-lg border transition-all font-urdu font-bold ${
                                     currentPaper?.grade === g 
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                                  }`}
                               >
                                  {g}
                               </button>
                            ))}
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-right block text-[10px] font-bold text-slate-400 mr-2 uppercase">کل نمبر</label>
                            <input 
                              type="number" 
                              value={currentPaper?.totalMarks}
                              onChange={(e) => setCurrentPaper(prev => prev ? { ...prev, totalMarks: parseInt(e.target.value) || 0 } : null)}
                              className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-center font-bold text-2xl text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10"
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-right block text-[10px] font-bold text-slate-400 mr-2 uppercase">وقت</label>
                            <div className="relative">
                               <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                               <input 
                                 type="text" 
                                 value={currentPaper?.time}
                                 onChange={(e) => setCurrentPaper(prev => prev ? { ...prev, time: e.target.value } : null)}
                                 className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-center font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10"
                               />
                            </div>
                         </div>
                      </div>

                      <div className="space-y-2 pt-4">
                         <div className="flex justify-between items-center mr-2 mb-1">
                            <select 
                               value={currentPaper?.noteFontFamily || 'font-urdu'}
                               onChange={(e) => setCurrentPaper(prev => prev ? { ...prev, noteFontFamily: e.target.value } : null)}
                               className="text-xs font-bold bg-white p-1.5 rounded-lg border border-slate-200 outline-none cursor-pointer"
                            >
                               <option value="font-faiz">Urdu (Faiz Lahori)</option>
                               <option value="font-urdu">Urdu (Jameel)</option>
                               <option value="font-classic">Arabic (Amiri)</option>
                               <option value="font-noto">Noto Nastaliq</option>
                               <option value="font-scheherazade">Scheherazade</option>
                               <option value="font-lateef">Lateef</option>
                               <option value="font-katibeh">Katibeh</option>
                               <option value="font-harmattan">Harmattan</option>
                            </select>
                            <label className="text-right block text-xs font-bold text-slate-500">اہم ہدایات (ملاحظہ عامہ) اور اس کا فونٹ</label>
                         </div>
                         <textarea 
                           value={currentPaper?.note}
                           onChange={(e) => setCurrentPaper(prev => prev ? { ...prev, note: e.target.value } : null)}
                           className={`w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 h-32 text-xs text-right outline-none focus:bg-white resize-none ${currentPaper?.noteFontFamily || 'font-urdu'}`}
                           placeholder="اہم ہدایات..."
                         />
                      </div>
                   </div>

                   <button 
                     onClick={handleSave}
                     className="w-full bg-[#1e293b] text-white py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-slate-900/20"
                   >
                      <Save className="w-8 h-8" />
                      <span>پیپر محفوظ کریں</span>
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAiModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl border border-slate-100 font-urdu relative overflow-hidden"
              dir="rtl"
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">AI خودکار پرچہ ساز (AI Paper Generator)</h3>
                    <p className="text-xs text-slate-400 font-sans">اے آئی کی مدد سے امتحانی پرچہ بنائیں</p>
                  </div>
                </div>
                <button onClick={() => setShowAiModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {aiError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}

              <div className="space-y-4 text-right">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">کتاب / مضمون کا نام (Subject/Book) *</label>
                  <input 
                    type="text" 
                    placeholder="مثلاً: ہدایۃ النحو، نور الایضاح، ریاضی، سا ئنس"
                    value={aiConfig.subject}
                    onChange={e => setAiConfig({ ...aiConfig, subject: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">درجہ / کلاس (Grade) *</label>
                    <input 
                      type="text" 
                      placeholder="مثلاً: اولیٰ، ثانیہ، 10th Grade"
                      value={aiConfig.className}
                      onChange={e => setAiConfig({ ...aiConfig, className: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">مشکلی کا معیار (Difficulty)</label>
                    <select 
                      value={aiConfig.difficulty}
                      onChange={e => setAiConfig({ ...aiConfig, difficulty: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="آسان">آسان (Easy)</option>
                      <option value="درمیانہ">درمیانہ (Medium)</option>
                      <option value="مشکل">مشکل (Hard)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">مخصوص ابواب / عنوانات (Specific Topics)</label>
                  <textarea 
                    rows={3}
                    placeholder="مثلاً: باب الصلاۃ، تعریفات، یا طہارت کے مسائل"
                    value={aiConfig.topics}
                    onChange={e => setAiConfig({ ...aiConfig, topics: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">کل نمبر (Total Marks): {aiConfig.marks}</label>
                  <input 
                    type="range" 
                    min={20} 
                    max={100} 
                    step={10} 
                    value={aiConfig.marks}
                    onChange={e => setAiConfig({ ...aiConfig, marks: Number(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleGenerateAiPaper}
                    disabled={aiLoading || !aiConfig.subject || !aiConfig.className}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>پرچہ تیار ہو رہا ہے...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5" />
                        <span>AI سے پرچہ تیار کریں</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
