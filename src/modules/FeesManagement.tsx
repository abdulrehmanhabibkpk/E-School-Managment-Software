/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Wallet, Search, CreditCard, Banknote, Clock, ArrowUpRight, DollarSign, Receipt } from 'lucide-react';
import { motion } from 'motion/react';

const mockFees = [
  { id: '1', student: 'Aarav Sharma', class: '10th-A', total: 45000, paid: 35000, status: 'Partial', dueDate: 'Aug 15, 2024' },
  { id: '2', student: 'Ishani Patel', class: '10th-A', total: 45000, paid: 45000, status: 'Paid', dueDate: 'Aug 15, 2024' },
  { id: '3', student: 'Zoya Khan', class: '10th-B', total: 45000, paid: 15000, status: 'Partial', dueDate: 'Aug 15, 2024' },
  { id: '4', student: 'Kabir Verma', class: '10th-B', total: 45000, paid: 0, status: 'Pending', dueDate: 'Aug 15, 2024' },
  { id: '5', student: 'Ananya Rao', class: '10th-C', total: 45000, paid: 45000, status: 'Paid', dueDate: 'Aug 15, 2024' },
];

export default function FeesManagement() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Fees Management</h1>
          <p className="text-slate-500 mt-1">Track fee collections, pending dues, and generate digital receipts.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <DollarSign size={18} />
            Collection Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Expected', value: '₹4.2 Cr', icon: Wallet, color: 'indigo', trend: '+5%' },
          { label: 'Total Collected', value: '₹3.8 Cr', icon: CreditCard, color: 'emerald', trend: '+12%' },
          { label: 'Pending Dues', value: '₹40.5 L', icon: Clock, color: 'rose', trend: '-2%' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 border border-slate-200 rounded-2xl flex items-center gap-6 group hover:shadow-lg transition-all">
            <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <div className="flex items-center gap-3 mt-1">
                <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {stat.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by student name..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">Fee Structure</button>
            <div className="h-4 w-[1px] bg-slate-200 mx-2"></div>
            <button className="px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">Bulk Reminders</button>
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4">Student Name</th>
              <th className="px-6 py-4">Class</th>
              <th className="px-6 py-4">Total Fee</th>
              <th className="px-6 py-4">Paid</th>
              <th className="px-6 py-4">Balance</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockFees.map((fee) => (
              <tr key={fee.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-slate-800">{fee.student}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600">{fee.class}</span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-700">₹{fee.total.toLocaleString()}</td>
                <td className="px-6 py-4 text-emerald-600 font-semibold">₹{fee.paid.toLocaleString()}</td>
                <td className="px-6 py-4 text-rose-500 font-bold">₹{(fee.total - fee.paid).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    fee.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' :
                    fee.status === 'Partial' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {fee.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Collect Fee">
                    <Banknote size={20} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Print Receipt">
                    <Receipt size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
