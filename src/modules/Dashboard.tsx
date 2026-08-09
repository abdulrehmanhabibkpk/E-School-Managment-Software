/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Users, GraduationCap, Calendar, Wallet, TrendingUp, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', fees: 4000, students: 2400 },
  { name: 'Tue', fees: 3000, students: 1398 },
  { name: 'Wed', fees: 2000, students: 9800 },
  { name: 'Thu', fees: 2780, students: 3908 },
  { name: 'Fri', fees: 1890, students: 4800 },
  { name: 'Sat', fees: 2390, students: 3800 },
  { name: 'Sun', fees: 3490, students: 4300 },
];

const stats = [
  { label: 'Total Students', value: '2,845', icon: Users, color: 'indigo' },
  { label: 'Teachers', value: '154', icon: GraduationCap, color: 'emerald' },
  { label: 'Daily Attendance', value: '94%', icon: Calendar, color: 'amber' },
  { label: 'Revenue (M)', value: '₹12.4', icon: Wallet, color: 'rose' },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-slate-500 mt-1">Welcome back, Principal. Here's what's happening today.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <TrendingUp size={18} />
          View Reports
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="p-6 bg-white border border-slate-200 rounded-2xl hover:shadow-lg hover:shadow-indigo-500/5 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                +12% <ArrowUpRight size={12} className="ml-0.5" />
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900">Fee Collection Trends</h3>
            <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorFees" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="fees" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorFees)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 border border-slate-200 rounded-2xl shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Upcoming Exams</h3>
          <div className="space-y-6">
            {[
              { subject: 'Mathematics', date: 'Tomorrow, 09:00 AM', type: 'Final' },
              { subject: 'Physics', date: 'Aug 12, 10:30 AM', type: 'Midterm' },
              { subject: 'English', date: 'Aug 14, 02:00 PM', type: 'Quiz' },
            ].map((exam) => (
              <div key={exam.subject} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                  {exam.subject[0]}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">{exam.subject}</h4>
                  <p className="text-sm text-slate-500 mt-0.5">{exam.date}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                    {exam.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-medium hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-600 transition-all">
            Schedule New Exam
          </button>
        </div>
      </div>
    </div>
  );
}
