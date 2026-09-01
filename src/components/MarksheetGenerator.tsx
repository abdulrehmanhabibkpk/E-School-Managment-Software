import React, { useState, useEffect } from 'react';
import { ChevronRight, Printer, Upload, Trash2, Shield, PenTool, Image as ImageIcon, Users, User, ArrowLeft } from 'lucide-react';

interface MarksheetGeneratorProps {
  onBack: () => void;
}

export default function MarksheetGenerator({ onBack }: MarksheetGeneratorProps) {
  // Navigation & Form selection states
  const [classes, setClasses] = useState<string[]>([]);
  const [examTypes, setExamTypes] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  
  // Selection mode: 'all' (all students of chosen class) or 'single' (specific student)
  const [generationMode, setGenerationMode] = useState<'all' | 'single'>('single');
  const [selectedStudentRollNo, setSelectedStudentRollNo] = useState('');

  // Data states
  const [systemSettings, setSystemSettings] = useState<any>({});
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [marksheetRecords, setMarksheetRecords] = useState<any[]>([]);

  // Stamp and signatures upload states (Base64 strings stored in LocalStorage)
  const [jamiaSeal, setJamiaSeal] = useState<string>('');
  const [nazimSig, setNazimSig] = useState<string>('');
  const [mohtamimSig, setMohtamimSig] = useState<string>('');

  // Load initial settings, grades list, exam lists, & images from localStorage
  useEffect(() => {
    // 1. System Settings
    const savedSystem = JSON.parse(localStorage.getItem('system_settings') || '{}');
    setSystemSettings(savedSystem);

    // 2. Graded Classes
    try {
      const savedGradesList = JSON.parse(localStorage.getItem('grades_list') || '[]');
      const savedGrades = JSON.parse(localStorage.getItem('grades') || '[]');
      const combined = [...savedGradesList, ...savedGrades];
      const gradeNames = Array.from(new Set(combined.map((g: any) => typeof g === 'string' ? g : (g?.name || '')).filter(Boolean)));
      if (gradeNames.length > 0) {
        setClasses(gradeNames);
      } else {
        setClasses(['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6']);
      }
    } catch (e) {
      setClasses(['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6']);
    }

    // 3. Exam types
    const savedExams = JSON.parse(localStorage.getItem('exams') || '[]');
    const defaultExams = savedExams.length > 0 ? savedExams : ['Annual Exam', 'Midterm Exam', 'Quarterly Exam'];
    const savedHeaders = JSON.parse(localStorage.getItem('examRecords') || '[]');
    const headerTitles = savedHeaders.map((h: any) => h.title || h.name).filter(Boolean);
    const combinedExams = Array.from(new Set([...defaultExams, ...headerTitles]));
    setExamTypes(combinedExams);

    // 4. Load Saved Seals and Signatures
    setJamiaSeal(localStorage.getItem('marksheet_jamia_seal') || '');
    setNazimSig(localStorage.getItem('marksheet_nazim_sig') || '');
    setMohtamimSig(localStorage.getItem('marksheet_mohtamim_sig') || '');
  }, []);

  // Sync / load students and marks whenever class or exam change
  useEffect(() => {
    if (!selectedClass || !selectedExamType) {
      setStudents([]);
      setSubjects([]);
      setMarksheetRecords([]);
      setSelectedStudentRollNo('');
      return;
    }

    // 1. Get subjects (books) for class
    const allBooks = JSON.parse(localStorage.getItem('books_list') || '[]');
    const classBooks = allBooks.filter((b: any) => b.grade === selectedClass).map((b: any) => b.name);
    const finalSubjects = classBooks.length > 0 ? classBooks : ['English', 'Mathematics', 'Science', 'Computer', 'General Knowledge'];
    setSubjects(finalSubjects);

    // 2. Load class students
    const savedStudents = JSON.parse(localStorage.getItem('students') || localStorage.getItem('students_list') || '[]');
    const classStudents = savedStudents.filter((s: any) => s.grade === selectedClass);
    setStudents(classStudents);

    // 3. Load exam results
    const allResults = JSON.parse(localStorage.getItem('all_exam_results') || '[]');
    const matchingExam = allResults.find((exam: any) => exam.className === selectedClass && exam.examType === selectedExamType);
    
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

    // Load Grade Settings
    const savedGradeSettings = JSON.parse(localStorage.getItem('gradeSettings') || '[]');

    // Combine student data with results
    const records = classStudents.map((student: any) => {
      let studentResultsArray: any[] = [];
      try {
        if (typeof student.examResults === 'string') {
          studentResultsArray = JSON.parse(student.examResults);
        } else if (Array.isArray(student.examResults)) {
          studentResultsArray = student.examResults;
        }
      } catch(e) { console.error(e); }

      const studentResult = studentResultsArray.find((r: any) => r.examType === selectedExamType);
      const globalRecord = examRecordsArray.find((r: any) => String(r.rollNo) === String(student.rollNo));
      const result = studentResult || globalRecord;

      const marks: any = {};
      finalSubjects.forEach((sub: string) => {
        // Handle result.marks structure: could be a map [sub]: marks
        let scoreStr = '---';
        if (result && result.marks) {
          const matchedKey = Object.keys(result.marks).find(k => k.trim() === sub.trim());
          if (matchedKey && result.marks[matchedKey] !== undefined) {
            scoreStr = String(result.marks[matchedKey]);
          }
        }
        marks[sub] = scoreStr;
      });

      // Calculate totals
      let totalObtained = 0;
      let hasMarks = false;
      let isFail = false;

      finalSubjects.forEach((sub: string) => {
        const m = parseFloat(marks[sub]);
        if (!isNaN(m)) {
          totalObtained += m;
          hasMarks = true;
          if (m < 33) isFail = true;
        }
      });

      const maxPossible = finalSubjects.length * 100;
      const percentageNum = hasMarks ? parseFloat(((totalObtained / maxPossible) * 100).toFixed(1)) : 0;
      
      let status = '---';
      let quality = '---';
      if (hasMarks) {
        if (percentageNum < 33 || isFail) {
          status = 'Fail';
          quality = 'Fail';
        } else {
          status = 'Pass';
          if (savedGradeSettings.length > 0) {
            const sorted = [...savedGradeSettings].sort((a: any, b: any) => b.minPercentage - a.minPercentage);
            const matched = sorted.find((s: any) => percentageNum >= s.minPercentage);
            quality = matched ? (matched.grade || matched.quality) : 'Satisfactory';
          } else {
            if (percentageNum >= 85) quality = 'Excellent';
            else if (percentageNum >= 75) quality = 'Very Good';
            else if (percentageNum >= 60) quality = 'Good';
            else if (percentageNum >= 45) quality = 'Average';
            else quality = 'Satisfactory';
          }
        }
      }

      // Overwrite if exact text quality was registered in results
      if (result && result.quality) {
        quality = result.quality;
      }
      if (result && result.obtained !== undefined && result.obtained !== null && result.obtained !== 0) {
        totalObtained = parseFloat(result.obtained) || totalObtained;
        hasMarks = true;
      }

      return {
        rollNo: student.rollNo || student.id || '---',
        registrationNo: student.registrationNo || student.admissionNo || '----',
        name: student.name,
        fatherName: student.fatherName,
        marks,
        totalObtained: hasMarks ? totalObtained : '---',
        maxPossible,
        percentage: hasMarks ? `${percentageNum}%` : '---',
        percentageNum,
        quality,
        status
      };
    });

    setMarksheetRecords(records);
    if (records.length > 0 && !selectedStudentRollNo) {
      setSelectedStudentRollNo(records[0].rollNo);
    }
  }, [selectedClass, selectedExamType]);

  // Handle uploading of files as base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'seal' | 'nazim' | 'mohtamim') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (type === 'seal') {
        setJamiaSeal(base64String);
        localStorage.setItem('marksheet_jamia_seal', base64String);
      } else if (type === 'nazim') {
        setNazimSig(base64String);
        localStorage.setItem('marksheet_nazim_sig', base64String);
      } else if (type === 'mohtamim') {
        setMohtamimSig(base64String);
        localStorage.setItem('marksheet_mohtamim_sig', base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeUploadedImage = (type: 'seal' | 'nazim' | 'mohtamim') => {
    if (type === 'seal') {
      setJamiaSeal('');
      localStorage.removeItem('marksheet_jamia_seal');
    } else if (type === 'nazim') {
      setNazimSig('');
      localStorage.removeItem('marksheet_nazim_sig');
    } else if (type === 'mohtamim') {
      setMohtamimSig('');
      localStorage.removeItem('marksheet_mohtamim_sig');
    }
  };

  // Get active student records to render based on selection mode
  const getRenderStudents = () => {
    if (generationMode === 'all') {
      return marksheetRecords;
    } else {
      const single = marksheetRecords.find(r => String(r.rollNo) === String(selectedStudentRollNo));
      return single ? [single] : [];
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderSingleCard = (student: any) => {
    return (
      <div 
        key={student.rollNo}
        className="bg-white text-black shadow-lg relative flex flex-col mx-auto my-6 print:shadow-none print:my-0 print:mx-0 break-after-page page-break"
        style={{ width: '185mm', minHeight: '260mm', padding: '16mm' }}
      >
        {/* Double Line Elegant Border */}
        <div className="absolute inset-[8mm] border-[3px] border-amber-900/80 pointer-events-none z-0"></div>
        <div className="absolute inset-[9.5mm] border border-amber-900/50 pointer-events-none z-0"></div>

        <div className="relative z-10 w-full h-full flex flex-col justify-between flex-1" dir="ltr">
          {/* Top Stamp (if loaded) in background overlay or header corner */}
          {jamiaSeal && (
            <div className="absolute top-[28mm] right-[4mm] w-24 h-24 opacity-80 pointer-events-none print:opacity-90">
              <img src={jamiaSeal} alt="Stamp" className="w-full h-full object-contain" />
            </div>
          )}

          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b-2 border-amber-900/60 mb-6">
            <div className="w-20 h-20 rounded-full border border-slate-300 flex items-center justify-center p-1 bg-white">
              {systemSettings.monogram ? (
                <img src={systemSettings.monogram} alt="Logo" className="w-full h-full object-contain grayscale" />
              ) : (
                <div className="text-[10px] font-bold text-center">Monogram</div>
              )}
            </div>

            <div className="flex-1 text-center px-4">
              <h1 className="text-xl font-extrabold text-[#78350f] font-sans">
                {systemSettings.jamiaName || 'Academic Institute & Educational System'}
              </h1>
              <p className="text-[10px] text-slate-600 font-bold tracking-wider mt-1">{systemSettings.jamiaBranch || 'Academic Board & Educational Network'}</p>
              <div className="text-xs font-bold bg-[#78350f] text-white inline-block px-6 py-1 rounded-full mt-2 font-sans">
                Detailed Mark Sheet
              </div>
            </div>

            {/* Placeholder / Upload space for stamp on the card if not uploaded yet */}
            <div className="w-20 h-20 flex flex-col items-center justify-center text-center">
              {!jamiaSeal ? (
                <div className="border border-dashed border-red-300 rounded p-1 text-[8px] text-red-500 font-bold bg-red-50/50 no-print">
                  No Seal
                </div>
              ) : (
                <div className="w-16 h-16 opacity-0"></div>
              )}
            </div>
          </div>

          {/* Student Info Box */}
          <div className="bg-amber-50/40 border border-amber-900/20 rounded-2xl p-4 mb-6 leading-loose text-xs font-bold font-sans">
            <div className="grid grid-cols-2 gap-y-2 gap-x-6">
              <div className="flex gap-2">
                <span className="text-amber-950 shrink-0">Student Name:</span>
                <span className="flex-1 border-b border-dashed border-amber-900/30 text-[#78350f] px-2 font-black">{student.name}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-amber-950 shrink-0">Roll No:</span>
                <span className="flex-1 border-b border-dashed border-amber-900/30 text-amber-950 font-mono px-2">{student.rollNo}</span>
              </div>
              
              <div className="flex gap-2">
                <span className="text-amber-950 shrink-0">Father Name:</span>
                <span className="flex-1 border-b border-dashed border-amber-900/30 text-slate-800 px-2 font-normal">{student.fatherName}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-amber-950 shrink-0">Registration No:</span>
                <span className="flex-1 border-b border-dashed border-amber-900/30 text-amber-950 font-mono px-2">{student.registrationNo}</span>
              </div>

              <div className="flex gap-2 col-span-2">
                <div className="flex gap-2 flex-1">
                  <span className="text-amber-950 shrink-0">Class / Grade:</span>
                  <span className="flex-1 border-b border-dashed border-amber-900/30 text-slate-800 px-2">{selectedClass}</span>
                </div>
                <div className="flex gap-2 flex-1 ml-4">
                  <span className="text-amber-950 shrink-0">Examination:</span>
                  <span className="flex-1 border-b border-dashed border-amber-900/30 text-[#78350f] px-2">{selectedExamType}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Marks Details Table */}
          <table className="w-full text-center border-collapse border-2 border-amber-900/85 text-xs font-bold font-sans mb-6 flex-1">
            <thead>
              <tr className="bg-amber-100/60 text-amber-950 border-b-2 border-amber-900/85 h-10">
                <th className="border-2 border-amber-900/85 py-2 px-3 text-left">Subjects</th>
                <th className="border-2 border-amber-900/85 py-2 w-28 text-center font-bold">Max Marks</th>
                <th className="border-2 border-amber-900/85 py-2 w-32 text-center font-bold">Obtained Marks</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((sub) => {
                const isFail = parseFloat(student.marks[sub]) < 33;
                return (
                  <tr key={sub} className="h-9 hover:bg-amber-50/20 border-b border-amber-900/20">
                    <td className="border-r-2 border-amber-900/85 py-1 px-3 text-left text-slate-800 font-bold">{sub}</td>
                    <td className="border-r-2 border-amber-900/85 py-1 font-mono text-slate-600">100</td>
                    <td className={`border-r-2 border-amber-900/85 py-1 font-mono font-bold text-sm ${isFail ? 'text-red-600 bg-red-50/20' : 'text-slate-900'}`}>
                      {student.marks[sub] || '---'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-amber-50 border-t-2 border-amber-900/85 text-amber-950 h-10">
                <td className="border-r-2 border-amber-900/85 py-2 px-3 text-left font-black text-amber-950 text-sm">Grand Total</td>
                <td className="border-r-2 border-amber-900/85 py-2 font-mono font-black text-slate-700 text-sm">{student.maxPossible}</td>
                <td className="border-r-2 border-amber-900/85 py-2 font-mono font-black text-amber-950 text-sm bg-amber-100/40">
                  {student.totalObtained}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Results Summary & Signatures Footer */}
          <div className="mt-auto">
            {/* Row with Grade & percentage and stats */}
            <div className="flex justify-between items-center bg-[#78350f]/5 border border-amber-900/30 rounded-xl p-3 mb-8 text-xs font-sans font-black">
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-600">Grade / Quality:</span>
                  <span className="text-[#78350f] text-sm underline underline-offset-4 decoration-double decoration-[#78350f]">{student.quality}</span>
                </div>
                <div className="flex items-center gap-1.5 ml-6">
                  <span className="text-slate-600">Percentage:</span>
                  <span className="text-amber-950 font-mono text-sm underline underline-offset-4 decoration-double decoration-amber-950">{student.percentage}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-600">Final Result:</span>
                  <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold ${student.status === 'Pass' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {student.status === 'Pass' ? 'Pass' : 'Fail'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Signatures with optional uploaded Image components */}
            <div className="grid grid-cols-2 gap-8 pt-8 font-bold text-xs font-sans text-slate-800 relative">
              {/* Controller signature container */}
              <div className="flex flex-col items-center relative">
                <div className="w-48 h-12 flex items-center justify-center relative">
                  {mohtamimSig ? (
                    <img src={mohtamimSig} alt="Director Signature" className="max-h-12 w-auto object-contain absolute bottom-0" />
                  ) : (
                    <span className="text-[9px] text-red-400 font-normal select-none no-print">(Upload Director Sig)</span>
                  )}
                </div>
                <div className="w-48 border-b-2 border-amber-900/50 mt-1"></div>
                <span className="pt-2 text-amber-950">Signature & Stamp of Director</span>
              </div>

              {/* Exam Controller signature container */}
              <div className="flex flex-col items-center relative">
                <div className="w-48 h-12 flex items-center justify-center relative">
                  {nazimSig ? (
                    <img src={nazimSig} alt="Controller Signature" className="max-h-12 w-auto object-contain absolute bottom-0" />
                  ) : (
                    <span className="text-[9px] text-red-400 font-normal select-none no-print">(Upload Controller Sig)</span>
                  )}
                </div>
                <div className="w-48 border-b-2 border-amber-900/50 mt-1"></div>
                <span className="pt-2 text-amber-950">Controller of Examinations</span>
              </div>
            </div>
            
            <p className="text-[8px] text-center text-slate-400 select-none mt-6 print:block hidden font-mono">
              Auto Generated Detailed Mark Sheet • RMS v2.0
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderDataSelectionPanel = () => {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 mb-8 no-print">
        <h3 className="text-lg font-bold text-[#78350f] mb-4 font-sans flex items-center gap-2 justify-start">
          <span className="p-2 bg-amber-50 text-[#78350f] rounded-lg">
            <Users className="w-5 h-5" />
          </span>
          Mark Sheet Generation Panel
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Class selection dropdown */}
          <div className="flex flex-col gap-1.5 text-left w-full">
            <label className="text-xs font-bold text-slate-600 font-sans">Select Class / Grade:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-700 focus:bg-white text-left font-sans font-bold"
            >
              <option value="">-- Select Class --</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Exam Type selection dropdown */}
          <div className="flex flex-col gap-1.5 text-left w-full">
            <label className="text-xs font-bold text-slate-600 font-sans">Select Exam Type:</label>
            <select
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-700 focus:bg-white text-left font-sans font-bold"
            >
              <option value="">-- Select Exam --</option>
              {examTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Selection Mode Selector: All or single */}
          <div className="flex flex-col gap-1.5 text-left w-full">
            <label className="text-xs font-bold text-slate-600 font-sans">Generation Mode:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGenerationMode('single')}
                className={`py-3 rounded-xl text-xs font-bold transition-all border font-sans ${
                  generationMode === 'single'
                    ? 'bg-amber-850/10 border-amber-700 text-[#78350f]'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Individual Student
              </button>
              <button
                type="button"
                onClick={() => setGenerationMode('all')}
                className={`py-3 rounded-xl text-xs font-bold transition-all border font-sans ${
                  generationMode === 'all'
                    ? 'bg-amber-850/10 border-amber-700 text-[#78350f]'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Class Students
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic single student dropdown based on class */}
        {generationMode === 'single' && selectedClass && students.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-1.5 text-left w-full max-w-sm">
            <label className="text-xs font-bold text-slate-600 font-sans">Select Student:</label>
            <select
              value={selectedStudentRollNo}
              onChange={(e) => setSelectedStudentRollNo(e.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-700 focus:bg-white text-left font-sans"
            >
              <option value="">-- Select Student --</option>
              {marksheetRecords.map(s => (
                <option key={s.rollNo} value={s.rollNo}>
                  {s.name} (Roll No: {s.rollNo})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  };

  // UI stamp uploads at the top left/right
  const renderSignatureUploaderPanel = () => {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 mb-8 no-print">
        <h3 className="text-lg font-bold text-slate-800 mb-4 font-sans flex items-center gap-2 justify-start">
          <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Shield className="w-5 h-5" />
          </span>
          Seal & Signature Control Center
        </h3>
        <p className="text-xs text-slate-500 font-sans mb-6 text-left">
          Upload official institute stamp, director signature, and examination controller signature. These images will automatically appear on all mark sheets.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Jamia Seal Stamp Upload */}
          <div className="border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-between text-center bg-slate-50/50">
            <div className="flex flex-col items-center gap-2">
              <span className="p-3 rounded-full bg-amber-50 text-amber-600">
                <ImageIcon className="w-6 h-6" />
              </span>
              <span className="font-sans font-bold text-sm text-slate-800">Institute Stamp / Seal</span>
              <p className="text-[10px] text-slate-400 font-sans">Upload PNG or JPG official seal image.</p>
            </div>

            <div className="mt-4 w-full flex flex-col gap-2 items-center">
              {jamiaSeal ? (
                <div className="relative group">
                  <img src={jamiaSeal} alt="Seal Preview" className="h-16 w-16 object-contain border p-1 rounded-lg bg-white" />
                  <button
                    onClick={() => removeUploadedImage('seal')}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-lg transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-sans font-bold px-4 py-2.5 rounded-xl cursor-pointer text-xs transition-colors shadow-md">
                  <Upload className="w-4 h-4" />
                  Browse File
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'seal')} />
                </label>
              )}
            </div>
          </div>

          {/* Signature of Nazim */}
          <div className="border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-between text-center bg-slate-50/50">
            <div className="flex flex-col items-center gap-2">
              <span className="p-3 rounded-full bg-indigo-50 text-indigo-600">
                <PenTool className="w-6 h-6" />
              </span>
              <span className="font-sans font-bold text-sm text-slate-800">Controller Signature</span>
              <p className="text-[10px] text-slate-400 font-sans">Upload exam controller signature image.</p>
            </div>

            <div className="mt-4 w-full flex flex-col gap-2 items-center">
              {nazimSig ? (
                <div className="relative group">
                  <img src={nazimSig} alt="Nazim Signature Preview" className="h-16 w-32 object-contain border p-1 rounded-lg bg-white" />
                  <button
                    onClick={() => removeUploadedImage('nazim')}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-lg transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-sans font-bold px-4 py-2.5 rounded-xl cursor-pointer text-xs transition-colors shadow-md">
                  <Upload className="w-4 h-4" />
                  Browse File
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'nazim')} />
                </label>
              )}
            </div>
          </div>

          {/* Signature of Mohtamim */}
          <div className="border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-between text-center bg-slate-50/50">
            <div className="flex flex-col items-center gap-2">
              <span className="p-3 rounded-full bg-emerald-50 text-emerald-600">
                <PenTool className="w-6 h-6" />
              </span>
              <span className="font-sans font-bold text-sm text-slate-800">Director Signature</span>
              <p className="text-[10px] text-slate-400 font-sans">Upload director / principal signature image.</p>
            </div>

            <div className="mt-4 w-full flex flex-col gap-2 items-center">
              {mohtamimSig ? (
                <div className="relative group">
                  <img src={mohtamimSig} alt="Mohtamim Signature Preview" className="h-16 w-32 object-contain border p-1 rounded-lg bg-white" />
                  <button
                    onClick={() => removeUploadedImage('mohtamim')}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-lg transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-sans font-bold px-4 py-2.5 rounded-xl cursor-pointer text-xs transition-colors shadow-md">
                  <Upload className="w-4 h-4" />
                  Browse File
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'mohtamim')} />
                </label>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSelectedCards = () => {
    const renderList = getRenderStudents();
    
    if (!selectedClass || !selectedExamType) {
      return (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 shadow-sm border border-slate-200 font-sans">
          <div className="text-5xl mb-4">📜</div>
          <h4 className="font-bold text-slate-800 text-base mb-1">Select Class & Exam Type</h4>
          <p className="text-xs text-slate-500">Choose a class and exam type above to generate detailed mark sheets.</p>
        </div>
      );
    }
    
    if (renderList.length === 0) {
      return (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-500 shadow-sm border border-slate-200 font-sans">
          <h4 className="font-bold text-slate-800 text-base mb-1">No Result Records Found</h4>
          <p className="text-xs text-slate-500">No exam results recorded for the selected class and exam type.</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-8 print:gap-0 font-sans">
        <div className="flex justify-end gap-3 no-print mb-4">
          <button
            onClick={handlePrint}
            className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-amber-700/20 text-sm active:scale-95 transition-all"
          >
            <Printer className="w-5 h-5" />
            <span>Print Mark Sheets ({renderList.length})</span>
          </button>
        </div>

        {/* Paper Cards Canvas wrapper */}
        <div className="overflow-x-auto p-4 bg-slate-100 rounded-3xl border border-slate-300 shadow-inner flex flex-col gap-6 items-center print:bg-white print:p-0 print:border-none print:shadow-none no-scrollbar">
          {renderList.map(item => renderSingleCard(item))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-6 print:p-0 print:bg-white" dir="ltr">
      {/* Back Header - Hidden on Print */}
      <div className="max-w-5xl mx-auto flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-6 no-print">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 p-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 text-sm font-bold"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Reports</span>
          </button>
          <div>
            <h2 className="text-xl font-bold text-amber-950 font-sans">DMC / Mark Sheet Generator System</h2>
            <p className="text-[10px] text-slate-500">Generate and print official detailed student result mark sheets (DMC)</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Step 1: Upload Stamps & Signatures */}
        {renderSignatureUploaderPanel()}

        {/* Step 2: Selection Panel */}
        {renderDataSelectionPanel()}

        {/* Step 3: Print / Display Section */}
        {renderSelectedCards()}
      </div>

      {/* Styled Inline Styles */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .break-after-page {
            page-break-after: always !important;
            break-after: page !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            height: 100% !important;
          }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
