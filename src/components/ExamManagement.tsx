import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Plus, Pencil, Trash2, FileText, Settings, Download, Upload, Printer, X, Globe, GripVertical, GraduationCap, ArrowLeft, Search, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { exportToExcel, importFromExcel } from '../excelUtils';
import { motion, AnimatePresence } from 'motion/react';
import { syncToServer } from '../syncService';
import { generateNumericId } from '../lib/idUtils';
import { addToRecycleBin } from './RecycleBin';

interface ExamManagementProps {
  onBack: () => void;
}

const ExamManagement: React.FC<ExamManagementProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'results' | 'types' | 'reports' | 'settings' | 'scheduling' | 'timetable'>('results');
  const [settingsTab, setSettingsTab] = useState<'grade' | 'position'>('grade');
  const [classes, setClasses] = useState<string[]>([]);
  const [examTypes, setExamTypes] = useState<string[]>([]);
  const [examHeaders, setExamHeaders] = useState<any[]>([]);
  const [showSheet, setShowSheet] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  
  // Scheduling States
  const [examSchedules, setExamSchedules] = useState<any[]>([]);
  const [newSchedule, setNewSchedule] = useState({
    examType: '',
    className: '',
    startDate: '',
    endDate: '',
    subjects: [] as { name: string, date: string, time: string }[]
  });

  const allBooks = JSON.parse(localStorage.getItem('books_list') || '[]');
  const setupMapping = JSON.parse(localStorage.getItem('exam_book_setup') || '{}');
  const classSetup = setupMapping[selectedClass];
  const hasConfigForThisClass = classSetup && Object.values(classSetup).some((arr: any) => Array.isArray(arr) && arr.length > 0);

  const gradeBooks = selectedClass ? allBooks.filter((b: any) => {
    const bClass = String(b.grade || b.class || '').trim();
    const selClass = String(selectedClass).trim();
    const matchesClass = bClass === selClass || bClass.includes(selClass) || selClass.includes(bClass);
    if (!matchesClass) return false;

    if (selectedExamType && hasConfigForThisClass) {
      const bookMapping = classSetup[b.name];
      return Array.isArray(bookMapping) && bookMapping.includes(selectedExamType);
    }
    return true;
  }).map((b: any) => b.name) : [];
  
  const subjects = gradeBooks.length > 0 ? gradeBooks : ['No subjects found'];

  const [resultRows, setResultRows] = useState<any[]>([]);
  const [gradeSettings, setGradeSettings] = useState<any[]>([]);
  const [newGrade, setNewGrade] = useState({ name: '', min: '', max: '', grace: '', isFail: false });
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [reportSearch, setReportSearch] = useState('');
  const [selectedReportClass, setSelectedReportClass] = useState('');
  const [selectedReportExamType, setSelectedReportExamType] = useState('');
  const [systemSettings, setSystemSettings] = useState<any>({});

  const [isReordering, setIsReordering] = useState(false);
  const [selectedSection, setSelectedSection] = useState('');

  const loadData = () => {
    const savedSystem = JSON.parse(localStorage.getItem('system_settings') || '{}');
    setSystemSettings(savedSystem);

    try {
      const savedGradesList = JSON.parse(localStorage.getItem('grades_list') || '[]');
      const savedGrades = JSON.parse(localStorage.getItem('grades') || '[]');
      const combined = [...savedGradesList, ...savedGrades];
      const gradeNames = Array.from(new Set(combined.map((g: any) => typeof g === 'string' ? g : (g?.name || '')).filter(Boolean)));
      if (gradeNames.length > 0) {
        setClasses(gradeNames);
      } else {
        setClasses(['Grade 1', 'Grade 2', 'Grade 3']);
      }
    } catch (e) {
      setClasses(['Grade 1', 'Grade 2', 'Grade 3']);
    }

    let finalHeaders: any[] = [];
    const savedHeaders = JSON.parse(localStorage.getItem('examRecords') || '[]');
    if (savedHeaders.length > 0) {
      finalHeaders = savedHeaders;
      setExamHeaders(savedHeaders);
    } else {
      finalHeaders = [
        { id: 1, title: 'Mid-Term Exam', date: '2024-03-15' },
        { id: 2, title: 'Final Exam', date: '2024-06-20' }
      ];
      setExamHeaders(finalHeaders);
    }

    const savedExams = JSON.parse(localStorage.getItem('exams') || '[]');
    const defaultExams = savedExams.length > 0 ? savedExams : ['Annual', 'Mid-Term', 'Monthly Test'];
    const headerTitles = finalHeaders.map((h: any) => h.title);
    const combinedExams = Array.from(new Set([...defaultExams, ...headerTitles]));
    setExamTypes(combinedExams);

    const savedGradeSettings = JSON.parse(localStorage.getItem('grade_settings') || '[]');
    setGradeSettings(savedGradeSettings);

    const savedSchedules = JSON.parse(localStorage.getItem('exam_schedules') || '[]');
    setExamSchedules(savedSchedules);
  };

  React.useEffect(() => {
    loadData();
    window.addEventListener('storage_updated', loadData);
    return () => window.removeEventListener('storage_updated', loadData);
  }, []);

  const handleAddGradeSetting = () => {
    if (!newGrade.name || !newGrade.min || !newGrade.max) return;
    const updated = [...gradeSettings, { ...newGrade, id: generateNumericId() }];
    setGradeSettings(updated);
    localStorage.setItem('grade_settings', JSON.stringify(updated));
    setNewGrade({ name: '', min: '', max: '', grace: '', isFail: false });
    syncToServer();
  };

  const handleDeleteGradeSetting = (id: number) => {
    const gradeSetting = gradeSettings.find(g => g.id === id);
    if (gradeSetting) addToRecycleBin('exams', gradeSetting, 'name');
    const updated = gradeSettings.filter(g => g.id !== id);
    setGradeSettings(updated);
    localStorage.setItem('grade_settings', JSON.stringify(updated));
    syncToServer();
  };

  const handleCreateSheet = () => {
    if (!selectedClass || !selectedExamType) {
      alert('Please select Class and Exam Type.');
      return;
    }

    const savedStudents = JSON.parse(localStorage.getItem('students') || localStorage.getItem('students_list') || '[]');
    const filteredStudents = savedStudents.filter((s: any) => {
      const sClass = String(s.grade || s.class || '').trim();
      const selClass = String(selectedClass).trim();
      const sSection = String(s.section || '').trim();
      const selSection = String(selectedSection).trim();
      
      const classMatch = sClass === selClass || sClass.includes(selClass) || selClass.includes(sClass);
      const sectionMatch = !selSection || sSection === selSection || sSection.includes(selSection) || selSection.includes(sSection);
      
      return classMatch && sectionMatch;
    });
    
    if (filteredStudents.length === 0) {
      alert('No students found in this class/section. Please enroll students first.');
      return;
    }

    const initialRows = filteredStudents.map((s: any, idx: number) => {
      const row: any = {
        id: idx + 1,
        studentName: s.name,
        fatherName: s.fatherName,
        rollNo: s.rollNo || s.id || (idx + 1).toString(),
        marks: {},
        obtained: 0,
        percentage: 0,
        quality: ''
      };
      subjects.forEach(sub => row.marks[sub] = 0);
      return row;
    });

    setResultRows(initialRows);
    setShowSheet(true);
    setIsReordering(false);
  };

  const updateMarks = (rowId: number, subject: string, val: number) => {
    const updated = resultRows.map(row => {
      if (row.id === rowId) {
        const newMarks = { ...row.marks, [subject]: val };
        const obtained = Object.values(newMarks).reduce((a: any, b: any) => a + (Number(b) || 0), 0) as number;
        const totalPossible = subjects.length * 100;
        const percentage = totalPossible > 0 ? (obtained / totalPossible) * 100 : 0;
        
        const savedGradeSettings = JSON.parse(localStorage.getItem('grade_settings') || '[]');
        let calculatedGrade = '';
        if (savedGradeSettings.length > 0) {
          const match = savedGradeSettings.find((g: any) => percentage >= parseFloat(g.min) && percentage <= parseFloat(g.max));
          calculatedGrade = match ? match.name : '';
        } else {
          if (percentage >= 85) calculatedGrade = 'A+';
          else if (percentage >= 75) calculatedGrade = 'A';
          else if (percentage >= 60) calculatedGrade = 'B';
          else if (percentage >= 40) calculatedGrade = 'C';
          else calculatedGrade = 'F';
        }
        
        return { 
          ...row, 
          marks: newMarks, 
          obtained, 
          percentage: parseFloat(percentage.toFixed(2)),
          quality: calculatedGrade
        };
      }
      return row;
    });
    setResultRows(updated);
  };

  const handleExportSheetExcel = () => {
    if (resultRows.length === 0) {
      alert('No data available to export.');
      return;
    }
    const formatted = resultRows.map(row => ({
      'Roll No': row.rollNo,
      'Student Name': row.studentName,
      'Obtained Marks': row.obtained,
      'Total Marks': subjects.length * 100,
      'Grade': row.quality
    }));
    exportToExcel(formatted, `Exam_Results_${selectedClass}_${selectedExamType}`);
  };

  const handleSaveResults = () => {
    if (resultRows.length === 0) return;
    const existing = JSON.parse(localStorage.getItem('all_exam_results') || '[]');
    const newRecord = {
      id: generateNumericId(),
      examType: selectedExamType,
      className: selectedClass,
      date: new Date().toLocaleDateString(),
      records: resultRows
    };
    const updated = [...existing, newRecord];
    localStorage.setItem('all_exam_results', JSON.stringify(updated));

    const allStudents = JSON.parse(localStorage.getItem('students') || '[]');
    const updatedStudents = allStudents.map((student: any) => {
      const matchingResult = resultRows.find((r: any) => String(r.rollNo) === String(student.rollNo));
      if (matchingResult) {
        const studentResults = student.examResults || [];
        const filteredResults = studentResults.filter((res: any) => res.examType !== selectedExamType);
        return {
          ...student,
          examResults: [
            ...filteredResults, 
            { 
              ...matchingResult, 
              examType: selectedExamType, 
              date: newRecord.date,
              className: selectedClass 
            }
          ]
        };
      }
      return student;
    });
    localStorage.setItem('students', JSON.stringify(updatedStudents));
    localStorage.setItem('students_list', JSON.stringify(updatedStudents));

    syncToServer();
    alert('Results saved successfully!');
    setShowSheet(false);
  };

  const ResultReport = ({ student, onClose }: { student: any, onClose: () => void }) => {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
        <div className="fixed top-6 right-6 flex gap-4 no-print z-[110]">
           <button onClick={() => window.print()} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 font-bold shadow-lg">
              <Printer size={20} />
              <span>Print</span>
           </button>
           <button onClick={onClose} className="bg-red-500 text-white p-3 rounded-xl hover:bg-red-600 transition-all flex items-center gap-2 font-bold shadow-lg">
              <X size={20} />
              <span>Close</span>
           </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white text-black shadow-2xl relative flex flex-col print:shadow-none p-12 border-8 border-double border-slate-200"
          style={{ width: '210mm', minHeight: '297mm' }}
        >
           <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-slate-200">
              <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 overflow-hidden">
                {systemSettings.monogram ? (
                  <img src={systemSettings.monogram} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <GraduationCap size={48} className="text-slate-300" />
                )}
              </div>
              <div className="flex-1 text-center px-4">
                 <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-1">{systemSettings.jamiaName || 'Modern School Academy'}</h1>
                 <div className="bg-slate-800 text-white px-6 py-1.5 rounded-full text-sm font-bold inline-block uppercase tracking-widest">Official Academic Transcript</div>
              </div>
              <div className="w-24"></div>
           </div>

           <div className="grid grid-cols-2 gap-y-4 gap-x-12 mb-10 text-sm">
              <InfoRow label="Student Name" value={student.studentName} />
              <InfoRow label="Roll Number" value={student.rollNo} />
              <InfoRow label="Father's Name" value={student.fatherName} />
              <InfoRow label="Registration" value={student.registrationNo || '----'} />
              <InfoRow label="Class / Grade" value={student.className} />
              <InfoRow label="Exam Type" value={student.examType} />
           </div>

           <table className="w-full text-center border-collapse border-2 border-slate-800 mb-10 text-sm">
              <thead className="bg-slate-100 uppercase tracking-wider">
                 <tr>
                    <th className="border-2 border-slate-800 py-3 px-4 text-left">Subject Description</th>
                    <th className="border-2 border-slate-800 py-3 w-32">Maximum Marks</th>
                    <th className="border-2 border-slate-800 py-3 w-32">Obtained Marks</th>
                 </tr>
              </thead>
              <tbody>
                 {Object.keys(student.marks || {}).map((sub) => (
                    <tr key={sub}>
                       <td className="border border-slate-800 py-3 px-4 text-left font-medium">{sub}</td>
                       <td className="border border-slate-800 py-3 font-mono">100</td>
                       <td className="border border-slate-800 py-3 font-mono font-bold">{student.marks?.[sub] || 0}</td>
                    </tr>
                 ))}
              </tbody>
              <tfoot className="bg-slate-50">
                 <tr className="border-2 border-slate-800">
                    <td className="border-2 border-slate-800 py-4 px-4 text-left font-black uppercase">Grand Total</td>
                    <td className="border-2 border-slate-800 py-4 font-mono font-black">{Object.keys(student.marks || {}).length * 100}</td>
                    <td className="border-2 border-slate-800 py-4 font-mono font-black text-xl text-blue-700">{student.obtained}</td>
                 </tr>
              </tfoot>
           </table>

           <div className="flex justify-between items-end mt-auto pt-12 pb-8">
              <div className="space-y-4">
                 <div className="flex gap-4 items-center">
                    <span className="text-slate-500 font-bold uppercase text-xs">Academic Grade:</span>
                    <span className="bg-blue-50 text-blue-700 px-6 py-1.5 rounded-lg border border-blue-100 font-black text-lg">{student.quality || 'N/A'}</span>
                 </div>
                 <div className="flex gap-4 items-center">
                    <span className="text-slate-500 font-bold uppercase text-xs">Aggregate Percentage:</span>
                    <span className="font-mono font-black text-lg">{student.percentage}%</span>
                 </div>
              </div>
              
              <div className="flex flex-col items-center">
                 <div className="w-48 h-px bg-slate-400 mb-2"></div>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Examination Controller</span>
              </div>
           </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50" dir="ltr">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex flex-col">
           <h2 className="text-xl font-bold text-slate-800">Exam Management</h2>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Academic Assessment Portal</span>
        </div>
        <div className="flex gap-2">
           <button onClick={onBack} className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-600 transition-all font-bold shadow-lg shadow-red-500/20">
             <ArrowLeft className="w-4 h-4" />
             <span>Back to Dashboard</span>
           </button>
           <button 
             onClick={() => showSheet ? handleExportSheetExcel() : exportToExcel(JSON.parse(localStorage.getItem('all_exam_results') || '[]'), 'all_exam_results')}
             className="bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-600 transition-all font-bold shadow-lg shadow-emerald-500/20"
           >
             <Download className="w-4 h-4" />
             <span>Export Data</span>
           </button>
        </div>
      </div>

      <div className="flex border-b border-slate-200 bg-white">
        {[
          { id: 'results', label: 'Create Results', icon: Plus },
          { id: 'reports', label: 'View Reports', icon: FileText },
          { id: 'scheduling', label: 'Exam Schedule', icon: Calendar },
          { id: 'settings', label: 'Grade Config', icon: Settings },
          { id: 'types', label: 'Exam Types', icon: Globe }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 font-bold text-sm transition-all border-b-2 ${activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-blue-50/30' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'results' ? (
            <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {!showSheet ? (
                <div className="max-w-xl mx-auto bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <div className="flex flex-col items-center mb-10 text-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                      <GraduationCap className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">Generate Assessment Sheet</h3>
                    <p className="text-slate-400 text-sm mt-1">Select parameters to create a new results entry sheet.</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Academic Class</label>
                      <select 
                        value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold"
                      >
                        <option value="">-- Select Class --</option>
                        {classes.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Examination Type</label>
                      <select 
                        value={selectedExamType} onChange={e => setSelectedExamType(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold"
                      >
                        <option value="">-- Select Exam --</option>
                        {examTypes.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>

                    <button 
                      onClick={handleCreateSheet}
                      className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Generate Result Sheet</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col min-h-[600px]">
                  <div className="bg-slate-900 p-6 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <button onClick={() => setShowSheet(false)} className="text-white/60 hover:text-white transition-colors">
                           <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                           <h3 className="text-white font-bold text-lg">{selectedExamType} - {selectedClass}</h3>
                           <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Results Entry Portal</p>
                        </div>
                     </div>
                     <div className="flex gap-3">
                        <button onClick={handleSaveResults} className="bg-emerald-500 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                           <CheckCircle2 size={18} />
                           <span>Save Results</span>
                        </button>
                     </div>
                  </div>

                  <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b">
                           <th className="px-6 py-4 w-16 text-center">#</th>
                           <th className="px-6 py-4 w-24 text-center">Roll No</th>
                           <th className="px-6 py-4 min-w-[200px]">Student Name</th>
                           {subjects.map(sub => <th key={sub} className="px-4 py-4 text-center min-w-[100px] border-l">{sub}</th>)}
                           <th className="px-6 py-4 text-center w-24 bg-blue-50 text-blue-600 border-l">Obtained</th>
                           <th className="px-6 py-4 text-center w-24 bg-blue-50 text-blue-600 border-l">%</th>
                           <th className="px-6 py-4 text-center w-24 bg-blue-50 text-blue-600 border-l">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {resultRows.map((row, idx) => (
                          <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                             <td className="px-6 py-4 text-center text-slate-300 font-mono text-xs">{idx + 1}</td>
                             <td className="px-6 py-4 text-center font-bold text-slate-700 font-mono">{row.rollNo}</td>
                             <td className="px-6 py-4">
                                <div className="font-bold text-slate-800">{row.studentName}</div>
                                <div className="text-[10px] text-slate-400">{row.fatherName}</div>
                             </td>
                             {subjects.map(sub => (
                               <td key={sub} className="px-4 py-2 border-l">
                                  <input 
                                    type="number" 
                                    value={row.marks[sub] || ''} 
                                    onChange={e => updateMarks(row.id, sub, parseInt(e.target.value) || 0)}
                                    className="w-full bg-transparent text-center font-mono font-bold outline-none focus:text-blue-600"
                                  />
                               </td>
                             ))}
                             <td className="px-6 py-4 text-center font-black text-blue-700 bg-blue-50/20 border-l">{row.obtained}</td>
                             <td className="px-6 py-4 text-center font-mono text-xs font-bold text-blue-500 bg-blue-50/20 border-l">{row.percentage}%</td>
                             <td className="px-6 py-4 text-center border-l bg-blue-50/20">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black ${row.quality === 'A+' || row.quality === 'A' ? 'bg-emerald-100 text-emerald-700' : row.quality === 'F' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {row.quality || '---'}
                                </span>
                             </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          ) : activeTab === 'reports' ? (
            <motion.div key="reports" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
               <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 mb-8 flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-1.5">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Class Filter</label>
                     <select 
                       value={selectedReportClass} onChange={e => setSelectedReportClass(e.target.value)}
                       className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                     >
                       <option value="">-- All Classes --</option>
                       {classes.map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                  </div>
                  <div className="flex-1 space-y-1.5">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Exam Type</label>
                     <select 
                       value={selectedReportExamType} onChange={e => setSelectedReportExamType(e.target.value)}
                       className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                     >
                       <option value="">-- All Exams --</option>
                       {examTypes.map(e => <option key={e} value={e}>{e}</option>)}
                     </select>
                  </div>
                  <div className="flex-[2] space-y-1.5">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Search Student</label>
                     <div className="relative">
                       <input 
                         type="text" 
                         value={reportSearch} onChange={e => setReportSearch(e.target.value)}
                         placeholder="Search by name or roll number..." 
                         className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold pl-12"
                       />
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                     </div>
                  </div>
               </div>

               <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest">
                           <th className="px-6 py-4 w-16 text-center">#</th>
                           <th className="px-6 py-4 w-32">Roll No</th>
                           <th className="px-6 py-4">Student Name</th>
                           <th className="px-6 py-4">Father Name</th>
                           <th className="px-6 py-4 text-center">Result Status</th>
                           <th className="px-6 py-4 text-center">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {(() => {
                           const students = JSON.parse(localStorage.getItem('students') || '[]');
                           const results = JSON.parse(localStorage.getItem('all_exam_results') || '[]');
                           
                           const filtered = students.filter((s: any) => {
                              const sClass = String(s.grade || s.class || '').trim();
                              const selClass = String(selectedReportClass).trim();
                              const matchesClass = !selectedReportClass || sClass === selClass || sClass.includes(selClass);
                              const matchesSearch = !reportSearch || s.name.toLowerCase().includes(reportSearch.toLowerCase()) || String(s.rollNo).includes(reportSearch);
                              return matchesClass && matchesSearch;
                           });

                           return filtered.map((student: any, idx: number) => {
                              const studentResult = (student.examResults || []).find((r: any) => !selectedReportExamType || r.examType === selectedReportExamType);
                              return (
                                 <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-center text-slate-300 font-mono text-xs">{idx + 1}</td>
                                    <td className="px-6 py-4 font-bold text-slate-700 font-mono">{student.rollNo}</td>
                                    <td className="px-6 py-4 font-bold text-slate-800">{student.name}</td>
                                    <td className="px-6 py-4 text-slate-500">{student.fatherName}</td>
                                    <td className="px-6 py-4 text-center">
                                       {studentResult ? (
                                          <span className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full font-black text-[10px] uppercase">Grade: {studentResult.quality}</span>
                                       ) : (
                                          <span className="text-slate-300 italic text-xs">No Data</span>
                                       )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                       {studentResult && (
                                          <button 
                                            onClick={() => setSelectedReport({...studentResult, studentName: student.name, fatherName: student.fatherName, rollNo: student.rollNo, registrationNo: student.registrationNo})}
                                            className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-lg font-bold text-xs hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 mx-auto"
                                          >
                                            <FileText size={14} />
                                            <span>View Report</span>
                                          </button>
                                       )}
                                    </td>
                                 </tr>
                              );
                           });
                        })()}
                     </tbody>
                  </table>
               </div>
               {selectedReport && <ResultReport student={selectedReport} onClose={() => setSelectedReport(null)} />}
            </motion.div>
          ) : activeTab === 'settings' ? (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl mx-auto space-y-8">
               <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                  <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
                     <div>
                        <h3 className="text-xl font-bold">Grade Configuration</h3>
                        <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mt-1">Assessment Thresholds</p>
                     </div>
                     <Settings className="text-white/20 w-8 h-8" />
                  </div>
                  <div className="p-8 space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                        <InputField label="Grade Name" value={newGrade.name} onChange={(v:any) => setNewGrade({...newGrade, name: v})} placeholder="e.g. A+" />
                        <InputField label="Min %" type="number" value={newGrade.min} onChange={(v:any) => setNewGrade({...newGrade, min: v})} placeholder="0" />
                        <InputField label="Max %" type="number" value={newGrade.max} onChange={(v:any) => setNewGrade({...newGrade, max: v})} placeholder="100" />
                        <button onClick={handleAddGradeSetting} className="bg-blue-600 text-white h-[46px] rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest shadow-lg shadow-blue-500/20">
                           <Plus size={18} />
                           <span>Add Grade</span>
                        </button>
                     </div>

                     <div className="border border-slate-100 rounded-2xl overflow-hidden">
                        <table className="w-full text-left">
                           <thead>
                              <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                 <th className="px-6 py-4">Grade</th>
                                 <th className="px-6 py-4">Range (%)</th>
                                 <th className="px-6 py-4 text-center">Action</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                              {gradeSettings.map(g => (
                                 <tr key={g.id}>
                                    <td className="px-6 py-4 font-bold text-slate-800">{g.name}</td>
                                    <td className="px-6 py-4 font-mono text-xs">{g.min}% - {g.max}%</td>
                                    <td className="px-6 py-4 text-center">
                                       <button onClick={() => handleDeleteGradeSetting(g.id)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>
            </motion.div>
          ) : activeTab === 'types' ? (
             <motion.div key="types" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl mx-auto">
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                   <div className="bg-slate-900 p-8 text-white">
                      <h3 className="text-xl font-bold">Manage Exam Types</h3>
                      <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mt-1">Official Terminology</p>
                   </div>
                   <div className="p-8">
                      <div className="flex gap-4 mb-8">
                         <div className="flex-1">
                            <InputField label="New Exam Title" value={selectedExamType} onChange={(v:any) => setSelectedExamType(v)} placeholder="e.g. 1st Quarterly Exam" />
                         </div>
                         <button onClick={() => {
                            if (!selectedExamType) return;
                            const updated = Array.from(new Set([...examTypes, selectedExamType]));
                            setExamTypes(updated);
                            localStorage.setItem('exams', JSON.stringify(updated));
                            setSelectedExamType('');
                         }} className="bg-blue-600 text-white h-[46px] px-8 rounded-xl font-bold mt-6 uppercase text-xs tracking-widest">Add</button>
                      </div>
                      <div className="space-y-3">
                         {examTypes.map(type => (
                            <div key={type} className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between group border border-slate-100">
                               <span className="font-bold text-slate-700">{type}</span>
                               <button onClick={() => {
                                  const updated = examTypes.filter(t => t !== type);
                                  setExamTypes(updated);
                                  localStorage.setItem('exams', JSON.stringify(updated));
                               }} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
             </motion.div>
          ) : activeTab === 'scheduling' ? (
             <motion.div key="scheduling" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl mx-auto">
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                   <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
                      <div>
                         <h3 className="text-xl font-bold">Examination Schedule</h3>
                         <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mt-1">Academic Timeline</p>
                      </div>
                      <Calendar className="text-white/20 w-8 h-8" />
                   </div>
                   <div className="p-12 text-center flex flex-col items-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 mb-6">
                        <Calendar className="w-10 h-10" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-800">Exam Scheduling Module</h4>
                      <p className="text-sm text-slate-400 max-w-sm mt-2">The exam scheduling and date-sheet generation features can be managed through the advanced academic settings portal.</p>
                   </div>
                </div>
             </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string, value: string }) => (
  <div className="flex gap-4 border-b border-slate-100 pb-2">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest w-32 shrink-0">{label}:</span>
    <span className="font-bold text-slate-800 border-b border-slate-800 flex-1">{value}</span>
  </div>
);

const InputField = ({ label, value, onChange, placeholder, type = 'text' }: any) => (
  <div className="space-y-1.5 w-full">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold"
    />
  </div>
);

const Tab = ({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${active ? 'bg-white text-blue-600 shadow-md' : 'text-white/70 hover:bg-white/10'}`}
  >
    {label}
  </button>
);

export default ExamManagement;
