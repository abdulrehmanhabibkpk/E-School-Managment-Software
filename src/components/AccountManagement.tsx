import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserCircle, Users, Check, Save, Trash2 } from 'lucide-react';
import { syncToServer, updateCentralKey } from '../syncService';
import VoiceInput from './VoiceInput';
import { generateNumericId } from '../lib/idUtils';
import { db, collection, addDoc, setDoc, doc } from '../firebase';

export default function AccountManagement() {
  const [activeTab, setActiveTab] = useState<'permissions' | 'maker'>('maker');
  const [roles] = useState(['Admin', 'Teacher', 'Staff', 'Parent']);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const showNotice = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const [users, setUsers] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('users');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Listen for storage updates (from sync)
  useEffect(() => {
    const fetchUsers = () => {
      try {
        const saved = localStorage.getItem('users');
        if (saved) {
          setUsers(JSON.parse(saved));
        }
      } catch (err) {
        console.error('Error fetching users from localStorage:', err);
      }
    };

    fetchUsers();
    window.addEventListener('storage_updated', fetchUsers);
    return () => window.removeEventListener('storage_updated', fetchUsers);
  }, []);

  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'Teacher', madrassaName: '', whatsapp: '' });
  
  const defaultPermissions = {
    'Admin': {
      dashboard: true, students: true, all_students: true, document_capture: true,
      attendance: true, lessons: true, manual: true, qr_manual_attendance: true, admin_panel: true,
      exam_attendance_sheet: true, academics: true, exams: true, paper_maker: true, paper_uploader: true,
      paper_checker: true, paper_reports: true, fees: true, staff: true,
      payroll: true, visitors: true, notifications: true, camera: true,
      settings: true, public_result: true, finance: true, library: true,
      fatwa: true, posts: true, reports: true, recycle_bin: true,
      admissions_view: true, super_admin_panel: true, voice_logs: true
    },
    'Teacher': {
      dashboard: true, students: true, all_students: true, document_capture: true,
      attendance: true, lessons: true, manual: true, qr_manual_attendance: true, admin_panel: false, exam_attendance_sheet: false,
      academics: false, exams: true, paper_maker: false, paper_uploader: true,
      paper_checker: true, paper_reports: true, fees: false, staff: false,
      payroll: false, visitors: false, notifications: true, camera: true,
      settings: false, public_result: false, finance: false, library: true,
      fatwa: false, posts: false, reports: false, recycle_bin: false,
      admissions_view: false, super_admin_panel: false, voice_logs: false
    },
    'Staff': {
      dashboard: true, students: true, all_students: true, document_capture: true,
      attendance: true, lessons: false, manual: true, exam_attendance_sheet: true,
      academics: false, exams: false, paper_maker: false, paper_uploader: false,
      paper_checker: false, paper_reports: false, fees: true, staff: false,
      payroll: false, visitors: true, notifications: false, camera: true,
      settings: false, finance: true, library: true,
      fatwa: false, posts: false, reports: false, recycle_bin: false,
      admissions_view: true, super_admin_panel: false, voice_logs: false
    },
    'Parent': {
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

  const [permissions, setPermissions] = useState<any>(() => {
    const saved = localStorage.getItem('role_permissions');
    if (!saved) return defaultPermissions;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const normalized: any = {};
        parsed.forEach((item: any) => {
          normalized[item.role] = typeof item.permissions === 'string' ? JSON.parse(item.permissions) : item.permissions;
        });
        return { ...defaultPermissions, ...normalized };
      }
      return parsed;
    } catch (e) {
      return defaultPermissions;
    }
  });

  const modules = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'students', label: 'Student Registration' },
    { id: 'all_students', label: 'All Students List' },
    { id: 'document_capture', label: 'Document Capture' },
    { id: 'attendance', label: 'Security Attendance' },
    { id: 'lessons', label: 'Daily Lessons' },
    { id: 'manual', label: 'Manual Attendance' },
    { id: 'qr_manual_attendance', label: 'QR Manual Attendance' },
    { id: 'admin_panel', label: 'Master Admin Panel' },
    { id: 'exam_attendance_sheet', label: 'Exam Attendance Sheet' },
    { id: 'academics', label: 'Academics & Curriculum' },
    { id: 'exams', label: 'Exams & Results' },
    { id: 'paper_maker', label: 'Paper Maker' },
    { id: 'paper_uploader', label: 'Paper Uploader' },
    { id: 'paper_checker', label: 'Paper Checker' },
    { id: 'paper_reports', label: 'Paper Reports' },
    { id: 'fees', label: 'Fees Management' },
    { id: 'staff', label: 'Staff Roles' },
    { id: 'payroll', label: 'Payroll & Salary' },
    { id: 'visitors', label: 'Visitors Directory' },
    { id: 'notifications', label: 'Notifications & Messages' },
    { id: 'camera', label: 'QR Camera Scanner' },
    { id: 'settings', label: 'System Settings' },
    { id: 'public_result', label: 'Public Result Portal' },
    { id: 'finance', label: 'Finance Accounting' },
    { id: 'library', label: 'Library Management' },
    { id: 'fatwa', label: 'Dar-ul-Ifta (Fatwa)' },
    { id: 'posts', label: 'News & Announcements' },
    { id: 'reports', label: 'Academic Reports Center' },
    { id: 'recycle_bin', label: 'Recycle Bin' },
    { id: 'admissions_view', label: 'Online Admissions' },
    { id: 'super_admin_panel', label: 'Super Admin Panel' },
    { id: 'voice_logs', label: 'Voice Logs & Speech History' },
  ];

  const handleSave = async () => {
    const syncFormat = Object.keys(permissions).map(role => ({
      role: role,
      permissions: JSON.stringify(permissions[role])
    }));
    localStorage.setItem('role_permissions', JSON.stringify(syncFormat));
    window.dispatchEvent(new Event('storage_updated'));
    await syncToServer();
    showNotice('success', 'Permissions saved successfully');
  };

  const togglePermission = (role: string, module: string) => {
    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [module]: !prev[role][module]
      }
    }));
  };

  const handleCreateAccount = async () => {
    if (!newUser.username || !newUser.password) {
      showNotice('error', 'Please enter both username and password');
      return;
    }

    const currentUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check duplicates
    const isDuplicate = currentUsers.some((u: any) => 
      u.username?.toLowerCase() === newUser.username.toLowerCase() ||
      (newUser.email && u.email?.toLowerCase() === newUser.email.toLowerCase())
    );
    if (isDuplicate) {
      showNotice('error', 'This username or email already exists');
      return;
    }

    const schoolId = localStorage.getItem('active_school_id') || 'school_' + generateNumericId();
    const madrassaName = newUser.madrassaName || localStorage.getItem('currentSchoolName') || 'Assan School';

    const userData = { 
      id: generateNumericId(), 
      ...newUser, 
      email: newUser.email || (newUser.username.includes('@') ? newUser.username : `${newUser.username}@school.com`), 
      status: 'accepted', 
      paymentStatus: 'paid',
      schoolId: schoolId,
      madrassaName: madrassaName,
      companyId: schoolId,
      companyName: madrassaName
    };

    const updatedUsers = [...currentUsers, userData];
    
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // Save specifically to Firestore 'users' collection as well for login lookup
    try {
      await setDoc(doc(db, 'users', userData.id.toString()), userData);
    } catch (e) {
      console.error("Error saving user to Firestore:", e);
    }
    
    setNewUser({ username: '', email: '', password: '', role: 'Teacher', madrassaName: '', whatsapp: '' });
    
    window.dispatchEvent(new Event('storage_updated'));
    await syncToServer();
    showNotice('success', 'Account created and activated successfully');
  };

  const handleUpdateUserStatus = async (id: number, status: string, paymentStatus?: string, role?: string) => {
    const currentUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = currentUsers.map((u: any) => {
      if (u.id === id) {
        return { 
          ...u, 
          status: status || u.status, 
          paymentStatus: paymentStatus || u.paymentStatus || 'unpaid',
          role: role || u.role 
        };
      }
      return u;
    });
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    window.dispatchEvent(new Event('storage_updated'));
    await syncToServer();
    showNotice('success', 'Account details updated successfully');
  };

  const handleDeleteUser = async (id: number) => {
    const currentUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = currentUsers.filter((u: any) => u.id !== id);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    window.dispatchEvent(new Event('storage_updated'));
    await syncToServer();
    showNotice('success', 'Account record deleted successfully');
  };

  return (
    <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-500 p-8" dir="ltr">
      {notification && (
        <div className={`mb-6 p-4 rounded-2xl border font-bold text-sm text-center animate-in fade-in slide-in-from-top duration-300 ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {notification.text}
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Account Management</h2>
          <p className="text-sm text-slate-500">Manage different user roles and configure their module access permissions</p>
          <div className="mt-2 bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center gap-3">
             <ShieldCheck className="text-blue-600 w-5 h-5 shrink-0" />
             <div className="text-[11px] text-blue-700 leading-tight">
                <span className="font-bold">Super Admin:</span> {`jamiaarabiasirajululoomjabori@gmail.com`} <br/>
                This permanent account always holds full administrative permissions.
             </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('maker')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'maker' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
          >
            Account Creator
          </button>
          <button 
            onClick={() => setActiveTab('permissions')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'permissions' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
          >
            Permissions
          </button>
        </div>
      </div>

      {activeTab === 'maker' ? (
        <div className="space-y-8 animate-in fade-in duration-300 text-left">
          <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6 text-left">Create New Account</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-slate-600 block">Username</label>
                  <VoiceInput onTranscript={(text) => setNewUser({...newUser, username: text})} />
                </div>
                <input 
                  type="text" 
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  placeholder="e.g. jameel_ahmad"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-sans" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 block">Email / User Code</label>
                <input 
                  type="text" 
                  value={newUser.email}
                  placeholder="e.g. user@gmail.com (Optional)"
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-sans text-left" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 block">Password</label>
                <input 
                  type="text" 
                  value={newUser.password}
                  placeholder="Password string"
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 block">Institution Name</label>
                <input 
                  type="text" 
                  value={newUser.madrassaName}
                  placeholder="e.g. Modern School Academy"
                  onChange={(e) => setNewUser({...newUser, madrassaName: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 block">WhatsApp Number</label>
                <input 
                  type="text" 
                  value={newUser.whatsapp}
                  placeholder="e.g. +923001234567"
                  onChange={(e) => setNewUser({...newUser, whatsapp: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 block">Role</label>
                <select 
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                >
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="md:col-span-3 flex justify-end">
                <button 
                  onClick={handleCreateAccount}
                  className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 active:scale-95"
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex flex-col gap-1 text-xs text-amber-800 leading-relaxed text-left">
            <span className="font-bold text-sm">💡 Supabase Authentication Console Integration:</span>
            <span>If you manually registered new accounts in your Supabase auth console, add their credentials here with matching usernames/emails to allocate appropriate roles and permissions. Once they sign in for the first time, their credentials will match this configuration and grant instant access.</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="py-4 px-6 font-bold">User & Email</th>
                    <th className="py-4 px-6 font-bold">Role Selection</th>
                    <th className="py-4 px-6 font-bold">Status</th>
                    <th className="py-4 px-6 font-bold">Payment</th>
                    <th className="py-4 px-6 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-800">
                        <div className="text-sm">{u.username}</div>
                        <div className="text-[11px] text-slate-400 font-normal select-all">{u.email || u.username}</div>
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={u.role || 'Teacher'}
                          onChange={(e) => handleUpdateUserStatus(u.id, u.status, u.paymentStatus, e.target.value)}
                          className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {roles.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          u.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 
                          u.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {u.status || 'pending'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          u.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {u.paymentStatus || 'unpaid'}
                        </span>
                      </td>
                      <td className="py-4 px-6 flex justify-end gap-2">
                        {u.status !== 'accepted' && <button onClick={() => handleUpdateUserStatus(u.id, 'accepted')} className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded text-xs font-bold hover:bg-emerald-200 transition-all">Approve</button>}
                        {u.status !== 'rejected' && <button onClick={() => handleUpdateUserStatus(u.id, 'rejected')} className="bg-red-100 text-red-600 px-3 py-1 rounded text-xs font-bold hover:bg-red-200 transition-all">Reject</button>}
                        {u.paymentStatus !== 'paid' && <button onClick={() => handleUpdateUserStatus(u.id, u.status, 'paid')} className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-xs font-bold hover:bg-blue-200 transition-all">Mark Paid</button>}
                        <button onClick={() => handleDeleteUser(u.id)} className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-700 transition-all shadow-sm">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">No registered accounts found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-end mb-4">
            <button 
              onClick={handleSave}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Save className="w-5 h-5" />
              Save Permissions
            </button>
          </div>
          <div className="overflow-x-auto border border-slate-200 rounded-[32px]">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="py-4 px-6 text-left font-bold rounded-tl-2xl">Module / Role</th>
                  {roles.map(role => (
                    <th key={role} className="py-4 px-6 text-center font-bold">{role}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {modules.map(mod => (
                  <tr key={mod.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-700">{mod.label}</td>
                    {roles.map(role => (
                      <td key={`${role}-${mod.id}`} className="py-4 px-6 text-center">
                        <label className="inline-flex items-center cursor-pointer justify-center">
                          <input 
                            type="checkbox" 
                            className="hidden"
                            checked={permissions[role]?.[mod.id] || false}
                            onChange={() => togglePermission(role, mod.id)}
                          />
                          <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${permissions[role]?.[mod.id] ? 'bg-blue-600 border-blue-600' : 'bg-slate-100 border-slate-300'}`}>
                            {permissions[role]?.[mod.id] && <Check className="w-4 h-4 text-white" />}
                          </div>
                        </label>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
