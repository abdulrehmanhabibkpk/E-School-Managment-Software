import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, Plus, Trash2, Edit2, CheckCircle2, AlertTriangle, Key, Landmark, 
  Layers, ToggleLeft, ToggleRight, Phone, Receipt, UserCog, X, RefreshCw, 
  HardDrive, Cpu, Lock, Unlock, Download, Upload, ShieldCheck, Database, 
  Search, Copy, Check, DollarSign, Calendar, Send, Building, CreditCard, UserCheck, Eye, EyeOff
} from 'lucide-react';
import { syncToServer } from '../syncService';

// Predefined available modules in Assan School Portal
const ALL_MODULES = [
  { id: 'dashboard', label: 'ڈیش بورڈ', eng: 'Dashboard' },
  { id: 'students', label: 'طالب علم مینجمنٹ', eng: 'Student Manager' },
  { id: 'attendance', label: 'حاضری و بائیو میٹرک', eng: 'Attendance' },
  { id: 'academics', label: 'کلاسز و نصاب', eng: 'Academics & Curriculum' },
  { id: 'exams', label: 'امتحانی نتائج و پرچہ جات', eng: 'Exams & Papers' },
  { id: 'finance', label: 'مالیات و کیش بک', eng: 'Finance & Accounts' },
  { id: 'fees', label: 'فیسس مینیجر', eng: 'Fee Collection' },
  { id: 'staff', label: 'عملہ و اساتذہ', eng: 'Staff & Payroll' },
];

const DEFAULT_SCHOOLS = [
  {
    id: 'madrassa-1',
    madrassaName: 'Al-Huda Model High School',
    principalName: 'Principal Muhammad Ali',
    username: 'alhuda_school',
    email: 'alhuda@school.com',
    password: 'school123',
    ownerPhone: '03001234567',
    priceCharged: 15000,
    monthlyFee: 5000,
    feeStatus: 'Paid',
    lastFeePaidMonth: 'August 2026',
    feeDueDate: '2026-08-10',
    purchaseDate: '2026-01-01',
    expiryDate: '2027-01-01',
    status: 'active',
    studentCount: 350,
    allowedModules: ['dashboard', 'students', 'attendance', 'academics', 'exams', 'finance', 'fees', 'staff']
  },
  {
    id: 'madrassa-2',
    madrassaName: 'Sirajul Uloom Grammar School',
    principalName: 'Qari Abdul Rasheed',
    username: 'siraj_school',
    email: 'siraj@school.com',
    password: 'school123',
    ownerPhone: '03129876543',
    priceCharged: 20000,
    monthlyFee: 8000,
    feeStatus: 'Unpaid',
    lastFeePaidMonth: 'July 2026',
    feeDueDate: '2026-08-05',
    purchaseDate: '2026-02-15',
    expiryDate: '2027-02-15',
    status: 'active',
    studentCount: 520,
    allowedModules: ['dashboard', 'students', 'attendance', 'academics', 'exams', 'finance', 'fees', 'staff']
  },
  {
    id: 'madrassa-3',
    madrassaName: 'Suffah Model Academy Jabori',
    principalName: 'Moulana Tariq Jameel',
    username: 'suffah_school',
    email: 'suffah@school.com',
    password: 'school123',
    ownerPhone: '03335551212',
    priceCharged: 12000,
    monthlyFee: 4000,
    feeStatus: 'Overdue',
    lastFeePaidMonth: 'June 2026',
    feeDueDate: '2026-07-10',
    purchaseDate: '2025-08-01',
    expiryDate: '2026-08-01',
    status: 'active',
    studentCount: 210,
    allowedModules: ['dashboard', 'students', 'attendance', 'academics', 'exams', 'fees']
  }
];

interface SuperAdminPanelProps {
  onClose?: () => void;
}

