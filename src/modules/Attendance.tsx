/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Calendar as CalendarIcon, Check, X, AlertCircle, Clock, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { motion } from 'motion/react';

const students = [
  { id: '1', roll: '101', name: 'Aarav Sharma', status: 'Present' },
  { id: '2', roll: '102', name: 'Ishani Patel', status: 'Present' },
  { id: '3', roll: '103', name: 'Zoya Khan', status: 'Absent' },
  { id: '4', roll: '104', name: 'Kabir Verma', status: 'Late' },
  { id: '5', roll: '105', name: 'Ananya Rao', status: 'Present' },
];

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState(students);

  const toggleStatus = (id: string, newStatus: string) => {
    setAttendance(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Daily Attendance</h1>
          <p className="text-slate-500 mt-1">Mark and monitor student attendance records for class 10th-A.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 border border-slate-200 rounded-xl">
          <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
            <ChevronLeft size={20} />
          </button>
          <div className="px-4 py-1.5 flex items-center gap-2 text-sm font-bold text-slate-700">
            <CalendarIcon size={16} className="text-indigo-600" />
            {new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/30">
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search student..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors">Mark All Present</button>
                <button className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">Reset</button>
              </div>
            </div>

            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Roll</th>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4 text-center">Mark Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendance.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-400">#{student.roll}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{student.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {[
                          { label: 'Present', icon: Check, color: 'emerald', bg: 'emerald' },
                          { label: 'Absent', icon: X, color: 'rose', bg: 'rose' },
                          { label: 'Late', icon: Clock, color: 'amber', bg: 'amber' },
                          { label: 'Leave', icon: AlertCircle, color: 'indigo', bg: 'indigo' },
                        ].map((btn) => (
                          <button
                            key={btn.label}
                            onClick={() => toggleStatus(student.id, btn.label)}
                            className={`p-2 rounded-lg transition-all flex flex-col items-center gap-1 group relative ${
                              student.status === btn.label 
                                ? `bg-${btn.color}-600 text-white shadow-lg shadow-${btn.color}-500/20 scale-110` 
                                : `bg-${btn.color}-50 text-${btn.color}-600 hover:bg-${btn.color}-100`
                            }`}
                          >
                            <btn.icon size={18} />
                            <span className={`text-[10px] font-bold ${student.status === btn.label ? 'block' : 'hidden'}`}>
                              {btn.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all">
                Save Attendance
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Attendance Summary</h3>
            <div className="space-y-4">
              {[
                { label: 'Present', count: 32, total: 40, color: 'bg-emerald-500' },
                { label: 'Absent', count: 4, total: 40, color: 'bg-rose-500' },
                { label: 'Late', count: 2, total: 40, color: 'bg-amber-500' },
                { label: 'On Leave', count: 2, total: 40, color: 'bg-indigo-500' },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-600">{item.label}</span>
                    <span className="text-slate-400 font-bold">{item.count}/{item.total}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.count / item.total) * 100}%` }}
                      className={`h-full ${item.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <AlertCircle size={24} />
              </div>
              <h3 className="font-bold text-lg">Parent Alerts</h3>
            </div>
            <p className="text-indigo-100 text-sm leading-relaxed mb-6">
              When you save, automatic notifications will be sent to parents of absent students.
            </p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="w-5 h-5 border-2 border-indigo-400 rounded flex items-center justify-center group-hover:border-white transition-colors">
                  <div className="w-2.5 h-2.5 bg-white rounded-sm" />
                </div>
                <span className="text-sm font-medium">Send SMS Alert</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="w-5 h-5 border-2 border-indigo-400 rounded flex items-center justify-center group-hover:border-white transition-colors">
                  <div className="w-2.5 h-2.5 bg-white rounded-sm" />
                </div>
                <span className="text-sm font-medium">Send WhatsApp</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
