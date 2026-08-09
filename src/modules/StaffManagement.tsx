/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Users, GraduationCap, Mail, Phone, Briefcase, Plus, Search, Filter } from 'lucide-react';
import { motion } from 'motion/react';

const mockStaff = [
  { id: '1', name: 'Dr. Sarah Wilson', role: 'Principal', dept: 'Administration', email: 'sarah.w@educore.edu', phone: '+91 99999 11111', status: 'Active' },
  { id: '2', name: 'Mr. Rajesh Kumar', role: 'Senior Teacher', dept: 'Mathematics', email: 'rajesh.k@educore.edu', phone: '+91 99999 22222', status: 'Active' },
  { id: '3', name: 'Ms. Priya Singh', role: 'Teacher', dept: 'English', email: 'priya.s@educore.edu', phone: '+91 99999 33333', status: 'Active' },
  { id: '4', name: 'Mr. David Miller', role: 'Coordinator', dept: 'Sports', email: 'david.m@educore.edu', phone: '+91 99999 44444', status: 'On Leave' },
  { id: '5', name: 'Ms. Anjali Sharma', role: 'Librarian', dept: 'Library', email: 'anjali.s@educore.edu', phone: '+91 99999 55555', status: 'Active' },
];

export default function StaffManagement() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Staff & HR Management</h1>
          <p className="text-slate-500 mt-1">Manage employee records, departments, and payroll profiles.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Plus size={18} />
          Add Staff Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Staff', value: '154', icon: Users, color: 'indigo' },
          { label: 'Departments', value: '12', icon: Briefcase, color: 'emerald' },
          { label: 'Teaching Staff', value: '108', icon: GraduationCap, color: 'amber' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 border border-slate-200 rounded-2xl flex items-center gap-6 group hover:shadow-lg transition-all">
            <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search staff by name..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none"
            />
          </div>
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
            <Filter size={16} />
            Filter Dept
          </button>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockStaff.map((person) => (
              <tr key={person.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                      {person.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{person.name}</p>
                      <p className="text-xs text-slate-400">ID: EMP-{person.id}00</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-slate-600">{person.dept}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-500">{person.role}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="p-1.5 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors">
                      <Mail size={14} />
                    </button>
                    <button className="p-1.5 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors">
                      <Phone size={14} />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    person.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {person.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-sm font-bold text-indigo-600 hover:underline">View Profile</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