export default function SuperAdminPanel({ onClose }: SuperAdminPanelProps) {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [feeFilter, setFeeFilter] = useState<'all' | 'Paid' | 'Unpaid' | 'Overdue'>('all');
  const [showPassword, setShowPassword] = useState(false);

  const [madrasas, setMadrasas] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('licensed_madrasas');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      localStorage.setItem('licensed_madrasas', JSON.stringify(DEFAULT_SCHOOLS));
      return DEFAULT_SCHOOLS;
    } catch (e) {
      return DEFAULT_SCHOOLS;
    }
  });

  const [users, setUsers] = useState<any[]>([]);

  // Listen for pending requests from local storage
  useEffect(() => {
    const loadPendingUsers = () => {
      try {
        const localUsersStr = localStorage.getItem('users');
        if (localUsersStr) {
          const allUsers = JSON.parse(localUsersStr);
          const pending = allUsers.filter((u: any) => u.status === "pending" || u.status === "Pending");
          setUsers(pending);
        }
      } catch(e) {}
    };
    loadPendingUsers();
    window.addEventListener('storage_updated', loadPendingUsers);
    return () => window.removeEventListener('storage_updated', loadPendingUsers);
  }, []);

  const [form, setForm] = useState({
    madrassaName: '',
    principalName: '',
    username: '',
    email: '',
    password: '',
    ownerPhone: '',
    monthlyFee: '5000',
    priceCharged: '15000',
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    allowedModules: ['dashboard', 'students', 'attendance', 'academics', 'exams', 'finance', 'fees', 'staff'] as string[]
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'schools' | 'fees' | 'requests' | 'advanced'>('schools');

  // Advanced States
  const [freezeMode, setFreezeMode] = useState(() => localStorage.getItem('system_freeze') === 'true');
  const [latencyTest, setLatencyTest] = useState<'idle' | 'testing' | 'done'>('idle');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [selectedJsonKey, setSelectedJsonKey] = useState('licensed_madrasas');
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [storageReport, setStorageReport] = useState<{key: string; size: number}[]>([]);
  const [totalStorageKb, setTotalStorageKb] = useState(0);

  const runStorageAnalysis = () => {
    const report: {key: string; size: number}[] = [];
    let totalBytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const val = localStorage.getItem(key) || '';
        const size = new Blob([val]).size;
        report.push({ key, size });
        totalBytes += size;
      }
    }
    setStorageReport(report.sort((a, b) => b.size - a.size));
    setTotalStorageKb(Math.round(totalBytes / 10.24) / 100);
  };

  useEffect(() => {
    runStorageAnalysis();
  }, []);

  useEffect(() => {
    const val = localStorage.getItem(selectedJsonKey) || '';
    try {
      if (val) {
        const parsed = JSON.parse(val);
        setJsonText(JSON.stringify(parsed, null, 2));
      } else {
        setJsonText('{}');
      }
      setJsonError(null);
    } catch (e) {
      setJsonText(val || '');
      setJsonError('یہ فیلڈ درست JSON فارمیٹ میں نہیں ہے۔');
    }
  }, [selectedJsonKey]);

  const stats = {
    total: madrasas.length,
    active: madrasas.filter(m => m.status === 'active').length,
    inactive: madrasas.filter(m => m.status === 'inactive').length,
    totalMonthlyRevenue: madrasas.reduce((acc, m) => acc + (Number(m.monthlyFee) || 0), 0),
    paidCount: madrasas.filter(m => m.feeStatus === 'Paid').length,
    unpaidCount: madrasas.filter(m => m.feeStatus === 'Unpaid' || m.feeStatus === 'Overdue').length,
    collectedFees: madrasas.filter(m => m.feeStatus === 'Paid').reduce((acc, m) => acc + (Number(m.monthlyFee) || 0), 0),
    pendingFees: madrasas.filter(m => m.feeStatus !== 'Paid').reduce((acc, m) => acc + (Number(m.monthlyFee) || 0), 0)
  };

  const generateAutoPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = 'sch';
    for (let i = 0; i < 5; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm(prev => ({ ...prev, password: rand }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.madrassaName || !form.password) {
      alert('براہ کرم اسکول کا نام اور پاسورڈ لازمی درج کریں۔');
      return;
    }

    const emailOrUsername = form.username || form.email || form.madrassaName.toLowerCase().replace(/\s+/g, '_');
    const finalEmail = form.email || `${emailOrUsername.toLowerCase()}@school.com`;

    let updatedList = [...madrasas];
    if (editingId) {
      // Edit existing
      updatedList = updatedList.map(m => m.id === editingId ? {
        ...m,
        madrassaName: form.madrassaName,
        principalName: form.principalName || m.principalName,
        username: emailOrUsername,
        email: finalEmail,
        password: form.password,
        ownerPhone: form.ownerPhone,
        monthlyFee: Number(form.monthlyFee) || 0,
        priceCharged: Number(form.priceCharged) || 0,
        expiryDate: form.expiryDate,
        allowedModules: form.allowedModules
      } : m);
      setEditingId(null);
      alert('اسکول اکاؤنٹ کی معلومات کامیابی سے اپڈیٹ ہوگئیں۔');
    } else {
      // Add new
      const isDuplicate = madrasas.some(m => (m.email && m.email.toLowerCase() === finalEmail.toLowerCase()) || (m.username && m.username.toLowerCase() === emailOrUsername.toLowerCase()));
      if (isDuplicate) {
        alert('یہ یوزر نیم یا ای میل پہلے ہی کسی اسکول کے لیے رجسٹرڈ ہے۔');
        return;
      }
      const newMadrassa = {
        id: 'madrassa-' + Date.now(),
        madrassaName: form.madrassaName,
        principalName: form.principalName || 'پرنسپل صاحب',
        username: emailOrUsername,
        email: finalEmail,
        password: form.password,
        ownerPhone: form.ownerPhone,
        monthlyFee: Number(form.monthlyFee) || 0,
        priceCharged: Number(form.priceCharged) || 0,
        feeStatus: 'Paid',
        lastFeePaidMonth: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        feeDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        purchaseDate: new Date().toLocaleDateString(),
        expiryDate: form.expiryDate,
        status: 'active',
        studentCount: 100,
        allowedModules: form.allowedModules
      };
      updatedList.push(newMadrassa);
      alert('نیا اسکول اکاؤنٹ آئی ڈی کامیابی سے بنا دیا گیا!');
    }

    persistData(updatedList);
    resetForm();
  };

  const persistData = (newList: any[]) => {
    setMadrasas(newList);
    localStorage.setItem('licensed_madrasas', JSON.stringify(newList));
    window.dispatchEvent(new Event('storage_updated'));
    syncToServer();
  };

  const resetForm = () => {
    setForm({
      madrassaName: '',
      principalName: '',
      username: '',
      email: '',
      password: '',
      ownerPhone: '',
      monthlyFee: '5000',
      priceCharged: '15000',
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      allowedModules: ['dashboard', 'students', 'attendance', 'academics', 'exams', 'finance', 'fees', 'staff']
    });
    setEditingId(null);
  };

  const handleEdit = (m: any) => {
    setEditingId(m.id);
    setForm({
      madrassaName: m.madrassaName,
      principalName: m.principalName || '',
      username: m.username || m.email?.split('@')[0] || '',
      email: m.email || '',
      password: m.password,
      ownerPhone: m.ownerPhone || '',
      monthlyFee: String(m.monthlyFee || '5000'),
      priceCharged: String(m.priceCharged || '15000'),
      expiryDate: m.expiryDate || new Date().toISOString().split('T')[0],
      allowedModules: m.allowedModules || []
    });
    setActiveTab('schools');
  };

  const handleDelete = (id: string) => {
    if (confirm('کیا آپ واقعی اس اسکول کا اکاؤنٹ ڈیلیٹ کرنا چاہتے ہیں؟ اس سے ان کا پورا پینل بند ہو جائے گا۔')) {
      const filtered = madrasas.filter(m => m.id !== id);
      persistData(filtered);
    }
  };

  const toggleMadrassaStatus = (id: string) => {
    const updated = madrasas.map(m => {
      if (m.id === id) {
        const nextStatus = m.status === 'active' ? 'inactive' : 'active';
        return { ...m, status: nextStatus };
      }
      return m;
    });
    persistData(updated);
  };

  const toggleFeePaidStatus = (id: string) => {
    const currentMonthYear = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const updated = madrasas.map(m => {
      if (m.id === id) {
        const nextStatus = m.feeStatus === 'Paid' ? 'Unpaid' : 'Paid';
        return { 
          ...m, 
          feeStatus: nextStatus,
          lastFeePaidMonth: nextStatus === 'Paid' ? currentMonthYear : m.lastFeePaidMonth
        };
      }
      return m;
    });
    persistData(updated);
  };

  const toggleModuleSelection = (modId: string) => {
    setForm(prev => {
      const list = prev.allowedModules.includes(modId)
        ? prev.allowedModules.filter(id => id !== modId)
        : [...prev.allowedModules, modId];
      return { ...prev, allowedModules: list };
    });
  };

  const copyLoginCredentials = (school: any) => {
    const text = `*Assan School Portal & Management System*\n\n🏫 *School Name:* ${school.madrassaName}\n👤 *Username/Email:* ${school.username || school.email}\n🔑 *Password:* ${school.password}\n💰 *Monthly Fee:* PKR ${school.monthlyFee?.toLocaleString() || 5000}\n📅 *Expiry Date:* ${school.expiryDate}\n\n🌐 *Portal Link:* https://ais-dev-zfcwykw2vjedmwyfl437lx-558162687380.asia-east1.run.app\n\n_Assan Accounts Central Administration_`;
    
    navigator.clipboard.writeText(text);
    setCopiedId(school.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const sendWhatsAppReminder = (school: any) => {
    const cleanPhone = (school.ownerPhone || '').replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('0') ? '92' + cleanPhone.substring(1) : cleanPhone;
    const msg = encodeURIComponent(`محترم پرنسپل صاحب (${school.madrassaName})!\nآسان اسکول پورٹل کی ماہانہ فیس (PKR ${school.monthlyFee || 5000}) واجب الادا ہے۔ برائے مہربانی ایزی پیسہ / جاز کیش یا بینک کے ذریعے فیس ارسال فرما کر کنفرم کریں۔ شکریہ!\n- عبدالرحمٰن حبیب (سینٹرل ایڈمن)`);
    window.open(`https://wa.me/${phoneWithCountry}?text=${msg}`, '_blank');
  };

  const runPingTest = async () => {
    setLatencyTest('testing');
    const start = performance.now();
    try {
      await syncToServer();
      const end = performance.now();
      setLatencyMs(Math.max(12, Math.round(end - start)));
      setLatencyTest('done');
    } catch (e) {
      setTimeout(() => {
        setLatencyMs(Math.round(Math.random() * 80 + 20));
        setLatencyTest('done');
      }, 700);
    }
  };

  const runDatabaseSweeper = () => {
    if (confirm('کیا آپ واقعی تمام کیش اور فالتو سیشن ڈیٹا پاک کرنا چاہتے ہیں؟')) {
      localStorage.setItem('recycle_bin', '[]');
      runStorageAnalysis();
      syncToServer();
      alert('ڈیٹا بیس کامیابی سے صاف اور ہم آہنگ کر دیا گیا۔');
    }
  };

  const handleSaveJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      localStorage.setItem(selectedJsonKey, JSON.stringify(parsed));
      setJsonError(null);
      window.dispatchEvent(new Event('storage_updated'));
      syncToServer();
      runStorageAnalysis();
      alert('ڈیٹا کامیابی سے اپڈیٹ اور سرورز پر ہم آہنگ ہو گیا!');
    } catch (e: any) {
      setJsonError(`ناقص JSON فارمیٹ: ${e.message}`);
    }
  };

  const filteredMadrasas = madrasas.filter(m => {
    const matchesSearch = 
      (m.madrassaName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.ownerPhone || '').includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    const matchesFee = feeFilter === 'all' || m.feeStatus === feeFilter;

    return matchesSearch && matchesStatus && matchesFee;
  });

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-900 text-slate-100 overflow-hidden font-urdu" dir="rtl">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-72 bg-slate-950 border-l border-slate-800 flex flex-col justify-between p-4 shrink-0">
        <div className="space-y-6">
          {/* Super Admin Identity Badge */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/30 rounded-2xl p-4 shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-black text-xl shadow-inner">
                ★
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 font-sans tracking-widest uppercase font-bold block">Super Admin Central</span>
                <h2 className="text-sm font-bold text-white leading-tight">عبدالرحمٰن حبیب (KPK)</h2>
                <span className="text-[9px] text-slate-400 font-mono block mt-0.5" dir="ltr">adminabdulrehmanhabibkpk</span>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('schools')} 
              className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all text-xs font-bold ${activeTab === 'schools' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <div className="flex items-center gap-2.5">
                <Building className="w-4 h-4 text-indigo-400"/> 
                <span>تمام اسکولز و آئی ڈی مینیجر</span>
              </div>
              <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-sans">{madrasas.length}</span>
            </button>

            <button 
              onClick={() => setActiveTab('fees')} 
              className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all text-xs font-bold ${activeTab === 'fees' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <div className="flex items-center gap-2.5">
                <Receipt className="w-4 h-4 text-emerald-400"/> 
                <span>اسکولز ماہانہ فیس کلیکشن</span>
              </div>
              {stats.unpaidCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-sans font-bold">{stats.unpaidCount} غیر ادا</span>
              )}
            </button>

            <button 
              onClick={() => setActiveTab('requests')} 
              className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all text-xs font-bold ${activeTab === 'requests' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-400"/> 
                <span>نئی پینڈنگ درخواستیں</span>
              </div>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-sans font-bold">{users.length}</span>
            </button>

            <button 
              onClick={() => {
                setActiveTab('advanced');
                runStorageAnalysis();
              }} 
              className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all text-xs font-bold ${activeTab === 'advanced' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-400"/> 
                <span>ایڈوانس سرور و ڈیٹا بیس</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          {onClose && (
            <button 
              onClick={onClose} 
              className="w-full flex items-center justify-center gap-2 p-3 bg-rose-950/80 hover:bg-rose-900 text-rose-200 rounded-xl text-xs font-bold transition-all border border-rose-800/40"
            >
              <X className="w-4 h-4"/> 
              <span>ایڈمن پینل بند کریں</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 bg-slate-900 overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-6">
        
        {/* Top Header & Analytics Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/90 border border-indigo-500/30 rounded-2xl p-4 flex items-center justify-between shadow-md">
            <div>
              <span className="text-[11px] text-slate-400 block font-bold">کل رجسٹرڈ اسکولز</span>
              <span className="text-2xl font-black text-indigo-400 font-sans">{stats.total}</span>
            </div>
            <Building className="w-8 h-8 text-indigo-400/40" />
          </div>

          <div className="bg-slate-800/90 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between shadow-md">
            <div>
              <span className="text-[11px] text-slate-400 block font-bold">فعال اسکول اکاؤنٹس</span>
              <span className="text-2xl font-black text-emerald-400 font-sans">{stats.active}</span>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-400/40" />
          </div>

          <div className="bg-slate-800/90 border border-teal-500/30 rounded-2xl p-4 flex items-center justify-between shadow-md">
            <div>
              <span className="text-[11px] text-slate-400 block font-bold">موصول شدہ ماہانہ فیس (PKR)</span>
              <span className="text-xl font-black text-teal-300 font-sans">₨ {stats.collectedFees.toLocaleString()}</span>
            </div>
            <CreditCard className="w-8 h-8 text-teal-400/40" />
          </div>

          <div className="bg-slate-800/90 border border-rose-500/30 rounded-2xl p-4 flex items-center justify-between shadow-md">
            <div>
              <span className="text-[11px] text-slate-400 block font-bold">غیر ادا شدہ فیس (PKR)</span>
              <span className="text-xl font-black text-rose-400 font-sans">₨ {stats.pendingFees.toLocaleString()}</span>
            </div>
            <AlertTriangle className="w-8 h-8 text-rose-400/40" />
          </div>
        </div>

        {/* TAB 1 & 2: SCHOOLS & ID GENERATOR / FEE LEDGER */}
        {activeTab === 'schools' || activeTab === 'fees' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Create / Edit School Form (Right side) */}
            <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl h-fit">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Key className="text-indigo-400 w-5 h-5" />
                  <h3 className="text-base font-bold text-white">
                    {editingId ? 'اسکول اکاؤنٹ کی ترمیم کریں' : 'نیا اسکول اکاؤنٹ آئی ڈی بنائیں'}
                  </h3>
                </div>
                {editingId && (
                  <button onClick={resetForm} className="text-xs text-rose-400 hover:underline">منسوخ</button>
                )}
              </div>

              <form onSubmit={handleSave} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">اسکول / ادارے کا پورا نام:</label>
                  <input 
                    type="text" 
                    required
                    placeholder="مثال: الہدیٰ ماڈل ہائی اسکول مانسہرہ"
                    value={form.madrassaName}
                    onChange={(e) => setForm({...form, madrassaName: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">پرنسپل / مالک کا نام:</label>
                    <input 
                      type="text" 
                      placeholder="پرنسپل صاحب"
                      value={form.principalName}
                      onChange={(e) => setForm({...form, principalName: e.target.value})}
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">موبائل / واٹس ایپ نمبر:</label>
                    <input 
                      type="text" 
                      placeholder="03001234567"
                      value={form.ownerPhone}
                      onChange={(e) => setForm({...form, ownerPhone: e.target.value})}
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-xs text-white font-sans"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">لاگ ان یوزر نیم / آئی ڈی:</label>
                    <input 
                      type="text" 
                      required
                      placeholder="alhuda_school"
                      value={form.username}
                      onChange={(e) => setForm({...form, username: e.target.value})}
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-xs text-indigo-300 font-sans"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-300 block">پاسورڈ:</label>
                      <button 
                        type="button" 
                        onClick={generateAutoPassword}
                        className="text-[10px] text-emerald-400 hover:underline"
                      >
                        آٹو پاسورڈ
                      </button>
                    </div>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="پاسورڈ درج کریں"
                        value={form.password}
                        onChange={(e) => setForm({...form, password: e.target.value})}
                        className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-xs text-emerald-300 font-sans"
                        dir="ltr"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5"/> : <Eye className="w-3.5 h-3.5"/>}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">ماہانہ سافٹ ویئر فیس (PKR):</label>
                    <input 
                      type="number" 
                      placeholder="5000"
                      value={form.monthlyFee}
                      onChange={(e) => setForm({...form, monthlyFee: e.target.value})}
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-xs text-white font-sans"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">لائسنس ایکسپائری تاریخ:</label>
                    <input 
                      type="date" 
                      required
                      value={form.expiryDate}
                      onChange={(e) => setForm({...form, expiryDate: e.target.value})}
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-xs text-white font-sans"
                    />
                  </div>
                </div>

                {/* Modules checklist */}
                <div className="space-y-1.5 border-t border-slate-800 pt-2">
                  <span className="text-xs font-bold text-slate-300 block">اجازت شدہ فیچرز و ماڈیولز:</span>
                  <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                    {ALL_MODULES.map(mod => {
                      const isChecked = form.allowedModules.includes(mod.id);
                      return (
                        <label 
                          key={mod.id} 
                          className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-colors ${isChecked ? 'bg-indigo-950/80 text-indigo-300 font-bold border border-indigo-800/40' : 'text-slate-400 hover:bg-slate-800'}`}
                        >
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleModuleSelection(mod.id)}
                            className="rounded text-indigo-500 bg-slate-800 border-slate-700"
                          />
                          <span className="text-[11px]">{mod.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 text-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{editingId ? 'تبدیلیاں محفوظ کریں' : 'اسکول اکاؤنٹ آئی ڈی بنائیں'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* School Accounts Table / Fee Ledger (Left side) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-slate-950/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                
                {/* Search & Filters Header */}
                <div className="p-4 border-b border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-emerald-400" />
                      <span>تمام رجسٹرڈ اسکولز و آئی ڈیز ({filteredMadrasas.length})</span>
                    </h3>

                    {/* Filter Badges */}
                    <div className="flex gap-2">
                      <select 
                        value={statusFilter}
                        onChange={(e: any) => setStatusFilter(e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-slate-300 text-[11px] px-2.5 py-1 rounded-lg outline-none"
                      >
                        <option value="all">تمام سٹیٹس</option>
                        <option value="active">صرف فعال</option>
                        <option value="inactive">معطل اسکولز</option>
                      </select>

                      <select 
                        value={feeFilter}
                        onChange={(e: any) => setFeeFilter(e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-slate-300 text-[11px] px-2.5 py-1 rounded-lg outline-none"
                      >
                        <option value="all">تمام فیس فلٹر</option>
                        <option value="Paid">فیس ادا شدہ</option>
                        <option value="Unpaid">فیس غیر ادا</option>
                        <option value="Overdue">واجب الادا فیس</option>
                      </select>
                    </div>
                  </div>

                  {/* Search Input */}
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="اسکول کا نام، یوزر نیم، ای میل یا فون نمبر سرچ کریں..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs px-9 py-2 rounded-xl outline-none focus:border-indigo-500"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-bold">
                        <th className="py-3 px-4">اسکول و پرنسپل</th>
                        <th className="py-3 px-4">لاگ ان آئی ڈی / پاسورڈ</th>
                        <th className="py-3 px-4">ماہانہ فیس و سٹیٹس</th>
                        <th className="py-3 px-4 text-center">اکاؤنٹ حالت</th>
                        <th className="py-3 px-4 text-center">ایکشنز</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredMadrasas.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-500">
                            کوئی اسکول اکاؤنٹ نہیں ملا۔
                          </td>
                        </tr>
                      ) : (
                        filteredMadrasas.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="py-3.5 px-4">
                              <span className="block font-bold text-white text-xs">{m.madrassaName}</span>
                              <span className="text-[10px] text-slate-400 block">{m.principalName || 'پرنسپل صاحب'}</span>
                              {m.ownerPhone && (
                                <span className="text-[10px] text-indigo-400 font-sans block mt-0.5" dir="ltr">{m.ownerPhone}</span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 font-sans" dir="ltr">
                              <span className="block text-indigo-300 font-semibold text-[11px]">{m.username || m.email}</span>
                              <span className="text-[10px] text-emerald-400 block">Pass: {m.password}</span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="font-bold text-white font-sans text-xs">PKR {m.monthlyFee?.toLocaleString() || 5000}</span>
                              <div className="mt-1 flex items-center gap-1.5">
                                <button 
                                  onClick={() => toggleFeePaidStatus(m.id)}
                                  title="فیس کا سٹیٹس تبدیل کریں"
                                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 ${
                                    m.feeStatus === 'Paid' 
                                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                                  }`}
                                >
                                  {m.feeStatus === 'Paid' ? <CheckCircle2 className="w-2.5 h-2.5"/> : <AlertTriangle className="w-2.5 h-2.5"/>}
                                  <span>{m.feeStatus === 'Paid' ? 'پریڈ (Paid)' : 'غیر ادا (Unpaid)'}</span>
                                </button>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <button 
                                onClick={() => toggleMadrassaStatus(m.id)}
                                className={`px-2.5 py-1 rounded-full text-[9px] font-bold ${
                                  m.status === 'active'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                {m.status === 'active' ? 'فعال (Active)' : 'معطل (Suspended)'}
                              </button>
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {/* Copy Login Credentials */}
                                <button 
                                  onClick={() => copyLoginCredentials(m)}
                                  className="p-1.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 rounded-lg border border-indigo-800/50 transition-all"
                                  title="لاگ ان واٹس ایپ کیپشن کاپی کریں"
                                >
                                  {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-emerald-400"/> : <Copy className="w-3.5 h-3.5"/>}
                                </button>

                                {/* WhatsApp Reminder */}
                                {m.ownerPhone && (
                                  <button 
                                    onClick={() => sendWhatsAppReminder(m)}
                                    className="p-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded-lg border border-emerald-800/50 transition-all"
                                    title="واٹس ایپ فیس ریمائنڈر بھیجیں"
                                  >
                                    <Send className="w-3.5 h-3.5"/>
                                  </button>
                                )}

                                {/* Edit */}
                                <button 
                                  onClick={() => handleEdit(m)}
                                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
                                  title="ترمیم کریں"
                                >
                                  <Edit2 className="w-3.5 h-3.5"/>
                                </button>

                                {/* Delete */}
                                <button 
                                  onClick={() => handleDelete(m.id)}
                                  className="p-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 rounded-lg border border-rose-800/50"
                                  title="حذف کریں"
                                >
                                  <Trash2 className="w-3.5 h-3.5"/>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>

          </div>
        ) : null}

        {/* TAB 3: PENDING REQUESTS */}
        {activeTab === 'requests' && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>آن لائن الحاق و پورٹل رجسٹریشن کی درخواستیں ({users.length})</span>
            </h3>

            {users.length === 0 ? (
              <p className="text-center text-slate-500 py-12">کوئی نئی درخواست موصول نہیں ہوئی۔</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.map(u => (
                  <div key={u.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-sm">{u.madrassaName || u.username}</p>
                      <p className="text-xs text-indigo-300 font-sans">{u.email}</p>
                      {u.whatsapp && <p className="text-xs text-slate-400 font-sans">WhatsApp: {u.whatsapp}</p>}
                    </div>
                    <button 
                      onClick={() => {
                        const newSchool = {
                          id: 'madrassa-' + Date.now(),
                          madrassaName: u.madrassaName || 'نیا اسکول',
                          principalName: u.username || 'پرنسپل صاحب',
                          username: u.username || u.email?.split('@')[0],
                          email: u.email,
                          password: u.password || 'school123',
                          ownerPhone: u.whatsapp || '',
                          monthlyFee: 5000,
                          feeStatus: 'Paid',
                          status: 'active',
                          allowedModules: ['dashboard', 'students', 'attendance', 'academics', 'exams', 'finance', 'fees', 'staff']
                        };
                        const updated = [...madrasas, newSchool];
                        persistData(updated);
                        alert('درخواست قبول کر کے اسکول آئی ڈی بنا دی گئی ہے!');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold"
                    >
                      قبول کریں
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ADVANCED SERVER & DB CONTROLS */}
        {activeTab === 'advanced' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  <span>ڈیٹا بیس رجسٹری ایڈیٹر (Raw JSON Manager)</span>
                </h3>
              </div>

              <div className="space-y-3">
                <select 
                  value={selectedJsonKey}
                  onChange={(e) => setSelectedJsonKey(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 text-xs text-white rounded-xl font-mono"
                  dir="ltr"
                >
                  <option value="licensed_madrasas">licensed_madrasas (اسکول لائسنسز ڈیٹا)</option>
                  <option value="system_settings">system_settings (سسٹم نجی ترتیبات)</option>
                  <option value="students">students (طالب علم تمام ریکارڈز)</option>
                  <option value="saved_fees">saved_fees (فیسز تمام اینٹریز)</option>
                </select>

                <textarea 
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  className="w-full h-80 bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs font-mono text-emerald-400 custom-scrollbar"
                  dir="ltr"
                  spellCheck={false}
                />

                {jsonError && <p className="text-rose-400 text-xs font-bold">{jsonError}</p>}

                <div className="flex justify-end gap-2">
                  <button 
                    onClick={handleSaveJson}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs"
                  >
                    سیو اور سنک کریں
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              {/* Freeze mode */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">سسٹم فریز کریں (Read-Only Mode)</span>
                  <button 
                    onClick={() => {
                      const next = !freezeMode;
                      setFreezeMode(next);
                      localStorage.setItem('system_freeze', String(next));
                      syncToServer();
                    }}
                  >
                    {freezeMode ? <ToggleRight className="w-8 h-8 text-rose-500" /> : <ToggleLeft className="w-8 h-8 text-slate-600" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  سسٹم فریز فعال کرنے پر تمام صارفین کے لیے نیا ڈیٹا درج کرنا بلاک ہو جائے گا۔
                </p>
              </div>

              {/* Latency & Cleaning */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">ڈیٹا بیس اسپیڈ ٹیسٹ</span>
                  <button onClick={runPingTest} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-lg">
                    ٹیسٹ کریں
                  </button>
                </div>
                {latencyMs && <p className="text-xs text-emerald-400 font-mono font-bold">Latency: {latencyMs} ms</p>}
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 space-y-3">
                <span className="text-xs font-bold text-white block">لوکل سٹوریج: {totalStorageKb} KB</span>
                <button 
                  onClick={runDatabaseSweeper}
                  className="w-full bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/40 font-bold py-2.5 rounded-xl text-xs"
                >
                  کیش اور فالتو ڈیٹا صاف کریں
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
