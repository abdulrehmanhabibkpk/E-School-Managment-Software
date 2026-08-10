import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Check, CheckSquare, BarChart3, Calendar, Wand2, Eye, 
  GraduationCap, Video, Plus, Trash2, AlertTriangle, Clock, User, 
  BookOpen, Sparkles, Copy, ExternalLink, RefreshCw, ClipboardList, Info
} from 'lucide-react';
import { updateCentralKey } from '../syncService';

interface TeachingManagementProps {
  subView: 'mark-attendance' | 'attendance-summary' | 'timetable' | 'tt-wizard' | 'draft-preview' | 'examinations' | 'online-classes';
  onBack: () => void;
}

interface StaffMember {
  id: string;
  employeeId: string;
  name: string;
  phone: string;
}

interface AttendanceRecord {
  date: string;
  records: {
    [staffId: string]: 'present' | 'absent' | 'leave' | 'late';
  };
}

interface TimetableSlot {
  id: string;
  day: string; // 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'
  period: string; // '1st Period (08:00 AM)', '2nd Period (09:00 AM)', etc.
  grade: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  roomNo: string;
  isDraft?: boolean;
}

interface ExamDuty {
  id: string;
  grade: string;
  subject: string;
  date: string;
  time: string;
  roomNo: string;
  invigilatorId: string;
  invigilatorName: string;
}

interface OnlineClass {
  id: string;
  grade: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  dateTime: string;
  meetingLink: string;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [
  'Period 1 (08:00 AM)',
  'Period 2 (09:00 AM)',
  'Period 3 (10:00 AM)',
  'Period 4 (11:00 AM)',
  'Period 5 (12:00 PM)'
];

const GRADES = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];
const SUBJECTS = ['Mathematics', 'Urdu', 'Arabic', 'English', 'Science', 'Islamic Studies', 'History', 'Geography'];

