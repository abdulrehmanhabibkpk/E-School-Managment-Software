import React, { useState, useEffect } from 'react';
import { 
  User, Calendar, CreditCard, FileText, Bell, 
  MessageCircle, Settings, ChevronRight, LogOut,
  TrendingUp, CheckCircle2, Clock, AlertCircle,
  BookOpen, Star, Award
} from 'lucide-react';
import { motion } from 'motion/react';

interface StudentData {
  id: string;
  name: string;
  regNo: string;
  grade: string;
  attendance: {
    totalDays: number;
    present: number;
    absent: number;
    late: number;
  };
  fees: {
    total: number;
    paid: number;
    pending: number;
    lastPaymentDate?: string;
  };
  results: {
    examName: string;
    gpa: number;
    grade: string;
    rank: string;
  }[];
}

export default function ParentPortal({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'fees' | 'results' | 'messages'>('overview');
  const [student, setStudent] = useState<StudentData | null>(null);

  useEffect(() => {
    // Mocking data for now
    setStudent({
      id: 'S001',
      name: 'Muhammad Ahmed',
      regNo: '2024-001',
      grade: 'Class 5-A',
      attendance: {
        totalDays: 22,
        present: 20,
        absent: 1,
        late: 1
      },
      fees: {
        total: 50000,
        paid: 35000,
        pending: 15000,
        lastPaymentDate: '2024-05-10'
      },
      results: [
        { examName: 'Mid Term 2024', gpa: 3.8, grade: 'A', rank: '5th' },
        { examName: 'Monthly Test Apr', gpa: 3.9, grade: 'A+', rank: '2nd' }
      ]
    });
  }, []);

  if (!student) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* Mini Sidebar */}
      <div className="w-20 lg:w-64 bg-slate-900 h-full flex flex-col p-4 transition-all duration-300">
        <div className="mb-10 px-2 lg:px-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl">P</div>
        </div>
        
        <nav className="flex-1 space-y-2">
          {[
            { id: 'overview', icon: TrendingUp, label: 'Overview' },
            { id: 'attendance', icon: Calendar, label: 'Attendance' },
            { id: 'fees', icon: CreditCard, label: 'Fee Portal' },
            { id: 'results', icon: FileText, label: 'Results' },
            { id: 'messages', icon: MessageCircle, label: 'Messages' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 p-3 lg:px-4 rounded-xl transition-all ${
                activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="hidden lg:block font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <button 
          onClick={onLogout}
          className="mt-auto flex items-center gap-3 p-3 lg:px-4 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="hidden lg:block font-bold text-sm">Sign Out</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800">{student.name}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student.grade} • {student.regNo}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'overview' && (
            <div className="space-y-8 max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 p-6 rounded-[32px] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-widest">MTD</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">{((student.attendance.present / student.attendance.totalDays) * 100).toFixed(0)}%</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Attendance Rate</div>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-[32px] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                      <Award className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Latest</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">{student.results[0].grade}</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Academic Performance</div>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-[32px] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-amber-600" />
                    </div>
                    <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Due</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">Rs. {student.fees.pending.toLocaleString()}</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Pending Fees</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Notifications */}
                <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Recent Activity</h3>
                    <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View All</button>
                  </div>
                  <div className="p-2">
                    {[
                      { icon: CheckCircle2, text: 'Fee payment Rs. 5,000 confirmed', time: '2 hours ago', color: 'text-emerald-500' },
                      { icon: FileText, text: 'Mid Term Results uploaded', time: 'Yesterday', color: 'text-blue-500' },
                      { icon: AlertCircle, text: 'Late arrival recorded (15 mins)', time: '3 days ago', color: 'text-amber-500' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors rounded-2xl">
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                        <div>
                          <div className="text-sm font-bold text-slate-700">{item.text}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">{item.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Events */}
                <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Upcoming Events</h3>
                    <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Calendar</button>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-2xl flex flex-col items-center justify-center text-white shrink-0 shadow-lg shadow-blue-600/20">
                        <span className="text-[10px] font-black uppercase">May</span>
                        <span className="text-lg font-black">25</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-black text-slate-800">Parent-Teacher Meeting</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" /> 09:00 AM - 12:00 PM
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-white shrink-0">
                        <span className="text-[10px] font-black uppercase">Jun</span>
                        <span className="text-lg font-black">01</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-black text-slate-800">Annual Sports Week</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mt-1">
                          <BookOpen className="w-3 h-3" /> Main Campus Ground
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="max-w-4xl mx-auto space-y-8">
              <h2 className="text-2xl font-black text-slate-800">Attendance History</h2>
              <div className="bg-white border border-slate-200 rounded-[32px] p-8">
                {/* Simplified Calendar or List */}
                <div className="grid grid-cols-7 gap-4 mb-8 text-center">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                    <div key={d} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</div>
                  ))}
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-12 flex items-center justify-center rounded-xl font-bold text-sm ${
                        i === 15 ? 'bg-rose-500 text-white' : 
                        i % 5 === 0 ? 'bg-emerald-500 text-white' : 
                        'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-xs font-bold text-slate-600">Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                    <span className="text-xs font-bold text-slate-600">Absent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-200 rounded-full"></div>
                    <span className="text-xs font-bold text-slate-600">Pending</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-800">Fee Statement</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20">
                  <CreditCard className="w-4 h-4" /> Pay Now
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { date: 'May 10, 2024', desc: 'Monthly Fee - May', amount: 'Rs. 5,000', status: 'Paid' },
                      { date: 'Apr 05, 2024', desc: 'Monthly Fee - Apr', amount: 'Rs. 5,000', status: 'Paid' },
                      { date: 'Mar 02, 2024', desc: 'Annual Book Fee', amount: 'Rs. 25,000', status: 'Paid' }
                    ].map((fee, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4 text-xs font-bold text-slate-700">{fee.date}</td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-600">{fee.desc}</td>
                        <td className="px-6 py-4 text-xs font-black text-slate-900">{fee.amount}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase">
                            {fee.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="max-w-4xl mx-auto space-y-8">
              <h2 className="text-2xl font-black text-slate-800">Academic Records</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {student.results.map((result, i) => (
                  <div key={i} className="bg-white border border-slate-200 p-6 rounded-[32px] shadow-sm group hover:border-blue-500 transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <span className="text-2xl font-black text-slate-900">{result.grade}</span>
                    </div>
                    <h4 className="font-black text-slate-800">{result.examName}</h4>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                        <Star className="w-3 h-3 text-amber-400" /> GPA: {result.gpa}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                        <TrendingUp className="w-3 h-3 text-emerald-500" /> Rank: {result.rank}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="max-w-2xl mx-auto space-y-8 h-full flex flex-col">
              <h2 className="text-2xl font-black text-slate-800">School Messages</h2>
              <div className="flex-1 bg-white border border-slate-200 rounded-[32px] p-6 space-y-6 overflow-y-auto">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none max-w-[80%]">
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">
                      Dear Parent, this is a reminder that the Annual Sports Week begins next Monday. Please ensure your child is in sports uniform.
                    </p>
                    <span className="text-[10px] font-bold text-slate-400 uppercase mt-2 block">Admin • 10:00 AM</span>
                  </div>
                </div>
                <div className="flex gap-4 flex-row-reverse">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-blue-600 p-4 rounded-2xl rounded-tr-none max-w-[80%]">
                    <p className="text-sm font-bold text-white leading-relaxed">
                      Thank you for the update. We have prepared the uniform.
                    </p>
                    <span className="text-[10px] font-bold text-blue-200 uppercase mt-2 block text-right">You • 10:30 AM</span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl flex gap-2">
                <input type="text" placeholder="Type your message..." className="flex-1 bg-transparent border-none outline-none font-bold text-sm" />
                <button className="p-2 bg-blue-600 text-white rounded-xl"><MessageCircle className="w-5 h-5" /></button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
