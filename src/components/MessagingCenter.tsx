import React, { useState, useEffect } from 'react';
import { 
  Send, MessageSquare, ShieldCheck, Wifi, WifiOff, 
  History, Clock, Bell, UserCheck, ArrowRight, ExternalLink,
  Search, User, BookOpen, Plus, Trash2, X, Check, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { syncToServer } from '../syncService';

interface MessagingCenterProps {
  onBack: () => void;
}

interface MessageLog {
  id: string;
  type: string;
  content: string;
  timestamp: string;
  recipientCount: number;
  recipientName?: string;
}

const MessagingCenter: React.FC<MessagingCenterProps> = ({ onBack }) => {
  // Tabs & Modes
  const [activeTab, setActiveTab] = useState<'message' | 'diary'>('message');
  const [recipient, setRecipient] = useState('All Students');
  const [messageType, setMessageType] = useState('Notice');
  const [content, setContent] = useState('');
  const [sendingMethod, setSendingMethod] = useState<'sim' | 'branded'>('sim');
  
  // Custom Toast State
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  // Loaded Data
  const [students, setStudents] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<string[]>([]);
  
  // Messaging Student Selection
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  
  // Specific Class selection
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('A');

  // Daily Diary State
  const [diaryTarget, setDiaryTarget] = useState<'individual' | 'class'>('class');
  const [diaryStudentSearch, setDiaryStudentSearch] = useState('');
  const [diarySelectedStudent, setDiarySelectedStudent] = useState<any | null>(null);
  const [diarySubject, setDiarySubject] = useState('');
  const [diaryDate, setDiaryDate] = useState(new Date().toISOString().split('T')[0]);
  const [diaryContent, setDiaryContent] = useState('');

  const [logs, setLogs] = useState<MessageLog[]>(() => {
    try {
      const saved = localStorage.getItem('message_logs');
      return saved ? JSON.parse(saved) : [
        { id: '1', type: 'NOTICE', content: 'تمام طلبہ کو مطلع کیا جاتا ہے کہ کل مدرسہ میں چھٹی ہوگی...', timestamp: '2 گھنٹے پہلے', recipientCount: 154 },
        { id: '2', type: 'DIARY', content: 'ڈائری برائے کلاس سوم: مضمون عربی قواعد کا سبق نمبر ۵ یاد کر کے لائیں۔', timestamp: '3 گھنٹے پہلے', recipientCount: 28 },
        { id: '3', type: 'NOTICE', content: 'فیس یاددہانی: تمام والدین سے التماس ہے کہ بقایا جات فوری جمع کروائیں۔', timestamp: '5 گھنٹے پہلے', recipientCount: 120 },
      ];
    } catch (e) {
      return [];
    }
  });

  // Load students and classes on mount
  useEffect(() => {
    try {
      const savedStudents = localStorage.getItem('students');
      if (savedStudents) {
        setStudents(JSON.parse(savedStudents));
      }
    } catch (e) {
      console.error('Error loading students:', e);
    }

    try {
      const savedGradesList = JSON.parse(localStorage.getItem('grades_list') || '[]');
      const savedGrades = JSON.parse(localStorage.getItem('grades') || '[]');
      let userGrades: string[] = [];
      if (Array.isArray(savedGradesList) && savedGradesList.length > 0) {
        userGrades = savedGradesList.map((g: any) => g.name || g);
      } else if (Array.isArray(savedGrades) && savedGrades.length > 0) {
        userGrades = savedGrades.map((g: any) => g.name || g);
      }
      
      if (userGrades.length === 0) {
        userGrades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];
      }
      setClassesList(userGrades);
      if (userGrades.length > 0) {
        setSelectedClass(userGrades[0]);
      }
    } catch (e) {
      setClassesList(['Grade 1', 'Grade 2', 'Grade 3']);
      setSelectedClass('Grade 1');
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('message_logs', JSON.stringify(logs));
    } catch (e) {
      console.error(e);
    }
  }, [logs]);

  const showToastMsg = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4500);
  };

  // Format Pakistani / general phone numbers for WhatsApp API
  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '';
    let cleaned = phone.replace(/[^\d]/g, ''); // Keep only digits
    if (cleaned.startsWith('03')) {
      cleaned = '92' + cleaned.substring(1);
    } else if (cleaned.startsWith('3') && cleaned.length === 10) {
      cleaned = '92' + cleaned;
    }
    return cleaned;
  };

  const triggerWhatsApp = (phone: string, text: string) => {
    const formatted = formatPhoneNumber(phone);
    if (!formatted) {
      showToastMsg('موبائل نمبر درست نہیں ہے یا دستیاب نہیں ہے!', 'error');
      return false;
    }
    const url = `https://wa.me/${formatted}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    return true;
  };

  // Filter students based on search terms
  const searchResultsMessage = students.filter(s => {
    const term = studentSearchQuery.trim().toLowerCase();
    if (!term) return false;
    return (
      (s.name && s.name.toLowerCase().includes(term)) ||
      (s.fatherName && s.fatherName.toLowerCase().includes(term)) ||
      (s.rollNo && s.rollNo.toString().includes(term)) ||
      (s.regNo && s.regNo.toString().includes(term)) ||
      (s.guardianPhone && s.guardianPhone.includes(term))
    );
  }).slice(0, 5);

  const searchResultsDiary = students.filter(s => {
    const term = diaryStudentSearch.trim().toLowerCase();
    if (!term) return false;
    return (
      (s.name && s.name.toLowerCase().includes(term)) ||
      (s.fatherName && s.fatherName.toLowerCase().includes(term)) ||
      (s.rollNo && s.rollNo.toString().includes(term)) ||
      (s.regNo && s.regNo.toString().includes(term)) ||
      (s.guardianPhone && s.guardianPhone.includes(term))
    );
  }).slice(0, 5);

  // Send Custom Message
  const handleSendMessage = async () => {
    if (!content.trim()) {
      showToastMsg('براہ کرم پیغام کا متن لکھیں!', 'error');
      return;
    }

    if (recipient === 'Individual' && !selectedStudent) {
      showToastMsg('براہ کرم کسی طالب علم کا انتخاب کریں!', 'error');
      return;
    }

    let recipientLabel = recipient;
    let textToSend = content;
    let targetPhone = '';

    if (recipient === 'Individual' && selectedStudent) {
      recipientLabel = `طالب علم: ${selectedStudent.name}`;
      targetPhone = selectedStudent.guardianPhone || selectedStudent.phone || '';
      
      const formattedText = `*پیغام از: جامعہ عربیہ سراج العلوم*\n*طالب علم:* ${selectedStudent.name} (ولد ${selectedStudent.fatherName || '---'})\n*کلاس:* ${selectedStudent.grade || '---'}\n\n*پیغام:*\n${content}\n\nشکریہ!`;
      
      const opened = triggerWhatsApp(targetPhone, formattedText);
      if (!opened) return;
    } else if (recipient === 'Specific') {
      recipientLabel = `کلاس: ${selectedClass} (${selectedSection})`;
      showToastMsg(`کلاس ${selectedClass} کے طلبہ کے لیے واٹس ایپ پیغام تیار ہے۔`, 'info');
    } else {
      showToastMsg('پیغام کامیابی سے بھیج دیا گیا ہے (سملر سروس)!', 'success');
    }

    const newLog: MessageLog = {
      id: Date.now().toString(),
      type: messageType.toUpperCase(),
      content: content,
      timestamp: 'ابھی',
      recipientCount: recipient === 'Individual' ? 1 : recipient === 'Specific' ? 25 : 350,
      recipientName: recipient === 'Individual' && selectedStudent ? selectedStudent.name : recipientLabel
    };

    setLogs([newLog, ...logs]);
    setContent('');
    if (recipient === 'Individual') {
      setSelectedStudent(null);
      setStudentSearchQuery('');
    }
    
    await syncToServer();
  };

  // Send Diary to Individual Student
  const handleSendIndividualDiary = async () => {
    if (!diarySelectedStudent) {
      showToastMsg('براہ کرم طالب علم منتخب کریں!', 'error');
      return;
    }
    if (!diaryContent.trim()) {
      showToastMsg('براہ کرم ڈائری کا متن لکھیں!', 'error');
      return;
    }

    const parentPhone = diarySelectedStudent.guardianPhone || diarySelectedStudent.phone || '';
    if (!parentPhone) {
      showToastMsg('منتخب طالب علم کا موبائل نمبر درج نہیں ہے!', 'error');
      return;
    }

    const diaryMessage = `*تعلیمی ڈائری - جامعہ عربیہ سراج العلوم*\n*طالب علم:* ${diarySelectedStudent.name}\n*کلاس:* ${diarySelectedStudent.grade || '---'} (${diarySelectedStudent.section || 'A'})\n*تاریخ:* ${diaryDate}\n*مضمون:* ${diarySubject || 'عام ڈائری'}\n\n--------------------\n*ہوم ورک / ڈائری کا کام:*\n${diaryContent}\n--------------------\n\nشکریہ! برائے مہربانی ہوم ورک چیک کریں۔`;

    const opened = triggerWhatsApp(parentPhone, diaryMessage);
    if (opened) {
      showToastMsg(`ڈائری برائے ${diarySelectedStudent.name} واٹس ایپ پر ارسال کردی گئی ہے۔`, 'success');
      
      const newLog: MessageLog = {
        id: Date.now().toString(),
        type: 'DIARY',
        content: `مضمون: ${diarySubject || 'عام'} - ${diaryContent.substring(0, 40)}...`,
        timestamp: 'ابھی',
        recipientCount: 1,
        recipientName: `ڈائری: ${diarySelectedStudent.name}`
      };
      setLogs([newLog, ...logs]);
      setDiaryContent('');
      setDiarySubject('');
      setDiarySelectedStudent(null);
      setDiaryStudentSearch('');
      await syncToServer();
    }
  };

  // Send individual class student diary from class list
  const handleSendClassStudentDiary = (student: any) => {
    if (!diaryContent.trim()) {
      showToastMsg('براہ کرم ڈائری کا کام پہلے درج کریں!', 'error');
      return;
    }
    const parentPhone = student.guardianPhone || student.phone || '';
    if (!parentPhone) {
      showToastMsg(`${student.name} کے والد کا فون نمبر موجود نہیں ہے!`, 'error');
      return;
    }

    const diaryMessage = `*تعلیمی ڈائری - جامعہ عربیہ سراج العلوم*\n*طالب علم:* ${student.name}\n*کلاس:* ${selectedClass} (${selectedSection})\n*تاریخ:* ${diaryDate}\n*مضمون:* ${diarySubject || 'عام ڈائری'}\n\n--------------------\n*ہوم ورک / ڈائری کا کام:*\n${diaryContent}\n--------------------\n\nشکریہ! برائے مہربانی ہوم ورک چیک کریں۔`;

    const opened = triggerWhatsApp(parentPhone, diaryMessage);
    if (opened) {
      showToastMsg(`ڈائری برائے ${student.name} واٹس ایپ پر بھیج دی گئی ہے!`, 'success');
    }
  };

  // Students belonging to selected class/section for diary distribution
  const classStudents = students.filter(s => 
    s.grade === selectedClass && 
    (!selectedSection || s.section === selectedSection)
  );

  const clearLog = () => {
    if (window.confirm('کیا آپ تمام ہسٹری حذف کرنا چاہتے ہیں؟')) {
      setLogs([]);
      localStorage.removeItem('message_logs');
      showToastMsg('تمام ہسٹری کامیابی سے حذف کردی گئی ہے۔', 'info');
    }
  };

  const linkWhatsApp = () => {
    window.open('https://web.whatsapp.com', '_blank');
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] font-urdu" dir="rtl">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '50%' }}
            animate={{ opacity: 1, y: 16, x: '50%' }}
            exit={{ opacity: 0, y: -20, x: '50%' }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-xl flex items-center gap-2 border font-sans text-xs font-bold leading-none ${
              toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
              toast.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' :
              'bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${toast.type === 'success' ? 'text-emerald-500' : toast.type === 'error' ? 'text-rose-500' : 'text-blue-500'}`} />
            <span>{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 p-6 md:p-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="bg-slate-100 p-2.5 rounded-xl text-slate-500 hover:bg-slate-200 transition-all active:scale-95"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <div className="bg-[#10B981] p-1.5 rounded-lg shrink-0">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800">پیغام رسانی کا مرکز (Messaging Center)</h1>
              </div>
              <p className="text-slate-500 text-xs md:text-sm mt-1">والدین اور عملہ کو ڈائری، ایس ایم ایس اور واٹس ایپ پیغامات بھیجیں</p>
            </div>
          </div>
          
          <button 
            onClick={linkWhatsApp}
            className="bg-[#25D366] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-[#128C7E] shadow-sm transition-all active:scale-95 self-stretch md:self-auto justify-center"
          >
            <ExternalLink className="w-4 h-4" />
            <span>WhatsApp Web لنک کریں</span>
          </button>
        </div>
      </div>

      {/* Mode Select Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex gap-6">
          <button 
            onClick={() => setActiveTab('message')}
            className={`py-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'message' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>عام پیغام رسانی (General Messaging)</span>
          </button>
          <button 
            onClick={() => setActiveTab('diary')}
            className={`py-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'diary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>روزانہ کی تعلیمی ڈائری (Daily Diary)</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Action Area (Col Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* TAB 1: General Messaging */}
            {activeTab === 'message' && (
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                  <div className="bg-blue-50 p-1.5 rounded-lg">
                    <Send className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">نیا پیغام لکھیں (Compose Message)</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Recipient Selector */}
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 font-bold flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" /> موصول کنندہ (RECIPIENTS)
                    </label>
                    <select 
                      value={recipient}
                      onChange={e => {
                        setRecipient(e.target.value);
                        setSelectedStudent(null);
                        setStudentSearchQuery('');
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="All Students">تمام طلبہ (All Students)</option>
                      <option value="Individual">مخصوص طالب علم (Specific Student)</option>
                      <option value="Specific">مخصوص کلاس (Specific Class)</option>
                      <option value="Teachers">تمام اساتذہ (Teachers)</option>
                      <option value="Staff">عملہ (Staff)</option>
                    </select>
                  </div>

                  {/* Message Type Selector */}
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 font-bold flex items-center gap-1">
                      <Bell className="w-3.5 h-3.5" /> پیغام کی قسم (TYPE)
                    </label>
                    <select 
                      value={messageType}
                      onChange={e => setMessageType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="Notice">عام اطلاع (Notice)</option>
                      <option value="Result">نتیجہ طالب علم (Result)</option>
                      <option value="Fee">فیس یاددہانی (Fee Reminder)</option>
                      <option value="Holiday">چھٹی کی اطلاع (Holiday Notice)</option>
                    </select>
                  </div>
                </div>

                {/* Conditional Fields based on recipient */}
                <AnimatePresence mode="wait">
                  {recipient === 'Individual' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-hidden"
                    >
                      <label className="text-xs font-bold text-slate-600 block">طالب علم تلاش کریں (Search Student)</label>
                      <div className="relative">
                        <input 
                          type="text"
                          value={studentSearchQuery}
                          onChange={e => setStudentSearchQuery(e.target.value)}
                          placeholder="نام، رول نمبر، یا والد کا نام لکھیں..."
                          className="w-full bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                      </div>

                      {/* Filter list */}
                      {searchResultsMessage.length > 0 && !selectedStudent && (
                        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100 shadow-sm max-h-48 overflow-y-auto mt-2 font-sans text-xs">
                          {searchResultsMessage.map(student => (
                            <button
                              key={student.id}
                              type="button"
                              onClick={() => {
                                setSelectedStudent(student);
                                setStudentSearchQuery(student.name);
                              }}
                              className="w-full px-4 py-2.5 text-right hover:bg-slate-50 transition-all flex justify-between items-center"
                            >
                              <div>
                                <span className="font-bold text-slate-800">{student.name}</span>
                                <span className="text-slate-400 text-[10px] mr-2">ولد {student.fatherName || '---'}</span>
                              </div>
                              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">{student.grade || '---'} ({student.section || 'A'})</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {selectedStudent && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="bg-emerald-100 p-1.5 rounded-full text-emerald-700">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-emerald-900">{selectedStudent.name} (ولد {selectedStudent.fatherName || '---'})</div>
                              <div className="text-[10px] text-emerald-600 font-sans mt-0.5">والد کا نمبر: {selectedStudent.guardianPhone || 'موجود نہیں'} | کلاس: {selectedStudent.grade || '---'}</div>
                            </div>
                          </div>
                          <button 
                            onClick={() => setSelectedStudent(null)} 
                            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {recipient === 'Specific' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-hidden"
                    >
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 block">کلاس منتخب کریں (Class)</label>
                        <select
                          value={selectedClass}
                          onChange={e => setSelectedClass(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {classesList.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 block">سیکشن (Section)</label>
                        <select
                          value={selectedSection}
                          onChange={e => setSelectedSection(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Content Area */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 font-bold flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> پیغام کا متن (MESSAGE CONTENT)
                  </label>
                  <textarea 
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="یہاں اپنا پیغام لکھیں..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 text-sm leading-6 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all min-h-[140px] resize-none"
                  />
                  <div className="flex justify-between px-2 text-[10px] text-slate-400 font-bold">
                    <span>{content.length} حروف | {Math.ceil(content.length / 160)} SMS یونٹ</span>
                    <button onClick={() => setContent('')} className="text-rose-500 hover:underline">صاف کریں</button>
                  </div>
                </div>

                <button 
                  onClick={handleSendMessage}
                  disabled={!content.trim()}
                  className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 ${
                    !content.trim() ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>{recipient === 'Individual' ? 'واٹس ایپ پر بھیجیں' : 'پیغام بھیجیں (Send Message)'}</span>
                </button>
              </div>
            )}

            {/* TAB 2: Daily Diary */}
            {activeTab === 'diary' && (
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-50 p-1.5 rounded-lg">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">ہوم ورک اور تعلیمی ڈائری (Create Class Diary)</h2>
                  </div>
                  
                  {/* Diary Target Toggle */}
                  <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                    <button 
                      onClick={() => setDiaryTarget('class')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        diaryTarget === 'class' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      کلاس ڈائری (Whole Class)
                    </button>
                    <button 
                      onClick={() => setDiaryTarget('individual')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        diaryTarget === 'individual' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      طالب علم ڈائری (Single)
                    </button>
                  </div>
                </div>

                {/* Form Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Date Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">ڈائری کی تاریخ (Date)</label>
                    <input 
                      type="date"
                      value={diaryDate}
                      onChange={e => setDiaryDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-sans outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Title / Subject Input */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500">مضمون / عنوان (Subject / Topic)</label>
                    <input 
                      type="text"
                      value={diarySubject}
                      onChange={e => setDiarySubject(e.target.value)}
                      placeholder="جیسے: عربی زبان، ہوم ورک، ریاضی مشق نمبر ۳"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Class Target Inputs */}
                {diaryTarget === 'class' && (
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600">کلاس منتخب کریں (Class)</label>
                      <select
                        value={selectedClass}
                        onChange={e => setSelectedClass(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {classesList.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600">سیکشن (Section)</label>
                      <select
                        value={selectedSection}
                        onChange={e => setSelectedSection(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Individual Target Inputs */}
                {diaryTarget === 'individual' && (
                  <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <label className="text-xs font-bold text-slate-600 block">طالب علم منتخب کریں</label>
                    <div className="relative">
                      <input 
                        type="text"
                        value={diaryStudentSearch}
                        onChange={e => setDiaryStudentSearch(e.target.value)}
                        placeholder="طالب علم کا نام یا رول نمبر لکھیں..."
                        className="w-full bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    </div>

                    {/* Filter list */}
                    {searchResultsDiary.length > 0 && !diarySelectedStudent && (
                      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100 shadow-sm max-h-48 overflow-y-auto mt-2 font-sans text-xs">
                        {searchResultsDiary.map(student => (
                          <button
                            key={student.id}
                            type="button"
                            onClick={() => {
                              setDiarySelectedStudent(student);
                              setDiaryStudentSearch(student.name);
                            }}
                            className="w-full px-4 py-2.5 text-right hover:bg-slate-50 transition-all flex justify-between items-center"
                          >
                            <div>
                              <span className="font-bold text-slate-800">{student.name}</span>
                              <span className="text-slate-400 text-[10px] mr-2">ولد {student.fatherName || '---'}</span>
                            </div>
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">{student.grade || '---'} ({student.section || 'A'})</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {diarySelectedStudent && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="bg-emerald-100 p-1.5 rounded-full text-emerald-700">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-emerald-900">{diarySelectedStudent.name} (ولد {diarySelectedStudent.fatherName || '---'})</div>
                            <div className="text-[10px] text-emerald-600 font-sans mt-0.5">والد کا نمبر: {diarySelectedStudent.guardianPhone || 'موجود نہیں'} | کلاس: {diarySelectedStudent.grade || '---'}</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => setDiarySelectedStudent(null)} 
                          className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Diary Homework Content */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">ڈائری / ہوم ورک کا کام (Diary Description / Tasks)</label>
                  <textarea 
                    value={diaryContent}
                    onChange={e => setDiaryContent(e.target.value)}
                    placeholder="ہوم ورک کا کام تفصیل سے یہاں درج کریں..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 text-sm leading-6 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all min-h-[120px] resize-none"
                  />
                </div>

                {/* Submit Actions */}
                {diaryTarget === 'individual' ? (
                  <button 
                    onClick={handleSendIndividualDiary}
                    disabled={!diaryContent.trim() || !diarySelectedStudent}
                    className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 ${
                      !diaryContent.trim() || !diarySelectedStudent ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                    }`}
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>ڈائری واٹس ایپ پر ارسال کریں</span>
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 leading-relaxed font-sans flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>کلاس ڈائری بھیجنے کے لیے نیچے دی گئی فہرست میں سے مطلوبہ طالب علم کے سامنے <b>"WhatsApp"</b> بٹن پر کلک کریں۔</span>
                    </div>

                    {/* Class Students Table */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <div className="bg-slate-800 px-4 py-3 text-white flex justify-between items-center">
                        <span className="text-xs font-bold font-sans">کلاس طلبہ کی فہرست ({selectedClass} - {selectedSection})</span>
                        <span className="bg-blue-600 text-[10px] font-sans px-2.5 py-0.5 rounded-full font-bold">{classStudents.length} طلبہ</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                        {classStudents.map(student => (
                          <div key={student.id} className="p-3 hover:bg-slate-50 transition-colors flex justify-between items-center">
                            <div>
                              <div className="text-xs font-bold text-slate-800">{student.name}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5 font-sans">ولد {student.fatherName || '---'} | فون: {student.guardianPhone || student.phone || '---'}</div>
                            </div>
                            <button
                              onClick={() => handleSendClassStudentDiary(student)}
                              className="bg-[#25D366] hover:bg-[#128C7E] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </button>
                          </div>
                        ))}
                        {classStudents.length === 0 && (
                          <div className="p-6 text-center text-xs text-slate-400 font-sans">اس کلاس اور سیکشن میں کوئی طالب علم رجسٹرڈ نہیں ہے</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Sidebars (Col Span 1) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Service Status Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-50">
                <div className="w-1 h-4 bg-blue-500 rounded-full" />
                <h3 className="font-bold text-slate-800 text-sm">سروس اسٹیٹس (Service Status)</h3>
              </div>
              
              <div className="space-y-3 font-sans">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-600">ایس ایم ایس سروس</span>
                  <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold">
                    <Wifi className="w-3.5 h-3.5 animate-pulse" />
                    <span>آن لائن</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-600">واٹس ایپ انٹیگریشن</span>
                  <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold">
                    <Wifi className="w-3.5 h-3.5 animate-pulse" />
                    <span>مربوط (Active)</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 block font-sans">پیغام رسانی کا بنیادی ذریعہ</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSendingMethod('sim')}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                        sendingMethod === 'sim' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 text-slate-500 border border-slate-200'
                      }`}
                    >
                      موبائل سم
                    </button>
                    <button 
                      onClick={() => setSendingMethod('branded')}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                        sendingMethod === 'branded' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 text-slate-500 border border-slate-200'
                      }`}
                    >
                      برانڈڈ SMS
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* History Logs Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-500" />
                  <h3 className="font-bold text-slate-800 text-sm">حالیہ بھیجے گئے پیغامات</h3>
                </div>
                {logs.length > 0 && (
                  <button 
                    onClick={clearLog}
                    className="text-[10px] font-bold text-rose-500 hover:bg-rose-50 px-2 py-1 rounded"
                  >
                    صاف کریں
                  </button>
                )}
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {logs.map(log => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 hover:border-blue-200 transition-all">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                        log.type === 'DIARY' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>{log.type}</span>
                      <span className="text-slate-400 font-bold font-sans">{log.timestamp}</span>
                    </div>
                    {log.recipientName && (
                      <div className="text-[10px] text-blue-600 font-bold leading-none">{log.recipientName}</div>
                    )}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{log.content}</p>
                  </div>
                ))}
                {logs.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-400 font-sans">کوئی حالیہ پیغام موجود نہیں ہے</div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MessagingCenter;
