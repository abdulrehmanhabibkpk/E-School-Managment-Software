import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Search,
  Trash2,
  Pin,
  PinOff,
  Palette,
  Tag,
  Check,
  Copy,
  Archive,
  ArrowRight,
  Folder,
  Clock,
  Share2,
  AlertCircle
} from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  isPinned: boolean;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

const NOTE_COLORS = [
  { id: 'white', name: 'سفید', bg: 'bg-white border-slate-200 text-slate-800', dot: 'bg-white border border-slate-300' },
  { id: 'yellow', name: 'پیلا', bg: 'bg-amber-50/80 border-amber-200/80 text-amber-950', dot: 'bg-amber-200/80' },
  { id: 'blue', name: 'نیلا', bg: 'bg-sky-50/80 border-sky-200/80 text-sky-950', dot: 'bg-sky-200/80' },
  { id: 'green', name: 'سبز', bg: 'bg-emerald-50/80 border-emerald-200/80 text-emerald-950', dot: 'bg-emerald-200/80' },
  { id: 'pink', name: 'گلابی', bg: 'bg-rose-50/80 border-rose-200/80 text-rose-950', dot: 'bg-rose-200/80' },
  { id: 'purple', name: 'جامنی', bg: 'bg-indigo-50/80 border-indigo-200/80 text-indigo-950', dot: 'bg-indigo-200/80' },
  { id: 'amber', name: 'نارنجی', bg: 'bg-orange-50/80 border-orange-200/80 text-orange-950', dot: 'bg-orange-200/80' },
  { id: 'slate', name: 'سلیٹی', bg: 'bg-slate-100/90 border-slate-200 text-slate-900', dot: 'bg-slate-200' }
];

const PRESET_TAGS = ['ذاتی', 'تدریس', 'خطبہ', 'مسائل', 'جامعہ', 'عام معلومات'];

