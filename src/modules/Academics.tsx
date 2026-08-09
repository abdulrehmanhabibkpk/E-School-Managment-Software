/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { BookOpen, Calendar, Clock, CheckCircle2, ChevronRight, Plus } from 'lucide-react';
import { motion } from 'motion/react';

const mockSyllabus = [
  { id: '1', subject: 'Mathematics', topic: 'Quadratic Equations', status: 'Completed', progress: 100 },
  { id: '2', subject: 'Physics', topic: 'Electromagnetism', status: 'In Progress', progress: 65 },
  { id: '3', subject: 'Chemistry', topic: 'Organic Compounds', status: 'Pending', progress: 0 },
  { id: '4', subject: 'Biology', topic: 'Cell Structure', status: 'Completed', progress: 100 },
];

const mockTimetable = [
  { time: '08:00 AM', mon: 'Math', tue: 'Physics', wed: 'English', thu: 'Math', fri: 'History' },
  { time: '09:00 AM', mon: 'Physics', tue: 'Math', wed: 'Physics', thu: 'History', fri: 'Math' },
  { time: '10:00 AM', mon: 'English', tue: 'Chem', wed: 'Math', thu: 'Physics', fri: 'English' },
  { time: '11:00 AM', mon: 'Break', tue: 'Break', wed: 'Break', thu: 'Break', fri: 'Break' },
  { time: '11:30 AM', mon: 'Chem', tue: 'English', wed: 'Chem', thu: 'English', fri: 'Chem' },
];

export default function Academics() {
  const [activeTab, setActiveTab] = useState<'syllabus' | 'timetable'>('syllabus');

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Academic Planning</h1>
          <p className="text-slate-500 mt-1">Track syllabus completion and manage class timetables.</p>
        </div>
        <div className="flex bg-white p-1 border border-slate-200 rounded-xl">
          <button 
            onClick={() => setActiveTab('syllabus')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'syllabus' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Syllabus Tracker
          </button>
          <button 
            onClick={() => setActiveTab('timetable')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'timetable' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Class Timetable
          </button>
        </div>
      </div>

      {activeTab === 'syllabus' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Class 10th-A Syllabus Status</h3>
                <button className="text-indigo-600 text-sm font-bold hover:underline">+ Update Progress</button>
              </div>
              <div className="divide-y divide-slate-100">
                {mockSyllabus.map((item) => (
                  <div key={item.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        item.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                      }`}>
                        <BookOpen size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{item.subject}</h4>
                        <p className="text-sm text-slate-500">Topic: {item.topic}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Progress</p>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${item.progress}%` }}
                              className={`h-full ${item.status === 'Completed' ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                            />
                          </div>
                          <span className="text-sm font-bold text-slate-700">{item.progress}%</span>
                        </div>
                      </div>
                      <ChevronRight className="text-slate-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CheckCircle2 size={24} />
                Daily Goals
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm">
                  <div className="mt-1 w-4 h-4 rounded border-2 border-indigo-400 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 bg-white rounded-sm" />
                  </div>
                  <span>Complete Trigonometry test assessment</span>
                </li>
                <li className="flex items-start gap-3 text-sm opacity-60">
                  <div className="mt-1 w-4 h-4 rounded border-2 border-indigo-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={12} className="text-white" />
                  </div>
                  <span className="line-through">Verify Science lab practical records</span>
                </li>
              </ul>
              <button className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all">
                View All Tasks
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="text-indigo-600" />
              <h3 className="font-bold text-slate-800">Weekly Class Timetable</h3>
            </div>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2">
              <Plus size={16} />
              Edit Timetable
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-left">Time</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Monday</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Tuesday</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Wednesday</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Thursday</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Friday</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockTimetable.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-6 text-sm font-bold text-slate-400 text-left flex items-center gap-2">
                      <Clock size={14} />
                      {row.time}
                    </td>
                    <td className="px-6 py-6">
                      <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${row.mon === 'Break' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                        {row.mon}
                      </span>
                    </td>
                    <td className="px-6 py-6 font-semibold text-slate-700">{row.tue}</td>
                    <td className="px-6 py-6 font-semibold text-slate-700">{row.wed}</td>
                    <td className="px-6 py-6 font-semibold text-slate-700">{row.thu}</td>
                    <td className="px-6 py-6 font-semibold text-slate-700">{row.fri}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
