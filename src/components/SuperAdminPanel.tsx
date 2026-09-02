import React, { useState, useEffect, useMemo, useRef } from "react";
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
import { db, setDoc, doc, collection, getDocs, deleteDoc, onSnapshot } from '../firebase';
import { syncToServer, updateCentralKey } from '../syncService';
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

// Mock Database Initial Seeds - Default to Empty Real Data State
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

  // Helper to load or build real registered school
  const loadRealRegisteredSchool = () => {
    let jamiaName = "Modern School Academy";
    let phone = "0319-5702823";
    let code = "SCH-001";
    let principal = "Principal / Administrator";

    try {
      const sysStr = localStorage.getItem("system_settings");
      if (sysStr) {
        const sys = JSON.parse(sysStr);
        if (sys.jamiaName) jamiaName = sys.jamiaName;
        if (sys.contactNumber) phone = sys.contactNumber;
        if (sys.registrationPrefix) code = `${sys.registrationPrefix}001`;
      }
    } catch (e) {}

    let realStudentsCount = 0;
    try {
      const stdStr = localStorage.getItem("students") || localStorage.getItem("studentList");
      if (stdStr) {
        const stdArr = JSON.parse(stdStr);
        if (Array.isArray(stdArr)) realStudentsCount = stdArr.length;
      }
    } catch (e) {}

    let realTeachersCount = 0;
    try {
      const stfStr = localStorage.getItem("staff") || localStorage.getItem("users");
      if (stfStr) {
        const stfArr = JSON.parse(stfStr);
        if (Array.isArray(stfArr)) realTeachersCount = stfArr.length;
      }
    } catch (e) {}

    const defaultRegisteredSchool = {
      id: "comp_1",
      name: jamiaName,
      code: code || "COMP-1",
      type: "Registered Main Campus",
      city: "Pakistan",
      principal: principal,
      phone: phone,
      email: "info@assanaccounts.com",
      studentsCount: realStudentsCount,
      teachersCount: realTeachersCount,
      monthlyFee: 15000,
      paymentStatus: "PAID",
      dueMonth: "September 2026",
      lastPaidDate: new Date().toISOString().split("T")[0],
      lastPaidAmount: 15000,
      packagePlan: "Enterprise",
      enabledFeatures: [
        "exams", "lms", "library", "fleet", "hostel",
        "cafeteria", "health", "docs", "gateway", "aiRisk", "tickets"
      ]
    };

    const dummyNames = ["Siraj-ul-Uloom Academy", "Apex Model School", "Oasis Girls College"];
    const saved = localStorage.getItem("mms_schools");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out legacy dummy mock schools
          const filtered = parsed.filter((s: any) => !dummyNames.includes(s.name));
          if (filtered.length > 0) {
            const synced = filtered.map((s: any) => {
              if (s.id === "sch_1" || s.id === "comp_1") {
                return {
                  ...s,
                  id: "comp_1",
                  name: s.name || jamiaName,
                  studentsCount: realStudentsCount,
                  teachersCount: realTeachersCount
                };
              }
              return s;
            });
            localStorage.setItem("mms_schools", JSON.stringify(synced));
            setDoc(doc(db, "schools", "comp_1"), synced[0]).catch(() => {});
            return synced;
          }
        }
      } catch (e) {}
    }

    localStorage.setItem("mms_schools", JSON.stringify([defaultRegisteredSchool]));
    setDoc(doc(db, "schools", "comp_1"), defaultRegisteredSchool).catch(() => {});
    return [defaultRegisteredSchool];
  };

  // Core App States
  const [schools, setSchools] = useState(() => loadRealRegisteredSchool());
  const [parents, setParents] = useState(() => {
    const saved = localStorage.getItem("mms_parents");
    return saved ? JSON.parse(saved) : INITIAL_PARENTS;
  });
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem("students") || localStorage.getItem("mms_students") || localStorage.getItem("parent_portal_students");
    return saved ? JSON.parse(saved) : [];
  });
  const [teachers, setTeachers] = useState(() => {
    const saved = localStorage.getItem("staff") || localStorage.getItem("mms_teachers") || localStorage.getItem("teachers");
    return saved ? JSON.parse(saved) : [];
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

  // Package Plans & Optional Features Definition
  const ALL_FEATURES = [
    { key: "exams", label: "Exams & Report Cards", icon: Award },
    { key: "lms", label: "LMS & Online Learning", icon: BookOpen },
    { key: "library", label: "Library & ISBN System", icon: Library },
    { key: "fleet", label: "Bus Fleet & GPS Tracking", icon: Bus },
    { key: "hostel", label: "Hostels & Dormitories", icon: Home },
    { key: "cafeteria", label: "Cafeteria RFID Wallet", icon: Utensils },
    { key: "health", label: "Medical & Health Vault", icon: Stethoscope },
    { key: "docs", label: "Digital Document Vault", icon: FileCheck },
    { key: "gateway", label: "SMS & WhatsApp Gateway", icon: Send },
    { key: "aiRisk", label: "AI Predictive Attrition", icon: Sparkles },
    { key: "tickets", label: "Helpdesk & Grievance", icon: LifeBuoy }
  ];

  const PACKAGE_PRESETS: Record<string, string[]> = {
    Basic: ["exams", "docs", "tickets"],
    Standard: ["exams", "lms", "library", "fleet", "docs", "tickets", "gateway"],
    Enterprise: ["exams", "lms", "library", "fleet", "hostel", "cafeteria", "health", "docs", "gateway", "aiRisk", "tickets"]
  };

  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [financeSchoolFilter, setFinanceSchoolFilter] = useState<string>("all");
  const [financeStatusFilter, setFinanceStatusFilter] = useState<string>("all");

  // Modal Triggers
  const [showAddSchoolModal, setShowAddSchoolModal] = useState<boolean>(false);
  const [showPayMonthlyModal, setShowPayMonthlyModal] = useState<boolean>(false);
  const [showCertModal, setShowCertModal] = useState<any>(null);
  const [editingCampusFeatures, setEditingCampusFeatures] = useState<any>(null);
  const [inspectingSchool, setInspectingSchool] = useState<any>(null);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState<any>(null);
  const [newPasswordInput, setNewPasswordInput] = useState<string>("");
  const [inspectorTab, setInspectorTab] = useState<"overview" | "students" | "teachers" | "security">("overview");

  // Form Field States
  const [newSchool, setNewSchool] = useState({
    name: "",
    code: "",
    type: "Primary & Secondary",
    city: "Pakistan",
    principal: "",
    phone: "",
    packagePlan: "Enterprise",
    enabledFeatures: PACKAGE_PRESETS.Enterprise
  });

  const [monthlyPaymentForm, setMonthlyPaymentForm] = useState({
    schoolId: "",
    amount: "",
    forMonth: "September 2026",
    paymentMethod: "Bank Transfer",
    referenceId: "",
    notes: ""
  });

  // Users / Requests State
  const [users, setUsers] = useState<any[]>([]);

  // Listen for pending requests and real-time synchronized corporate data from local storage
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

    const loadSyncedMmsData = () => {
      try {
        const dummyNames = ["Siraj-ul-Uloom Academy", "Apex Model School", "Oasis Girls College"];
        const savedSchools = localStorage.getItem("mms_schools");
        if (savedSchools) {
          const parsed = JSON.parse(savedSchools);
          if (Array.isArray(parsed)) {
            const clean = parsed.filter((s: any) => !dummyNames.includes(s.name));
            setSchools(prev => JSON.stringify(prev) === JSON.stringify(clean) ? prev : clean);
          }
        }
        const savedParents = localStorage.getItem("mms_parents");
        if (savedParents) {
          const parsed = JSON.parse(savedParents);
          setParents(prev => JSON.stringify(prev) === JSON.stringify(parsed) ? prev : parsed);
        }
        const savedStudents = localStorage.getItem("students") || localStorage.getItem("mms_students") || localStorage.getItem("parent_portal_students");
        if (savedStudents) {
          const parsed = JSON.parse(savedStudents);
          setStudents(prev => JSON.stringify(prev) === JSON.stringify(parsed) ? prev : parsed);
        }
        const savedTeachers = localStorage.getItem("staff") || localStorage.getItem("mms_teachers") || localStorage.getItem("teachers");
        if (savedTeachers) {
          const parsed = JSON.parse(savedTeachers);
          setTeachers(prev => JSON.stringify(prev) === JSON.stringify(parsed) ? prev : parsed);
        }
        const savedFinances = localStorage.getItem("mms_finances");
        if (savedFinances) {
          const parsed = JSON.parse(savedFinances);
          setFinances(prev => JSON.stringify(prev) === JSON.stringify(parsed) ? prev : parsed);
        }
      } catch (e) {
        console.error("Error reading synced corporate data:", e);
      }
    };
    loadSyncedMmsData();

    const handleStorageUpdate = () => {
      loadPendingUsers();
      loadSyncedMmsData();
    };

    // Firestore real-time listener for "schools" collection (e.g. comp_1, comp_2)
    const unsubSchools = onSnapshot(collection(db, "schools"), (snapshot) => {
      if (!snapshot.empty) {
        const dummyNames = ["Siraj-ul-Uloom Academy", "Apex Model School", "Oasis Girls College"];
        const firestoreList: any[] = [];
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data() || {};
          const name = data.name || data.jamiaName || (docSnap.id === 'comp_1' ? "Modern School Academy" : `Campus ${docSnap.id}`);
          if (!dummyNames.includes(name)) {
            firestoreList.push({
              id: docSnap.id,
              name,
              code: data.code || docSnap.id.toUpperCase(),
              type: data.type || "Registered Campus",
              city: data.city || "Pakistan",
              principal: data.principal || data.contactPerson || "Principal / Administrator",
              phone: data.phone || data.contactNumber || "0300-0000000",
              email: data.email || "info@assanaccounts.com",
              studentsCount: data.studentsCount || 0,
              teachersCount: data.teachersCount || 0,
              monthlyFee: data.monthlyFee || 15000,
              paymentStatus: data.paymentStatus || "PAID",
              dueMonth: data.dueMonth || "September 2026",
              lastPaidDate: data.lastPaidDate || new Date().toISOString().split("T")[0],
              lastPaidAmount: data.lastPaidAmount || 15000,
              packagePlan: data.packagePlan || "Enterprise",
              status: data.status || "ACTIVE",
              adminPassword: data.adminPassword || "admin123",
              enabledFeatures: data.enabledFeatures || [
                "exams", "lms", "library", "fleet", "hostel",
                "cafeteria", "health", "docs", "gateway", "aiRisk", "tickets"
              ]
            });
          }
        });
        if (firestoreList.length > 0) {
          localStorage.setItem("mms_schools", JSON.stringify(firestoreList));
          setSchools(prev => JSON.stringify(prev) === JSON.stringify(firestoreList) ? prev : firestoreList);
        }
      }
    }, (error) => {
      console.warn("Firestore schools listener:", error);
    });

    // Firestore real-time listener for global state/students & state/mms_students
    const unsubStudents = onSnapshot(doc(db, "state", "mms_students"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()?.data;
        if (Array.isArray(data) && data.length > 0) {
          setStudents(prev => JSON.stringify(prev) === JSON.stringify(data) ? prev : data);
        }
      }
    }, (err) => console.warn("Firestore mms_students listener error:", err));

    // Firestore real-time listener for global state/mms_teachers & state/staff
    const unsubTeachers = onSnapshot(doc(db, "state", "mms_teachers"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()?.data;
        if (Array.isArray(data) && data.length > 0) {
          setTeachers(prev => JSON.stringify(prev) === JSON.stringify(data) ? prev : data);
        }
      }
    }, (err) => console.warn("Firestore mms_teachers listener error:", err));

    window.addEventListener('storage_updated', handleStorageUpdate);
    return () => {
      unsubSchools();
      unsubStudents();
      unsubTeachers();
      window.removeEventListener('storage_updated', handleStorageUpdate);
    };
  }, []);

  // Dedicated real-time sync for inspectingSchool from Firestore
  useEffect(() => {
    if (!inspectingSchool) return;

    const schId = inspectingSchool.id;

    // Listen to real-time changes of the selected school document in Firestore
    const unsubDoc = onSnapshot(doc(db, "schools", schId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() || {};
        setInspectingSchool((prev: any) => prev ? {
          ...prev,
          name: data.name || prev.name,
          code: data.code || prev.code,
          principal: data.principal || prev.principal,
          phone: data.phone || prev.phone,
          status: data.status || prev.status,
          adminPassword: data.adminPassword || prev.adminPassword,
          paymentStatus: data.paymentStatus || prev.paymentStatus,
          monthlyFee: data.monthlyFee || prev.monthlyFee,
        } : null);
      }
    }, (err) => console.warn("Firestore inspect doc error:", err));

    // Listen to campus-specific students in Firestore
    const unsubCampusStudents = onSnapshot(doc(db, `schools/${schId}/state`, "mms_students"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()?.data;
        if (Array.isArray(data)) {
          setStudents(prev => {
            const merged = [...prev];
            data.forEach((std: any) => {
              const idx = merged.findIndex((x: any) => x.id === std.id);
              if (idx >= 0) merged[idx] = std;
              else merged.push(std);
            });
            return merged;
          });
        }
      }
    }, (err) => console.warn("Firestore campus students error:", err));

    return () => {
      unsubDoc();
      unsubCampusStudents();
    };
  }, [inspectingSchool?.id]);

  // Sync state to local storage and Firestore
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    updateCentralKey("mms_schools", schools);
  }, [schools]);

  useEffect(() => {
    updateCentralKey("mms_parents", parents);
  }, [parents]);

  useEffect(() => {
    updateCentralKey("mms_students", students);
  }, [students]);

  useEffect(() => {
    updateCentralKey("mms_teachers", teachers);
  }, [teachers]);

  useEffect(() => {
    updateCentralKey("mms_finances", finances);
  }, [finances]);

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
      principal: newSchool.principal || "Principal Officer",
      phone: newSchool.phone || "0300-0000000",
      packagePlan: newSchool.packagePlan || "Enterprise",
      enabledFeatures: newSchool.enabledFeatures || PACKAGE_PRESETS[newSchool.packagePlan] || PACKAGE_PRESETS.Enterprise,
      studentsCount: 0,
      teachersCount: 0,
      monthlyFee: 15000,
      paymentStatus: "PAID",
      dueMonth: "September 2026",
      lastPaidDate: new Date().toISOString().split("T")[0],
      lastPaidAmount: 15000
    };
    const updated = [...schools, created];
    setSchools(updated);
    localStorage.setItem("mms_schools", JSON.stringify(updated));
    setDoc(doc(db, "schools", created.id), created).catch(console.error);
    addLog(`Registered new campus: ${created.name} (${created.packagePlan} Package)`, "Schools");
    setShowAddSchoolModal(false);
    setNewSchool({
      name: "",
      code: "",
      type: "Primary & Secondary",
      city: "Pakistan",
      principal: "",
      phone: "",
      packagePlan: "Enterprise",
      enabledFeatures: PACKAGE_PRESETS.Enterprise
    });
  };

  const handleToggleCampusFeature = (campusId: string, featureKey: string) => {
    setSchools((prev: any[]) =>
      prev.map((s) => {
        if (s.id !== campusId) return s;
        const currentFeatures: string[] = s.enabledFeatures || PACKAGE_PRESETS[s.packagePlan] || PACKAGE_PRESETS.Enterprise;
        const exists = currentFeatures.includes(featureKey);
        const updatedFeatures = exists
          ? currentFeatures.filter((f) => f !== featureKey)
          : [...currentFeatures, featureKey];
        return {
          ...s,
          packagePlan: "Custom",
          enabledFeatures: updatedFeatures
        };
      })
    );
    addLog(`Updated feature access for campus ${campusId}`, "SaaS Control");
  };

  const handleChangeCampusPackage = (campusId: string, plan: string) => {
    const preset = PACKAGE_PRESETS[plan] || PACKAGE_PRESETS.Enterprise;
    setSchools((prev: any[]) =>
      prev.map((s) => {
        if (s.id !== campusId) return s;
        return {
          ...s,
          packagePlan: plan,
          enabledFeatures: preset
        };
      })
    );
    addLog(`Changed campus ${campusId} package plan to ${plan}`, "SaaS Control");
  };

  const handleDeleteCampus = (campusId: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name}? This will delete all branch records.`)) {
      const updated = schools.filter((s: any) => s.id !== campusId);
      setSchools(updated);
      localStorage.setItem("mms_schools", JSON.stringify(updated));
      updateCentralKey("mms_schools", updated);
      if (selectedSchool === campusId) setSelectedSchool("all");
      deleteDoc(doc(db, "schools", campusId)).catch(console.error);
      addLog(`Deleted campus branch: ${name}`, "Institutions");
    }
  };

  const handleResetPassword = (schoolId: string, schoolName: string, newPass: string) => {
    if (!newPass.trim()) {
      alert("Please enter a valid new password.");
      return;
    }
    const updated = schools.map((s: any) => s.id === schoolId ? { ...s, adminPassword: newPass } : s);
    setSchools(updated);
    localStorage.setItem("mms_schools", JSON.stringify(updated));
    updateCentralKey("mms_schools", updated);
    setDoc(doc(db, "schools", schoolId), { adminPassword: newPass }, { merge: true }).catch(console.error);
    addLog(`Reset Admin Password for ${schoolName}`, "Security");
    alert(`Password for ${schoolName} reset successfully to: ${newPass}`);
    setShowResetPasswordModal(null);
    setNewPasswordInput("");
    if (inspectingSchool && inspectingSchool.id === schoolId) {
      setInspectingSchool({ ...inspectingSchool, adminPassword: newPass });
    }
  };

  const handleToggleBanSchool = (schoolId: string, schoolName: string, currentStatus?: string) => {
    const isBanned = currentStatus === "BANNED";
    const newStatus = isBanned ? "ACTIVE" : "BANNED";
    const actionName = isBanned ? "Unbanned / Reactivated" : "Banned / Suspended";

    if (window.confirm(`Are you sure you want to ${isBanned ? 'Unban and reactivate' : 'Ban and suspend access for'} ${schoolName}?`)) {
      const updated = schools.map((s: any) => s.id === schoolId ? { ...s, status: newStatus } : s);
      setSchools(updated);
      localStorage.setItem("mms_schools", JSON.stringify(updated));
      updateCentralKey("mms_schools", updated);
      setDoc(doc(db, "schools", schoolId), { status: newStatus }, { merge: true }).catch(console.error);
      addLog(`${actionName} school campus: ${schoolName}`, "Security");
      if (inspectingSchool && inspectingSchool.id === schoolId) {
        setInspectingSchool({ ...inspectingSchool, status: newStatus });
      }
    }
  };

  const handleRecordMonthlyPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!monthlyPaymentForm.schoolId || !monthlyPaymentForm.amount) return;

    const targetSchool = schools.find((s: any) => s.id === monthlyPaymentForm.schoolId);
    const schoolName = targetSchool ? targetSchool.name : "School";

    const updatedSchools = schools.map((s: any) => {
      if (s.id === monthlyPaymentForm.schoolId) {
        return {
          ...s,
          paymentStatus: "PAID",
          lastPaidDate: new Date().toISOString().split("T")[0],
          lastPaidAmount: Number(monthlyPaymentForm.amount),
          dueMonth: monthlyPaymentForm.forMonth || "September 2026"
        };
      }
      return s;
    });

    setSchools(updatedSchools);
    updateCentralKey("mms_schools", updatedSchools);

    const newRecord = {
      id: "fin_" + Date.now(),
      schoolId: monthlyPaymentForm.schoolId,
      schoolName,
      title: `Monthly Subscription Fee from ${schoolName}`,
      type: "income",
      category: "SaaS Subscription Collection",
      amount: Number(monthlyPaymentForm.amount),
      date: new Date().toISOString().split("T")[0],
      paymentMethod: monthlyPaymentForm.paymentMethod,
      referenceId: monthlyPaymentForm.referenceId || "REF-" + Math.floor(1000 + Math.random() * 9000),
      notes: monthlyPaymentForm.notes || `Monthly fee collected for ${monthlyPaymentForm.forMonth}`,
      status: "Paid"
    };

    setFinances((prev: any[]) => [newRecord, ...prev]);
    updateCentralKey("mms_finances", [newRecord, ...finances]);

    addLog(`Recorded monthly payment of ₨ ${Number(monthlyPaymentForm.amount).toLocaleString()} for ${schoolName} (${monthlyPaymentForm.forMonth})`, "SaaS Billing");

    setShowPayMonthlyModal(false);
    setMonthlyPaymentForm({
      schoolId: "",
      amount: "",
      forMonth: "September 2026",
      paymentMethod: "Bank Transfer",
      referenceId: "",
      notes: ""
    });
    alert(`✅ Monthly subscription payment for ${schoolName} successfully recorded as PAID!`);
  };

  const handleSendWhatsAppReminder = (school: any) => {
    const phoneRaw = school.phone || "03000000000";
    let cleanPhone = phoneRaw.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "92" + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith("92")) {
      cleanPhone = "92" + cleanPhone;
    }
    const monthText = school.dueMonth || "September 2026";
    const feeRate = school.monthlyFee || (school.packagePlan === "Enterprise" ? 15000 : school.packagePlan === "Standard" ? 10000 : 5000);
    
    const message = `السلام علیکم ${school.principal || "Principal"},\n\nThis is an automated subscription alert from *Multi-Campus Corporate Suite*.\n\nYour monthly software subscription fee for *${school.name}* (${monthText}) is pending.\n\n💵 *Amount Due:* ₨ ${feeRate.toLocaleString()}\n📦 *Package Plan:* ${school.packagePlan || "Enterprise"}\n\nPlease settle your invoice at your earliest convenience to keep your campus cloud portal active.\n\nThank you!`;

    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
    window.open(waUrl, "_blank");
    addLog(`Dispatched WhatsApp subscription reminder to ${school.name} (${phoneRaw})`, "Alerts");
  };

  const handleSendIdAlertNotification = (school: any) => {
    const feeRate = school.monthlyFee || (school.packagePlan === "Enterprise" ? 15000 : school.packagePlan === "Standard" ? 10000 : 5000);
    const alertMessage = `⚠️ URGENT SAAS NOTICE: Subscription fee of ₨ ${feeRate.toLocaleString()} for ${school.name} (${school.dueMonth || 'September 2026'}) is overdue. Please pay to avoid portal suspension.`;

    try {
      const existingAlertsStr = localStorage.getItem("mms_school_alerts") || "[]";
      const existingAlerts = JSON.parse(existingAlertsStr);
      const newAlert = {
        id: "alt_" + Date.now(),
        schoolId: school.id,
        schoolName: school.name,
        message: alertMessage,
        date: new Date().toLocaleString(),
        type: "subscription_due"
      };
      const updatedAlerts = [newAlert, ...existingAlerts];
      localStorage.setItem("mms_school_alerts", JSON.stringify(updatedAlerts));
      updateCentralKey("mms_school_alerts", updatedAlerts);
    } catch (e) {}

    addLog(`Broadcasted In-App ID Alert Notice to School ID: ${school.id} (${school.name})`, "In-App Notice");
    alert(`🔔 In-App Notification alert broadcasted successfully to ${school.name}! The school admin will see a bold warning header upon login.`);
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
      tagline: "Corporate Suite",
      overview: "Overview & AI Analytics",
      schools: "Schools",
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
      tagline: "کارپوریٹ پورٹل",
      overview: "خلاصہ اور AI تجزیہ",
      schools: "سکول",
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
      <aside className={`w-72 border-r flex flex-col h-screen lg:h-screen lg:sticky lg:top-0 z-50 transition-all duration-300 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
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

        {/* Categorized Navigation List - Core SaaS Management */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          <NavGroup title="Core Management">
            <SidebarNavButton icon={LayoutDashboard} label={t.overview} active={activeTab === "overview"} onClick={() => setActiveTab("overview")} darkMode={darkMode} />
            <SidebarNavButton icon={ShieldAlert} label={t.requests} active={activeTab === "requests"} onClick={() => setActiveTab("requests")} badge={users.length} darkMode={darkMode} />
            <SidebarNavButton icon={Building2} label={t.schools} active={activeTab === "schools"} onClick={() => setActiveTab("schools")} badge={schools.length} darkMode={darkMode} />
            <SidebarNavButton icon={CreditCard} label={t.finance} active={activeTab === "finance"} onClick={() => setActiveTab("finance")} darkMode={darkMode} />
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

            <button onClick={() => setShowPayMonthlyModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Pay Monthly Dues</span>
            </button>
            <button onClick={() => setShowAddSchoolModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Register Campus</span>
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
                                  const newSchoolData = {
                                    id: newSchoolId,
                                    name: u.madrassaName,
                                    code: "SCH-" + Math.floor(100 + Math.random() * 900),
                                    type: "Primary & Secondary",
                                    city: "Pakistan",
                                    totalStudents: 0,
                                    budget: "₨ 0"
                                  };
                                  
                                  setSchools(prev => [...prev, newSchoolData]);
                                  
                                  // Sync school to Firestore
                                  setDoc(doc(db, 'schools', newSchoolId), newSchoolData).catch(console.error);

                                  try {
                                    const localUsersStr = localStorage.getItem('users');
                                    if (localUsersStr) {
                                      const allUsers = JSON.parse(localUsersStr);
                                      const updatedUsers = allUsers.map((usr: any) => {
                                        if (usr.id === u.id || usr.email?.toLowerCase() === u.email?.toLowerCase()) {
                                          const acceptedUser = {
                                            ...usr,
                                            status: 'accepted',
                                            schoolId: newSchoolId,
                                            madrassaName: u.madrassaName,
                                            companyId: newSchoolId,
                                            companyName: u.madrassaName
                                          };
                                          
                                          // Sync user to Firestore
                                          setDoc(doc(db, 'users', usr.id.toString()), acceptedUser).catch(console.error);
                                          
                                          return acceptedUser;
                                        }
                                        return usr;
                                      });
                                      localStorage.setItem('users', JSON.stringify(updatedUsers));
                                      window.dispatchEvent(new Event('storage_updated'));
                                      syncToServer();
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black">{t.schools}</h2>
                  <p className="text-xs text-slate-400">Manage registered schools, subscription packages, feature access, and campus details.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowPayMonthlyModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>Pay Monthly Fee</span>
                  </button>
                  <button onClick={() => setShowAddSchoolModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>Register New Campus</span>
                  </button>
                </div>
              </div>

              {schools.length === 0 ? (
                <div className={`p-12 text-center rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-base font-bold">No Campuses Registered Yet</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">Click "+ Register New Campus" above to add your first educational branch with full package and feature setup.</p>
                  <button onClick={() => setShowAddSchoolModal(true)} className="mt-4 bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs">
                    Register First Campus
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {schools.map((sch: any) => {
                    const enabledFeats: string[] = sch.enabledFeatures || PACKAGE_PRESETS[sch.packagePlan] || PACKAGE_PRESETS.Enterprise;
                    const isPaid = sch.paymentStatus === "PAID";
                    const feeRate = sch.monthlyFee || (sch.packagePlan === "Enterprise" ? 15000 : sch.packagePlan === "Standard" ? 10000 : 5000);

                    const isBanned = sch.status === "BANNED";

                    return (
                      <div key={sch.id} className={`p-6 rounded-3xl border flex flex-col justify-between transition-all hover:shadow-lg ${
                        isBanned 
                          ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50' 
                          : darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                      }`}>
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="px-2.5 py-1 bg-blue-500/10 text-blue-500 rounded-full font-black text-[10px]">{sch.code}</span>
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2.5 py-1 rounded-full font-black text-[10px] ${
                                isBanned
                                  ? 'bg-red-500 text-white animate-pulse'
                                  : isPaid ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                              }`}>
                                {isBanned ? '⛔ BANNED' : isPaid ? '🟢 PAID' : '🔴 UNPAID'}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                sch.packagePlan === 'Enterprise' ? 'bg-indigo-500/10 text-indigo-500' :
                                sch.packagePlan === 'Standard' ? 'bg-emerald-500/10 text-emerald-500' :
                                sch.packagePlan === 'Basic' ? 'bg-amber-500/10 text-amber-500' : 'bg-purple-500/10 text-purple-500'
                              }`}>
                                {sch.packagePlan || 'Enterprise'}
                              </span>
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-black mt-2">{sch.name}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">{sch.type} • {sch.city || 'Pakistan'}</p>
                          
                          <div className="mt-4 space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                            <div className="flex justify-between text-slate-500 dark:text-slate-400">
                              <span>Monthly Subscription Fee:</span>
                              <strong className="text-emerald-600 dark:text-emerald-400 font-black">₨ {feeRate.toLocaleString()} / mo</strong>
                            </div>
                            <div className="flex justify-between text-slate-500 dark:text-slate-400">
                              <span>Principal:</span>
                              <strong className="text-slate-800 dark:text-slate-200">{sch.principal || 'Principal Officer'}</strong>
                            </div>
                            <div className="flex justify-between text-slate-500 dark:text-slate-400">
                              <span>Contact:</span>
                              <strong className="text-slate-800 dark:text-slate-200">{sch.phone || '0300-0000000'}</strong>
                            </div>
                            <div className="flex justify-between text-slate-500 dark:text-slate-400">
                              <span>Active Features:</span>
                              <strong className="text-blue-500 font-bold">{enabledFeats.length} / {ALL_FEATURES.length} Modules Enabled</strong>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                          {/* Payment & Alert Quick Controls */}
                          {!isPaid && !isBanned && (
                            <div className="grid grid-cols-2 gap-1.5 mb-2">
                              <button 
                                onClick={() => handleSendWhatsAppReminder(sch)}
                                className="bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-600 dark:text-emerald-400 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1"
                                title="Send WhatsApp Payment Alert"
                              >
                                💬 WhatsApp
                              </button>
                              <button 
                                onClick={() => handleSendIdAlertNotification(sch)}
                                className="bg-amber-500/10 hover:bg-amber-500 hover:text-white text-amber-600 dark:text-amber-400 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1"
                                title="Send In-App ID Alert"
                              >
                                🔔 ID Alert
                              </button>
                            </div>
                          )}

                          {/* Security & Password Action Bar */}
                          <div className="grid grid-cols-2 gap-1.5 mb-2">
                            <button
                              onClick={() => setShowResetPasswordModal(sch)}
                              className="bg-indigo-500/10 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1"
                              title="Reset Admin Password for this campus"
                            >
                              🔑 Reset Password
                            </button>
                            <button
                              onClick={() => handleToggleBanSchool(sch.id, sch.name, sch.status)}
                              className={`${
                                isBanned 
                                  ? 'bg-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-600 dark:text-emerald-400' 
                                  : 'bg-red-500/10 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400'
                              } py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1`}
                              title={isBanned ? "Unban campus account" : "Ban and lock campus access"}
                            >
                              {isBanned ? '🟢 Unban Account' : '🚫 Ban Account'}
                            </button>
                          </div>

                          <button 
                            onClick={() => {
                              setMonthlyPaymentForm({
                                schoolId: sch.id,
                                amount: feeRate.toString(),
                                forMonth: sch.dueMonth || "September 2026",
                                paymentMethod: "Bank Transfer",
                                referenceId: "",
                                notes: ""
                              });
                              setShowPayMonthlyModal(true);
                            }}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                          >
                            <DollarSign className="w-4 h-4" /> 💳 Pay Monthly Subscription
                          </button>

                          <button 
                            onClick={() => setEditingCampusFeatures(sch)}
                            className="w-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                          >
                            <Settings className="w-4 h-4" /> ⚙️ Package & Feature Toggles
                          </button>

                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setInspectingSchool(sch);
                                setInspectorTab("overview");
                              }}
                              className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                            >
                              <Eye className="w-4 h-4" /> Open Panel Data
                            </button>
                            <button 
                              onClick={() => handleDeleteCampus(sch.id, sch.name)}
                              className="px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold transition-all"
                              title="Delete Campus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "finance" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black">Ledger & SaaS Fee Management</h2>
                  <p className="text-xs text-slate-400">Track monthly software subscription dues from all network schools, identify pending payments, and dispatch reminders.</p>
                </div>
                <button onClick={() => setShowPayMonthlyModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-500/20">
                  <DollarSign className="w-4 h-4" />
                  <span>Record Monthly Payment</span>
                </button>
              </div>

              {/* Finance Summary KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">TOTAL MONTHLY REVENUE</span>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    ₨ {schools.reduce((acc: number, s: any) => {
                      const fee = s.monthlyFee || (s.packagePlan === "Enterprise" ? 15000 : s.packagePlan === "Standard" ? 10000 : 5000);
                      return s.paymentStatus === "PAID" ? acc + fee : acc;
                    }, 0).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Collected for current billing cycle</p>
                </div>

                <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">PAID CAMPUSES</span>
                  <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                    {schools.filter((s: any) => s.paymentStatus === "PAID").length} / {schools.length}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Schools up to date with subscription</p>
                </div>

                <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">UNPAID / OVERDUE DUES</span>
                  <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
                    ₨ {schools.reduce((acc: number, s: any) => {
                      const fee = s.monthlyFee || (s.packagePlan === "Enterprise" ? 15000 : s.packagePlan === "Standard" ? 10000 : 5000);
                      return s.paymentStatus !== "PAID" ? acc + fee : acc;
                    }, 0).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Pending from {schools.filter((s: any) => s.paymentStatus !== "PAID").length} school(s)</p>
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <div className="w-full sm:w-64">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Filter School</label>
                    <select 
                      value={financeSchoolFilter}
                      onChange={(e) => setFinanceSchoolFilter(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border text-xs font-bold outline-none cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                    >
                      <option value="all">🌐 All Schools ({schools.length})</option>
                      {schools.map((s: any) => (
                        <option key={s.id} value={s.id}>🏫 {s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full sm:w-48">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Payment Status</label>
                    <select 
                      value={financeStatusFilter}
                      onChange={(e) => setFinanceStatusFilter(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border text-xs font-bold outline-none cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                    >
                      <option value="all">Filter Status: All</option>
                      <option value="PAID">🟢 PAID Only</option>
                      <option value="UNPAID">🔴 UNPAID / Pending Only</option>
                    </select>
                  </div>
                </div>

                <div className="text-xs text-slate-400 font-bold">
                  Showing {schools.filter((s: any) => {
                    const matchSchool = financeSchoolFilter === "all" || s.id === financeSchoolFilter;
                    const isPaid = s.paymentStatus === "PAID";
                    const matchStatus = financeStatusFilter === "all" || (financeStatusFilter === "PAID" ? isPaid : !isPaid);
                    return matchSchool && matchStatus;
                  }).length} School Records
                </div>
              </div>

              {/* Master School Billing Ledger Table */}
              <div className={`rounded-3xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className={`border-b ${darkMode ? 'bg-slate-800/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                        <th className="p-4 pl-6 font-bold uppercase tracking-wider text-[10px]">School / Campus</th>
                        <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Package Plan</th>
                        <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Monthly Fee</th>
                        <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Status</th>
                        <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Last Paid Date</th>
                        <th className="p-4 pr-6 text-right font-bold uppercase tracking-wider text-[10px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {schools
                        .filter((s: any) => {
                          const matchSchool = financeSchoolFilter === "all" || s.id === financeSchoolFilter;
                          const isPaid = s.paymentStatus === "PAID";
                          const matchStatus = financeStatusFilter === "all" || (financeStatusFilter === "PAID" ? isPaid : !isPaid);
                          return matchSchool && matchStatus;
                        })
                        .map((s: any) => {
                          const isPaid = s.paymentStatus === "PAID";
                          const feeRate = s.monthlyFee || (s.packagePlan === "Enterprise" ? 15000 : s.packagePlan === "Standard" ? 10000 : 5000);

                          return (
                            <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="p-4 pl-6">
                                <p className="font-black text-slate-900 dark:text-slate-100">{s.name}</p>
                                <p className="text-[10px] font-mono text-slate-400">{s.code} • {s.principal || 'Principal'}</p>
                              </td>
                              <td className="p-4 font-bold">
                                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded text-[10px]">
                                  📦 {s.packagePlan || 'Enterprise'}
                                </span>
                              </td>
                              <td className="p-4 font-black text-emerald-600 dark:text-emerald-400">
                                ₨ {feeRate.toLocaleString()}
                              </td>
                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-full font-black text-[10px] ${
                                  isPaid ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                                }`}>
                                  {isPaid ? '🟢 PAID' : '🔴 UNPAID'}
                                </span>
                              </td>
                              <td className="p-4 text-slate-400 font-medium">
                                {s.lastPaidDate ? `${s.lastPaidDate} (${s.dueMonth || 'Sep 2026'})` : 'No Recent Record'}
                              </td>
                              <td className="p-4 pr-6 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {!isPaid && (
                                    <>
                                      <button 
                                        onClick={() => handleSendWhatsAppReminder(s)}
                                        className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-600 dark:text-emerald-400 rounded-lg text-[11px] font-bold transition-all"
                                        title="WhatsApp Reminder"
                                      >
                                        💬 WhatsApp
                                      </button>
                                      <button 
                                        onClick={() => handleSendIdAlertNotification(s)}
                                        className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500 hover:text-white text-amber-600 dark:text-amber-400 rounded-lg text-[11px] font-bold transition-all"
                                        title="Send In-App Notice"
                                      >
                                        🔔 ID Alert
                                      </button>
                                    </>
                                  )}
                                  <button 
                                    onClick={() => {
                                      setMonthlyPaymentForm({
                                        schoolId: s.id,
                                        amount: feeRate.toString(),
                                        forMonth: s.dueMonth || "September 2026",
                                        paymentMethod: "Bank Transfer",
                                        referenceId: "",
                                        notes: ""
                                      });
                                      setShowPayMonthlyModal(true);
                                    }}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                                  >
                                    💳 Pay Dues
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
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
        <ModalWrapper title="Register Campus Branch (Full Setup)" onClose={() => setShowAddSchoolModal(false)} darkMode={darkMode}>
          <form onSubmit={handleCreateSchool} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Campus Name *</label>
              <input type="text" required placeholder="e.g. Al-Siraj Campus Abbottabad" value={newSchool.name} onChange={e => setNewSchool({ ...newSchool, name: e.target.value })} className={`w-full p-3 rounded-xl border text-xs font-bold outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Branch Code</label>
                <input type="text" placeholder="e.g. SCH-101" value={newSchool.code} onChange={e => setNewSchool({ ...newSchool, code: e.target.value })} className={`w-full p-3 rounded-xl border text-xs font-mono outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">City / Location</label>
                <input type="text" placeholder="e.g. Abbottabad" value={newSchool.city} onChange={e => setNewSchool({ ...newSchool, city: e.target.value })} className={`w-full p-3 rounded-xl border text-xs outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Principal Name</label>
                <input type="text" placeholder="e.g. Prof. Ahmed Raza" value={newSchool.principal} onChange={e => setNewSchool({ ...newSchool, principal: e.target.value })} className={`w-full p-3 rounded-xl border text-xs outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Contact Phone</label>
                <input type="text" placeholder="e.g. 0300-1234567" value={newSchool.phone} onChange={e => setNewSchool({ ...newSchool, phone: e.target.value })} className={`w-full p-3 rounded-xl border text-xs outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Subscription Package</label>
              <select 
                value={newSchool.packagePlan} 
                onChange={e => {
                  const plan = e.target.value;
                  setNewSchool({
                    ...newSchool,
                    packagePlan: plan,
                    enabledFeatures: PACKAGE_PRESETS[plan] || PACKAGE_PRESETS.Enterprise
                  });
                }}
                className={`w-full p-3 rounded-xl border text-xs font-bold outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
              >
                <option value="Enterprise">📦 Enterprise Package (All Features Unlocked)</option>
                <option value="Standard">📦 Standard Package (Core + LMS + Library + Bus Fleet)</option>
                <option value="Basic">📦 Basic Package (Core + Exams + Documents)</option>
                <option value="Custom">⚙️ Custom Selection</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Enable / Disable Campus Modules</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-xl dark:border-slate-800">
                {ALL_FEATURES.map((f) => {
                  const isEnabled = newSchool.enabledFeatures.includes(f.key);
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => {
                        const updated = isEnabled 
                          ? newSchool.enabledFeatures.filter(k => k !== f.key)
                          : [...newSchool.enabledFeatures, f.key];
                        setNewSchool({ ...newSchool, packagePlan: "Custom", enabledFeatures: updated });
                      }}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs font-bold transition-all text-left ${
                        isEnabled 
                          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                          : "bg-slate-100 dark:bg-slate-800 border border-transparent text-slate-400"
                      }`}
                    >
                      <span>{f.label}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${isEnabled ? 'bg-emerald-500 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600'}`}>
                        {isEnabled ? 'ON' : 'OFF'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs shadow-md shadow-blue-500/20">
              Save Campus & Activate Setup
            </button>
          </form>
        </ModalWrapper>
      )}

      {/* Campus Package & Feature Toggles Modal */}
      {editingCampusFeatures && (
        <ModalWrapper 
          title={`Package & Feature Control: ${editingCampusFeatures.name}`} 
          onClose={() => setEditingCampusFeatures(null)} 
          darkMode={darkMode}
        >
          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Select Subscription Package</label>
              <div className="grid grid-cols-3 gap-2">
                {["Basic", "Standard", "Enterprise"].map((plan) => {
                  const isCurrent = editingCampusFeatures.packagePlan === plan;
                  return (
                    <button
                      key={plan}
                      onClick={() => {
                        handleChangeCampusPackage(editingCampusFeatures.id, plan);
                        setEditingCampusFeatures({
                          ...editingCampusFeatures,
                          packagePlan: plan,
                          enabledFeatures: PACKAGE_PRESETS[plan]
                        });
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        isCurrent 
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      {plan}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Individual Feature Toggles</label>
                <span className="text-[10px] font-bold text-blue-500">Toggle ON to Show / OFF to Hide</span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {ALL_FEATURES.map((f) => {
                  const currentFeatures: string[] = editingCampusFeatures.enabledFeatures || PACKAGE_PRESETS[editingCampusFeatures.packagePlan] || PACKAGE_PRESETS.Enterprise;
                  const isEnabled = currentFeatures.includes(f.key);
                  return (
                    <div 
                      key={f.key} 
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                        darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isEnabled ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                        }`}>
                          {isEnabled ? '✓' : '✕'}
                        </div>
                        <div>
                          <p className="text-xs font-bold">{f.label}</p>
                          <p className="text-[10px] text-slate-400">{isEnabled ? 'Visible on Campus Dashboard' : 'Hidden & Disabled for Campus'}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          handleToggleCampusFeature(editingCampusFeatures.id, f.key);
                          const updated = isEnabled 
                            ? currentFeatures.filter(k => k !== f.key)
                            : [...currentFeatures, f.key];
                          setEditingCampusFeatures({
                            ...editingCampusFeatures,
                            packagePlan: "Custom",
                            enabledFeatures: updated
                          });
                        }}
                        className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                          isEnabled
                            ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20"
                            : "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                        }`}
                      >
                        {isEnabled ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setEditingCampusFeatures(null)}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl text-xs shadow-md shadow-blue-500/20"
            >
              Done / Close Settings
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* Pay Monthly SaaS Dues Modal */}
      {showPayMonthlyModal && (
        <ModalWrapper 
          title="💳 Pay Monthly Software Subscription Dues" 
          onClose={() => setShowPayMonthlyModal(false)} 
          darkMode={darkMode}
        >
          <form onSubmit={handleRecordMonthlyPayment} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Select Campus / School *</label>
              <select 
                required 
                value={monthlyPaymentForm.schoolId} 
                onChange={e => {
                  const sch = schools.find((s: any) => s.id === e.target.value);
                  const defaultAmt = sch ? (sch.monthlyFee || (sch.packagePlan === 'Enterprise' ? 15000 : sch.packagePlan === 'Standard' ? 10000 : 5000)) : "";
                  setMonthlyPaymentForm({ 
                    ...monthlyPaymentForm, 
                    schoolId: e.target.value, 
                    amount: defaultAmt.toString() 
                  });
                }} 
                className={`w-full p-3 rounded-xl border text-xs font-bold outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
              >
                <option value="">-- Choose Campus Branch --</option>
                {schools.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    🏫 {s.name} ({s.code}) - {s.paymentStatus === 'PAID' ? '🟢 Paid' : '🔴 Unpaid'}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Amount Paid (₨) *</label>
                <input 
                  type="number" 
                  required 
                  placeholder="e.g. 15000" 
                  value={monthlyPaymentForm.amount} 
                  onChange={e => setMonthlyPaymentForm({ ...monthlyPaymentForm, amount: e.target.value })} 
                  className={`w-full p-3 rounded-xl border text-xs font-bold outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} 
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Billing Month *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. September 2026" 
                  value={monthlyPaymentForm.forMonth} 
                  onChange={e => setMonthlyPaymentForm({ ...monthlyPaymentForm, forMonth: e.target.value })} 
                  className={`w-full p-3 rounded-xl border text-xs font-bold outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Payment Method</label>
                <select 
                  value={monthlyPaymentForm.paymentMethod} 
                  onChange={e => setMonthlyPaymentForm({ ...monthlyPaymentForm, paymentMethod: e.target.value })}
                  className={`w-full p-3 rounded-xl border text-xs font-bold outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                >
                  <option value="Bank Transfer">🏦 Bank Online Transfer</option>
                  <option value="JazzCash / EasyPaisa">📱 JazzCash / EasyPaisa</option>
                  <option value="Cash">💵 Cash Deposit</option>
                  <option value="Cheque">📜 Cheque</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Reference ID / Trx ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. TRX-998812" 
                  value={monthlyPaymentForm.referenceId} 
                  onChange={e => setMonthlyPaymentForm({ ...monthlyPaymentForm, referenceId: e.target.value })} 
                  className={`w-full p-3 rounded-xl border text-xs font-mono outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} 
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Notes / Remarks</label>
              <textarea 
                rows={2}
                placeholder="Optional payment comments..." 
                value={monthlyPaymentForm.notes} 
                onChange={e => setMonthlyPaymentForm({ ...monthlyPaymentForm, notes: e.target.value })} 
                className={`w-full p-3 rounded-xl border text-xs outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} 
              />
            </div>

            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl text-xs shadow-md shadow-emerald-500/20 transition-all">
              ✅ Record Monthly Payment & Update Campus Status to PAID
            </button>
          </form>
        </ModalWrapper>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && (
        <ModalWrapper 
          title={`Reset Password: ${showResetPasswordModal.name}`} 
          onClose={() => setShowResetPasswordModal(null)} 
          darkMode={darkMode}
        >
          <div className="space-y-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 text-xs">
              <strong>🔑 Admin Account Password Reset</strong>
              <p className="mt-1">Enter a new password for <strong>{showResetPasswordModal.name}</strong>. This will immediately update the campus login credentials.</p>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">New Password *</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Pass@1234 or Admin#2026" 
                value={newPasswordInput} 
                onChange={e => setNewPasswordInput(e.target.value)} 
                className={`w-full p-3 rounded-xl border text-xs font-mono font-bold outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} 
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                type="button" 
                onClick={() => setShowResetPasswordModal(null)} 
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={() => handleResetPassword(showResetPasswordModal.id, showResetPasswordModal.name, newPasswordInput)} 
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-indigo-500/20"
              >
                ✅ Update & Save Password
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* Real Data Reader & Campus Control Panel Modal */}
      {inspectingSchool && (
        <ModalWrapper 
          title={`Campus Control Panel & Live Data: ${inspectingSchool.name}`} 
          onClose={() => setInspectingSchool(null)} 
          darkMode={darkMode}
        >
          <div className="space-y-4">
            {/* Top Header Card */}
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              inspectingSchool.status === 'BANNED' 
                ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50' 
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
            }`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded font-mono font-bold text-[10px]">{inspectingSchool.code}</span>
                  <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                    inspectingSchool.status === 'BANNED' 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : inspectingSchool.paymentStatus === 'PAID' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-rose-500/15 text-rose-600'
                  }`}>
                    {inspectingSchool.status === 'BANNED' ? '⛔ BANNED / SUSPENDED' : inspectingSchool.paymentStatus === 'PAID' ? '🟢 PAID & ACTIVE' : '🔴 UNPAID'}
                  </span>
                </div>
                <h3 className="text-base font-black mt-1">{inspectingSchool.name}</h3>
                <p className="text-xs text-slate-400">{inspectingSchool.type} • {inspectingSchool.city || 'Pakistan'}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    localStorage.setItem('active_school_id', inspectingSchool.id);
                    localStorage.setItem('currentSchoolName', inspectingSchool.name);
                    window.dispatchEvent(new Event('storage_updated'));
                    window.location.reload();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" /> <span>Switch & Enter Panel</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs inside Modal */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-bold gap-4">
              <button 
                onClick={() => setInspectorTab("overview")} 
                className={`pb-2 border-b-2 transition-all ${inspectorTab === "overview" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400"}`}
              >
                📊 Overview & Security
              </button>
              <button 
                onClick={() => setInspectorTab("students")} 
                className={`pb-2 border-b-2 transition-all ${inspectorTab === "students" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400"}`}
              >
                🎓 Live Students Data
              </button>
              <button 
                onClick={() => setInspectorTab("teachers")} 
                className={`pb-2 border-b-2 transition-all ${inspectorTab === "teachers" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400"}`}
              >
                👨‍🏫 Live Teachers / Staff
              </button>
            </div>

            {/* Tab Content */}
            {inspectorTab === "overview" && (
              <div className="space-y-4">
                {/* Security Controls Box */}
                <div className={`p-4 rounded-2xl border space-y-3 ${darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">🔐 Security & Credentials Control</h4>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Admin Username</span>
                      <strong className="font-mono text-slate-800 dark:text-slate-200">{inspectingSchool.email || "admin"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Admin Password</span>
                      <strong className="font-mono text-indigo-500">{inspectingSchool.adminPassword || "admin123"}</strong>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t dark:border-slate-700">
                    <button
                      onClick={() => setShowResetPasswordModal(inspectingSchool)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      🔑 Reset Password
                    </button>
                    <button
                      onClick={() => handleToggleBanSchool(inspectingSchool.id, inspectingSchool.name, inspectingSchool.status)}
                      className={`flex-1 ${
                        inspectingSchool.status === 'BANNED'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      } py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5`}
                    >
                      {inspectingSchool.status === 'BANNED' ? '🟢 Unban Account' : '🚫 Ban & Lock Account'}
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-800/20 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <span className="text-slate-400 block text-[10px]">Principal Name</span>
                    <strong className="text-slate-800 dark:text-slate-200">{inspectingSchool.principal || 'Principal Officer'}</strong>
                  </div>
                  <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-800/20 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <span className="text-slate-400 block text-[10px]">Contact Phone</span>
                    <strong className="text-slate-800 dark:text-slate-200">{inspectingSchool.phone || '0300-0000000'}</strong>
                  </div>
                  <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-800/20 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <span className="text-slate-400 block text-[10px]">Subscription Package</span>
                    <strong className="text-indigo-500">{inspectingSchool.packagePlan || 'Enterprise'}</strong>
                  </div>
                  <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-800/20 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <span className="text-slate-400 block text-[10px]">Monthly Fee</span>
                    <strong className="text-emerald-500 font-black">₨ {(inspectingSchool.monthlyFee || 15000).toLocaleString()} / mo</strong>
                  </div>
                </div>
              </div>
            )}

            {inspectorTab === "students" && (() => {
              // Compute live students for this campus from state & local storage
              const rawSaved = localStorage.getItem("students") || localStorage.getItem("mms_students") || localStorage.getItem("parent_portal_students");
              const localStudents = rawSaved ? JSON.parse(rawSaved) : [];
              const mergedStudents = Array.from(new Map([...students, ...localStudents].map(s => [s.id || s.name, s])).values());

              const campusStudents = mergedStudents.filter((s: any) => {
                if (s.schoolId) return s.schoolId === inspectingSchool.id || s.schoolId === inspectingSchool.code;
                return true;
              });

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5">
                      <span>Total Registered Students</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-mono font-bold">🔥 Firebase Live</span>
                    </span>
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full font-black">{campusStudents.length} Students</span>
                  </div>

                  <div className="max-h-60 overflow-y-auto rounded-xl border dark:border-slate-800">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b bg-slate-50 dark:bg-slate-800 text-slate-500">
                          <th className="p-2.5">Roll No</th>
                          <th className="p-2.5">Student Name</th>
                          <th className="p-2.5">Class</th>
                          <th className="p-2.5">Fee Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {campusStudents.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-6 text-center text-slate-400">
                              No student records found in Firebase for this campus.
                            </td>
                          </tr>
                        ) : (
                          campusStudents.map((std: any, i: number) => (
                            <tr key={std.id || i}>
                              <td className="p-2.5 font-mono font-bold text-blue-500">{std.rollNo || `STD-${101 + i}`}</td>
                              <td className="p-2.5 font-bold">{std.name}</td>
                              <td className="p-2.5 text-slate-400">{std.class || std.grade || "Class 9"}</td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                  std.feeStatus === 'Paid' || std.feeStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                }`}>
                                  {std.feeStatus || 'Paid'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            {inspectorTab === "teachers" && (() => {
              // Compute live teachers for this campus from state & local storage
              const rawSaved = localStorage.getItem("staff") || localStorage.getItem("mms_teachers") || localStorage.getItem("teachers");
              const localTeachers = rawSaved ? JSON.parse(rawSaved) : [];
              const mergedTeachers = Array.from(new Map([...teachers, ...localTeachers].map(t => [t.id || t.name, t])).values());

              const campusTeachers = mergedTeachers.filter((t: any) => {
                if (t.schoolId) return t.schoolId === inspectingSchool.id || t.schoolId === inspectingSchool.code;
                return true;
              });

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5">
                      <span>Faculty & Teaching Staff</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-mono font-bold">🔥 Firebase Live</span>
                    </span>
                    <span className="px-2 py-0.5 bg-purple-500/10 text-purple-500 rounded-full font-black">{campusTeachers.length} Teachers</span>
                  </div>

                  <div className="max-h-60 overflow-y-auto rounded-xl border dark:border-slate-800">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b bg-slate-50 dark:bg-slate-800 text-slate-500">
                          <th className="p-2.5">Teacher Name</th>
                          <th className="p-2.5">Designation</th>
                          <th className="p-2.5">Contact</th>
                          <th className="p-2.5">Monthly Salary</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {campusTeachers.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-6 text-center text-slate-400">
                              No teacher / faculty records found in Firebase for this campus.
                            </td>
                          </tr>
                        ) : (
                          campusTeachers.map((tch: any, i: number) => (
                            <tr key={tch.id || i}>
                              <td className="p-2.5 font-bold">{tch.name}</td>
                              <td className="p-2.5 text-slate-400">{tch.designation || tch.subject || tch.role || "Senior Lecturer"}</td>
                              <td className="p-2.5 font-mono text-slate-400">{tch.phone || tch.contact || "0300-1112233"}</td>
                              <td className="p-2.5 font-bold text-emerald-500">₨ {(tch.salary || 45000).toLocaleString()}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
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