export default function Notepad({ onBack }: { onBack?: () => void }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  
  // Note Creation State
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newColor, setNewColor] = useState('white');
  const [newIsPinned, setNewIsPinned] = useState(false);
  const [newTags, setNewTags] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null); // 'new' or note.id
  const [showTagSelector, setShowTagSelector] = useState<string | null>(null); // 'new' or note.id
  
  // Editing State
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);
  
  const creatorRef = useRef<HTMLDivElement>(null);

  // Load notes from local storage on mount
  useEffect(() => {
    const loadNotes = () => {
      try {
        const saved = localStorage.getItem('urdu_notes');
        if (saved) {
          setNotes(JSON.parse(saved));
        }
      } catch (err) {
        console.error('Error loading notes from localStorage:', err);
      }
    };

    loadNotes();
    window.addEventListener('storage_updated', loadNotes);
    return () => window.removeEventListener('storage_updated', loadNotes);
  }, []);

  // Save notes helper
  const saveNotesList = (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    localStorage.setItem('urdu_notes', JSON.stringify(updatedNotes));
  };

  // Click outside to close creator
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (creatorRef.current && !creatorRef.current.contains(event.target as Node)) {
        if (newTitle.trim() || newContent.trim()) {
          handleAddNote();
        } else {
          setIsCreating(false);
          resetCreatorState();
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [newTitle, newContent, newColor, newIsPinned, newTags]);

  const resetCreatorState = () => {
    setNewTitle('');
    setNewContent('');
    setNewColor('white');
    setNewIsPinned(false);
    setNewTags([]);
    setShowColorPicker(null);
    setShowTagSelector(null);
  };

  // Add a Note
  const handleAddNote = () => {
    if (!newTitle.trim() && !newContent.trim()) {
      setIsCreating(false);
      return;
    }

    const newNote: Note = {
      id: 'note_' + Date.now(),
      title: newTitle.trim(),
      content: newContent.trim(),
      color: newColor,
      isPinned: newIsPinned,
      tags: newTags,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const updated = [newNote, ...notes];
    saveNotesList(updated);
    setIsCreating(false);
    resetCreatorState();
  };

  // Delete Note
  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notes.filter(n => n.id !== id);
    saveNotesList(updated);
  };

  // Toggle Pin Status
  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notes.map(n => {
      if (n.id === id) {
        return { ...n, isPinned: !n.isPinned, updatedAt: Date.now() };
      }
      return n;
    });
    saveNotesList(updated);
  };

  // Change Note Color
  const handleChangeColor = (id: string, colorId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notes.map(n => {
      if (n.id === id) {
        return { ...n, color: colorId, updatedAt: Date.now() };
      }
      return n;
    });
    saveNotesList(updated);
    setShowColorPicker(null);
  };

  // Toggle Tag in Note
  const handleToggleTag = (id: string, tag: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notes.map(n => {
      if (n.id === id) {
        const alreadyHas = n.tags.includes(tag);
        const nextTags = alreadyHas 
          ? n.tags.filter(t => t !== tag)
          : [...n.tags, tag];
        return { ...n, tags: nextTags, updatedAt: Date.now() };
      }
      return n;
    });
    saveNotesList(updated);
  };

  // Copy Note Text
  const handleCopyNote = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    const fullText = `${note.title ? note.title + '\n' : ''}${note.content}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setCopiedNoteId(note.id);
      setTimeout(() => setCopiedNoteId(null), 2000);
    });
  };

  // Open note for full-screen edit modal
  const handleOpenEdit = (note: Note) => {
    setEditingNote({ ...note });
  };

  // Save full-screen edit note
  const handleSaveEdit = () => {
    if (!editingNote) return;
    if (!editingNote.title.trim() && !editingNote.content.trim()) {
      const updated = notes.filter(n => n.id !== editingNote.id);
      saveNotesList(updated);
    } else {
      const updated = notes.map(n => {
        if (n.id === editingNote.id) {
          return { ...editingNote, updatedAt: Date.now() };
        }
        return n;
      });
      saveNotesList(updated);
    }
    setEditingNote(null);
  };

  // Filter and search logic
  const filteredNotes = notes.filter(note => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = !selectedTagFilter || note.tags.includes(selectedTagFilter);
    
    return matchesSearch && matchesTag;
  });

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const otherNotes = filteredNotes.filter(n => !n.isPinned);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 min-h-screen pb-16" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3 w-full md:w-auto">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-500"
              title="واپس"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-urdu bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">اردو نوٹس و نوٹ پیڈ</span>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100 font-urdu">گوگل کیپ کی طرح</span>
          </div>
        </div>

        {/* Search Notes */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="نوٹس تلاش کریں..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-slate-100/80 border-0 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-urdu placeholder-slate-400 text-right"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-6">
        {/* Active Tag Filter Bar */}
        <div className="flex flex-wrap items-center gap-1.5 mb-6 justify-start" dir="rtl">
          <button
            onClick={() => setSelectedTagFilter(null)}
            className={`px-4 py-1.5 rounded-full text-xs font-urdu transition-all border ${
              !selectedTagFilter 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            تمام نوٹس
          </button>
          {PRESET_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTagFilter(tag)}
              className={`px-4 py-1.5 rounded-full text-xs font-urdu transition-all border ${
                selectedTagFilter === tag
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Keep Note Creator Card */}
        <div className="max-w-xl mx-auto mb-10" ref={creatorRef}>
          <div 
            className={`bg-white rounded-2xl border transition-all duration-300 shadow-sm overflow-hidden ${
              isCreating 
                ? 'ring-2 ring-indigo-500 border-transparent shadow-md' 
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            {!isCreating ? (
              <div 
                className="p-4 flex items-center justify-between cursor-text"
                onClick={() => setIsCreating(true)}
              >
                <span className="text-slate-400 text-sm font-urdu">ایک نیا نوٹ لکھیں...</span>
                <Plus className="w-5 h-5 text-slate-400" />
              </div>
            ) : (
              <div className={`p-4 transition-colors ${NOTE_COLORS.find(c => c.id === newColor)?.bg || 'bg-white'}`}>
                {/* Title */}
                <div className="flex items-center justify-between mb-2">
                  <input
                    type="text"
                    placeholder="عنوان"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-transparent border-0 focus:ring-0 text-slate-900 font-bold font-urdu placeholder-slate-400 text-right text-base outline-none"
                  />
                  <button
                    onClick={() => setNewIsPinned(!newIsPinned)}
                    className={`p-1.5 rounded-full hover:bg-black/5 transition-all ${newIsPinned ? 'text-indigo-600' : 'text-slate-400'}`}
                    title={newIsPinned ? 'پن ہٹائیں' : 'پن کریں'}
                  >
                    <Pin className="w-4 h-4 fill-current" />
                  </button>
                </div>

                {/* Content Area */}
                <textarea
                  placeholder="نوٹ کی تفصیل لکھیں..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={3}
                  className="w-full bg-transparent border-0 focus:ring-0 text-slate-800 font-urdu placeholder-slate-400 text-right text-sm outline-none resize-none leading-relaxed"
                />

                {/* Selected Tags Display */}
                {newTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2 mb-3 justify-start">
                    {newTags.map(tag => (
                      <span key={tag} className="text-[10px] bg-black/5 text-slate-700 px-2 py-0.5 rounded font-urdu">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Toolbar */}
                <div className="flex items-center justify-between border-t border-slate-900/10 pt-3 mt-2 relative">
                  <div className="flex items-center gap-1.5">
                    {/* Color Palette Button */}
                    <div className="relative">
                      <button
                        onClick={() => setShowColorPicker(showColorPicker === 'new' ? null : 'new')}
                        className="p-1.5 rounded-full hover:bg-black/5 text-slate-500 hover:text-slate-700 transition-all"
                        title="رنگ تبدیل کریں"
                      >
                        <Palette className="w-4 h-4" />
                      </button>
                      
                      {showColorPicker === 'new' && (
                        <div className="absolute bottom-10 right-0 bg-white border border-slate-200 p-2 rounded-xl shadow-lg flex gap-1.5 z-50">
                          {NOTE_COLORS.map(c => (
                            <button
                              key={c.id}
                              onClick={() => {
                                setNewColor(c.id);
                                setShowColorPicker(null);
                              }}
                              className={`w-6 h-6 rounded-full cursor-pointer transition-all ${c.dot} ${newColor === c.id ? 'ring-2 ring-indigo-500 scale-110' : 'hover:scale-105'}`}
                              title={c.name}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Tag Selector Button */}
                    <div className="relative">
                      <button
                        onClick={() => setShowTagSelector(showTagSelector === 'new' ? null : 'new')}
                        className="p-1.5 rounded-full hover:bg-black/5 text-slate-500 hover:text-slate-700 transition-all"
                        title="ٹیگز شامل کریں"
                      >
                        <Tag className="w-4 h-4" />
                      </button>
                      
                      {showTagSelector === 'new' && (
                        <div className="absolute bottom-10 right-0 bg-white border border-slate-200 p-2.5 rounded-xl shadow-lg w-40 z-50 flex flex-col gap-1.5">
                          <span className="text-[10px] text-slate-400 font-urdu border-b pb-1 mb-1 text-right">لیبل منتخب کریں</span>
                          {PRESET_TAGS.map(tag => {
                            const isSelected = newTags.includes(tag);
                            return (
                              <button
                                key={tag}
                                onClick={() => {
                                  if (isSelected) {
                                    setNewTags(newTags.filter(t => t !== tag));
                                  } else {
                                    setNewTags([...newTags, tag]);
                                  }
                                }}
                                className="flex items-center justify-between text-right font-urdu text-xs hover:bg-slate-50 px-2 py-1 rounded transition-colors text-slate-700"
                              >
                                <span>{tag}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleAddNote}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-urdu text-xs font-bold px-4 py-1.5 rounded-xl shadow-sm transition-all"
                  >
                    محفوظ کریں
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes Sections */}
        {notes.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Folder className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 font-urdu mb-2">کوئی نوٹ موجود نہیں ہے</h3>
            <p className="text-slate-400 text-sm font-urdu leading-relaxed">
              اہم معلومات، دینی مسائل، خطبات کے نکات یا روزمرہ کے کاموں کو یاد رکھنے کے لیے یہاں خوبصورت نوٹس بنائیں۔
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Pinned Section */}
            {pinnedNotes.length > 0 && (
              <div>
                <span className="text-xs font-bold font-urdu text-slate-400 block mb-4 border-b pb-1.5">پن کردہ نوٹس</span>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {pinnedNotes.map(note => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onDelete={(id, e) => handleDeleteNote(id, e)}
                        onTogglePin={(id, e) => handleTogglePin(id, e)}
                        onColorChange={(id, cid, e) => handleChangeColor(id, cid, e)}
                        onToggleTag={(id, tag, e) => handleToggleTag(id, tag, e)}
                        onCopy={(n, e) => handleCopyNote(n, e)}
                        copiedId={copiedNoteId}
                        onEdit={handleOpenEdit}
                        showColorPicker={showColorPicker}
                        setShowColorPicker={setShowColorPicker}
                        showTagSelector={showTagSelector}
                        setShowTagSelector={setShowTagSelector}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Others Section */}
            {otherNotes.length > 0 && (
              <div>
                {pinnedNotes.length > 0 && (
                  <span className="text-xs font-bold font-urdu text-slate-400 block mb-4 border-b pb-1.5">باقی نوٹس</span>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {otherNotes.map(note => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onDelete={(id, e) => handleDeleteNote(id, e)}
                        onTogglePin={(id, e) => handleTogglePin(id, e)}
                        onColorChange={(id, cid, e) => handleChangeColor(id, cid, e)}
                        onToggleTag={(id, tag, e) => handleToggleTag(id, tag, e)}
                        onCopy={(n, e) => handleCopyNote(n, e)}
                        copiedId={copiedNoteId}
                        onEdit={handleOpenEdit}
                        showColorPicker={showColorPicker}
                        setShowColorPicker={setShowColorPicker}
                        showTagSelector={showTagSelector}
                        setShowTagSelector={setShowTagSelector}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* No matches for filters */}
            {filteredNotes.length === 0 && (
              <div className="bg-slate-100 rounded-2xl p-8 text-center text-slate-500 font-urdu text-sm max-w-sm mx-auto">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <span>آپ کی تلاش کے مطابق کوئی نوٹ نہیں ملا۔</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Note Editing Modal */}
      <AnimatePresence>
        {editingNote && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-xl rounded-2xl border shadow-xl p-6 relative flex flex-col max-h-[90vh] overflow-hidden ${
                NOTE_COLORS.find(c => c.id === editingNote.color)?.bg || 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-900/10 pb-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs bg-black/10 px-2.5 py-1 rounded-full font-urdu text-slate-700">ترمیم نوٹ</span>
                  {editingNote.updatedAt && (
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(editingNote.updatedAt).toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    const nextPinned = !editingNote.isPinned;
                    setEditingNote({ ...editingNote, isPinned: nextPinned });
                  }}
                  className={`p-1.5 rounded-full hover:bg-black/5 transition-all ${editingNote.isPinned ? 'text-indigo-600' : 'text-slate-400'}`}
                >
                  <Pin className="w-4 h-4 fill-current" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {/* Editing Title */}
                <input
                  type="text"
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  placeholder="عنوان"
                  className="w-full bg-transparent border-0 focus:ring-0 text-slate-950 font-bold font-urdu placeholder-slate-400 text-right text-lg outline-none"
                />

                {/* Editing Content */}
                <textarea
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                  placeholder="تفصیل لکھیں..."
                  rows={8}
                  className="w-full bg-transparent border-0 focus:ring-0 text-slate-800 font-urdu placeholder-slate-400 text-right text-sm outline-none resize-none leading-relaxed"
                />

                {/* Tags in Modal */}
                <div className="flex flex-wrap gap-1 pt-2 justify-start">
                  {editingNote.tags.map(tag => (
                    <span key={tag} className="text-[10px] bg-black/5 text-slate-700 px-2 py-0.5 rounded font-urdu">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Modal footer / Actions */}
              <div className="flex items-center justify-between border-t border-slate-900/10 pt-4 mt-4">
                <div className="flex items-center gap-2">
                  {/* Color selector in modal */}
                  <div className="relative">
                    <button
                      onClick={() => setShowColorPicker(showColorPicker === 'edit-modal' ? null : 'edit-modal')}
                      className="p-2 rounded-full hover:bg-black/5 text-slate-500 transition-all"
                    >
                      <Palette className="w-4.5 h-4.5" />
                    </button>
                    {showColorPicker === 'edit-modal' && (
                      <div className="absolute bottom-11 right-0 bg-white border border-slate-200 p-2 rounded-xl shadow-lg flex gap-1.5 z-50">
                        {NOTE_COLORS.map(c => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setEditingNote({ ...editingNote, color: c.id });
                              setShowColorPicker(null);
                            }}
                            className={`w-6 h-6 rounded-full cursor-pointer transition-all ${c.dot} ${editingNote.color === c.id ? 'ring-2 ring-indigo-500 scale-110' : 'hover:scale-105'}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tag selector in modal */}
                  <div className="relative">
                    <button
                      onClick={() => setShowTagSelector(showTagSelector === 'edit-modal' ? null : 'edit-modal')}
                      className="p-2 rounded-full hover:bg-black/5 text-slate-500 transition-all"
                    >
                      <Tag className="w-4.5 h-4.5" />
                    </button>
                    {showTagSelector === 'edit-modal' && (
                      <div className="absolute bottom-11 right-0 bg-white border border-slate-200 p-2.5 rounded-xl shadow-lg w-40 z-50 flex flex-col gap-1.5">
                        <span className="text-[10px] text-slate-400 font-urdu border-b pb-1 mb-1 text-right">ٹیگز</span>
                        {PRESET_TAGS.map(tag => {
                          const isSelected = editingNote.tags.includes(tag);
                          return (
                            <button
                              key={tag}
                              onClick={() => {
                                const nextTags = isSelected
                                  ? editingNote.tags.filter(t => t !== tag)
                                  : [...editingNote.tags, tag];
                                setEditingNote({ ...editingNote, tags: nextTags });
                              }}
                              className="flex items-center justify-between text-right font-urdu text-xs hover:bg-slate-50 px-2 py-1 rounded transition-colors text-slate-700"
                            >
                              <span>{tag}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingNote(null)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-slate-700 font-urdu text-xs transition-colors"
                  >
                    منسوخ
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white font-urdu text-xs font-bold shadow-sm transition-colors"
                  >
                    تبدیل کریں
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

/* Sub component for the Note Card to clean up the code and prevent re-render mess */
interface NoteCardProps {
  key?: React.Key;
  note: Note;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onTogglePin: (id: string, e: React.MouseEvent) => void;
  onColorChange: (id: string, colorId: string, e: React.MouseEvent) => void;
  onToggleTag: (id: string, tag: string, e: React.MouseEvent) => void;
  onCopy: (note: Note, e: React.MouseEvent) => void;
  copiedId: string | null;
  onEdit: (note: Note) => void;
  showColorPicker: string | null;
  setShowColorPicker: (id: string | null) => void;
  showTagSelector: string | null;
  setShowTagSelector: (id: string | null) => void;
}

const NoteCard = ({
  note,
  onDelete,
  onTogglePin,
  onColorChange,
  onToggleTag,
  onCopy,
  copiedId,
  onEdit,
  showColorPicker,
  setShowColorPicker,
  showTagSelector,
  setShowTagSelector
}: NoteCardProps) => {
  const currentBg = NOTE_COLORS.find(c => c.id === note.color)?.bg || 'bg-white';

  return (
    <motion.div
      layoutId={note.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => onEdit(note)}
      className={`${currentBg} p-5 rounded-2xl border shadow-xs hover:shadow-md transition-all duration-200 relative group flex flex-col cursor-pointer min-h-[160px]`}
    >
      {/* Top note header */}
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-bold text-slate-900 font-urdu flex-1 text-right line-clamp-2">
          {note.title || <span className="text-slate-400 font-normal">بغیر عنوان</span>}
        </h4>
        <button
          onClick={(e) => onTogglePin(note.id, e)}
          className={`p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-black/5 transition-all text-slate-400 hover:text-slate-700 ml-1.5 ${note.isPinned ? '!opacity-100 text-indigo-600' : ''}`}
          title={note.isPinned ? 'پن ہٹائیں' : 'پن کریں'}
        >
          <Pin className="w-3.5 h-3.5 fill-current" />
        </button>
      </div>

      {/* Note body content */}
      <p className="text-xs text-slate-800 font-urdu text-right whitespace-pre-line line-clamp-5 flex-1 leading-relaxed mb-4">
        {note.content}
      </p>

      {/* Tag pills */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3.5 justify-start">
          {note.tags.map(tag => (
            <span key={tag} className="text-[9px] bg-black/5 text-slate-700 px-1.5 py-0.5 rounded font-urdu">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Action panel */}
      <div className="flex items-center justify-between border-t border-slate-900/5 pt-3 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-200">
        <div className="flex items-center gap-1">
          {/* Change color menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(showColorPicker === note.id ? null : note.id);
                setShowTagSelector(null);
              }}
              className="p-1 rounded-full hover:bg-black/5 text-slate-400 hover:text-slate-700 transition-colors"
              title="رنگ تبدیل کریں"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>
            {showColorPicker === note.id && (
              <div 
                className="absolute bottom-7 right-0 bg-white border border-slate-200 p-1.5 rounded-lg shadow-lg flex gap-1 z-30"
                onClick={(e) => e.stopPropagation()}
              >
                {NOTE_COLORS.map(c => (
                  <button
                    key={c.id}
                    onClick={(e) => onColorChange(note.id, c.id, e)}
                    className={`w-5 h-5 rounded-full cursor-pointer border ${c.dot} hover:scale-110 transition-transform`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Tag selector menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTagSelector(showTagSelector === note.id ? null : note.id);
                setShowColorPicker(null);
              }}
              className="p-1 rounded-full hover:bg-black/5 text-slate-400 hover:text-slate-700 transition-colors"
              title="ٹیگ منتخب کریں"
            >
              <Tag className="w-3.5 h-3.5" />
            </button>
            {showTagSelector === note.id && (
              <div 
                className="absolute bottom-7 right-0 bg-white border border-slate-200 p-1.5 rounded-lg shadow-lg w-32 z-30 flex flex-col gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                {PRESET_TAGS.map(tag => {
                  const hasTag = note.tags?.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={(e) => onToggleTag(note.id, tag, e)}
                      className="flex items-center justify-between text-right font-urdu text-[10px] hover:bg-slate-50 px-1.5 py-0.5 rounded transition-colors text-slate-700"
                    >
                      <span>{tag}</span>
                      {hasTag && <Check className="w-3 text-indigo-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Copy notes button */}
          <button
            onClick={(e) => onCopy(note, e)}
            className="p-1 rounded-full hover:bg-black/5 text-slate-400 hover:text-slate-700 transition-colors"
            title="کاپی کریں"
          >
            {copiedId === note.id ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <button
          onClick={(e) => onDelete(note.id, e)}
          className="p-1 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
          title="حذف کریں"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};
