import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Search, Printer, CreditCard, CheckCircle2, 
  Wallet, User, Calendar, Receipt, Plus, Minus, History, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { updateCentralKey } from '../syncService';
import { generateNumericId } from '../lib/idUtils';

interface FeesManagementProps {
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
  id?: number;
  studentId: number;
  studentName: string;
  regNo: string;
  month: string;
  admissionFee: number;
  monthlyFee: number;
  booksFee: number;
  otherCharges: number;
  arrears: number;
  discount: number;
  totalPaid: number;
  paymentDate?: string;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const FeesManagement: React.FC<FeesManagementProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dailyTotal, setDailyTotal] = useState({ dailyTotal: 0, count: 0 });
  const [printData, setPrintData] = useState<FeeTransaction | null>(null);

  const [feeForm, setFeeForm] = useState({
    admissionFee: 0,
    monthlyFee: 0,
    booksFee: 0,
    otherCharges: 0,
    arrears: 0,
    discount: 0
  });

  const [systemSettings, setSystemSettings] = useState(() => {
    const saved = localStorage.getItem('system_settings');
    return saved ? JSON.parse(saved) : { jamiaName: 'Professional School Portal', monogram: '' };
  });

  useEffect(() => {
    const fetchStudents = () => {
      try {
        const saved = localStorage.getItem('students');
        if (saved) {
          setAllStudents(JSON.parse(saved));
        }
      } catch (err) {
        console.error('Error fetching students:', err);
      }
    };

    fetchStudents();
    window.addEventListener('storage_updated', fetchStudents);
    return () => window.removeEventListener('storage_updated', fetchStudents);
  }, []);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setStudents([]);
      return;
    }
    const results = allStudents.filter((s: Student) => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.regNo?.includes(searchTerm) || 
      s.rollNo?.includes(searchTerm)
    );
    setStudents(results);
  };

  const selectStudent = (student: Student) => {
    setSelectedStudent(student);
    setStudents([]);
    setSearchTerm('');
  };

  const calculateTotal = () => {
    const { admissionFee, monthlyFee, booksFee, otherCharges, arrears, discount } = feeForm;
    return (admissionFee + monthlyFee + booksFee + otherCharges + arrears) - discount;
  };

  const handleSaveAndPrint = async () => {
    if (!selectedStudent) return;
    const total = calculateTotal();
    
    const transaction: FeeTransaction = {
      id: generateNumericId(),
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      regNo: selectedStudent.regNo,
      month: selectedMonth,
      ...feeForm,
      totalPaid: total,
      paymentDate: new Date().toISOString()
    };

    const existingFees = JSON.parse(localStorage.getItem('saved_fees') || '[]');
    const updatedFees = [...existingFees, transaction];
    
    localStorage.setItem('saved_fees', JSON.stringify(updatedFees));
    await updateCentralKey('saved_fees', updatedFees);
    
    setPrintData(transaction);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    setTimeout(() => window.print(), 500);
  };

  return (
    <div className="flex flex-col h-full bg-[#F4F7F6]" dir="ltr">
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 10 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Fee Saved Successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white border-b border-slate-100 p-6 shadow-sm print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="bg-slate-100 text-slate-600 p-2 rounded-xl hover:bg-slate-200 transition-all">
              <X className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Fees Management</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Student Financial Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="text-right">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Today's Collection</p>
                <h3 className="text-xl font-bold text-emerald-600">Rs. {dailyTotal.dailyTotal?.toLocaleString() || 0}</h3>
             </div>
             <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-3">
                <Calendar className="w-4 h-4 text-blue-600" />
                <select 
                  value={selectedMonth} 
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="bg-transparent text-blue-600 font-bold outline-none text-sm"
                >
                   {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 print:hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
               <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                 <Search className="w-4 h-4 text-blue-600" /> Search Student
               </h3>
               <div className="relative mb-4">
                  <input 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSearch()}
                    placeholder="Name or Reg No..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
               </div>
               <button onClick={handleSearch} className="w-full bg-blue-600 text-white py-3 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">Search</button>

               {students.length > 0 && (
                 <div className="mt-4 border-t border-slate-50 pt-4 space-y-2 max-h-60 overflow-y-auto">
                    {students.map(s => (
                      <div 
                        key={s.id} 
                        onClick={() => selectStudent(s)}
                        className="p-3 bg-slate-50 rounded-xl hover:bg-blue-50 cursor-pointer border border-transparent hover:border-blue-100 transition-all flex items-center gap-3"
                      >
                         <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600"><User className="w-4 h-4" /></div>
                         <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800">{s.name}</span>
                            <span className="text-[10px] text-slate-400">Roll: {s.rollNo} | Class: {s.grade}</span>
                         </div>
                      </div>
                    ))}
                 </div>
               )}
            </div>

            {selectedStudent && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-[#1e293b] p-6 rounded-3xl shadow-xl text-white relative overflow-hidden"
              >
                <div className="relative z-10">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-md border border-white/20 shadow-lg font-black text-xl uppercase">
                        {selectedStudent.name[0]}
                      </div>
                      <div className="flex flex-col">
                         <h4 className="text-lg font-bold tracking-tight">{selectedStudent.name}</h4>
                         <span className="text-xs text-white/50">Reg: {selectedStudent.regNo}</span>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                         <p className="text-white/30 mb-1 uppercase tracking-widest text-[9px]">Class</p>
                         <p>{selectedStudent.grade}</p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                         <p className="text-white/30 mb-1 uppercase tracking-widest text-[9px]">Section</p>
                         <p>{selectedStudent.section}</p>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
               <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-3">
                 <div className="w-2 h-8 bg-blue-600 rounded-full" />
                 Fee Collection Entry
               </h3>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FeeInput label="Monthly Fee" icon={Calendar} value={feeForm.monthlyFee} onChange={v => setFeeForm({...feeForm, monthlyFee: v})} />
                  <FeeInput label="Admission Fee" icon={Plus} value={feeForm.admissionFee} onChange={v => setFeeForm({...feeForm, admissionFee: v})} />
                  <FeeInput label="Books & Stationery" icon={Receipt} value={feeForm.booksFee} onChange={v => setFeeForm({...feeForm, booksFee: v})} />
                  <FeeInput label="Other Charges" icon={Plus} value={feeForm.otherCharges} onChange={v => setFeeForm({...feeForm, otherCharges: v})} />
                  <FeeInput label="Arrears (Pending)" icon={History} value={feeForm.arrears} onChange={v => setFeeForm({...feeForm, arrears: v})} color="text-red-500" />
                  <FeeInput label="Discount" icon={Minus} value={feeForm.discount} onChange={v => setFeeForm({...feeForm, discount: v})} color="text-emerald-600" />
               </div>

               <div className="mt-12 p-8 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex flex-col">
                     <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Amount</span>
                     <h2 className="text-4xl font-black text-slate-800">Rs. {calculateTotal().toLocaleString()}</h2>
                  </div>
                  <button 
                    onClick={handleSaveAndPrint}
                    disabled={!selectedStudent}
                    className="bg-blue-600 text-white px-10 py-5 rounded-3xl font-bold text-lg flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 disabled:opacity-50 disabled:shadow-none active:scale-95"
                  >
                    <Printer className="w-6 h-6" />
                    <span>Save & Print Receipt</span>
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div id="fee-receipt" className="hidden print:block bg-white w-full p-4 text-black">
         {printData && selectedStudent && (
           <ReceiptLayout data={printData} student={selectedStudent} settings={systemSettings} />
         )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
           body * { visibility: hidden; }
           #fee-receipt, #fee-receipt * { visibility: visible; }
           #fee-receipt { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}} />
    </div>
  );
};

const FeeInput = ({ label, icon: Icon, value, onChange, color = "text-slate-700" }: any) => (
  <div className="space-y-3">
    <label className="text-xs font-bold text-slate-500 flex items-center gap-2">
       <Icon className="w-4 h-4 text-blue-600" /> {label}
    </label>
    <div className="relative">
       <input 
         type="number"
         value={value || ''}
         onChange={e => onChange(Number(e.target.value))}
         className={`w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-xl font-black outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${color}`}
         placeholder="0"
       />
       <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 text-xs font-bold">Rs.</span>
    </div>
  </div>
);

const ReceiptLayout = ({ data, student, settings }: any) => (
  <div className="border-4 border-slate-900 p-8 space-y-8">
     <div className="flex justify-between items-center border-b-2 border-slate-200 pb-6">
        <div className="flex items-center gap-6">
           {settings.monogram && <img src={settings.monogram} className="w-20 h-20 object-contain" />}
           <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase">{settings.jamiaName}</h1>
              <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">Student Fee Receipt</p>
           </div>
        </div>
        <div className="text-right font-bold text-sm">
           <p>Date: {new Date().toLocaleDateString()}</p>
           <p>No: {data.id}</p>
        </div>
     </div>

     <div className="grid grid-cols-2 gap-8 text-sm">
        <div className="space-y-2">
           <p><span className="text-slate-400 font-bold uppercase text-[10px] block">Student Name</span> <span className="font-bold text-lg">{student.name}</span></p>
           <p><span className="text-slate-400 font-bold uppercase text-[10px] block">Registration No</span> <span className="font-bold">{student.regNo}</span></p>
        </div>
        <div className="space-y-2 text-right">
           <p><span className="text-slate-400 font-bold uppercase text-[10px] block">Grade / Class</span> <span className="font-bold text-lg">{student.grade}</span></p>
           <p><span className="text-slate-400 font-bold uppercase text-[10px] block">Month</span> <span className="font-bold">{data.month}</span></p>
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
           {data.admissionFee > 0 && <tr><td className="p-3 border-b border-slate-100">Admission Fee</td><td className="p-3 text-right border-b border-slate-100">Rs. {data.admissionFee}</td></tr>}
           {data.monthlyFee > 0 && <tr><td className="p-3 border-b border-slate-100">Monthly Tuition Fee</td><td className="p-3 text-right border-b border-slate-100">Rs. {data.monthlyFee}</td></tr>}
           {data.booksFee > 0 && <tr><td className="p-3 border-b border-slate-100">Books & Stationery</td><td className="p-3 text-right border-b border-slate-100">Rs. {data.booksFee}</td></tr>}
           {data.otherCharges > 0 && <tr><td className="p-3 border-b border-slate-100">Other Charges</td><td className="p-3 text-right border-b border-slate-100">Rs. {data.otherCharges}</td></tr>}
           {data.arrears > 0 && <tr><td className="p-3 border-b border-slate-100 text-red-600">Arrears / Pending</td><td className="p-3 text-right border-b border-slate-100 text-red-600">Rs. {data.arrears}</td></tr>}
           {data.discount > 0 && <tr><td className="p-3 border-b border-slate-100 text-emerald-600">Discount</td><td className="p-3 text-right border-b border-slate-100 text-emerald-600">(-) Rs. {data.discount}</td></tr>}
           <tr className="bg-slate-50 text-xl font-black">
              <td className="p-4 uppercase tracking-tighter">Total Paid</td>
              <td className="p-4 text-right">Rs. {data.totalPaid.toLocaleString()}</td>
           </tr>
        </tbody>
     </table>

     <div className="flex justify-between items-end pt-12">
        <div className="text-center">
           <div className="w-40 border-b-2 border-slate-900 mb-2"></div>
           <p className="text-[10px] font-black uppercase tracking-widest">Cashier Signature</p>
        </div>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">Verification via School System</p>
        <div className="text-center">
           <div className="w-40 border-b-2 border-slate-900 mb-2"></div>
           <p className="text-[10px] font-black uppercase tracking-widest">Director Signature</p>
        </div>
     </div>
  </div>
);

export default FeesManagement;
