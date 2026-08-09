/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { Search, UserPlus, Filter, MoreVertical, Mail, Phone, Download, Printer, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const mockStudents = [
  { id: '1', roll: '101', name: 'Aarav Sharma', class: '10th', section: 'A', parent: 'Rajesh Sharma', phone: '+91 98765 43210', status: 'Active' },
  { id: '2', roll: '102', name: 'Ishani Patel', class: '10th', section: 'A', parent: 'Amit Patel', phone: '+91 98765 43211', status: 'Active' },
  { id: '3', roll: '103', name: 'Zoya Khan', class: '10th', section: 'B', parent: 'Imran Khan', phone: '+91 98765 43212', status: 'Active' },
  { id: '4', roll: '104', name: 'Kabir Verma', class: '10th', section: 'B', parent: 'Suresh Verma', phone: '+91 98765 43213', status: 'Active' },
  { id: '5', roll: '105', name: 'Ananya Rao', class: '10th', section: 'C', parent: 'Venkat Rao', phone: '+91 98765 43214', status: 'Active' },
];

export default function StudentManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [students, setStudents] = useState(mockStudents);

  const handlePrint = () => {
    window.print();
  };

  const handleAddStudent = (e: FormEvent) => {
    e.preventDefault();
    // Simulate adding student
    const formData = new FormData(e.target as HTMLFormElement);
    const newStudent = {
      id: (students.length + 1).toString(),
      roll: (100 + students.length + 1).toString(),
      name: formData.get('name') as string,
      class: formData.get('class') as string,
      section: formData.get('section') as string,
      parent: formData.get('parent') as string,
      phone: formData.get('phone') as string,
      status: 'Active'
    };
    setStudents([...students, newStudent]);
    setIsAdding(false);
  };

  return (
    <div className="space-y-8 print:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Student Directory</h1>
          <p className="text-slate-500 mt-1">Manage and track student profiles, records, and academic history.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <Printer size={18} />
            Print List
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <UserPlus size={18} />
            Add Student
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden print:border-none print:shadow-none">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 print:hidden">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, roll, or class..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center justify-center gap-2">
              <Filter size={16} />
              Filter
            </button>
            <select className="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium outline-none">
              <option>All Classes</option>
              <option>10th Grade</option>
              <option>9th Grade</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Roll No</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Class/Section</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Parent Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={student.id} 
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold print:border">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{student.name}</p>
                        <p className="text-xs text-slate-500">ID: 2024-{student.id}00</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-600">#{student.roll}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <span className="font-semibold text-slate-700">{student.class}</span>
                      <span className="text-slate-400 ml-1">Section {student.section}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-sm text-slate-700">{student.parent}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">{student.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold print:border">
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right print:hidden">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => window.print()}
                        className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Print Profile"
                      >
                        <Printer size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="relative w-full max-w-xl h-full bg-white shadow-2xl p-8 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-900">New Student Admission</h2>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleAddStudent} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                      <input name="name" required type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="e.g. Rahul Verma" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                      <select name="class" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none">
                        <option>10th</option>
                        <option>9th</option>
                        <option>8th</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
                      <select name="section" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none">
                        <option>A</option>
                        <option>B</option>
                        <option>C</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Parent / Guardian Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Parent Name</label>
                      <input name="parent" required type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none" placeholder="e.g. Sunil Verma" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                      <input name="phone" required type="tel" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none" placeholder="+91 XXXXX XXXXX" />
                    </div>
                  </div>
                </div>

                <div className="pt-8 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    Register Student
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white !important; }
          main { padding: 0 !important; margin: 0 !important; max-width: none !important; width: 100% !important; }
          .ml-64 { margin-left: 0 !important; }
        }
      `}} />
    </div>
  );
}

