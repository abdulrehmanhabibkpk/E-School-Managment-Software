import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  Bell,
  Search,
  ChevronRight,
  TrendingUp,
  UserCheck,
  ShieldCheck,
  Globe,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Mail,
  Calendar,
  LogOut,
  Menu,
  X,
  RefreshCw,
  Clock,
  ShieldAlert,
  Server,
  Activity,
  History,
  Cpu,
  ShieldBan,
  FileText,
  Edit,
  Save,
  Trash2,
  Lock,
  Eye,
  Send,
  Plus,
  User,
  Building2,
  GraduationCap,
  BookOpen,
  Phone,
  CheckCircle2,
  AlertCircle,
  Filter,
  Download,
  Share2,
  DollarSign,
  HeartHandshake,
  Bus,
  Library,
  Home,
  Briefcase,
  Award,
  LifeBuoy,
  Stethoscope,
  Utensils,
  Wrench,
  FileCheck,
  Sparkles,
  Languages,
  Sun,
  Moon,
  HelpCircle,
  Check,
  AlertTriangle
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Mock Database Initial Seeds
const INITIAL_SCHOOLS: any[] = [];
const INITIAL_PARENTS: any[] = [];
const INITIAL_STUDENTS: any[] = [];
const INITIAL_TEACHERS: any[] = [];

const INITIAL_BUSES: any[] = [];
const INITIAL_BOOKS: any[] = [];
const INITIAL_HOSTELS: any[] = [];
const INITIAL_FINANCES: any[] = [];
const INITIAL_TICKETS: any[] = [];
const REVENUE_GRAPH_DATA: any[] = [];

