import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Search, Printer, CreditCard, CheckSquare, Wallet, User, Calendar, 
  Receipt, Plus, Minus, History, Trash2, Tag, Layers, QrCode, ClipboardList, 
  Check, Sparkles, AlertCircle, RefreshCw, BarChart3, HelpCircle, Columns, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { updateCentralKey } from '../syncService';
import { generateNumericId } from '../lib/idUtils';

interface FeesManagementProps {
  subView: 'collections' | 'scan-to-collect' | 'vouchers' | 'advance-voucher' | 'split-installments' | 'heads' | 'structures';
  onBack: () => void;
}

interface Student {
  id: number;
  name: string;
  regNo: string;
  rollNo: string;
  grade: string;
  section: string;
}

interface FeeTransaction {
  id: number;
  studentId: number;
  studentName: string;
  regNo: string;
  grade: string;
  month: string;
  admissionFee: number;
  monthlyFee: number;
  booksFee: number;
  otherCharges: number;
  arrears: number;
  discount: number;
  totalPaid: number;
  paymentDate: string;
}

interface FeeHead {
  id: string;
  name: string;
  code: string;
  type: 'Monthly' | 'One-Time' | 'Term-wise' | 'Yearly';
  defaultAmount: number;
}

interface FeeStructure {
  grade: string;
  heads: { [headId: string]: number };
}

interface BulkVoucher {
  id: string;
  studentId: number;
  studentName: string;
  regNo: string;
  grade: string;
  month: string;
  dueDate: string;
  fineAmount: number;
  details: { name: string; amount: number }[];
  totalAmount: number;
}

interface AdvanceRecord {
  id: number;
  studentId: number;
  studentName: string;
  regNo: string;
  monthsRange: string;
  monthlyRate: number;
  totalMonths: number;
  discount: number;
  totalPaid: number;
  date: string;
  remarks: string;
}

interface InstallmentPlan {
  id: string;
  studentId: number;
  studentName: string;
  regNo: string;
  totalAmount: number;
  partsCount: number;
  installments: {
    partNo: number;
    amount: number;
    dueDate: string;
    status: 'unpaid' | 'paid';
  }[];
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const GRADES = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];

