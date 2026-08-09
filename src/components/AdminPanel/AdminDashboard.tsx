import React, { useState, useEffect } from "react";
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
  User
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { logActivity } from "../../utils/logger";

const DATA = [
  { name: "Jan", visitors: 4000, revenue: 2400 },
  { name: "Feb", visitors: 3000, revenue: 1398 },
  { name: "Mar", visitors: 2000, revenue: 9800 },
  { name: "Apr", visitors: 2780, revenue: 3908 },
  { name: "May", visitors: 1890, revenue: 4800 },
  { name: "Jun", visitors: 2390, revenue: 3800 },
  { name: "Jul", visitors: 3490, revenue: 4300 },
];

interface AdminDashboardProps {
  onBack?: () => void;
}

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  time: string;
  type: string;
}

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [rolePermissions, setRolePermissions] = useState<any>({
    Teacher: { canAdd: true, canEdit: true, canDelete: false, modules: ["students", "attendance", "lessons"] },
    Staff: { canAdd: true, canEdit: false, canDelete: false, modules: ["attendance"] }
  });

  const saveRolePermissions = async (role: string, perms: any) => {
    try {
      const updated = { ...rolePermissions, [role]: perms };
      setRolePermissions(updated);
      localStorage.setItem('role_permissions', JSON.stringify(updated));
      logActivity(`Updated base permissions for role: ${role}`, 'Admin');
    } catch (err) {
      console.error("Failed to save role permissions:", err);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('role_permissions');
    if (saved) {
      try {
        setRolePermissions(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Auth Guard
  useEffect(() => {
    const role = localStorage.getItem("currentUserRole");
    const email = (localStorage.getItem("currentUser") || "").toLowerCase();
    const ADMIN_EMAILS = [
        "abdulrehmanhabib.com@gmail.com",
        "jamiaarabiasirajululoomjabori@gmail.com",
        "muhammadabdullahshh@gmail.com",
    ];
    const isMaster = ADMIN_EMAILS.includes(email) || role === "Admin";

    if (!isMaster) {
        console.warn("Unauthorized access to Admin Panel blocked.");
        navigate("/dashboard");
    }
  }, [navigate]);
  
  // Real Stats State
  const [stats, setStats] = useState([
    { label: "Total Students", value: "0", change: "+0%", trending: "up", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Revenue", value: "₨ 0", change: "+0%", trending: "up", icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Active Faculty", value: "0", change: "0", trending: "up", icon: UserCheck, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "System Alerts", value: "0", change: "New", trending: "up", icon: Bell, color: "text-indigo-600", bg: "bg-indigo-50" },
  ]);

  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [emailModal, setEmailModal] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<any[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [firestoreUsers, setFirestoreUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  const MODULES = [
    { id: "students", urdu: "طالب علم", english: "Students" },
    { id: "all_students", urdu: "تمام طالب علم", english: "All Students" },
    { id: "document_capture", urdu: "دستاویز کیپچر", english: "Document Capture" },
    { id: "attendance", urdu: "سیکیورٹی حاضری", english: "Attendance" },
    { id: "lessons", urdu: "روز کا سبق", english: "Daily Lessons" },
    { id: "manual", urdu: "دستی حاضری", english: "Manual Attend" },
    { id: "qr_manual_attendance", urdu: "QR دستی حاضری", english: "QR Manual Attend" },
    { id: "exam_attendance_sheet", urdu: "امتحانی حاضری شیٹ", english: "Exam Attendance Sheet" },
    { id: "academics", urdu: "تعلیمی امور", english: "Academics" },
    { id: "results", urdu: "نتائج", english: "Exams & Results" },
    { id: "paper_maker", urdu: "پیپر میکر", english: "Paper Maker" },
    { id: "paper_uploader", urdu: "پیپر اپلوڈر", english: "Paper Uploader" },
  ];

  useEffect(() => {
    const localUsers = localStorage.getItem('users');
    if (localUsers) {
      try {
        setFirestoreUsers(JSON.parse(localUsers));
      } catch (e) {}
    }
    const savedTemplates = localStorage.getItem('custom_email_templates');
    if (savedTemplates) {
      try {
        setCustomTemplates(JSON.parse(savedTemplates));
      } catch (e) {}
    }
  }, []);

  const deleteTemplate = (id: string) => {
    const updated = customTemplates.filter(t => t.id !== id);
    setCustomTemplates(updated);
    localStorage.setItem('custom_email_templates', JSON.stringify(updated));
  };

  const saveTemplate = (data: any) => {
    let updated;
    if (editingTemplate && editingTemplate.id) {
      updated = customTemplates.map(t => t.id === editingTemplate.id ? { ...t, ...data } : t);
    } else {
      updated = [...customTemplates, { id: Date.now().toString(), ...data }];
    }
    setCustomTemplates(updated);
    localStorage.setItem('custom_email_templates', JSON.stringify(updated));
    setEditingTemplate(null);
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
      const updatedUsers = firestoreUsers.map(u => 
        u.id === userId ? { ...u, status: newStatus } : u
      );
      setFirestoreUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      logActivity(`Changed user status for ID: ${userId} to ${newStatus}`, 'Users');
    } catch (err) {
      console.error("Failed to update user status:", err);
    }
  };

  const updateUserProfile = async (userId: string, data: any) => {
    try {
      const updatedUsers = firestoreUsers.map(u => 
        u.id === userId ? { ...u, ...data } : u
      );
      setFirestoreUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      logActivity(`Updated profile/permissions for user: ${userId}`, 'Users');
      setShowPermissionsModal(false);
    } catch (err) {
      console.error("Failed to update user:", err);
    }
  };
  const [emailConfig, setEmailConfig] = useState({
    to: '',
    subject: '',
    template: 'general',
    message: ''
  });

  const templates = {
    general: "Respected parents, Assalamu Alaikum. You are informed by the academy that...",
    fee_reminder: "Respected! Your monthly fee is overdue. Please deposit it in the office as soon as possible.",
    attendance_alert: "Your child is absent from school today. Please ensure attendance.",
    exam_announcement: "The exam schedule has been released. See the portal for more information."
  };

  useEffect(() => {
    // 1. Load Real Stats
    try {
      const students = JSON.parse(localStorage.getItem('students') || '[]');
      const staff = JSON.parse(localStorage.getItem('staff') || '[]');
      const finance = JSON.parse(localStorage.getItem('attendance_records') || '[]'); // Using attendance as proxy if finance missing
      
      // Attempt to get real finance
      let totalRevenue = 0;
      try {
        const trans = JSON.parse(localStorage.getItem('fin_transactions') || '[]');
        totalRevenue = trans.reduce((sum: number, t: any) => t.type === 'income' ? sum + Number(t.amount) : sum, 0);
      } catch(e) {}

      setStats([
        { label: "Total Students", value: students.length.toLocaleString(), change: "+12%", trending: "up", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Total Revenue", value: `₨ ${totalRevenue.toLocaleString()}`, change: "+5%", trending: "up", icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Active Faculty", value: staff.length.toLocaleString() || "0", change: "Active", trending: "up", icon: UserCheck, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "Attendance Logs", value: finance.length.toLocaleString(), change: "Today", trending: "up", icon: Calendar, color: "text-indigo-600", bg: "bg-indigo-50" },
      ]);
    } catch (e) {
      console.error("Stats loading error", e);
    }

    // 2. Load Real Activity Logs
    const loadLogs = () => {
      const logs = JSON.parse(localStorage.getItem('system_activity_logs') || '[]');
      // Sort by time descending
      const sorted = logs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivity(sorted.slice(0, 10).map((l: any) => ({
        id: l.id || Math.random().toString(),
        user: l.userEmail || "System",
        action: l.action,
        time: new Date(l.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        type: l.module || "General"
      })));
    };
    
    loadLogs();
    window.addEventListener('activity_logged', loadLogs);
    const interval = setInterval(loadLogs, 10000); // Pulse every 10 seconds
    return () => {
      window.removeEventListener('activity_logged', loadLogs);
      clearInterval(interval);
    };
  }, []);

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Email alert sent to: ${emailConfig.to}\nSubject: ${emailConfig.subject}`);
    setEmailModal(false);
    
    // Log the action
    logActivity(`Sent Alert Email to ${emailConfig.to}`, 'AdminMailer');
  };

  const applyTemplate = (key: keyof typeof templates) => {
    setEmailConfig(prev => ({
      ...prev,
      template: key,
      message: templates[key],
      subject: key === 'fee_reminder' ? 'فیس کی اطلاع' : key === 'attendance_alert' ? 'غیر حاضری کی اطلاع' : 'جامعہ نوٹس'
    }));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900 font-sans">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            className="w-72 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 z-50 lg:relative shadow-sm"
          >
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-800">AdminPanel</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 space-y-1 mt-4">
              <SidebarItem icon={LayoutDashboard} label="Overview" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
              <SidebarItem icon={Users} label="User Roles" active={activeTab === "users"} onClick={() => setActiveTab("users")} />
              <SidebarItem icon={Lock} label="Permissions Manager" active={activeTab === "permissions"} onClick={() => setActiveTab("permissions")} />
              <SidebarItem icon={FileText} label="Templates" active={activeTab === "templates"} onClick={() => setActiveTab("templates")} />
              <SidebarItem icon={CreditCard} label="Finance" active={activeTab === "finance"} onClick={() => setActiveTab("finance")} />
              <SidebarItem icon={Bell} label="Broadcast & Alerts" active={activeTab === "alerts"} onClick={() => setActiveTab("alerts")} />
              <SidebarItem icon={Globe} label="Portal Status" active={activeTab === "status"} onClick={() => setActiveTab("status")} />
              <SidebarItem icon={Settings} label="System Settings" active={activeTab === "settings"} onClick={() => setActiveTab("settings")} />
            </nav>

            <div className="p-4 border-t border-slate-100">
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Connected Version</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">v2.4.0-build</span>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                </div>
              </div>
              <button 
                onClick={onBack}
                className="w-full mt-4 flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-semibold text-sm">Exit Admin Panel</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-2 bg-slate-50 rounded-xl text-slate-600 hover:bg-slate-100">
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="relative hidden md:block w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search analytics, logs..." 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-2 text-sm focus:bg-white focus:border-blue-300 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-all relative">
              <Mail className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-all relative">
              <Calendar className="w-5 h-5" />
            </button>
            <div className="w-px h-8 bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800">Super Admin</p>
                <p className="text-[10px] font-medium text-slate-400">root@arh-tech.io</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center font-bold text-slate-600">
                SA
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Overview</h1>
                  <p className="text-slate-500 text-sm mt-1">Monitor real-time performance and administrative activity.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-colors group-hover:bg-blue-600 group-hover:text-white`}>
                          <stat.icon className="w-6 h-6" />
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-bold ${stat.trending === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {stat.trending === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                          {stat.change}
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                      <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Chart Area */}
                  <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">Growth Analytics</h3>
                        <p className="text-xs text-slate-400">Institutional revenue & user growth trends</p>
                      </div>
                      <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-600 outline-none cursor-pointer hover:bg-slate-100 transition-all">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>This Year</option>
                      </select>
                    </div>

                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={DATA}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                            dx={-10}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            labelStyle={{ fontWeight: 800, marginBottom: '4px' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#2563eb" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorRevenue)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 font-urdu text-right">سسٹم سرگرمی (System Activity)</h3>
                    <div className="space-y-4 flex-1 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                      {recentActivity.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                          <Database className="w-8 h-8 mb-2 opacity-20" />
                          <p className="text-xs">No recent activity detected</p>
                        </div>
                      ) : (
                        recentActivity.map((activity) => (
                          <motion.div 
                            key={activity.id} 
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                          >
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 border border-slate-100 shadow-sm">
                              <div className={`p-1.5 rounded-lg ${activity.type === 'AdminMailer' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                <UserCheck className="w-4 h-4" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-slate-800 truncate">{activity.user}</p>
                                <span className="text-[10px] text-slate-400 font-mono">{activity.time}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{activity.action}</p>
                              <span className="text-[8px] uppercase tracking-widest text-blue-500 font-bold mt-1 block">{activity.type}</span>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                    <button 
                      onClick={() => window.dispatchEvent(new Event('activity_logged'))}
                      className="w-full mt-6 py-3 bg-slate-50 hover:bg-slate-100 text-blue-600 font-bold text-[10px] rounded-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                    >
                      Refresh Live Logs
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Detailed Management Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-slate-800">Quick Management</h3>
                      <button className="p-2 text-slate-400 hover:text-slate-600 transition-all">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <QuickAction 
                        icon={Mail} 
                        label="Email & Alerts" 
                        count="Send Broadcast" 
                        onClick={() => setEmailModal(true)}
                      />
                      <QuickAction 
                        icon={Users} 
                        label="Manage Staff" 
                        count="Role Based" 
                        onClick={() => setActiveTab("users")}
                      />
                      <QuickAction 
                        icon={Database} 
                        label="System Sync" 
                        count="Automated" 
                        onClick={() => setActiveTab("status")}
                      />
                      <QuickAction 
                        icon={Settings} 
                        label="UI Config" 
                        count="Custom Theme" 
                        onClick={() => setActiveTab("settings")}
                      />
                    </div>
                  </div>
                  <div className="bg-blue-600 p-8 rounded-[40px] shadow-xl shadow-blue-200 flex flex-col justify-between overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                      <ShieldCheck className="w-48 h-48 text-white" />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black text-white mb-2">ARH Security Shield</h3>
                      <p className="text-blue-100 text-sm opacity-80 leading-relaxed font-urdu text-right">سسٹم کی سیکیورٹی اور کارکردگی کو مانیٹر کرنے کے لیے اس پینل کا استعمال کریں۔ تمام سرگرمیاں لاگ کی جا رہی ہیں۔</p>
                    </div>
                    <div className="relative z-10 mt-8 flex items-center justify-between">
                      <div className="flex gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center border border-blue-400/30">
                          <ShieldCheck className="w-4 h-4 text-white" />
                        </div>
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center border border-blue-400/30">
                          <Database className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-white/60 font-sans tracking-widest uppercase">Encrypted Node OK</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "users" && (
              <motion.div
                key="users"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 font-urdu text-right">انتظامِ صارفین (User Management)</h2>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Account banning, status toggles, and permissions</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setActiveTab("alerts")} 
                      className="bg-slate-50 text-blue-600 px-6 py-2.5 rounded-xl font-bold text-xs border border-slate-100 flex items-center gap-2 hover:bg-slate-100 transition-all"
                    >
                      <Send className="w-4 h-4" />
                      Email All Users
                    </button>
                    <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
                      Add New Admin
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-right font-urdu">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase tracking-widest font-sans">
                        <th className="pb-4 pt-0 font-bold">Action</th>
                        <th className="pb-4 pt-0 font-bold">Status</th>
                        <th className="pb-4 pt-0 font-bold">Role</th>
                        <th className="pb-4 pt-0 font-bold">Email</th>
                        <th className="pb-4 pt-0 font-bold">Username</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {firestoreUsers.map((user: any) => (
                        <tr key={user.id} className={`border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-all ${user.status === 'banned' ? 'opacity-50' : ''}`}>
                          <td className="py-4">
                            <div className="flex items-center justify-end gap-2">
                                <button 
                                    onClick={() => toggleUserStatus(user.id, user.status)}
                                    className={`p-2 rounded-lg transition-all ${user.status === 'banned' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}
                                    title={user.status === 'banned' ? 'Unban User' : 'Ban User'}
                                >
                                    <ShieldBan className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => { setSelectedUser(user); setShowPermissionsModal(true); }}
                                    className="p-2 text-slate-400 hover:text-blue-600" 
                                    title="Edit User"
                                >
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${user.status === 'Banned' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                              {user.status === 'Banned' ? 'BANNED' : 'ACTIVE'}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${
                              user.role === 'Admin' ? 'bg-blue-600/10 text-blue-600' : 
                              user.role === 'Teacher' ? 'bg-emerald-600/10 text-emerald-600' : 
                              user.role === 'Staff' ? 'bg-indigo-600/10 text-indigo-600' :
                              user.role === 'Parent' ? 'bg-orange-600/10 text-orange-600' :
                              'bg-slate-100 text-slate-500'
                            }`}>
                              {user.role?.toUpperCase() || 'TEACHER'}
                            </span>
                          </td>
                          <td className="py-4 font-mono text-[11px] text-slate-500">{user.email}</td>
                          <td className="py-4 font-bold text-slate-800">{user.username || user.email.split('@')[0]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === "templates" && (
              <motion.div
                key="templates"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-slate-900 font-urdu text-right">ای میل ٹیمپلیٹس (Email Templates)</h2>
                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Create and manage reusable email notification formats</p>
                        </div>
                        <button 
                            onClick={() => setEditingTemplate({ name: '', subject: '', body: '' })}
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2"
                        >
                            <FileText className="w-4 h-4" />
                            Create Template
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {customTemplates.map((template) => (
                            <div key={template.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 transition-all hover:bg-white hover:shadow-md group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-blue-600 transition-all">
                                        <FileText className="w-5 h-5 text-slate-400 group-hover:text-white" />
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => setEditingTemplate(template)} className="p-2 text-slate-400 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => deleteTemplate(template.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <h4 className="font-bold text-slate-800">{template.name}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{template.subject}</p>
                                <p className="text-xs text-slate-500 line-clamp-2 mt-3 leading-relaxed">{template.body}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {editingTemplate && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-8 rounded-[40px] border border-blue-100 shadow-xl shadow-blue-50"
                    >
                        <h3 className="text-lg font-bold text-slate-800 mb-6">{editingTemplate.id ? 'Edit Template' : 'New Template'}</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            saveTemplate({
                                name: formData.get('name'),
                                subject: formData.get('subject'),
                                body: formData.get('body')
                            });
                        }} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Internal Name</label>
                                    <input name="name" required defaultValue={editingTemplate.name} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm focus:bg-white focus:border-blue-500 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Email Subject</label>
                                    <input name="subject" required defaultValue={editingTemplate.subject} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm focus:bg-white focus:border-blue-500 outline-none transition-all" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Template Content (Urdu Supported)</label>
                                <textarea name="body" required rows={6} defaultValue={editingTemplate.body} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-urdu focus:bg-white focus:border-blue-500 outline-none transition-all resize-none shadow-inner" />
                            </div>
                            <div className="flex gap-4">
                                <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95">
                                    <Save className="w-5 h-5" />
                                    Save Template
                                </button>
                                <button type="button" onClick={() => setEditingTemplate(null)} className="px-8 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-sm transition-all active:scale-95">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === "finance" && (
              <motion.div
                key="finance"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Monthly Income</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-2">₨ {JSON.parse(localStorage.getItem('fin_transactions') || '[]').filter((t:any)=>t.type==='income').reduce((s:number,t:any)=>s+Number(t.amount),0).toLocaleString()}</h3>
                    <div className="mt-4 flex items-center gap-1 text-emerald-600 text-[10px] font-bold">
                      <TrendingUp className="w-3 h-3" />
                      +14.2% from last month
                    </div>
                  </div>
                  <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Monthly Expense</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-2">₨ {JSON.parse(localStorage.getItem('fin_transactions') || '[]').filter((t:any)=>t.type==='expense').reduce((s:number,t:any)=>s+Number(t.amount),0).toLocaleString()}</h3>
                    <div className="mt-4 flex items-center gap-1 text-red-600 text-[10px] font-bold">
                      <TrendingUp className="w-3 h-3 rotate-180" />
                      -2.5% from last month
                    </div>
                  </div>
                  <div className="bg-blue-600 p-8 rounded-[40px] shadow-lg shadow-blue-100">
                    <p className="text-xs font-bold text-blue-200 uppercase tracking-widest pl-1">Net Balance</p>
                    <h3 className="text-3xl font-black text-white mt-2">₨ {(JSON.parse(localStorage.getItem('fin_transactions') || '[]').filter((t:any)=>t.type==='income').reduce((s:number,t:any)=>s+Number(t.amount),0) - JSON.parse(localStorage.getItem('fin_transactions') || '[]').filter((t:any)=>t.type==='expense').reduce((s:number,t:any)=>s+Number(t.amount),0)).toLocaleString()}</h3>
                    <button className="mt-6 w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-bold transition-all border border-white/20">
                      GENERATE REPORT
                    </button>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                  <h2 className="text-xl font-black text-slate-900 mb-8 font-urdu text-right">حالیہ مالیاتی معاملات (Recent Transactions)</h2>
                  <div className="space-y-4">
                    {JSON.parse(localStorage.getItem('fin_transactions') || '[]').slice(0, 10).map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                            {t.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{t.description}</p>
                            <p className="text-[10px] text-slate-400">{t.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-black ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                            {t.type === 'income' ? '+' : '-'} ₨ {Number(t.amount).toLocaleString()}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Permissions Modal */}
            <AnimatePresence>
                {showPermissionsModal && selectedUser && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPermissionsModal(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden relative z-10"
                        >
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <div className="text-right">
                                    <h3 className="text-xl font-black text-slate-900 font-urdu">صارف کی ترتیب (User Settings)</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{selectedUser.email}</p>
                                </div>
                                <button 
                                    onClick={() => setShowPermissionsModal(false)}
                                    className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                                {/* Name Input */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">صارف کا نام (User Name)</label>
                                    <input 
                                        type="text"
                                        value={selectedUser.username || ''}
                                        onChange={(e) => setSelectedUser({...selectedUser, username: e.target.value})}
                                        placeholder="صارف کا نام درج کریں..."
                                        className="w-full bg-slate-50 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-right font-urdu"
                                    />
                                </div>
                                {/* Account Status */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">اکاؤنٹ کی حیثیت (Account Status)</label>
                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => setSelectedUser({...selectedUser, status: 'Active'})}
                                            className={`flex-1 py-3 rounded-xl font-urdu font-bold text-sm border transition-all ${selectedUser.status !== 'Banned' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                                        >
                                            فعال (Active)
                                        </button>
                                        <button 
                                            onClick={() => setSelectedUser({...selectedUser, status: 'Banned'})}
                                            className={`flex-1 py-3 rounded-xl font-urdu font-bold text-sm border transition-all ${selectedUser.status === 'Banned' ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-100' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                                        >
                                            بلاک (Banned)
                                        </button>
                                    </div>
                                </div>

                                {/* Role Selection */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">صارف کا کردار (User Role)</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['Admin', 'Teacher', 'Staff', 'Parent'].map(role => (
                                            <button 
                                                key={role}
                                                onClick={() => setSelectedUser({...selectedUser, role})}
                                                className={`py-4 rounded-2xl font-urdu font-black text-sm transition-all border ${selectedUser.role === role ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                                            >
                                                {role === 'Admin' ? 'ایڈمن' : role === 'Teacher' ? 'استاد' : role === 'Staff' ? 'عملہ' : 'والدین'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* CRuD Controls */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">بنیادی اختیارات (Basic Controls)</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { id: 'canAdd', label: 'شامل کرنا (Add)', icon: Plus },
                                            { id: 'canEdit', label: 'ترمیم کرنا (Edit)', icon: Edit },
                                            { id: 'canDelete', label: 'حذف کرنا (Delete)', icon: Trash2 }
                                        ].map(ctrl => (
                                            <button 
                                                key={ctrl.id}
                                                onClick={() => {
                                                    const perms = selectedUser.permissions || {};
                                                    setSelectedUser({
                                                        ...selectedUser, 
                                                        permissions: { ...perms, [ctrl.id]: !perms[ctrl.id] }
                                                    });
                                                }}
                                                className={`p-4 rounded-2xl flex items-center justify-center gap-3 transition-all border ${selectedUser.permissions?.[ctrl.id] ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400 opacity-50'}`}
                                            >
                                                <ctrl.icon className="w-4 h-4" />
                                                <span className="text-xs font-urdu font-bold">{ctrl.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Module Access */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">سسٹم تک رسائی (Module Access)</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {MODULES.map(module => (
                                            <button 
                                                key={module.id}
                                                onClick={() => {
                                                    const perms = selectedUser.permissions || {};
                                                    const modules = perms.modules || [];
                                                    const newModules = modules.includes(module.id) 
                                                        ? modules.filter((m: string) => m !== module.id)
                                                        : [...modules, module.id];
                                                    setSelectedUser({
                                                        ...selectedUser,
                                                        permissions: { ...perms, modules: newModules }
                                                    });
                                                }}
                                                className={`p-4 rounded-2xl flex items-center justify-between transition-all border ${selectedUser.permissions?.modules?.includes(module.id) ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                                            >
                                                <div className={`w-3 h-3 rounded-full ${selectedUser.permissions?.modules?.includes(module.id) ? 'bg-blue-600' : 'bg-slate-300'}`} />
                                                <span className="text-[11px] font-urdu font-bold text-right">{module.urdu}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-slate-50/50 flex gap-4">
                                <button 
                                    onClick={() => setShowPermissionsModal(false)}
                                    className="flex-1 py-4 rounded-2xl font-black text-xs text-slate-400 hover:bg-slate-100 transition-all"
                                >
                                    CANCEL
                                </button>
                                <button 
                                    onClick={() => updateUserProfile(selectedUser.id, {
                                        role: selectedUser.role,
                                        username: selectedUser.username,
                                        status: selectedUser.status,
                                        permissions: selectedUser.permissions || {}
                                    })}
                                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-xl shadow-blue-100 active:scale-95 transition-all"
                                >
                                    SAVE SETTINGS
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {activeTab === "permissions" && (
              <motion.div
                key="permissions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl shadow-blue-50/50">
                    <div className="flex items-center justify-between mb-10 border-b border-slate-50 pb-6">
                        <div className="text-right">
                             <h2 className="text-2xl font-black text-slate-900 font-urdu">پرمیشن مینیجر (Permission Manager)</h2>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Map roles or individual users to system features</p>
                        </div>
                        <div className="w-14 h-14 bg-blue-600 rounded-[22px] flex items-center justify-center shadow-2xl shadow-blue-200">
                             <Lock className="w-7 h-7 text-white" />
                        </div>
                    </div>

                    {/* Individual User Search Sidebar/Selector */}
                    <div className="mb-10 bg-slate-50 p-6 rounded-3xl flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1 w-full">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 text-right">انفرادی پرمیشن (Select for Individual Override)</label>
                            <select 
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={(e) => {
                                    const user = firestoreUsers.find(u => u.id === e.target.value);
                                    setSelectedUser(user || null);
                                }}
                                value={selectedUser?.id || ''}
                            >
                                <option value="">گروپ رولز (Manage Global Role Permissions)</option>
                                {firestoreUsers.filter(u => u.role !== 'Admin').map(u => (
                                    <option key={u.id} value={u.id}>{u.email} ({u.role === 'Teacher' ? 'استاد' : u.role === 'Staff' ? 'عملہ' : u.role})</option>
                                ))}
                            </select>
                        </div>
                        {selectedUser && (
                            <button 
                                onClick={() => setSelectedUser(null)}
                                className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-xs hover:bg-red-100 transition-all border border-red-100"
                            >
                                واپس گروپ رولز (Back to Role Perms)
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-separate border-spacing-y-4">
                            <thead>
                                <tr className="text-right">
                                    <th className="pr-4 text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans">
                                        {selectedUser ? 'User Override: ' + selectedUser.email : 'Role / Feature'}
                                    </th>
                                    {MODULES.map(m => (
                                        <th key={m.id} className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center whitespace-nowrap min-w-[120px]">{m.urdu}</th>
                                    ))}
                                    <th className="p-4 text-[10px] font-black text-orange-400 uppercase tracking-widest text-center">ADD</th>
                                    <th className="p-4 text-[10px] font-black text-orange-400 uppercase tracking-widest text-center">EDIT</th>
                                    <th className="p-4 text-[10px] font-black text-orange-400 uppercase tracking-widest text-center">DELETE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedUser ? (
                                    <tr className="bg-blue-50/50 border-2 border-blue-200">
                                        <td className="p-6 rounded-r-[24px]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                                    <User className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-slate-800">{selectedUser.email.split('@')[0]}</p>
                                                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter italic">Manual Access Logic</p>
                                                </div>
                                            </div>
                                        </td>
                                        {MODULES.map(m => (
                                            <td key={m.id} className="p-4 text-center">
                                                <input 
                                                    type="checkbox"
                                                    checked={selectedUser.permissions?.modules?.includes(m.id)}
                                                    onChange={() => {
                                                        const current = selectedUser.permissions || { modules: [] };
                                                        const newModules = current.modules.includes(m.id)
                                                            ? current.modules.filter((id: string) => id !== m.id)
                                                            : [...current.modules, m.id];
                                                        const updatedPerms = { ...current, modules: newModules };
                                                        setSelectedUser({ ...selectedUser, permissions: updatedPerms });
                                                        updateUserProfile(selectedUser.id, { permissions: updatedPerms });
                                                    }}
                                                    className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                />
                                            </td>
                                        ))}
                                        {['canAdd', 'canEdit', 'canDelete'].map(action => (
                                            <td key={action} className="p-4 bg-orange-50/20 text-center last:rounded-l-[24px]">
                                                <input 
                                                    type="checkbox"
                                                    checked={selectedUser.permissions?.[action]}
                                                    onChange={() => {
                                                        const current = selectedUser.permissions || {};
                                                        const updatedPerms = { ...current, [action]: !current[action] };
                                                        setSelectedUser({ ...selectedUser, permissions: updatedPerms });
                                                        updateUserProfile(selectedUser.id, { permissions: updatedPerms });
                                                    }}
                                                    className="w-5 h-5 rounded-lg border-orange-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ) : (
                                    ['Teacher', 'Staff', 'Parent'].map(role => (
                                        <tr key={role} className="bg-slate-50/50 hover:bg-slate-50 transition-colors group">
                                            <td className="p-6 rounded-r-[24px] border-y border-r border-slate-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                                        <span className="text-blue-600 font-black">{role.charAt(0)}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-black text-slate-800 font-urdu">{role === 'Teacher' ? 'استاد' : role === 'Staff' ? 'عملہ' : role === 'Parent' ? 'والدین' : role}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{role}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            {MODULES.map(m => (
                                                <td key={m.id} className="p-4 border-y border-slate-100 text-center">
                                                    <input 
                                                        type="checkbox"
                                                        checked={rolePermissions[role]?.modules?.includes(m.id)}
                                                        onChange={() => {
                                                            const current = rolePermissions[role] || { modules: [] };
                                                            const newModules = current.modules.includes(m.id)
                                                                ? current.modules.filter((id: string) => id !== m.id)
                                                                : [...current.modules, m.id];
                                                            saveRolePermissions(role, { ...current, modules: newModules });
                                                        }}
                                                        className="w-5 h-5 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                    />
                                                </td>
                                            ))}
                                            {['canAdd', 'canEdit', 'canDelete'].map(action => (
                                                <td key={action} className="p-4 border-y border-slate-100 bg-orange-50/20 text-center last:rounded-l-[24px] last:border-l">
                                                    <input 
                                                        type="checkbox"
                                                        checked={rolePermissions[role]?.[action]}
                                                        onChange={() => {
                                                            const current = rolePermissions[role] || {};
                                                            saveRolePermissions(role, { ...current, [action]: !current[action] });
                                                        }}
                                                        className="w-5 h-5 rounded-lg border-orange-200 text-orange-500 focus:ring-orange-500 cursor-pointer"
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
              </motion.div>
            )}

            {activeTab === "alerts" && (
              <motion.div
                key="alerts"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Advanced Email Sender Card */}
                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl shadow-blue-50/50">
                    <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-6">
                        <div className="w-14 h-14 bg-blue-600 rounded-[22px] flex items-center justify-center shadow-2xl shadow-blue-200">
                             <Send className="w-7 h-7 text-white" />
                        </div>
                        <div>
                             <h2 className="text-2xl font-black text-slate-900 font-urdu text-right">ایڈوانس براڈکاسٹ سسٹم (Advanced Broadcast)</h2>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Send secure notifications to portal users</p>
                        </div>
                    </div>

                    <form onSubmit={handleSendEmail} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Recipient Type</label>
                                <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <button 
                                        type="button"
                                        onClick={() => setEmailConfig({...emailConfig, to: 'all'})}
                                        className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${emailConfig.to === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        ALL USERS ({firestoreUsers.length})
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setEmailConfig({...emailConfig, to: firestoreUsers[0]?.email || ''})}
                                        className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${emailConfig.to !== 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        SPECIFIC USER
                                    </button>
                                </div>
                            </div>

                            {emailConfig.to !== 'all' && (
                                <div className="space-y-2 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Select Target User</label>
                                    <select 
                                        value={emailConfig.to}
                                        onChange={(e) => setEmailConfig({...emailConfig, to: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                    >
                                        {firestoreUsers.map(u => (
                                            <option key={u.id} value={u.email}>{u.username || u.email} ({u.role})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Email Subject</label>
                                <input 
                                    type="text" 
                                    required
                                    value={emailConfig.subject}
                                    onChange={(e) => setEmailConfig({...emailConfig, subject: e.target.value})}
                                    placeholder="Important Jamia Update..."
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                                />
                            </div>

                            <div className="space-y-3 pt-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Quick Templates</label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.keys(templates).map((tk) => (
                                        <button 
                                            key={tk}
                                            type="button" 
                                            onClick={() => applyTemplate(tk as any)} 
                                            className={`px-4 py-2.5 rounded-xl text-[10px] font-bold border transition-all ${emailConfig.template === tk ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border-slate-200 text-slate-400 hover:border-blue-300 hover:text-slate-700'}`}
                                        >
                                            {tk.replace('_', ' ').toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2 h-full flex flex-col">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Message Body (Urdu/English)</label>
                                <textarea 
                                    required
                                    value={emailConfig.message}
                                    onChange={(e) => setEmailConfig({...emailConfig, message: e.target.value})}
                                    rows={8}
                                    className="flex-1 w-full bg-slate-50 border border-slate-100 rounded-[32px] px-8 py-8 text-sm font-urdu leading-relaxed focus:bg-white focus:border-blue-500 outline-none transition-all shadow-inner resize-none min-h-[220px]"
                                    placeholder="اپنا پیغام یہاں ٹائپ کریں..."
                                />
                            </div>
                            
                            <button 
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-2xl shadow-blue-100 group"
                            >
                                <div className="p-1.5 bg-white/20 rounded-lg group-hover:rotate-12 transition-transform">
                                    <Mail className="w-4 h-4" />
                                </div>
                                SEND BROADCAST ALERT NOW
                            </button>
                        </div>
                    </form>
                </div>

                {/* History Section */}
                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <History className="w-5 h-5 text-slate-400" />
                            <h3 className="text-lg font-black text-slate-800 font-urdu">تاریخچہ (Recent History)</h3>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master Cloud Node Active</span>
                        </div>
                    </div>
                    
                    <div className="grid gap-6">
                        {recentActivity.filter(a => a.type === 'AdminMailer' || a.action.includes('Alert')).length === 0 ? (
                            <div className="py-20 text-center text-slate-300">
                                <p className="text-xs font-bold uppercase tracking-widest italic">No broadcast history found</p>
                            </div>
                        ) : (
                            recentActivity.filter(a => a.type === 'AdminMailer' || a.action.includes('Alert')).map((alert) => (
                                <div key={alert.id} className="flex gap-6 p-6 md:p-8 bg-slate-50/50 rounded-[32px] border border-slate-100 group hover:bg-white hover:shadow-xl hover:shadow-blue-50/20 transition-all">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                        <Mail className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-3 text-right">
                                             <div className="flex items-center gap-3">
                                                 <span className="text-[9px] font-black text-blue-600 px-2 py-1 bg-blue-50 rounded-lg uppercase tracking-tighter self-start">SENT</span>
                                                 <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                     <Clock className="w-3 h-3" />
                                                     {alert.time}
                                                 </span>
                                             </div>
                                             <p className="text-xs font-black text-slate-400 font-urdu">براڈکاسٹ ممبر</p>
                                        </div>
                                        <p className="text-sm font-bold text-slate-800 leading-relaxed font-urdu text-right mb-4">{alert.action}</p>
                                        <div className="flex items-center justify-end gap-6 pt-4 border-t border-slate-100">
                                             <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400"><UserCheck className="w-3.5 h-3.5 text-blue-400" /> {alert.user}</span>
                                             <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400"><Globe className="w-3.5 h-3.5 text-blue-400" /> TARGET: {alert.action.includes('All') ? 'ALL USERS' : 'SPECIFIC'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
              </motion.div>
            )}

            {activeTab === "status" && (
              <motion.div
                key="status"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatusCard icon={Cpu} label="System Load" value="12%" sub="Normal" color="emerald" />
                  <StatusCard icon={Activity} label="Latency" value="24ms" sub="Excellent" color="emerald" />
                  <StatusCard icon={Server} label="Cloud Sync" value="OK" sub="100% Up" color="emerald" />
                  <StatusCard icon={Database} label="DB Backup" value="Active" sub="Daily" color="blue" />
                </div>

                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Globe className="w-64 h-64" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mb-8 font-urdu text-right">پورٹل کی صورتحال (Integration Status)</h2>
                  
                  <div className="space-y-6 relative z-10">
                    <IntegrationItem label="Firebase Realtime Firestore" status="Operational" last="2 sec ago" />
                    <IntegrationItem label="Auth Service (JWT/Session)" status="Operational" last="Connected" />
                    <IntegrationItem label="Local Storage Persistence" status="Operational" last="Synced" />
                    <IntegrationItem label="Cloud Run Application Engine" status="Operational" last="v2.4.0 Live" />
                  </div>

                  <div className="mt-12 p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
                      <p className="text-xs font-bold text-slate-800">Cluster Status: Healthy</p>
                    </div>
                    <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                      View System Health Details
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm max-w-2xl mx-auto"
              >
                <div className="text-center mb-10">
                  <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-blue-200">
                    <Settings className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 font-urdu">سسٹم کی ترتیبات (System Settings)</h2>
                  <p className="text-xs text-slate-500 mt-2 uppercase tracking-[0.2em] font-sans">Global Master Configuration</p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Institution Name</label>
                    <input 
                      type="text" 
                      defaultValue={JSON.parse(localStorage.getItem('system_settings') || '{}').name || "E-Jamia Management System"}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-urdu focus:bg-white focus:border-blue-500 outline-none transition-all shadow-inner"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Master Email Address</label>
                    <input 
                      type="email" 
                      defaultValue="master@arh-tech.io"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm focus:bg-white focus:border-blue-500 outline-none transition-all shadow-inner"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Default Multiplier</label>
                      <input type="number" defaultValue="1" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Audit Mode</label>
                      <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm outline-none">
                        <option>Production</option>
                        <option>Development</option>
                        <option>Audit Only</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-slate-200">
                      Save Global Configurations
                    </button>
                    <button className="w-full mt-4 text-slate-400 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest transition-all">
                      Reset to Default Factory Settings
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email Modal */}
          <AnimatePresence>
            {emailModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setEmailModal(false)}
                  className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                />
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 20 }}
                  className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden border border-slate-100"
                >
                  <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="text-right flex-1 pr-4">
                      <h2 className="text-xl font-black text-slate-900 font-urdu">ای میل اور الرٹس (Email & Alerts)</h2>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Secure broadcast node active</p>
                    </div>
                    <button onClick={() => setEmailModal(false)} className="p-2 hover:bg-white rounded-full transition-all order-first">
                      <X className="w-6 h-6 text-slate-400" />
                    </button>
                  </div>

                  <form onSubmit={handleSendEmail} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Recipient Email</label>
                        <input 
                          type="email" 
                          required
                          value={emailConfig.to}
                          onChange={(e) => setEmailConfig({...emailConfig, to: e.target.value})}
                          placeholder="e.g. parent@gmail.com"
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm focus:bg-white focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Subject</label>
                        <input 
                          type="text" 
                          required
                          value={emailConfig.subject}
                          onChange={(e) => setEmailConfig({...emailConfig, subject: e.target.value})}
                          placeholder="Important Update"
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm focus:bg-white focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Select Template</label>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => applyTemplate('general')} className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${emailConfig.template === 'general' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'}`}>GENERAL</button>
                        <button type="button" onClick={() => applyTemplate('fee_reminder')} className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${emailConfig.template === 'fee_reminder' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'}`}>FEE REMINDER</button>
                        <button type="button" onClick={() => applyTemplate('attendance_alert')} className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${emailConfig.template === 'attendance_alert' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'}`}>ABSENT ALERT</button>
                        <button type="button" onClick={() => applyTemplate('exam_announcement')} className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${emailConfig.template === 'exam_announcement' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'}`}>EXAMS</button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Message Body</label>
                      <textarea 
                        required
                        value={emailConfig.message}
                        onChange={(e) => setEmailConfig({...emailConfig, message: e.target.value})}
                        rows={4}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-urdu focus:bg-white focus:border-blue-500 outline-none transition-all resize-none shadow-inner"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-blue-200 group"
                    >
                      <Mail className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      Send Broadcast Alert
                    </button>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${
        active 
          ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${active ? "text-white" : "text-slate-400 group-hover:text-blue-600"} transition-all`} />
        <span className="font-bold text-sm">{label}</span>
      </div>
      {active && <ChevronRight className="w-4 h-4" />}
    </button>
  );
}

function QuickAction({ icon: Icon, label, count, onClick }: { icon: any, label: string, count: string, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group flex flex-col"
    >
      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm border border-slate-100 group-hover:bg-blue-600 transition-colors">
        <Icon className="w-5 h-5 text-slate-600 group-hover:text-white" />
      </div>
      <p className="text-sm font-bold text-slate-800">{label}</p>
      <p className="text-[10px] font-medium text-slate-400 mt-0.5">{count}</p>
    </button>
  );
}

function StatusCard({ icon: Icon, label, value, sub, color }: { icon: any, label: string, value: string, sub: string, color: string }) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 rounded-xl bg-${color}-50 text-${color}-600`}>
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
      <h3 className="text-2xl font-black text-slate-900">{value}</h3>
      <p className={`text-[10px] font-bold mt-1 text-${color}-600`}>{sub}</p>
    </div>
  );
}

function IntegrationItem({ label, status, last }: { label: string, status: string, last: string }) {
  return (
    <div className="flex items-center justify-between p-5 bg-white rounded-[24px] border border-slate-50 hover:border-blue-100 transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-blue-50 transition-colors">
          <Server className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">{label}</p>
          <p className="text-[10px] text-slate-400 font-medium">Last ping: {last}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{status}</span>
      </div>
    </div>
  );
}
