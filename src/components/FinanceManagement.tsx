import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Plus, Pencil, Trash2, Search, Filter, 
  Download, Printer, ArrowUpCircle, ArrowDownCircle, 
  Wallet, List, RefreshCw, Landmark, HelpCircle, CheckCircle2, Upload, X,
  ChevronDown, ChevronUp, TrendingUp, TrendingDown, FileText, BarChart3,
  Users, Check, PieChart, Landmark as BankIcon, Activity, CalendarDays
} from 'lucide-react';
import { exportToExcel } from '../excelUtils';
import { motion, AnimatePresence } from 'motion/react';
import { addToRecycleBin } from './RecycleBin';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart as RePieChart, Pie, Cell } from 'recharts';

interface FinanceManagementProps {
  subView?: 'overview' | 'expenses' | 'bank-accounts' | 'third-party-money' | 'journal-ledger' | 'reports';
  onBack: () => void;
}

interface Transaction {
  id: string;
  date: string;
  title: string;
  contributor: string;
  headId: string;
  accountId: string;
  type: 'income' | 'expense';
  regNo?: string;
  amount: number;
}

interface Head {
  id: string;
  name: string;
  type: 'income' | 'expense';
  details?: string;
}

interface FinancialAccount {
  id: string;
  name: string;
  balance: number;
  details?: string;
}

interface ThirdPartyFund {
  id: string;
  name: string;
  balance: number;
  details?: string;
  contractorName?: string;
}

