import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, BookOpen, User, Plus, 
  Trash, Save, ChevronRight, Layout, Download,
  Printer, Filter, Search, MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { updateCentralKey } from '../syncService';
import { generateUniqueId } from '../lib/idUtils';

interface TimetableSlot {
  id: string;
  subject: string;
  teacher: string;
  startTime: string;
  endTime: string;
  day: string;
}

interface ClassTimetable {
  classId: string;
  className: string;
  slots: TimetableSlot[];
}

export default function TimetableManagement({ onBack }: { onBack: () => void }) {
  const [timetables, setTimetables] = useState<ClassTimetable[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

  const [newSlot, setNewSlot] = useState({
    subject: '',
    teacher: '',
    startTime: '08:00',
    endTime: '09:00',
    day: 'Monday'
  });

  useEffect(() => {
    const saved = localStorage.getItem('school_timetables');
    if (saved) setTimetables(JSON.parse(saved));
    if (classes.length > 0) setSelectedClass(classes[0]);
  }, []);

  const saveTimetables = (data: ClassTimetable[]) => {
    setTimetables(data);
    updateCentralKey('school_timetables', data);
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const slot: TimetableSlot = {
      id: generateUniqueId(),
      ...newSlot
    };

    const existing = timetables.find(t => t.className === selectedClass);
    let updated: ClassTimetable[];

    if (existing) {
      updated = timetables.map(t => t.className === selectedClass 
        ? { ...t, slots: [...t.slots, slot] } 
        : t
      );
    } else {
      updated = [...timetables, { classId: generateUniqueId(), className: selectedClass, slots: [slot] }];
    }

    saveTimetables(updated);
    setShowAddModal(false);
  };

  const removeSlot = (slotId: string) => {
    const updated = timetables.map(t => t.className === selectedClass 
      ? { ...t, slots: t.slots.filter(s => s.id !== slotId) } 
      : t
    );
    saveTimetables(updated);
  };

  const currentTimetable = timetables.find(t => t.className === selectedClass);

  return (
    <div className="flex flex-col h-full bg-[#F9FAFB] animate-fade-in">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              Class Timetables <Calendar className="w-5 h-5 text-indigo-600" />
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Period
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider">
          <span className="hover:text-indigo-600 cursor-pointer" onClick={onBack}>Dashboard</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-600">Timetable</span>
        </div>
      </div>

      <div className="flex-1 p-8 space-y-6 overflow-y-auto custom-scrollbar">
        {/* Class Selector */}
        <div className="bg-white p-4 border border-slate-200 rounded-[24px] flex items-center gap-4 shadow-sm">
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Select Class</div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {classes.map(cls => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                  selectedClass === cls 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>

        {/* Timetable Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {days.map(day => (
            <div key={day} className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm flex flex-col min-h-[400px]">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                  {day}
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  {currentTimetable?.slots.filter(s => s.day === day).length || 0} Periods
                </span>
              </div>
              <div className="p-4 space-y-3 flex-1">
                {currentTimetable?.slots.filter(s => s.day === day)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map(slot => (
                    <motion.div 
                      layout
                      key={slot.id} 
                      className="group p-4 bg-slate-50 border border-slate-200/60 rounded-2xl relative hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"
                    >
                      <button 
                        onClick={() => removeSlot(slot.id)}
                        className="absolute top-2 right-2 p-1.5 bg-white border border-slate-200 rounded-lg text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50"
                      >
                        <Trash className="w-3 h-3" />
                      </button>
                      
                      <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 mb-2">
                        <Clock className="w-3 h-3" />
                        {slot.startTime} - {slot.endTime}
                      </div>
                      
                      <div className="font-black text-slate-800 text-sm mb-1">{slot.subject}</div>
                      
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                        <User className="w-3 h-3" />
                        {slot.teacher}
                      </div>
                    </motion.div>
                ))}
                
                {(!currentTimetable || currentTimetable.slots.filter(s => s.day === day).length === 0) && (
                  <div className="h-full flex flex-col items-center justify-center py-10 opacity-40">
                    <Layout className="w-10 h-10 text-slate-300 mb-2" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Periods Scheduled</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Slot Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl relative z-10 p-8"
            >
              <h2 className="text-xl font-black text-slate-800 mb-8">Add New Period</h2>
              <form onSubmit={handleAddSlot} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Subject</label>
                    <input 
                      required
                      type="text"
                      value={newSlot.subject}
                      onChange={e => setNewSlot({...newSlot, subject: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-700"
                      placeholder="e.g. Mathematics"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Teacher</label>
                    <input 
                      required
                      type="text"
                      value={newSlot.teacher}
                      onChange={e => setNewSlot({...newSlot, teacher: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-700"
                      placeholder="e.g. Mr. Khan"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Start Time</label>
                    <input 
                      type="time"
                      value={newSlot.startTime}
                      onChange={e => setNewSlot({...newSlot, startTime: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">End Time</label>
                    <input 
                      type="time"
                      value={newSlot.endTime}
                      onChange={e => setNewSlot({...newSlot, endTime: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Day of Week</label>
                  <select 
                    value={newSlot.day}
                    onChange={e => setNewSlot({...newSlot, day: e.target.value})}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-700 appearance-none"
                  >
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold">Cancel</button>
                  <button type="submit" className="flex-2 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">Add Period</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
