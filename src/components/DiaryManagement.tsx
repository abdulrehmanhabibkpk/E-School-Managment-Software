import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, Plus, Search, Trash, Edit, Printer, 
  Calendar, Users, FileText, CheckCircle2,
  AlertTriangle, Share2, Layers, Image as ImageIcon, Upload, 
  RefreshCw, Filter, Download, X, Bold, Italic, Underline, 
  Strikethrough, Highlighter, List as ListIcon, ListOrdered,
  Link as LinkIcon, AlignLeft, AlignCenter, AlignRight, 
  Video, ChevronRight, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { updateCentralKey } from '../syncService';
import { generateUniqueId } from '../lib/idUtils';

interface DiaryEntry {
  id: string;
  title?: string;
  content: string;
  className: string;
  sections: string[];
  date: string;
  lastEditBy: string;
  createdAt: string;
  image?: string;
  isEdited?: boolean;
}

interface DiaryManagementProps {
  onBack: () => void;
}

export default function DiaryManagement({ onBack }: DiaryManagementProps) {
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingDiary, setEditingDiary] = useState<DiaryEntry | null>(null);

  // Form States
  const [formClass, setFormClass] = useState('');
  const [formSections, setFormSections] = useState<string[]>([]);
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formContent, setFormContent] = useState('');
  const [formImage, setFormImage] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('diary_entries');
    if (saved) {
      setDiaries(JSON.parse(saved));
    }
  }, []);

  const saveDiaries = (updated: DiaryEntry[]) => {
    setDiaries(updated);
    updateCentralKey('diary_entries', updated);
  };

  const handlePublish = () => {
    if (!formClass || formSections.length === 0 || !formContent) {
      alert('Please fill in required fields (Class, Sections, and Content)');
      return;
    }

    const currentUserName = localStorage.getItem('currentUserName') || 'Admin';

    if (editingDiary) {
      const updated = diaries.map(d => d.id === editingDiary.id ? {
        ...d,
        title: formTitle,
        content: formContent,
        className: formClass,
        sections: formSections,
        date: formDate,
        lastEditBy: currentUserName,
        isEdited: true
      } : d);
      saveDiaries(updated);
    } else {
      const newEntry: DiaryEntry = {
        id: generateUniqueId(),
        title: formTitle,
        content: formContent,
        className: formClass,
        sections: formSections,
        date: formDate,
        lastEditBy: currentUserName,
        createdAt: new Date().toISOString(),
        image: formImage || undefined
      };
      saveDiaries([newEntry, ...diaries]);
    }

    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setFormClass('');
    setFormSections([]);
    setFormTitle('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormContent('');
    setFormImage(null);
    setEditingDiary(null);
    if (editorRef.current) editorRef.current.innerHTML = '';
  };

  const handleEdit = (diary: DiaryEntry) => {
    setEditingDiary(diary);
    setFormClass(diary.className);
    setFormSections(diary.sections);
    setFormTitle(diary.title || '');
    setFormDate(diary.date);
    setFormContent(diary.content);
    setFormImage(diary.image || null);
    setShowModal(true);
    // Timeout to ensure modal is rendered
    setTimeout(() => {
      if (editorRef.current) editorRef.current.innerHTML = diary.content;
    }, 100);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this diary entry?')) {
      saveDiaries(diaries.filter(d => d.id !== id));
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setFormContent(editorRef.current.innerHTML);
    }
  };

  const filteredDiaries = diaries.filter(d => {
    const matchesSearch = d.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         d.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         d.lastEditBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'all' || d.className === selectedClass;
    const matchesSection = selectedSection === 'all' || d.sections.includes(selectedSection);
    const matchesDate = !selectedDate || d.date === selectedDate;
    return matchesSearch && matchesClass && matchesSection && matchesDate;
  });

  const stats = {
    total: diaries.length,
    thisMonth: diaries.filter(d => d.date.startsWith(new Date().toISOString().slice(0, 7))).length,
    thisWeek: diaries.filter(d => {
      const entryDate = new Date(d.date);
      const now = new Date();
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      return entryDate >= weekAgo;
    }).length
  };

  const classes = ['Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
  const sections = ['A', 'B', 'C', 'D'];

  return (
    <div className="flex flex-col h-full bg-[#F9FAFB] animate-fade-in">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              Diary <Video className="w-5 h-5 text-slate-400" />
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
              <Download className="w-4 h-4" /> Export
            </button>
            <button 
              onClick={() => { resetForm(); setShowModal(true); }}
              className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Diary
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider">
          <span className="hover:text-blue-600 cursor-pointer" onClick={onBack}>Overview</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-600">Diary</span>
        </div>
      </div>

      <div className="flex-1 p-8 space-y-8 overflow-y-auto custom-scrollbar">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50/50 border border-blue-100 rounded-[24px] p-6 flex flex-col gap-4 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <FileText className="w-16 h-16 text-blue-600" />
             </div>
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <FileText className="w-5 h-5 text-white" />
             </div>
             <div>
                <span className="text-xs font-bold text-blue-600/60 uppercase tracking-widest">Total Entries</span>
                <div className="text-3xl font-black text-blue-900 mt-1">{stats.total}</div>
             </div>
          </div>

          <div className="bg-purple-50/50 border border-purple-100 rounded-[24px] p-6 flex flex-col gap-4 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Calendar className="w-16 h-16 text-purple-600" />
             </div>
             <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/20">
                <Calendar className="w-5 h-5 text-white" />
             </div>
             <div>
                <span className="text-xs font-bold text-purple-600/60 uppercase tracking-widest">This Month</span>
                <div className="text-3xl font-black text-purple-900 mt-1">{stats.thisMonth}</div>
             </div>
          </div>

          <div className="bg-amber-50/50 border border-amber-100 rounded-[24px] p-6 flex flex-col gap-4 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Clock className="w-16 h-16 text-amber-600" />
             </div>
             <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-600/20">
                <Clock className="w-5 h-5 text-white" />
             </div>
             <div>
                <span className="text-xs font-bold text-amber-600/60 uppercase tracking-widest">This Week</span>
                <div className="text-3xl font-black text-amber-900 mt-1">{stats.thisWeek}</div>
             </div>
          </div>
        </div>

        {/* Filters and List */}
        <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/30">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[300px] relative">
                <input 
                  type="text" 
                  placeholder="Search by class, section, date, or editor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-400 transition-all text-sm font-medium"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              </div>
              <div className="w-48">
                <select 
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-400 transition-all text-sm font-medium appearance-none cursor-pointer"
                >
                  <option value="all">Class</option>
                  {classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="w-48">
                <select 
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-400 transition-all text-sm font-medium appearance-none cursor-pointer"
                >
                  <option value="all">Section</option>
                  {sections.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="w-48 relative">
                <input 
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-400 transition-all text-sm font-medium"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Title</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Class</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Section</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Diary Date</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Last Edit By</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDiaries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold">No diary entries found.</td>
                  </tr>
                ) : (
                  filteredDiaries.map((diary) => (
                    <tr key={diary.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700">{diary.title || 'Untitled Diary'}</span>
                          {diary.isEdited && (
                            <span className="bg-orange-50 text-orange-600 text-[10px] px-2 py-0.5 rounded-full font-black uppercase">Edited</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{diary.className}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-1">
                          {diary.sections.map(s => (
                            <span key={s} className="w-6 h-6 rounded-md bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {new Date(diary.date).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{diary.lastEditBy}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(diary)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(diary.id)}
                            className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-all"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Assign Diary Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl relative z-10 flex flex-col"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-800">Assign Diary</h2>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setShowModal(false)}
                    className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handlePublish}
                    className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 shadow-lg active:scale-95 transition-all"
                  >
                    Publish Diary
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Class</label>
                    <select 
                      value={formClass}
                      onChange={(e) => setFormClass(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-400 transition-all font-bold text-slate-700 appearance-none"
                    >
                      <option value="">Select Class</option>
                      {classes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Select sections</label>
                    <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl min-h-[60px]">
                      {sections.map(s => (
                        <button 
                          key={s}
                          onClick={() => {
                            if (formSections.includes(s)) {
                              setFormSections(formSections.filter(sec => sec !== s));
                            } else {
                              setFormSections([...formSections, s]);
                            }
                          }}
                          className={`w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center transition-all ${
                            formSections.includes(s) 
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                              : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Title (optional)</label>
                    <input 
                      type="text"
                      placeholder="Enter diary title"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-400 transition-all font-bold text-slate-700"
                    />
                  </div>
                  <div className="space-y-2 relative">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Date of Diary</label>
                    <div className="relative">
                      <input 
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-400 transition-all font-bold text-slate-700"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <button className="w-full p-4 border-2 border-dashed border-slate-200 rounded-[24px] text-slate-400 hover:border-slate-300 hover:bg-slate-50 transition-all flex flex-col items-center justify-center gap-2 group">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    </div>
                    <span className="text-sm font-bold">Upload Image (optional)</span>
                  </button>
                </div>

                {/* Rich Text Editor */}
                <div className="border border-slate-200 rounded-[24px] overflow-hidden relative">
                  <div className="bg-slate-50 p-2 border-b border-slate-200 flex flex-wrap gap-1">
                    <button onClick={() => execCommand('undo')} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600"><RefreshCw className="w-4 h-4" /></button>
                    <button onClick={() => execCommand('redo')} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600 rotate-180"><RefreshCw className="w-4 h-4" /></button>
                    <div className="w-px h-6 bg-slate-200 mx-1 self-center" />
                    <button onClick={() => execCommand('bold')} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600"><Bold className="w-4 h-4" /></button>
                    <button onClick={() => execCommand('italic')} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600"><Italic className="w-4 h-4" /></button>
                    <button onClick={() => execCommand('underline')} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600"><Underline className="w-4 h-4" /></button>
                    <button onClick={() => execCommand('strikeThrough')} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600"><Strikethrough className="w-4 h-4" /></button>
                    <div className="w-px h-6 bg-slate-200 mx-1 self-center" />
                    <button onClick={() => execCommand('insertUnorderedList')} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600"><ListIcon className="w-4 h-4" /></button>
                    <button onClick={() => execCommand('insertOrderedList')} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600"><ListOrdered className="w-4 h-4" /></button>
                    <div className="w-px h-6 bg-slate-200 mx-1 self-center" />
                    <button onClick={() => execCommand('justifyLeft')} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600"><AlignLeft className="w-4 h-4" /></button>
                    <button onClick={() => execCommand('justifyCenter')} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600"><AlignCenter className="w-4 h-4" /></button>
                    <button onClick={() => execCommand('justifyRight')} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600"><AlignRight className="w-4 h-4" /></button>
                  </div>
                  <div 
                    ref={editorRef}
                    contentEditable
                    onInput={(e) => setFormContent(e.currentTarget.innerHTML)}
                    placeholder="Type your text here..."
                    className="min-h-[300px] p-6 outline-none font-medium text-slate-600 prose prose-slate max-w-none"
                    style={{ direction: 'auto' }}
                  />
                  {(formContent === '' || formContent === '<br>') && (
                    <div className="absolute top-16 left-6 pointer-events-none text-slate-300 font-medium">Type your text here...</div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
