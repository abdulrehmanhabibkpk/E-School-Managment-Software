
import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Printer, Download, Search, Trash2, Pencil, Save, ArrowUpDown, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import { syncToServer } from '../syncService';

interface ConsolidatedResultProps {
  onBack: () => void;
}

const ConsolidatedResult: React.FC<ConsolidatedResultProps> = ({ onBack }) => {
  const [classes, setClasses] = useState<string[]>([]);
  const [examTypes, setExamTypes] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [ledgerRecords, setLedgerRecords] = useState<any[]>([]);
  const [editableRecords, setEditableRecords] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [systemSettings, setSystemSettings] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [editingRollNo, setEditingRollNo] = useState<string | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({ rollNo: '', name: '', fatherName: '', marks: {} });
  const [isReordering, setIsReordering] = useState(false);

  const moveRow = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= editableRecords.length) return;
    const updated = [...editableRecords];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setEditableRecords(updated);
  };

  const sortByRollNo = () => {
    const sorted = [...editableRecords].sort((a, b) => {
      const rA = parseInt(String(a.rollNo).replace(/\D/g, ''), 10) || 0;
      const rB = parseInt(String(b.rollNo).replace(/\D/g, ''), 10) || 0;
      return rA - rB;
    });
    setEditableRecords(sorted);
  };

  const sortByTotalMarks = () => {
    const sorted = [...editableRecords].sort((a, b) => {
      const mA = typeof a.totalObtained === 'number' ? a.totalObtained : -1;
      const mB = typeof b.totalObtained === 'number' ? b.totalObtained : -1;
      return mB - mA;
    });
    setEditableRecords(sorted);
  };

  const sortByName = () => {
    const sorted = [...editableRecords].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ur'));
    setEditableRecords(sorted);
  };

  const handleAddStudent = () => {
    if (!newStudent.rollNo || !newStudent.name) return;
    const student = {
      ...newStudent,
      marks: subjects.reduce((acc: any, sub: string) => ({...acc, [sub]: '---'}), {}),
      totalObtained: '---',
      status: '---',
      percentage: '---'
    };
    setEditableRecords([...editableRecords, student]);
    setNewStudent({ rollNo: '', name: '', fatherName: '', marks: {} });
    setIsAddingStudent(false);
  };

  useEffect(() => {
    // Load system settings (e.g. monogram)
    const savedSystem = JSON.parse(localStorage.getItem('system_settings') || '{}');
    setSystemSettings(savedSystem);

    let loadedClasses: string[] = [];
    // Load classes
    try {
      const savedGradesList = JSON.parse(localStorage.getItem('grades_list') || '[]');
      const savedGrades = JSON.parse(localStorage.getItem('grades') || '[]');
      const combined = [...savedGradesList, ...savedGrades];
      const gradeNames = Array.from(new Set(combined.map((g: any) => typeof g === 'string' ? g : (g?.name || '')).filter(Boolean)));
      if (gradeNames.length > 0) {
        loadedClasses = gradeNames;
      } else {
        loadedClasses = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];
      }
    } catch (e) {
      loadedClasses = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];
    }
    setClasses(loadedClasses);
    if (loadedClasses.length > 0) {
      setSelectedClass(loadedClasses[0]);
    }

    // Load exam types from Settings + custom records
    const savedExams = JSON.parse(localStorage.getItem('exams') || '[]');
    const defaultExams = savedExams.length > 0 ? savedExams : ['Annual Exam', 'Midterm Exam', 'Quarterly Exam'];
    const savedHeaders = JSON.parse(localStorage.getItem('examRecords') || '[]');
    const headerTitles = savedHeaders.map((h: any) => h.title || h.name).filter(Boolean);
    const combinedExams = Array.from(new Set([...defaultExams, ...headerTitles]));
    setExamTypes(combinedExams);
    if (combinedExams.length > 0) {
      setSelectedExamType(combinedExams[0]);
    }
  }, []);

  useEffect(() => {
    if (!selectedClass || !selectedExamType) {
      setStudents([]);
      setLedgerRecords([]);
      setEditableRecords([]);
      setSubjects([]);
      return;
    }

    // 1. Get subjects (books) for this class
    const allBooks = JSON.parse(localStorage.getItem('books_list') || '[]');
    const classBooks = allBooks.filter((b: any) => (b.grade || b.darja || b.class || '').toString().trim() === selectedClass.trim()).map((b: any) => b.name);
    
    // Default subjects if none are registered for the class
    const finalSubjects = classBooks.length > 0 ? classBooks : ['English', 'Mathematics', 'Science', 'Computer', 'General Knowledge'];
    setSubjects(finalSubjects);

    // 2. Load all students belonging to selected class
    const savedStudents = JSON.parse(localStorage.getItem('students') || localStorage.getItem('students_list') || '[]');
    const classStudents = savedStudents.filter((s: any) => {
      const g = (s.grade || s.darja || s.class || '').toString().trim();
      return g === selectedClass.trim();
    });
    setStudents(classStudents);

    // 3. Load results and merge them
    const allResults = JSON.parse(localStorage.getItem('all_exam_results') || '[]');
    const matchingExam = allResults.find((exam: any) => 
      (exam.className || '').toString().trim() === selectedClass.trim() && 
      (exam.examType || '').toString().trim() === selectedExamType.trim()
    );
    
    let examRecordsArray: any[] = [];
    if (matchingExam) {
      try {
        if (typeof matchingExam.records === 'string') {
          examRecordsArray = JSON.parse(matchingExam.records);
        } else if (Array.isArray(matchingExam.records)) {
          examRecordsArray = matchingExam.records;
        }
      } catch(e) { console.error(e); }
    }

    // Merge students from class database and exam records
    const studentMap = new Map<string, any>();

    classStudents.forEach((student: any) => {
      const key = String(student.rollNo || student.id || student.name).trim();
      studentMap.set(key, {
        rollNo: student.rollNo || '---',
        name: student.name,
        fatherName: student.fatherName || '---',
        studentObj: student
      });
    });

    if (Array.isArray(examRecordsArray)) {
      examRecordsArray.forEach((exRec: any) => {
        const key = String(exRec.rollNo || exRec.name).trim();
        if (!studentMap.has(key)) {
          studentMap.set(key, {
            rollNo: exRec.rollNo || '---',
            name: exRec.name || exRec.studentName || 'Student',
            fatherName: exRec.fatherName || '---',
            studentObj: null
          });
        }
      });
    }

    const allStudentsList = Array.from(studentMap.values());

    // Load Grade Settings
    const savedGradeSettings = JSON.parse(localStorage.getItem('gradeSettings') || '[]');

    const records = allStudentsList.map((stItem: any) => {
      const student = stItem.studentObj;
      let studentResultsArray: any[] = [];
      if (student) {
        try {
          if (typeof student.examResults === 'string') {
            studentResultsArray = JSON.parse(student.examResults);
          } else if (Array.isArray(student.examResults)) {
            studentResultsArray = student.examResults;
          }
        } catch(e) { console.error(e); }
      }

      const studentResult = studentResultsArray.find((r: any) => r.examType === selectedExamType);
      const globalRecord = examRecordsArray.find((r: any) => String(r.rollNo) === String(stItem.rollNo));
      const result = studentResult || globalRecord;

      const marks: any = {};
      finalSubjects.forEach((sub: string) => {
        const m = result?.marks?.[sub];
        marks[sub] = m !== undefined && m !== null ? m : '---';
      });

      let totalObtained = 0;
      let hasMarks = false;
      let isFail = false;

      finalSubjects.forEach((sub: string) => {
        const m = marks[sub];
        const numM = typeof m === 'number' ? m : parseFloat(m);
        if (!isNaN(numM) && typeof m !== 'boolean') {
          totalObtained += numM;
          hasMarks = true;
          if (numM < 33) isFail = true;
        }
      });

      if (!hasMarks && result?.totalObtained !== undefined && result?.totalObtained !== '---') {
        const parsedTotal = parseFloat(result.totalObtained);
        if (!isNaN(parsedTotal)) {
          totalObtained = parsedTotal;
          hasMarks = true;
        }
      }

      const maxPossible = finalSubjects.length * 100;
      const percentage = hasMarks ? parseFloat(((totalObtained / maxPossible) * 100).toFixed(2)) : 0;
      
      let status = '---';
      if (result?.status && result.status !== '---') {
        status = result.status;
      } else if (hasMarks) {
        if (percentage < 33) {
          status = 'Fail';
        } else if (isFail) {
          status = 'Compartment';
        } else {
          if (savedGradeSettings.length > 0) {
            const sorted = [...savedGradeSettings].sort((a: any, b: any) => b.minPercentage - a.minPercentage);
            const matched = sorted.find((s: any) => percentage >= s.minPercentage);
            status = matched ? (matched.grade || matched.quality) : 'Pass';
          } else {
            status = 'Pass';
          }
        }
      }

      return {
        rollNo: stItem.rollNo,
        name: stItem.name,
        fatherName: stItem.fatherName,
        marks,
        totalObtained: hasMarks ? totalObtained : '---',
        percentage: hasMarks ? `${percentage}%` : '---',
        status
      };
    });

    setLedgerRecords(records);
    setEditableRecords(records);
  }, [selectedClass, selectedExamType]);

  const filteredRecords = editableRecords.filter((rec: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return rec.name.toLowerCase().includes(query) || 
           rec.rollNo.toString().toLowerCase().includes(query);
  });

  const totalMaxMarks = subjects.length * 100;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-6 print:p-0 print:bg-white" dir="ltr">
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 5mm;
          }
          body, html, #root {
            background: white !important;
            color: black !important;
            overflow: visible !important;
            height: auto !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Dedicated Print Only View - Clean A4 Landscape */}
      <div className="hidden print:block w-full text-black font-sans p-2 bg-white" dir="ltr">
        <div className="w-full border-2 border-black p-4 bg-white text-black">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="w-16 h-16 rounded-full border border-black flex items-center justify-center p-1 bg-white">
              {systemSettings.monogram ? (
                <img src={systemSettings.monogram} alt="Seal" className="w-full h-full object-contain grayscale" />
              ) : (
                <div className="text-[10px] font-bold text-center">Seal</div>
              )}
            </div>

            <div className="flex-1 text-center">
              <h1 className="text-xl font-bold text-black font-sans">
                {systemSettings.jamiaName || 'Academic Institute & Educational System'}
              </h1>
              <h2 className="text-sm font-bold font-sans mt-1 text-black">
                Examination Result Ledger Sheet
              </h2>
              <div className="text-xs font-bold mt-1 text-black">
                Class: <span className="underline mr-4">{selectedClass || '---'}</span>
                Exam: <span className="underline mr-4">{selectedExamType || '---'}</span>
                Total Students: <span className="underline">{filteredRecords.length}</span>
              </div>
            </div>

            <div className="w-16"></div>
          </div>

          {/* Table */}
          <table className="w-full text-center border-collapse border-2 border-black text-[10px] font-bold font-sans">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-black">
                <th className="border border-black py-1 px-1 w-8">#</th>
                <th className="border border-black py-1 px-1 w-16">Roll No</th>
                <th className="border border-black py-1 px-2 text-left min-w-[120px]">Student Name</th>
                {subjects.map((sub: string) => (
                  <th key={sub} className="border border-black py-1 px-1 text-[9px]">
                    {sub}
                  </th>
                ))}
                <th className="border border-black py-1 px-1 w-20">Total</th>
                <th className="border border-black py-1 px-1 w-16">Status</th>
                <th className="border border-black py-1 px-1 w-16">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={subjects.length + 6} className="border border-black p-6 text-center text-gray-500">
                    No records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((row: any, idx: number) => (
                  <tr key={row.rollNo || idx} className="border-b border-black">
                    <td className="border border-black py-1 font-mono">{idx + 1}</td>
                    <td className="border border-black py-1 font-mono font-bold">{row.rollNo}</td>
                    <td className="border border-black py-1 px-2 text-left font-bold">{row.name}</td>
                    {subjects.map((sub: string) => (
                      <td key={sub} className="border border-black py-1 font-mono">
                        {row.marks?.[sub] !== undefined ? row.marks[sub] : '---'}
                      </td>
                    ))}
                    <td className="border border-black py-1 font-mono font-bold">{row.totalObtained} / {totalMaxMarks}</td>
                    <td className="border border-black py-1 font-bold">{row.status}</td>
                    <td className="border border-black py-1 font-mono font-bold">{row.percentage}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Signatures */}
          <div className="flex justify-between items-end mt-8 px-6 font-bold text-xs font-sans text-black">
            <div className="flex flex-col items-center">
              <div className="w-36 border-b border-black"></div>
              <span className="pt-1">Center Director</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-36 border-b border-black"></div>
              <span className="pt-1">Controller of Exams</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Screen View */}
      <div className="print:hidden">
        {/* Back & Control Header */}
        <div className="max-w-7xl mx-auto bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8 no-print">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={onBack}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 p-2.5 rounded-xl transition-all shadow-sm flex flex-col items-center justify-center gap-0"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-[8px] font-normal opacity-70">Back</span>
              </button>
              <div>
                <h2 className="text-xl font-bold text-slate-800 font-sans">Consolidated Result (Grand Tabulation Sheet)</h2>
                <span className="text-[10px] font-normal text-slate-400 uppercase tracking-widest leading-none">Automated Grand Ledger & Result Portal</span>
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              {selectedClass && selectedExamType && ledgerRecords.length > 0 && (
                <button 
                  onClick={() => setIsAddingStudent(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg text-sm font-sans w-full md:w-auto flex items-center justify-center gap-2"
                >
                  <span>+ Add New Student</span>
                </button>
              )}
              {selectedClass && selectedExamType && ledgerRecords.length > 0 && (
                <button 
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 text-sm font-sans w-full md:w-auto"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Ledger (Landscape A4)</span>
                </button>
              )}
            </div>
          </div>

          {/* Roster & Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-slate-200">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-sans text-slate-400 font-bold flex items-center gap-1 uppercase tracking-widest px-1">
                Select Class / Grade
              </label>
              <div className="flex flex-wrap gap-2">
                {classes.map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedClass(c)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      selectedClass === c 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-sans text-emerald-600 font-bold flex items-center gap-1 uppercase tracking-widest px-1">
                Exam Type
              </label>
              <select 
                value={selectedExamType} 
                onChange={(e) => setSelectedExamType(e.target.value)}
                className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 transition-all text-slate-800 font-sans w-full shadow-sm"
              >
                <option value="">-- Select Exam --</option>
                {examTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-sans text-amber-600 font-bold flex items-center gap-1 uppercase tracking-widest px-1">
                Search
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search by student name or roll no..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-10 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 text-slate-800 font-sans shadow-sm"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>
          </div>

          {selectedClass && selectedExamType && editableRecords.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-200 no-print">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-600 font-sans">Reorder & Sort:</span>
                <button
                  onClick={() => setIsReordering(!isReordering)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border font-sans ${
                    isReordering
                      ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                      : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <ArrowUpDown size={14} />
                  {isReordering ? 'Lock Order' : 'Enable Reorder Mode'}
                </button>

                <button
                  onClick={sortByRollNo}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 font-sans"
                >
                  Sort by Roll No
                </button>

                <button
                  onClick={sortByTotalMarks}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 font-sans"
                >
                  Sort by Marks
                </button>

                <button
                  onClick={sortByName}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 font-sans"
                >
                  Sort by Name
                </button>
              </div>

              {isReordering && (
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 font-sans">
                  💡 Drag & drop or use arrow buttons to adjust order.
                </span>
              )}
            </div>
          )}
        </div>

        {isAddingStudent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-3xl shadow-xl w-full max-w-sm">
              <h3 className="text-lg font-bold mb-4">Add New Student</h3>
              <input type="text" placeholder="Roll No" value={newStudent.rollNo} onChange={e => setNewStudent({...newStudent, rollNo: e.target.value})} className="w-full p-2 border rounded-lg mb-2 text-sm" />
              <input type="text" placeholder="Student Name" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} className="w-full p-2 border rounded-lg mb-2 text-sm" />
              <input type="text" placeholder="Father Name" value={newStudent.fatherName} onChange={e => setNewStudent({...newStudent, fatherName: e.target.value})} className="w-full p-2 border rounded-lg mb-4 text-sm" />
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsAddingStudent(false)} className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-bold">Cancel</button>
                <button onClick={handleAddStudent} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold">Add Student</button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          {!selectedClass || !selectedExamType ? (
            <div className="text-center py-16 text-slate-500 font-sans max-w-md mx-auto">
              <div className="text-5xl mb-4">📊</div>
              <h4 className="font-bold text-base text-slate-800 mb-2">Select Class & Exam Type</h4>
              <p className="text-xs text-slate-500">Choose a class and exam type above to view and print the consolidated result ledger.</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-16 text-slate-500 font-sans">
              <p>No records found matching selected filters.</p>
            </div>
          ) : (
            <div className="h-[60vh] overflow-y-auto overflow-x-auto min-w-[1000px] bg-white text-black p-8 rounded-xl shadow-lg border border-slate-200">
              <div className="text-center mb-6">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Screen Preview Mode</span>
                <div className="border-b border-dashed border-slate-300 my-2" />
              </div>

              {/* Simulated Landscape A4 Ledger View */}
              <div className="w-full border-[3px] border-black p-6 relative bg-white text-black" dir="ltr">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="w-20 h-20 rounded-full border-2 border-black flex items-center justify-center p-1 bg-white relative">
                    {systemSettings.monogram ? (
                      <img src={systemSettings.monogram} alt="Seal" className="w-full h-full object-contain grayscale" />
                    ) : (
                      <div className="text-[10px] font-bold text-center">Institute Seal</div>
                    )}
                  </div>

                  <div className="flex-1 text-center">
                    <h1 className="text-2xl font-bold text-black font-sans">
                      {systemSettings.jamiaName || 'Academic Institute & Educational System'}
                    </h1>
                    <h2 className="text-base font-bold font-sans mt-1 text-slate-800 flex flex-col items-center">
                      <span>Examination Result Ledger Sheet</span>
                    </h2>
                    <div className="text-xs font-bold mt-2 text-slate-600">
                      Class: <span className="underline mr-4">{selectedClass}</span>
                      Exam: <span className="underline">{selectedExamType}</span>
                    </div>
                  </div>

                  <div className="w-20"></div>
                </div>

                {/* Table Ledger Sheet Grid */}
                <table className="w-full text-center border-collapse border-2 border-black text-[11px] font-bold font-sans">
                  <thead>
                    <tr className="bg-slate-100 border-b-2 border-black">
                      <th className="border-2 border-black py-2 px-1 w-10 text-center font-bold">#</th>
                      <th className="border-2 border-black py-2 px-1 w-20 text-center font-bold">Roll No</th>
                      <th className="border-2 border-black py-2 px-3 text-left font-bold min-w-[150px]">Student Name</th>
                      {subjects.map((sub: string) => (
                        <th key={sub} className="border-2 border-black py-2 px-1 text-center font-bold text-[10px] min-w-[70px]">
                          {sub}
                        </th>
                      ))}
                      <th className="border-2 border-black py-2 px-1 w-24 text-center font-bold">Total Marks</th>
                      <th className="border-2 border-black py-2 px-1 w-24 text-center font-bold">Result</th>
                      <th className="border-2 border-black py-2 px-1 w-20 text-center font-bold">Percentage</th>
                      <th className="border-2 border-black py-2 px-1 w-16 text-center font-bold no-print">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((row: any, idx: number) => {
                      const realIdx = editableRecords.findIndex(r => r === row || (r.rollNo === row.rollNo && r.name === row.name));
                      const currentIdx = realIdx !== -1 ? realIdx : idx;

                      return (
                        <tr 
                          key={row.rollNo || idx} 
                          draggable={isReordering}
                          onDragStart={(e) => {
                            if (!isReordering) return;
                            e.dataTransfer.setData('text/plain', currentIdx.toString());
                          }}
                          onDragOver={(e) => {
                            if (!isReordering) return;
                            e.preventDefault();
                          }}
                          onDrop={(e) => {
                            if (!isReordering) return;
                            e.preventDefault();
                            const dragIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
                            if (isNaN(dragIdx) || dragIdx === currentIdx) return;
                            const updated = [...editableRecords];
                            const temp = updated[dragIdx];
                            updated.splice(dragIdx, 1);
                            updated.splice(currentIdx, 0, temp);
                            setEditableRecords(updated);
                          }}
                          className={`border-b border-black hover:bg-slate-50 transition-colors ${
                            isReordering ? 'bg-amber-50/30 cursor-grab active:cursor-grabbing select-none' : ''
                          }`}
                        >
                          <td className="border-2 border-black py-2 text-center font-mono font-normal">
                            <div className="flex items-center justify-center gap-1">
                              {isReordering && <GripVertical size={12} className="text-amber-600 no-print" />}
                              <span>{idx + 1}</span>
                            </div>
                          </td>
                          <td className="border-2 border-black py-2 text-center font-mono font-bold">{row.rollNo}</td>
                          <td className="border-2 border-black py-2 px-3 text-left font-bold">{row.name}</td>
                          {subjects.map((sub: string) => (
                            <td key={sub} className="border-2 border-black py-2 text-center font-mono font-normal">
                              {row.marks[sub]}
                            </td>
                          ))}
                          {editingRollNo === row.rollNo ? (
                            <>
                              <td className="border-2 border-black py-2 text-center text-xs font-bold">
                                <input type="text" value={row.totalObtained} onChange={(e) => setEditableRecords(prev => prev.map(r => r.rollNo === row.rollNo ? {...r, totalObtained: e.target.value} : r))} className="w-16 text-center border-b border-blue-400" />
                              </td>
                              <td className="border-2 border-black py-2 text-center text-xs font-bold">
                                <input type="text" value={row.status} onChange={(e) => setEditableRecords(prev => prev.map(r => r.rollNo === row.rollNo ? {...r, status: e.target.value} : r))} className="w-16 text-center border-b border-blue-400" />
                              </td>
                              <td className="border-2 border-black py-2 text-center text-xs font-bold">
                                <input type="text" value={row.percentage} onChange={(e) => setEditableRecords(prev => prev.map(r => r.rollNo === row.rollNo ? {...r, percentage: e.target.value} : r))} className="w-12 text-center border-b border-blue-400" />
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="border-2 border-black py-2 text-center font-mono font-bold bg-slate-50">{row.totalObtained} / {totalMaxMarks}</td>
                              <td className="border-2 border-black py-2 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  row.status === 'Pass' ? 'text-emerald-700' :
                                  row.status === 'Compartment' ? 'text-orange-700' :
                                  row.status === 'Fail' ? 'text-red-700' : 'text-slate-700'
                                }`}>
                                  {row.status}
                                </span>
                              </td>
                              <td className="border-2 border-black py-2 text-center font-mono font-bold bg-slate-50">{row.percentage}</td>
                            </>
                          )}
                          
                          <td className="border-2 border-black py-2 text-center no-print">
                            <div className="flex justify-center items-center gap-1.5">
                              {isReordering && (
                                <div className="flex items-center gap-0.5 border-r pr-1 border-slate-300">
                                  <button 
                                    onClick={() => moveRow(currentIdx, 'up')} 
                                    disabled={currentIdx === 0}
                                    className="p-1 text-slate-600 hover:text-black hover:bg-slate-200 rounded disabled:opacity-20 disabled:hover:bg-transparent"
                                    title="Move Up"
                                  >
                                    <ArrowUp size={13} />
                                  </button>
                                  <button 
                                    onClick={() => moveRow(currentIdx, 'down')} 
                                    disabled={currentIdx === editableRecords.length - 1}
                                    className="p-1 text-slate-600 hover:text-black hover:bg-slate-200 rounded disabled:opacity-20 disabled:hover:bg-transparent"
                                    title="Move Down"
                                  >
                                    <ArrowDown size={13} />
                                  </button>
                                </div>
                              )}
                              <button onClick={() => setEditingRollNo(editingRollNo === row.rollNo ? null : row.rollNo)} className={editingRollNo === row.rollNo ? "text-emerald-500 hover:text-emerald-800" : "text-blue-500 hover:text-blue-800"} title="Edit">
                                {editingRollNo === row.rollNo ? <Save size={14} /> : <Pencil size={14} />}
                              </button>
                              <button onClick={() => setEditableRecords(editableRecords.filter(r => r.rollNo !== row.rollNo))} className="text-red-500 hover:text-red-800" title="Delete">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Bottom Signatures */}
                <div className="flex justify-between items-end mt-12 px-6 font-bold text-xs font-sans text-black">
                  <div className="flex flex-col items-center">
                    <div className="w-40 border-b border-black"></div>
                    <span className="pt-2">Center Director</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-40 border-b border-black"></div>
                    <span className="pt-2">Controller of Exams</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsolidatedResult;