interface AdminDashboardProps {
  onBack?: () => void;
}

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  // Localization & Themes
  const [language, setLanguage] = useState<"EN" | "UR">("EN");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Core App States
  const [schools, setSchools] = useState(() => {
    const saved = localStorage.getItem("mms_schools");
    return saved ? JSON.parse(saved) : INITIAL_SCHOOLS;
  });
  const [parents, setParents] = useState(() => {
    const saved = localStorage.getItem("mms_parents");
    return saved ? JSON.parse(saved) : INITIAL_PARENTS;
  });
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem("mms_students");
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });
  const [teachers] = useState(() => {
    const saved = localStorage.getItem("mms_teachers");
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });
  const [finances, setFinances] = useState(() => {
    const saved = localStorage.getItem("mms_finances");
    return saved ? JSON.parse(saved) : INITIAL_FINANCES;
  });

  const [buses] = useState(INITIAL_BUSES);
  const [books] = useState(INITIAL_BOOKS);
  const [hostels] = useState(INITIAL_HOSTELS);
  const [tickets] = useState(INITIAL_TICKETS);

  const [logs, setLogs] = useState<any[]>([
    { id: "l_1", action: "Authorized Super Admin Root Session", user: "System", time: "09:00 AM", module: "Security" },
    { id: "l_2", action: "Synchronized cloud database indices", user: "Super Admin", time: "09:12 AM", module: "Database" },
    { id: "l_3", action: "Verified active SMS/WhatsApp Gateway credentials", user: "System", time: "09:15 AM", module: "Gateway" }
  ]);

  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selectedSchool, setSelectedSchool] = useState<string>("all");

  // Modal Triggers
  const [showAddSchoolModal, setShowAddSchoolModal] = useState<boolean>(false);
  const [showAddParentModal, setShowAddParentModal] = useState<boolean>(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState<boolean>(false);
  const [showCollectFeeModal, setShowCollectFeeModal] = useState<boolean>(false);
  const [showCertModal, setShowCertModal] = useState<any>(null);

  // Form Field States
  const [newSchool, setNewSchool] = useState({ name: "", code: "", type: "Primary & Secondary", city: "" });
  const [newParent, setNewParent] = useState({ name: "", phone: "", email: "", cnic: "", address: "" });
  const [newStudent, setNewStudent] = useState({ name: "", schoolId: "sch_1", grade: "Class 1", section: "A", parentId: "", pendingFee: 0 });
  const [feeForm, setFeeForm] = useState({ studentId: "", amount: "", category: "Tuition Fee", date: new Date().toISOString().split("T")[0] });

  // Users / Requests State
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

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem("mms_schools", JSON.stringify(schools));
    localStorage.setItem("mms_parents", JSON.stringify(parents));
    localStorage.setItem("mms_students", JSON.stringify(students));
    localStorage.setItem("mms_teachers", JSON.stringify(teachers));
    localStorage.setItem("mms_finances", JSON.stringify(finances));
  }, [schools, parents, students, teachers, finances]);

  const addLog = (action: string, module: string) => {
    const newLog = {
      id: "l_" + Date.now(),
      action,
      user: "Super Admin",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      module
    };
    setLogs(prev => [newLog, ...prev.slice(0, 15)]);
  };

  const filteredStudents = useMemo(() => {
    if (selectedSchool === "all") return students;
    return students.filter((s: any) => s.schoolId === selectedSchool);
  }, [students, selectedSchool]);

  const filteredTeachers = useMemo(() => {
    if (selectedSchool === "all") return teachers;
    return teachers.filter((t: any) => t.schoolId === selectedSchool);
  }, [teachers, selectedSchool]);

  const filteredFinances = useMemo(() => {
    if (selectedSchool === "all") return finances;
    return finances.filter((f: any) => f.schoolId === selectedSchool);
  }, [finances, selectedSchool]);

  const totalIncome = useMemo(() => {
    return filteredFinances.filter((f: any) => f.type === "income").reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
  }, [filteredFinances]);

  const totalExpense = useMemo(() => {
    return filteredFinances.filter((f: any) => f.type === "expense").reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
  }, [filteredFinances]);

  const totalPendingFees = useMemo(() => {
    return filteredStudents.reduce((acc: number, curr: any) => acc + Number(curr.pendingFee || 0), 0);
  }, [filteredStudents]);

  const handleCreateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchool.name) return;
    const created = {
      id: "sch_" + Date.now(),
      name: newSchool.name,
      code: newSchool.code || "SCH-" + Math.floor(100 + Math.random() * 900),
      type: newSchool.type,
      city: newSchool.city || "Pakistan",
      totalStudents: 0,
      budget: "₨ 3.0M"
    };
    setSchools([...schools, created]);
    addLog(`Registered new institution: ${created.name}`, "Institutions");
    setShowAddSchoolModal(false);
    setNewSchool({ name: "", code: "", type: "Primary & Secondary", city: "" });
  };

  const handleCreateParent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParent.name || !newParent.phone) return;
    const created = {
      id: "p_" + Date.now(),
      ...newParent,
      children: [],
      status: "active",
      totalDue: 0
    };
    setParents([...parents, created]);
    addLog(`Added parent profile for ${created.name}`, "Parents");
    setShowAddParentModal(false);
    setNewParent({ name: "", phone: "", email: "", cnic: "", address: "" });
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name) return;
    const created = {
      id: "std_" + Date.now(),
      schoolId: newStudent.schoolId,
      name: newStudent.name,
      rollNo: "STD-" + Math.floor(1000 + Math.random() * 9000),
      grade: newStudent.grade,
      section: newStudent.section,
      parentId: newStudent.parentId,
      feeStatus: Number(newStudent.pendingFee) > 0 ? "Pending" : "Paid",
      pendingFee: Number(newStudent.pendingFee) || 0,
      attendance: "100%",
      riskLevel: "Low",
      rfidBalance: 1000
    };
    
    setStudents([...students, created]);

    if (newStudent.parentId) {
      setParents(parents.map((p: any) => {
        if (p.id === newStudent.parentId) {
          return {
            ...p,
            children: [...p.children, created.id],
            totalDue: p.totalDue + created.pendingFee
          };
        }
        return p;
      }));
    }

    addLog(`Enrolled student ${created.name} in grade ${created.grade}`, "Students");
    setShowAddStudentModal(false);
    setNewStudent({ name: "", schoolId: "sch_1", grade: "Class 1", section: "A", parentId: "", pendingFee: 0 });
  };

  const handleCollectFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeForm.studentId || !feeForm.amount) return;

    const std = students.find((s: any) => s.id === feeForm.studentId);
    const amountPaid = Number(feeForm.amount);

    const newTrans = {
      id: "fn_" + Date.now(),
      schoolId: std ? std.schoolId : "sch_1",
      title: `Fee Collected from ${std ? std.name : 'Student'}`,
      amount: amountPaid,
      type: "income",
      category: feeForm.category,
      date: feeForm.date
    };

    setFinances([newTrans, ...finances]);

    if (std) {
      setStudents(students.map((s: any) => {
        if (s.id === std.id) {
          const rem = Math.max(0, s.pendingFee - amountPaid);
          return {
            ...s,
            pendingFee: rem,
            feeStatus: rem === 0 ? "Paid" : "Partial"
          };
        }
        return s;
      }));

      if (std.parentId) {
        setParents(parents.map((p: any) => {
          if (p.id === std.parentId) {
            return {
              ...p,
              totalDue: Math.max(0, p.totalDue - amountPaid)
            };
          }
          return p;
        }));
      }
    }

    addLog(`Collected fee ₨ ${amountPaid.toLocaleString()} for ${std ? std.name : 'Student'}`, "Finance");
    setShowCollectFeeModal(false);
    setFeeForm({ studentId: "", amount: "", category: "Tuition Fee", date: new Date().toISOString().split("T")[0] });
  };

  const toggleParentStatus = (parentId: string) => {
    setParents(parents.map((p: any) => {
      if (p.id === parentId) {
        const nextStatus = p.status === "active" ? "banned" : "active";
        addLog(`Updated parent status to ${nextStatus.toUpperCase()} for ${p.name}`, "Parents");
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  // Language Dictionary
  const t = {
    EN: {
      appName: "EduManage Enterprise",
      tagline: "Multi-Campus Corporate Suite",
      overview: "Overview & AI Analytics",
      schools: "Multi-School Network",
      requests: "Registration Requests",
      parents: "Parent Accounts Portal",
      students: "Students Directory",
      teachers: "Faculty & HR Payroll",
      finance: "Ledger & Fee Management",
      fleet: "Bus Fleet & GPS Tracking",
      library: "Library & ISBN System",
      hostel: "Hostels & Dormitories",
      lms: "LMS & Online Learning",
      exams: "Exams & Report Cards",
      tickets: "Helpdesk & Grievance",
      cafeteria: "Cafeteria RFID Wallet",
      health: "Medical & Health Vault",
      docs: "Digital Document Vault",
      aiRisk: "AI Predictive Attrition",
      gateway: "SMS & WhatsApp Gateway",
      audit: "System Audit Logs",
      roles: "Security & Role Matrix",
      settings: "System Settings",
      collectFee: "Collect Fee",
      addStudent: "Add Student"
    },
    UR: {
      appName: "ایڈو مینیج انٹرپرائز",
      tagline: "ملٹی کیمپس کارپوریٹ پورٹل",
      overview: "خلاصہ اور AI تجزیہ",
      schools: "سکولوں کا نیٹ ورک",
      requests: "نئی درخواستیں",
      parents: "والدین کے اکاؤنٹس",
      students: "طلباء کی ڈائرکٹری",
      teachers: "اساتذہ اور پے رول",
      finance: "مالیات اور فیس کلیکشن",
      fleet: "بسیں اور جی پی ایس ٹریکنگ",
      library: "لائبریری اور کتابیں",
      hostel: "ہاسٹل اور ڈارمیٹری",
      lms: "آن لائن تدریس و LMS",
      exams: "امتحانات اور رزلٹ کارڈ",
      tickets: "شکایات و ہیلپ ڈیسک",
      cafeteria: "کینٹین آر ایف آئی ڈی والیٹ",
      health: "طبی ریکارڈز اور صحت",
      docs: "ڈیجیٹل اسناد و سرٹیفکیٹس",
      aiRisk: "AI خطرناک طالب علموں کا تجزیہ",
      gateway: "ایس ایم ایس و واٹس ایپ گیٹ وے",
      audit: "سسٹم آڈٹ لاگز",
      roles: "سیکیورٹی و سیکیورٹی میٹرکس",
      settings: "سسٹم سیٹنگز",
      collectFee: "فیس وصول کریں",
      addStudent: "طالب علم شامل کریں"
    }
  }[language];

  return (
    <div className={`min-h-screen flex font-sans antialiased transition-colors ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Sidebar */}
      <aside className={`w-72 border-r flex flex-col fixed inset-y-0 z-50 lg:relative transition-all duration-300 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className={`p-6 border-b flex items-center justify-between ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-lg leading-none tracking-tight">{t.appName}</h1>
              <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">{t.tagline}</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Institution Selector */}
        <div className={`p-4 mx-4 my-3 rounded-2xl border ${darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50/80 border-slate-200/60'}`}>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Select Campus</label>
          <select 
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className={`w-full rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer shadow-sm ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}
          >
            <option value="all">🌐 All Network Campuses ({schools.length})</option>
            {schools.map((sch: any) => (
              <option key={sch.id} value={sch.id}>🏫 {sch.name}</option>
            ))}
          </select>
        </div>

        {/* Categorized Navigation List */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          <NavGroup title="Core Management">
            <SidebarNavButton icon={LayoutDashboard} label={t.overview} active={activeTab === "overview"} onClick={() => setActiveTab("overview")} darkMode={darkMode} />
            <SidebarNavButton icon={ShieldAlert} label={t.requests} active={activeTab === "requests"} onClick={() => setActiveTab("requests")} badge={users.length} darkMode={darkMode} />
            <SidebarNavButton icon={Building2} label={t.schools} active={activeTab === "schools"} onClick={() => setActiveTab("schools")} badge={schools.length} darkMode={darkMode} />
            <SidebarNavButton icon={HeartHandshake} label={t.parents} active={activeTab === "parents"} onClick={() => setActiveTab("parents")} badge={parents.length} darkMode={darkMode} />
            <SidebarNavButton icon={GraduationCap} label={t.students} active={activeTab === "students"} onClick={() => setActiveTab("students")} badge={filteredStudents.length} darkMode={darkMode} />
            <SidebarNavButton icon={Users} label={t.teachers} active={activeTab === "teachers"} onClick={() => setActiveTab("teachers")} badge={filteredTeachers.length} darkMode={darkMode} />
          </NavGroup>

          <NavGroup title="Academics & Learning">
            <SidebarNavButton icon={Award} label={t.exams} active={activeTab === "exams"} onClick={() => setActiveTab("exams")} darkMode={darkMode} />
            <SidebarNavButton icon={BookOpen} label={t.lms} active={activeTab === "lms"} onClick={() => setActiveTab("lms")} darkMode={darkMode} />
            <SidebarNavButton icon={Library} label={t.library} active={activeTab === "library"} onClick={() => setActiveTab("library")} badge={books.length} darkMode={darkMode} />
          </NavGroup>

          <NavGroup title="Finance & Operations">
            <SidebarNavButton icon={CreditCard} label={t.finance} active={activeTab === "finance"} onClick={() => setActiveTab("finance")} darkMode={darkMode} />
            <SidebarNavButton icon={Bus} label={t.fleet} active={activeTab === "fleet"} onClick={() => setActiveTab("fleet")} badge={buses.length} darkMode={darkMode} />
            <SidebarNavButton icon={Home} label={t.hostel} active={activeTab === "hostel"} onClick={() => setActiveTab("hostel")} darkMode={darkMode} />
            <SidebarNavButton icon={Utensils} label={t.cafeteria} active={activeTab === "cafeteria"} onClick={() => setActiveTab("cafeteria")} darkMode={darkMode} />
          </NavGroup>

          <NavGroup title="Support & Intelligence">
            <SidebarNavButton icon={Sparkles} label={t.aiRisk} active={activeTab === "aiRisk"} onClick={() => setActiveTab("aiRisk")} badge="AI Live" darkMode={darkMode} />
            <SidebarNavButton icon={LifeBuoy} label={t.tickets} active={activeTab === "tickets"} onClick={() => setActiveTab("tickets")} badge={tickets.length} darkMode={darkMode} />
            <SidebarNavButton icon={Stethoscope} label={t.health} active={activeTab === "health"} onClick={() => setActiveTab("health")} darkMode={darkMode} />
            <SidebarNavButton icon={FileCheck} label={t.docs} active={activeTab === "docs"} onClick={() => setActiveTab("docs")} darkMode={darkMode} />
            <SidebarNavButton icon={Send} label={t.gateway} active={activeTab === "gateway"} onClick={() => setActiveTab("gateway")} darkMode={darkMode} />
            <SidebarNavButton icon={ShieldCheck} label={t.audit} active={activeTab === "audit"} onClick={() => setActiveTab("audit")} darkMode={darkMode} />
            <SidebarNavButton icon={Lock} label={t.roles} active={activeTab === "roles"} onClick={() => setActiveTab("roles")} darkMode={darkMode} />
            <SidebarNavButton icon={Settings} label={t.settings} active={activeTab === "settings"} onClick={() => setActiveTab("settings")} darkMode={darkMode} />
          </NavGroup>
        </nav>

        {/* User Badge */}
        <div className={`p-4 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className={`p-3 rounded-2xl flex items-center gap-3 ${darkMode ? 'bg-slate-800/80' : 'bg-blue-50/60'}`}>
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-md shadow-blue-500/30">
              AR
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">Abdul Rehman Habib</p>
              <p className="text-[10px] text-slate-400 truncate">Super Admin Root</p>
            </div>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout (لاگ آؤٹ)</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className={`h-20 border-b px-6 flex items-center justify-between sticky top-0 z-40 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl lg:hidden">
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden md:block w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search students, CNIC, roll numbers..." 
                className={`w-full border rounded-xl pl-10 pr-4 py-2 text-xs font-medium outline-none transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500'}`}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Language Switcher */}
            <button 
              onClick={() => setLanguage(language === "EN" ? "UR" : "EN")}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
              title="Toggle Language"
            >
              <Languages className="w-4 h-4 text-blue-500" />
              <span>{language}</span>
            </button>

            {/* Dark Mode Switcher */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all ${darkMode ? 'border-slate-700 bg-slate-800 text-yellow-400' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
              title="Toggle Light/Dark Theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1"></div>

            <button onClick={() => setShowCollectFeeModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">{t.collectFee}</span>
            </button>
            <button onClick={() => setShowAddStudentModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t.addStudent}</span>
            </button>
          </div>
        </header>

        {/* Dynamic Body Content area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{t.overview}</h2>
                  <p className="text-slate-400 text-xs mt-1">Real-time enterprise metrics across all linked educational campuses.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    20 Active Modules Connected
                  </span>
                </div>
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Network Enrolled Students" value={filteredStudents.length.toString()} subtitle="Verified Profiles" icon={GraduationCap} color="blue" trend="+12.4%" darkMode={darkMode} />
                <MetricCard title="Guardian Parent Portals" value={parents.length.toString()} subtitle="Registered Accounts" icon={HeartHandshake} color="emerald" trend="100% Active" darkMode={darkMode} />
                <MetricCard title="Total Term Revenue" value={`₨ ${totalIncome.toLocaleString()}`} subtitle="Collected Dues" icon={CreditCard} color="indigo" trend="+18.2%" darkMode={darkMode} />
                <MetricCard title="Pending Outstanding Fees" value={`₨ ${totalPendingFees.toLocaleString()}`} subtitle="Action Required" icon={AlertCircle} color="amber" trend="Follow-up" darkMode={darkMode} />
              </div>

              {/* Charts & System Stream */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className={`lg:col-span-2 p-6 rounded-3xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-base font-bold">Enterprise Finance Stream</h3>
                      <p className="text-xs text-slate-400">Monthly gross income vs operating expenditure</p>
                    </div>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={REVENUE_GRAPH_DATA}>
                        <defs>
                          <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#f1f5f9'} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                        <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', borderRadius: '12px', borderColor: '#334155' }} />
                        <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorInc)" />
                        <Area type="monotone" dataKey="expenses" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" fillOpacity={0} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className={`p-6 rounded-3xl border shadow-sm flex flex-col ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold">Live Activity Log</h3>
                    <RefreshCw className="w-4 h-4 text-slate-400 animate-spin" />
                  </div>
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-72 pr-1 custom-scrollbar">
                    {logs.map((lg: any) => (
                      <div key={lg.id} className={`p-3 rounded-2xl border flex items-start gap-3 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl shrink-0 mt-0.5">
                          <Activity className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold leading-snug">{lg.action}</p>
                          <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                            <span>{lg.user}</span>
                            <span>{lg.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "requests" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">Registration Requests</h2>
                  <p className="text-xs text-slate-400">Review and approve new school registration requests from the website.</p>
                </div>
              </div>

              {users.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <ShieldCheck className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">No Pending Requests</h3>
                  <p className="text-slate-500 text-sm">All caught up! There are no new registration requests at the moment.</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Institution & Applicant</th>
                          <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Contact Info</th>
                          <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Status</th>
                          <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {users.map((u: any) => (
                          <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-900 dark:text-slate-100">{u.madrassaName}</div>
                              <div className="text-xs text-slate-500">Applicant: {u.name}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-slate-700 dark:text-slate-300">{u.email}</div>
                              <div className="text-xs text-slate-500">{u.whatsapp}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                                <AlertCircle className="w-3 h-3" />
                                {u.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button
                                onClick={() => {
                                  if (!confirm("Are you sure you want to approve this request and create a school?")) return;
                                  
                                  const newSchoolId = "sch_" + Date.now();
                                  const newSchool = {
                                    id: newSchoolId,
                                    name: u.madrassaName,
                                    code: "SCH-" + Math.floor(100 + Math.random() * 900),
                                    type: "Primary & Secondary",
                                    city: "Pakistan",
                                    totalStudents: 0,
                                    budget: "₨ 0"
                                  };
                                  
                                  setSchools(prev => [...prev, newSchool]);
                                  
                                  try {
                                    const localUsersStr = localStorage.getItem('users');
                                    if (localUsersStr) {
                                      const allUsers = JSON.parse(localUsersStr);
                                      const updatedUsers = allUsers.map((usr: any) => {
                                        if (usr.id === u.id || usr.email?.toLowerCase() === u.email?.toLowerCase()) {
                                          return {
                                            ...usr,
                                            status: 'accepted',
                                            schoolId: newSchoolId,
                                            madrassaName: u.madrassaName
                                          };
                                        }
                                        return usr;
                                      });
                                      localStorage.setItem('users', JSON.stringify(updatedUsers));
                                      window.dispatchEvent(new Event('storage_updated'));
                                    }
                                  } catch (e) {
                                    console.error("Error updating accepted request user:", e);
                                  }
                                  
                                  addLog(`Approved school registration for ${u.madrassaName}`, "Registration");
                                }}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button
                                onClick={() => {
                                  if (!confirm("Are you sure you want to delete this request?")) return;
                                  try {
                                    const localUsersStr = localStorage.getItem('users');
                                    if (localUsersStr) {
                                      const allUsers = JSON.parse(localUsersStr);
                                      const updatedUsers = allUsers.filter((usr: any) => usr.id !== u.id);
                                      localStorage.setItem('users', JSON.stringify(updatedUsers));
                                      window.dispatchEvent(new Event('storage_updated'));
                                    }
                                  } catch (e) {
                                    console.error("Error deleting request user:", e);
                                  }
                                }}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-500/30 rounded-lg text-xs font-bold transition-colors"
                              >
                                <X className="w-3.5 h-3.5" /> Reject
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
          {activeTab === "exams" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">{t.exams}</h2>
                  <p className="text-xs text-slate-400">Manage term exams, mark sheets, GPA calculations, and generate PDF report cards.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Create Exam Term
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "First Term Midterms 2026", status: "Published", students: 420, avgGpa: "3.42 / 4.0" },
                  { title: "Annual Final Exams 2026", status: "Upcoming", students: 1010, avgGpa: "Pending" },
                  { title: "Quran Memorization Test", status: "Completed", students: 180, avgGpa: "A+ Grade" },
                ].map((ex: any, i: number) => (
                  <div key={i} className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <span className="px-2.5 py-1 bg-blue-500/10 text-blue-500 rounded-full text-[10px] font-bold uppercase">{ex.status}</span>
                    <h3 className="text-base font-bold mt-3">{ex.title}</h3>
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">EVALUATED</span>
                        <p className="font-bold">{ex.students} Students</p>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">AVG PERFORMANCE</span>
                        <p className="font-bold text-emerald-500">{ex.avgGpa}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "fleet" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">{t.fleet}</h2>
                  <p className="text-xs text-slate-400">Track bus routes, drivers, vehicle telematics, and student pick/drop status.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Vehicle
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {buses.map((b: any) => (
                  <div key={b.id} className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-bold">{b.status}</span>
                      <span className="text-xs font-mono text-slate-400">{b.busNo}</span>
                    </div>
                    <h3 className="text-base font-bold">{b.route}</h3>
                    <div className="mt-4 space-y-1 text-xs text-slate-400">
                      <p>Driver: <span className="font-bold text-slate-700 dark:text-slate-200">{b.driver}</span></p>
                      <p>Contact: <span className="font-mono text-slate-700 dark:text-slate-200">{b.phone}</span></p>
                      <p>Seats Capacity: <span className="font-bold text-slate-700 dark:text-slate-200">{b.capacity} Students</span></p>
                    </div>
                    <button className="mt-4 w-full bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white py-2 rounded-xl text-xs font-bold transition-all">
                      📡 Live Telematics GPS Map
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "library" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">{t.library}</h2>
                  <p className="text-xs text-slate-400">Manage book catalog, ISBN lookups, stock counts, and overdue student fines.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Book Title
                </button>
              </div>

              <div className={`rounded-3xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'bg-slate-800/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                      <th className="p-4 pl-6">Book Title & Author</th>
                      <th className="p-4">ISBN Number</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Total Copies</th>
                      <th className="p-4">Currently Issued</th>
                      <th className="p-4 pr-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {books.map((bk: any) => (
                      <tr key={bk.id}>
                        <td className="p-4 pl-6">
                          <p className="font-bold">{bk.title}</p>
                          <p className="text-[10px] text-slate-400">{bk.author}</p>
                        </td>
                        <td className="p-4 font-mono text-slate-400">{bk.isbn}</td>
                        <td className="p-4"><span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded text-[10px] font-bold">{bk.category}</span></td>
                        <td className="p-4 font-bold">{bk.copies}</td>
                        <td className="p-4 font-bold text-amber-500">{bk.issued}</td>
                        <td className="p-4 pr-6 text-right">
                          <button className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all">Issue Book</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "hostel" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">{t.hostel}</h2>
                  <p className="text-xs text-slate-400">Manage boarding hostels, warden contacts, bed allocation, and mess charges.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Hostel Building
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hostels.map((h: any) => (
                  <div key={h.id} className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full font-bold text-[10px]">{h.block}</span>
                      <span className="text-xs font-bold text-emerald-500">{h.rooms - h.occupied} Rooms Free</span>
                    </div>
                    <h3 className="text-lg font-bold">{h.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">Warden: <span className="font-bold text-slate-700 dark:text-slate-200">{h.warden}</span></p>
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">TOTAL CAPACITY</span>
                        <p className="font-bold">{h.rooms} Rooms</p>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">MONTHLY MESS FEE</span>
                        <p className="font-bold text-blue-500">₨ {h.messFee.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "lms" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">{t.lms}</h2>
                  <p className="text-xs text-slate-400">Digital coursework, assignment submissions, video lectures, and online quizzes.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Upload Assignment
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { course: "Grade 10 Mathematics", teacher: "Prof. Shahbaz", module: "Trigonometry & Calculus", status: "Active Quiz" },
                  { course: "Quranic Tafseer & Hadith", teacher: "Qari Abdul Rehman", module: "Surah Al-Baqarah Verses 1-50", status: "Lecture Video" },
                  { course: "Grade 11 Physics", teacher: "Ms. Fatima Noor", module: "Thermodynamics Lab", status: "Assignment Due" },
                ].map((c: any, i: number) => (
                  <div key={i} className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded text-[10px] font-bold">{c.status}</span>
                    <h3 className="text-base font-bold mt-2">{c.course}</h3>
                    <p className="text-xs text-slate-400 mt-1">{c.module}</p>
                    <p className="text-xs font-bold text-slate-500 mt-4">Instructor: {c.teacher}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "aiRisk" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-6 bg-gradient-to-r from-indigo-900 to-purple-900 text-white rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">AI Machine Learning Engine</span>
                  <h2 className="text-2xl font-black mt-2">Student Attrition & Academic Risk Predictor</h2>
                  <p className="text-xs text-indigo-200 mt-1">Identifies students at high risk of dropping out based on fee delays, low attendance & grades.</p>
                </div>
                <button onClick={() => addLog("Triggered full neural network scan on all student records", "AI Analytics")} className="bg-white text-indigo-900 hover:bg-indigo-50 px-5 py-3 rounded-2xl font-bold text-xs shadow-md">
                  ⚡ Run AI Risk Scan
                </button>
              </div>

              <div className={`rounded-3xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'bg-slate-800/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                      <th className="p-4 pl-6">Student Name</th>
                      <th className="p-4">Roll Number</th>
                      <th className="p-4">Attendance %</th>
                      <th className="p-4">Pending Dues</th>
                      <th className="p-4">AI Risk Assessment</th>
                      <th className="p-4 pr-6 text-right">Recommended Intervention</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {students.map((std: any) => (
                      <tr key={std.id}>
                        <td className="p-4 pl-6 font-bold">{std.name}</td>
                        <td className="p-4 font-mono text-slate-400">{std.rollNo}</td>
                        <td className="p-4 font-bold">{std.attendance}</td>
                        <td className="p-4 font-bold text-amber-500">₨ {std.pendingFee.toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${std.riskLevel === 'High' ? 'bg-red-500/20 text-red-500' : std.riskLevel === 'Medium' ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                            {std.riskLevel} Risk
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <button className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all">
                            Counseling Alert
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "cafeteria" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">{t.cafeteria}</h2>
                  <p className="text-xs text-slate-400">Cashless smart RFID student cards, cafeteria meal purchases, and balance top-ups.</p>
                </div>
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Top-Up Student RFID Card
                </button>
              </div>

              <div className={`rounded-3xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'bg-slate-800/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                      <th className="p-4 pl-6">Student Card Holder</th>
                      <th className="p-4">Roll Number</th>
                      <th className="p-4">RFID Card ID</th>
                      <th className="p-4">Wallet Balance</th>
                      <th className="p-4 pr-6 text-right">Quick Recharge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {students.map((std: any) => (
                      <tr key={std.id}>
                        <td className="p-4 pl-6 font-bold">{std.name}</td>
                        <td className="p-4 font-mono text-slate-400">{std.rollNo}</td>
                        <td className="p-4 font-mono text-blue-500">RFID-{std.id.toUpperCase()}</td>
                        <td className="p-4 font-bold text-emerald-500">₨ {std.rfidBalance.toLocaleString()}</td>
                        <td className="p-4 pr-6 text-right">
                          <button 
                            onClick={() => {
                              setStudents(students.map((s: any) => s.id === std.id ? { ...s, rfidBalance: s.rfidBalance + 500 } : s));
                              addLog(`Recharged ₨ 500 RFID balance for ${std.name}`, "Cafeteria");
                            }}
                            className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-xl font-bold hover:bg-emerald-600 hover:text-white transition-all"
                          >
                            + Add ₨ 500
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "docs" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">{t.docs}</h2>
                  <p className="text-xs text-slate-400">Generate digital Transfer Certificates (TC), Character Certificates, and CNIC archives.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {students.map((std: any) => (
                  <div key={std.id} className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <h3 className="text-base font-bold">{std.name}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{std.rollNo}</p>
                    <div className="mt-4 space-y-2">
                      <button onClick={() => setShowCertModal({ std, type: "School Leaving Certificate (TC)" })} className="w-full bg-blue-500/10 text-blue-500 hover:bg-blue-600 hover:text-white py-2 rounded-xl text-xs font-bold transition-all text-center">
                        📄 Leaving Certificate (TC)
                      </button>
                      <button onClick={() => setShowCertModal({ std, type: "Character & Conduct Certificate" })} className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-2 rounded-xl text-xs font-bold transition-all text-center">
                        📜 Character Certificate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "gateway" && (
            <div className="space-y-6 animate-fadeIn max-w-3xl">
              <div>
                <h2 className="text-xl font-black">{t.gateway}</h2>
                <p className="text-xs text-slate-400">Configure Twilio, WhatsApp Business API endpoints, and delivery webhooks.</p>
              </div>

              <div className={`p-6 rounded-3xl border space-y-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div>
                  <label className="text-xs font-bold block mb-1">WhatsApp Business Account SID</label>
                  <input type="text" defaultValue="WA_LIVE_AC99018239012389" className={`w-full p-3 rounded-xl border text-xs font-mono outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">SMS Gateway Auth Token</label>
                  <input type="password" defaultValue="secret_token_key_1029381029" className={`w-full p-3 rounded-xl border text-xs font-mono outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
                </div>
                <button onClick={() => addLog("Saved SMS & WhatsApp API configuration", "Gateway")} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs">
                  Save Gateway Credentials
                </button>
              </div>
            </div>
          )}

          {activeTab === "tickets" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">{t.tickets}</h2>
                  <p className="text-xs text-slate-400">Parent inquiries, grievance ticketing, and SLA tracking.</p>
                </div>
              </div>

              <div className={`rounded-3xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'bg-slate-800/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                      <th className="p-4 pl-6">Parent / Guardian</th>
                      <th className="p-4">Subject</th>
                      <th className="p-4">Priority</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {tickets.map((tck: any) => (
                      <tr key={tck.id}>
                        <td className="p-4 pl-6 font-bold">{tck.parent}</td>
                        <td className="p-4">{tck.subject}</td>
                        <td className="p-4"><span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 font-bold text-[10px] rounded">{tck.priority}</span></td>
                        <td className="p-4"><span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 font-bold text-[10px] rounded">{tck.status}</span></td>
                        <td className="p-4 pr-6 text-right">
                          <button className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all">Reply Ticket</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "audit" && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-black">{t.audit}</h2>
                <p className="text-xs text-slate-400">Immutable security logs, user actions, IP addresses, and compliance timestamps.</p>
              </div>

              <div className={`rounded-3xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'bg-slate-800/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                      <th className="p-4 pl-6">Action Performed</th>
                      <th className="p-4">Operator User</th>
                      <th className="p-4">Module</th>
                      <th className="p-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {logs.map((l: any) => (
                      <tr key={l.id}>
                        <td className="p-4 pl-6 font-bold">{l.action}</td>
                        <td className="p-4 text-slate-400">{l.user}</td>
                        <td className="p-4 font-bold text-blue-500">{l.module}</td>
                        <td className="p-4 font-mono text-slate-400">{l.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "schools" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">{t.schools}</h2>
                  <p className="text-xs text-slate-400">Manage separate campuses and institutional branches.</p>
                </div>
                <button onClick={() => setShowAddSchoolModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold">+ Register Campus</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {schools.map((sch: any) => (
                  <div key={sch.id} className={`p-6 rounded-3xl border flex flex-col justify-between ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div>
                      <span className="px-2.5 py-1 bg-blue-500/10 text-blue-500 rounded-full font-black text-[10px]">{sch.code}</span>
                      <h3 className="text-lg font-bold mt-2">{sch.name}</h3>
                      <p className="text-xs text-slate-400">{sch.type} - {sch.city}</p>
                      <p className="text-xs font-bold text-emerald-500 mt-4">Budget: {sch.budget}</p>
                    </div>
                    <button 
                      onClick={() => {
                        localStorage.setItem('active_school_id', sch.id);
                        localStorage.setItem('currentSchoolName', sch.name);
                        window.dispatchEvent(new Event('storage_updated'));
                        window.location.reload();
                      }}
                      className="mt-4 w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" /> Open Software Panel
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "parents" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">{t.parents}</h2>
                  <p className="text-xs text-slate-400">Manage parents, CNIC, and portal permissions.</p>
                </div>
                <button onClick={() => setShowAddParentModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold">+ Add Parent</button>
              </div>
              <div className={`rounded-3xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'bg-slate-800/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                      <th className="p-4 pl-6">Parent Name</th>
                      <th className="p-4">Contact</th>
                      <th className="p-4">CNIC</th>
                      <th className="p-4">Total Due</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parents.map((p: any) => (
                      <tr key={p.id}>
                        <td className="p-4 pl-6 font-bold">{p.name}</td>
                        <td className="p-4">{p.phone}</td>
                        <td className="p-4 font-mono">{p.cnic}</td>
                        <td className="p-4 font-bold text-amber-500">₨ {p.totalDue.toLocaleString()}</td>
                        <td className="p-4 pr-6 text-right">
                          <button onClick={() => toggleParentStatus(p.id)} className="p-1.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10"><ShieldBan className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "students" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">{t.students}</h2>
                  <p className="text-xs text-slate-400">Enrolled student master roll list.</p>
                </div>
                <button onClick={() => setShowAddStudentModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold">+ Register Student</button>
              </div>
              <div className={`rounded-3xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'bg-slate-800/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                      <th className="p-4 pl-6">Student Name</th>
                      <th className="p-4">Roll No</th>
                      <th className="p-4">Grade</th>
                      <th className="p-4">Attendance</th>
                      <th className="p-4 pr-6 text-right">Pending Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredStudents.map((std: any) => (
                      <tr key={std.id}>
                        <td className="p-4 pl-6 font-bold">{std.name}</td>
                        <td className="p-4 font-mono text-blue-500">{std.rollNo}</td>
                        <td className="p-4">{std.grade} ({std.section})</td>
                        <td className="p-4 font-bold text-emerald-500">{std.attendance}</td>
                        <td className="p-4 pr-6 text-right font-bold text-amber-500">₨ {std.pendingFee.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "teachers" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">{t.teachers}</h2>
                  <p className="text-xs text-slate-400">Faculty profiles and HR monthly payroll.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredTeachers.map((tch: any) => (
                  <div key={tch.id} className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <h3 className="text-base font-bold">{tch.name}</h3>
                    <p className="text-xs text-blue-500 font-bold">{tch.subject}</p>
                    <p className="text-xs text-slate-400 mt-2">{tch.email}</p>
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                      <span className="text-xs text-slate-400">Salary</span>
                      <span className="text-xs font-black">₨ {tch.salary.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "finance" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">{t.finance}</h2>
                  <p className="text-xs text-slate-400">Ledger, tuition fee collection, and operational disburse.</p>
                </div>
                <button onClick={() => setShowCollectFeeModal(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold">+ Record Fee</button>
              </div>
              <div className={`rounded-3xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'bg-slate-800/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                      <th className="p-4 pl-6">Title</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Type</th>
                      <th className="p-4 pr-6 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredFinances.map((f: any) => (
                      <tr key={f.id}>
                        <td className="p-4 pl-6 font-bold">{f.title}</td>
                        <td className="p-4">{f.category}</td>
                        <td className="p-4"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${f.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>{f.type.toUpperCase()}</span></td>
                        <td className="p-4 pr-6 text-right font-black">₨ {Number(f.amount).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "roles" && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-black">{t.roles}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {["Super Admin Root", "Campus Principal", "Teacher Staff", "Accountant Officer", "Parent Portal"].map((r: string, i: number) => (
                  <div key={i} className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <h3 className="text-base font-bold">{r}</h3>
                    <p className="text-xs text-slate-400 mt-2">Configured access rights & privilege matrix.</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6 animate-fadeIn max-w-2xl">
              <h2 className="text-xl font-black">{t.settings}</h2>
              <div className={`p-6 rounded-3xl border space-y-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div>
                  <label className="text-xs font-bold block mb-1">Currency Symbol</label>
                  <input type="text" defaultValue="₨ (PKR)" className={`w-full p-3 rounded-xl border text-xs font-bold outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
                </div>
                <button className="bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl text-xs">Save System Settings</button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Document Certification Modal */}
      {showCertModal && (
        <ModalWrapper title={`Digital Document: ${showCertModal.type}`} onClose={() => setShowCertModal(null)} darkMode={darkMode}>
          <div className="space-y-4 text-center p-4 border-2 border-dashed border-blue-500/40 rounded-2xl">
            <GraduationCap className="w-12 h-12 text-blue-600 mx-auto" />
            <h3 className="text-lg font-black uppercase tracking-wider">{showCertModal.type}</h3>
            <p className="text-xs text-slate-500">This certifies that <strong className="text-slate-900 dark:text-white">{showCertModal.std.name}</strong> (Roll No: {showCertModal.std.rollNo}) has officially completed education requirements with exemplary conduct.</p>
            <div className="pt-4 flex gap-2">
              <button onClick={() => { addLog(`Issued ${showCertModal.type} for ${showCertModal.std.name}`, "Document Vault"); setShowCertModal(null); }} className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs">
                🖨️ Download Signed PDF
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* Register Campus Branch Modal */}
      {showAddSchoolModal && (
        <ModalWrapper title="Register Campus Branch" onClose={() => setShowAddSchoolModal(false)} darkMode={darkMode}>
          <form onSubmit={handleCreateSchool} className="space-y-4">
            <input type="text" required placeholder="Campus Name" value={newSchool.name} onChange={e => setNewSchool({ ...newSchool, name: e.target.value })} className={`w-full p-3 rounded-xl border text-xs ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
            <input type="text" placeholder="Branch Code (e.g. SUU-04)" value={newSchool.code} onChange={e => setNewSchool({ ...newSchool, code: e.target.value })} className={`w-full p-3 rounded-xl border text-xs ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl text-xs">Save Branch</button>
          </form>
        </ModalWrapper>
      )}

      {/* Add Parent Account Modal */}
      {showAddParentModal && (
        <ModalWrapper title="Add Parent Account" onClose={() => setShowAddParentModal(false)} darkMode={darkMode}>
          <form onSubmit={handleCreateParent} className="space-y-4">
            <input type="text" required placeholder="Guardian Full Name" value={newParent.name} onChange={e => setNewParent({ ...newParent, name: e.target.value })} className={`w-full p-3 rounded-xl border text-xs ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
            <input type="text" required placeholder="Mobile / WhatsApp" value={newParent.phone} onChange={e => setNewParent({ ...newParent, phone: e.target.value })} className={`w-full p-3 rounded-xl border text-xs ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl text-xs">Create Parent</button>
          </form>
        </ModalWrapper>
      )}

      {/* Enroll Student Modal */}
      {showAddStudentModal && (
        <ModalWrapper title="Enroll New Student" onClose={() => setShowAddStudentModal(false)} darkMode={darkMode}>
          <form onSubmit={handleCreateStudent} className="space-y-4">
            <input type="text" required placeholder="Student Full Name" value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} className={`w-full p-3 rounded-xl border text-xs ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
            <select value={newStudent.schoolId} onChange={e => setNewStudent({ ...newStudent, schoolId: e.target.value })} className={`w-full p-3 rounded-xl border text-xs ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              {schools.map((sch: any) => <option key={sch.id} value={sch.id}>{sch.name}</option>)}
            </select>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl text-xs">Complete Enrollment</button>
          </form>
        </ModalWrapper>
      )}

      {/* Record Fee Payment Modal */}
      {showCollectFeeModal && (
        <ModalWrapper title="Record Fee Payment" onClose={() => setShowCollectFeeModal(false)} darkMode={darkMode}>
          <form onSubmit={handleCollectFee} className="space-y-4">
            <select required value={feeForm.studentId} onChange={e => { const std = students.find((s: any) => s.id === e.target.value); setFeeForm({ ...feeForm, studentId: e.target.value, amount: std ? std.pendingFee.toString() : "" }); }} className={`w-full p-3 rounded-xl border text-xs ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <option value="">-- Choose Student --</option>
              {students.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.rollNo}) - Due: ₨ {s.pendingFee}</option>)}
            </select>
            <input type="number" required placeholder="Amount Paid (PKR)" value={feeForm.amount} onChange={e => setFeeForm({ ...feeForm, amount: e.target.value })} className={`w-full p-3 rounded-xl border text-xs ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
            <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl text-xs">Confirm Payment & Issue Receipt</button>
          </form>
        </ModalWrapper>
      )}
    </div>
  );
}

interface NavGroupProps {
  title: string;
  children: React.ReactNode;
}

function NavGroup({ title, children }: NavGroupProps) {
  return (
    <div className="py-2">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 block mb-1.5">{title}</span>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

interface SidebarNavButtonProps {
  icon: React.ComponentType<any>;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: string | number;
  darkMode: boolean;
}

function SidebarNavButton({ icon: Icon, label, active, onClick, badge, darkMode }: SidebarNavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
        active 
          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
          : darkMode ? "text-slate-400 hover:bg-slate-800 hover:text-slate-100" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
        <span className="truncate">{label}</span>
      </div>
      {badge !== undefined && (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${active ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  color: "blue" | "emerald" | "indigo" | "amber";
  trend: string;
  darkMode: boolean;
}

function MetricCard({ title, value, subtitle, icon: Icon, color, trend, darkMode }: MetricCardProps) {
  const colorMap = {
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    indigo: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  };

  return (
    <div className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2.5 rounded-2xl border ${colorMap[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">{trend}</span>
        </div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        <h3 className="text-2xl font-black mt-0.5 tracking-tight">{value}</h3>
      </div>
      <p className="text-[11px] text-slate-400 font-medium mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">{subtitle}</p>
    </div>
  );
}

interface ModalWrapperProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  darkMode: boolean;
}

function ModalWrapper({ title, onClose, children, darkMode }: ModalWrapperProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-md rounded-3xl shadow-2xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}>
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold">{title}</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
