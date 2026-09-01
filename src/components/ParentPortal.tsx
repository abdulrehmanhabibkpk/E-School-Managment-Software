import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Calendar, CreditCard, FileText, Bell, 
  MessageCircle, Settings, ChevronRight, LogOut,
  TrendingUp, CheckCircle2, Clock, AlertCircle,
  BookOpen, Star, Award, Phone, Video, MoreVertical,
  Paperclip, Send, Image as ImageIcon, Smile,
  Mic, Search, Users, LayoutDashboard, Download,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, storage } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface StudentData {
// ... existing interface
  id: string;
  name: string;
  regNo: string;
  grade: string;
  rollNo?: string;
  fatherName: string;
  fatherCnic: string;
  schoolId?: string;
  attendance?: {
    totalDays: number;
    present: number;
    absent: number;
    late: number;
  };
  fees?: {
    total: number;
    paid: number;
    pending: number;
    lastPaymentDate?: string;
  };
  results?: {
    examName: string;
    gpa: number;
    grade: string;
    rank: string;
  }[];
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: any;
  type: 'text' | 'image' | 'video' | 'file';
  fileUrl?: string;
  fileName?: string;
}

export default function ParentPortal({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'fees' | 'results' | 'messages'>('overview');
  const [students, setStudents] = useState<StudentData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [cnic, setCnic] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [activeCall, setActiveCall] = useState<{ type: 'voice' | 'video', status: 'calling' | 'connected' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const callTimerRef = useRef<any>(null);
  const [callTime, setCallTime] = useState(0);

  useEffect(() => {
    if (activeCall?.status === 'connected') {
      callTimerRef.current = setInterval(() => {
        setCallTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(callTimerRef.current);
      setCallTime(0);
    }
    return () => clearInterval(callTimerRef.current);
  }, [activeCall?.status]);

  const formatCallTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = (type: 'voice' | 'video') => {
    setActiveCall({ type, status: 'calling' });
    setTimeout(() => {
      setActiveCall({ type, status: 'connected' });
    }, 3000);
  };

  const endCall = () => {
    setActiveCall(null);
  };

  useEffect(() => {
    const storedCnic = localStorage.getItem('parent_portal_cnic');
    const storedStudents = localStorage.getItem('parent_portal_students');
    
    if (storedCnic) {
      setCnic(storedCnic);
      if (storedStudents) {
        const parsed = JSON.parse(storedStudents);
        setStudents(parsed);
        if (parsed.length > 0) {
          setSelectedStudent(parsed[0]);
        }
      }
      setIsLoading(false);
    } else {
      onLogout();
    }
  }, [onLogout]);

  // Real-time messages listener
  useEffect(() => {
    if (!selectedStudent || activeTab !== 'messages') return;

    const messagesRef = collection(db, 'parent_chats');
    const q = query(
      messagesRef, 
      where('studentId', '==', selectedStudent.id.toString()),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      
      setMessages(msgs);
    }, (err) => {
      console.error('Firestore messages error:', err);
      // Fallback for missing index: try query without orderBy if it fails
      if (err.message?.includes('index')) {
        const fallbackQ = query(messagesRef, where('studentId', '==', selectedStudent.id.toString()));
        onSnapshot(fallbackQ, (fallbackSnap) => {
          const fallbackMsgs = fallbackSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Message[];
          const sorted = [...fallbackMsgs].sort((a, b) => (a.timestamp?.toMillis?.() || 0) - (b.timestamp?.toMillis?.() || 0));
          setMessages(sorted);
        });
      }
    });

    return () => unsubscribe();
  }, [selectedStudent, activeTab]);

  useEffect(() => {
    if (activeTab === 'messages') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedStudent) return;

    try {
      const msgData = {
        studentId: selectedStudent.id.toString(),
        senderId: 'parent_' + cnic,
        senderName: selectedStudent.fatherName || 'Parent',
        text: newMessage,
        timestamp: serverTimestamp(),
        type: 'text'
      };

      await addDoc(collection(db, 'parent_chats'), msgData);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedStudent) return;

    setIsUploading(true);
    try {
      const fileType = file.type.startsWith('image/') ? 'image' : 
                       file.type.startsWith('video/') ? 'video' : 'file';
      
      let downloadURL = '';
      try {
        const storageRef = ref(storage, `parent_chats/${selectedStudent.id.toString()}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        downloadURL = await getDownloadURL(storageRef);
      } catch (storageErr) {
        console.warn('Firebase Storage upload failed, falling back to Base64 in Firestore:', storageErr);
        if (file.size > 950000) {
          alert('Firebase Storage is currently offline/restricted and this file exceeds the 950KB direct fallback limit. Please choose a smaller file or try again later.');
          return;
        }
        downloadURL = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(file);
        });
      }

      const msgData = {
        studentId: selectedStudent.id.toString(),
        senderId: 'parent_' + cnic,
        senderName: selectedStudent.fatherName || 'Parent',
        text: `Sent a ${fileType}: ${file.name}`,
        timestamp: serverTimestamp(),
        type: fileType,
        fileUrl: downloadURL,
        fileName: file.name
      };

      await addDoc(collection(db, 'parent_chats'), msgData);
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Parent Portal...</p>
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto" />
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">No Student Records Found</h2>
          <p className="text-slate-500 max-w-md">No student records were found linked to CNIC: {cnic}. Please contact school administration.</p>
          <button onClick={onLogout} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold">Return to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* Mini Sidebar */}
      <div className="w-20 lg:w-64 bg-white border-r border-slate-200 h-full flex flex-col p-4 transition-all duration-300 z-50">
        <div className="mb-8 px-2 lg:px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/20">P</div>
            <div className="hidden lg:block">
              <h1 className="text-sm font-black text-slate-800 uppercase tracking-tight">Parent Portal</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Education Management</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 space-y-1.5">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'attendance', icon: Calendar, label: 'Attendance' },
            { id: 'fees', icon: CreditCard, label: 'Fee Portal' },
            { id: 'results', icon: FileText, label: 'Results' },
            { id: 'messages', icon: MessageCircle, label: 'Messages' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 p-3 lg:px-4 rounded-xl transition-all group ${
                activeTab === item.id 
                  ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${activeTab === item.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span className="hidden lg:block font-bold text-xs uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Linked Children Selection */}
        {students.length > 1 && (
          <div className="mt-8 mb-4 hidden lg:block">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-3">Linked Children</h3>
            <div className="space-y-2 px-2">
              {students.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStudent(s)}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    selectedStudent?.id === s.id 
                      ? 'bg-white border-blue-200 shadow-sm' 
                      : 'border-transparent hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="text-[11px] font-black text-slate-800 truncate">{s.name}</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.grade}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <button 
          onClick={onLogout}
          className="mt-auto flex items-center gap-3 p-3 lg:px-4 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all font-bold text-xs uppercase tracking-wider"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="hidden lg:block">Sign Out</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-6 lg:px-8 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-slate-400" />
            </div>
            {students.length > 1 ? (
              <div className="flex flex-col">
                <label htmlFor="header-student-select" className="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">
                  Selected Child (Option)
                </label>
                <div className="relative flex items-center">
                  <select
                    id="header-student-select"
                    value={selectedStudent?.id || ''}
                    onChange={(e) => {
                      const found = students.find(s => s.id === e.target.value);
                      if (found) setSelectedStudent(found);
                    }}
                    className="appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-black text-slate-800 outline-none focus:border-blue-500 cursor-pointer transition-all"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.grade})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2 pointer-events-none text-slate-400">
                    <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-sm font-black text-slate-800">{selectedStudent?.name}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedStudent?.grade} • REG: {selectedStudent?.regNo}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Father / Guardian</span>
              <span className="text-xs font-bold text-slate-700">{selectedStudent?.fatherName}</span>
            </div>
            <button className="relative p-2.5 bg-slate-50 text-slate-400 hover:text-blue-600 transition-colors rounded-xl border border-slate-100">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors rounded-xl border border-slate-100">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full overflow-y-auto p-6 lg:p-8 custom-scrollbar"
            >
              {activeTab === 'overview' && (
                <div className="space-y-8 max-w-6xl mx-auto pb-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white border border-slate-200 p-6 rounded-[24px] shadow-sm flex flex-col justify-between">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-black text-slate-900">89%</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Attendance Score</div>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 p-6 rounded-[24px] shadow-sm flex flex-col justify-between">
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                        <Award className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-black text-slate-900">A+</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Average Grade</div>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 p-6 rounded-[24px] shadow-sm flex flex-col justify-between">
                      <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
                        <CreditCard className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-black text-slate-900">Rs. 4,500</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Outstanding Dues</div>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 p-6 rounded-[24px] shadow-sm flex flex-col justify-between">
                      <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center mb-4">
                        <MessageCircle className="w-5 h-5 text-rose-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-black text-slate-900">3</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">New Messages</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Performance Chart Placeholder */}
                    <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Academic Progress</h3>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Class Average</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Your Child</span>
                          </div>
                        </div>
                      </div>
                      <div className="h-64 flex items-end gap-6 pb-2 border-b border-slate-100">
                        {[45, 65, 85, 70, 95, 80].map((h, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full flex items-end gap-1">
                              <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${h-10}%` }}
                                className="flex-1 bg-slate-100 rounded-t-lg"
                              />
                              <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                className="flex-1 bg-blue-600 rounded-t-lg shadow-lg shadow-blue-600/20"
                              />
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase">Test {i + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Quick Links</h3>
                        <div className="space-y-2">
                          <button className="w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-between transition-colors group">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-blue-600" />
                              <span className="text-xs font-bold text-slate-700">Download Syllabus</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                          </button>
                          <button className="w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-between transition-colors group">
                            <div className="flex items-center gap-3">
                              <Calendar className="w-5 h-5 text-emerald-600" />
                              <span className="text-xs font-bold text-slate-700">School Calendar</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                          </button>
                        </div>
                      </div>

                      <div className="bg-slate-900 rounded-[32px] p-6 text-white overflow-hidden relative group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/30 transition-all"></div>
                        <h3 className="text-xs font-black uppercase tracking-widest mb-2 relative z-10">Admin Support</h3>
                        <p className="text-xs text-slate-400 leading-relaxed mb-6 relative z-10">Need help with something? Contact our support team.</p>
                        <button className="w-full py-3 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-colors relative z-10">
                          Call Support
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'attendance' && (
                <div className="max-w-4xl mx-auto space-y-8 pb-12">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest leading-tight">Attendance Records</h2>
                      <p className="text-xs font-bold text-slate-400 mt-1 uppercase">Monthly tracking and summary</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Present</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-rose-500 rounded-full"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Absent</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm">
                    <div className="grid grid-cols-7 gap-3 mb-8">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center py-2">{day}</div>
                      ))}
                      {Array.from({ length: 30 }).map((_, i) => {
                        const isAbsent = [3, 12, 21].includes(i);
                        const isPresent = !isAbsent && i < 24;
                        return (
                          <div 
                            key={i}
                            className={`aspect-square flex flex-col items-center justify-center rounded-2xl relative transition-all cursor-pointer group ${
                              isAbsent ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                              isPresent ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                              'bg-slate-50 text-slate-300 border border-slate-100'
                            }`}
                          >
                            <span className="text-xs font-bold">{i + 1}</span>
                            {isAbsent && <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full"></div>}
                            {isPresent && <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>}
                            
                            <div className="absolute inset-0 bg-slate-900 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-2 text-center">
                              <span className="text-[8px] font-black text-white uppercase leading-tight">{isAbsent ? 'Absent' : isPresent ? 'Present' : 'Upcoming'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-100">
                      <div className="text-center">
                        <div className="text-xl font-black text-emerald-600">22</div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Days Present</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-black text-rose-500">03</div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Days Absent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-black text-slate-800">25</div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Days</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'results' && (
                <div className="max-w-5xl mx-auto space-y-8 pb-12">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest leading-tight">Academic Records</h2>
                      <p className="text-xs font-bold text-slate-400 mt-1 uppercase">Exams and Assessments</p>
                    </div>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10">
                      <Download className="w-4 h-4" /> Download All
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { exam: 'First Terminal 2024', grade: 'A+', total: 500, obt: 465, gpa: 3.9, rank: '3rd' },
                      { exam: 'Monthly Test May', grade: 'A', total: 100, obt: 88, gpa: 3.8, rank: '5th' },
                      { exam: 'Mid Term 2023', grade: 'A+', total: 500, obt: 472, gpa: 4.0, rank: '1st' }
                    ].map((res, i) => (
                      <div key={i} className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex items-start justify-between mb-8 relative z-10">
                          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-slate-900">{res.grade}</div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{res.obt} / {res.total}</div>
                          </div>
                        </div>
                        <h3 className="text-sm font-black text-slate-800 mb-6 relative z-10">{res.exam}</h3>
                        <div className="grid grid-cols-2 gap-4 relative z-10">
                          <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GPA</span>
                            <span className="text-xs font-bold text-slate-700">{res.gpa}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank</span>
                            <span className="text-xs font-bold text-emerald-600">{res.rank}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'fees' && (
                <div className="max-w-4xl mx-auto space-y-8 pb-12">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest leading-tight">Fee Management</h2>
                      <p className="text-xs font-bold text-slate-400 mt-1 uppercase">Payments and history</p>
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Outstanding</div>
                        <div className="text-4xl font-black">Rs. 4,500</div>
                        <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mt-2 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" /> Due Date: May 20, 2024
                        </div>
                      </div>
                      <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-3 active:scale-95">
                        <CreditCard className="w-5 h-5" /> Pay Now
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-100">
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Payment History</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Receipt #</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {[
                            { id: 'RCP-8821', date: 'Apr 10, 2024', desc: 'Monthly Tuition Fee', amount: 'Rs. 5,000', status: 'Paid' },
                            { id: 'RCP-7712', date: 'Mar 05, 2024', desc: 'Annual Book Fund', amount: 'Rs. 15,000', status: 'Paid' },
                            { id: 'RCP-6610', date: 'Feb 02, 2024', desc: 'Admission Deposit', amount: 'Rs. 10,000', status: 'Paid' }
                          ].map((pay, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 text-xs font-bold text-slate-400 font-mono">{pay.id}</td>
                              <td className="px-6 py-4 text-xs font-bold text-slate-600">{pay.date}</td>
                              <td className="px-6 py-4 text-xs font-bold text-slate-700">{pay.desc}</td>
                              <td className="px-6 py-4 text-xs font-black text-slate-900">{pay.amount}</td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[9px] font-black uppercase">
                                  {pay.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'messages' && (
                <div className="h-full flex flex-col max-w-5xl mx-auto -m-6 lg:-m-8">
                  {/* WhatsApp-Like Chat Interface */}
                  <div className="flex-1 flex flex-col bg-[#efeae2] relative overflow-hidden">
                    {/* Chat Background Pattern Stub */}
                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>

                    {/* Chat Header */}
                    <div className="bg-white px-6 py-3 border-b border-slate-200 flex items-center justify-between z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-black text-sm">S</div>
                        <div>
                          <h3 className="text-sm font-black text-slate-800">School Administration</h3>
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Online</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-slate-400">
                        <button onClick={() => startCall('video')} className="hover:text-blue-600 transition-colors"><Video className="w-5 h-5" /></button>
                        <button onClick={() => startCall('voice')} className="hover:text-blue-600 transition-colors"><Phone className="w-5 h-5" /></button>
                        <button className="hover:text-blue-600 transition-colors"><Search className="w-5 h-5" /></button>
                        <button className="hover:text-blue-600 transition-colors"><MoreVertical className="w-5 h-5" /></button>
                      </div>
                    </div>

                    {/* Calling Overlay */}
                    <AnimatePresence>
                      {activeCall && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-between py-20 text-white"
                        >
                          <div className="text-center space-y-4">
                            <div className="w-32 h-32 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-5xl font-black shadow-2xl shadow-blue-600/40 relative">
                              S
                              {activeCall.status === 'calling' && (
                                <div className="absolute inset-0 border-4 border-white/30 rounded-full animate-ping"></div>
                              )}
                            </div>
                            <div>
                              <h3 className="text-2xl font-black tracking-tight">School Administration</h3>
                              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                                {activeCall.status === 'calling' ? 'Calling...' : `On ${activeCall.type} call • ${formatCallTime(callTime)}`}
                              </p>
                            </div>
                          </div>

                          {activeCall.type === 'video' && activeCall.status === 'connected' && (
                            <div className="w-full max-w-sm aspect-video bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative">
                               <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                                  <Video className="w-12 h-12" />
                               </div>
                               <div className="absolute bottom-4 right-4 w-24 h-32 bg-slate-700 rounded-xl border border-white/20 shadow-lg"></div>
                            </div>
                          )}

                          <div className="flex items-center gap-8">
                            <button className="w-16 h-16 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                              <Mic className="w-6 h-6" />
                            </button>
                            <button 
                              onClick={endCall}
                              className="w-20 h-20 bg-rose-500 hover:bg-rose-600 rounded-full flex items-center justify-center transition-all shadow-xl shadow-rose-500/30 active:scale-95"
                            >
                              <Phone className="w-8 h-8 rotate-[135deg]" />
                            </button>
                            <button className="w-16 h-16 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                              <MoreVertical className="w-6 h-6" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar z-10 flex flex-col">
                      <div className="self-center bg-white/80 backdrop-blur-sm px-4 py-1 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm mb-4">Today</div>
                      
                      {messages.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-[32px] text-center space-y-2 max-w-xs shadow-sm">
                            <MessageCircle className="w-8 h-8 text-blue-200 mx-auto" />
                            <p className="text-xs font-bold text-slate-500">No messages yet. Send a message to start chatting with school administration.</p>
                          </div>
                        </div>
                      ) : (
                        messages.map((msg, idx) => {
                          const isMe = msg.senderId === 'parent_' + cnic;
                          return (
                            <motion.div 
                              key={msg.id || idx}
                              initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`max-w-[75%] lg:max-w-[60%] flex flex-col ${isMe ? 'self-end' : 'self-start'}`}
                            >
                              <div className={`p-3.5 rounded-2xl shadow-sm relative ${
                                isMe 
                                  ? 'bg-[#d9fdd3] text-slate-800 rounded-tr-none' 
                                  : 'bg-white text-slate-800 rounded-tl-none'
                                }`}>
                                {!isMe && <div className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">{msg.senderName}</div>}
                                
                                {msg.type === 'text' && <p className="text-[13px] leading-relaxed font-medium">{msg.text}</p>}
                                
                                {msg.type === 'image' && (
                                  <div className="space-y-2">
                                    <img src={msg.fileUrl} alt="Sent" className="rounded-xl max-w-full h-auto shadow-sm cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(msg.fileUrl, '_blank')} />
                                    {msg.text && <p className="text-[13px] leading-relaxed font-medium">{msg.text}</p>}
                                  </div>
                                )}

                                {msg.type === 'video' && (
                                  <div className="space-y-2">
                                    <video src={msg.fileUrl} controls className="rounded-xl max-w-full h-auto shadow-sm" />
                                    {msg.text && <p className="text-[13px] leading-relaxed font-medium">{msg.text}</p>}
                                  </div>
                                )}

                                {msg.type === 'file' && (
                                  <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-black/5 rounded-xl hover:bg-black/10 transition-colors">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-500">
                                      <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-xs font-bold text-slate-800 truncate">{msg.fileName}</div>
                                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Document</div>
                                    </div>
                                    <Download className="w-4 h-4 text-slate-400" />
                                  </a>
                                )}

                                <div className="flex items-center justify-end gap-1 mt-1">
                                  <span className="text-[9px] font-bold text-slate-400">
                                    {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                  </span>
                                  {isMe && <CheckCircle2 className="w-3 h-3 text-blue-400" />}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="bg-white p-4 z-10">
                      <form 
                        onSubmit={handleSendMessage}
                        className="max-w-4xl mx-auto flex items-center gap-3"
                      >
                        <div className="flex items-center gap-1 pr-2 border-r border-slate-100">
                          <button type="button" className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><Smile className="w-6 h-6" /></button>
                          <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className={`p-2 transition-colors ${isUploading ? 'text-blue-600 animate-pulse' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            <Paperclip className="w-6 h-6" />
                          </button>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            onChange={handleFileUpload}
                            accept="image/*,video/*,.pdf,.doc,.docx"
                          />
                        </div>
                        <input 
                          type="text" 
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder={isUploading ? "Uploading file..." : "Type a message..."}
                          disabled={isUploading}
                          className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium outline-none focus:bg-slate-100 transition-all"
                        />
                        <button 
                          type="button" 
                          className="p-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <Mic className="w-6 h-6" />
                        </button>
                        <button 
                          type="submit"
                          disabled={!newMessage.trim()}
                          className={`p-3 rounded-xl transition-all shadow-lg active:scale-95 ${
                            !newMessage.trim() 
                              ? 'bg-slate-100 text-slate-300' 
                              : 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600'
                          }`}
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
