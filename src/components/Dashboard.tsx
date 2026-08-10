import React, { useState, useEffect } from "react";
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
  Legend,
} from "recharts";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BookOpen,
  Hand,
  GraduationCap,
  FileText,
  CreditCard,
  UserCog,
  Wallet,
  UserPlus,
  Bell,
  Camera,
  Settings,
  LogOut,
  Search,
  Plus,
  Grid,
  MessageSquare,
  Book,
  FileSearch,
  ClipboardList,
  PenTool,
  Phone,
  Library,
  Landmark,
  StickyNote,
  Calculator,
  List,
  Globe,
  Trash2,
  X,
  Printer,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import {
  useNavigate,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import StudentManagement from "./StudentManagement";
import AllStudents from "./AllStudents";
import SettingsView from "./Settings";
import ExamManagement from "./ExamManagement";
import ManualAttendance from "./ManualAttendance";
import ExamAttendanceSheet from "./ExamAttendanceSheet";
import StudentProfile from "./StudentProfile";
import SecurityAttendance from "./SecurityAttendance";
import CameraView from "./CameraView";
import FinanceManagement from "./FinanceManagement";
import StaffManagement from "./StaffManagement";
import MessagingCenter from "./MessagingCenter";
import GradeManagement from "./GradeManagement";
import PaperMaker from "./PaperMaker";
import ReportsView from "./ReportsView";
import ModulePlaceholder from "./ModulePlaceholder";
import DocumentManagement from "./DocumentManagement";
import PaperUploader from "./PaperUploader";
import PaperChecker from "./PaperChecker";
import PaperReports from "./PaperReports";
import VoiceAssistant from "./VoiceAssistant";
import BookLibrary from "./BookLibrary";
import PayrollManagement from "./PayrollManagement";
import FeesManagement from "./FeesManagement";
import DarulIfta from "./DarulIfta";
import JamiaPosts from "./JamiaPosts";
import RecycleBin from "./RecycleBin";
import StudentDocumentCapture from "./StudentDocumentCapture";
import PublicResultPortal from "./PublicResultPortal";
import QRManualAttendance from "./QRManualAttendance";
import DegreeDistribution from "./DegreeDistribution";
import AdminDashboard from "./AdminPanel/AdminDashboard";
import Notepad from "./Notepad";
import SuperAdminPanel from "./SuperAdminPanel";
import {
  updateCentralKey,
} from "../syncService";
import {
  Cloud,
  CloudOff,
  RefreshCw,
  Upload,
  CheckSquare,
  FileText as FileTextIcon,
} from "lucide-react";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  subLabel: string;
  active?: boolean;
  onClick?: () => void;
  key?: React.Key;
}

interface GridCardProps {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  color: string;
  onClick?: () => void;
  key?: React.Key;
}

