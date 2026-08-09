import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Plus, Pencil, Trash2, Search, Filter, 
  Download, Printer, ArrowUpCircle, ArrowDownCircle, 
  Wallet, List, RefreshCw, Landmark, HelpCircle, CheckCircle2, Upload, X
} from 'lucide-react';
import { exportToExcel, importFromExcel } from '../excelUtils';
import { motion, AnimatePresence } from 'motion/react';
import { addToRecycleBin } from './RecycleBin';

interface FinanceManagementProps {
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

const FinanceManagement: React.FC<FinanceManagementProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'heads' | 'accounts' | 'transfer'>('transactions');
  const [showSuccess, setShowSuccess] = useState(false);
  const [printingReceipt, setPrintingReceipt] = useState<Transaction | null>(null);

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

  // Data Persistence
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('fin_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [heads, setHeads] = useState<Head[]>(() => {
    const saved = localStorage.getItem('fin_heads');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Admission Fee', type: 'income' },
      { id: '2', name: 'Tuition Fee', type: 'income' },
      { id: '3', name: 'Staff Salaries', type: 'expense' },
      { id: '4', name: 'Utility Bills', type: 'expense' }
    ];
  });

  const [accounts, setAccounts] = useState<FinancialAccount[]>(() => {
    const saved = localStorage.getItem('fin_accounts');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Main School Cash', balance: 0 },
      { id: '2', name: 'Bank Account', balance: 0 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('fin_transactions', JSON.stringify(transactions));
    localStorage.setItem('fin_heads', JSON.stringify(heads));
    localStorage.setItem('fin_accounts', JSON.stringify(accounts));
  }, [transactions, heads, accounts]);

  // Calculations
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

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

  const [transferForm, setTransferForm] = useState({
    fromAcc: '',
    toAcc: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    details: ''
  });

  // Handlers
  const handleAddTransaction = () => {
    if (!transForm.title || !transForm.headId || !transForm.accountId || transForm.amount === 0) return;
    
    const newTrans: Transaction = {
      ...transForm as Transaction,
      id: `TR-${Date.now()}`
    };

    setTransactions([newTrans, ...transactions]);
    
    // Update Account Balance
    setAccounts(accounts.map(acc => {
      if (acc.id === newTrans.accountId) {
        return {
          ...acc,
          balance: newTrans.type === 'income' ? acc.balance + newTrans.amount : acc.balance - newTrans.amount
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

    if (!window.confirm('Are you sure you want to delete this record?')) return;

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

  const handleTransfer = () => {
    if (!transferForm.fromAcc || !transferForm.toAcc || transferForm.amount <= 0 || transferForm.fromAcc === transferForm.toAcc) return;

    const fromAccount = accounts.find(a => a.id === transferForm.fromAcc);
    const toAccount = accounts.find(a => a.id === transferForm.toAcc);
    if (!fromAccount || !toAccount) return;

    const transferId = Date.now();
    
    // Create Expense Trans for From Account
    const expenseTrans: Transaction = {
      id: `TR-${transferId}-1`,
      date: transferForm.date,
      title: `Funds Transfer Out to ${toAccount.name}`,
      contributor: 'System',
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
      contributor: 'System',
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

  const ReceiptPrint = ({ trans, onClose }: { trans: Transaction, onClose: () => void }) => {
    const head = heads.find(h => h.id === trans.headId);
    const account = accounts.find(a => a.id === trans.accountId);

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="fixed top-6 right-6 no-print flex gap-4">
           <button onClick={() => window.print()} className="bg-blue-600 text-white p-3 rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 font-bold uppercase text-xs tracking-widest">
             <Printer size={18} />
             <span>Print Receipt</span>
           </button>
           <button onClick={onClose} className="bg-white text-slate-800 p-3 rounded-xl shadow-lg hover:bg-slate-100 transition-all">
             <X size={18} />
           </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white w-[148mm] p-12 border-8 border-double border-slate-200 shadow-2xl relative"
        >
           <div className="flex flex-col items-center mb-8 border-b-2 border-slate-100 pb-6">
              {systemSettings.monogram && <img src={systemSettings.monogram} alt="Logo" className="w-20 h-20 object-contain mb-4" />}
              <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{systemSettings.jamiaName}</h1>
              <div className="bg-slate-800 text-white px-6 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mt-2">Official Financial Receipt</div>
           </div>

           <div className="grid grid-cols-2 gap-y-6 text-sm mb-12">
              <ReceiptRow label="Transaction ID" value={trans.id} />
              <ReceiptRow label="Date" value={trans.date} />
              <ReceiptRow label="Type" value={trans.type.toUpperCase()} />
              <ReceiptRow label="Category" value={head?.name || 'N/A'} />
              <ReceiptRow label="Payer/Recipient" value={trans.contributor || 'N/A'} />
              <ReceiptRow label="Payment Source" value={account?.name || 'N/A'} />
              <div className="col-span-2 pt-4 border-t border-slate-100">
                <ReceiptRow label="Description" value={trans.title} />
              </div>
           </div>

           <div className="bg-slate-50 p-8 rounded-3xl flex items-center justify-between border border-slate-200 mb-12">
              <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">Total Amount Paid</span>
              <span className="text-4xl font-black text-slate-900 font-mono">Rs. {trans.amount.toLocaleString()}</span>
           </div>

           <div className="flex justify-between items-end">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">System Generated Receipt</div>
              <div className="flex flex-col items-center gap-2">
                 <div className="w-32 h-px bg-slate-300"></div>
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Treasurer's Signature</span>
              </div>
           </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50" dir="ltr">
      {/* Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 10 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Success: Records Updated</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-[#1e293b] text-white px-8 py-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Wallet size={120} />
        </div>
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-4">
             <button 
               onClick={onBack}
               className="bg-white/10 text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-white/20 transition-all font-bold"
             >
               <ArrowLeft className="w-5 h-5" />
               <div className="flex flex-col items-start">
                 <span>Dashboard</span>
                 <span className="text-[10px] font-normal opacity-70">Main Menu</span>
               </div>
             </button>
             
             <div className="h-10 w-px bg-white/20 mx-2" />

             <div className="flex flex-col">
               <span className="text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Net Balance</span>
               <span className="text-2xl font-black font-mono">Rs. {netBalance.toLocaleString()}</span>
             </div>
          </div>

          <div className="text-right">
             <h1 className="text-2xl font-black uppercase tracking-wider">{systemSettings.jamiaName}</h1>
             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Financial Management Core</p>
          </div>
        </div>

        <div className="flex gap-2">
           <Tab active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} icon={List} label="Transactions" sub="History" />
           <Tab active={activeTab === 'heads'} onClick={() => setActiveTab('heads')} icon={RefreshCw} label="Accounts Heads" sub="Categories" />
           <Tab active={activeTab === 'accounts'} onClick={() => setActiveTab('accounts')} icon={Landmark} label="Accounts" sub="Financial Vaults" />
           <Tab active={activeTab === 'transfer'} onClick={() => setActiveTab('transfer')} icon={RefreshCw} label="Inter-Transfer" sub="Funds Routing" />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
         <AnimatePresence mode="wait">
            {activeTab === 'transactions' && (
              <motion.div key="trans" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                 {/* Transaction Form */}
                 <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                    <div className="flex items-center gap-4 mb-8">
                       <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                          <Plus size={24} />
                       </div>
                       <div>
                          <h3 className="text-xl font-bold text-slate-800">New Transaction Entry</h3>
                          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Add Income or Expense Records</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                       <InputField label="Date" type="date" value={transForm.date} onChange={(v:any) => setTransForm({...transForm, date: v})} />
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Type</label>
                          <div className="flex p-1 bg-slate-100 rounded-2xl">
                             <button onClick={() => setTransForm({...transForm, type: 'income'})} className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all ${transForm.type === 'income' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>Income</button>
                             <button onClick={() => setTransForm({...transForm, type: 'expense'})} className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all ${transForm.type === 'expense' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>Expense</button>
                          </div>
                       </div>
                       <InputField label="Description / Title" value={transForm.title} onChange={(v:any) => setTransForm({...transForm, title: v})} placeholder="e.g. Monthly Tuition Fee Collection" />
                       <InputField label="Contributor / Payer" value={transForm.contributor} onChange={(v:any) => setTransForm({...transForm, contributor: v})} placeholder="Full name of person" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end mt-6">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Head Category</label>
                          <select value={transForm.headId} onChange={e => setTransForm({...transForm, headId: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold focus:ring-4 focus:ring-blue-500/10">
                             <option value="">-- Select Category --</option>
                             {heads.filter(h => h.type === transForm.type).map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                          </select>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Payment Account</label>
                          <select value={transForm.accountId} onChange={e => setTransForm({...transForm, accountId: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold focus:ring-4 focus:ring-blue-500/10">
                             <option value="">-- Select Account --</option>
                             {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                          </select>
                       </div>
                       <InputField label="Amount (PKR)" type="number" value={transForm.amount} onChange={(v:any) => setTransForm({...transForm, amount: parseInt(v) || 0})} placeholder="0" />
                       <button onClick={handleAddTransaction} className="bg-blue-600 text-white h-[56px] rounded-2xl font-bold flex flex-col items-center justify-center gap-0 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 uppercase text-xs tracking-widest">
                          <Plus size={20} />
                          <span>Post Record</span>
                       </button>
                    </div>
                 </div>

                 {/* Transactions Table */}
                 <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="bg-slate-900 p-6 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <List className="text-white/40" size={24} />
                          <h4 className="text-white font-bold text-lg">Transaction Ledger</h4>
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => exportToExcel(transactions, 'transactions')} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-widest">
                             <Download size={16} />
                             <span>Export Excel</span>
                          </button>
                       </div>
                    </div>
                    <div className="overflow-x-auto">
                       <table className="w-full text-left">
                          <thead>
                             <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b">
                                <th className="px-6 py-4 w-16 text-center">#</th>
                                <th className="px-6 py-4 w-32">Date</th>
                                <th className="px-6 py-4">Title / Description</th>
                                <th className="px-6 py-4 text-center">Type</th>
                                <th className="px-6 py-4 text-center">Account</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                             {transactions.map((t, idx) => (
                               <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-6 py-4 text-center text-slate-300 font-mono text-xs">{idx + 1}</td>
                                  <td className="px-6 py-4 text-slate-500 text-xs font-mono">{t.date}</td>
                                  <td className="px-6 py-4">
                                     <div className="font-bold text-slate-800">{t.title}</div>
                                     <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{t.contributor} • {heads.find(h => h.id === t.headId)?.name}</div>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                     <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                        {t.type}
                                     </span>
                                  </td>
                                  <td className="px-6 py-4 text-center text-slate-500 font-bold text-xs">{accounts.find(a => a.id === t.accountId)?.name}</td>
                                  <td className={`px-6 py-4 text-right font-black font-mono ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                     {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString()}
                                  </td>
                                  <td className="px-6 py-4">
                                     <div className="flex justify-center gap-2">
                                        <button onClick={() => setPrintingReceipt(t)} className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-900 hover:text-white transition-all"><Printer size={14} /></button>
                                        <button onClick={() => handleDeleteTransaction(t.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                                     </div>
                                  </td>
                               </tr>
                             ))}
                             {transactions.length === 0 && (
                               <tr><td colSpan={7} className="p-24 text-center text-slate-300 font-bold uppercase text-xs tracking-widest">No transaction history found</td></tr>
                             )}
                          </tbody>
                       </table>
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === 'heads' && (
              <motion.div key="heads" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl mx-auto space-y-8">
                 <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                       <RefreshCw className="text-blue-500" />
                       <span>Account Categories (Heads)</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                       <div className="md:col-span-2">
                          <InputField label="Category Name" value={headForm.name} onChange={(v:any) => setHeadForm({...headForm, name: v})} placeholder="e.g. Utility Bills, Donations" />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Type</label>
                          <select value={headForm.type} onChange={e => setHeadForm({...headForm, type: e.target.value as any})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold focus:ring-4 focus:ring-blue-500/10">
                             <option value="income">Income Category</option>
                             <option value="expense">Expense Category</option>
                          </select>
                       </div>
                       <button onClick={handleAddHead} className="bg-blue-600 text-white h-[52px] rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 uppercase text-xs tracking-widest">Add Head</button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <HeadList type="income" heads={heads.filter(h => h.type === 'income')} onDelete={(id) => setHeads(heads.filter(h => h.id !== id))} />
                    <HeadList type="expense" heads={heads.filter(h => h.type === 'expense')} onDelete={(id) => setHeads(heads.filter(h => h.id !== id))} />
                 </div>
              </motion.div>
            )}

            {activeTab === 'accounts' && (
              <motion.div key="accounts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl mx-auto space-y-8">
                 <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                       <Landmark className="text-blue-500" />
                       <span>Financial Vaults & Accounts</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                       <div className="md:col-span-2">
                          <InputField label="Account Name" value={accForm.name} onChange={(v:any) => setAccForm({...accForm, name: v})} placeholder="e.g. Allied Bank, Cash Counter" />
                       </div>
                       <InputField label="Initial Balance" type="number" value={accForm.balance} onChange={(v:any) => setAccForm({...accForm, balance: parseInt(v) || 0})} placeholder="0" />
                       <button onClick={handleAddAccount} className="bg-blue-600 text-white h-[52px] rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 uppercase text-xs tracking-widest">Open Account</button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {accounts.map(acc => (
                      <div key={acc.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 relative group overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
                            <Landmark size={80} />
                         </div>
                         <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                               <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">{acc.name}</h4>
                               <button onClick={() => setAccounts(accounts.filter(a => a.id !== acc.id))} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                            </div>
                            <div className="flex flex-col">
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Available Funds</span>
                               <span className="text-3xl font-black font-mono text-blue-600">Rs. {acc.balance.toLocaleString()}</span>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </motion.div>
            )}

            {activeTab === 'transfer' && (
              <motion.div key="transfer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl mx-auto">
                 <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden">
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-50 rounded-full opacity-50" />
                    
                    <div className="relative z-10">
                       <div className="flex flex-col items-center text-center mb-10">
                          <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/20 mb-4">
                             <RefreshCw size={32} />
                          </div>
                          <h3 className="text-2xl font-black text-slate-800">Inter-Account Funds Routing</h3>
                          <p className="text-slate-400 text-sm mt-1">Safely transfer balances between registered accounts.</p>
                       </div>

                       <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-6">
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">From Account</label>
                                <select value={transferForm.fromAcc} onChange={e => setTransferForm({...transferForm, fromAcc: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm">
                                   <option value="">-- Source --</option>
                                   {accounts.map(a => <option key={a.id} value={a.id}>{a.name} (Rs. {a.balance})</option>)}
                                </select>
                             </div>
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">To Account</label>
                                <select value={transferForm.toAcc} onChange={e => setTransferForm({...transferForm, toAcc: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm">
                                   <option value="">-- Destination --</option>
                                   {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                             </div>
                          </div>

                          <InputField label="Transfer Amount (PKR)" type="number" value={transferForm.amount} onChange={(v:any) => setTransferForm({...transferForm, amount: parseInt(v) || 0})} placeholder="0" />
                          <InputField label="Routing Date" type="date" value={transferForm.date} onChange={(v:any) => setTransferForm({...transferForm, date: v})} />

                          <button onClick={handleTransfer} className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-bold shadow-2xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3 mt-4 uppercase text-xs tracking-[0.2em]">
                             <RefreshCw size={20} />
                             <span>Execute Transfer</span>
                          </button>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}
         </AnimatePresence>
      </div>

      {printingReceipt && <ReceiptPrint trans={printingReceipt} onClose={() => setPrintingReceipt(null)} />}
    </div>
  );
};

const HeadList = ({ type, heads, onDelete }: any) => (
  <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col">
     <div className={`p-6 text-white font-bold uppercase tracking-widest text-xs flex items-center justify-between ${type === 'income' ? 'bg-emerald-500' : 'bg-red-500'}`}>
        <span>{type} Categories</span>
        {type === 'income' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
     </div>
     <div className="p-4 space-y-2 flex-1 max-h-[400px] overflow-y-auto custom-scrollbar">
        {heads.map((h: any) => (
           <div key={h.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
              <span className="font-bold text-slate-700">{h.name}</span>
              <button onClick={() => onDelete(h.id)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
           </div>
        ))}
        {heads.length === 0 && <div className="p-12 text-center text-slate-300 italic text-xs">No categories listed</div>}
     </div>
  </div>
);

const InputField = ({ label, value, onChange, placeholder, type = 'text' }: any) => (
  <div className="space-y-1.5 w-full">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
    />
  </div>
);

const Tab = ({ active, onClick, icon: Icon, label, sub }: any) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center gap-1 py-4 rounded-t-2xl transition-all border-b-4 ${active ? 'bg-white text-slate-900 border-white' : 'text-white/50 border-transparent hover:bg-white/5 hover:text-white'}`}
  >
    <Icon size={20} className={active ? 'text-blue-600' : ''} />
    <span className="text-xs font-black uppercase tracking-wider">{label}</span>
    <span className="text-[8px] font-bold opacity-40 uppercase tracking-[0.2em]">{sub}</span>
  </button>
);

const ReceiptRow = ({ label, value }: { label: string, value: any }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    <span className="text-sm font-bold text-slate-800">{value}</span>
  </div>
);

export default FinanceManagement;