export default function FeesManagement({ subView, onBack }: FeesManagementProps) {
  // --- Global Student & Finance Records ---
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [savedFees, setSavedFees] = useState<FeeTransaction[]>([]);
  const [feeHeads, setFeeHeads] = useState<FeeHead[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [vouchers, setVouchers] = useState<BulkVoucher[]>([]);
  const [advanceRecords, setAdvanceRecords] = useState<AdvanceRecord[]>([]);
  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>([]);

  // --- Search & UI States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'collect' | 'history'>('collect');
  const [reprintData, setReprintData] = useState<FeeTransaction | null>(null);
  const [printVoucher, setPrintVoucher] = useState<BulkVoucher | null>(null);
  const [historySearch, setHistorySearch] = useState('');

  // --- Collection Form State ---
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
  const [feeForm, setFeeForm] = useState({
    admissionFee: 0,
    monthlyFee: 0,
    booksFee: 0,
    otherCharges: 0,
    arrears: 0,
    discount: 0
  });

  // --- Scanner Simulation State ---
  const [scannerStatus, setScannerStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [scannedRegNo, setScannedRegNo] = useState('');

  // --- Voucher Generator States ---
  const [voucherGrade, setVoucherGrade] = useState(GRADES[0]);
  const [voucherMonth, setVoucherMonth] = useState(months[new Date().getMonth()]);
  const [voucherDueDate, setVoucherDueDate] = useState(new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0]);
  const [voucherFine, setVoucherFine] = useState(100);
  const [bulkVoucherList, setBulkVoucherList] = useState<BulkVoucher[]>([]);

  // --- Advance Voucher States ---
  const [advanceMonths, setAdvanceMonths] = useState(3);
  const [advanceDiscount, setAdvanceDiscount] = useState(0);
  const [advanceRemarks, setAdvanceRemarks] = useState('');
  const [advanceReceipt, setAdvanceReceipt] = useState<AdvanceRecord | null>(null);

  // --- Split Installment States ---
  const [splitParts, setSplitParts] = useState(2);
  const [splitAmount, setSplitAmount] = useState(0);
  const [splitDates, setSplitDates] = useState<string[]>([]);

  // --- Fee Head Form State ---
  const [newHeadName, setNewHeadName] = useState('');
  const [newHeadCode, setNewHeadCode] = useState('');
  const [newHeadType, setNewHeadType] = useState<'Monthly' | 'One-Time' | 'Term-wise' | 'Yearly'>('Monthly');
  const [newHeadAmount, setNewHeadAmount] = useState(0);

  // --- Fee Structure Selection ---
  const [structureGrade, setStructureGrade] = useState(GRADES[0]);
  const [structureForm, setStructureForm] = useState<{ [headId: string]: number }>({});

  // --- Initial Data Loading & Migration Fallbacks ---
  useEffect(() => {
    // 1. Fetch Students
    const savedStudents = localStorage.getItem('students');
    if (savedStudents) {
      setAllStudents(JSON.parse(savedStudents));
    }

    // 2. Fetch Fee Transactions
    const fees = localStorage.getItem('saved_fees');
    if (fees) {
      setSavedFees(JSON.parse(fees));
    }

    // 3. Fetch Fee Heads (with default setup if missing)
    const heads = localStorage.getItem('fee_heads');
    if (heads) {
      setFeeHeads(JSON.parse(heads));
    } else {
      const defaultHeads: FeeHead[] = [
        { id: 'fh-1', name: 'Monthly Tuition Fee', code: 'TUI', type: 'Monthly', defaultAmount: 1500 },
        { id: 'fh-2', name: 'Admission Fee', code: 'ADM', type: 'One-Time', defaultAmount: 5000 },
        { id: 'fh-3', name: 'Books & Stationery', code: 'BKS', type: 'One-Time', defaultAmount: 1200 },
        { id: 'fh-4', name: 'Exam Fee', code: 'EXM', type: 'Term-wise', defaultAmount: 500 },
        { id: 'fh-5', name: 'Transport Charges', code: 'TRA', type: 'Monthly', defaultAmount: 800 }
      ];
      setFeeHeads(defaultHeads);
      localStorage.setItem('fee_heads', JSON.stringify(defaultHeads));
    }

    // 4. Fetch Fee Structures
    const structures = localStorage.getItem('fee_structures');
    if (structures) {
      setFeeStructures(JSON.parse(structures));
    } else {
      const defaultStructures: FeeStructure[] = GRADES.map(grade => {
        const tuition = grade === 'Grade 10' ? 2500 : grade === 'Grade 9' ? 2200 : grade === 'Grade 8' ? 2000 : 1500;
        return {
          grade,
          heads: {
            'fh-1': tuition,
            'fh-2': 5000,
            'fh-3': 1200,
            'fh-4': 500,
            'fh-5': 800
          }
        };
      });
      setFeeStructures(defaultStructures);
      localStorage.setItem('fee_structures', JSON.stringify(defaultStructures));
    }

    // 5. Fetch Advance Records
    const advances = localStorage.getItem('fee_advances');
    if (advances) {
      setAdvanceRecords(JSON.parse(advances));
    }

    // 6. Fetch Split Installments
    const installments = localStorage.getItem('fee_installments');
    if (installments) {
      setInstallmentPlans(JSON.parse(installments));
    }
  }, []);

  // Sync state for local storage updates
  useEffect(() => {
    const handleStorageUpdate = () => {
      const savedStudents = localStorage.getItem('students');
      if (savedStudents) setAllStudents(JSON.parse(savedStudents));
      const fees = localStorage.getItem('saved_fees');
      if (fees) setSavedFees(JSON.parse(fees));
    };
    window.addEventListener('storage_updated', handleStorageUpdate);
    return () => window.removeEventListener('storage_updated', handleStorageUpdate);
  }, []);

  // --- DYNAMIC FEE POPULATION FROM STRUCTURE ---
  useEffect(() => {
    if (selectedStudent) {
      const studentGrade = selectedStudent.grade;
      const structure = feeStructures.find(fs => fs.grade === studentGrade);
      
      if (structure) {
        setFeeForm({
          monthlyFee: structure.heads['fh-1'] || 1500,
          admissionFee: 0, // usually paid once, default to 0 for monthly routine
          booksFee: 0,
          otherCharges: 0,
          arrears: 0,
          discount: 0
        });
      }
    }
  }, [selectedStudent, feeStructures]);

  // --- AUTOMATIC SPLIT DATES CALCULATOR ---
  useEffect(() => {
    const dates = [];
    for (let i = 0; i < splitParts; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    setSplitDates(dates);
  }, [splitParts]);

  // --- POPULATE FEE STRUCTURE FORM FOR GRADE ---
  useEffect(() => {
    const structure = feeStructures.find(fs => fs.grade === structureGrade);
    const initialForm: { [headId: string]: number } = {};
    feeHeads.forEach(h => {
      initialForm[h.id] = structure?.heads[h.id] || h.defaultAmount;
    });
    setStructureForm(initialForm);
  }, [structureGrade, feeHeads, feeStructures]);

  // --- STUDENT SEARCH HANDLERS ---
  const handleStudentSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    const results = allStudents.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.regNo?.includes(searchTerm) || 
      s.rollNo?.includes(searchTerm)
    );
    setSearchResults(results);
  };

  const selectStudent = (student: Student) => {
    setSelectedStudent(student);
    setSearchResults([]);
    setSearchTerm('');
  };

  const calculateTotal = () => {
    const { admissionFee, monthlyFee, booksFee, otherCharges, arrears, discount } = feeForm;
    return (admissionFee + monthlyFee + booksFee + otherCharges + arrears) - discount;
  };

  // --- ACTIONS ---

  // 1. Save & Print Collection
  const handleSaveCollection = async () => {
    if (!selectedStudent) return;
    const total = calculateTotal();
    
    const transaction: FeeTransaction = {
      id: generateNumericId(),
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      regNo: selectedStudent.regNo,
      grade: selectedStudent.grade,
      month: selectedMonth,
      ...feeForm,
      totalPaid: total,
      paymentDate: new Date().toISOString()
    };

    const updated = [...savedFees, transaction];
    setSavedFees(updated);
    localStorage.setItem('saved_fees', JSON.stringify(updated));
    await updateCentralKey('saved_fees', updated);

    // Show beautiful receipt print frame
    setReprintData(transaction);
    setSaveStatus('🎉 Fee transaction recorded and synchronized successfully!');
    
    // Clear selected student form
    setSelectedStudent(null);
    setFeeForm({
      admissionFee: 0,
      monthlyFee: 0,
      booksFee: 0,
      otherCharges: 0,
      arrears: 0,
      discount: 0
    });

    setTimeout(() => setSaveStatus(null), 4000);
    setTimeout(() => window.print(), 300);
  };

  // 1b. Generate & Print Single 3-Part Bank Voucher
  const handlePrintSingleVoucher = () => {
    if (!selectedStudent) return;
    
    const structure = feeStructures.find(fs => fs.grade === selectedStudent.grade);
    const details = feeHeads.map(h => ({
      name: h.name,
      amount: structure?.heads[h.id] || h.defaultAmount
    })).filter(h => h.amount > 0);

    const total = details.reduce((sum, d) => sum + d.amount, 0);

    const voucher: BulkVoucher = {
      id: `VCH-${selectedStudent.id}-${Date.now().toString().slice(-4)}`,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      regNo: selectedStudent.regNo,
      grade: selectedStudent.grade,
      month: selectedMonth,
      dueDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
      fineAmount: 100,
      details,
      totalAmount: total
    };

    setPrintVoucher(voucher);
    setReprintData(null);
    setAdvanceReceipt(null);
    setTimeout(() => window.print(), 300);
  };

  // 2. Simulated QR Scanner Scan Card
  const handleSimulateScan = (student: Student) => {
    setScannerStatus('scanning');
    setScannedRegNo(student.regNo);
    
    setTimeout(() => {
      setScannerStatus('success');
      setTimeout(() => {
        setSelectedStudent(student);
        setScannerStatus('idle');
        setSaveStatus(`🔍 Card Scanned! Found Student: ${student.name}`);
        setTimeout(() => setSaveStatus(null), 4000);
        // Navigate programmatically by changing state simulation or let parent know.
        // We will switch view logic locally:
        // Actually, scan to collect just needs to select student and show collections!
      }, 1000);
    }, 1500);
  };

  // Manual code entry in scanner
  const handleManualScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = allStudents.find(s => s.regNo === scannedRegNo || s.rollNo === scannedRegNo);
    if (matched) {
      setScannerStatus('success');
      setTimeout(() => {
        setSelectedStudent(matched);
        setScannerStatus('idle');
        setScannedRegNo('');
      }, 1000);
    } else {
      setScannerStatus('failed');
      setTimeout(() => setScannerStatus('idle'), 2000);
    }
  };

  // 3. Bulk Voucher Generator
  const handleGenerateBulkVouchers = () => {
    const classStudents = allStudents.filter(s => s.grade === voucherGrade);
    if (classStudents.length === 0) {
      alert(`No students registered in ${voucherGrade}`);
      return;
    }

    const structure = feeStructures.find(fs => fs.grade === voucherGrade);
    const generated: BulkVoucher[] = classStudents.map(student => {
      const details = feeHeads.map(h => ({
        name: h.name,
        amount: structure?.heads[h.id] || h.defaultAmount
      })).filter(h => h.amount > 0);

      const total = details.reduce((sum, d) => sum + d.amount, 0);

      return {
        id: `VCH-${student.id}-${Date.now().toString().slice(-4)}`,
        studentId: student.id,
        studentName: student.name,
        regNo: student.regNo,
        grade: student.grade,
        month: voucherMonth,
        dueDate: voucherDueDate,
        fineAmount: voucherFine,
        details,
        totalAmount: total
      };
    });

    setBulkVoucherList(generated);
    setSaveStatus(`📦 Generated ${generated.length} bulk vouchers for ${voucherGrade}!`);
    setTimeout(() => setSaveStatus(null), 4000);
  };

  // 4. Advance Voucher Generator
  const handleSaveAdvanceVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      alert('Please select a student');
      return;
    }

    const structure = feeStructures.find(fs => fs.grade === selectedStudent.grade);
    const rate = structure?.heads['fh-1'] || 1500;
    const totalAmount = (rate * advanceMonths) - advanceDiscount;

    const record: AdvanceRecord = {
      id: generateNumericId(),
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      regNo: selectedStudent.regNo,
      monthsRange: `${selectedMonth} onwards (${advanceMonths} Months)`,
      monthlyRate: rate,
      totalMonths: advanceMonths,
      discount: advanceDiscount,
      totalPaid: totalAmount,
      date: new Date().toISOString().split('T')[0],
      remarks: advanceRemarks || 'Advance school fee pre-payment'
    };

    const updated = [...advanceRecords, record];
    setAdvanceRecords(updated);
    localStorage.setItem('fee_advances', JSON.stringify(updated));
    await updateCentralKey('fee_advances', updated);

    setAdvanceReceipt(record);
    setSelectedStudent(null);
    setAdvanceRemarks('');
    setAdvanceDiscount(0);

    setSaveStatus('🌟 Advance Fee Voucher recorded and synchronized successfully!');
    setTimeout(() => setSaveStatus(null), 4000);
    setTimeout(() => window.print(), 300);
  };

  // 5. Split Installments Plan
  const handleSaveInstallmentPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      alert('Please select a student');
      return;
    }
    if (splitAmount <= 0) {
      alert('Please set a valid total amount to split');
      return;
    }

    const share = Math.round(splitAmount / splitParts);
    const installments = splitDates.map((date, idx) => ({
      partNo: idx + 1,
      amount: idx === splitParts - 1 ? splitAmount - (share * (splitParts - 1)) : share, // adjustments for rounding
      dueDate: date,
      status: 'unpaid' as const
    }));

    const plan: InstallmentPlan = {
      id: `INST-${selectedStudent.id}-${Date.now().toString().slice(-4)}`,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      regNo: selectedStudent.regNo,
      totalAmount: splitAmount,
      partsCount: splitParts,
      installments
    };

    const updated = [...installmentPlans, plan];
    setInstallmentPlans(updated);
    localStorage.setItem('fee_installments', JSON.stringify(updated));
    await updateCentralKey('fee_installments', updated);

    setSelectedStudent(null);
    setSplitAmount(0);
    setSaveStatus('📊 Successfully generated and logged Split Installment Roster!');
    setTimeout(() => setSaveStatus(null), 4000);
  };

  // 6. Fee Heads Management
  const handleAddFeeHead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHeadName.trim() || !newHeadCode.trim()) {
      alert('Please supply all required fields');
      return;
    }

    const newHead: FeeHead = {
      id: `fh-${Date.now()}`,
      name: newHeadName.trim(),
      code: newHeadCode.trim().toUpperCase(),
      type: newHeadType,
      defaultAmount: Number(newHeadAmount)
    };

    const updated = [...feeHeads, newHead];
    setFeeHeads(updated);
    localStorage.setItem('fee_heads', JSON.stringify(updated));
    await updateCentralKey('fee_heads', updated);

    setNewHeadName('');
    setNewHeadCode('');
    setNewHeadAmount(0);
    setSaveStatus('🏷️ New Fee Category Head created successfully!');
    setTimeout(() => setSaveStatus(null), 4000);
  };

  const handleDeleteFeeHead = async (id: string) => {
    if (id === 'fh-1') {
      alert('Monthly Tuition Fee is a core module parameter and cannot be removed.');
      return;
    }
    if (confirm('Are you sure you want to delete this Fee Head? This will reset custom rates for this head in all grades.')) {
      const updated = feeHeads.filter(h => h.id !== id);
      setFeeHeads(updated);
      localStorage.setItem('fee_heads', JSON.stringify(updated));
      await updateCentralKey('fee_heads', updated);
    }
  };

  // 7. Fee Structures Management
  const handleSaveStructure = async () => {
    const existingIndex = feeStructures.findIndex(fs => fs.grade === structureGrade);
    const updatedStructures = [...feeStructures];

    const currentStructure: FeeStructure = {
      grade: structureGrade,
      heads: structureForm
    };

    if (existingIndex !== -1) {
      updatedStructures[existingIndex] = currentStructure;
    } else {
      updatedStructures.push(currentStructure);
    }

    setFeeStructures(updatedStructures);
    localStorage.setItem('fee_structures', JSON.stringify(updatedStructures));
    await updateCentralKey('fee_structures', updatedStructures);

    setSaveStatus(`⚙️ Fee structures saved and verified for ${structureGrade}!`);
    setTimeout(() => setSaveStatus(null), 4000);
  };

  const handleStructureFormChange = (headId: string, value: number) => {
    setStructureForm(prev => ({
      ...prev,
      [headId]: value
    }));
  };

  // --- STATS ---
  const getOverallStats = () => {
    const totalCollected = savedFees.reduce((sum, f) => sum + f.totalPaid, 0);
    const advanceCollected = advanceRecords.reduce((sum, f) => sum + f.totalPaid, 0);
    const today = new Date().toISOString().split('T')[0];
    const todayCollected = savedFees
      .filter(f => f.paymentDate?.startsWith(today))
      .reduce((sum, f) => sum + f.totalPaid, 0);

    return {
      totalCollected: totalCollected + advanceCollected,
      todayCollected,
      totalTransactions: savedFees.length + advanceRecords.length,
      unpaidInstallments: installmentPlans.reduce((sum, plan) => 
        sum + plan.installments.filter(inst => inst.status === 'unpaid').length, 0
      )
    };
  };

  const stats = getOverallStats();

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-800 flex flex-col font-sans pb-16">
      
      {/* 1. Header (Dynamic Title & Description matching standard) */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-30 shadow-sm print:hidden">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition-all cursor-pointer text-slate-600 border border-slate-200 flex items-center justify-center"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs bg-blue-50 text-blue-800 border-blue-200">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-md font-extrabold text-slate-900 leading-snug">
                {subView === 'collections' && 'Fee Collections Counter'}
                {subView === 'scan-to-collect' && 'Smart Scan-To-Collect Scanner'}
                {subView === 'vouchers' && 'Fee Voucher Batch Generator'}
                {subView === 'advance-voucher' && 'Prepaid / Advance Fee Ledger'}
                {subView === 'split-installments' && 'Installment Splitter Planner'}
                {subView === 'heads' && 'Financial Fee Heads & Categories'}
                {subView === 'structures' && 'Curriculum Fee Structure Matrices'}
              </h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                {subView === 'collections' && 'آمدنی اور فیس وصولی کا مرکز'}
                {subView === 'scan-to-collect' && 'اسمارٹ کارڈ بارکوڈ اسکینر'}
                {subView === 'vouchers' && 'بیچ فیس واؤچر جنریٹر'}
                {subView === 'advance-voucher' && 'پیشگی فیس جمع کرنے کا کھاتہ'}
                {subView === 'split-installments' && 'قسط وار فیس پلانر'}
                {subView === 'heads' && 'فیسوں کے کھاتہ جات کی تفصیل'}
                {subView === 'structures' && 'مختلف درجات کے لئے فیسوں کا ڈھانچہ'}
              </p>
            </div>
          </div>
        </div>

        {/* Sync Status Label */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <span>Cloud Sync Active</span>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-6 pt-6 flex-1 space-y-6">
        
        {/* Save Status Banner */}
        {saveStatus && (
          <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-top duration-300 print:hidden">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <p>{saveStatus}</p>
          </div>
        )}

        {/* ==================== SUBVIEW 1: COLLECTIONS ==================== */}
        {subView === 'collections' && (
          <div className="space-y-6 print:hidden">
            {/* Tabs Bar */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab('collect')}
                className={`py-3 px-6 text-xs font-extrabold border-b-2 transition cursor-pointer flex items-center gap-2 ${
                  activeTab === 'collect'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>Receive Student Fee</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-3 px-6 text-xs font-extrabold border-b-2 transition cursor-pointer flex items-center gap-2 ${
                  activeTab === 'history'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Transaction Log Book</span>
              </button>
            </div>

            {activeTab === 'collect' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left panel: Search & Student Profile (5 columns) */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">SEARCH STUDENT REGISTER</h3>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleStudentSearch()}
                          placeholder="Type Name or Registration No..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
                        />
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      </div>
                      <button
                        onClick={handleStudentSearch}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition cursor-pointer"
                      >
                        Search
                      </button>
                    </div>

                    {/* Results Dropdown */}
                    {searchResults.length > 0 && (
                      <div className="mt-3 border border-slate-100 rounded-xl divide-y divide-slate-100 max-h-60 overflow-y-auto">
                        {searchResults.map(s => (
                          <div
                            key={s.id}
                            onClick={() => selectStudent(s)}
                            className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs font-bold transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-black">
                                {s.name[0]}
                              </div>
                              <div>
                                <h4 className="text-slate-800">{s.name}</h4>
                                <p className="text-[10px] text-slate-400 font-normal">Reg: {s.regNo} | Roll: {s.rollNo}</p>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 bg-slate-100 border rounded text-[9px]">{s.grade}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedStudent && (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                        <div className="w-14 h-14 bg-blue-100 text-blue-800 rounded-xl flex items-center justify-center text-xl font-black">
                          {selectedStudent.name[0]}
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-900">{selectedStudent.name}</h3>
                          <p className="text-xs font-mono font-bold text-slate-400">REG: {selectedStudent.regNo}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-600">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-[9px] text-slate-400 uppercase tracking-widest block">GRADE LEVEL</span>
                          <span className="text-slate-800">{selectedStudent.grade}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-[9px] text-slate-400 uppercase tracking-widest block">SECTION</span>
                          <span className="text-slate-800">{selectedStudent.section}</span>
                        </div>
                      </div>

                      <div className="bg-blue-50/40 p-4 border border-blue-100 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-blue-800">
                          <span className="flex items-center gap-1.5"><ClipboardList className="w-4 h-4" /> Auto-Structure Matching</span>
                          <span className="text-[10px] bg-blue-100 px-2 py-0.5 rounded uppercase">Active</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                          Custom fee values are pulled dynamically from active fee structures designed for {selectedStudent.grade}. You can overwrite manually if required.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right panel: Receipt entry Form (7 columns) */}
                <div className="lg:col-span-7">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">FEE COLLECTION COUNTER</h3>
                        <p className="text-xs text-slate-600 font-extrabold mt-1">Record student incoming funds below.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">Target Month:</span>
                        <select
                          value={selectedMonth}
                          onChange={e => setSelectedMonth(e.target.value)}
                          className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg outline-none"
                        >
                          {months.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {[
                        { label: 'Monthly Tuition Fee', field: 'monthlyFee', icon: Calendar },
                        { label: 'Admission Fee', field: 'admissionFee', icon: Plus },
                        { label: 'Books & Stationery', field: 'booksFee', icon: Receipt },
                        { label: 'Other Miscellaneous Charges', field: 'otherCharges', icon: Plus },
                        { label: 'Arrears (Pending Balance)', field: 'arrears', icon: History, color: 'text-rose-600' },
                        { label: 'Concession / Discount', field: 'discount', icon: Minus, color: 'text-emerald-600' },
                      ].map((input) => (
                        <div key={input.field} className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <input.icon className="w-3.5 h-3.5 text-blue-500" />
                            <span>{input.label}</span>
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              disabled={!selectedStudent}
                              value={feeForm[input.field as keyof typeof feeForm] || ''}
                              onChange={e => setFeeForm({ ...feeForm, [input.field]: Number(e.target.value) })}
                              placeholder="0"
                              className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-12 text-sm font-black outline-none focus:bg-white focus:border-blue-500 transition-all ${input.color || 'text-slate-800'}`}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">Rs.</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-6 bg-slate-50 border border-slate-200/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                      <div className="flex flex-col text-center sm:text-left">
                        <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">PAYABLE SUM TOTAL</span>
                        <h2 className="text-2xl font-black text-slate-900 mt-1">Rs. {calculateTotal().toLocaleString()}</h2>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-end">
                        <button
                          onClick={handlePrintSingleVoucher}
                          disabled={!selectedStudent}
                          className="px-5 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Print 3-Part Voucher</span>
                        </button>
                        <button
                          onClick={handleSaveCollection}
                          disabled={!selectedStudent}
                          className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Save & Print Official Receipt</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Sub tab: Transaction Log Book */}
            {activeTab === 'history' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">ACCOUNTS RECEIVABLES ARCHIVE</h3>
                    <p className="text-xs text-slate-500">Historical performance list of verified transactions.</p>
                  </div>
                  <div className="relative w-full sm:w-72">
                    <input
                      type="text"
                      value={historySearch}
                      onChange={e => setHistorySearch(e.target.value)}
                      placeholder="Filter by Student or Reg No..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-bold outline-none focus:bg-white focus:border-blue-500"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                        <th className="py-3 px-4">Receipt ID</th>
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">Month</th>
                        <th className="py-3 px-4 text-right">Tuition</th>
                        <th className="py-3 px-4 text-right">Arrears</th>
                        <th className="py-3 px-4 text-right">Discount</th>
                        <th className="py-3 px-4 text-right">Total Paid</th>
                        <th className="py-3 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                      {savedFees
                        .filter(f => 
                          f.studentName.toLowerCase().includes(historySearch.toLowerCase()) || 
                          f.regNo.includes(historySearch) || 
                          f.id.toString().includes(historySearch)
                        )
                        .map(f => (
                          <tr key={f.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-3 px-4 font-mono text-slate-400">#{f.id}</td>
                            <td className="py-3 px-4">
                              <div>
                                <span className="text-slate-800">{f.studentName}</span>
                                <span className="text-[10px] text-slate-400 block font-normal">Reg: {f.regNo} | {f.grade}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-500">{f.month}</td>
                            <td className="py-3 px-4 text-right text-slate-600">Rs. {f.monthlyFee}</td>
                            <td className="py-3 px-4 text-right text-rose-600">Rs. {f.arrears}</td>
                            <td className="py-3 px-4 text-right text-emerald-600">(-) Rs. {f.discount}</td>
                            <td className="py-3 px-4 text-right font-black text-slate-900">Rs. {f.totalPaid}</td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => {
                                  setReprintData(f);
                                  setTimeout(() => window.print(), 300);
                                }}
                                className="p-1.5 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-blue-600 rounded-lg transition"
                                title="Reprint Receipt"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== SUBVIEW 2: SCAN TO COLLECT ==================== */}
        {subView === 'scan-to-collect' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:hidden">
            
            {/* Left: Beautiful scanner graphic overlay (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col items-center justify-center space-y-6 min-h-[450px]">
              <div className="text-center">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">LASER QR CODE CARD READER</h3>
                <p className="text-xs text-slate-500 mt-1">Simulate scanning of RFID/Barcode student identification tags.</p>
              </div>

              {/* Dynamic Scanner Camera Box */}
              <div className="relative w-64 h-64 border-4 border-slate-900 rounded-2xl overflow-hidden bg-slate-950 flex flex-col items-center justify-center shadow-lg">
                {/* Laser line animation */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500/80 animate-bounce shadow-[0_0_15px_#f43f5e]" />
                
                {/* Scanner Target Guide */}
                <div className="w-44 h-44 border-2 border-dashed border-white/40 rounded-lg flex flex-col items-center justify-center relative">
                  <div className="absolute top-[-5px] left-[-5px] w-5 h-5 border-t-4 border-l-4 border-blue-500" />
                  <div className="absolute top-[-5px] right-[-5px] w-5 h-5 border-t-4 border-r-4 border-blue-500" />
                  <div className="absolute bottom-[-5px] left-[-5px] w-5 h-5 border-b-4 border-l-4 border-blue-500" />
                  <div className="absolute bottom-[-5px] right-[-5px] w-5 h-5 border-b-4 border-r-4 border-blue-500" />

                  {scannerStatus === 'scanning' ? (
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Verifying...</span>
                    </div>
                  ) : scannerStatus === 'success' ? (
                    <div className="flex flex-col items-center gap-2 bg-emerald-500/20 p-4 rounded-xl border border-emerald-500/30">
                      <Check className="w-8 h-8 text-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Success Match</span>
                    </div>
                  ) : scannerStatus === 'failed' ? (
                    <div className="flex flex-col items-center gap-2 bg-rose-500/20 p-4 rounded-xl border border-rose-500/30">
                      <AlertCircle className="w-8 h-8 text-rose-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Not Found</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <QrCode className="w-12 h-12 stroke-[1.5]" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Awaiting Card</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Manual input form fallback */}
              <form onSubmit={handleManualScanSubmit} className="flex gap-2 max-w-sm w-full">
                <input
                  type="text"
                  value={scannedRegNo}
                  onChange={e => setScannedRegNo(e.target.value)}
                  placeholder="Enter Registration / Roll No manually..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition"
                >
                  Simulate
                </button>
              </form>
            </div>

            {/* Right: Simulated cards selector sidebar (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AVAILABLE STUDENT BARCODES</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Click "Simulate Scan" to feed a student badge into the camera laser.</p>
              </div>

              <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
                {allStudents.map(s => (
                  <div key={s.id} className="py-3 flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600"><User className="w-4 h-4" /></div>
                      <div>
                        <h4 className="text-slate-800 leading-tight">{s.name}</h4>
                        <span className="text-[9px] text-slate-400 font-mono">REG: {s.regNo} | {s.grade}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSimulateScan(s)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-700 text-[10px] font-extrabold rounded-lg transition"
                    >
                      Simulate Scan
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ==================== SUBVIEW 3: VOUCHERS ==================== */}
        {subView === 'vouchers' && (
          <div className="space-y-6 print:hidden">
            
            {/* Bulk Generator Config Form */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">BATCH VOUCHER ENGINE</h3>
                <p className="text-xs text-slate-500 mt-1">Compile and print monthly bank fee vouchers in bulk for entire classrooms.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">TARGET CLASS</label>
                  <select
                    value={voucherGrade}
                    onChange={e => setVoucherGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold text-slate-700 focus:bg-white focus:border-blue-500"
                  >
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">BILLING MONTH</label>
                  <select
                    value={voucherMonth}
                    onChange={e => setVoucherMonth(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold text-slate-700 focus:bg-white focus:border-blue-500"
                  >
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">DUE DATE</label>
                  <input
                    type="date"
                    value={voucherDueDate}
                    onChange={e => setVoucherDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold text-slate-700 focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">LATE FEE PENALTY (Rs.)</label>
                  <input
                    type="number"
                    value={voucherFine}
                    onChange={e => setVoucherFine(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold text-slate-700 focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleGenerateBulkVouchers}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Generate Batch Vouchers</span>
                </button>
              </div>
            </div>

            {/* Roster list representation of generated vouchers */}
            {bulkVoucherList.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">GENERATED VOUCHER ROSTER</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{bulkVoucherList.length} total student vouchers compiled.</p>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Batch Vouchers</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                        <th className="py-3 px-4">Voucher No</th>
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">Month</th>
                        <th className="py-3 px-4">Due Date</th>
                        <th className="py-3 px-4 text-right">Sum Payable</th>
                        <th className="py-3 px-4 text-center">Late Fine</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                      {bulkVoucherList.map(v => (
                        <tr key={v.id}>
                          <td className="py-3 px-4 font-mono text-slate-400">#{v.id}</td>
                          <td className="py-3 px-4">{v.studentName} <span className="text-[10px] text-slate-400 block font-normal">REG: {v.regNo}</span></td>
                          <td className="py-3 px-4 text-slate-500">{v.month}</td>
                          <td className="py-3 px-4 text-slate-500">{v.dueDate}</td>
                          <td className="py-3 px-4 text-right font-black text-slate-900">Rs. {v.totalAmount}</td>
                          <td className="py-3 px-4 text-center text-rose-500">Rs. {v.fineAmount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ==================== SUBVIEW 4: ADVANCE VOUCHER ==================== */}
        {subView === 'advance-voucher' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:hidden">
            
            {/* Left: Input Selection & Generator form (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">ADVANCE PRE-PAYMENT LEDGER</h3>
                <p className="text-xs text-slate-500 mt-1">Pre-bill and secure future tuition credits in bulk blocks.</p>
              </div>

              {/* Student Search & Picker */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">1. SELECT ELIGIBLE STUDENT</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleStudentSearch()}
                      placeholder="Type name or roll number..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-bold outline-none"
                    />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                  </div>
                  <button
                    type="button"
                    onClick={handleStudentSearch}
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-black rounded-xl transition"
                  >
                    Select
                  </button>
                </div>

                {/* Inline matches */}
                {searchResults.length > 0 && (
                  <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 max-h-40 overflow-y-auto mt-2">
                    {searchResults.map(s => (
                      <div
                        key={s.id}
                        onClick={() => selectStudent(s)}
                        className="p-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs font-bold transition"
                      >
                        <span>{s.name} (REG: {s.regNo})</span>
                        <span className="text-[9px] bg-slate-100 px-2 rounded">{s.grade}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedStudent && (
                <form onSubmit={handleSaveAdvanceVoucher} className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">PRE-PAY BLOCKS (MONTHS)</label>
                      <select
                        value={advanceMonths}
                        onChange={e => setAdvanceMonths(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                      >
                        <option value="1">1 Month</option>
                        <option value="3">3 Months (Quarterly)</option>
                        <option value="6">6 Months (Half-Yearly)</option>
                        <option value="12">12 Months (Full-Yearly)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">STARTING FROM MONTH</label>
                      <select
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                      >
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">ADVANCE LUMP DISCOUNT (Rs.)</label>
                      <input
                        type="number"
                        value={advanceDiscount}
                        onChange={e => setAdvanceDiscount(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">CASHIER REMARKS</label>
                      <input
                        type="text"
                        value={advanceRemarks}
                        onChange={e => setAdvanceRemarks(e.target.value)}
                        placeholder="e.g. Paid in full by father"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between text-xs font-bold text-blue-900">
                    <div>
                      <span>Estimated Tuition Rate:</span>
                      <span className="font-mono block text-sm font-black text-blue-950 mt-1">
                        Rs. {(feeStructures.find(fs => fs.grade === selectedStudent.grade)?.heads['fh-1'] || 1500)} / Month
                      </span>
                    </div>
                    <div className="text-right">
                      <span>Lump Payable Due:</span>
                      <span className="font-mono block text-sm font-black text-blue-950 mt-1">
                        Rs. {((feeStructures.find(fs => fs.grade === selectedStudent.grade)?.heads['fh-1'] || 1500) * advanceMonths - advanceDiscount).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Issue Advance Voucher</span>
                    </button>
                  </div>
                </form>
              )}

              {!selectedStudent && (
                <div className="text-center p-12 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-500">Search and select a student above to construct pre-payments.</p>
                </div>
              )}
            </div>

            {/* Right: Active Prepaid list history (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">PREPAID ACCOUNTS REGISTRY</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Summary ledger of student advance fee credits.</p>
              </div>

              {advanceRecords.length === 0 ? (
                <p className="text-xs font-bold text-slate-400 italic text-center py-12">No pre-paid credits active yet.</p>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto">
                  {advanceRecords.map(rec => (
                    <div key={rec.id} className="py-3 flex items-center justify-between text-xs font-bold">
                      <div>
                        <h4 className="text-slate-800 leading-tight">{rec.studentName}</h4>
                        <span className="text-[9px] text-slate-400 block font-normal">{rec.monthsRange}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-600 block">Rs. {rec.totalPaid}</span>
                        <span className="text-[9px] text-slate-400 font-mono font-normal">No. #{rec.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ==================== SUBVIEW 5: SPLIT INSTALLMENTS ==================== */}
        {subView === 'split-installments' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:hidden">
            
            {/* Split Planner Generator (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">INSTALLMENT DIVISION MATRIX</h3>
                <p className="text-xs text-slate-500 mt-1">Split high fee headers or accumulated arrears into flexible installment plans.</p>
              </div>

              {/* Student Picker */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">SELECT TARGET STUDENT</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleStudentSearch()}
                      placeholder="Type name or reg number..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-bold outline-none"
                    />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                  </div>
                  <button
                    type="button"
                    onClick={handleStudentSearch}
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-black rounded-xl transition"
                  >
                    Select
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 max-h-40 overflow-y-auto mt-2">
                    {searchResults.map(s => (
                      <div
                        key={s.id}
                        onClick={() => selectStudent(s)}
                        className="p-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs font-bold transition"
                      >
                        <span>{s.name} (REG: {s.regNo})</span>
                        <span className="text-[9px] bg-slate-100 px-2 rounded">{s.grade}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedStudent && (
                <form onSubmit={handleSaveInstallmentPlan} className="space-y-6 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">TOTAL FEE TO SPLIT (Rs.)</label>
                      <input
                        type="number"
                        required
                        value={splitAmount || ''}
                        onChange={e => setSplitAmount(Number(e.target.value))}
                        placeholder="e.g. 6000"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">SPLIT DIVISION COUNT</label>
                      <select
                        value={splitParts}
                        onChange={e => setSplitParts(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                      >
                        <option value="2">2 Installments (50% each)</option>
                        <option value="3">3 Installments (33% each)</option>
                        <option value="4">4 Installments (25% each)</option>
                      </select>
                    </div>
                  </div>

                  {splitAmount > 0 && (
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">SET INSTALLMENT DUE DATES</label>
                      <div className="space-y-2">
                        {splitDates.map((date, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-xl border border-slate-150">
                            <span className="text-xs font-black text-slate-600">Installment #{idx + 1} (Rs. {Math.round(splitAmount / splitParts)})</span>
                            <input
                              type="date"
                              required
                              value={date}
                              onChange={e => {
                                const copy = [...splitDates];
                                copy[idx] = e.target.value;
                                setSplitDates(copy);
                              }}
                              className="px-3 py-1 bg-white border border-slate-200 text-xs font-bold rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Save Installment Plan</span>
                    </button>
                  </div>
                </form>
              )}

              {!selectedStudent && (
                <div className="text-center p-12 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <Columns className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-500">Select student to schedule installments.</p>
                </div>
              )}
            </div>

            {/* Installment History list (5 Cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">ACTIVE INSTALLMENT ROSTERS</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Track and update split bills progress.</p>
              </div>

              {installmentPlans.length === 0 ? (
                <p className="text-xs font-bold text-slate-400 italic text-center py-12">No active installment plans.</p>
              ) : (
                <div className="space-y-4 max-h-[420px] overflow-y-auto">
                  {installmentPlans.map(plan => (
                    <div key={plan.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold space-y-2">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <div>
                          <h4 className="text-slate-800">{plan.studentName}</h4>
                          <span className="text-[9px] text-slate-400 font-mono">REG: {plan.regNo}</span>
                        </div>
                        <span className="text-blue-700">Rs. {plan.totalAmount}</span>
                      </div>
                      <div className="space-y-1 text-[10px] font-bold">
                        {plan.installments.map(inst => (
                          <div key={inst.partNo} className="flex justify-between items-center text-slate-500">
                            <span>Part {inst.partNo}: Rs. {inst.amount}</span>
                            <span className="text-[9px] text-slate-400">Due: {inst.dueDate}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ==================== SUBVIEW 6: HEADS ==================== */}
        {subView === 'heads' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:hidden">
            
            {/* Create Fee Head form (5 Cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">CREATE NEW FEE CATEGORY HEAD</h3>
                <p className="text-xs text-slate-500 mt-1">Setup dynamic ledger entries to allocate in standard invoices.</p>
              </div>

              <form onSubmit={handleAddFeeHead} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">FEE CATEGORY NAME</label>
                  <input
                    type="text"
                    required
                    value={newHeadName}
                    onChange={e => setNewHeadName(e.target.value)}
                    placeholder="e.g. Sports Fee"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">SHORT CODE</label>
                  <input
                    type="text"
                    required
                    value={newHeadCode}
                    onChange={e => setNewHeadCode(e.target.value)}
                    placeholder="e.g. SPT"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">BILLING FREQUENCY</label>
                  <select
                    value={newHeadType}
                    onChange={e => setNewHeadType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="Monthly">Monthly Recurring</option>
                    <option value="One-Time">One-Time (On Admission/Graduation)</option>
                    <option value="Term-wise">Term-wise / Exam-wise</option>
                    <option value="Yearly">Yearly Annual Renewal</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">DEFAULT GLOBAL RATE (Rs.)</label>
                  <input
                    type="number"
                    required
                    value={newHeadAmount || ''}
                    onChange={e => setNewHeadAmount(Number(e.target.value))}
                    placeholder="e.g. 500"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-lg shadow-sm transition"
                >
                  Create Category Head
                </button>
              </form>
            </div>

            {/* List of active Fee Heads (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">ACTIVE CHARGES REGISTRY</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Verified fee categories allowed in student billing cycles.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Category Name</th>
                      <th className="py-3 px-4">Frequency</th>
                      <th className="py-3 px-4 text-right">Default Rate</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                    {feeHeads.map(h => (
                      <tr key={h.id} className="hover:bg-slate-50/40 transition">
                        <td className="py-3 px-4 font-mono text-slate-400">{h.code}</td>
                        <td className="py-3 px-4 text-slate-800">{h.name}</td>
                        <td className="py-3 px-4 text-slate-500">{h.type}</td>
                        <td className="py-3 px-4 text-right text-slate-900">Rs. {h.defaultAmount}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleDeleteFeeHead(h.id)}
                            disabled={h.id === 'fh-1'}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded disabled:opacity-35"
                            title="Delete Fee Head"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ==================== SUBVIEW 7: STRUCTURES ==================== */}
        {subView === 'structures' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6 print:hidden">
            
            {/* Grade Selection Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 pb-4">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">CURRICULUM BILLING MATRICES</h3>
                <p className="text-xs text-slate-500 mt-1">Associate custom default pricing maps per student Grade level.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Class/Grade:</span>
                <select
                  value={structureGrade}
                  onChange={e => setStructureGrade(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg outline-none"
                >
                  {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            {/* Interactive Structure Grid Mapping */}
            <div className="space-y-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">STRUCTURE MATRIX DETAILS FOR {structureGrade.toUpperCase()}</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {feeHeads.map(head => {
                  const val = structureForm[head.id] !== undefined ? structureForm[head.id] : head.defaultAmount;
                  return (
                    <div key={head.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-black text-slate-800 block">{head.name}</span>
                        <span className="text-[9px] text-slate-400 font-mono uppercase">Global default: Rs. {head.defaultAmount} | {head.type}</span>
                      </div>
                      <div className="relative w-36">
                        <input
                          type="number"
                          value={val || ''}
                          onChange={e => handleStructureFormChange(head.id, Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-3 pr-9 text-xs font-black outline-none"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">Rs.</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleSaveStructure}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Save Grade Structure Matrix</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ==================== 2. PRINTABLE OFFICAL RECEIPT TEMPLATE ==================== */}
      <div id="fee-receipt" className="hidden print:block bg-white w-full p-4 text-black font-sans">
        {reprintData && (
          <div className="border-4 border-slate-900 p-8 space-y-8">
            <div className="flex justify-between items-center border-b-2 border-slate-200 pb-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-2xl uppercase">
                  Edu
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tighter uppercase">EDUCORE SCHOOL SYSTEM</h1>
                  <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">Official Student Fee Receipt</p>
                </div>
              </div>
              <div className="text-right font-bold text-sm">
                <p>Date: {new Date(reprintData.paymentDate).toLocaleDateString()}</p>
                <p>Receipt No: #{reprintData.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 text-sm">
              <div className="space-y-2">
                <p><span className="text-slate-400 font-bold uppercase text-[10px] block">Student Name</span> <span className="font-bold text-lg">{reprintData.studentName}</span></p>
                <p><span className="text-slate-400 font-bold uppercase text-[10px] block">Registration No</span> <span className="font-bold">{reprintData.regNo}</span></p>
              </div>
              <div className="space-y-2 text-right">
                <p><span className="text-slate-400 font-bold uppercase text-[10px] block">Grade / Class</span> <span className="font-bold text-lg">{reprintData.grade}</span></p>
                <p><span className="text-slate-400 font-bold uppercase text-[10px] block">Billing Month</span> <span className="font-bold">{reprintData.month}</span></p>
              </div>
            </div>

            <table className="w-full border-collapse border-2 border-slate-900">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                  <th className="p-3 border-r border-slate-700 text-left">Description</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="font-bold text-sm">
                {reprintData.admissionFee > 0 && <tr><td className="p-3 border-b border-slate-150">Admission Fee</td><td className="p-3 text-right border-b border-slate-150">Rs. {reprintData.admissionFee}</td></tr>}
                {reprintData.monthlyFee > 0 && <tr><td className="p-3 border-b border-slate-150">Monthly Tuition Fee</td><td className="p-3 text-right border-b border-slate-150">Rs. {reprintData.monthlyFee}</td></tr>}
                {reprintData.booksFee > 0 && <tr><td className="p-3 border-b border-slate-150">Books & Stationery</td><td className="p-3 text-right border-b border-slate-150">Rs. {reprintData.booksFee}</td></tr>}
                {reprintData.otherCharges > 0 && <tr><td className="p-3 border-b border-slate-150">Other Miscellaneous Charges</td><td className="p-3 text-right border-b border-slate-150">Rs. {reprintData.otherCharges}</td></tr>}
                {reprintData.arrears > 0 && <tr><td className="p-3 border-b border-slate-150 text-rose-600">Arrears / Pending Balance</td><td className="p-3 text-right border-b border-slate-150 text-rose-600">Rs. {reprintData.arrears}</td></tr>}
                {reprintData.discount > 0 && <tr><td className="p-3 border-b border-slate-150 text-emerald-600">Concession / Discount</td><td className="p-3 text-right border-b border-slate-150 text-emerald-600">(-) Rs. {reprintData.discount}</td></tr>}
                <tr className="bg-slate-100 text-xl font-black">
                  <td className="p-4 uppercase tracking-tighter border-t border-slate-900">Total Sum Paid</td>
                  <td className="p-4 text-right border-t border-slate-900">Rs. {reprintData.totalPaid.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-between items-end pt-12">
              <div className="text-center">
                <div className="w-40 border-b-2 border-slate-950 mb-2"></div>
                <p className="text-[10px] font-black uppercase tracking-widest">Cashier Signature</p>
              </div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">Verification via EduCore System</p>
              <div className="text-center">
                <div className="w-40 border-b-2 border-slate-950 mb-2"></div>
                <p className="text-[10px] font-black uppercase tracking-widest">Director Signature</p>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 3. PRINTABLE BANK BULK VOUCHERS (3-PART LAYOUT) ==================== */}
        {((subView === 'vouchers' && bulkVoucherList.length > 0) || printVoucher) && (
          <div className="space-y-16">
            {(printVoucher ? [printVoucher] : bulkVoucherList).map((v, index) => (
              <div key={v.id} className="page-break grid grid-cols-3 gap-6 p-6 border-4 border-slate-900 font-sans text-black select-none text-[10px] leading-tight">
                
                {/* PART 1: BANK COPY */}
                <div className="border-r border-dashed border-slate-400 pr-6 space-y-4">
                  <div className="text-center space-y-1">
                    <h2 className="text-xs font-black">EDUCORE SCHOOL SYSTEM</h2>
                    <span className="px-1.5 py-0.5 bg-slate-900 text-white font-black uppercase text-[8px]">BANK COPY</span>
                  </div>
                  <div className="space-y-1 border-y border-slate-200 py-2 font-bold">
                    <p>Voucher #: <span className="font-mono text-xs">{v.id}</span></p>
                    <p>Student: <span>{v.studentName}</span></p>
                    <p>Reg No: <span className="font-mono">{v.regNo}</span></p>
                    <p>Class: <span>{v.grade}</span></p>
                    <p>Month: <span>{v.month}</span></p>
                    <p className="text-rose-600">Due Date: <span>{v.dueDate}</span></p>
                  </div>
                  <div className="space-y-1 font-bold">
                    <div className="flex justify-between border-b pb-1"><span>Details</span><span>Amount</span></div>
                    {v.details.map(d => (
                      <div key={d.name} className="flex justify-between text-slate-600">
                        <span>{d.name}</span>
                        <span>Rs. {d.amount}</span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t pt-1 font-black text-xs text-slate-900">
                      <span>Total Payable</span>
                      <span>Rs. {v.totalAmount}</span>
                    </div>
                    <div className="text-[8px] text-slate-500 font-normal leading-normal italic mt-2">
                      * Late fine of Rs. {v.fineAmount} applies automatically if paid after {v.dueDate}.
                    </div>
                  </div>
                </div>

                {/* PART 2: SCHOOL COPY */}
                <div className="border-r border-dashed border-slate-400 px-6 space-y-4">
                  <div className="text-center space-y-1">
                    <h2 className="text-xs font-black">EDUCORE SCHOOL SYSTEM</h2>
                    <span className="px-1.5 py-0.5 bg-slate-900 text-white font-black uppercase text-[8px]">SCHOOL COPY</span>
                  </div>
                  <div className="space-y-1 border-y border-slate-200 py-2 font-bold">
                    <p>Voucher #: <span className="font-mono text-xs">{v.id}</span></p>
                    <p>Student: <span>{v.studentName}</span></p>
                    <p>Reg No: <span className="font-mono">{v.regNo}</span></p>
                    <p>Class: <span>{v.grade}</span></p>
                    <p>Month: <span>{v.month}</span></p>
                    <p className="text-rose-600">Due Date: <span>{v.dueDate}</span></p>
                  </div>
                  <div className="space-y-1 font-bold">
                    <div className="flex justify-between border-b pb-1"><span>Details</span><span>Amount</span></div>
                    {v.details.map(d => (
                      <div key={d.name} className="flex justify-between text-slate-600">
                        <span>{d.name}</span>
                        <span>Rs. {d.amount}</span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t pt-1 font-black text-xs text-slate-900">
                      <span>Total Payable</span>
                      <span>Rs. {v.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* PART 3: STUDENT COPY */}
                <div className="pl-6 space-y-4">
                  <div className="text-center space-y-1">
                    <h2 className="text-xs font-black">EDUCORE SCHOOL SYSTEM</h2>
                    <span className="px-1.5 py-0.5 bg-slate-900 text-white font-black uppercase text-[8px]">STUDENT COPY</span>
                  </div>
                  <div className="space-y-1 border-y border-slate-200 py-2 font-bold">
                    <p>Voucher #: <span className="font-mono text-xs">{v.id}</span></p>
                    <p>Student: <span>{v.studentName}</span></p>
                    <p>Reg No: <span className="font-mono">{v.regNo}</span></p>
                    <p>Class: <span>{v.grade}</span></p>
                    <p>Month: <span>{v.month}</span></p>
                    <p className="text-rose-600">Due Date: <span>{v.dueDate}</span></p>
                  </div>
                  <div className="space-y-1 font-bold">
                    <div className="flex justify-between border-b pb-1"><span>Details</span><span>Amount</span></div>
                    {v.details.map(d => (
                      <div key={d.name} className="flex justify-between text-slate-600">
                        <span>{d.name}</span>
                        <span>Rs. {d.amount}</span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t pt-1 font-black text-xs text-slate-900">
                      <span>Total Payable</span>
                      <span>Rs. {v.totalAmount}</span>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* ==================== 4. PRINTABLE ADVANCE FEE RECEIPT ==================== */}
        {advanceReceipt && (
          <div className="border-4 border-slate-900 p-8 space-y-8 page-break text-black font-sans">
            <div className="flex justify-between items-center border-b-2 border-slate-200 pb-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-2xl uppercase">
                  Edu
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tighter uppercase">EDUCORE SCHOOL SYSTEM</h1>
                  <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">Prepaid / Advance Fee Receipt</p>
                </div>
              </div>
              <div className="text-right font-bold text-sm">
                <p>Date: {advanceReceipt.date}</p>
                <p>Receipt No: #{advanceReceipt.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 text-sm">
              <div className="space-y-2">
                <p><span className="text-slate-400 font-bold uppercase text-[10px] block">Student Name</span> <span className="font-bold text-lg">{advanceReceipt.studentName}</span></p>
                <p><span className="text-slate-400 font-bold uppercase text-[10px] block">Registration No</span> <span className="font-bold">{advanceReceipt.regNo}</span></p>
              </div>
              <div className="space-y-2 text-right">
                <p><span className="text-slate-400 font-bold uppercase text-[10px] block">Advance Blocks Logged</span> <span className="font-bold text-lg">{advanceReceipt.totalMonths} Months</span></p>
                <p><span className="text-slate-400 font-bold uppercase text-[10px] block">Payment range</span> <span className="font-bold">{advanceReceipt.monthsRange}</span></p>
              </div>
            </div>

            <table className="w-full border-collapse border-2 border-slate-900">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                  <th className="p-3 border-r border-slate-700 text-left">Description</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="font-bold text-sm">
                <tr>
                  <td className="p-3 border-b border-slate-150">Prepaid block charges ({advanceReceipt.totalMonths} months @ Rs. {advanceReceipt.monthlyRate}/mo)</td>
                  <td className="p-3 text-right border-b border-slate-150">Rs. {advanceReceipt.monthlyRate * advanceReceipt.totalMonths}</td>
                </tr>
                {advanceReceipt.discount > 0 && (
                  <tr>
                    <td className="p-3 border-b border-slate-150 text-emerald-600">Special Advance Lump Discount</td>
                    <td className="p-3 text-right border-b border-slate-150 text-emerald-600">(-) Rs. {advanceReceipt.discount}</td>
                  </tr>
                )}
                <tr className="bg-slate-100 text-xl font-black">
                  <td className="p-4 uppercase tracking-tighter border-t border-slate-900">Lump Credit Received</td>
                  <td className="p-4 text-right border-t border-slate-900">Rs. {advanceReceipt.totalPaid.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-between items-end pt-12">
              <div className="text-center">
                <div className="w-40 border-b-2 border-slate-950 mb-2"></div>
                <p className="text-[10px] font-black uppercase tracking-widest">Cashier Signature</p>
              </div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">{advanceReceipt.remarks}</p>
              <div className="text-center">
                <div className="w-40 border-b-2 border-slate-950 mb-2"></div>
                <p className="text-[10px] font-black uppercase tracking-widest">Director Signature</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          #fee-receipt, #fee-receipt * { visibility: visible; }
          #fee-receipt { position: absolute; left: 0; top: 0; width: 100%; }
          .page-break { page-break-after: always; break-after: page; }
        }
      `}} />

    </div>
  );
}
