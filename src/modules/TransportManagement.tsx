/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Bus, MapPin, Navigation, Phone, Search, Plus, Clock } from 'lucide-react';
import { motion } from 'motion/react';

const mockRoutes = [
  { id: '1', routeName: 'Route Alpha', busNo: 'MH-12-AS-1234', driver: 'Suresh Patil', phone: '+91 99999 00001', stops: 12, students: 45, status: 'On Track' },
  { id: '2', routeName: 'Route Beta', busNo: 'MH-12-AS-5678', driver: 'Mahesh Khan', phone: '+91 99999 00002', stops: 8, students: 32, status: 'Delayed' },
  { id: '3', routeName: 'Route Gamma', busNo: 'MH-12-AS-9012', driver: 'Ramesh Singh', phone: '+91 99999 00003', stops: 15, students: 50, status: 'On Track' },
];

export default function TransportManagement() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Transport Management</h1>
          <p className="text-slate-500 mt-1">Monitor school bus routes, GPS tracking, and transport subscriptions.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Plus size={18} />
          Add New Route
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Active Bus Routes</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search routes..."
                  className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                />
              </div>
            </div>

            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Route Info</th>
                  <th className="px-6 py-4">Driver Details</th>
                  <th className="px-6 py-4 text-center">Stops/Students</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Live View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockRoutes.map((route) => (
                  <tr key={route.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{route.routeName}</p>
                        <p className="text-xs text-slate-400 font-mono">{route.busNo}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{route.driver}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Phone size={10} />
                          {route.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-bold text-slate-600">{route.stops}</span>
                      <span className="text-slate-300 mx-1">/</span>
                      <span className="text-sm font-bold text-indigo-600">{route.students}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        route.status === 'On Track' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {route.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all">
                        <Navigation size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Clock size={20} className="text-emerald-400" />
              Live Fleet Status
            </h3>
            <div className="space-y-6">
              {[
                { label: 'Buses Running', value: '18', total: '20', color: 'bg-emerald-500' },
                { label: 'Buses Delayed', value: '2', total: '20', color: 'bg-rose-500' },
                { label: 'Fuel Efficiency', value: '85%', total: '100%', color: 'bg-indigo-500' },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-400">{item.label}</span>
                    <span className="font-bold">{item.value}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color}`} 
                      style={{ width: item.label.includes('%') ? item.value : `${(parseInt(item.value)/parseInt(item.total))*100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 border border-white/20 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors">
              Dispatch Alerts
            </button>
          </div>

          <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Route Optimization AI</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Our AI engine is analyzing traffic patterns to suggest 3 new route optimizations that could save 15% fuel.
            </p>
            <button className="text-indigo-600 font-bold text-sm hover:underline">View Suggestions →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