const FinanceManagement: React.FC<FinanceManagementProps> = ({ subView = 'overview', onBack }) => {
  const [activeTab, setActiveTab] = useState<string>(subView);
  const [showSuccess, setShowSuccess] = useState(false);
  const [printingReceipt, setPrintingReceipt] = useState<Transaction | null>(null);

  // Filter States for Overview Dashboard
  const [selectedRange, setSelectedRange] = useState('This Month');
  const [selectedMonth, setSelectedMonth] = useState('August');
  const [selectedYear, setSelectedYear] = useState('2025-2026');
  const [selectedCampus, setSelectedCampus] = useState('All Campuses');

  const [systemSettings, setSystemSettings] = useState(() => {
    const saved = localStorage.getItem('system_settings');
    return saved ? JSON.parse(saved) : { jamiaName: 'Modern School Academy', monogram: '' };
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('system_settings');
        if (saved) {
          setSystemSettings(JSON.parse(saved));
        }
      } catch (err) {}
    };
    window.addEventListener('storage_updated', handleUpdate);
    return () => window.removeEventListener('storage_updated', handleUpdate);
  }, []);

  // Sync prop changes to active tab
  useEffect(() => {
    setActiveTab(subView);
  }, [subView]);

  // Data Persistence
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('fin_transactions');
    if (saved) return JSON.parse(saved);
    
    // Default High-Fidelity Data to match the Screenshot exactly on first load
    return [
      {
        id: 'TR-1723210000001',
        date: '2025-08-10',
        title: 'Monthly Tuition Fee Collection',
        contributor: 'All Students',
        headId: '2', // Tuition Fee
        accountId: '2', // Bank Account
        type: 'income',
        amount: 915600
      },
      {
        id: 'TR-1723210000002',
        date: '2025-08-28',
        title: 'Staff Salaries Disbursement',
        contributor: 'Faculty & Staff',
        headId: '3', // Staff Salaries
        accountId: '2', // Bank Account
        type: 'expense', // will map to Salary
        amount: 1644830
      }
    ];
  });

  const [heads, setHeads] = useState<Head[]>(() => {
    const saved = localStorage.getItem('fin_heads');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Admission Fee', type: 'income' },
      { id: '2', name: 'Tuition Fee', type: 'income' },
      { id: '3', name: 'Staff Salaries', type: 'expense' },
      { id: '4', name: 'Utility Bills', type: 'expense' },
      { id: '5', name: 'Maintenance & Repairs', type: 'expense' },
      { id: '6', name: 'Trust/Donation Inflow', type: 'income' }
    ];
  });

  const [accounts, setAccounts] = useState<FinancialAccount[]>(() => {
    const saved = localStorage.getItem('fin_accounts');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Main School Cash', balance: 50000 },
      { id: '2', name: 'Bank Al Habib - Principal A/C', balance: 1250000 },
      { id: '3', name: 'Allied Bank - Petty Cash', balance: 15000 }
    ];
  });

  const [thirdPartyFunds, setThirdPartyFunds] = useState<ThirdPartyFund[]>(() => {
    const saved = localStorage.getItem('fin_third_party_funds');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Security Deposits', balance: 125000, details: 'Refundable student security deposits', contractorName: 'Students Trust' },
      { id: '2', name: 'Canteen Contractor Bond', balance: 35000, details: 'Canteen contractor license security bond', contractorName: 'Ali Caterers' },
      { id: '3', name: 'Uniform vendor trust deposit', balance: 18000, details: 'Advance safety deposit for uniforms supply', contractorName: 'Al-Khidmat Uniforms' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('fin_transactions', JSON.stringify(transactions));
    localStorage.setItem('fin_heads', JSON.stringify(heads));
    localStorage.setItem('fin_accounts', JSON.stringify(accounts));
    localStorage.setItem('fin_third_party_funds', JSON.stringify(thirdPartyFunds));
  }, [transactions, heads, accounts, thirdPartyFunds]);

  // Form States
  const [transForm, setTransForm] = useState<Partial<Transaction>>({
    date: new Date().toISOString().split('T')[0],
    type: 'income',
    title: '',
    contributor: '',
    headId: '',
    accountId: '',
    amount: 0
  });

  const [headForm, setHeadForm] = useState<Partial<Head>>({
    name: '',
    type: 'income',
    details: ''
  });

  const [accForm, setAccForm] = useState<Partial<FinancialAccount>>({
    name: '',
    balance: 0,
    details: ''
  });

  const [thirdPartyForm, setThirdPartyForm] = useState<Partial<ThirdPartyFund>>({
    name: '',
    balance: 0,
    contractorName: '',
    details: ''
  });

  const [transferForm, setTransferForm] = useState({
    fromAcc: '',
    toAcc: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    details: ''
  });

  // Filter Transactions based on Month Selector (August 2025)
  const getFilteredTransactions = () => {
    return transactions.filter(t => {
      // Simple date matching for our high-fidelity experience
      if (selectedMonth && selectedMonth !== 'All Months') {
        const monthMap: { [key: string]: string } = {
          'January': '-01-', 'February': '-02-', 'March': '-03-', 'April': '-04-',
          'May': '-05-', 'June': '-06-', 'July': '-07-', 'August': '-08-',
          'September': '-09-', 'October': '-10-', 'November': '-11-', 'December': '-12-'
        };
        const searchPattern = monthMap[selectedMonth];
        if (searchPattern && !t.date.includes(searchPattern)) return false;
      }
      return true;
    });
  };

  const filteredTrans = getFilteredTransactions();

  // Metric calculations
  const feeIncomeSum = filteredTrans
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Operational costs (Operational Expenses excluding payroll/salaries)
  const operationalCostsSum = filteredTrans
    .filter(t => t.type === 'expense' && t.headId !== '3')
    .reduce((sum, t) => sum + t.amount, 0);

  // Salaries (Specifically headId '3' - Staff Salaries)
  const salariesSum = filteredTrans
    .filter(t => t.type === 'expense' && t.headId === '3')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalanceSum = feeIncomeSum - operationalCostsSum - salariesSum;

  // Handlers
  const handleAddTransaction = (customType?: 'income' | 'expense') => {
    const activeType = customType || transForm.type || 'income';
    const amountVal = transForm.amount || 0;
    
    if (!transForm.title || !transForm.headId || !transForm.accountId || amountVal <= 0) {
      alert('Please fill in all transaction details correctly.');
      return;
    }
    
    const newTrans: Transaction = {
      id: `TR-${Date.now()}`,
      date: transForm.date || new Date().toISOString().split('T')[0],
      title: transForm.title,
      contributor: transForm.contributor || 'General',
      headId: transForm.headId,
      accountId: transForm.accountId,
      type: activeType,
      amount: amountVal
    };

    setTransactions([newTrans, ...transactions]);
    
    // Update Account Balance
    setAccounts(accounts.map(acc => {
      if (acc.id === newTrans.accountId) {
        return {
          ...acc,
          balance: activeType === 'income' ? acc.balance + newTrans.amount : acc.balance - newTrans.amount
        };
      }
      return acc;
    }));

    setTransForm({
      date: new Date().toISOString().split('T')[0],
      type: 'income',
      title: '',
      contributor: '',
      headId: '',
      accountId: '',
      amount: 0
    });
    
    triggerSuccess();
  };

  const handleDeleteTransaction = (id: string) => {
    const trans = transactions.find(t => t.id === id);
    if (!trans) return;

    if (!window.confirm('Are you sure you want to delete this financial ledger entry?')) return;

    addToRecycleBin('finance', trans, 'title');

    // Reverse Account Balance
    setAccounts(accounts.map(acc => {
      if (acc.id === trans.accountId) {
        return {
          ...acc,
          balance: trans.type === 'income' ? acc.balance - trans.amount : acc.balance + trans.amount
        };
      }
      return acc;
    }));

    setTransactions(transactions.filter(t => t.id !== id));
    triggerSuccess();
  };

  const handleAddHead = () => {
    if (!headForm.name) return;
    const newHead: Head = {
      ...headForm as Head,
      id: `H-${Date.now()}`
    };
    setHeads([...heads, newHead]);
    setHeadForm({ name: '', type: 'income', details: '' });
    triggerSuccess();
  };

  const handleAddAccount = () => {
    if (!accForm.name) return;
    const newAcc: FinancialAccount = {
      ...accForm as FinancialAccount,
      id: `ACC-${Date.now()}`
    };
    setAccounts([...accounts, newAcc]);
    setAccForm({ name: '', balance: 0, details: '' });
    triggerSuccess();
  };

  const handleAddThirdPartyFund = () => {
    if (!thirdPartyForm.name) return;
    const newFund: ThirdPartyFund = {
      id: `TPF-${Date.now()}`,
      name: thirdPartyForm.name,
      balance: thirdPartyForm.balance || 0,
      contractorName: thirdPartyForm.contractorName || 'N/A',
      details: thirdPartyForm.details || ''
    };
    setThirdPartyFunds([...thirdPartyFunds, newFund]);
    setThirdPartyForm({ name: '', balance: 0, contractorName: '', details: '' });
    triggerSuccess();
  };

  const handleDeleteThirdPartyFund = (id: string) => {
    if (window.confirm('Delete this contractor/third-party trust fund?')) {
      setThirdPartyFunds(thirdPartyFunds.filter(f => f.id !== id));
      triggerSuccess();
    }
  };

  const handleTransfer = () => {
    if (!transferForm.fromAcc || !transferForm.toAcc || transferForm.amount <= 0 || transferForm.fromAcc === transferForm.toAcc) {
      alert('Invalid fund routing parameters.');
      return;
    }

    const fromAccount = accounts.find(a => a.id === transferForm.fromAcc);
    const toAccount = accounts.find(a => a.id === transferForm.toAcc);
    if (!fromAccount || !toAccount) return;

    if (fromAccount.balance < transferForm.amount) {
      alert('Insufficient funds in source account.');
      return;
    }

    const transferId = Date.now();
    
    // Create Expense Trans for From Account
    const expenseTrans: Transaction = {
      id: `TR-${transferId}-1`,
      date: transferForm.date,
      title: `Funds Transfer Out to ${toAccount.name}`,
      contributor: 'System Internal',
      headId: 'transfer-out',
      accountId: transferForm.fromAcc,
      type: 'expense',
      amount: transferForm.amount
    };

    // Create Income Trans for To Account
    const incomeTrans: Transaction = {
      id: `TR-${transferId}-2`,
      date: transferForm.date,
      title: `Funds Transfer In from ${fromAccount.name}`,
      contributor: 'System Internal',
      headId: 'transfer-in',
      accountId: transferForm.toAcc,
      type: 'income',
      amount: transferForm.amount
    };

    setTransactions([expenseTrans, incomeTrans, ...transactions]);

    // Update Balances
    setAccounts(accounts.map(acc => {
      if (acc.id === transferForm.fromAcc) return { ...acc, balance: acc.balance - transferForm.amount };
      if (acc.id === transferForm.toAcc) return { ...acc, balance: acc.balance + transferForm.amount };
      return acc;
    }));

    setTransferForm({ ...transferForm, amount: 0, details: '' });
    triggerSuccess();
  };

  const triggerSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  // Pre-populated Defaulters List
  const defaultDefaulters = [
    { name: 'Zainab Sheikh', regNo: '3520220001144', vouchers: 2, outstanding: 17000 },
    { name: 'Adnan Malik', regNo: '3520220001131', vouchers: 2, outstanding: 17000 },
    { name: 'Fozia Abbasi', regNo: '3520220001136', vouchers: 2, outstanding: 17000 }
  ];

  // Recharts Chart Data
  const chartData = [
    {
      name: selectedMonth === 'August' ? 'Aug 25' : selectedMonth.substring(0, 3) + ' 25',
      'Fee Income': feeIncomeSum,
      'Expenses': operationalCostsSum,
      'Salaries': salariesSum
    }
  ];

  const collectionPieData = [
    { name: 'Paid', value: 152, color: '#10b981' },
    { name: 'Partial', value: 0, color: '#eab308' },
    { name: 'Unpaid', value: 0, color: '#ef4444' }
  ];

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] text-[#111827]" dir="ltr">
      {/* Success Notification Alert */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 10 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-md flex items-center gap-2 border border-slate-800 text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Record posted successfully</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Sub-Header Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={onBack}
            className="border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-all text-xs font-medium cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="h-6 w-px bg-slate-200" />
          
          <div className="flex flex-col">
            <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Accounting Center</span>
            <h1 className="text-sm font-black text-slate-900 uppercase">
              {activeTab === 'overview' && 'Finance Dashboard'}
              {activeTab === 'expenses' && 'Operational Expenses'}
              {activeTab === 'bank-accounts' && 'Financial Vaults & Banks'}
              {activeTab === 'third-party-money' && 'Contractor & Third-Party Money'}
              {activeTab === 'journal-ledger' && 'Transaction Journal Ledger'}
              {activeTab === 'reports' && 'Financial Reporting Hub'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-1 md:pb-0">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'overview' ? 'bg-slate-100 text-slate-900 border border-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('expenses')} 
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'expenses' ? 'bg-slate-100 text-slate-900 border border-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Expenses
          </button>
          <button 
            onClick={() => setActiveTab('bank-accounts')} 
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'bank-accounts' ? 'bg-slate-100 text-slate-900 border border-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Banks
          </button>
          <button 
            onClick={() => setActiveTab('third-party-money')} 
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'third-party-money' ? 'bg-slate-100 text-slate-900 border border-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Third-Party
          </button>
          <button 
            onClick={() => setActiveTab('journal-ledger')} 
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'journal-ledger' ? 'bg-slate-100 text-slate-900 border border-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Journal Ledger
          </button>
          <button 
            onClick={() => setActiveTab('reports')} 
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'reports' ? 'bg-slate-100 text-slate-900 border border-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Reports
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-[#F9FAFB] p-6">
        <AnimatePresence mode="wait">
          
          {/* VIEW 1: OVERVIEW FINANCE DASHBOARD (Matches second screenshot) */}
          {activeTab === 'overview' && (
            <motion.div 
              key="overview" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }} 
              className="space-y-6"
            >
              {/* Dashboard Subheader & Selectors */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold tracking-tight text-slate-800">Finance Dashboard</h2>
                  <span className="bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                    {selectedMonth} {selectedYear.split('-')[0]}
                  </span>
                </div>

                {/* Grid of Horizontal Selectors (aligned precisely) */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <select 
                    value={selectedRange} 
                    onChange={(e) => setSelectedRange(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-3 py-1.5 outline-none focus:border-slate-300"
                  >
                    <option>This Month</option>
                    <option>Last 3 Months</option>
                    <option>This Year</option>
                  </select>

                  <select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-3 py-1.5 outline-none focus:border-slate-300"
                  >
                    <option>January</option>
                    <option>February</option>
                    <option>March</option>
                    <option>April</option>
                    <option>May</option>
                    <option>June</option>
                    <option>July</option>
                    <option>August</option>
                    <option>September</option>
                    <option>October</option>
                    <option>November</option>
                    <option>December</option>
                  </select>

                  <select 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-3 py-1.5 outline-none focus:border-slate-300"
                  >
                    <option>2025-2026</option>
                    <option>2026-2027</option>
                  </select>

                  <select 
                    value={selectedCampus} 
                    onChange={(e) => setSelectedCampus(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-3 py-1.5 outline-none focus:border-slate-300"
                  >
                    <option>All Campuses</option>
                    <option>Primary Campus</option>
                    <option>Secondary Campus</option>
                  </select>
                </div>
              </div>

              {/* 4-Column Metric Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Fee Income */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fee Income</span>
                    <span className="text-lg font-black text-slate-900 font-mono">Rs. {feeIncomeSum.toLocaleString()}</span>
                    <span className="text-[10px] font-medium text-emerald-500 block">100% collection rate</span>
                  </div>
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100">
                    <ArrowDownCircle className="w-5 h-5" />
                  </div>
                </div>

                {/* 2. Expenses */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Expenses</span>
                    <span className="text-lg font-black text-slate-900 font-mono">Rs. {operationalCostsSum.toLocaleString()}</span>
                    <span className="text-[10px] font-medium text-slate-400 block">Operational costs</span>
                  </div>
                  <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center border border-rose-100">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>

                {/* 3. Salaries */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Salaries</span>
                    <span className="text-lg font-black text-slate-900 font-mono">Rs. {salariesSum.toLocaleString()}</span>
                    <span className="text-[10px] font-medium text-amber-500 block">Staff disbursements</span>
                  </div>
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center border border-amber-100">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                {/* 4. Net Balance (Highlighted red/pink border as shown in screenshot) */}
                <div className="bg-white p-6 rounded-xl border-2 border-red-500/80 flex items-center justify-between shadow-sm">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-wider block">Net Balance</span>
                    <span className="text-lg font-black text-red-600 font-mono">Rs. {netBalanceSum.toLocaleString()}</span>
                    <span className="text-[10px] font-bold text-red-400 block">Income - Expenses - Salaries</span>
                  </div>
                  <div className="w-10 h-10 bg-red-50 text-red-400 rounded-full flex items-center justify-center border border-red-100">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Charts Panel: Income vs Expenses & Collection Rate */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left: Income vs Expenses Recharts bar chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Income vs Expenses</h3>
                      <p className="text-slate-400 text-[10px] font-medium uppercase mt-0.5">Monthly breakdown for selected period</p>
                    </div>
                  </div>
                  
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" stroke="#6B7280" fontSize={10} tickLine={false} />
                        <YAxis stroke="#6B7280" fontSize={10} tickLine={false} tickFormatter={(v) => `Rs. ${v/1000}k`} />
                        <Tooltip formatter={(value: any) => [`Rs. ${value.toLocaleString()}`, '']} />
                        <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }} />
                        <Bar dataKey="Fee Income" fill="#312e81" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Salaries" fill="#eab308" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Right: Collection Rate Pie/Ring Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Collection Rate</h3>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">152 vouchers total</span>
                    </div>

                    <div className="h-44 flex items-center justify-center relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={collectionPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {collectionPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </RePieChart>
                      </ResponsiveContainer>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-2xl font-black text-slate-800">100%</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Collected</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-2">
                    <div className="flex justify-around items-center">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span>152 Paid</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span>0 Partial</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        <span>0 Unpaid</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom: Expense Breakdown (Left) & Top Defaulters (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Expense Breakdown */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 min-h-[300px] flex flex-col justify-between">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Expense Breakdown</h3>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">By category</span>
                  </div>

                  {operationalCostsSum === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 py-12">
                      <PieChart size={40} strokeWidth={1} className="text-slate-200 mb-2" />
                      <span className="text-xs font-bold uppercase tracking-wider">No expenses recorded</span>
                    </div>
                  ) : (
                    <div className="flex-1 space-y-3">
                      {filteredTrans
                        .filter(t => t.type === 'expense' && t.headId !== '3')
                        .map(t => {
                          const category = heads.find(h => h.id === t.headId)?.name || 'Other';
                          const pct = Math.round((t.amount / operationalCostsSum) * 100);
                          return (
                            <div key={t.id} className="flex items-center justify-between text-xs font-bold text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-150">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-rose-500" />
                                <span>{t.title} ({category})</span>
                              </div>
                              <div className="font-mono text-slate-900">
                                Rs. {t.amount.toLocaleString()} ({pct}%)
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Top Defaulters (Matching table layout precisely) */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Top Defaulters</h3>
                      <button className="text-[10px] text-slate-500 hover:text-slate-900 font-bold uppercase tracking-wider">View all</button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-slate-400 font-bold uppercase text-[9px] tracking-wider border-b border-slate-100">
                            <th className="pb-2">Student</th>
                            <th className="pb-2">Reg #</th>
                            <th className="pb-2 text-center">Vouchers</th>
                            <th className="pb-2 text-right">Outstanding</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          {defaultDefaulters.map((def, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="py-2.5 font-bold text-slate-800">{def.name}</td>
                              <td className="py-2.5 font-mono text-[10px] text-slate-500">{def.regNo}</td>
                              <td className="py-2.5 text-center">{def.vouchers}</td>
                              <td className="py-2.5 text-right font-mono text-rose-600">Rs. {def.outstanding.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW 2: EXPENSES (Operational Expenses Management) */}
          {activeTab === 'expenses' && (
            <motion.div 
              key="expenses" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }} 
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Expense Logging Form */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Plus className="w-4 h-4 text-rose-500" />
                    <span>Log Operational Expense</span>
                  </h3>
                  <p className="text-slate-400 text-[10px] uppercase font-bold mt-1">Record school utilities, purchases, repairs</p>
                </div>

                <div className="space-y-3.5">
                  <InputField label="Date" type="date" value={transForm.date} onChange={(v:any) => setTransForm({...transForm, date: v})} />
                  <InputField label="Expense Title / Description" value={transForm.title} onChange={(v:any) => setTransForm({...transForm, title: v})} placeholder="e.g. Electricity Bill August 2025" />
                  <InputField label="Paid To / Recipient" value={transForm.contributor} onChange={(v:any) => setTransForm({...transForm, contributor: v})} placeholder="Vendor or Person name" />
                  
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Expense Category (Head)</label>
                    <select 
                      value={transForm.headId} 
                      onChange={e => setTransForm({...transForm, headId: e.target.value})} 
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-xs font-semibold focus:border-slate-300"
                    >
                      <option value="">-- Select Category --</option>
                      {heads.filter(h => h.type === 'expense').map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Payment Source Account</label>
                    <select 
                      value={transForm.accountId} 
                      onChange={e => setTransForm({...transForm, accountId: e.target.value})} 
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-xs font-semibold focus:border-slate-300"
                    >
                      <option value="">-- Select Bank/Cash Vault --</option>
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name} (Bal: Rs. {a.balance.toLocaleString()})</option>)}
                    </select>
                  </div>

                  <InputField label="Amount Paid (PKR)" type="number" value={transForm.amount} onChange={(v:any) => setTransForm({...transForm, amount: parseInt(v) || 0})} placeholder="0" />

                  <button 
                    onClick={() => handleAddTransaction('expense')} 
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-rose-400" />
                    <span>Post Expense Entry</span>
                  </button>
                </div>
              </div>

              {/* Expense Ledger History */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                    <div>
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Posted Expenses</h3>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Historical log of operational payments</span>
                    </div>
                    <button 
                      onClick={() => exportToExcel(transactions.filter(t => t.type === 'expense'), 'Expenses')}
                      className="border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-2"
                    >
                      <Download size={12} />
                      <span>Export Excel</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-slate-400 font-bold uppercase text-[9px] tracking-wider border-b border-slate-100 pb-2">
                          <th className="pb-2">Date</th>
                          <th className="pb-2">Description</th>
                          <th className="pb-2">Category</th>
                          <th className="pb-2">Paid From</th>
                          <th className="pb-2 text-right">Amount</th>
                          <th className="pb-2 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {transactions.filter(t => t.type === 'expense').map(t => {
                          const categoryName = heads.find(h => h.id === t.headId)?.name || 'Other Expense';
                          const accountName = accounts.find(a => a.id === t.accountId)?.name || 'Cash';
                          return (
                            <tr key={t.id} className="hover:bg-slate-50/50">
                              <td className="py-2.5 font-mono text-[10px] text-slate-500">{t.date}</td>
                              <td className="py-2.5">
                                <div className="font-bold text-slate-800">{t.title}</div>
                                <div className="text-[9px] text-slate-400 font-medium uppercase mt-0.5">Paid To: {t.contributor}</div>
                              </td>
                              <td className="py-2.5 text-slate-600">{categoryName}</td>
                              <td className="py-2.5 text-slate-500">{accountName}</td>
                              <td className="py-2.5 text-right font-mono text-rose-600">Rs. {t.amount.toLocaleString()}</td>
                              <td className="py-2.5 text-center">
                                <button 
                                  onClick={() => handleDeleteTransaction(t.id)} 
                                  className="text-slate-300 hover:text-red-600 p-1 rounded-md transition-colors cursor-pointer"
                                  title="Delete Expense"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {transactions.filter(t => t.type === 'expense').length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-slate-300 uppercase text-xs font-bold tracking-widest">No expenses found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW 3: BANK ACCOUNTS */}
          {activeTab === 'bank-accounts' && (
            <motion.div 
              key="bank" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }} 
              className="space-y-6"
            >
              {/* Top Section: Open Account & Routing forms side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Open New Vault/Account Form */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-slate-700" />
                      <span>Register Vault or Bank Account</span>
                    </h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase mt-1">Register safe counters, cash bags, or official bank accounts</p>
                  </div>

                  <div className="space-y-3">
                    <InputField label="Account / Bank Name" value={accForm.name} onChange={(v:any) => setAccForm({...accForm, name: v})} placeholder="e.g. Meezan Bank Islamic Branch" />
                    <InputField label="Initial Balance (PKR)" type="number" value={accForm.balance} onChange={(v:any) => setAccForm({...accForm, balance: parseInt(v) || 0})} placeholder="0" />
                    <InputField label="Details / Remarks" value={accForm.details} onChange={(v:any) => setAccForm({...accForm, details: v})} placeholder="e.g. Account No: 1234-5678-90" />
                    
                    <button 
                      onClick={handleAddAccount}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-sm cursor-pointer"
                    >
                      Open Bank Vault
                    </button>
                  </div>
                </div>

                {/* 2. Funds Routing (Inter-Account Transfer) */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-slate-700" />
                      <span>Inter-Account Funds Routing</span>
                    </h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase mt-1">Safely transfer balances between registered counters/vaults</p>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block ml-1">From Account</label>
                        <select 
                          value={transferForm.fromAcc} 
                          onChange={e => setTransferForm({...transferForm, fromAcc: e.target.value})} 
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-xs font-semibold"
                        >
                          <option value="">-- Source --</option>
                          {accounts.map(a => <option key={a.id} value={a.id}>{a.name} (Rs. {a.balance.toLocaleString()})</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block ml-1">To Account</label>
                        <select 
                          value={transferForm.toAcc} 
                          onChange={e => setTransferForm({...transferForm, toAcc: e.target.value})} 
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-xs font-semibold"
                        >
                          <option value="">-- Destination --</option>
                          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <InputField label="Transfer Amount (PKR)" type="number" value={transferForm.amount} onChange={(v:any) => setTransferForm({...transferForm, amount: parseInt(v) || 0})} placeholder="0" />
                    <InputField label="Transfer Date" type="date" value={transferForm.date} onChange={(v:any) => setTransferForm({...transferForm, date: v})} />

                    <button 
                      onClick={handleTransfer}
                      className="w-full py-2.5 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-900 rounded-lg text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
                    >
                      Execute Funds routing
                    </button>
                  </div>
                </div>
              </div>

              {/* Accounts balance grid cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {accounts.map(acc => (
                  <div key={acc.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative group overflow-hidden flex flex-col justify-between min-h-[140px]">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-full bg-slate-50 text-slate-600 border border-slate-100 flex items-center justify-center">
                        <BankIcon className="w-4.5 h-4.5" />
                      </div>
                      <button 
                        onClick={() => setAccounts(accounts.filter(a => a.id !== acc.id))} 
                        className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Close Account"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mt-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Available Balance</span>
                      <span className="text-xl font-black text-slate-900 font-mono">Rs. {acc.balance.toLocaleString()}</span>
                      <h4 className="text-xs font-black text-slate-800 mt-1 uppercase tracking-tight">{acc.name}</h4>
                      {acc.details && <p className="text-[10px] text-slate-400 mt-0.5">{acc.details}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* VIEW 4: THIRD-PARTY MONEY */}
          {activeTab === 'third-party-money' && (
            <motion.div 
              key="thirdparty" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }} 
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Form to open trust bond/liability account */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-500" />
                    <span>Post Third-Party Bond / Trust</span>
                  </h3>
                  <p className="text-slate-400 text-[10px] uppercase font-bold mt-1">Record canteen deposit, uniform advances, contractor security</p>
                </div>

                <div className="space-y-3.5">
                  <InputField label="Fund / Account Name" value={thirdPartyForm.name} onChange={(v:any) => setThirdPartyForm({...thirdPartyForm, name: v})} placeholder="e.g. Canteen Deposit Bond" />
                  <InputField label="Contractor / Party Name" value={thirdPartyForm.contractorName} onChange={(v:any) => setThirdPartyForm({...thirdPartyForm, contractorName: v})} placeholder="e.g. Shah Caterers Service" />
                  <InputField label="Security Fund Balance (PKR)" type="number" value={thirdPartyForm.balance} onChange={(v:any) => setThirdPartyForm({...thirdPartyForm, balance: parseInt(v) || 0})} placeholder="0" />
                  <InputField label="Remarks / Details" value={thirdPartyForm.details} onChange={(v:any) => setThirdPartyForm({...thirdPartyForm, details: v})} placeholder="Refundable upon contract expiry" />

                  <button 
                    onClick={handleAddThirdPartyFund}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Open Liability Account
                  </button>
                </div>
              </div>

              {/* List of third party liabilities */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col justify-between">
                <div>
                  <div className="border-b border-slate-100 pb-3 mb-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Active Contractor Deposits & Trusts</h3>
                      <p className="text-slate-400 text-[10px] uppercase font-bold mt-0.5">Summary of trust liabilities held by school</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {thirdPartyFunds.map(fund => (
                      <div key={fund.id} className="border border-slate-200 bg-slate-50 p-4 rounded-xl relative group flex flex-col justify-between">
                        <button 
                          onClick={() => handleDeleteThirdPartyFund(fund.id)}
                          className="absolute top-3 right-3 text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <X size={14} />
                        </button>

                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Security deposit held</span>
                          <span className="text-lg font-black text-emerald-600 font-mono block">Rs. {fund.balance.toLocaleString()}</span>
                          <h4 className="text-xs font-black text-slate-800 uppercase">{fund.name}</h4>
                          <span className="text-[10px] text-slate-500 font-semibold block">Contractor: {fund.contractorName}</span>
                          {fund.details && <p className="text-[10px] text-slate-400 italic font-medium mt-1">{fund.details}</p>}
                        </div>
                      </div>
                    ))}
                    {thirdPartyFunds.length === 0 && (
                      <div className="col-span-2 py-12 text-center text-slate-300 uppercase text-xs font-bold tracking-widest">No third-party accounts listed</div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW 5: JOURNAL LEDGER */}
          {activeTab === 'journal-ledger' && (
            <motion.div 
              key="ledger" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }} 
              className="space-y-6"
            >
              {/* Filter controls */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <List size={20} className="text-slate-400" />
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Double-Entry Journal</h3>
                    <p className="text-slate-400 text-[10px] uppercase font-bold mt-0.5">Chronological double-entry cash flow book</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
                  <button 
                    onClick={() => exportToExcel(transactions, 'Journal_Ledger')}
                    className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                  >
                    <Download size={14} />
                    <span>Download Ledger Excel</span>
                  </button>
                </div>
              </div>

              {/* Complete Transaction Table List */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-wider border-b border-slate-100 pb-2">
                        <th className="px-6 py-4 w-12 text-center">#</th>
                        <th className="px-6 py-4 w-28">Posting Date</th>
                        <th className="px-6 py-4">Transaction Details</th>
                        <th className="px-6 py-4 text-center w-24">Type</th>
                        <th className="px-6 py-4 text-center">Paying Vault</th>
                        <th className="px-6 py-4 text-right">Debit / Credit Amount</th>
                        <th className="px-6 py-4 text-center w-24">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {transactions.map((t, idx) => {
                        const categoryName = heads.find(h => h.id === t.headId)?.name || 'General';
                        const accountName = accounts.find(a => a.id === t.accountId)?.name || 'System';
                        return (
                          <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-center text-slate-300 font-mono">{idx + 1}</td>
                            <td className="px-6 py-4 text-slate-500 font-mono">{t.date}</td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-800">{t.title}</div>
                              <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider mt-0.5">Payer: {t.contributor} • Category: {categoryName}</div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${t.type === 'income' ? 'bg-emerald-55 text-emerald-700 border border-emerald-100' : 'bg-rose-55 text-rose-750 border border-rose-100'}`}>
                                {t.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center text-slate-500">{accountName}</td>
                            <td className={`px-6 py-4 text-right font-bold font-mono text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {t.type === 'income' ? '+' : '-'} Rs. {t.amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button 
                                  onClick={() => setPrintingReceipt(t)} 
                                  className="p-1.5 bg-slate-50 text-slate-500 rounded hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
                                  title="Print Voucher Receipt"
                                >
                                  <Printer size={12} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteTransaction(t.id)} 
                                  className="p-1.5 bg-red-50 text-red-500 rounded hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                                  title="Delete Ledger Post"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {transactions.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-16 text-center text-slate-300 font-bold uppercase tracking-wider text-xs">No ledger records found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW 6: REPORTS */}
          {activeTab === 'reports' && (
            <motion.div 
              key="reports" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }} 
              className="space-y-6 max-w-4xl mx-auto"
            >
              {/* Printable Monthly Sheet Report Card */}
              <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row items-center justify-between border-b border-slate-100 pb-4 gap-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="text-slate-500" size={24} />
                    <div>
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Academic Income & Expense Statement</h3>
                      <p className="text-slate-400 text-[10px] uppercase font-bold mt-0.5">Statement for the fiscal period 2025 - 2026</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => window.print()}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                  >
                    <Printer size={14} />
                    <span>Print Statement</span>
                  </button>
                </div>

                {/* Grid showing income breakdown vs expense breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-semibold">
                  
                  {/* Revenue / Income Statement Left */}
                  <div className="space-y-4">
                    <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg border border-emerald-100 uppercase text-[10px] tracking-widest font-black flex justify-between items-center">
                      <span>Operating Revenue (Income)</span>
                      <ArrowUpCircle size={16} />
                    </div>
                    <div className="divide-y divide-slate-100 px-2">
                      <div className="py-2 flex justify-between">
                        <span className="text-slate-600">Admission Fee collection</span>
                        <span className="font-mono text-slate-800">Rs. {transactions.filter(t => t.type === 'income' && t.headId === '1').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</span>
                      </div>
                      <div className="py-2 flex justify-between">
                        <span className="text-slate-600">Tuition Fee collection</span>
                        <span className="font-mono text-slate-800">Rs. {transactions.filter(t => t.type === 'income' && t.headId === '2').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</span>
                      </div>
                      <div className="py-2 flex justify-between">
                        <span className="text-slate-600">Donations & Trust collections</span>
                        <span className="font-mono text-slate-800">Rs. {transactions.filter(t => t.type === 'income' && t.headId === '6').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</span>
                      </div>
                      <div className="py-3 flex justify-between font-bold text-slate-900 text-sm border-t-2">
                        <span>Total Revenue</span>
                        <span className="font-mono">Rs. {feeIncomeSum.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expenses/Cost of Operations Statement Right */}
                  <div className="space-y-4">
                    <div className="bg-rose-50 text-rose-800 p-3 rounded-lg border border-rose-100 uppercase text-[10px] tracking-widest font-black flex justify-between items-center">
                      <span>Operating Costs (Expenses)</span>
                      <ArrowDownCircle size={16} />
                    </div>
                    <div className="divide-y divide-slate-100 px-2">
                      <div className="py-2 flex justify-between">
                        <span className="text-slate-600">Staff Salaries & payroll</span>
                        <span className="font-mono text-slate-800">Rs. {salariesSum.toLocaleString()}</span>
                      </div>
                      <div className="py-2 flex justify-between">
                        <span className="text-slate-600">Electricity & Utility Bills</span>
                        <span className="font-mono text-slate-800">Rs. {transactions.filter(t => t.type === 'expense' && t.headId === '4').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</span>
                      </div>
                      <div className="py-2 flex justify-between">
                        <span className="text-slate-600">Maintenance & Campus Repairs</span>
                        <span className="font-mono text-slate-800">Rs. {transactions.filter(t => t.type === 'expense' && t.headId === '5').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</span>
                      </div>
                      <div className="py-3 flex justify-between font-bold text-slate-900 text-sm border-t-2">
                        <span>Total Costs</span>
                        <span className="font-mono">Rs. {(salariesSum + operationalCostsSum).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Net margin summary */}
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Net Operating Profit / Loss</span>
                    <p className="text-slate-500 text-[10px] font-semibold">Margin calculated over current posted ledger entries</p>
                  </div>
                  <span className={`text-2xl font-black font-mono ${netBalanceSum >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    Rs. {netBalanceSum.toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* MODAL PRINT POPUP VOUCHER */}
      {printingReceipt && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
          <div className="fixed top-6 right-6 flex gap-3 no-print">
            <button 
              onClick={() => window.print()} 
              className="bg-slate-900 text-white px-4 py-2 rounded-lg shadow-md hover:bg-slate-800 transition-colors flex items-center gap-2 font-bold uppercase text-xs tracking-wider cursor-pointer"
            >
              <Printer size={14} />
              <span>Print Receipt</span>
            </button>
            <button 
              onClick={() => setPrintingReceipt(null)} 
              className="bg-white border border-slate-200 text-slate-800 p-2 rounded-lg shadow-md hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-[148mm] p-10 border border-slate-250 shadow-xl relative text-xs rounded-xl"
          >
            <div className="flex flex-col items-center mb-6 border-b border-slate-100 pb-4 text-center">
              {systemSettings.monogram && <img src={systemSettings.monogram} alt="Logo" className="w-12 h-12 object-contain mb-2" />}
              <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">{systemSettings.jamiaName}</h2>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Official Transaction Receipt</span>
            </div>

            <div className="grid grid-cols-2 gap-y-4 text-slate-700 font-semibold mb-8">
              <ReceiptRow label="Receipt / Ref ID" value={printingReceipt.id} />
              <ReceiptRow label="Posting Date" value={printingReceipt.date} />
              <ReceiptRow label="Ledger Type" value={printingReceipt.type.toUpperCase()} />
              <ReceiptRow label="Category Head" value={heads.find(h => h.id === printingReceipt.headId)?.name || 'General'} />
              <ReceiptRow label="Party / Source" value={printingReceipt.contributor || 'N/A'} />
              <ReceiptRow label="Safe / Bank" value={accounts.find(a => a.id === printingReceipt.accountId)?.name || 'Cash Vault'} />
              <div className="col-span-2 pt-2 border-t border-slate-100">
                <ReceiptRow label="Payment Description" value={printingReceipt.title} />
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg flex items-center justify-between border border-slate-150 mb-6">
              <span className="text-slate-400 font-black uppercase text-[9px] tracking-wider">Total Amount Paid</span>
              <span className="text-xl font-black text-slate-900 font-mono">Rs. {printingReceipt.amount.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-end">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">School Management System</span>
              <div className="flex flex-col items-center gap-1">
                <div className="w-24 h-px bg-slate-200"></div>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Treasurer Signature</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const InputField = ({ label, value, onChange, placeholder, type = 'text' }: any) => (
  <div className="space-y-1 w-full">
    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block ml-1">{label}</label>
    <input 
      type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-xs font-semibold focus:border-slate-300 transition-all shadow-sm"
    />
  </div>
);

const ReceiptRow = ({ label, value }: { label: string, value: any }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{label}</span>
    <span className="text-xs font-bold text-slate-800">{value}</span>
  </div>
);

export default FinanceManagement;
