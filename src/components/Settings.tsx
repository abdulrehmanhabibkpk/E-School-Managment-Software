import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  X,
  Book,
  GraduationCap,
  MapPin,
  Clock,
  FileText,
  ShieldCheck,
  UserCircle,
  QrCode,
  Trash2,
  RefreshCcw,
  Plus,
  Download,
  Upload,
  AlertCircle,
  ArrowLeft,
  Globe
} from "lucide-react";
import { generateNumericId } from "../lib/idUtils";
import { syncToServer } from "../syncService";
import AccountManagement from "./AccountManagement";
import SuperAdminPanel from "./SuperAdminPanel";
import WebsiteControl from "./WebsiteControl";
import { motion, AnimatePresence } from "motion/react";

interface SettingsProps {
  onBack: () => void;
  onSubViewChange?: (view: string) => void;
}

const SettingButton = ({
  label,
  icon: Icon,
  color = "bg-blue-600",
  active = false,
  onClick,
}: {
  label: string;
  icon?: React.ElementType;
  color?: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full py-4 px-6 rounded-2xl flex items-center justify-start gap-3 transition-all ${active ? "bg-cyan-500 shadow-lg shadow-cyan-500/20" : `${color} hover:opacity-90 shadow-lg shadow-blue-500/10`} text-white font-bold text-sm`}
  >
    {Icon && <Icon className="w-5 h-5" />}
    <span>{label}</span>
  </button>
);

const SubViewHeader = ({
  title,
  onBack,
  extraActions,
}: {
  title: string;
  onBack: () => void;
  extraActions?: React.ReactNode;
}) => (
  <div className="bg-slate-800 p-4 flex items-center justify-between text-white rounded-t-2xl">
    <div className="flex items-center gap-2">
      <button
        onClick={onBack}
        className="hover:bg-white/10 p-2 rounded-lg transition-all"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <h3 className="font-bold text-lg ml-2">{title}</h3>
    </div>
    {extraActions}
  </div>
);

export default function Settings({ onBack, onSubViewChange }: SettingsProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [currentSubView, setCurrentSubView] = useState<string | null>(null);
  const [gradingTab, setGradingTab] = useState<"grades" | "positions">("grades");
  const [addressTab, setAddressTab] = useState<"address" | "district">("address");
  const [systemActiveTab, setSystemActiveTab] = useState("basic_monogram");
  const [isSaving, setIsSaving] = useState(false);

  // System Settings State
  const [systemSettings, setSystemSettings] = useState(() => {
    const defaultSettings = {
      jamiaName: "Modern School Academy",
      registrationPrefix: "MSA-",
      contactNumber: "000-0000000",
      academicYear: "2024-25",
      passingMarks: 40,
      minAttendance: 75,
      monogram: "",
    };
    try {
      const saved = localStorage.getItem("system_settings");
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch (e) {
      return defaultSettings;
    }
  });

  // Dynamic Lists State
  const [grades, setGrades] = useState(() => {
    try {
      const saved = localStorage.getItem("grades");
      return saved ? JSON.parse(saved) : [{ id: 1, name: "Grade 1", code: "01" }];
    } catch (e) {
      return [{ id: 1, name: "Grade 1", code: "01" }];
    }
  });

  const [districts, setDistricts] = useState(() => {
    try {
      const saved = localStorage.getItem("districts");
      const defaultDistricts = ["District A", "District B", "District C"];
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.from(new Set([...defaultDistricts, ...parsed]));
      }
      return defaultDistricts;
    } catch (e) {
      return ["District A", "District B", "District C"];
    }
  });

  const [books, setBooks] = useState(() => {
    try {
      const saved = localStorage.getItem("books");
      return saved ? JSON.parse(saved) : ["English", "Mathematics", "Science", "History"];
    } catch (e) {
      return ["English"];
    }
  });

  const [exams, setExams] = useState(() => {
    try {
      const saved = localStorage.getItem("exams");
      return saved ? JSON.parse(saved) : ["Annual Exam", "Mid-Term", "Quarterly"];
    } catch (e) {
      return ["Annual Exam"];
    }
  });

  const handleSaveSystemSettings = () => {
    setIsSaving(true);
    localStorage.setItem("system_settings", JSON.stringify(systemSettings));
    window.dispatchEvent(new Event("storage_updated"));
    setTimeout(() => setIsSaving(false), 1000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSystemSettings({ ...systemSettings, monogram: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = (list: any[], setList: Function, storageKey: string, newValue: any) => {
    if (!newValue) return;
    const updated = [...list, newValue];
    setList(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    syncToServer();
  };

  const removeItem = (list: any[], setList: Function, storageKey: string, index: number) => {
    const updated = list.filter((_, i) => i !== index);
    setList(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    syncToServer();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir="ltr">
      <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800">System Settings</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Configuration & Management Portal</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSaveSystemSettings} className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
            {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-4">
          <SettingButton label="General Config" active={activeTab === 'basic'} onClick={() => setActiveTab('basic')} icon={SettingsIcon} />
          <SettingButton label="Academic Classes" active={activeTab === 'classes'} onClick={() => setActiveTab('classes')} icon={GraduationCap} color="bg-emerald-600" />
          <SettingButton label="Subject Library" active={activeTab === 'books'} onClick={() => setActiveTab('books')} icon={Book} color="bg-amber-500" />
          <SettingButton label="Examination Types" active={activeTab === 'exams'} onClick={() => setActiveTab('exams')} icon={FileText} color="bg-rose-500" />
          <SettingButton label="Location & Districts" active={activeTab === 'locations'} onClick={() => setActiveTab('locations')} icon={MapPin} color="bg-indigo-600" />
          <div className="h-px bg-slate-200 my-4" />
          <SettingButton label="Manage Users" onClick={() => setCurrentSubView('users')} icon={UserCircle} color="bg-slate-800" />
          <SettingButton label="Website Control" onClick={() => setCurrentSubView('website')} icon={Globe} color="bg-cyan-600" />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden min-h-[600px] flex flex-col">
            <AnimatePresence mode="wait">
              {activeTab === 'basic' && (
                <motion.div key="basic" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-10 space-y-8">
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                      <SettingsIcon size={32} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">General Information</h2>
                      <p className="text-slate-400 text-sm">Configure school name, monogram, and basic system rules.</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center mb-10">
                    <div className="relative group">
                       <div className="w-32 h-32 rounded-[2.5rem] bg-slate-50 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                          {systemSettings.monogram ? (
                            <img src={systemSettings.monogram} alt="Logo" className="w-full h-full object-contain" />
                          ) : (
                            <GraduationCap className="text-slate-200 w-12 h-12" />
                          )}
                       </div>
                       <label className="absolute bottom-0 right-0 p-3 bg-blue-600 text-white rounded-2xl shadow-lg cursor-pointer hover:bg-blue-700 transition-all border-4 border-white">
                          <Upload className="w-4 h-4" />
                          <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                       </label>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Upload School Monogram</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InputField label="School Name" value={systemSettings.jamiaName} onChange={(v:any) => setSystemSettings({...systemSettings, jamiaName: v})} />
                    <InputField label="Registration Prefix" value={systemSettings.registrationPrefix} onChange={(v:any) => setSystemSettings({...systemSettings, registrationPrefix: v})} />
                    <InputField label="Contact Number" value={systemSettings.contactNumber} onChange={(v:any) => setSystemSettings({...systemSettings, contactNumber: v})} />
                    <InputField label="Academic Session" value={systemSettings.academicYear} onChange={(v:any) => setSystemSettings({...systemSettings, academicYear: v})} />
                    <InputField label="Passing Percentage (%)" type="number" value={systemSettings.passingMarks} onChange={(v:any) => setSystemSettings({...systemSettings, passingMarks: parseInt(v) || 0})} />
                    <InputField label="Min Attendance (%)" type="number" value={systemSettings.minAttendance} onChange={(v:any) => setSystemSettings({...systemSettings, minAttendance: parseInt(v) || 0})} />
                  </div>
                </motion.div>
              )}

              {activeTab === 'classes' && (
                <motion.div key="classes" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-10">
                   <ListManager 
                     title="Grade Management" 
                     description="Define academic levels and classes available in your school."
                     items={grades.map((g:any) => g.name)}
                     onAdd={(val:string) => {
                       const newGrade = { id: Date.now(), name: val, code: String(grades.length + 1).padStart(2, '0') };
                       setGrades([...grades, newGrade]);
                       localStorage.setItem('grades', JSON.stringify([...grades, newGrade]));
                     }}
                     onRemove={(idx:number) => {
                       const updated = grades.filter((_:any, i:number) => i !== idx);
                       setGrades(updated);
                       localStorage.setItem('grades', JSON.stringify(updated));
                     }}
                   />
                </motion.div>
              )}

              {activeTab === 'books' && (
                <motion.div key="books" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-10">
                   <ListManager 
                     title="Subject Library" 
                     description="Add or remove core subjects taught across different grades."
                     items={books}
                     onAdd={(val:string) => addItem(books, setBooks, 'books', val)}
                     onRemove={(idx:number) => removeItem(books, setBooks, 'books', idx)}
                   />
                </motion.div>
              )}

              {activeTab === 'exams' && (
                <motion.div key="exams" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-10">
                   <ListManager 
                     title="Assessment Types" 
                     description="Manage official exam types like Quarterly, Mid-Term, or Finals."
                     items={exams}
                     onAdd={(val:string) => addItem(exams, setExams, 'exams', val)}
                     onRemove={(idx:number) => removeItem(exams, setExams, 'exams', idx)}
                   />
                </motion.div>
              )}

              {activeTab === 'locations' && (
                <motion.div key="locations" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-10">
                   <ListManager 
                     title="Geographical Districts" 
                     description="Maintain a list of districts for student enrollment data."
                     items={districts}
                     onAdd={(val:string) => addItem(districts, setDistricts, 'districts', val)}
                     onRemove={(idx:number) => removeItem(districts, setDistricts, 'districts', idx)}
                   />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Overlays for SubViews */}
      <AnimatePresence>
        {currentSubView === 'users' && (
          <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm p-4 flex items-center justify-center">
             <div className="bg-white w-full max-w-4xl h-[80vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
                <SubViewHeader title="User Management" onBack={() => setCurrentSubView(null)} />
                <div className="flex-1 overflow-y-auto">
                   <AccountManagement onBack={() => setCurrentSubView(null)} />
                </div>
             </div>
          </div>
        )}

        {currentSubView === 'website' && (
          <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm p-4 flex items-center justify-center">
             <div className="bg-white w-full max-w-6xl h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
                <SubViewHeader title="Website & Public Portal Control" onBack={() => setCurrentSubView(null)} />
                <div className="flex-1 overflow-y-auto">
                   <WebsiteControl onBack={() => setCurrentSubView(null)} />
                </div>
             </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ListManager = ({ title, description, items, onAdd, onRemove }: any) => {
  const [inputValue, setInputValue] = useState('');
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <p className="text-slate-400 text-sm">{description}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <input 
          type="text" 
          value={inputValue} 
          onChange={e => setInputValue(e.target.value)}
          placeholder="Type here to add new..."
          className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold"
        />
        <button 
          onClick={() => {
            if (inputValue) {
              onAdd(inputValue);
              setInputValue('');
            }
          }}
          className="bg-blue-600 text-white px-8 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2"
        >
          <Plus size={20} />
          <span>Add</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item: string, idx: number) => (
          <div key={idx} className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between group border border-slate-100 hover:border-blue-200 transition-all">
            <span className="font-bold text-slate-700">{item}</span>
            <button onClick={() => onRemove(idx)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const InputField = ({ label, value, onChange, placeholder, type = 'text' }: any) => (
  <div className="space-y-1.5 w-full">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
    />
  </div>
);
