import React, { useState, useEffect } from 'react';
import { 
  BookOpen, FileText, Download, Upload, Trash, 
  Search, Filter, ChevronRight, Plus, Folder,
  ExternalLink, Clock, User, Share2, MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { updateCentralKey } from '../syncService';
import { generateUniqueId } from '../lib/idUtils';

interface StudyMaterial {
  id: string;
  title: string;
  type: 'PDF' | 'Notes' | 'Worksheet' | 'Past Paper';
  classId: string;
  subject: string;
  fileUrl: string;
  fileSize: string;
  uploadedBy: string;
  date: string;
}

export default function StudyMaterialModule({ onBack }: { onBack: () => void }) {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [selectedType, setSelectedType] = useState('All Types');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
  const types = ['PDF', 'Notes', 'Worksheet', 'Past Paper'];

  const [newMaterial, setNewMaterial] = useState({
    title: '',
    type: 'PDF' as const,
    classId: 'Class 5',
    subject: '',
    fileUrl: '#'
  });

  useEffect(() => {
    const saved = localStorage.getItem('study_materials');
    if (saved) setMaterials(JSON.parse(saved));
  }, []);

  const saveMaterials = (data: StudyMaterial[]) => {
    setMaterials(data);
    updateCentralKey('study_materials', data);
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const material: StudyMaterial = {
      id: generateUniqueId(),
      ...newMaterial,
      fileSize: '2.4 MB',
      uploadedBy: 'Admin',
      date: new Date().toISOString()
    };
    saveMaterials([material, ...materials]);
    setShowUploadModal(false);
  };

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         m.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'All Classes' || m.classId === selectedClass;
    const matchesType = selectedType === 'All Types' || m.type === selectedType;
    return matchesSearch && matchesClass && matchesType;
  });

  return (
    <div className="flex flex-col h-full bg-[#F9FAFB] animate-fade-in">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              Study Material <BookOpen className="w-5 h-5 text-emerald-600" />
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg active:scale-95"
            >
              <Upload className="w-4 h-4" /> Upload Material
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider">
          <span className="hover:text-emerald-600 cursor-pointer" onClick={onBack}>Dashboard</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-600">Resources</span>
        </div>
      </div>

      <div className="flex-1 p-8 space-y-8 overflow-y-auto custom-scrollbar">
        {/* Filters */}
        <div className="bg-white p-6 border border-slate-200 rounded-[32px] shadow-sm flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by title or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all font-medium"
            />
          </div>
          <div className="flex gap-3">
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black text-slate-600 outline-none cursor-pointer hover:border-emerald-500 transition-colors appearance-none min-w-[140px]"
            >
              <option value="All Classes">All Classes</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black text-slate-600 outline-none cursor-pointer hover:border-emerald-500 transition-colors appearance-none min-w-[140px]"
            >
              <option value="All Types">All Types</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMaterials.map(material => (
            <div key={material.id} className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm group hover:border-emerald-500 transition-all flex flex-col relative">
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => saveMaterials(materials.filter(m => m.id !== material.id))}
                  className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>

              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>

              <div className="flex-1 space-y-2">
                <div className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest w-fit mb-2">
                  {material.type}
                </div>
                <h3 className="text-base font-black text-slate-800 leading-tight">{material.title}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{material.subject} • {material.classId}</p>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{material.fileSize}</span>
                  <span className="text-[9px] font-medium text-slate-400">{new Date(material.date).toLocaleDateString()}</span>
                </div>
                <a 
                  href={material.fileUrl}
                  className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
          
          {filteredMaterials.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white border border-dashed border-slate-200 rounded-[40px] opacity-50">
              <Folder className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No matching materials found</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowUploadModal(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl relative z-10 p-8">
              <h2 className="text-xl font-black text-slate-800 mb-8">Upload Study Material</h2>
              <form onSubmit={handleUpload} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Document Title</label>
                  <input required type="text" value={newMaterial.title} onChange={e => setNewMaterial({...newMaterial, title: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 font-bold text-slate-700" placeholder="e.g. Unit 1: Algebra Basics" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Subject</label>
                    <input required type="text" value={newMaterial.subject} onChange={e => setNewMaterial({...newMaterial, subject: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 font-bold text-slate-700" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Document Type</label>
                    <select value={newMaterial.type} onChange={e => setNewMaterial({...newMaterial, type: e.target.value as any})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 font-bold text-slate-700 appearance-none">
                      {types.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Select Class</label>
                  <select value={newMaterial.classId} onChange={e => setNewMaterial({...newMaterial, classId: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 font-bold text-slate-700 appearance-none">
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="border-2 border-dashed border-slate-200 rounded-[24px] p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-emerald-50/30 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-300 mb-2" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Click to select PDF or Image</span>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowUploadModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold">Cancel</button>
                  <button type="submit" className="flex-2 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all">Upload File</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
