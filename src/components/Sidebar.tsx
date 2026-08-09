/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  LayoutDashboard, 
  Users, 
  ClipboardCheck, 
  Wallet, 
  FileText, 
  GraduationCap, 
  BookOpen, 
  Bus, 
  Library, 
  Settings,
  Bell,
  LogOut
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
  { id: 'fees', label: 'Fees Management', icon: Wallet },
  { id: 'papers', label: 'AI Paper Maker', icon: FileText },
  { id: 'exams', label: 'Examinations', icon: GraduationCap },
  { id: 'staff', label: 'Staff Management', icon: Users },
  { id: 'academics', label: 'Academics', icon: BookOpen },
  { id: 'transport', label: 'Transport', icon: Bus },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <div className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
            E
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">EduCore</span>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === item.id 
                ? 'bg-indigo-50 text-indigo-700 font-medium' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <item.icon size={20} className={activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'} />
            <span>{item.label}</span>
            {activeTab === item.id && (
              <motion.div 
                layoutId="active-indicator"
                className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full"
              />
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