export default function TeachingManagement({ subView, onBack }: TeachingManagementProps) {
  // --- Data States ---
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [exams, setExams] = useState<ExamDuty[]>([]);
  const [onlineClasses, setOnlineClasses] = useState<OnlineClass[]>([]);

  // --- Attendance States ---
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [currentAttendance, setCurrentAttendance] = useState<{ [staffId: string]: 'present' | 'absent' | 'leave' | 'late' }>({});
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // --- TT Wizard States ---
  const [wizardDay, setWizardDay] = useState('Monday');
  const [wizardPeriod, setWizardPeriod] = useState(PERIODS[0]);
  const [wizardGrade, setWizardGrade] = useState(GRADES[0]);
  const [wizardSubject, setWizardSubject] = useState(SUBJECTS[0]);
  const [wizardTeacherId, setWizardTeacherId] = useState('');
  const [wizardRoomNo, setWizardRoomNo] = useState('Room A-1');
  const [wizardConflict, setWizardConflict] = useState<string | null>(null);

  // --- Exam States ---
  const [newExamGrade, setNewExamGrade] = useState(GRADES[0]);
  const [newExamSubject, setNewExamSubject] = useState(SUBJECTS[0]);
  const [newExamDate, setNewExamDate] = useState('');
  const [newExamTime, setNewExamTime] = useState('09:00 AM - 12:00 PM');
  const [newExamRoom, setNewExamRoom] = useState('Main Hall');
  const [newExamTeacherId, setNewExamTeacherId] = useState('');

  // --- Online Class States ---
  const [newOnlineGrade, setNewOnlineGrade] = useState(GRADES[0]);
  const [newOnlineSubject, setNewOnlineSubject] = useState(SUBJECTS[0]);
  const [newOnlineTeacherId, setNewOnlineTeacherId] = useState('');
  const [newOnlineDateTime, setNewOnlineDateTime] = useState('');
  const [newOnlineLink, setNewOnlineLink] = useState('https://meet.google.com/abc-defg-hij');

  // --- Load Initial Data ---
  useEffect(() => {
    // 1. Load Staff
    const loadedStaff = localStorage.getItem('staff');
    if (loadedStaff) {
      try {
        setStaff(JSON.parse(loadedStaff));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Fallbacks
      const defaultStaff = [
        { id: 'S-001', employeeId: 'S-001', name: 'Mr. Ahmed Khan', phone: '03001234567' },
        { id: 'S-002', employeeId: 'S-002', name: 'Mr. Bilal Hassan', phone: '03007654321' },
        { id: 'S-003', employeeId: 'S-003', name: 'Ms. Fatima Zahra', phone: '03009988776' },
        { id: 'S-004', employeeId: 'S-004', name: 'Mr. Imran Ali', phone: '03112233445' },
        { id: 'S-005', employeeId: 'S-005', name: 'Ms. Sana Malik', phone: '03225566778' }
      ];
      setStaff(defaultStaff);
      localStorage.setItem('staff', JSON.stringify(defaultStaff));
    }

    // 2. Load Attendance Logs
    const loadedAttendance = localStorage.getItem('staff_attendance');
    if (loadedAttendance) {
      try {
        setAttendanceLogs(JSON.parse(loadedAttendance));
      } catch (e) {
        console.error(e);
      }
    } else {
      const defaultAttendance: AttendanceRecord[] = [
        {
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
          records: {
            'S-001': 'present',
            'S-002': 'late',
            'S-003': 'present',
            'S-004': 'absent',
            'S-005': 'leave'
          }
        }
      ];
      setAttendanceLogs(defaultAttendance);
      localStorage.setItem('staff_attendance', JSON.stringify(defaultAttendance));
    }

    // 3. Load Timetable
    const loadedTimetable = localStorage.getItem('teaching_timetable');
    if (loadedTimetable) {
      try {
        setTimetable(JSON.parse(loadedTimetable));
      } catch (e) {
        console.error(e);
      }
    } else {
      const defaultTimetable: TimetableSlot[] = [
        { id: 't1', day: 'Monday', period: 'Period 1 (08:00 AM)', grade: 'Grade 5', subject: 'Mathematics', teacherId: 'S-001', teacherName: 'Mr. Ahmed Khan', roomNo: 'Room B-2' },
        { id: 't2', day: 'Monday', period: 'Period 2 (09:00 AM)', grade: 'Grade 6', subject: 'English', teacherId: 'S-003', teacherName: 'Ms. Fatima Zahra', roomNo: 'Room C-3' },
        { id: 't3', day: 'Tuesday', period: 'Period 1 (08:00 AM)', grade: 'Grade 5', subject: 'Science', teacherId: 'S-004', teacherName: 'Mr. Imran Ali', roomNo: 'Lab 1' },
        { id: 't4', day: 'Wednesday', period: 'Period 3 (10:00 AM)', grade: 'Grade 8', subject: 'Arabic', teacherId: 'S-002', teacherName: 'Mr. Bilal Hassan', roomNo: 'Room A-1' }
      ];
      setTimetable(defaultTimetable);
      localStorage.setItem('teaching_timetable', JSON.stringify(defaultTimetable));
    }

    // 4. Load Exams
    const loadedExams = localStorage.getItem('teaching_exams');
    if (loadedExams) {
      try {
        setExams(JSON.parse(loadedExams));
      } catch (e) {
        console.error(e);
      }
    } else {
      const defaultExams: ExamDuty[] = [
        { id: 'e1', grade: 'Grade 10', subject: 'Mathematics', date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], time: '09:00 AM - 12:00 PM', roomNo: 'Main Exam Hall', invigilatorId: 'S-001', invigilatorName: 'Mr. Ahmed Khan' },
        { id: 'e2', grade: 'Grade 9', subject: 'English', date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0], time: '09:00 AM - 12:00 PM', roomNo: 'Auditorium', invigilatorId: 'S-002', invigilatorName: 'Mr. Bilal Hassan' }
      ];
      setExams(defaultExams);
      localStorage.setItem('teaching_exams', JSON.stringify(defaultExams));
    }

    // 5. Load Online Classes
    const loadedOnline = localStorage.getItem('teaching_online_classes');
    if (loadedOnline) {
      try {
        setOnlineClasses(JSON.parse(loadedOnline));
      } catch (e) {
        console.error(e);
      }
    } else {
      const defaultOnline: OnlineClass[] = [
        { id: 'o1', grade: 'Grade 8', subject: 'Science', teacherId: 'S-004', teacherName: 'Mr. Imran Ali', dateTime: new Date(Date.now() + 3600000 * 2).toISOString().slice(0, 16), meetingLink: 'https://meet.google.com/abc-defg-hij' }
      ];
      setOnlineClasses(defaultOnline);
      localStorage.setItem('teaching_online_classes', JSON.stringify(defaultOnline));
    }
  }, []);

  // --- Initialize Attendance state for selected Date ---
  useEffect(() => {
    const recordForDate = attendanceLogs.find(log => log.date === attendanceDate);
    const initialRecord: { [staffId: string]: 'present' | 'absent' | 'leave' | 'late' } = {};
    
    staff.forEach(member => {
      initialRecord[member.id] = recordForDate?.records[member.id] || 'present';
    });
    setCurrentAttendance(initialRecord);
  }, [attendanceDate, attendanceLogs, staff]);

  // Set default Wizard Teacher once staff is loaded
  useEffect(() => {
    if (staff.length > 0 && !wizardTeacherId) {
      setWizardTeacherId(staff[0].id);
    }
    if (staff.length > 0 && !newExamTeacherId) {
      setNewExamTeacherId(staff[0].id);
    }
    if (staff.length > 0 && !newOnlineTeacherId) {
      setNewOnlineTeacherId(staff[0].id);
    }
  }, [staff]);

  // --- SAVE ATTENDANCE ---
  const saveAttendance = async () => {
    const updatedLogs = [...attendanceLogs];
    const existingIndex = updatedLogs.findIndex(log => log.date === attendanceDate);
    
    if (existingIndex !== -1) {
      updatedLogs[existingIndex] = { date: attendanceDate, records: currentAttendance };
    } else {
      updatedLogs.push({ date: attendanceDate, records: currentAttendance });
    }

    setAttendanceLogs(updatedLogs);
    localStorage.setItem('staff_attendance', JSON.stringify(updatedLogs));
    await updateCentralKey('staff_attendance', updatedLogs);

    setSaveStatus('🎉 Attendance records saved and synced successfully!');
    setTimeout(() => setSaveStatus(null), 4000);
  };

  // --- CONFLICT CHECKER FOR TIMETABLE ---
  const checkTimetableConflict = () => {
    setWizardConflict(null);
    const teacherName = staff.find(s => s.id === wizardTeacherId)?.name || 'Unknown';

    // 1. Teacher busy check
    const teacherConflict = timetable.find(slot => 
      slot.day === wizardDay && 
      slot.period === wizardPeriod && 
      slot.teacherId === wizardTeacherId
    );

    if (teacherConflict) {
      setWizardConflict(`⚠️ Teacher Conflict: ${teacherName} is already assigned to ${teacherConflict.grade} (${teacherConflict.subject}) in ${teacherConflict.roomNo} during ${wizardPeriod} on ${wizardDay}.`);
      return true;
    }

    // 2. Class double-booking check
    const classConflict = timetable.find(slot => 
      slot.day === wizardDay && 
      slot.period === wizardPeriod && 
      slot.grade === wizardGrade
    );

    if (classConflict) {
      setWizardConflict(`⚠️ Class Conflict: ${wizardGrade} already has a lesson of ${classConflict.subject} scheduled with ${classConflict.teacherName} during ${wizardPeriod} on ${wizardDay}.`);
      return true;
    }

    // 3. Room conflict check
    const roomConflict = timetable.find(slot => 
      slot.day === wizardDay && 
      slot.period === wizardPeriod && 
      slot.roomNo === wizardRoomNo
    );

    if (roomConflict) {
      setWizardConflict(`⚠️ Room Conflict: ${wizardRoomNo} is already occupied by ${roomConflict.grade} (${roomConflict.subject} taught by ${roomConflict.teacherName}) during ${wizardPeriod} on ${wizardDay}.`);
      return true;
    }

    return false;
  };

  const handleAddDraftSlot = async () => {
    if (checkTimetableConflict()) return;

    const teacherObj = staff.find(s => s.id === wizardTeacherId);
    const newSlot: TimetableSlot = {
      id: `slot-${Date.now()}`,
      day: wizardDay,
      period: wizardPeriod,
      grade: wizardGrade,
      subject: wizardSubject,
      teacherId: wizardTeacherId,
      teacherName: teacherObj ? teacherObj.name : 'Unknown',
      roomNo: wizardRoomNo,
      isDraft: true
    };

    const updated = [...timetable, newSlot];
    setTimetable(updated);
    localStorage.setItem('teaching_timetable', JSON.stringify(updated));
    await updateCentralKey('teaching_timetable', updated);

    setSaveStatus('✨ Added slot to timetable as Draft! Verify in Draft Preview.');
    setTimeout(() => setSaveStatus(null), 4000);
  };

  const handleDeleteSlot = async (id: string) => {
    const updated = timetable.filter(t => t.id !== id);
    setTimetable(updated);
    localStorage.setItem('teaching_timetable', JSON.stringify(updated));
    await updateCentralKey('teaching_timetable', updated);
  };

  // --- DRAFT ACTIONS ---
  const handlePublishDrafts = async () => {
    const published = timetable.map(slot => ({ ...slot, isDraft: false }));
    setTimetable(published);
    localStorage.setItem('teaching_timetable', JSON.stringify(published));
    await updateCentralKey('teaching_timetable', published);
    
    setSaveStatus('🚀 Successfully published all draft entries to Live Timetable!');
    setTimeout(() => setSaveStatus(null), 4000);
  };

  const handleResetDrafts = async () => {
    // Keep only non-draft slots
    const original = timetable.filter(slot => !slot.isDraft);
    setTimetable(original);
    localStorage.setItem('teaching_timetable', JSON.stringify(original));
    await updateCentralKey('teaching_timetable', original);

    setSaveStatus('🧹 Reset all draft schedules.');
    setTimeout(() => setSaveStatus(null), 4000);
  };

  // --- EXAM DUTY ACTIONS ---
  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamDate) {
      alert('Please select an Exam Date');
      return;
    }

    const teacherObj = staff.find(s => s.id === newExamTeacherId);
    
    // Check invigilator conflict (double duty on same date/time)
    const conflict = exams.find(ex => 
      ex.date === newExamDate && 
      ex.time === newExamTime && 
      ex.invigilatorId === newExamTeacherId
    );

    if (conflict) {
      alert(`⚠️ Invigilator Conflict: ${teacherObj?.name} is already scheduled for ${conflict.grade} exam duty on ${newExamDate} during ${newExamTime}.`);
      return;
    }

    const newDuty: ExamDuty = {
      id: `exam-${Date.now()}`,
      grade: newExamGrade,
      subject: newExamSubject,
      date: newExamDate,
      time: newExamTime,
      roomNo: newExamRoom,
      invigilatorId: newExamTeacherId,
      invigilatorName: teacherObj ? teacherObj.name : 'Unknown'
    };

    const updated = [...exams, newDuty];
    setExams(updated);
    localStorage.setItem('teaching_exams', JSON.stringify(updated));
    await updateCentralKey('teaching_exams', updated);

    // Reset inputs
    setNewExamDate('');
    setSaveStatus('📅 Scheduled new exam and invigilator duty successfully!');
    setTimeout(() => setSaveStatus(null), 4000);
  };

  const handleDeleteExam = async (id: string) => {
    const updated = exams.filter(ex => ex.id !== id);
    setExams(updated);
    localStorage.setItem('teaching_exams', JSON.stringify(updated));
    await updateCentralKey('teaching_exams', updated);
  };

  // --- ONLINE CLASS ACTIONS ---
  const handleScheduleOnline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOnlineDateTime) {
      alert('Please select class date and time');
      return;
    }

    const teacherObj = staff.find(s => s.id === newOnlineTeacherId);
    const newClass: OnlineClass = {
      id: `online-${Date.now()}`,
      grade: newOnlineGrade,
      subject: newOnlineSubject,
      teacherId: newOnlineTeacherId,
      teacherName: teacherObj ? teacherObj.name : 'Unknown',
      dateTime: newOnlineDateTime,
      meetingLink: newOnlineLink
    };

    const updated = [...onlineClasses, newClass];
    setOnlineClasses(updated);
    localStorage.setItem('teaching_online_classes', JSON.stringify(updated));
    await updateCentralKey('teaching_online_classes', updated);

    // Reset inputs
    setNewOnlineDateTime('');
    setSaveStatus('💻 Virtual online class scheduled successfully!');
    setTimeout(() => setSaveStatus(null), 4000);
  };

  const handleDeleteOnline = async (id: string) => {
    const updated = onlineClasses.filter(o => o.id !== id);
    setOnlineClasses(updated);
    localStorage.setItem('teaching_online_classes', JSON.stringify(updated));
    await updateCentralKey('teaching_online_classes', updated);
  };

  // --- STATS CALCULATORS FOR SUMMARY ---
  const getOverallAttendanceRate = () => {
    let totalMarks = 0;
    let presentMarks = 0;

    attendanceLogs.forEach(log => {
      Object.values(log.records).forEach(status => {
        totalMarks++;
        if (status === 'present' || status === 'late') {
          presentMarks++;
        }
      });
    });

    return totalMarks ? Math.round((presentMarks / totalMarks) * 100) : 100;
  };

  const getStaffSummaryStats = (staffId: string) => {
    let present = 0, absent = 0, leave = 0, late = 0;
    
    attendanceLogs.forEach(log => {
      const status = log.records[staffId];
      if (status === 'present') present++;
      else if (status === 'absent') absent++;
      else if (status === 'leave') leave++;
      else if (status === 'late') late++;
    });

    const total = present + absent + leave + late;
    const percentage = total ? Math.round(((present + late) / total) * 100) : 100;

    return { present, absent, leave, late, total, percentage };
  };

  // UI Setup matching the theme requested
  const subViewDetails = {
    'mark-attendance': {
      title: 'Staff Mark Attendance',
      urdu: 'اسٹاف حاضری درج کریں',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: <CheckSquare className="w-5 h-5 text-emerald-600" />
    },
    'attendance-summary': {
      title: 'Teaching Attendance Summary',
      urdu: 'حاضری کا خلاصہ رپورٹ',
      color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      icon: <BarChart3 className="w-5 h-5 text-indigo-600" />
    },
    'timetable': {
      title: 'School Timetable Matrix',
      urdu: 'مدرسہ ٹائم ٹیبل اور اوقات کار',
      color: 'bg-sky-50 text-sky-800 border-sky-200',
      icon: <Calendar className="w-5 h-5 text-sky-600" />
    },
    'tt-wizard': {
      title: 'Timetable Wizard Creator',
      urdu: 'ٹائم ٹیبل مینیجر وزرڈ',
      color: 'bg-violet-50 text-violet-800 border-violet-200',
      icon: <Wand2 className="w-5 h-5 text-violet-600" />
    },
    'draft-preview': {
      title: 'Timetable Draft Preview',
      urdu: 'ڈرافٹ ٹائم ٹیبل کا جائزہ',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: <Eye className="w-5 h-5 text-amber-600" />
    },
    'examinations': {
      title: 'Examination Schedules',
      urdu: 'امتحانات اور ڈیوٹی لسٹ',
      color: 'bg-pink-50 text-pink-800 border-pink-200',
      icon: <GraduationCap className="w-5 h-5 text-pink-600" />
    },
    'online-classes': {
      title: 'Online Classes & Live Rooms',
      urdu: 'آن لائن تدریس اور ورچوئل کمرے',
      color: 'bg-blue-50 text-blue-800 border-blue-200',
      icon: <Video className="w-5 h-5 text-blue-600" />
    }
  };

  const viewInfo = subViewDetails[subView] || subViewDetails['mark-attendance'];

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-800 flex flex-col font-sans pb-16">
      {/* Top Elegant Minimal Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition-all cursor-pointer text-slate-600 border border-slate-200 flex items-center justify-center"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs ${viewInfo.color}`}>
              {viewInfo.icon}
            </div>
            <div>
              <h1 className="text-md font-extrabold text-slate-900 leading-snug">
                {viewInfo.title}
              </h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide">
                {viewInfo.urdu}
              </p>
            </div>
          </div>
        </div>
        
        {/* Sync Status Label */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span>Cloud Sync Active</span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto w-full px-6 pt-6 flex-1 space-y-6">
        
        {/* Saved Toast Alerts */}
        {saveStatus && (
          <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-top duration-300">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <p>{saveStatus}</p>
          </div>
        )}

        {/* ==================== 1. MARK ATTENDANCE ==================== */}
        {subView === 'mark-attendance' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">DAILY TEACHER ATTENDANCE</h3>
                <p className="text-xs text-slate-500">Select date and mark standard daily attendance parameters.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Date:</span>
                <input 
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 bg-slate-50 text-slate-800 text-xs font-bold rounded-lg outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-left">
                    <th className="py-3 px-4">Staff ID</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4 text-center">Status Control</th>
                    <th className="py-3 px-4 text-right">Quick Indicator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                  {staff.map((member) => {
                    const status = currentAttendance[member.id] || 'present';
                    return (
                      <tr key={member.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4 font-mono text-slate-400">{member.employeeId}</td>
                        <td className="py-3.5 px-4 text-slate-800">{member.name}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {[
                              { label: 'Present', val: 'present', color: 'bg-emerald-50 border-emerald-200 text-emerald-800 active:bg-emerald-100' },
                              { label: 'Absent', val: 'absent', color: 'bg-rose-50 border-rose-200 text-rose-800 active:bg-rose-100' },
                              { label: 'Leave', val: 'leave', color: 'bg-amber-50 border-amber-200 text-amber-800 active:bg-amber-100' },
                              { label: 'Late', val: 'late', color: 'bg-blue-50 border-blue-200 text-blue-800 active:bg-blue-100' }
                            ].map((btn) => {
                              const isSelected = status === btn.val;
                              return (
                                <button
                                  key={btn.val}
                                  onClick={() => {
                                    setCurrentAttendance(prev => ({ ...prev, [member.id]: btn.val as any }));
                                  }}
                                  className={`px-3 py-1 border text-[10px] font-bold rounded-md transition cursor-pointer ${
                                    isSelected 
                                      ? 'bg-slate-900 border-slate-950 text-white shadow-xs scale-105' 
                                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                  }`}
                                >
                                  {btn.label}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className={`inline-block px-2.5 py-0.5 text-[9px] font-black uppercase rounded-full border ${
                            status === 'present' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            status === 'absent' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            status === 'leave' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={saveAttendance}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-lg shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Save Attendance Sheet</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================== 2. ATTENDANCE SUMMARY ==================== */}
        {subView === 'attendance-summary' && (
          <div className="space-y-6">
            {/* Summary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
                <div>
                  <span className="text-[9px] font-black tracking-wider uppercase text-slate-400">AVERAGE RATE</span>
                  <h3 className="text-2xl font-black text-slate-800 mt-1">{getOverallAttendanceRate()}%</h3>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">Overall teacher attendance score</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
                <div>
                  <span className="text-[9px] font-black tracking-wider uppercase text-slate-400">TOTAL LOGGED DAYS</span>
                  <h3 className="text-2xl font-black text-indigo-600 mt-1">{attendanceLogs.length} Days</h3>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">Academic attendance archives count</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
                <div>
                  <span className="text-[9px] font-black tracking-wider uppercase text-slate-400">TOTAL REGISTERED STAFF</span>
                  <h3 className="text-2xl font-black text-slate-800 mt-1">{staff.length}</h3>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">Active employees eligible for duty</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-xs bg-emerald-50/10 border-emerald-100">
                <div>
                  <span className="text-[9px] font-black tracking-wider uppercase text-emerald-800">SYSTEM HEALTH</span>
                  <h3 className="text-2xl font-black text-emerald-600 mt-1">Excellent</h3>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">Data syncing perfectly on database</p>
              </div>
            </div>

            {/* Attendance Logs Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">STAFF ATTENDANCE MATRIX SUMMARY</h3>
                <p className="text-xs text-slate-500">Historical performance aggregated per teaching staff member.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-left">
                      <th className="py-3 px-4">Staff Member</th>
                      <th className="py-3 px-4 text-center">Present</th>
                      <th className="py-3 px-4 text-center">Late</th>
                      <th className="py-3 px-4 text-center">On Leave</th>
                      <th className="py-3 px-4 text-center">Absent</th>
                      <th className="py-3 px-4 text-right">Duty Rate (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                    {staff.map((member) => {
                      const stats = getStaffSummaryStats(member.id);
                      return (
                        <tr key={member.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3.5 px-4">
                            <div>
                              <span className="text-slate-800 block font-black">{member.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono font-normal">ID: {member.employeeId}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center text-emerald-600 font-mono font-extrabold">{stats.present}</td>
                          <td className="py-3.5 px-4 text-center text-blue-600 font-mono font-extrabold">{stats.late}</td>
                          <td className="py-3.5 px-4 text-center text-amber-600 font-mono font-extrabold">{stats.leave}</td>
                          <td className="py-3.5 px-4 text-center text-rose-600 font-mono font-extrabold">{stats.absent}</td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex flex-col items-end gap-1">
                              <span className="font-mono font-black">{stats.percentage}%</span>
                              <div className="w-16 bg-slate-100 rounded-full h-1 overflow-hidden border border-slate-200/50">
                                <div className="bg-slate-900 h-full" style={{ width: `${stats.percentage}%` }}></div>
                              </div>
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

        {/* ==================== 3. TIMETABLE ==================== */}
        {subView === 'timetable' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">ACADEMIC PERIODS MATRIX</h3>
                <p className="text-xs text-slate-500">Live school timetable slots spanning all weekly teaching shifts.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold">Currently viewing:</span>
                <span className="px-2.5 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-md text-[10px] font-bold">Live Version</span>
              </div>
            </div>

            {/* Elegant Weekly Timetable Grid */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                    <th className="py-3 px-4 border border-slate-700 text-left w-36">Time / Period</th>
                    {DAYS_OF_WEEK.map(day => (
                      <th key={day} className="py-3 px-4 border border-slate-700 text-center">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-xs text-slate-700">
                  {PERIODS.map(period => (
                    <tr key={period} className="border-b border-slate-200 hover:bg-slate-50/40">
                      <td className="py-4 px-4 bg-slate-50 border-r border-slate-200 font-bold text-slate-600 align-middle">
                        <div className="flex items-center gap-1.5 font-sans">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{period.split(' ')[0]}</span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-normal block">{period.substring(period.indexOf('('))}</span>
                      </td>

                      {DAYS_OF_WEEK.map(day => {
                        // Find slots for this specific day and period
                        const slots = timetable.filter(slot => slot.day === day && slot.period === period);
                        return (
                          <td key={day} className="border border-slate-200 p-2.5 align-top min-w-44 text-left">
                            <div className="space-y-2">
                              {slots.map(slot => (
                                <div 
                                  key={slot.id} 
                                  className={`p-2 rounded-lg border flex flex-col justify-between relative group ${
                                    slot.isDraft 
                                      ? 'bg-amber-50/75 border-amber-200 text-amber-900' 
                                      : 'bg-slate-50 border-slate-200 text-slate-800'
                                  }`}
                                >
                                  {/* Delete Slot Icon inside cell */}
                                  <button
                                    onClick={() => handleDeleteSlot(slot.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded absolute right-1 top-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                    title="Delete Slot"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>

                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-1 justify-between">
                                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{slot.grade}</span>
                                      {slot.isDraft && (
                                        <span className="px-1 py-0.2 bg-amber-100 text-amber-800 border border-amber-200 rounded text-[8px] font-bold uppercase">Draft</span>
                                      )}
                                    </div>
                                    <span className="text-[11px] font-extrabold text-slate-800 block truncate">{slot.subject}</span>
                                    <span className="text-[9px] text-slate-500 flex items-center gap-1 block truncate">
                                      <User className="w-2.5 h-2.5 text-slate-400" />
                                      {slot.teacherName}
                                    </span>
                                  </div>
                                  <div className="text-[8px] font-mono font-bold text-slate-400 mt-1 uppercase tracking-wider">{slot.roomNo}</div>
                                </div>
                              ))}
                              {slots.length === 0 && (
                                <span className="text-[9px] text-slate-300 italic block text-center py-4">Unscheduled</span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== 4. TT WIZARD ==================== */}
        {subView === 'tt-wizard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Scheduler Wizard Tool (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">SCHEDULE NEW LESSON SLOT</h3>
                <p className="text-xs text-slate-500">Conflict-free algorithm runs instantly to safeguard against overlaps.</p>
              </div>

              {wizardConflict && (
                <div className="p-3.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs font-bold leading-relaxed animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <p>{wizardConflict}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">WEEK DAY</label>
                  <select
                    value={wizardDay}
                    onChange={(e) => setWizardDay(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold text-slate-700 focus:bg-white"
                  >
                    {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">TIME PERIOD</label>
                  <select
                    value={wizardPeriod}
                    onChange={(e) => setWizardPeriod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold text-slate-700 focus:bg-white"
                  >
                    {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">GRADE / CLASS</label>
                  <select
                    value={wizardGrade}
                    onChange={(e) => setWizardGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold text-slate-700 focus:bg-white"
                  >
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">SUBJECT</label>
                  <select
                    value={wizardSubject}
                    onChange={(e) => setWizardSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold text-slate-700 focus:bg-white"
                  >
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">ASSIGN TEACHER</label>
                  <select
                    value={wizardTeacherId}
                    onChange={(e) => setWizardTeacherId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold text-slate-700 focus:bg-white"
                  >
                    {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.employeeId})</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">ROOM / HALL NUMBER</label>
                  <input
                    type="text"
                    value={wizardRoomNo}
                    onChange={(e) => setWizardRoomNo(e.target.value)}
                    placeholder="e.g. Room B-3"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold text-slate-700 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={checkTimetableConflict}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Run Pre-Check Conflict Validation</span>
                </button>

                <button
                  onClick={handleAddDraftSlot}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-lg shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add as Draft Slot</span>
                </button>
              </div>
            </div>

            {/* Quick Helper Box (5 Cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <ClipboardList className="w-5 h-5 text-indigo-500" />
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase">Interactive Scheduling Rules</h4>
                    <span className="text-[9px] text-slate-400">فوری رہنمائی اور قوانین</span>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs text-slate-600 font-medium">
                  <div className="flex gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-800 shrink-0">1</div>
                    <p>Teachers cannot be scheduled into two different classrooms during the same day and period.</p>
                  </div>
                  <div className="flex gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-800 shrink-0">2</div>
                    <p>Classes (Grades) cannot have double bookings of subjects or teachers in the same block.</p>
                  </div>
                  <div className="flex gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-800 shrink-0">3</div>
                    <p>Rooms cannot be double-booked; our check blocks overlapping usage automatically.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                EduCore AI Planners
              </div>
            </div>

          </div>
        )}

        {/* ==================== 5. DRAFT PREVIEW ==================== */}
        {subView === 'draft-preview' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">PENDING DRAFT CHANCES</h3>
                <p className="text-xs text-slate-500">Compare, verify conflicts, and lock draft timetables into active rosters.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetDrafts}
                  className="px-3.5 py-2 bg-rose-50 text-rose-800 border border-rose-100 hover:bg-rose-100 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset All Drafts</span>
                </button>
                <button
                  onClick={handlePublishDrafts}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Publish Drafts Live</span>
                </button>
              </div>
            </div>

            {/* List of current drafts */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">DRAFT LISTING</span>
              
              {timetable.filter(slot => slot.isDraft).length === 0 ? (
                <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <Info className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-500">No pending draft changes. Schedule new slots using the Timetable Wizard.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {timetable.filter(slot => slot.isDraft).map(slot => (
                    <div key={slot.id} className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 flex flex-col justify-between space-y-3 relative">
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded absolute right-2 top-2 cursor-pointer"
                        title="Remove Draft"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="space-y-1 text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-[9px] font-extrabold uppercase">DRAFT</span>
                          <span className="text-[10px] font-mono font-bold text-amber-700">{slot.day} • {slot.period.split(' ')[0]}</span>
                        </div>
                        <h4 className="text-xs font-black text-slate-900">{slot.grade} — {slot.subject}</h4>
                        <p className="text-[10px] text-slate-500 font-bold">Assigned: {slot.teacherName}</p>
                      </div>

                      <div className="text-[9px] font-black font-mono text-slate-400 uppercase tracking-wider">{slot.roomNo}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== 6. EXAMINATIONS ==================== */}
        {subView === 'examinations' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Exam Duties List (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">SCHEDULED EXAMS & INVIGILATORS</h3>
                <p className="text-xs text-slate-500">Overview of upcoming exams alongside assigned monitoring invigilators.</p>
              </div>

              {exams.length === 0 ? (
                <div className="text-center p-12 bg-slate-50/40 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400">No exams scheduled currently.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-left">
                        <th className="py-2.5 px-3">Grade & Subject</th>
                        <th className="py-2.5 px-3">Date / Room</th>
                        <th className="py-2.5 px-3">Invigilator</th>
                        <th className="py-2.5 px-3 text-right">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                      {exams.map((exam) => (
                        <tr key={exam.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3 px-3">
                            <span className="text-slate-800 block font-black">{exam.grade}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{exam.subject}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-slate-700 block text-[11px]">{exam.date}</span>
                            <span className="text-[9px] text-indigo-600 block font-bold">{exam.roomNo}</span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1 text-slate-600">
                              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-36">{exam.invigilatorName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleDeleteExam(exam.id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-md transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Form to Schedule Exam (5 Cols) */}
            <form onSubmit={handleAddExam} className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 text-left">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">SCHEDULE NEW EXAM BLOCK</h3>
                <p className="text-xs text-slate-500">Input exam parameters and allocate supervisor duties.</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">CLASS / GRADE</label>
                  <select
                    value={newExamGrade}
                    onChange={(e) => setNewExamGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold text-slate-700"
                  >
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">SUBJECT</label>
                  <select
                    value={newExamSubject}
                    onChange={(e) => setNewExamSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold text-slate-700"
                  >
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">EXAM DATE</label>
                    <input
                      type="date"
                      value={newExamDate}
                      onChange={(e) => setNewExamDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold text-slate-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">EXAM HALL</label>
                    <input
                      type="text"
                      value={newExamRoom}
                      onChange={(e) => setNewExamRoom(e.target.value)}
                      placeholder="e.g. Main Hall"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">SUPERVISOR INVIGILATOR</label>
                  <select
                    value={newExamTeacherId}
                    onChange={(e) => setNewExamTeacherId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold text-slate-700"
                  >
                    {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.employeeId})</option>)}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-pink-400" />
                <span>Save Exam Schedule</span>
              </button>
            </form>

          </div>
        )}

        {/* ==================== 7. ONLINE CLASSES ==================== */}
        {subView === 'online-classes' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Scheduled Rooms (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">ACTIVE ONLINE LECTURE HALLS</h3>
                <p className="text-xs text-slate-500">Virtual classroom schedule logs with click-to-join endpoints.</p>
              </div>

              {onlineClasses.length === 0 ? (
                <div className="text-center p-12 bg-slate-50/40 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400">No active virtual classes scheduled.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {onlineClasses.map((cl) => (
                    <div key={cl.id} className="border border-slate-200 hover:border-slate-300 rounded-xl p-4 bg-white flex flex-col justify-between space-y-4 relative group">
                      <button
                        onClick={() => handleDeleteOnline(cl.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded absolute right-2 top-2 cursor-pointer"
                        title="Delete Lecture"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="space-y-1.5 text-left">
                        <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[9px] font-black uppercase">LIVE LECTURE</span>
                        <h4 className="text-xs font-extrabold text-slate-900">{cl.grade} • {cl.subject}</h4>
                        <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>Teacher: {cl.teacherName}</span>
                        </p>
                        <p className="text-[10px] text-indigo-600 font-mono font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-indigo-400" />
                          <span>{new Date(cl.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(cl.meetingLink);
                            alert('📋 Link copied to clipboard!');
                          }}
                          className="flex-1 py-1.5 border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg hover:bg-slate-50 transition cursor-pointer"
                        >
                          Copy Link
                        </button>
                        <a
                          href={cl.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>Start Class</span>
                          <ExternalLink className="w-3 h-3 text-blue-400" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Schedule Form (5 Cols) */}
            <form onSubmit={handleScheduleOnline} className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 text-left">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">SCHEDULE VIRTUAL CLASS</h3>
                <p className="text-xs text-slate-500">Initiate live room credentials and publish joining endpoints.</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">CLASS / GRADE</label>
                  <select
                    value={newOnlineGrade}
                    onChange={(e) => setNewOnlineGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold text-slate-700"
                  >
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">SUBJECT</label>
                  <select
                    value={newOnlineSubject}
                    onChange={(e) => setNewOnlineSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold text-slate-700"
                  >
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">LECTURER TEACHER</label>
                  <select
                    value={newOnlineTeacherId}
                    onChange={(e) => setNewOnlineTeacherId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold text-slate-700"
                  >
                    {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.employeeId})</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">DATE & TIME</label>
                  <input
                    type="datetime-local"
                    value={newOnlineDateTime}
                    onChange={(e) => setNewOnlineDateTime(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">MEETING / LECTURE URL</label>
                  <input
                    type="url"
                    value={newOnlineLink}
                    onChange={(e) => setNewOnlineLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold text-slate-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-blue-400" />
                <span>Publish Online Class</span>
              </button>
            </form>

          </div>
        )}

      </div>
    </div>
  );
}
