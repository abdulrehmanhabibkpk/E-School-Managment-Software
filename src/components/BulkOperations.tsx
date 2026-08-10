import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ArrowRight, ShieldCheck, HelpCircle, AlertTriangle, 
  Settings, Check, UploadCloud, DownloadCloud, Sparkles, Filter, 
  Users, Sliders, CheckSquare, Award, Play, AlertCircle
} from 'lucide-react';
import { updateCentralKey } from '../syncService';
import { exportToExcel, importFromExcel } from '../excelUtils';

interface Student {
  id: number;
  name: string;
  fatherName: string;
  phone: string;
  grade: string;
  section?: string;
  rollNo?: string;
  regNo?: string;
  status?: string; // Active, Suspended, Graduated, Inactive
  monthlyFee?: number;
}

interface BulkOperationsProps {
  onBack: () => void;
}

export default function BulkOperations({ onBack }: BulkOperationsProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [gradesList, setGradesList] = useState<string[]>([]);
  
  // Promotion States
  const [promoteSourceGrade, setPromoteSourceGrade] = useState('');
  const [promoteTargetGrade, setPromoteTargetGrade] = useState('');
  const [promotionPreview, setPromotionPreview] = useState<Student[]>([]);
  
  // Status Edit States
  const [statusSourceGrade, setStatusSourceGrade] = useState('All');
  const [statusTargetVal, setStatusTargetVal] = useState('Active');
  
  // Fee Adjustment States
  const [feeSourceGrade, setFeeSourceGrade] = useState('All');
  const [feeAdjustmentType, setFeeAdjustmentType] = useState<'fixed' | 'increase' | 'decrease'>('fixed');
  const [feeValue, setFeeValue] = useState<number>(1500);

  // General Notification Banner
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null);

  useEffect(() => {
    const loadedStudents = localStorage.getItem('students');
    if (loadedStudents) {
      try {
        const parsed = JSON.parse(loadedStudents);
        if (Array.isArray(parsed)) {
          setStudents(parsed);
          const uniqueGrades = Array.from(new Set(parsed.map(s => s.grade || 'Grade 10'))).filter(Boolean);
          setGradesList(uniqueGrades);
        }
      } catch (e) {
        console.error('Failed to load students in BulkOperations:', e);
      }
    }
  }, []);

  const saveStudents = (updatedList: Student[], successMessage: string) => {
    setStudents(updatedList);
    localStorage.setItem('students', JSON.stringify(updatedList));
    updateCentralKey('students', updatedList);
    
    // Trigger storage update event for live updates elsewhere
    window.dispatchEvent(new Event('storage_updated'));

    // Recompute unique grades
    const uniqueGrades = Array.from(new Set(updatedList.map(s => s.grade || 'Grade 10'))).filter(Boolean);
    setGradesList(uniqueGrades);

    setAlertMsg({ type: 'success', text: successMessage });
    setTimeout(() => setAlertMsg(null), 5000);
  };

  // Preview promotion list
  const handlePromotionPreview = () => {
    if (!promoteSourceGrade) {
      setAlertMsg({ type: 'error', text: 'Please choose a starting source class.' });
      return;
    }
    const filtered = students.filter(s => s.grade === promoteSourceGrade);
    setPromotionPreview(filtered);
    if (filtered.length === 0) {
      setAlertMsg({ type: 'warning', text: `No students currently found in ${promoteSourceGrade}.` });
    } else {
      setAlertMsg(null);
    }
  };

  // Execute promotion
  const handleExecutePromotion = () => {
    if (!promoteSourceGrade || !promoteTargetGrade) {
      setAlertMsg({ type: 'error', text: 'Source and Target classes are required for promotion.' });
      return;
    }
    if (promoteSourceGrade === promoteTargetGrade) {
      setAlertMsg({ type: 'error', text: 'Source and Target classes must be different.' });
      return;
    }

    const count = promotionPreview.length;
    if (count === 0) return;

    if (!confirm(`⚠️ CRITICAL: Are you sure you want to promote ${count} students from ${promoteSourceGrade} to ${promoteTargetGrade}?`)) {
      return;
    }

    const updated = students.map(student => {
      if (student.grade === promoteSourceGrade) {
        return { ...student, grade: promoteTargetGrade };
      }
      return student;
    });

    saveStudents(updated, `🎉 Successfully promoted ${count} students to ${promoteTargetGrade}!`);
    setPromotionPreview([]);
    setPromoteSourceGrade('');
    setPromoteTargetGrade('');
  };

  // Bulk Status Update
  const handleExecuteStatusUpdate = () => {
    const targets = students.filter(s => statusSourceGrade === 'All' || s.grade === statusSourceGrade);
    const count = targets.length;

    if (count === 0) {
      setAlertMsg({ type: 'error', text: 'No students match your class filter.' });
      return;
    }

    if (!confirm(`Do you want to change the status of ${count} students to "${statusTargetVal}"?`)) return;

    const updated = students.map(student => {
      if (statusSourceGrade === 'All' || student.grade === statusSourceGrade) {
        return { ...student, status: statusTargetVal };
      }
      return student;
    });

    saveStudents(updated, `✅ Successfully updated status to "${statusTargetVal}" for ${count} students.`);
  };

  // Bulk Tuition Fee Setting
  const handleExecuteFeeAdjustment = () => {
    const targets = students.filter(s => feeSourceGrade === 'All' || s.grade === feeSourceGrade);
    const count = targets.length;

    if (count === 0) {
      setAlertMsg({ type: 'error', text: 'No students match your class filter.' });
      return;
    }

    if (!confirm(`Are you sure you want to adjust fees for ${count} students?`)) return;

    const updated = students.map(student => {
      if (feeSourceGrade === 'All' || student.grade === feeSourceGrade) {
        let currentFee = student.monthlyFee || 1500;
        let newFee = currentFee;

        if (feeAdjustmentType === 'fixed') {
          newFee = feeValue;
        } else if (feeAdjustmentType === 'increase') {
          newFee = currentFee + feeValue;
        } else if (feeAdjustmentType === 'decrease') {
          newFee = Math.max(0, currentFee - feeValue);
        }

        return { ...student, monthlyFee: newFee };
      }
      return student;
    });

    saveStudents(updated, `💰 Successfully adjusted tuition fees for ${count} students.`);
  };

  // Import / Export Helpers
  const triggerExcelExport = () => {
    exportToExcel(students, 'CentralStudentDatabase');
    setAlertMsg({ type: 'success', text: 'Excel Sheet exported successfully!' });
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    importFromExcel(file)
      .then((importedData: any[]) => {
        if (importedData && importedData.length > 0) {
          const merged = [...students];
          importedData.forEach((newItem: any) => {
            if (!newItem.id) newItem.id = Date.now() + Math.floor(Math.random() * 1000);
            const idx = merged.findIndex(existing => existing.id === newItem.id || (existing.rollNo === newItem.rollNo && existing.grade === newItem.grade));
            if (idx !== -1) {
              merged[idx] = { ...merged[idx], ...newItem };
            } else {
              merged.push(newItem);
            }
          });

          saveStudents(merged, `📥 Successfully imported/merged ${importedData.length} records into the main student database.`);
        } else {
          setAlertMsg({ type: 'error', text: 'No valid records found in selected Excel file.' });
        }
      })
      .catch((err) => {
        console.error('Import error:', err);
        setAlertMsg({ type: 'error', text: 'Failed to read Excel file.' });
      });
  };

  return (
    <div className="min-h-screen bg-[#F4F7F6] text-slate-800 flex flex-col font-sans pb-16">
      {/* Top Header Navbar */}
      <header className="bg-slate-900 text-white px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md sticky top-0 z-30">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all cursor-pointer text-white flex items-center justify-center"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500/20 border border-teal-400/30 text-teal-400 rounded-xl flex items-center justify-center shadow-inner">
              <Sliders className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-snug flex items-center gap-2">
                Student Bulk Operations Panel
              </h1>
              <p className="text-xs text-slate-400">
                بلک آپریشنز — کلاس پروموشن، فیس سیٹنگ اور ڈیٹا امپورٹ/ایکسپورٹ
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 pt-6 flex-1 space-y-6">
        
        {/* Alerts Center */}
        {alertMsg && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold border animate-in fade-in slide-in-from-top-2 ${
            alertMsg.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : alertMsg.type === 'warning'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{alertMsg.text}</p>
          </div>
        )}

        {/* Bento Grid Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Section A: Class Promotion & Upgrades (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <Award className="w-5 h-5 text-teal-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Bulk Promotion & Class Upgrades</h3>
                <p className="text-[11px] text-slate-500">پوری کلاس کے تمام طلباء کو اگلی کلاس میں منتقل کریں</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Source Class (موجودہ کلاس)</label>
                <select
                  value={promoteSourceGrade}
                  onChange={(e) => setPromoteSourceGrade(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                >
                  <option value="">Select Source...</option>
                  {gradesList.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Target Class (اگلی کلاس)</label>
                <select
                  value={promoteTargetGrade}
                  onChange={(e) => setPromoteTargetGrade(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                >
                  <option value="">Select Destination...</option>
                  <option value="Graduated">Graduated / فارغ التحصیل</option>
                  {gradesList.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </select>
              </div>
            </div>

            <button
              onClick={handlePromotionPreview}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Preview Students Queue ({promotionPreview.length})</span>
            </button>

            {promotionPreview.length > 0 && (
              <div className="space-y-3 animate-in fade-in">
                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <p>
                    <strong>WARNING:</strong> This action is permanent. All <strong>{promotionPreview.length}</strong> students listed below will be moved to <strong>{promoteTargetGrade}</strong> instantly.
                  </p>
                </div>

                {/* Roll No & Students Preview chips list */}
                <div className="max-h-[160px] overflow-y-auto bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-wrap gap-2">
                  {promotionPreview.map(student => (
                    <span key={student.id} className="text-[10px] bg-white border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-700 flex items-center gap-1">
                      👤 {student.name} <span className="text-slate-400 font-mono">({student.rollNo || 'No roll'})</span>
                    </span>
                  ))}
                </div>

                <button
                  onClick={handleExecutePromotion}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-teal-500/10"
                >
                  <Play className="w-4 h-4" />
                  <span>Execute Bulk Promotion Now!</span>
                </button>
              </div>
            )}
          </div>

          {/* Section B: Excel Imports & Database Backup (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <UploadCloud className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Database Sync & Excel Transfer</h3>
                  <p className="text-[11px] text-slate-500">ڈیٹا بیک اپ اور ایکسل شیٹ کا تبادلہ</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed font-bold">
                  Export your complete student records directly into an Excel sheet format or merge external files in bulk.
                </p>

                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={triggerExcelExport}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
                  >
                    <DownloadCloud className="w-4 h-4" />
                    <span>Download Excel Sheet Backup</span>
                  </button>

                  <div className="relative">
                    <input 
                      type="file" 
                      id="bulk-excel-import" 
                      accept=".xlsx, .xls, .csv"
                      onChange={handleExcelImport}
                      className="hidden"
                    />
                    <label 
                      htmlFor="bulk-excel-import"
                      className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition border border-slate-300"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Upload & Merge Excel Data</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-semibold text-center pt-4 border-t border-slate-100 uppercase tracking-widest">
              Secured Central Server System
            </div>
          </div>

          {/* Row 2: Status & Fees Bulk Actions */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <CheckSquare className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Bulk Student Status Adjustment</h3>
                <p className="text-[11px] text-slate-500">ایک وقت میں متعدد طلباء کا اسٹیٹس تبدیل کریں</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Filter Class</label>
                <select
                  value={statusSourceGrade}
                  onChange={(e) => setStatusSourceGrade(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                >
                  <option value="All">All Students (تمام)</option>
                  {gradesList.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Set Status Value</label>
                <select
                  value={statusTargetVal}
                  onChange={(e) => setStatusTargetVal(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                >
                  <option value="Active">Active / زیر تعلیم</option>
                  <option value="Suspended">Suspended / معطل شدہ</option>
                  <option value="Inactive">Inactive / غیر فعال</option>
                  <option value="Graduated">Graduated / فارغ التحصیل</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleExecuteStatusUpdate}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition"
            >
              <span>Apply Status Updates</span>
            </button>
          </div>

          {/* Tuition Fee Assignments */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <Settings className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Bulk Monthly Fee Assignments</h3>
                <p className="text-[11px] text-slate-500">کلاس کی ماہانہ فیس سیٹ یا تبدیل کریں</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Class</label>
                <select
                  value={feeSourceGrade}
                  onChange={(e) => setFeeSourceGrade(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-medium"
                >
                  <option value="All">All Classes</option>
                  {gradesList.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Adjustment Type</label>
                <select
                  value={feeAdjustmentType}
                  onChange={(e) => setFeeAdjustmentType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-medium"
                >
                  <option value="fixed">Set Fixed Fee</option>
                  <option value="increase">Increase By</option>
                  <option value="decrease">Decrease By</option>
                </select>
              </div>

              <div className="col-span-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Amount (PKR)</label>
                <input 
                  type="number" 
                  value={feeValue}
                  onChange={(e) => setFeeValue(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold"
                />
              </div>
            </div>

            <button
              onClick={handleExecuteFeeAdjustment}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition"
            >
              <span>Assign Tuition Fees</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
