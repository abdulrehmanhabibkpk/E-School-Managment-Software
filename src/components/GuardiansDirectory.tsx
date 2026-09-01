import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Search, Plus, Phone, MessageSquare, Heart, 
  Users, Mail, MapPin, Edit2, Trash2, Check, X, Shield, PlusCircle,
  Video, MoreVertical, Paperclip, Send, Image as ImageIcon, Smile, Mic, Download,
  FileText
} from 'lucide-react';
import { updateCentralKey } from '../syncService';
import { db, storage } from '../firebase';
import { collection, query, where, getDocs, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'motion/react';

interface Student {
  id: number;
  name: string;
  fatherName: string;
  phone: string;
  grade: string;
  rollNo?: string;
}

interface Guardian {
  id: string;
  name: string;
  phone: string;
  relation: string; // Father, Mother, Uncle, etc.
  occupation?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  cnic?: string;
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

interface GuardiansDirectoryProps {
  onBack: () => void;
}

export default function GuardiansDirectory({ onBack }: GuardiansDirectoryProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingModal, setIsAddingModal] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState<Guardian | null>(null);

  // Chat State
  const [activeChat, setActiveChat] = useState<Guardian | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [activeCall, setActiveCall] = useState<{ type: 'voice' | 'video', status: 'calling' | 'connected' } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRelation, setFormRelation] = useState('Father');
  const [formOccupation, setFormOccupation] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formEmergency, setFormEmergency] = useState('');
  const [formCnic, setFormCnic] = useState('');

  // Load students and build/get guardians list
  useEffect(() => {
    const loadedStudents = localStorage.getItem('students');
    let studentList: Student[] = [];
    if (loadedStudents) {
      try {
        studentList = JSON.parse(loadedStudents);
        setStudents(studentList);
      } catch (e) {
        console.error('Failed to parse students for guardians:', e);
      }
    }

    // Load custom guardians
    const loadedGuardians = localStorage.getItem('custom_guardians');
    if (loadedGuardians) {
      try {
        setGuardians(JSON.parse(loadedGuardians));
      } catch (e) {
        console.error('Failed to parse custom guardians:', e);
      }
    } else {
      // Build automatic guardians from students list
      const autoGuardians: Guardian[] = [];
      const seenParents = new Set<string>();

      studentList.forEach(student => {
        if (student.fatherName && student.phone) {
          const key = `${student.fatherName.trim().toLowerCase()}-${student.phone.trim()}`;
          if (!seenParents.has(key)) {
            seenParents.add(key);
            autoGuardians.push({
              id: 'auto_' + student.id,
              name: student.fatherName,
              phone: student.phone,
              relation: 'Father',
              occupation: 'Business',
              address: 'Local Area Residence',
              email: `${student.fatherName.replace(/\s+/g, '').toLowerCase()}@schoolparent.com`,
              emergencyContact: student.phone,
              cnic: (student as any).fatherCnic || (student as any).guardianCnic || ''
            });
          }
        }
      });

      setGuardians(autoGuardians);
      localStorage.setItem('custom_guardians', JSON.stringify(autoGuardians));
    }
  }, []);

  // Message listener for active chat
  useEffect(() => {
    if (!activeChat) return;

    // Use a linked child's ID for the chat thread
    const linkedChild = getLinkedChildren(activeChat)[0];
    if (!linkedChild) return;

    const messagesRef = collection(db, 'parent_chats');
    const q = query(
      messagesRef, 
      where('studentId', '==', linkedChild.id.toString()),
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
      // Fallback for missing index
      if (err.message?.includes('index')) {
        const fallbackQ = query(messagesRef, where('studentId', '==', linkedChild.id.toString()));
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
  }, [activeChat]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveGuardians = (newGuardians: Guardian[]) => {
    setGuardians(newGuardians);
    localStorage.setItem('custom_guardians', JSON.stringify(newGuardians));
    updateCentralKey('custom_guardians', newGuardians);
  };

  const handleOpenAdd = () => {
    setEditingGuardian(null);
    setFormName('');
    setFormPhone('');
    setFormRelation('Father');
    setFormOccupation('');
    setFormEmail('');
    setFormAddress('');
    setFormEmergency('');
    setFormCnic('');
    setIsAddingModal(true);
  };

  const handleOpenEdit = (guardian: Guardian) => {
    setEditingGuardian(guardian);
    setFormName(guardian.name);
    setFormPhone(guardian.phone);
    setFormRelation(guardian.relation);
    setFormOccupation(guardian.occupation || '');
    setFormEmail(guardian.email || '');
    setFormAddress(guardian.address || '');
    setFormEmergency(guardian.emergencyContact || '');
    setFormCnic(guardian.cnic || '');
    setIsAddingModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      alert('Please fill out Name and Phone number.');
      return;
    }

    if (editingGuardian) {
      // Edit mode
      const updated = guardians.map(g => g.id === editingGuardian.id ? {
        ...g,
        name: formName,
        phone: formPhone,
        relation: formRelation,
        occupation: formOccupation,
        email: formEmail,
        address: formAddress,
        emergencyContact: formEmergency,
        cnic: formCnic
      } : g);
      saveGuardians(updated);
    } else {
      // Add mode
      const newG: Guardian = {
        id: 'guard_' + Date.now(),
        name: formName,
        phone: formPhone,
        relation: formRelation,
        occupation: formOccupation,
        email: formEmail,
        address: formAddress,
        emergencyContact: formEmergency,
        cnic: formCnic
      };
      saveGuardians([...guardians, newG]);
    }
    setIsAddingModal(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this guardian?')) return;
    const filtered = guardians.filter(g => g.id !== id);
    saveGuardians(filtered);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const linkedChild = getLinkedChildren(activeChat)[0];
    if (!linkedChild) {
      alert('No linked child found for this parent. Cannot start chat.');
      return;
    }

    try {
      const msgData = {
        studentId: linkedChild.id.toString(),
        senderId: 'school_admin',
        senderName: 'School Admin',
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
    const linkedChild = activeChat ? getLinkedChildren(activeChat)[0] : null;
    if (!file || !linkedChild) return;

    setIsUploading(true);
    try {
      const fileType = file.type.startsWith('image/') ? 'image' : 
                       file.type.startsWith('video/') ? 'video' : 'file';
      
      let downloadURL = '';
      try {
        const storageRef = ref(storage, `parent_chats/${linkedChild.id.toString()}/${Date.now()}_${file.name}`);
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
        studentId: linkedChild.id.toString(),
        senderId: 'school_admin',
        senderName: 'School Admin',
        text: `Sent a ${fileType}: ${file.name}`,
        timestamp: serverTimestamp(),
        type: fileType,
        fileUrl: downloadURL,
        fileName: file.name
      };

      await addDoc(collection(db, 'parent_chats'), msgData);
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Failed to upload file.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Find linked children
  const getLinkedChildren = (guardian: Guardian) => {
    return students.filter(student => 
      (student.fatherName && student.fatherName.toLowerCase().trim() === guardian.name.toLowerCase().trim()) ||
      (student.phone && student.phone.trim() === guardian.phone.trim()) ||
      ((student as any).fatherCnic && (student as any).fatherCnic === guardian.cnic)
    );
  };

  // Filter guardians
  const filteredGuardians = guardians.filter(g => {
    const term = searchTerm.toLowerCase();
    return g.name.toLowerCase().includes(term) ||
           g.phone.includes(term) ||
           (g.email && g.email.toLowerCase().includes(term)) ||
           g.relation.toLowerCase().includes(term) ||
           (g.cnic && g.cnic.includes(term));
  });

  return (
    <div className="min-h-screen bg-[#F4F7F6] text-slate-800 flex flex-col font-sans pb-16 relative">
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
            <div className="w-10 h-10 bg-amber-500/20 border border-amber-400/30 text-amber-400 rounded-xl flex items-center justify-center shadow-inner">
              <Heart className="w-5 h-5 fill-current text-amber-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-snug flex items-center gap-2">
                Guardians & Parents Directory
              </h1>
              <p className="text-xs text-slate-400">
                سرپرستوں کی ڈائریکٹری — بچوں کے والدین کی تفصیلات اور رابطہ نمبرز
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Guardian</span>
        </button>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 pt-6 flex-1 space-y-6">
        
        {/* Search Bar & Counters */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input 
              type="text" 
              placeholder="Search guardians by name, phone or CNIC..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex gap-4 text-xs font-bold text-slate-500">
            <span className="bg-slate-100 px-3 py-1.5 rounded-full text-slate-700">
              Total Guardians: <strong className="text-amber-600 font-extrabold">{guardians.length}</strong>
            </span>
            <span className="bg-slate-100 px-3 py-1.5 rounded-full text-slate-700">
              Active Links: <strong className="text-blue-600 font-extrabold">{students.length} children</strong>
            </span>
          </div>
        </div>

        {/* Guardians Grid */}
        {filteredGuardians.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 text-slate-400 space-y-3">
            <Heart className="w-12 h-12 text-slate-200 mx-auto" />
            <h3 className="text-sm font-bold text-slate-600">No Guardians Found</h3>
            <p className="text-xs text-slate-400">Search with another keyword or add a custom guardian record.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuardians.map(guardian => {
              const children = getLinkedChildren(guardian);

              return (
                <div 
                  key={guardian.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 hover:border-amber-400 transition-all shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl flex items-center justify-center font-bold text-sm">
                          {guardian.relation.charAt(0)}
                        </div>
                        <div className="text-left">
                          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            {guardian.name}
                            <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full uppercase">
                              {guardian.relation}
                            </span>
                          </h3>
                          <p className="text-[10px] text-slate-500 font-medium">{guardian.occupation || 'Self-Employed'}</p>
                        </div>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(guardian)}
                          className="p-1.5 bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-700 rounded-lg border border-slate-100 cursor-pointer"
                          title="Edit details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(guardian.id)}
                          className="p-1.5 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-700 rounded-lg border border-slate-100 cursor-pointer"
                          title="Delete guardian"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* Info Lines */}
                    <div className="space-y-2 text-[11px] text-slate-600 text-left">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono">{guardian.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono">{guardian.cnic || 'CNIC not provided'}</span>
                      </div>
                    </div>

                    {/* Linked Children */}
                    <div className="bg-slate-50 rounded-2xl p-3 space-y-2 border border-slate-100">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        Children ({children.length})
                      </h4>
                      {children.length === 0 ? (
                        <p className="text-[10px] text-slate-400 text-left italic">No students matched by name/phone</p>
                      ) : (
                        <div className="space-y-1">
                          {children.map(student => (
                            <div key={student.id} className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                              <span className="truncate">👤 {student.name}</span>
                              <span className="bg-blue-50 text-blue-800 px-1.5 py-0.2 rounded-full text-[9px] font-bold shrink-0">
                                {student.grade}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button 
                      onClick={() => setActiveChat(guardian)}
                      className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Software Chat</span>
                    </button>
                    <a 
                      href={`https://wa.me/${guardian.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Chat Drawer */}
      <AnimatePresence>
        {activeChat && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[100] flex flex-col border-l border-slate-200"
          >
            {/* Chat Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveChat(null)} className="p-1 hover:bg-white/10 rounded-lg">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black">
                  {activeChat.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold">{activeChat.name}</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-black">{activeChat.relation} • {activeChat.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => startCall('video')} className="p-2 hover:bg-white/10 rounded-lg text-slate-400"><Video className="w-4 h-4" /></button>
                <button onClick={() => startCall('voice')} className="p-2 hover:bg-white/10 rounded-lg text-slate-400"><Phone className="w-4 h-4" /></button>
                <button onClick={() => setActiveChat(null)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400"><X className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Calling Overlay */}
            <AnimatePresence>
              {activeCall && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-[110] bg-slate-900 flex flex-col items-center justify-between py-20 text-white"
                >
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 bg-indigo-600 rounded-full mx-auto flex items-center justify-center text-3xl font-black shadow-2xl shadow-indigo-600/40 relative">
                      {activeChat.name.charAt(0)}
                      {activeCall.status === 'calling' && (
                        <div className="absolute inset-0 border-4 border-white/30 rounded-full animate-ping"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{activeChat.name}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {activeCall.status === 'calling' ? 'Calling...' : `On ${activeCall.type} call • ${formatCallTime(callTime)}`}
                      </p>
                    </div>
                  </div>

                  {activeCall.type === 'video' && activeCall.status === 'connected' && (
                    <div className="w-full max-w-xs aspect-video bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative">
                       <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                          <Video className="w-10 h-10" />
                       </div>
                       <div className="absolute bottom-3 right-3 w-16 h-24 bg-slate-700 rounded-lg border border-white/20 shadow-lg"></div>
                    </div>
                  )}

                  <div className="flex items-center gap-6">
                    <button className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                      <Mic className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={endCall}
                      className="w-16 h-16 bg-rose-500 hover:bg-rose-600 rounded-full flex items-center justify-center transition-all shadow-xl shadow-rose-500/30 active:scale-95"
                    >
                      <Phone className="w-7 h-7 rotate-[135deg]" />
                    </button>
                    <button className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f0f2f5] custom-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center p-8">
                  <div className="space-y-2">
                    <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-loose">
                      No message history found.<br/>Start a conversation with {activeChat.name}.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.senderId === 'school_admin';
                  return (
                    <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm text-sm ${
                        isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                      }`}>
                        {msg.type === 'text' && <p className="leading-relaxed">{msg.text}</p>}
                        
                        {msg.type === 'image' && (
                          <div className="space-y-2">
                            <img src={msg.fileUrl} alt="Sent" className="rounded-xl max-w-full h-auto shadow-sm cursor-pointer" onClick={() => window.open(msg.fileUrl, '_blank')} />
                            {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                          </div>
                        )}

                        {msg.type === 'video' && (
                          <div className="space-y-2">
                            <video src={msg.fileUrl} controls className="rounded-xl max-w-full h-auto shadow-sm" />
                            {msg.text && <p className="leading-relaxed">{msg.text}</p>}
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

                        <div className={`text-[9px] mt-1.5 flex items-center gap-1 ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          {isMe && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white border-t border-slate-100">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className={`p-2 transition-colors ${isUploading ? 'text-indigo-600 animate-pulse' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileUpload}
                  accept="image/*,video/*,.pdf,.doc,.docx"
                />
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={isUploading ? "Uploading..." : "Type a message to parent..."}
                  disabled={isUploading}
                  className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={`p-2.5 rounded-xl transition-all ${
                    !newMessage.trim() 
                      ? 'bg-slate-100 text-slate-300' 
                      : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700'
                  }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add / Edit Modal */}
      {isAddingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[200] animate-in fade-in">
          <form 
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 text-left"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-500" />
                {editingGuardian ? 'Edit Guardian Details' : 'Add New Guardian'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsAddingModal(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Guardian Name *</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Haji Muhammad"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phone Number *</label>
                  <input 
                    type="tel" 
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="e.g. 03001234567"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Relation *</label>
                  <select 
                    value={formRelation}
                    onChange={(e) => setFormRelation(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Uncle">Uncle</option>
                    <option value="Brother">Brother</option>
                    <option value="Grandfather">Grandfather</option>
                    <option value="Guardian">Guardian / Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">CNIC (شناختی کارڈ نمبر)</label>
                <input 
                  type="text" 
                  value={formCnic}
                  onChange={(e) => setFormCnic(e.target.value)}
                  placeholder="e.g. 35202-1234567-1"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Occupation (پیشہ)</label>
                <input 
                  type="text" 
                  value={formOccupation}
                  onChange={(e) => setFormOccupation(e.target.value)}
                  placeholder="e.g. Business / Teacher"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. father@gmail.com"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Home Address</label>
                <input 
                  type="text" 
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Full physical address"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-amber-600 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Guardian</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