const SidebarItem = ({
  icon: Icon,
  label,
  subLabel,
  active,
  onClick,
  id,
}: SidebarItemProps & { id?: string }) => (
  <div
    id={id}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all mx-2 my-1 rounded-lg ${active ? "bg-white/20 text-white shadow-lg border border-white/10" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
  >
    <Icon className={`w-5 h-5 ${active ? "text-white" : "text-white/60"}`} />
    <div className="flex flex-col text-left flex-1" dir="ltr">
      <span
        className={`text-[13px] leading-tight ${active ? "text-white font-bold" : "text-white/90"}`}
      >
        {label}
      </span>
      <span
        className={`text-[9px] font-medium tracking-wide uppercase ${active ? "text-white/80" : "text-white/40"}`}
      >
        {subLabel}
      </span>
    </div>
  </div>
);

const GridCard = ({
  icon: Icon,
  title,
  subtitle,
  color,
  onClick,
  id,
}: GridCardProps & { id?: string }) => (
  <div
    id={id}
    onClick={onClick}
    className="card-widget flex flex-col items-center justify-center text-center group"
  >
    <div
      className={`widget-icon ${color.replace("bg-", "bg-opacity-10 text-")} group-hover:rotate-12 transition-transform duration-300`}
    >
      <Icon className="w-6 h-6" />
    </div>
    <span className="text-[13px] text-slate-800 font-bold mb-0.5" dir="ltr">
      {title}
    </span>
    {subtitle && (
      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter leading-none">{subtitle}</span>
    )}
  </div>
);

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />
);

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeModuleName, setActiveModuleName] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success'>('idle');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('syncing');
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('idle');
    };
    
    const checkPendingQueue = () => {
      if (typeof indexedDB === 'undefined') return;
      const request = indexedDB.open('jamia-offline-db', 1);
      request.onsuccess = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('sync-queue')) return;
        const transaction = db.transaction('sync-queue', 'readonly');
        const store = transaction.objectStore('sync-queue');
        const countRequest = store.count();
        countRequest.onsuccess = () => {
          setPendingSyncCount(countRequest.result);
        };
      };
    };

    const handleSyncQueued = () => {
      checkPendingQueue();
    };

    const handleSyncCompleted = () => {
      setSyncStatus('success');
      setPendingSyncCount(0);
      setTimeout(() => {
        setSyncStatus('idle');
      }, 4000);
    };

    window.addEventListener('network_online', handleOnline);
    window.addEventListener('network_offline', handleOffline);
    window.addEventListener('offline_sync_queued', handleSyncQueued);
    window.addEventListener('offline_sync_completed', handleSyncCompleted);
    
    // Initial check
    checkPendingQueue();
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

    return () => {
      window.removeEventListener('network_online', handleOnline);
      window.removeEventListener('network_offline', handleOffline);
      window.removeEventListener('offline_sync_queued', handleSyncQueued);
      window.removeEventListener('offline_sync_completed', handleSyncCompleted);
    };
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState("");

  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [savedFees, setSavedFees] = useState<any[]>([]);
  const [selectedPreviewStudent, setSelectedPreviewStudent] = useState<
    any | null
  >(null);

  useEffect(() => {
    // Migration: Update all students' admission date to 2026 if not already done
    const migrationKey = 'migration_students_2026_v2';
    if (!localStorage.getItem(migrationKey)) {
      const savedStudents = localStorage.getItem('students');
      if (savedStudents) {
        try {
          const students = JSON.parse(savedStudents);
          if (Array.isArray(students) && students.length > 0) {
            const updatedStudents = students.map((s: any) => ({
              ...s,
              admissionDate: typeof s.admissionDate === 'string' && s.admissionDate.startsWith('2026') ? s.admissionDate : '2026-01-01'
            }));
            localStorage.setItem('students', JSON.stringify(updatedStudents));
            updateCentralKey('students', updatedStudents);
            console.log('Migration: All students updated to 2026 admission date.');
          }
        } catch (e) {
          console.error('Migration error:', e);
        }
      }
      localStorage.setItem(migrationKey, 'true');
    }
  }, []);

  // Analyze enrolment data from allStudents
  const classDistribution = React.useMemo(() => {
    if (!allStudents || allStudents.length === 0) {
      return [
        { name: "Grade 10", count: 120 },
        { name: "Grade 9", count: 180 },
        { name: "Grade 8", count: 240 },
        { name: "Grade 7", count: 150 },
        { name: "Grade 6", count: 165 },
        { name: "Grade 5", count: 140 },
        { name: "Grade 4", count: 130 },
        { name: "Grade 3", count: 115 },
      ];
    }
    const counts: Record<string, number> = {};
    allStudents.forEach((student) => {
      const g = student.grade || "Other";
      counts[g] = (counts[g] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [allStudents]);

  const dynamicEnrollmentTrends = React.useMemo(() => {
    const baseTrends = [
      { year: "2021", count: 850, examsPassed: 780 },
      { year: "2022", count: 960, examsPassed: 890 },
      { year: "2023", count: 1080, examsPassed: 1010 },
      { year: "2024", count: 1150, examsPassed: 1090 },
      { year: "2025", count: 1210, examsPassed: 1140 },
      { year: "2026", count: 1240, examsPassed: 1180 },
    ];
    if (!allStudents || allStudents.length === 0) return baseTrends;

    const updatedTrends = [...baseTrends];
    const latestIndex = updatedTrends.length - 1;
    updatedTrends[latestIndex] = {
      ...updatedTrends[latestIndex],
      count: Math.max(allStudents.length, updatedTrends[latestIndex].count),
      examsPassed: Math.max(Math.round(allStudents.length * 0.95), updatedTrends[latestIndex].examsPassed)
    };
    return updatedTrends;
  }, [allStudents]);

  const dynamicAttendancePercent = React.useMemo(() => {
    const studentRecords = attendanceRecords.filter(r => r.type === "student");
    if (studentRecords.length === 0) return 98; // elegant fallback

    // Get the most recent attendance record
    const recent = [...studentRecords].sort((a, b) => b.id - a.id)[0];
    if (!recent || !recent.data || typeof recent.data !== "object") return 98;

    const values = Object.values(recent.data);
    if (values.length === 0) return 98;

    const presentAndValidCount = values.filter(v => v === "P" || v === "S" || v === "L").length;
    return Math.round((presentAndValidCount / values.length) * 100);
  }, [attendanceRecords]);

  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dynamicPendingFees = React.useMemo(() => {
    const activeCount = allStudents.length > 0 ? allStudents.length : 1240;
    const targetCollection = activeCount * 1500;

    // Calculate collection this month from savedFees
    const currentMonthIndex = new Date().getMonth();
    const currentMonthName = monthsList[currentMonthIndex];
    const paidThisMonth = savedFees
      .filter((f) => f.month === currentMonthName)
      .reduce((sum, f) => sum + (Number(f.totalPaid) || 0), 0);

    const pending = targetCollection - paidThisMonth;
    return Math.max(0, pending);
  }, [allStudents, savedFees]);

  const [systemSettings, setSystemSettings] = useState(() => {
    const saved = localStorage.getItem("system_settings");
    return saved
      ? JSON.parse(saved)
      : {
          jamiaName: "EduCore School Management System",
          monogram: "",
        };
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);

  useEffect(() => {
    const userEmail = localStorage.getItem("currentUser") || "";
    if (!userEmail) return;
    
    // Local profile simulation
    const role = localStorage.getItem("currentUserRole") || "Admin";
    const status = localStorage.getItem("userStatus") || "accepted";
    setCurrentUserProfile({ email: userEmail, role, status });
  }, []);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncKey, setSyncKey] = useState(0); // Used to force refresh modules

  useEffect(() => {
    const fetchDashboardData = () => {
      try {
        const students = localStorage.getItem('students');
        if (students) setAllStudents(JSON.parse(students));
        
        const attendance = localStorage.getItem('attendanceRecords');
        if (attendance) setAttendanceRecords(JSON.parse(attendance));
        
        const fees = localStorage.getItem('saved_fees');
        if (fees) setSavedFees(JSON.parse(fees));
        
        // Artificial delay to show beautiful skeletons while Firebase sync happens
        setTimeout(() => setIsInitialLoading(false), 1200);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setIsInitialLoading(false);
      }
    };

    fetchDashboardData();
    window.addEventListener('storage_updated', fetchDashboardData);
    return () => window.removeEventListener('storage_updated', fetchDashboardData);
  }, []);

  // Permissions logic
  const [userRole, setUserRole] = useState(
    () => localStorage.getItem("currentUserRole") || "Admin",
  );
  const [userStatus, setUserStatus] = useState(
    () => localStorage.getItem("userStatus") || "accepted",
  );

  const ADMIN_EMAILS = [
    "abdulrehmanhabib.com@gmail.com",
    "adminabdulrehmanhabibkpk",
    "jamiaarabiasirajululoomjabori@gmail.com",
    "muhammadabdullahshh@gmail.com",
  ];
  const currentUserEmail = localStorage.getItem("currentUser") || "";
  const currentUserName = localStorage.getItem("currentUserName") || currentUserEmail.split('@')[0];
  const urduRole = userRole;
  const isAdmin =
    ADMIN_EMAILS.includes(currentUserEmail.toLowerCase()) ||
    userRole === "Admin";

  const [permissions, setPermissions] = useState(() => {
    const saved = localStorage.getItem("role_permissions");
    const defaultPerms: Record<string, any> = {
      Admin: {
        dashboard: true, students: true, all_students: true, document_capture: true,
        attendance: true, lessons: true, manual: true, exam_attendance_sheet: true,
        academics: true, exams: true, paper_maker: true, paper_uploader: true,
        paper_checker: true, paper_reports: true, fees: true, staff: true,
        payroll: true, visitors: true, notifications: true, camera: true,
        settings: true, public_result: true, finance: true, library: true,
        fatwa: true, posts: true, reports: true, recycle_bin: true,
        admissions_view: true, super_admin_panel: true, voice_logs: true
      },
      Teacher: {
        dashboard: true, students: false, all_students: true, document_capture: false,
        attendance: true, lessons: true, manual: true, exam_attendance_sheet: false,
        academics: false, exams: true, paper_maker: false, paper_uploader: true,
        paper_checker: true, paper_reports: true, fees: false, staff: false,
        payroll: false, visitors: false, notifications: true, camera: true,
        settings: false, public_result: false, finance: false, library: true,
        fatwa: false, posts: false, reports: false, recycle_bin: false,
        admissions_view: false, super_admin_panel: false, voice_logs: false
      },
      Staff: {
        dashboard: true, students: true, all_students: true, document_capture: true,
        attendance: true, lessons: false, manual: true, exam_attendance_sheet: true,
        academics: false, exams: false, paper_maker: false, paper_uploader: false,
        paper_checker: false, paper_reports: false, fees: true, staff: false,
        payroll: false, visitors: true, notifications: false, camera: true,
        settings: false, finance: true, library: true,
        fatwa: false, posts: false, reports: false, recycle_bin: false,
        admissions_view: true, super_admin_panel: false, voice_logs: false
      },
      Parent: {
        dashboard: true, students: false, all_students: false, document_capture: false,
        attendance: false, lessons: false, manual: false, exam_attendance_sheet: false,
        academics: false, exams: true, paper_maker: false, paper_uploader: false,
        paper_checker: false, paper_reports: true, fees: false, staff: false,
        payroll: false, visitors: false, notifications: false, camera: false,
        settings: false, public_result: true, finance: false, library: false,
        fatwa: false, posts: false, reports: false, recycle_bin: false,
        admissions_view: false, super_admin_panel: false, voice_logs: false
      }
    };
    if (!saved) return defaultPerms;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const normalized: any = {};
        parsed.forEach((item: any) => {
          normalized[item.role] =
            typeof item.permissions === "string"
              ? JSON.parse(item.permissions)
              : item.permissions;
        });
        return { ...defaultPerms, ...normalized };
      }
      return parsed;
    } catch (e) {
      return defaultPerms;
    }
  });

  const hasPermission = (modId: string) => {
    // 1. Master Admin Check
    if (ADMIN_EMAILS.includes(currentUserEmail.toLowerCase())) return true;

    // 2. Cloud Permissions Check
    if (currentUserProfile) {
        if (currentUserProfile.role === "Admin") return true;
        if (currentUserProfile.permissions?.modules?.includes(modId)) return true;
    }

    // 3. SaaS multi-tenant billing allowed modules list
    const allowedRaw = localStorage.getItem("madrassaModules");
    if (allowedRaw) {
      try {
        const allowed = JSON.parse(allowedRaw);
        if (Array.isArray(allowed)) {
          const moduleMapping: Record<string, string> = {
            students: "students",
            all_students: "students",
            attendance: "attendance",
            attendance_qr: "attendance",
            manual: "attendance",
            camera: "attendance",
            staff_attendance: "attendance",
            academics: "academics",
            grade: "academics",
            lessons: "academics",
            lessons_daily: "academics",
            results: "exams",
            results_grid: "exams",
            exams: "exams",
            paper_maker: "exams",
            paper_uploader: "exams",
            paper_checker: "exams",
            paper_reports: "exams",
            finance: "finance",
            saved_salaries: "staff",
            payroll: "finance",
            payroll_grid: "finance",
            fees: "finance",
            fees_grid: "finance",
            staff: "staff",
            staff_grid: "staff",
            document_capture: "students",
          };
          const mappedMod = moduleMapping[modId];
          if (mappedMod && !allowed.includes(mappedMod)) {
            return false;
          }
        }
      } catch (e) {}
    }

    const isSuperAdminUser =
      localStorage.getItem("isSuperAdmin") === "true" ||
      ADMIN_EMAILS.includes(currentUserEmail.toLowerCase());

    if (userStatus === "pending" && !isSuperAdminUser) {
      const pendingAllowed = [
        "dashboard",
        "all_students",
        "results_grid",
        "library",
        "fatwa",
        "posts",
        "notepad",
        "notes",
      ];
      if (!pendingAllowed.includes(modId)) return false;
    }

    if (isSuperAdminUser) return true;

    // Map sidebar/grid IDs to permission keys
    const permMap: Record<string, string> = {
      dashboard: "dashboard",
      students: "students",
      all_students: "all_students",
      document_capture: "document_capture",
      attendance: "attendance",
      attendance_qr: "attendance",
      lessons: "lessons",
      manual: "manual",
      qr_manual_attendance: "qr_manual_attendance",
      admin_panel: "admin_panel",
      exam_attendance_sheet: "exam_attendance_sheet",
      academics: "academics",
      grade: "academics",
      results: "exams",
      results_grid: "exams",
      exams: "exams",
      paper_maker: "paper_maker",
      paper_uploader: "paper_uploader",
      paper_checker: "paper_checker",
      paper_reports: "paper_reports",
      fees: "fees",
      fees_grid: "fees",
      staff: "staff",
      staff_grid: "staff",
      payroll: "payroll",
      payroll_grid: "payroll",
      visitors: "visitors",
      visitors_grid: "visitors",
      notifications: "notifications",
      messaging: "notifications",
      camera: "camera",
      settings: "settings",
      public_result: "public_result",
      finance: "finance",
      library: "library",
      fatwa: "fatwa",
      posts: "posts",
      reports: "reports",
      recycle_bin: "recycle_bin",
      online_applications: "admissions_view",
      admissions_view: "admissions_view",
      degree_distribution: "degree_distribution",
      super_admin_panel: "super_admin_panel",
      voice_logs: "voice_logs"
    };

    const key = permMap[modId] || modId;
    return permissions[userRole]?.[key] !== false;
  };

  // Sync Logic
  useEffect(() => {
    // 2. Listen for background updates to trigger module refreshes
    const handleStorageUpdate = () => {
      const saved = localStorage.getItem("system_settings");
      if (saved) setSystemSettings(JSON.parse(saved));

      setUserRole(localStorage.getItem("currentUserRole") || "Admin");
      setUserStatus(localStorage.getItem("userStatus") || "accepted");
      const savedPerms = localStorage.getItem("role_permissions");
      if (savedPerms) {
        try {
          const parsed = JSON.parse(savedPerms);
          if (Array.isArray(parsed)) {
            const normalized: any = {};
            parsed.forEach((item: any) => {
              normalized[item.role] =
                typeof item.permissions === "string"
                  ? JSON.parse(item.permissions)
                  : item.permissions;
            });
            setPermissions(normalized);
          } else {
            setPermissions(parsed);
          }
        } catch (e) {
          console.error("Error parsing permissions in storage update:", e);
        }
      }
    };
    window.addEventListener("storage_updated", handleStorageUpdate);

    return () => {
      window.removeEventListener("storage_updated", handleStorageUpdate);
    };
  }, []);

  const saveSettings = async (newSettings: any) => {
    setSystemSettings(newSettings);
    localStorage.setItem("system_settings", JSON.stringify(newSettings));
    await updateCentralKey("system_settings", newSettings);
  };

  const sidebarItems = [
    {
      id: "dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      subLabel: "Main Overview",
    },
    {
      id: "students",
      path: "/dashboard/students",
      icon: Users,
      label: "Students",
      subLabel: "Admission",
    },
    {
      id: "all_students",
      path: "/dashboard/all-students",
      icon: List,
      label: "All Students",
      subLabel: "Directory",
    },
    {
      id: "document_capture",
      path: "/dashboard/document-capture",
      icon: Camera,
      label: "Documents",
      subLabel: "Scan Center",
    },
    {
      id: "lessons",
      path: "/dashboard/lessons",
      icon: BookOpen,
      label: "Daily Lessons",
      subLabel: "Teaching Log",
    },
    {
      id: "manual",
      path: "/dashboard/manual-attendance",
      icon: Hand,
      label: "Manual Attendance",
      subLabel: "Manual Logs",
    },
    {
      id: "qr_manual_attendance",
      path: "/dashboard/qr-attendance",
      icon: QrCode,
      label: "QR Attendance",
      subLabel: "Verification",
    },
    {
      id: "admin_panel",
      path: "/dashboard/admin-panel",
      icon: ShieldCheck,
      label: "Admin Panel",
      subLabel: "Management",
    },
    {
      id: "exam_attendance_sheet",
      path: "/dashboard/exam-attendance",
      icon: Printer,
      label: "Exam Sheet",
      subLabel: "Print Attendance",
    },
    {
      id: "academics",
      path: "/dashboard/grade",
      icon: GraduationCap,
      label: "Academics",
      subLabel: "Curriculum",
    },
    {
      id: "results",
      path: "/dashboard/exams",
      icon: FileText,
      label: "Exams",
      subLabel: "Results Center",
    },
    {
      id: "paper_maker",
      path: "/dashboard/paper-maker",
      icon: PenTool,
      label: "Paper Maker",
      subLabel: "AI Generation",
    },
    {
      id: "paper_uploader",
      path: "/dashboard/paper-uploader",
      icon: Upload,
      label: "Paper Uploader",
      subLabel: "Upload Center",
    },
    {
      id: "paper_checker",
      path: "/dashboard/paper-checker",
      icon: CheckSquare,
      label: "Paper Checker",
      subLabel: "Grading",
    },
    {
      id: "paper_reports",
      path: "/dashboard/paper-reports",
      icon: FileTextIcon,
      label: "Paper Reports",
      subLabel: "Analytics",
    },
    {
      id: "fees",
      path: "/dashboard/fees",
      icon: CreditCard,
      label: "Fees",
      subLabel: "Finance",
    },
    {
      id: "staff",
      path: "/dashboard/staff",
      icon: UserCog,
      label: "Staff",
      subLabel: "Staff Management",
    },
    {
      id: "payroll",
      path: "/dashboard/payroll",
      icon: Wallet,
      label: "Payroll",
      subLabel: "Salaries",
    },
    {
      id: "visitors",
      path: "/dashboard/visitors",
      icon: UserPlus,
      label: "Visitors",
      subLabel: "Visitor Log",
    },
    {
      id: "notifications",
      path: "/dashboard/messaging",
      icon: Bell,
      label: "Notifications",
      subLabel: "Announcements",
    },
    {
      id: "camera",
      path: "/dashboard/camera",
      icon: Camera,
      label: "Camera",
      subLabel: "Live View",
    },
    {
      id: "notepad",
      path: "/dashboard/notepad",
      icon: StickyNote,
      label: "Notepad",
      subLabel: "Notes",
    },
    {
      id: "settings",
      path: "/dashboard/settings",
      icon: Settings,
      label: "Settings",
      subLabel: "System Configuration",
    },
    {
      id: "public_result",
      path: "/dashboard/public-result",
      icon: Globe,
      label: "Public Portal",
      subLabel: "Online Results",
    },
    {
      id: "degree_distribution",
      path: "/dashboard/degree-distribution",
      icon: GraduationCap,
      label: "Degrees",
      subLabel: "Distribution",
    },
    {
      id: "finance",
      path: "/dashboard/finance",
      icon: Landmark,
      label: "Accounts",
      subLabel: "Bookkeeping",
    },
    {
      id: "library",
      path: "/dashboard/library",
      icon: Library,
      label: "Library",
      subLabel: "Resources",
    },
    {
      id: "fatwa",
      path: "/dashboard/fatwa",
      icon: Landmark,
      label: "Advisory",
      subLabel: "Center",
    },
    {
      id: "posts",
      path: "/dashboard/posts",
      icon: StickyNote,
      label: "Posts",
      subLabel: "Community",
    },
    {
      id: "reports",
      path: "/dashboard/reports",
      icon: ClipboardList,
      label: "Reports",
      subLabel: "Data Center",
    },
    {
      id: "recycle_bin",
      path: "/dashboard/recycle-bin",
      icon: Trash2,
      label: "Recycle Bin",
      subLabel: "Deleted Items",
    },
  ].filter((item) => {
    if (item.id === "settings")
      return hasPermission(item.id) && (isAdmin || userStatus === "accepted");
    return hasPermission(item.id);
  });

  const gridCards = [
    {
      id: "students",
      path: "/dashboard/students",
      icon: Users,
      title: "Student Admission",
      subtitle: "New Enrollment",
      color: "bg-blue-500",
    },
    {
      id: "all_students",
      path: "/dashboard/all-students",
      icon: List,
      title: "Student Directory",
      subtitle: "Management",
      color: "bg-blue-600",
    },
    {
      id: "document_capture",
      path: "/dashboard/document-capture",
      icon: Camera,
      title: "Document Capture",
      subtitle: "Student Files",
      color: "bg-indigo-600",
    },
    {
      id: "relatives",
      path: "/dashboard/placeholder",
      icon: Users,
      title: "Guardians",
      subtitle: "Family Info",
      color: "bg-indigo-600",
    },
    {
      id: "attendance_qr",
      path: "/dashboard/attendance",
      icon: UserCheck,
      title: "Attendance (QR/Bio)",
      subtitle: "Daily Check",
      color: "bg-cyan-500",
    },
    {
      id: "qr_manual_attendance",
      path: "/dashboard/qr-attendance",
      icon: QrCode,
      title: "QR Verification",
      subtitle: "Manual Check",
      color: "bg-blue-700",
    },
    {
      id: "admin_panel",
      path: "/dashboard/admin-panel",
      icon: ShieldCheck,
      title: "Admin Control",
      subtitle: "Master Access",
      color: "bg-indigo-700",
    },
    {
      id: "lessons_daily",
      path: "/dashboard/placeholder",
      icon: BookOpen,
      title: "Teaching Progress",
      subtitle: "Daily Log",
      color: "bg-teal-500",
    },
    {
      id: "scholarship",
      path: "/dashboard/placeholder",
      icon: Wallet,
      title: "Financial Aid",
      subtitle: "Scholarships",
      color: "bg-emerald-500",
    },
    {
      id: "fees_grid",
      path: "/dashboard/fees",
      icon: CreditCard,
      title: "Fees Management",
      subtitle: "Collections",
      color: "bg-blue-600",
    },
    {
      id: "grade",
      path: "/dashboard/grade",
      icon: Grid,
      title: "Class Setup",
      subtitle: "Academic Structure",
      color: "bg-purple-500",
    },
    {
      id: "paper_maker",
      path: "/dashboard/paper-maker",
      icon: PenTool,
      title: "Paper Maker",
      subtitle: "AI Generation",
      color: "bg-indigo-700",
    },
    {
      id: "paper_uploader",
      path: "/dashboard/paper-uploader",
      icon: Upload,
      title: "Paper Upload",
      subtitle: "Archiving",
      color: "bg-blue-700",
    },
    {
      id: "paper_checker",
      path: "/dashboard/paper-checker",
      icon: CheckSquare,
      title: "Grading Tool",
      subtitle: "Assessment",
      color: "bg-emerald-700",
    },
    {
      id: "paper_reports",
      path: "/dashboard/paper-reports",
      icon: FileTextIcon,
      title: "Exam Analytics",
      subtitle: "Reports",
      color: "bg-cyan-700",
    },
    {
      id: "staff_grid",
      path: "/dashboard/staff",
      icon: UserCog,
      title: "Staff & Faculty",
      subtitle: "Human Resources",
      color: "bg-emerald-600",
    },
    {
      id: "staff_attendance",
      path: "/dashboard/camera",
      icon: UserCheck,
      title: "Staff Attendance",
      subtitle: "QR/Bio Track",
      color: "bg-lime-500",
    },
    {
      id: "payroll_grid",
      path: "/dashboard/payroll",
      icon: Wallet,
      title: "Payroll System",
      subtitle: "Salaries",
      color: "bg-green-600",
    },
    {
      id: "book",
      path: "/dashboard/placeholder",
      icon: Book,
      title: "Textbooks",
      subtitle: "Library",
      color: "bg-green-700",
    },
    {
      id: "messaging",
      path: "/dashboard/messaging",
      icon: MessageSquare,
      title: "Messages",
      subtitle: "Center",
      color: "bg-blue-500",
    },
    {
      id: "results_grid",
      path: "/dashboard/exams",
      icon: FileSearch,
      title: "Result Sheets",
      subtitle: "Examinations",
      color: "bg-lime-600",
    },
    {
      id: "visitors_grid",
      path: "/dashboard/visitors",
      icon: ClipboardList,
      title: "Visitor Register",
      subtitle: "Security Log",
      color: "bg-sky-500",
    },
    {
      id: "documents",
      path: "/dashboard/documents",
      icon: FileText,
      title: "Document Intake",
      subtitle: "Student Files",
      color: "bg-sky-400",
    },
    {
      id: "complaints",
      path: "/dashboard/placeholder",
      icon: Bell,
      title: "Grievances",
      subtitle: "Complaint Box",
      color: "bg-teal-600",
    },
    {
      id: "fatwa",
      path: "/dashboard/fatwa",
      icon: Landmark,
      title: "Darul Ifta",
      subtitle: "Fatwa Service",
      color: "bg-orange-500",
    },
    {
      id: "posts",
      path: "/dashboard/posts",
      icon: StickyNote,
      title: "Bulletin Board",
      subtitle: "Announcements",
      color: "bg-teal-650",
    },
    {
      id: "library",
      path: "/dashboard/library",
      icon: Library,
      title: "Library Catalog",
      subtitle: "Resources",
      color: "bg-indigo-500",
    },
    {
      id: "phone_diary",
      path: "/dashboard/placeholder",
      icon: Phone,
      title: "Contact Diary",
      subtitle: "Phonebook",
      color: "bg-blue-700",
    },
    {
      id: "notes",
      path: "/dashboard/notepad",
      icon: StickyNote,
      title: "Personal Notes",
      subtitle: "Scratchpad",
      color: "bg-indigo-800",
    },
    {
      id: "finance",
      path: "/dashboard/finance",
      icon: Calculator,
      title: "Accounting",
      subtitle: "Cash Book",
      color: "bg-red-500",
    },
    {
      id: "public_result",
      path: "/dashboard/public-result",
      icon: Globe,
      title: "Online Portal",
      subtitle: "Public Results",
      color: "bg-teal-600",
    },
    {
      id: "degree_distribution",
      path: "/dashboard/degree-distribution",
      icon: GraduationCap,
      title: "Certificates",
      subtitle: "Degrees",
      color: "bg-amber-600",
    },
    {
      id: "recycle_bin",
      path: "/dashboard/recycle-bin",
      icon: Trash2,
      title: "Recycle Bin",
      subtitle: "Deleted Items",
      color: "bg-rose-500",
    },
  ].filter((card) => hasPermission(card.id));

  const matchedStudents = allStudents.filter((s) => {
    if (!globalSearchTerm) return false;
    const term = globalSearchTerm.toLowerCase();

    const nameMatch = s.name?.toLowerCase().includes(term);
    const fatherNameMatch = s.fatherName?.toLowerCase().includes(term);
    const regNoMatch =
      s.regNo?.toLowerCase().includes(term) || s.id?.toString().includes(term);
    const rollNoMatch = s.rollNo?.toLowerCase().includes(term);
    const gradeMatch = s.grade?.toLowerCase().includes(term);

    return (
      nameMatch || fatherNameMatch || regNoMatch || rollNoMatch || gradeMatch
    );
  });

  const madrassaStatus = localStorage.getItem("madrassaStatus") || "active";
  const banReason =
    localStorage.getItem("madrassaRequirement") ||
    localStorage.getItem("banReason") ||
    (currentUserProfile?.status === "Banned" 
      ? `Dear user! Your account has been temporarily blocked. Please contact administration to restore your account. (Account ID: ${currentUserEmail})`
      : "Your software license has been temporarily suspended due to pending administrative requirements or dues. Please contact the central administrator for verification and payment of dues.");
  
  const isBanned =
    userStatus === "banned" ||
    userStatus === "suspended" ||
    userStatus === "rejected" ||
    currentUserProfile?.status === "Banned" ||
    madrassaStatus === "inactive" ||
    localStorage.getItem("madrassaExpiryExpired") === "true";

  if (isBanned) {
    return (
      <div
        className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white text-left select-none"
        dir="ltr"
      >
        <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-[3rem] p-10 md:p-14 shadow-2xl relative overflow-hidden flex flex-col items-center">
          {/* Accent light balls */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          {/* Alert Icon */}
          <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-3xl text-red-500 mb-8 animate-pulse shadow-lg shadow-red-500/10">
            <svg
              className="w-12 h-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="text-2xl md:text-3xl font-black text-white px-2 py-1 leading-tight text-center mb-4">
            Account Suspended / Canceled!
          </h1>
          <p className="text-slate-400 text-xs text-center font-sans uppercase tracking-widest leading-none mb-6">
            Account Suspended & Blocked
          </p>

          <div className="w-full h-px bg-slate-800/80 my-2" />

          {/* Dynamic Requirement Message Box */}
          <div className="w-full bg-slate-950/80 border border-slate-800/60 p-6 rounded-2xl mb-8 space-y-3 text-left">
            <span className="text-xs font-bold text-red-400 block border-b border-slate-800/40 pb-2">
              Details and Conditions from the System:
            </span>
            <p className="text-sm md:text-md text-slate-300 leading-relaxed font-bold">
              {banReason}
            </p>
          </div>

          {/* Support Actions */}
          <div className="w-full flex flex-col gap-4">
            <a
              href="https://wa.me/923435488319"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#128C7E] border border-emerald-500/20 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 active:scale-95 transition-all text-center text-sm"
            >
              <span>Contact Super Admin (WhatsApp)</span>
            </a>
            <button
              onClick={() => {
                localStorage.removeItem("currentUser");
                localStorage.removeItem("currentUserRole");
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("isSuperAdmin");
                localStorage.removeItem("userStatus");
                onLogout();
                navigate("/login");
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-2xl font-bold transition-all text-xs"
            >
              Logout and Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const userPermissions = {
    canAdd: isAdmin || currentUserProfile?.permissions?.canAdd,
    canEdit: isAdmin || currentUserProfile?.permissions?.canEdit,
    canDelete: isAdmin || currentUserProfile?.permissions?.canDelete,
  };

  const isSuperAdminAccount = 
    currentUserEmail.toLowerCase().includes('adminabdulrehmanhabibkpk') || 
    localStorage.getItem('isSuperAdmin') === 'true' ||
    userRole === 'Super Admin';

  if (isSuperAdminAccount && location.pathname !== '/dashboard/school-view') {
    return (
      <div className="w-full h-screen bg-slate-900 overflow-hidden">
        <SuperAdminPanel onClose={() => navigate('/dashboard/school-view')} />
      </div>
    );
  }

  return (
    <div className="flex flex-row h-screen bg-[#F4F7F6] overflow-hidden print:block print:h-auto print:bg-transparent relative">
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-[70] bg-white text-blue-600 p-2.5 rounded-xl shadow-lg border border-slate-100 hover:bg-slate-50 transition-all print:hidden lg:top-24"
        title={isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
      >
        <Grid className="w-5 h-5" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && window.innerWidth <= 1024 && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${isSidebarOpen ? "w-64" : "w-0"} sidebar-gradient flex flex-col transition-all duration-300 print:hidden overflow-y-auto overflow-x-hidden custom-scrollbar shadow-2xl fixed inset-y-0 left-0 z-[65] lg:relative lg:z-10`}
      >
        <div className="p-8 mb-4 min-w-[256px]">
          <div className="flex flex-col items-center gap-4 mb-2">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white font-bold overflow-hidden shadow-xl border border-white/20">
              {systemSettings.monogram ? (
                <img
                  src={systemSettings.monogram}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <Landmark className="w-8 h-8" />
              )}
            </div>
            <div className="flex flex-col text-center">
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">
                Management System
              </span>
              <span className="text-sm font-bold text-white mt-1">
                {systemSettings.jamiaName}
              </span>
            </div>
          </div>
          <div className="h-px bg-white/10 w-full my-6" />

          {/* PWA Install Button */}
          {deferredPrompt && (
            <button
              onClick={handleInstallApp}
              className="w-full mb-6 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Upload className="w-4 h-4" />
              Install App
            </button>
          )}
          
          <div className="relative">
             <input
                 type="text"
                 placeholder="Search..."
                 className="w-full bg-white/10 text-white placeholder-white/50 px-4 py-2.5 rounded-xl text-sm outline-none"
                 onChange={(e) => setSidebarSearchTerm(e.target.value)}
                 dir="ltr"
             />
             <Search className="absolute right-3 top-2.5 w-4 h-4 text-white/50" />
          </div>
        </div>

        <div className="flex-1 px-2 space-y-1">
          {sidebarItems
            .filter((item) => {
              // 1. Master Check (Master Admins see everything)
              if (isAdmin) return true;

              // 2. Admin Panel check
              if (item.id === "admin_panel") return false;

              // 3. User Specific Modules from Firestore
              if (currentUserProfile?.permissions?.modules) {
                return currentUserProfile.permissions.modules.includes(item.id);
              }

              // 4. Default Static Permissions (Fallback)
              if (item.id === "dashboard") return true;
              return item.label.toLowerCase().includes(sidebarSearchTerm.toLowerCase()) || item.subLabel.toLowerCase().includes(sidebarSearchTerm.toLowerCase());
            })
            .map((item) => (
            <SidebarItem
              key={item.id}
              id={`nav-${item.id}`}
              icon={item.icon}
              label={item.label}
              subLabel={item.subLabel}
              active={
                location.pathname === item.path ||
                (item.id === "dashboard" && location.pathname === "/dashboard")
              }
              onClick={() => {
                navigate(item.path);
                if (window.innerWidth <= 1024) setIsSidebarOpen(false);
              }}
            />
          ))}
        </div>

        <div className="p-6 mt-auto">
          <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3" dir="ltr">
              <div className="w-10 h-10 bg-white/20 rounded-xl overflow-hidden border border-white/20">
                <img
                  src="https://picsum.photos/seed/admin/100/100"
                  alt="Admin"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white">
                  Admin User
                </span>
                <span className="text-[9px] text-white/50 uppercase tracking-wider">
                  School Admin
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                onLogout();
                navigate("/login");
              }}
              className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible print:h-auto">
        {/* Offline & Sync Status Banner */}
        {(!isOnline || syncStatus !== 'idle' || pendingSyncCount > 0) && (
          <div 
            className={`px-6 py-2.5 flex items-center justify-between text-left text-xs transition-all duration-300 shadow-sm border-b z-40 ${
              !isOnline 
                ? 'bg-amber-500 text-white border-amber-600' 
                : syncStatus === 'syncing'
                  ? 'bg-blue-600 text-white border-blue-700'
                  : 'bg-emerald-600 text-white border-emerald-700'
            }`}
            dir="ltr"
          >
            <div className="flex items-center gap-2">
              {!isOnline ? (
                <>
                  <CloudOff className="w-4 h-4 animate-pulse" />
                  <span>You are offline. Changes will sync automatically when internet is restored.</span>
                </>
              ) : syncStatus === 'syncing' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Syncing data with server... Please wait.</span>
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4" />
                  <span>All data synced successfully!</span>
                </>
              )}
            </div>
            
            {pendingSyncCount > 0 && (
              <div className="bg-white/20 px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1.5" dir="ltr">
                <span>Pending changes:</span>
                <span className="font-mono bg-white text-slate-900 rounded px-1.5 py-0.2 font-bold text-xs">
                  {pendingSyncCount}
                </span>
              </div>
            )}
          </div>
        )}
        <Routes>
          <Route
            path="/students"
            element={
              <StudentManagement onBack={() => navigate("/dashboard")} />
            }
          />
          <Route
            path="/all-students"
            element={
              <AllStudents 
                onBack={() => navigate("/dashboard")} 
                permissions={userPermissions} 
              />
            }
          />
          <Route
            path="/document-capture"
            element={
              <StudentDocumentCapture onBack={() => navigate("/dashboard")} />
            }
          />
          <Route
            path="/settings"
            element={
              isAdmin || userStatus === "accepted" ? (
                <SettingsView
                  onBack={() => navigate("/dashboard")}
                  onSubViewChange={(view) => {
                    if (view === "exam_management")
                      navigate("/dashboard/exams");
                  }}
                />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/notepad"
            element={<Notepad onBack={() => navigate("/dashboard")} />}
          />
          <Route
            path="/exams"
            element={<ExamManagement onBack={() => navigate("/dashboard")} />}
          />
          <Route
            path="/manual-attendance"
            element={<ManualAttendance onBack={() => navigate("/dashboard")} />}
          />
          <Route
            path="/qr-attendance"
            element={<QRManualAttendance onBack={() => navigate("/dashboard")} />}
          />
          <Route
            path="/admin-panel"
            element={<AdminDashboard onBack={() => navigate("/dashboard")} />}
          />
          <Route
            path="/exam-attendance"
            element={<ExamAttendanceSheet onClose={() => navigate("/dashboard")} />}
          />
          <Route
            path="/student-profile/:id"
            element={<StudentProfile />}
          />
          <Route
            path="/attendance"
            element={
              <SecurityAttendance onBack={() => navigate("/dashboard")} />
            }
          />
          <Route
            path="/camera"
            element={<CameraView onBack={() => navigate("/dashboard")} />}
          />
          <Route
            path="/finance"
            element={
              <FinanceManagement onBack={() => navigate("/dashboard")} />
            }
          />
          <Route
            path="/staff"
            element={<StaffManagement onBack={() => navigate("/dashboard")} />}
          />
          <Route
            path="/messaging"
            element={<MessagingCenter onBack={() => navigate("/dashboard")} />}
          />
          <Route
            path="/grade"
            element={
              hasPermission("academics") ? (
                <GradeManagement onBack={() => navigate("/dashboard")} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/paper-maker"
            element={
              hasPermission("exams") ? (
                <PaperMaker onBack={() => navigate("/dashboard")} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/paper-uploader"
            element={
              hasPermission("paper_uploader") ? (
                <PaperUploader onBack={() => navigate("/dashboard")} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/paper-checker"
            element={
              hasPermission("paper_checker") ? (
                <PaperChecker onBack={() => navigate("/dashboard")} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/paper-reports"
            element={
              hasPermission("paper_reports") ? (
                <PaperReports onBack={() => navigate("/dashboard")} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/library"
            element={<BookLibrary onBack={() => navigate("/dashboard")} />}
          />
          <Route
            path="/reports"
            element={<ReportsView onBack={() => navigate("/dashboard")} />}
          />
          <Route
            path="/fatwa"
            element={<DarulIfta onBack={() => navigate("/dashboard")} />}
          />
          <Route
            path="/posts"
            element={<JamiaPosts onBack={() => navigate("/dashboard")} />}
          />
          <Route
            path="/payroll"
            element={
              <PayrollManagement onBack={() => navigate("/dashboard")} />
            }
          />
          <Route
            path="/fees"
            element={<FeesManagement onBack={() => navigate("/dashboard")} />}
          />
          <Route
            path="/documents"
            element={
              <DocumentManagement onBack={() => navigate("/dashboard")} />
            }
          />
          <Route
            path="/recycle-bin"
            element={<RecycleBin onBack={() => navigate("/dashboard")} />}
          />
          <Route
            path="/public-result"
            element={
              <PublicResultPortal onClose={() => navigate("/dashboard")} />
            }
          />
          <Route
            path="/degree-distribution"
            element={<DegreeDistribution />}
          />
          <Route
            path="/placeholder"
            element={
              <ModulePlaceholder
                title={activeModuleName}
                onBack={() => navigate("/dashboard")}
              />
            }
          />

          <Route
            path="/"
            element={
              <>
                {/* Top Header */}
                <header className="min-h-20 bg-white flex flex-col md:flex-row items-center justify-between px-4 md:px-8 border-b border-slate-100 shadow-sm py-2 gap-4">
                  <div className="flex items-center justify-between w-full md:w-auto gap-4">
                    <div className="flex items-center gap-3">
                      <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <Bell className="w-5 h-5" />
                      </button>

                      {/* Global student search bar - Hidden on very small screens, visible on mobile+ */}
                      <div
                        className="relative z-50 flex items-center"
                        dir="ltr"
                      >
                        <div className="flex items-center bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all w-48 sm:w-64 md:w-80">
                          <Search className="w-4 h-4 text-slate-400 mr-2" />
                          <input
                            type="text"
                            placeholder="Search..."
                            value={globalSearchTerm}
                            onChange={(e) => {
                              setGlobalSearchTerm(e.target.value);
                              setIsSearchFocused(true);
                            }}
                            onFocus={() => setIsSearchFocused(true)}
                            className="bg-transparent text-[10px] sm:text-xs outline-none text-slate-800 placeholder-slate-400 w-full text-left"
                          />
                          {globalSearchTerm && (
                            <button
                              type="button"
                              onClick={() => {
                                setGlobalSearchTerm("");
                                setIsSearchFocused(false);
                              }}
                              className="text-slate-400 hover:text-slate-600 ml-1 text-xs"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Floating Results Panel */}
                        {isSearchFocused && globalSearchTerm && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setIsSearchFocused(false)}
                            />
                            <div className="absolute top-12 left-0 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-96 overflow-y-auto z-50 p-2">
                              <div className="px-3 py-2 text-[10px] font-bold text-slate-400 text-left border-b border-slate-100">
                                Search Results ({matchedStudents.length})
                              </div>
                              {matchedStudents.length === 0 ? (
                                <div className="p-6 text-center text-xs text-slate-400">
                                  No student found.
                                </div>
                              ) : (
                                <div className="divide-y divide-slate-100">
                                  {matchedStudents
                                    .slice(0, 8)
                                    .map((student: any) => (
                                      <div
                                        key={student.id}
                                        onClick={() => {
                                          setSelectedPreviewStudent(student);
                                          setIsSearchFocused(false);
                                        }}
                                        className="p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors flex items-center justify-between text-left"
                                      >
                                        <div className="flex flex-col">
                                          <span className="text-xs font-bold text-slate-800">
                                            {student.name}
                                          </span>
                                          <span className="text-[10px] text-slate-400">
                                            Grade: {student.grade || "N/A"} |
                                            Father: {student.fatherName || "N/A"}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                                            Reg: {student.regNo || student.id}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  {matchedStudents.length > 8 && (
                                    <div
                                      onClick={() => {
                                        localStorage.setItem(
                                          "pendingSearchTerm",
                                          globalSearchTerm,
                                        );
                                        navigate("/dashboard/all-students");
                                        setIsSearchFocused(false);
                                      }}
                                      className="p-3 text-center text-[11px] font-bold text-blue-600 hover:bg-blue-50/50 rounded-xl cursor-pointer transition-colors mt-1"
                                    >
                                      Click here to see all {matchedStudents.length} results →
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full md:w-auto gap-4 md:gap-6" dir="ltr">
                    <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl py-2 px-3 sm:px-4 shadow-sm hover:shadow-md transition-all group">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-100 group-hover:rotate-6 transition-transform">
                            {currentUserName.charAt(0).toUpperCase()}
                        </div>
                        <div className="hidden sm:flex flex-col text-left ml-4">
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{urduRole}</span>
                            <h2 className="text-slate-900 text-sm font-black leading-tight">
                                {currentUserName}
                            </h2>
                        </div>
                    </div>
                    <div className="h-10 w-px bg-slate-100 mx-1 md:mx-2" />
                    <div className="flex items-center gap-3">
                      <button className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                        <Plus className="w-4 h-4" />
                        <span className="hidden xs:inline">New Entry</span>
                      </button>
                    </div>
                  </div>
                </header>

                {/* Pending View-only Banner */}
                {userStatus === "pending" && !isAdmin && (
                  <div
                    className="bg-amber-500 text-white font-bold px-8 py-4 flex items-center justify-between text-sm shadow-md"
                    dir="ltr"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">⚠️</span>
                      <span>
                        Temporary Login (View-only): Your account is awaiting admin approval. You can view information but cannot make changes.
                      </span>
                    </div>
                    <a
                      href="https://wa.me/923435488319"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white text-amber-700 font-bold px-4 py-1.5 rounded-lg text-xs hover:bg-neutral-100 transition-all shadow-md"
                    >
                      Contact Admin
                    </a>
                  </div>
                )}

                {/* Sub Header / Tabs */}
                <div
                  className="bg-white px-4 md:px-8 py-1 flex justify-start gap-6 md:gap-10 border-b border-slate-100 overflow-x-auto no-scrollbar"
                  dir="ltr"
                >
                  {["Center", "Statistics", "Miscellaneous", "Reports"].map((tab) => {
                    const isActive =
                      tab === "Reports" &&
                      location.pathname === "/dashboard/reports";
                    return (
                      <button
                        key={tab}
                        onClick={() => {
                          if (tab === "Reports") navigate("/dashboard/reports");
                          else {
                            setActiveModuleName(tab);
                            navigate("/dashboard/placeholder");
                          }
                        }}
                        className={`text-xs font-bold py-3 px-1 transition-all relative ${isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
                      >
                        {tab}
                        {isActive && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Grid Content */}
                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  <div className="mb-8" dir="ltr">
                    <h3 className="text-slate-800 font-bold text-lg mb-6 flex items-center gap-3">
                      <div className="w-2 h-8 bg-blue-600 rounded-full" />
                      Administrative Tasks (Key Modules)
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-5">
                      {gridCards.map((card) => (
                        <GridCard
                          key={card.id}
                          id={`grid-${card.id}`}
                          icon={card.icon}
                          title={card.title}
                          subtitle={card.subtitle}
                          color={card.color}
                          onClick={() => {
                            
                            navigate(card.path);
                            if (card.path.includes("placeholder"))
                              setActiveModuleName(card.title);
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                    dir="ltr"
                  >
                    <div className="card-widget border-l-4 border-l-blue-600 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex flex-col text-left">
                             <span className="text-[11px] font-bold text-slate-800">Total Students</span>
                             <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Enrollment Status</span>
                          </div>
                          {isInitialLoading ? (
                            <Skeleton className="h-8 w-24 mt-1" />
                          ) : (
                            <h4 className="text-2xl font-bold text-slate-800 mt-2 font-mono">
                              {allStudents.length > 0 ? allStudents.length.toLocaleString() : "1,240"}
                            </h4>
                          )}
                        </div>
                        <div className="bg-blue-50 p-2.5 rounded-2xl text-blue-600 shadow-sm">
                          <Users className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-green-500 text-[10px] font-bold bg-green-50 w-fit px-2 py-0.5 rounded-full">
                        {isInitialLoading ? (
                          <Skeleton className="h-3 w-32" />
                        ) : (
                          <span>+{allStudents.length > 0 ? Math.max(1, Math.round(allStudents.length * 0.04)) : 12}% vs last month</span>
                        )}
                      </div>
                    </div>
                    <div className="card-widget border-l-4 border-l-emerald-600 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex flex-col text-left">
                             <span className="text-[11px] font-bold text-slate-800">Student Attendance</span>
                             <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Attendance Status</span>
                          </div>
                          {isInitialLoading ? (
                            <Skeleton className="h-8 w-16 mt-1" />
                          ) : (
                            <h4 className="text-2xl font-bold text-slate-800 mt-2 font-mono">
                              {dynamicAttendancePercent}%
                            </h4>
                          )}
                        </div>
                        <div className="bg-emerald-50 p-2.5 rounded-2xl text-emerald-600 shadow-sm">
                          <UserCheck className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-green-500 text-[10px] font-bold bg-green-50 w-fit px-2 py-0.5 rounded-full">
                        {isInitialLoading ? (
                          <Skeleton className="h-3 w-40" />
                        ) : (
                          <span>{attendanceRecords.filter(r => r.type === "student").length > 0 ? "Live Records" : "Optimized Trends"}</span>
                        )}
                      </div>
                    </div>
                    <div className="card-widget border-l-4 border-l-orange-600 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex flex-col text-left">
                             <span className="text-[11px] font-bold text-slate-800">Pending Fees</span>
                             <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Financial Status</span>
                          </div>
                          {isInitialLoading ? (
                            <Skeleton className="h-8 w-28 mt-1" />
                          ) : (
                            <h4 className="text-2xl font-bold text-slate-800 mt-2 font-mono">
                              Rs. {dynamicPendingFees >= 1000 ? (dynamicPendingFees / 1000).toFixed(0) + "k" : dynamicPendingFees}
                            </h4>
                          )}
                        </div>
                        <div className="bg-orange-50 p-2.5 rounded-2xl text-orange-600 shadow-sm">
                          <Wallet className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-orange-500 text-[10px] font-bold bg-orange-50 w-fit px-2 py-0.5 rounded-full">
                        {isInitialLoading ? (
                          <Skeleton className="h-3 w-36" />
                        ) : (
                          <span>Monthly Recovery Goal</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Analytics Section powered by Recharts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8" dir="ltr">
                    {/* Enrollment Trend */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between min-h-[360px]">
                      <div className="flex justify-between items-center mb-6">
                        <div className="text-left">
                          <h5 className="font-bold text-slate-800 text-sm">Annual Enrollment Trend</h5>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Annual Enrollment Trends</p>
                        </div>
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-blue-100">Analytics</span>
                      </div>
                      {isInitialLoading ? (
                         <div className="flex flex-col gap-4 mt-2">
                            <div className="flex items-end gap-3 h-48 w-full">
                               <Skeleton className="h-[20%] flex-1" />
                               <Skeleton className="h-[40%] flex-1" />
                               <Skeleton className="h-[35%] flex-1" />
                               <Skeleton className="h-[60%] flex-1" />
                               <Skeleton className="h-[55%] flex-1" />
                               <Skeleton className="h-[80%] flex-1" />
                            </div>
                            <div className="flex justify-between">
                               <Skeleton className="h-3 w-8" />
                               <Skeleton className="h-3 w-8" />
                               <Skeleton className="h-3 w-8" />
                               <Skeleton className="h-3 w-8" />
                               <Skeleton className="h-3 w-8" />
                               <Skeleton className="h-3 w-8" />
                            </div>
                         </div>
                      ) : (
                        <div className="w-full h-[260px] font-sans text-xs">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dynamicEnrollmentTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="year" tickLine={false} axisLine={false} stroke="#94a3b8" />
                              <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px' }}
                                labelClassName="font-bold text-slate-700"
                              />
                              <Legend verticalAlign="top" height={36} iconType="circle" />
                              <Area name="Enrolled Students" type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorStudents)" />
                              <Area name="Exams Passed" type="monotone" dataKey="examsPassed" stroke="#10b981" strokeWidth={2} fillOpacity={0} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>

                    {/* Class Distribution */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between min-h-[360px]">
                      <div className="flex justify-between items-center mb-6">
                        <div className="text-left">
                          <h5 className="font-bold text-slate-800 text-sm">Student Distribution by Grade</h5>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Student Class Distribution</p>
                        </div>
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-emerald-100">Distribution</span>
                      </div>
                      {isInitialLoading ? (
                        <div className="flex flex-col gap-4 mt-2">
                           <div className="flex items-end gap-3 h-48 w-full">
                              <Skeleton className="h-[40%] flex-1" />
                              <Skeleton className="h-[60%] flex-1" />
                              <Skeleton className="h-[80%] flex-1" />
                              <Skeleton className="h-[50%] flex-1" />
                              <Skeleton className="h-[55%] flex-1" />
                              <Skeleton className="h-[45%] flex-1" />
                              <Skeleton className="h-[42%] flex-1" />
                              <Skeleton className="h-[38%] flex-1" />
                           </div>
                           <div className="flex justify-between">
                              <Skeleton className="h-3 w-10" />
                              <Skeleton className="h-3 w-10" />
                              <Skeleton className="h-3 w-10" />
                              <Skeleton className="h-3 w-10" />
                              <Skeleton className="h-3 w-10" />
                              <Skeleton className="h-3 w-10" />
                              <Skeleton className="h-3 w-10" />
                              <Skeleton className="h-3 w-10" />
                           </div>
                        </div>
                      ) : (
                        <div className="w-full h-[260px] font-sans text-xs">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={classDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#94a3b8" />
                              <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" />
                              <Tooltip
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px' }}
                                labelClassName="font-bold text-slate-700"
                              />
                              <Bar name="Number of Students" dataKey="count" fill="#0d9488" radius={[6, 6, 0, 0]} barSize={25} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </div>
                </main>

                {/* Footer */}
                <footer className="h-16 bg-white border-t border-slate-100 px-8 flex items-center justify-between text-[10px] text-slate-400 overflow-hidden">
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-slate-500">
                      All Rights Reserved. Design & Development: Admin Support
                    </span>
                    <span className="uppercase tracking-widest opacity-60">
                      © 2026 {systemSettings.jamiaName} | Professional School Portal V3
                    </span>
                  </div>
                  <div className="flex gap-6 items-center">
                    <div className="hidden sm:flex flex-col items-start">
                      <span
                        className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest ${isSyncing ? "text-blue-500" : "text-emerald-500"}`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${isSyncing ? "bg-blue-500 animate-pulse" : "bg-emerald-500"}`}
                        />
                        {isSyncing ? "Syncing..." : "Live System Online"}
                      </span>
                    </div>
                    <div className="hidden sm:block h-6 w-px bg-slate-100" />
                    <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg border border-slate-200 font-bold uppercase tracking-tighter">
                      V3.2 Stable
                    </span>
                  </div>
                </footer>
              </>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
      <VoiceAssistant />

      {/* Student Details Preview Modal */}
      {selectedPreviewStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-250">
          <div
            className="bg-white rounded-[32px] w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in scale-in duration-200"
            dir="ltr"
          >
            {/* Header */}
            <div className="bg-gradient-to-l from-blue-600 to-indigo-600 text-white p-6 relative text-left">
              <button
                onClick={() => setSelectedPreviewStudent(null)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-full transition-all"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold overflow-hidden border border-white/20">
                  {selectedPreviewStudent.photo ? (
                    <img
                      src={selectedPreviewStudent.photo}
                      alt="Student"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-bold">
                    {selectedPreviewStudent.name}
                  </h4>
                  <p className="text-xs text-white/80 mt-0.5">
                    Father: {selectedPreviewStudent.fatherName}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Info Grid */}
            <div className="p-6 space-y-4 text-sm text-slate-700 max-h-[300px] overflow-y-auto text-left">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-bold">
                    Registration No
                  </span>
                  <span className="text-xs font-bold text-slate-800 font-sans">
                    {selectedPreviewStudent.regNo || selectedPreviewStudent.id}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-bold">
                    Grade (Class)
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {selectedPreviewStudent.grade || "N/A"}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-bold">
                    Roll Number
                  </span>
                  <span className="text-xs font-bold text-slate-800 font-sans">
                    {selectedPreviewStudent.rollNo || "N/A"}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150">
                  <span className="text-[10px] text-slate-400 block font-bold">
                    Phone Number
                  </span>
                  <span className="text-xs font-bold text-slate-800 font-sans">
                    {selectedPreviewStudent.phone || "N/A"}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">
                    CNIC / ID Card
                  </span>
                  <span className="text-xs font-medium text-slate-700 font-sans">
                    {selectedPreviewStudent.cnic || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">
                    Date of Birth
                  </span>
                  <span className="text-xs font-medium text-slate-700 font-sans">
                    {selectedPreviewStudent.dob || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">
                    Current Address
                  </span>
                  <span className="text-xs font-medium text-slate-700">
                    {selectedPreviewStudent.currentAddress || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => {
                  localStorage.setItem(
                    "pendingEditStudentId",
                    selectedPreviewStudent.id.toString(),
                  );
                  navigate("/dashboard/all-students");
                  setSelectedPreviewStudent(null);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-center text-xs shadow-lg shadow-blue-600/10 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  localStorage.setItem(
                    "pendingPrintStudentId",
                    selectedPreviewStudent.id.toString(),
                  );
                  navigate("/dashboard/all-students");
                  setSelectedPreviewStudent(null);
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-center text-xs shadow-lg shadow-emerald-600/10 transition-colors"
              >
                Print Admission Form
              </button>
              <button
                onClick={() => setSelectedPreviewStudent(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
