/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  GraduationCap, 
  Calendar, 
  Edit3, 
  Search, 
  Plus, 
  Clock, 
  MapPin, 
  Save, 
  CheckCircle2,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const mockExams = [
  { id: '1', title: 'Mathematics', class: '10th-A', date: '2024-08-15', time: '09:00 AM', room: 'Hall A', status: 'Scheduled' },
  { id: '2', title: 'Physics', class: '10th-A', date: '2024-08-17', time: '10:30 AM', room: 'Hall B', status: 'Scheduled' },
  { id: '3', title: 'Chemistry', class: '10th-A', date: '2024-08-19', time: '09:00 AM', room: 'Lab 1', status: 'Scheduled' },
];

const mockStudents = [
  { id: '1', name: 'Aarav Sharma', roll: '101', marks: '' },
  { id: '2', name: 'Ishani Patel', roll: '102', marks: '' },
  { id: '3', name: 'Zoya Khan', roll: '103', marks: '' },
  { id: '4', name: 'Kabir Verma', roll: '104', marks: '' },
  { id: '5', name: 'Ananya Rao', roll: '105', marks: '' },
];

export default function Examinations() {
  const [activeSubTab, setActiveSubTab] = useState<'schedule' | 'marks'>('schedule');
  const [searchExam, setSearchExam] = useState('');
  const [marksData, setMarksData] = useState(mockStudents);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Examination System</h1>
          <p className="text-slate-500 mt-1">Manage exam cycles, generated timetables, and teacher grading portals.</p>
        </div>
        <div className="flex bg-white p-1 border border-slate-200 rounded-xl shrink-0">
          <button 
            onClick={() => setActiveSubTab('schedule')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeSubTab === 'schedule' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Exam Schedule
          </button>
          <button 
            onClick={() => setActiveSubTab('marks')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeSubTab === 'marks' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Marks Entry
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'schedule' ? (
          <motion.div
            key="schedule"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search exams..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                  value={searchExam}
                  onChange={(e) => setSearchExam(e.target.value)}
                />
              </div>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
                <Plus size={18} />
                Schedule New Exam
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockExams.map((exam) => (
                <div key={exam.id} className="bg-white p-6 border border-slate-200 rounded-2xl hover:shadow-lg transition-all group border-l-4 border-l-indigo-600">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{exam.title}</h3>
                      <p className="text-sm font-medium text-slate-500">{exam.class}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded-md">
                      {exam.status}
                    </span>
                  </div>
                  
                  <div className="space-y-3 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Calendar size={16} className="text-slate-400" />
                      {new Date(exam.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Clock size={16} className="text-slate-400" />
                      {exam.time}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <MapPin size={16} className="text-slate-400" />
                      {exam.room}
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2">
                    <button className="flex-1 py-2 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100">
                      Edit
                    </button>
                    <button className="flex-1 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100">
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="marks"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Class</label>
                  <select className="block w-40 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none">
                    <option>Class 10th-A</option>
                    <option>Class 10th-B</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subject</label>
                  <select className="block w-40 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none">
                    <option>Mathematics</option>
                    <option>Physics</option>
                    <option>English</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Exam Type</label>
                  <select className="block w-40 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none">
                    <option>Mid-Term</option>
                    <option>Final Exam</option>
                    <option>Unit Test</option>
                  </select>
                </div>
              </div>
              <button className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center gap-2 h-fit self-end">
                <Filter size={18} />
                Load Students
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Edit3 size={20} />
                  </div>
                  <h3 className="font-bold text-slate-800">Mathematics Marks Entry</h3>
                </div>
                <span className="text-xs font-bold text-slate-400">Total Marks: 100</span>
              </div>
              
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Roll</th>
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Marks Obtained</th>
                    <th className="px-6 py-4">Attendance</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {marksData.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-400">#{student.roll}</td>
                      <td className="px-6 py-4 font-semibold text-slate-800">{student.name}</td>
                      <td className="px-6 py-4">
                        <input 
                          type="number" 
                          placeholder="00"
                          className="w-20 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <select className="bg-transparent text-sm font-medium text-slate-600 outline-none">
                          <option>Present</option>
                          <option>Absent</option>
                          <option>Medical</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300">
                          <CheckCircle2 size={14} />
                          Not Saved
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-sm text-slate-500 font-medium">Auto-save is enabled. Last backup 2 mins ago.</p>
                <div className="flex gap-3">
                  <button className="px-6 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-white transition-colors">
                    Preview
                  </button>
                  <button className="px-8 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center gap-2">
                    <Save size={18} />
                    Final Submit
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
