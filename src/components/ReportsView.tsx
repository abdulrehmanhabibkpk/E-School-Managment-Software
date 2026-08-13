import React, { useState } from 'react';
import { 
  FileText, Printer, ClipboardList, ShieldCheck, 
  Trophy, CreditCard, Users, FileMinus, IdCard,
  ChevronLeft, LayoutDashboard
} from 'lucide-react';
import { motion } from 'motion/react';
import AdmissionFormBlank from './AdmissionFormBlank';
import IDCardMaker from './IDCardMaker';
import AttendanceSheetGenerator from './AttendanceSheetGenerator';
import ConsolidatedResult from './ConsolidatedResult';
import MarksheetGenerator from './MarksheetGenerator';

interface ReportCardProps {
  icon: any;
  title: string;
  color: string;
  onClick?: () => void;
  key?: React.Key;
}

function ReportCard({ icon: Icon, title, color, onClick }: ReportCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${color} p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center gap-4 text-white hover:brightness-110 transition-all aspect-square min-w-[140px]`}
    >
      <div className="bg-white/20 p-3 rounded-xl">
        <Icon className="w-8 h-8" />
      </div>
      <span className="font-sans font-bold text-sm leading-tight">{title}</span>
    </motion.button>
  );
}

interface ReportsViewProps {
  onBack: () => void;
}

export default function ReportsView({ onBack }: ReportsViewProps) {
  const [activeReport, setActiveReport] = useState<string | null>(null);

  const reports = [
    { id: 'marksheet', title: 'DMC / Marksheet Generator', icon: FileText, color: 'bg-sky-500' },
    { id: 'result', title: 'Consolidated Result', icon: Printer, color: 'bg-blue-500' },
    { id: 'student_att', title: 'Student Attendance', icon: ClipboardList, color: 'bg-indigo-500' },
    { id: 'staff_att', title: 'Staff Attendance', icon: ShieldCheck, color: 'bg-slate-700' },
    { id: 'positions', title: 'Position Holders', icon: Trophy, color: 'bg-orange-500' },
    { id: 'fee_card', title: 'Fee Card', icon: CreditCard, color: 'bg-teal-500' },
    { id: 'student_list', title: 'Student List', icon: Users, color: 'bg-blue-600' },
    { id: 'daily_attendance_sheet', title: 'Attendance Sheet', icon: FileText, color: 'bg-emerald-600' },
    { id: 'blank_admission', title: 'Blank Admission Form', icon: FileMinus, color: 'bg-green-600' },
    { id: 'id_card', title: 'ID Card Generator', icon: IdCard, color: 'bg-purple-600' },
  ];

  if (activeReport === 'blank_admission') {
    return <AdmissionFormBlank onBack={() => setActiveReport(null)} />;
  }

  if (activeReport === 'id_card') {
    return <IDCardMaker onBack={() => setActiveReport(null)} />;
  }

  if (activeReport === 'daily_attendance_sheet') {
    return <AttendanceSheetGenerator onBack={() => setActiveReport(null)} />;
  }

  if (activeReport === 'result') {
    return <ConsolidatedResult onBack={() => setActiveReport(null)} />;
  }

  if (activeReport === 'marksheet') {
    return <MarksheetGenerator onBack={() => setActiveReport(null)} />;
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden font-sans" dir="ltr">
      {/* Header */}
      <header className="h-20 bg-white flex items-center justify-between px-8 border-b border-slate-200 shadow-sm z-10">
        <div className="flex items-center gap-3 text-slate-800 text-xl font-bold">
          <div className="p-2 bg-blue-600 rounded-lg text-white shadow-md shadow-blue-500/20">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <div>Reports Center</div>
            <p className="text-slate-500 text-[10px] font-normal">All institute reports and records are available here</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="bg-white border border-slate-200 text-slate-600 px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 hover:text-slate-800 transition-all shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </header>

      {/* Grid Content */}
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {reports.map((report) => (
              <ReportCard 
                key={report.id}
                icon={report.icon}
                title={report.title}
                color={report.color}
                onClick={() => setActiveReport(report.id)}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-16 border-t border-slate-200 px-8 flex items-center justify-between text-[10px] text-slate-600">
        <div className="flex flex-col items-start font-sans">
          <span>All rights reserved. System Management</span>
        </div>
        <div className="text-right uppercase tracking-widest">
          Report Management System v2.0
        </div>
      </footer>
    </div>
  );
}
