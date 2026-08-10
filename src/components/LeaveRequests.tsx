import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Search, Plus, Calendar, CheckSquare, XSquare, 
  Clock, CheckCircle, FileText, X, ChevronRight, AlertCircle, Trash2
} from 'lucide-react';
import { updateCentralKey } from '../syncService';

interface Student {
  id: number;
  name: string;
  rollNo?: string;
  grade: string;
}

interface LeaveRequest {
  id: string;
  studentId: number;
  studentName: string;
  rollNo?: string;
  grade: string;
  startDate: string;
  endDate: string;
  leaveType: 'Sick' | 'Casual' | 'Urgent' | 'Religious' | 'Other';
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  resolvedDate?: string;
  remarks?: string;
  createdAt: string;
}

interface LeaveRequestsProps {
  onBack: () => void;
}

export default function LeaveRequests({ onBack }: LeaveRequestsProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  
  // Submit Form States
  const [isSubmitModal, setIsSubmitModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState<LeaveRequest['leaveType']>('Sick');
  const [reason, setReason] = useState('');

  // Resolve remarks Modal State
  const [resolvingRequest, setResolvingRequest] = useState<LeaveRequest | null>(null);
  const [remarks, setRemarks] = useState('');

  // Load Initial Data
  useEffect(() => {
    const loadedStudents = localStorage.getItem('students');
    if (loadedStudents) {
      try {
        setStudents(JSON.parse(loadedStudents));
      } catch (e) {
        console.error('Failed to load students in LeaveRequests:', e);
      }
    }

    const loadedRequests = localStorage.getItem('leave_requests');
    if (loadedRequests) {
      try {
        setRequests(JSON.parse(loadedRequests));
      } catch (e) {
        console.error('Failed to load leave requests:', e);
      }
    } else {
      // Seed initial dummy leave requests for demonstration
      const dummyRequests: LeaveRequest[] = [
        {
          id: 'leave_1',
          studentId: 101,
          studentName: 'Muhammad Ali',
          rollNo: '101',
          grade: 'Grade 10',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
          leaveType: 'Sick',
          reason: 'Severe fever and influenza. Doctor recommended rest for 3 days.',
          status: 'Pending',
          createdAt: new Date().toLocaleDateString()
        },
        {
          id: 'leave_2',
          studentId: 103,
          studentName: 'Ayesha Khan',
          rollNo: '201',
          grade: 'Grade 9',
          startDate: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
          endDate: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
          leaveType: 'Casual',
          reason: 'Attending brother\'s wedding ceremony out of town.',
          status: 'Approved',
          resolvedDate: new Date().toLocaleDateString(),
          remarks: 'Approved. Ensure makeup assignments are completed.',
          createdAt: new Date(Date.now() - 86400000 * 6).toLocaleDateString()
        }
      ];
      setRequests(dummyRequests);
      localStorage.setItem('leave_requests', JSON.stringify(dummyRequests));
    }
  }, []);

  const saveRequests = (updatedList: LeaveRequest[]) => {
    setRequests(updatedList);
    localStorage.setItem('leave_requests', JSON.stringify(updatedList));
    updateCentralKey('leave_requests', updatedList);
  };

  const handleOpenSubmit = () => {
    setSelectedStudentId('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
    setLeaveType('Sick');
    setReason('');
    setIsSubmitModal(true);
  };

  const handleNewRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      alert('Please select a student.');
      return;
    }
    if (!startDate || !endDate) {
      alert('Please fill out Start and End dates.');
      return;
    }
    if (!reason.trim()) {
      alert('Please write a reason for leave.');
      return;
    }

    const stud = students.find(s => s.id === Number(selectedStudentId));
    if (!stud) return;

    const newReq: LeaveRequest = {
      id: 'leave_' + Date.now(),
      studentId: stud.id,
      studentName: stud.name,
      rollNo: stud.rollNo,
      grade: stud.grade,
      startDate,
      endDate,
      leaveType,
      reason,
      status: 'Pending',
      createdAt: new Date().toLocaleDateString()
    };

    saveRequests([newReq, ...requests]);
    setIsSubmitModal(false);
  };

  const handleOpenResolve = (req: LeaveRequest, action: 'Approved' | 'Rejected') => {
    setResolvingRequest({ ...req, status: action });
    setRemarks('');
  };

  const handleSaveResolution = () => {
    if (!resolvingRequest) return;
    
    const updated = requests.map(r => {
      if (r.id === resolvingRequest.id) {
        return {
          ...r,
          status: resolvingRequest.status,
          remarks: remarks || `${resolvingRequest.status} by admin`,
          resolvedDate: new Date().toLocaleDateString()
        };
      }
      return r;
    });

    saveRequests(updated);
    setResolvingRequest(null);
  };

  const handleDeleteRequest = (id: string) => {
    if (!confirm('Are you sure you want to delete this leave request?')) return;
    const filtered = requests.filter(r => r.id !== id);
    saveRequests(filtered);
  };

  // Filter requests
  const filteredRequests = requests.filter(r => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = r.studentName.toLowerCase().includes(term) ||
                          (r.rollNo && r.rollNo.includes(term)) ||
                          r.reason.toLowerCase().includes(term) ||
                          r.grade.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#F4F7F6] text-slate-800 flex flex-col font-sans pb-16">
      {/* Top Header Navbar */}
      <header className="bg-slate-900 text-white px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md sticky top-0 z-30">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all cursor-pointer text-white flex items-center justify-center"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/20 border border-indigo-400/30 text-indigo-400 rounded-xl flex items-center justify-center shadow-inner">
              <Calendar className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-snug flex items-center gap-2">
                Leave Requests Manager
              </h1>
              <p className="text-xs text-slate-400">
                درخواستِ رخصت — طلباء کی رخصت کی درخواستیں، منظوری اور ریکارڈز
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenSubmit}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Apply Leave Request</span>
        </button>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 pt-6 flex-1 space-y-6">
        
        {/* Controls Panel */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input 
              type="text" 
              placeholder="Search by student name, roll number, or grade..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-full md:w-auto">
            {(['All', 'Pending', 'Approved', 'Rejected'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === status ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-indigo-600'
                }`}
              >
                {status} ({status === 'All' ? requests.length : requests.filter(r => r.status === status).length})
              </button>
            ))}
          </div>
        </div>

        {/* Requests Logs */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 text-slate-400 space-y-3">
            <Calendar className="w-12 h-12 text-slate-200 mx-auto" />
            <h3 className="text-sm font-bold text-slate-600">No Leave Requests</h3>
            <p className="text-xs text-slate-400">There are no leave requests matching this filter status.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRequests.map(request => (
              <div 
                key={request.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 hover:border-indigo-400 transition-all shadow-xs flex flex-col justify-between space-y-4 text-left"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{request.studentName}</h3>
                      <p className="text-[10px] text-slate-500 font-medium font-mono">
                        Roll: {request.rollNo || 'N/A'} • {request.grade}
                      </p>
                    </div>

                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${
                      request.status === 'Approved' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : request.status === 'Rejected'
                          ? 'bg-red-50 text-red-800 border-red-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {request.status}
                    </span>
                  </div>

                  <div className="h-px bg-slate-100" />

                  {/* Dates & Leave Type */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="block text-[9px] text-slate-400 uppercase">Duration</span>
                      <span className="text-slate-800">{request.startDate} to {request.endDate}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-400 uppercase">Leave Category</span>
                      <span className="text-indigo-600 font-extrabold">{request.leaveType} Leave</span>
                    </div>
                  </div>

                  {/* Reason Box */}
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Reason for Leave</span>
                    <p className="text-xs text-slate-700 font-medium whitespace-pre-wrap leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                      {request.reason}
                    </p>
                  </div>

                  {/* Remarks Box */}
                  {request.remarks && (
                    <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-1">
                      <span className="block text-[9px] font-bold text-indigo-500 uppercase">Admin Remarks & Action Remarks</span>
                      <p className="text-[11px] text-slate-700 font-bold">
                        {request.remarks} {request.resolvedDate && <span className="text-slate-400 font-normal">({request.resolvedDate})</span>}
                      </p>
                    </div>
                  )}
                </div>

                {/* Approvals Buttons Bar (Only if Pending) */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  {request.status === 'Pending' ? (
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() => handleOpenResolve(request, 'Rejected')}
                        className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <XSquare className="w-3.5 h-3.5" />
                        <span>Reject Leave</span>
                      </button>

                      <button
                        onClick={() => handleOpenResolve(request, 'Approved')}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve Leave</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] text-slate-400 font-bold">
                        Applied: {request.createdAt}
                      </span>
                      <button
                        onClick={() => handleDeleteRequest(request.id)}
                        className="p-1.5 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg transition"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leave Application Modal */}
      {isSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <form 
            onSubmit={handleNewRequestSubmit}
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 text-left animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Submit New Leave Application
              </h3>
              <button 
                type="button"
                onClick={() => setIsSubmitModal(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select Student *</label>
                <select 
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                  required
                >
                  <option value="">-- Choose Student --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.rollNo ? `(Roll No: ${s.rollNo})` : ''} - {s.grade}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Start Date *</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">End Date *</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Leave Type / Category</label>
                <select 
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                >
                  <option value="Sick">Sick / Illness</option>
                  <option value="Casual">Casual / Family Event</option>
                  <option value="Urgent">Urgent Work / ضروری کام</option>
                  <option value="Religious">Religious Obligation</option>
                  <option value="Other">Other / Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Reason (تفصیل) *</label>
                <textarea 
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why student is applying for leave..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSubmitModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Submit Leave</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Resolution Remarks Modal */}
      {resolvingRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-100 text-left animate-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-500" />
              Add Comments & Remarks
            </h3>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                Remarks for student {resolvingRequest.studentName} ({resolvingRequest.status})
              </label>
              <textarea 
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Approved. Medical certificate verified / Kindly submit correct dates."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setResolvingRequest(null)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveResolution}
                className={`px-5 py-2 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm ${
                  resolvingRequest.status === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
