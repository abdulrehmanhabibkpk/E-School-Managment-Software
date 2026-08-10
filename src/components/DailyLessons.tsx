import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, BookOpen, Send, FileText, Image as ImageIcon, Paperclip, 
  Trash2, CheckCircle2, Search, Filter, Share2, Copy, Check, Calendar, 
  Users, CheckSquare, Square, Eye, Download, MessageSquare, AlertCircle, Sparkles, X, Plus
} from 'lucide-react';
import { updateCentralKey } from '../syncService';

interface Student {
  id: number;
  name: string;
  fatherName: string;
  phone: string;
  grade: string;
  section?: string;
  rollNo?: string;
  regNo?: string;
  photo?: string;
}

interface AttachedFile {
  name: string;
  size: number;
  type: string; // 'image/png', 'application/pdf', etc.
  dataUrl: string;
}

interface LessonEntry {
  id: string;
  date: string;
  grade: string;
  section?: string;
  subject: string;
  teacherName?: string;
  content: string;
  attachment?: AttachedFile | null;
  targetStudentIds: number[];
  createdAt: string;
}

interface DailyLessonsProps {
  onBack: () => void;
}

export default function DailyLessons({ onBack }: DailyLessonsProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const [selectedSection, setSelectedSection] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

  // Homework Form State
  const [lessonDate, setLessonDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState<string>('Islamic Studies');
  const [customSubject, setCustomSubject] = useState<string>('');
  const [teacherName, setTeacherName] = useState<string>('');
  const [homeworkContent, setHomeworkContent] = useState<string>('');
  const [attachment, setAttachment] = useState<AttachedFile | null>(null);

  // UI States
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [savedHistory, setSavedHistory] = useState<LessonEntry[]>([]);
  const [historySearch, setHistorySearch] = useState<string>('');
  const [previewModalEntry, setPreviewModalEntry] = useState<LessonEntry | null>(null);
  const [activeTab, setActiveTab] = useState<'composer' | 'history'>('composer');
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState<boolean>(false);
  const [sentStudentIds, setSentStudentIds] = useState<Record<number, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load students and history on mount
  useEffect(() => {
    const loadedStudents = localStorage.getItem('students');
    if (loadedStudents) {
      try {
        const parsed = JSON.parse(loadedStudents);
        if (Array.isArray(parsed)) {
          setStudents(parsed);
        }
      } catch (e) {
        console.error('Failed to load students:', e);
      }
    } else {
      // Mock fallback demo students if empty
      const demoStudents: Student[] = [
        { id: 101, name: 'Muhammad Ali', fatherName: 'Abdul Rehman', phone: '03001234567', grade: 'Grade 10', rollNo: '101', section: 'A' },
        { id: 102, name: 'Usman Ghani', fatherName: 'Tariq Mehmood', phone: '03129876543', grade: 'Grade 10', rollNo: '102', section: 'A' },
        { id: 103, name: 'Ayesha Khan', fatherName: 'Shahid Khan', phone: '03335551212', grade: 'Grade 9', rollNo: '201', section: 'B' },
        { id: 104, name: 'Hamza Farooq', fatherName: 'Farooq Ahmed', phone: '03456789012', grade: 'Grade 8', rollNo: '301', section: 'A' },
        { id: 105, name: 'Zainab Bibi', fatherName: 'Ghulam Rasool', phone: '03214567890', grade: 'Grade 10', rollNo: '103', section: 'A' },
      ];
      setStudents(demoStudents);
    }

    const loadedHistory = localStorage.getItem('daily_lessons_history');
    if (loadedHistory) {
      try {
        const parsed = JSON.parse(loadedHistory);
        if (Array.isArray(parsed)) {
          setSavedHistory(parsed);
        }
      } catch (e) {
        console.error('Failed to load lesson history:', e);
      }
    }
  }, []);

  // Get distinct grades & sections
  const gradesList = Array.from(new Set(students.map(s => s.grade || 'Other'))).filter(Boolean);
  const sectionsList = Array.from(new Set(students.map(s => s.section || 'A'))).filter(Boolean);

  // Filtered students
  const filteredStudents = students.filter(student => {
    const matchesGrade = selectedGrade === 'All' || student.grade === selectedGrade;
    const matchesSection = selectedSection === 'All' || (student.section || 'A') === selectedSection;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      student.name.toLowerCase().includes(searchLower) ||
      student.fatherName?.toLowerCase().includes(searchLower) ||
      student.phone?.includes(searchTerm) ||
      student.rollNo?.toLowerCase().includes(searchLower);
    return matchesGrade && matchesSection && matchesSearch;
  });

  // Toggle selection
  const handleToggleSelectStudent = (id: number) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map(s => s.id));
    }
  };

  // Attachment Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size exceeds 10MB limit. Please select a smaller PDF or PNG/JPG image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Quick Preset Insertions
  const applyPreset = (presetText: string) => {
    setHomeworkContent(prev => prev ? `${prev}\n\n${presetText}` : presetText);
  };

  // Construct Formatted WhatsApp Message
  const buildWhatsAppMessage = (studentName?: string, studentRoll?: string) => {
    const activeSub = subject === 'Other' ? (customSubject || 'General') : subject;
    let msg = `📚 *DAILY HOMEWORK & LESSON DIARY*\n`;
    msg += `----------------------------------------\n`;
    msg += `📅 *Date:* ${lessonDate}\n`;
    msg += `📖 *Subject:* ${activeSub}\n`;
    if (studentName) {
      msg += `👤 *Student:* ${studentName} ${studentRoll ? `(Roll No: ${studentRoll})` : ''}\n`;
    }
    if (teacherName) {
      msg += `👨‍🏫 *Teacher:* ${teacherName}\n`;
    }
    msg += `----------------------------------------\n\n`;
    msg += `📝 *Homework Details / سبق:* \n`;
    msg += `${homeworkContent || 'No written text provided.'}\n\n`;

    if (attachment) {
      msg += `📎 *Attached File:* ${attachment.name} (${(attachment.size / 1024).toFixed(1)} KB)\n`;
      msg += `*(Note: If file attached, check school portal attachment or view document)*\n\n`;
    }

    msg += `----------------------------------------\n`;
    msg += `_Assan School Management Portal_`;
    return msg;
  };

  // Format Phone Number for WhatsApp (e.g. 03001234567 -> 923001234567)
  const formatPhoneForWhatsApp = (phoneStr: string) => {
    if (!phoneStr) return '';
    let cleaned = phoneStr.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '92' + cleaned.substring(1);
    }
    return cleaned;
  };

  // Open WhatsApp for single student
  const handleSendWhatsAppToStudent = (student: Student) => {
    const rawPhone = student.phone || '';
    const formattedPhone = formatPhoneForWhatsApp(rawPhone);
    if (!formattedPhone) {
      alert(`No valid phone number found for student ${student.name}.`);
      return;
    }

    const message = buildWhatsAppMessage(student.name, student.rollNo);
    const encodedText = encodeURIComponent(message);
    const waUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedText}`;

    // Mark as sent
    setSentStudentIds(prev => ({ ...prev, [student.id]: true }));

    // Open WhatsApp in new window/tab
    window.open(waUrl, '_blank');
  };

  // Copy Message
  const handleCopyMessage = () => {
    const text = buildWhatsAppMessage();
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  // Save Lesson Entry to Local Storage
  const handleSaveLesson = () => {
    if (!homeworkContent.trim() && !attachment) {
      alert('Please enter homework text or attach a PDF/PNG file before saving.');
      return;
    }

    const activeSub = subject === 'Other' ? (customSubject || 'General') : subject;
    const newEntry: LessonEntry = {
      id: 'lesson_' + Date.now(),
      date: lessonDate,
      grade: selectedGrade === 'All' ? 'All Classes' : selectedGrade,
      section: selectedSection,
      subject: activeSub,
      teacherName: teacherName,
      content: homeworkContent,
      attachment: attachment,
      targetStudentIds: selectedStudentIds.length > 0 ? selectedStudentIds : filteredStudents.map(s => s.id),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [newEntry, ...savedHistory];
    setSavedHistory(updatedHistory);
    localStorage.setItem('daily_lessons_history', JSON.stringify(updatedHistory));
    updateCentralKey('daily_lessons_history', updatedHistory);

    alert('✅ Daily lesson / homework saved successfully!');
  };

  // Delete History Item
  const handleDeleteHistory = (id: string) => {
    if (!confirm('Are you sure you want to delete this lesson record?')) return;
    const updated = savedHistory.filter(h => h.id !== id);
    setSavedHistory(updated);
    localStorage.setItem('daily_lessons_history', JSON.stringify(updated));
    updateCentralKey('daily_lessons_history', updated);
  };

  const selectedStudentsObjects = students.filter(s => selectedStudentIds.includes(s.id));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans pb-16" dir="ltr">
      {/* Top Header Navbar */}
      <header className="bg-slate-900 text-white px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md sticky top-0 z-30">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all cursor-pointer text-white flex items-center justify-center"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 rounded-xl flex items-center justify-center shadow-inner">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-snug flex items-center gap-2">
                Daily Lessons & Homework
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-widest">
                  WhatsApp Enabled
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                روزانہ کا سبق اور ہوم ورک — ٹائپ ٹیکسٹ، پی ڈی ایف اور پی این جی فائل واٹس ایپ پر بھیجیں
              </p>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('composer')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'composer' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Create & Send Homework</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'history' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Past History ({savedHistory.length})</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 pt-6 flex-1">
        
        {activeTab === 'composer' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Lesson Content Builder (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Homework & Lesson Details</h2>
                      <p className="text-[11px] text-slate-500">سبق کا عنوان، مضمون اور ہوم ورک درج کریں</p>
                    </div>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full">
                    {lessonDate}
                  </span>
                </div>

                {/* Date & Subject Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Lesson Date (تاریخ)
                    </label>
                    <input 
                      type="date"
                      value={lessonDate}
                      onChange={(e) => setLessonDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      Subject (مضمون)
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    >
                      <option value="Islamic Studies">Islamic Studies / اسلامیات</option>
                      <option value="Quran & Tajweed">Quran & Tajweed / قرآن و تجوید</option>
                      <option value="Hifz & Revision">Hifz / سبق و منزل</option>
                      <option value="Mathematics">Mathematics / ریاضی</option>
                      <option value="English">English / انگریزی</option>
                      <option value="Urdu">Urdu / اردو</option>
                      <option value="Science">Science / سائنس</option>
                      <option value="Computer">Computer / کمپیوٹر</option>
                      <option value="General Knowledge">General Knowledge / معلومات عامہ</option>
                      <option value="Other">Other Custom Subject</option>
                    </select>
                  </div>
                </div>

                {subject === 'Other' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Custom Subject Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Arabic Grammar / Pashto" 
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Teacher Name (استاد کا نام - اختیاری)
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Qari Abdul Rehman / Sir Shahid" 
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Presets Row */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Quick Homework Presets (جلد سبق درج کریں)
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => applyPreset('📖 سبق: صفحہ نمبر 24 مشق 1 تا 5 کاپی پر حل کریں۔')}
                      className="text-[11px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 rounded-lg px-2.5 py-1 font-bold transition-all cursor-pointer"
                    >
                      📖 Urdu Math Exercise
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('🌙 روزانہ سبق: سورۃ البقرہ (آیات 1 تا 10)، منزل: 1 پارے کی دہرائی۔')}
                      className="text-[11px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 rounded-lg px-2.5 py-1 font-bold transition-all cursor-pointer"
                    >
                      🌙 Hifz & Revision
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('📝 English: Read Unit 4 Lesson 2. Write word meanings in notebook.')}
                      className="text-[11px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 rounded-lg px-2.5 py-1 font-bold transition-all cursor-pointer"
                    >
                      📝 English Reading
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('⚠️ اہم اطلاع: کل کلاس کا سرپرائز ٹیسٹ ہوگا۔ تمام طلباء تیاری کر کے آئیں۔')}
                      className="text-[11px] bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg px-2.5 py-1 font-bold transition-all cursor-pointer"
                    >
                      ⚠️ Exam Notice
                    </button>
                  </div>
                </div>

                {/* Main Text Content Area */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Homework Text / Type Lesson Diary (ٹائپ شدہ سبق) *</span>
                    <span className="text-[10px] text-slate-400 font-mono">{homeworkContent.length} chars</span>
                  </label>
                  <textarea
                    rows={6}
                    placeholder="یہاں سبق یا ہوم ورک ٹائپ کریں... (Type daily homework or lesson details here)"
                    value={homeworkContent}
                    onChange={(e) => setHomeworkContent(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 transition-all leading-relaxed"
                  />
                </div>

                {/* Attachment Section (PDF / PNG / JPG) */}
                <div className="border-t border-slate-100 pt-4">
                  <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Paperclip className="w-4 h-4 text-emerald-600" />
                      Attach Document / Image (پی ڈی ایف یا تصویر منسلک کریں)
                    </span>
                    <span className="text-[10px] text-slate-400">PDF, PNG, JPG (Max 10MB)</span>
                  </label>

                  {attachment ? (
                    <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {attachment.type.startsWith('image/') ? (
                          <div className="w-12 h-12 rounded-xl bg-white border border-emerald-200 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                            <img src={attachment.dataUrl} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 shrink-0 flex items-center justify-center font-bold shadow-xs">
                            <FileText className="w-6 h-6" />
                          </div>
                        )}
                        <div className="truncate text-left">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{attachment.name}</h4>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {(attachment.size / 1024).toFixed(1)} KB • {attachment.type || 'Document'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={attachment.dataUrl}
                          target="_blank"
                          rel="noreferrer"
                          download={attachment.name}
                          className="p-2 bg-white hover:bg-emerald-100 text-emerald-700 rounded-xl transition border border-emerald-200 cursor-pointer shadow-xs"
                          title="Download / View"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={handleRemoveAttachment}
                          className="p-2 bg-white hover:bg-red-100 text-red-600 rounded-xl transition border border-slate-200 cursor-pointer shadow-xs"
                          title="Remove Attachment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 rounded-2xl p-6 text-center cursor-pointer transition-all group"
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/png, image/jpeg, image/jpg, application/pdf"
                        className="hidden" 
                      />
                      <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center mx-auto mb-2 text-slate-400 group-hover:text-emerald-600 group-hover:scale-110 transition-all shadow-xs">
                        <Paperclip className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-700">
                        Click or drag & drop file to attach (پی ڈی ایف یا PNG فائل منتخب کریں)
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Supports PDF Worksheets, PNG Scan copies, or JPG Pictures
                      </p>
                    </div>
                  )}
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {copiedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedSuccess ? 'Copied to Clipboard!' : 'Copy Homework Text'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveLesson}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save to History Record</span>
                  </button>
                </div>

              </div>

            </div>

            {/* Right Column: Student Selector & WhatsApp Dispatcher (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Select Target Students</h2>
                      <p className="text-[11px] text-slate-500">مطلوبہ کلاس یا طالب علم منتخب کریں</p>
                    </div>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">
                    {selectedStudentIds.length} / {filteredStudents.length} Selected
                  </span>
                </div>

                {/* Filters */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Grade/Class</label>
                      <select
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none"
                      >
                        <option value="All">All Grades (تمام)</option>
                        {gradesList.map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Section</label>
                      <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none"
                      >
                        <option value="All">All Sections</option>
                        {sectionsList.map(s => (
                          <option key={s} value={s}>Section {s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Search Student */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input 
                      type="text" 
                      placeholder="Search student name or roll no..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Select All Row */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      {selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                      <span>Select All ({filteredStudents.length})</span>
                    </button>

                    <span className="text-[11px] text-slate-400">
                      Showing {filteredStudents.length} students
                    </span>
                  </div>
                </div>

                {/* Student Scrollable List */}
                <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {filteredStudents.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No matching students found in this filter.
                    </div>
                  ) : (
                    filteredStudents.map(student => {
                      const isSelected = selectedStudentIds.includes(student.id);
                      const isSent = sentStudentIds[student.id];

                      return (
                        <div
                          key={student.id}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                            isSelected ? 'bg-emerald-50/60 border-emerald-300 shadow-2xs' : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100'
                          }`}
                        >
                          <div 
                            onClick={() => handleToggleSelectStudent(student.id)}
                            className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                          >
                            <div className="text-emerald-600">
                              {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-300" />}
                            </div>

                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs shrink-0 overflow-hidden">
                              {student.photo ? (
                                <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                              ) : (
                                student.name.charAt(0)
                              )}
                            </div>

                            <div className="truncate text-left">
                              <h4 className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                                {student.name}
                                {student.rollNo && (
                                  <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-mono">
                                    Roll {student.rollNo}
                                  </span>
                                )}
                              </h4>
                              <p className="text-[10px] text-slate-500 truncate">
                                {student.fatherName ? `Father: ${student.fatherName} • ` : ''}{student.grade || 'Grade 10'} • 📱 {student.phone || 'No phone'}
                              </p>
                            </div>
                          </div>

                          {/* Direct WhatsApp button per student */}
                          <button
                            type="button"
                            onClick={() => handleSendWhatsAppToStudent(student)}
                            className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition cursor-pointer shrink-0 ${
                              isSent 
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-2xs'
                            }`}
                            title="Send WhatsApp message directly to student / parent"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{isSent ? 'Sent' : 'WhatsApp'}</span>
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* WhatsApp Dispatcher Summary Banner */}
                <div className="bg-emerald-950 text-white p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-emerald-300">WhatsApp Direct Dispatcher</h4>
                      <p className="text-[10px] text-slate-300">
                        {selectedStudentIds.length === 0 
                          ? 'Select students above to send in bulk' 
                          : `${selectedStudentIds.length} students queued for WhatsApp`}
                      </p>
                    </div>
                    <span className="text-xs bg-emerald-500 text-slate-950 font-black px-2.5 py-1 rounded-full">
                      WA API
                    </span>
                  </div>

                  {selectedStudentIds.length > 0 && (
                    <div className="pt-2 border-t border-emerald-800/80 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const firstStudent = students.find(s => selectedStudentIds.includes(s.id));
                          if (firstStudent) handleSendWhatsAppToStudent(firstStudent);
                        }}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send to Selected Queue (One-by-One)</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        ) : (
          /* Past Lessons History View */
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Saved Homework & Lessons Log</h2>
                <p className="text-xs text-slate-500">پچھلے تمام بھیجے گئے سبق اور ہوم ورک کا ریکارڈ</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input 
                  type="text" 
                  placeholder="Search history by subject or date..." 
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {savedHistory.length === 0 ? (
              <div className="p-16 text-center text-slate-400 space-y-3">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-600">No Lesson Records Found</h3>
                <p className="text-xs text-slate-400">Created daily homework logs will appear here for reference and re-sending.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedHistory
                  .filter(item => 
                    !historySearch || 
                    item.subject.toLowerCase().includes(historySearch.toLowerCase()) ||
                    item.content.toLowerCase().includes(historySearch.toLowerCase()) ||
                    item.date.includes(historySearch)
                  )
                  .map(entry => (
                    <div 
                      key={entry.id} 
                      className="bg-slate-50 rounded-2xl p-4 border border-slate-200 hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                            {entry.subject}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">
                            {entry.date} • {entry.createdAt}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 font-medium line-clamp-3 leading-relaxed whitespace-pre-wrap">
                          {entry.content}
                        </p>

                        {entry.attachment && (
                          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                            <Paperclip className="w-3.5 h-3.5" />
                            <span className="truncate">{entry.attachment.name}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewModalEntry(entry)}
                          className="text-xs text-slate-700 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteHistory(entry.id)}
                          className="text-xs text-red-500 hover:text-red-700 font-bold p-1 rounded-lg cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Preview Modal */}
      {previewModalEntry && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                  {previewModalEntry.subject}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">Lesson Record Details</h3>
              </div>
              <button 
                onClick={() => setPreviewModalEntry(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-center justify-between text-slate-500">
                <span>Date: {previewModalEntry.date}</span>
                <span>Class: {previewModalEntry.grade}</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 font-medium whitespace-pre-wrap leading-relaxed">
                {previewModalEntry.content}
              </div>

              {previewModalEntry.attachment && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-800 truncate">{previewModalEntry.attachment.name}</span>
                  </div>
                  <a
                    href={previewModalEntry.attachment.dataUrl}
                    download={previewModalEntry.attachment.name}
                    className="text-xs bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl hover:bg-emerald-700 transition"
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setPreviewModalEntry(null)}
                className="bg-slate-800 text-white font-bold px-5 py-2 rounded-xl text-xs hover:bg-slate-900 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
