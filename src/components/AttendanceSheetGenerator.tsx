import React, { useState, useEffect } from 'react';
import { Printer, ChevronLeft, ChevronDown, GripVertical } from 'lucide-react';
import { getMadrassaName } from '../config';

interface AttendanceSheetProps {
  onBack: () => void;
}

export default function AttendanceSheetGenerator({ onBack }: AttendanceSheetProps) {
  const [teachers, setTeachers] = useState<string[]>(Array(10).fill(''));
  const [books, setBooks] = useState<string[]>(Array(10).fill(''));
  const [students, setStudents] = useState<any[]>([]);
  const [selectedGrade, setSelectedGrade] = useState('Grade 1');
  const [grades, setGrades] = useState<string[]>(["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8"]);
  const [isReordering, setIsReordering] = useState(false);
  const [periodCount, setPeriodCount] = useState(() => {
    const saved = localStorage.getItem('attendance_period_count');
    return saved ? parseInt(saved, 10) : 6;
  });
  
  // Data for selection
  const [availableStaff, setAvailableStaff] = useState<string[]>([]);
  const [academicBooks, setAcademicBooks] = useState<any[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<{ type: 'teacher' | 'book', index: number } | null>(null);

  const defaultPeriods = [
    { start: '7:30', end: '8:15' },
    { start: '8:15', end: '9:00' },
    { start: '9:00', end: '9:45' },
    { start: '9:45', end: '10:30' },
    { start: '10:30', end: '11:15' },
    { start: '11:15', end: '12:00' },
    { start: '12:00', end: '12:45' },
    { start: '12:45', end: '1:30' },
    { start: '1:30', end: '2:15' },
    { start: '2:15', end: '3:00' },
  ];
  const [periods, setPeriods] = useState(defaultPeriods);

  useEffect(() => {
    try {
      // 1. Load Grades
      const savedGrades = localStorage.getItem('grades_list');
      if (savedGrades) {
        const parsed = JSON.parse(savedGrades);
        if (Array.isArray(parsed)) {
          setGrades(parsed.map(g => typeof g === 'string' ? g : (g.name || String(g))));
        }
      }

      // 2. Load Staff from "Staff Management"
      const savedStaff = localStorage.getItem('staff');
      if (savedStaff) {
        const parsed = JSON.parse(savedStaff);
        if (Array.isArray(parsed)) {
          setAvailableStaff(parsed.map((s: any) => s.name));
        }
      }

      // 3. Load Academic Books from "Grade Management"
      const savedBooks = localStorage.getItem('books_list');
      if (savedBooks) {
        const parsed = JSON.parse(savedBooks);
        if (Array.isArray(parsed)) {
          setAcademicBooks(parsed);
        }
      }
    } catch (e) { console.error('Data loading error:', e); }
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('students');
      if (saved) {
        const all = JSON.parse(saved);
        if (Array.isArray(all)) {
          const filtered = selectedGrade === 'All' 
            ? all 
            : all.filter((s: any) => s && s.grade === selectedGrade);
          setStudents(filtered);
        }
      }
    } catch (e) { console.error('Students loading error:', e); }
  }, [selectedGrade]);

  const handlePrint = () => { window.print(); };

  const selectItem = (value: string) => {
    if (!activeDropdown) return;
    if (activeDropdown.type === 'teacher') {
      const n = [...teachers];
      n[activeDropdown.index] = value;
      setTeachers(n);
    } else {
      const n = [...books];
      n[activeDropdown.index] = value;
      setBooks(n);
    }
    setActiveDropdown(null);
  };

  // Filter books based on the selected grade
  const filteredAvailableBooks = academicBooks
    .filter(b => b.grade === selectedGrade)
    .map(b => b.name);

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans" dir="ltr">
      {/* Header */}
      <header className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 print:hidden shadow-sm">
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={onBack} className="bg-slate-100 text-slate-600 p-2 rounded-xl hover:bg-slate-200 transition-all flex flex-col items-center justify-center gap-0">
            <ChevronLeft className="w-6 h-6" />
            <span className="text-[8px] font-normal opacity-70">Back</span>
          </button>
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-bold text-slate-800">Attendance Sheet Generator</h1>
            <span className="text-[10px] font-normal text-slate-400 uppercase tracking-widest leading-none">Daily Student Attendance Sheet</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Class / Grade</span>
            <select 
              value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-slate-100 border-none rounded-xl px-4 py-2 text-sm outline-none font-bold min-w-[140px]"
            >
              <option value="All">All Students</option>
              {grades.map((g, i) => <option key={i} value={g}>{g}</option>)}
            </select>
          </div>
          <button 
            type="button" 
            onClick={() => setIsReordering(!isReordering)} 
            className={`px-6 py-2 rounded-xl text-sm font-bold shadow-md transition-all self-end flex flex-col items-center justify-center gap-0 ${isReordering ? 'bg-amber-400 text-slate-900 hover:bg-amber-500 font-bold border border-amber-500' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'}`}
          >
            <span>{isReordering ? 'Lock Order' : 'Unlock Order'}</span>
          </button>
          <button onClick={handlePrint} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold flex flex-col items-center justify-center gap-0 shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all self-end">
            <div className="flex items-center gap-2">
              <Printer className="w-4 h-4" /> <span>Print Sheet</span>
            </div>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 md:p-8 print:p-0" onClick={() => setActiveDropdown(null)}>
        <div className="max-w-[210mm] mx-auto bg-white p-4 md:p-[5mm] shadow-xl print:shadow-none print:p-0 relative" onClick={e => e.stopPropagation()}>
          
          {/* Settings Panel (Hidden in print) */}
          <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 print:hidden">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
               <h3 className="text-xs font-bold text-slate-500 flex flex-col items-start gap-0">
                 <div className="flex items-center gap-2">
                  <Users className="w-3 h-3" /> Select Teachers & Subject Books
                 </div>
               </h3>
               <span className="text-[10px] text-blue-600 font-bold">Selected Class: {selectedGrade}</span>
            </div>

            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <div className="flex flex-col items-start gap-0">
                <span className="text-xs font-bold text-slate-700">Adjust Number of Periods:</span>
              </div>
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                <button 
                  onClick={() => {
                    const newCount = Math.max(1, periodCount - 1);
                    setPeriodCount(newCount);
                    localStorage.setItem('attendance_period_count', String(newCount));
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 h-6 w-6 rounded flex items-center justify-center font-bold text-xs"
                  type="button"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-bold font-mono text-blue-700">{periodCount}</span>
                <button 
                  onClick={() => {
                    const newCount = Math.min(10, periodCount + 1);
                    setPeriodCount(newCount);
                    localStorage.setItem('attendance_period_count', String(newCount));
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 h-6 w-6 rounded flex items-center justify-center font-bold text-xs"
                  type="button"
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-10 gap-2">
              {teachers.slice(0, periodCount).map((t, i) => (
                <div key={i} className="relative">
                  <button 
                    onClick={() => setActiveDropdown({ type: 'teacher', index: i })}
                    className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-[9px] font-bold text-left truncate flex items-center justify-between hover:border-blue-500 transition-colors"
                  >
                    {t || `Teacher ${i+1}`}
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                  {activeDropdown?.type === 'teacher' && activeDropdown.index === i && (
                    <div className="absolute top-full left-0 w-48 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] max-h-48 overflow-y-auto">
                      <div className="p-2 bg-slate-50 text-[8px] font-bold text-slate-400 border-b">Staff List</div>
                      {availableStaff.map((name, idx) => (
                        <div key={idx} onClick={() => selectItem(name)} className="px-3 py-2 text-[10px] hover:bg-blue-50 cursor-pointer border-b border-slate-50 font-sans">{name}</div>
                      ))}
                      {availableStaff.length === 0 && <div className="p-3 text-[9px] text-slate-400 italic">No teachers found.</div>}
                      <div className="p-2">
                        <input autoFocus placeholder="Type custom name..." className="w-full px-2 py-1 text-[10px] border rounded outline-none" onKeyDown={e => e.key === 'Enter' && selectItem((e.target as HTMLInputElement).value)} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-10 gap-2">
              {books.slice(0, periodCount).map((b, i) => (
                <div key={i} className="relative">
                  <button 
                    onClick={() => setActiveDropdown({ type: 'book', index: i })}
                    className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-[9px] font-bold text-left truncate flex items-center justify-between hover:border-blue-500 transition-colors"
                  >
                    {b || `Subject ${i+1}`}
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                  {activeDropdown?.type === 'book' && activeDropdown.index === i && (
                    <div className="absolute top-full left-0 w-48 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] max-h-48 overflow-y-auto">
                      <div className="p-2 bg-slate-50 text-[8px] font-bold text-slate-400 border-b">Books for "{selectedGrade}"</div>
                      {filteredAvailableBooks.map((title, idx) => (
                        <div key={idx} onClick={() => selectItem(title)} className="px-3 py-2 text-[10px] hover:bg-blue-50 cursor-pointer border-b border-slate-50 font-sans">{title}</div>
                      ))}
                      {filteredAvailableBooks.length === 0 && <div className="p-3 text-[9px] text-slate-400 italic">No books found for this grade.</div>}
                      <div className="p-2">
                        <input autoFocus placeholder="Type custom book..." className="w-full px-2 py-1 text-[10px] border rounded outline-none" onKeyDown={e => e.key === 'Enter' && selectItem((e.target as HTMLInputElement).value)} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-10 gap-2 mt-4 border-t border-slate-200 pt-4">
              {periods.slice(0, periodCount).map((p, i) => (
                <div key={i} className="flex flex-col gap-1 border border-slate-200 rounded p-1 bg-white">
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] text-slate-400 w-6">In:</span>
                    <input className="text-[10px] w-full outline-none font-bold" value={p.start} onChange={(e) => {
                      const np = [...periods]; np[i].start = e.target.value; setPeriods(np);
                    }} />
                  </div>
                  <div className="h-px bg-slate-100 w-full" />
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] text-slate-400 w-6">Out:</span>
                    <input className="text-[10px] w-full outline-none font-bold" value={p.end} onChange={(e) => {
                      const np = [...periods]; np[i].end = e.target.value; setPeriods(np);
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* THE SHEET */}
          <div className="border-[1.5px] border-black">
             <div className="flex border-b-[1.5px] border-black h-16">
                <div className="w-32 border-r-[1.5px] border-black flex items-center justify-center font-bold text-xl">{selectedGrade}</div>
                <div className="flex-1 flex items-center justify-center">
                  <h2 className="text-xl md:text-2xl font-bold font-sans">Daily Attendance Sheet - {getMadrassaName()}</h2>
                </div>
             </div>

             <table className="w-full border-collapse">
               <thead>
                 <tr className="h-20">
                   <th className="border-[1.5px] border-black w-12 text-[10px] font-bold" rowSpan={4}>Sr. No</th>
                   <th className="border-[1.5px] border-black w-28 text-sm font-bold bg-slate-50">Teacher Name</th>
                   {teachers.slice(0, periodCount).map((t, i) => (
                     <th key={i} className="border-[1.5px] border-black text-[10px] p-1 font-bold leading-tight" colSpan={2}>
                        {t || ""}
                     </th>
                   ))}
                 </tr>
                 <tr className="h-10">
                   <th className="border-[1.5px] border-black text-sm font-bold bg-slate-50">Subject / Book</th>
                   {books.slice(0, periodCount).map((b, i) => (
                     <th key={i} className="border-[1.5px] border-black text-[9px] p-1 font-bold bg-slate-50 leading-tight" colSpan={2}>
                        {b || ""}
                     </th>
                   ))}
                 </tr>
                 <tr className="h-6">
                   <th className="border-[1.5px] border-black text-[10px] font-bold">In / Out</th>
                   {periods.slice(0, periodCount).map((_, i) => (
                     <React.Fragment key={i}>
                       <th className="border-[1.5px] border-black text-[8px] w-6">In</th>
                       <th className="border-[1.5px] border-black text-[8px] w-6">Out</th>
                     </React.Fragment>
                   ))}
                 </tr>
                 <tr className="h-6 bg-slate-50">
                   <th className="border-[1.5px] border-black text-[10px] font-bold">Student Name</th>
                   {periods.slice(0, periodCount).map((p, i) => (
                     <React.Fragment key={i}>
                       <th className="border-[1.5px] border-black text-[8px]">{p.start}</th>
                       <th className="border-[1.5px] border-black text-[8px]">{p.end}</th>
                     </React.Fragment>
                   ))}
                 </tr>
               </thead>
               <tbody>
                 {students.map((student, idx) => (
                   <tr 
                     key={student.id || idx} 
                     draggable={isReordering}
                     onDragStart={(e) => {
                       if (!isReordering) return;
                       e.dataTransfer.setData('text/plain', idx.toString());
                       e.currentTarget.classList.add('bg-amber-50', 'opacity-50');
                     }}
                     onDragEnd={(e) => {
                       e.currentTarget.classList.remove('bg-amber-50', 'opacity-50');
                     }}
                     onDragOver={(e) => {
                       if (!isReordering) return;
                       e.preventDefault();
                     }}
                     onDrop={(e) => {
                       if (!isReordering) return;
                       e.preventDefault();
                       const dragIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
                       if (isNaN(dragIdx) || dragIdx === idx) return;
                       
                       const sourceStudent = students[dragIdx];
                       const destStudent = student;
                       if (!sourceStudent || !destStudent) return;
                       
                       try {
                         const saved = localStorage.getItem('students');
                         if (saved) {
                           const allStudents = JSON.parse(saved);
                           if (Array.isArray(allStudents)) {
                             const actualDragIdx = allStudents.findIndex((item: any) => item.id === sourceStudent.id);
                             const actualDropIdx = allStudents.findIndex((item: any) => item.id === destStudent.id);
                             
                             if (actualDragIdx >= 0 && actualDropIdx >= 0) {
                               const updatedGlobal = [...allStudents];
                               const temp = updatedGlobal[actualDragIdx];
                               updatedGlobal.splice(actualDragIdx, 1);
                               updatedGlobal.splice(actualDropIdx, 0, temp);
                               
                               localStorage.setItem('students', JSON.stringify(updatedGlobal));
                               
                               const updatedLocal = [...students];
                               const tempLocal = updatedLocal[dragIdx];
                               updatedLocal.splice(dragIdx, 1);
                               updatedLocal.splice(idx, 0, tempLocal);
                               setStudents(updatedLocal);
                             }
                           }
                         }
                       } catch(err) {
                         console.error('Save reordered students error:', err);
                       }
                     }}
                     className={`h-8 transition-colors ${isReordering ? 'cursor-grab active:cursor-grabbing select-none bg-amber-50/20' : 'hover:bg-slate-50'}`}
                   >
                     <td className="border-[1.5px] border-black text-center text-xs font-bold">
                       <div className="flex items-center justify-center gap-1 select-none">
                         {isReordering && <GripVertical size={12} className="text-slate-400 shrink-0" />}
                         <span>{idx + 1}</span>
                       </div>
                     </td>
                     <td className="border-[1.5px] border-black pl-2 text-left text-xs font-bold truncate max-w-[100px]">
                       {student?.name || ""}
                     </td>
                     {Array.from({ length: 2 * periodCount }).map((_, i) => (
                       <td key={i} className="border-[1.5px] border-black"></td>
                     ))}
                   </tr>
                 ))}
                 {students.length < 15 && Array.from({ length: 15 - students.length }).map((_, i) => {
                   const padIdx = students.length + i;
                   return (
                     <tr key={`empty-${padIdx}`} className="h-8">
                       <td className="border-[1.5px] border-black text-center text-xs font-bold">{padIdx + 1}</td>
                       <td className="border-[1.5px] border-black"></td>
                       {Array.from({ length: 2 * periodCount }).map((_, i2) => (
                         <td key={i2} className="border-[1.5px] border-black"></td>
                       ))}
                     </tr>
                   );
                 })}
               </tbody>
             </table>
          </div>

          <div className="hidden print:flex justify-between items-center mt-6 text-[10px] font-bold px-4">
             <span>Date: ________________</span>
             <div className="flex gap-16">
                <span>Teacher Signature</span>
                <span>Academic Incharge</span>
                <span>Principal Signature</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Users = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);
