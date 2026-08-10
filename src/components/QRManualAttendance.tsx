import React, { useState, useEffect } from 'react';
import { 
  QrCode, Camera, ShieldCheck, UserCheck, X, 
  ArrowLeft, Search, User, Info, CheckCircle2, AlertCircle,
  Clock, Trash2, Calendar, FileSpreadsheet, RefreshCw
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion, AnimatePresence } from 'motion/react';
import { logActivity } from '../utils/logger';

interface QRManualAttendanceProps {
  onBack: () => void;
}

interface VerificationLog {
  id: string;
  studentId: string;
  name: string;
  rollNo: string;
  grade: string;
  status: 'present' | 'absent' | 'late';
  timestamp: string;
  markedBy: string;
}

export default function QRManualAttendance({ onBack }: QRManualAttendanceProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [manualRollNo, setManualRollNo] = useState('');
  const [student, setStudent] = useState<any | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'not_found' | 'saved'>('idle');
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // New features: Local list of recent logs & filters
  const [logs, setLogs] = useState<VerificationLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('');
  const [allGrades, setAllGrades] = useState<string[]>([]);
  
  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0
  });

  useEffect(() => {
    // 1. Get logged in User Info
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      try {
        if (userJson.trim().startsWith('{') || userJson.trim().startsWith('[')) {
          setCurrentUser(JSON.parse(userJson));
        } else {
          setCurrentUser({ username: userJson, email: userJson });
        }
      } catch (e) {
        setCurrentUser({ username: userJson, email: userJson });
      }
    }

    // 2. Load today's logs from localStorage
    const savedLogs = localStorage.getItem('qr_manual_attendance_logs');
    if (savedLogs) {
      try {
        const parsed = JSON.parse(savedLogs);
        setLogs(parsed);
      } catch (e) {
        console.error("Failed to parsed stored QR attendance logs", e);
      }
    }

    // 3. Load grades list for filtering
    try {
      const savedGradesList = JSON.parse(localStorage.getItem('grades_list') || '[]');
      const savedGrades = JSON.parse(localStorage.getItem('grades') || '[]');
      const combined = [...savedGradesList, ...savedGrades];
      const gradeNames = Array.from(new Set(combined.map((g: any) => typeof g === 'string' ? g : (g?.name || '')).filter(Boolean)));
      setAllGrades(gradeNames.length > 0 ? gradeNames : ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6']);
    } catch (e) {
      setAllGrades(['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6']);
    }
  }, []);

  // Compute stats on log change
  useEffect(() => {
    const present = logs.filter(l => l.status === 'present').length;
    const absent = logs.filter(l => l.status === 'absent').length;
    const late = logs.filter(l => l.status === 'late').length;
    setStats({
      total: logs.length,
      present,
      absent,
      late
    });
    localStorage.setItem('qr_manual_attendance_logs', JSON.stringify(logs));
  }, [logs]);

  // Robust HTML5 QR Scanner Effect with safe initialization & cleanup
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    let isMounted = true;

    if (isScanning) {
      const timer = setTimeout(() => {
        const container = document.getElementById("qr-reader");
        if (!container || !isMounted) return;

        try {
          // Setup scanner with responsive, premium sizing
          scanner = new Html5QrcodeScanner(
            "qr-reader",
            { 
              fps: 15, 
              qrbox: (width, height) => {
                const size = Math.min(width, height) * 0.7;
                return { width: size, height: size };
              },
              aspectRatio: 1.0
            },
            /* verbose= */ false
          );

          scanner.render(
            (decodedText) => {
              if (!isMounted) return;
              handleVerifyByData(decodedText);
              
              // Clear scanner immediately to release camera resources
              try {
                scanner?.clear().catch((e) => console.warn("Failed scanner clear:", e));
              } catch (e) {}
              setIsScanning(false);
            },
            (error) => {
              // Ignore standard scanning errors to prevent verbose logs
            }
          );
        } catch (err) {
          console.error("Html5QrcodeScanner initialization error:", err);
          alert("Could not open camera scanner. Please use the Manual Roll No search option below.");
          setIsScanning(false);
        }
      }, 200); // short timeout ensuring element is fully painted in DOM

      return () => {
        isMounted = false;
        clearTimeout(timer);
        if (scanner) {
          try {
            scanner.clear().catch((e) => console.warn("Failed cleanup clear:", e));
          } catch (e) {}
        }
      };
    }
  }, [isScanning]);

  const handleVerifyByData = (data: string) => {
    setScannedData(data);
    setStatus('idle');
    
    // Attempt to locate student matching qr/scanned data
    const savedStudents = JSON.parse(localStorage.getItem('students') || localStorage.getItem('students_list') || '[]');
    
    // Handle raw Roll No or JSON payloads
    let targetRoll = String(data).trim();
    try {
      if (data.startsWith('{')) {
        const parsedData = JSON.parse(data);
        targetRoll = String(parsedData.rollNo || parsedData.id || targetRoll);
      }
    } catch(e) {}

    const found = savedStudents.find((s: any) => 
      String(s.rollNo).trim() === targetRoll || 
      String(s.id).trim() === targetRoll ||
      String(s.registrationNo).trim() === targetRoll
    );

    if (found) {
      setStudent(found);
      setStatus('success');
    } else {
      setStudent(null);
      setStatus('not_found');
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualRollNo.trim()) return;
    handleVerifyByData(manualRollNo);
  };

  const handleMarkAttendance = (type: 'present' | 'absent' | 'late') => {
    if (!student) return;

    // 1. Create a log entry
    const newLog: VerificationLog = {
      id: `QR-ATT-${Date.now()}`,
      studentId: student.id || student.rollNo,
      name: student.name,
      rollNo: student.rollNo,
      grade: student.grade || 'General',
      status: type,
      timestamp: new Date().toISOString(),
      markedBy: currentUser?.username || currentUser?.email || 'Teacher'
    };

    logActivity(`Marked attendance for ${student.name} as ${type.toUpperCase()}`, 'Attendance');
    // 2. Save both in global QR Manual logs and student's regular attendance logs if applicable
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);

    // Save in general attendance_records of the system
    try {
      const records = JSON.parse(localStorage.getItem('attendance_records') || '[]');
      const generalRecord = {
        id: Date.now(),
        studentId: student.id || student.rollNo,
        studentName: student.name,
        rollNo: student.rollNo,
        grade: student.grade,
        status: type,
        timestamp: new Date().toISOString(),
        markedBy: currentUser?.username || currentUser?.email || 'Teacher',
        method: 'QR_Portal_Scanner'
      };
      records.push(generalRecord);
      localStorage.setItem('attendance_records', JSON.stringify(records));
    } catch (e) {
      console.error(e);
    }

    setStatus('saved');
    setManualRollNo('');

    // Reset after 1.5 seconds for next verification
    setTimeout(() => {
      setStudent(null);
      setScannedData(null);
      setStatus('idle');
    }, 1500);
  };

  const handleDeleteLog = (id: string) => {
    if (confirm("Are you sure you want to delete this attendance record?")) {
      const filtered = logs.filter(l => l.id !== id);
      setLogs(filtered);
    }
  };

  const clearAllLogs = () => {
    if (confirm("Are you sure you want to clear all scanned attendance records for today?")) {
      setLogs([]);
    }
  };

  // Filter logs for displaying
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.name.toLowerCase().includes(searchQuery.toLowerCase()) || log.rollNo.includes(searchQuery);
    const matchesGrade = selectedGradeFilter ? log.grade === selectedGradeFilter : true;
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 md:p-8" dir="ltr">
      {/* Header Panel */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-slate-800/80 p-5 rounded-3xl border border-slate-700 backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <QrCode className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">QR & Manual Attendance Verification</h1>
            <p className="text-xs text-slate-400 font-sans tracking-wider mt-1">
              CONNECTED TEACHER: <span className="text-blue-400 font-bold">{currentUser?.username || currentUser?.email || 'Teacher'} (Logged In)</span>
            </p>
          </div>
        </div>
        
        <button 
          onClick={onBack} 
          className="self-start md:self-auto bg-slate-700/60 hover:bg-slate-700 text-white border border-slate-600 px-5 py-2.5 rounded-2xl transition-all flex items-center gap-2 text-sm font-bold shadow-md active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: QR Scanning and Manual Input (7 grid span) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Main Verification Section */}
          <div className="bg-slate-800/60 p-6 rounded-3xl border border-slate-700 shadow-xl backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-6 border-l-4 border-blue-500 pl-3">
              Attendance Verification & Search Portal
            </h3>

            {/* Quick Actions / Manual input form */}
            {!isScanning && !student && status === 'idle' && (
              <div className="flex flex-col gap-6">
                
                {/* Manual Roll No Form */}
                <form onSubmit={handleManualSearch} className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400">Enter Roll No or Registration No:</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input 
                        type="text" 
                        value={manualRollNo}
                        onChange={(e) => setManualRollNo(e.target.value)}
                        placeholder="e.g. 1042..."
                        className="w-full bg-slate-900/90 text-white placeholder-slate-500 px-4 py-3 rounded-xl border border-slate-700 text-left font-mono font-bold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                      <Search className="absolute right-3.5 top-3.5 w-5 h-5 text-slate-500" />
                    </div>
                    <button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl font-bold transition-all text-sm flex items-center gap-2 active:scale-95 shadow-md shadow-blue-900/20"
                    >
                      Search
                    </button>
                  </div>
                </form>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-800 px-3 text-slate-500 font-bold">OR USE CAMERA SCANNER</span></div>
                </div>

                {/* Big Camera trigger */}
                <div className="text-center py-6 bg-slate-900/40 rounded-2xl border border-slate-700">
                  <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-7 h-7 text-blue-400" />
                  </div>
                  <p className="text-slate-300 mb-6 text-sm px-6 leading-relaxed">
                    Open live camera to scan QR code on student ID card or exam attendance sheet.
                  </p>
                  <button 
                    onClick={() => setIsScanning(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-2xl font-bold transition-all flex items-center gap-2.5 mx-auto shadow-lg shadow-emerald-950/40 active:scale-95"
                  >
                    <QrCode className="w-5 h-5" />
                    Open Live Scanner
                  </button>
                </div>
              </div>
            )}

            {/* Active Video Scanner */}
            {isScanning && (
              <div className="flex flex-col gap-4">
                <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-blue-500/50 bg-black/80 max-w-sm mx-auto w-full">
                  <div id="qr-reader" className="w-full"></div>
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-sans">
                    Scanner Live
                  </div>
                </div>
                <div className="flex justify-center mt-2">
                  <button 
                    onClick={() => setIsScanning(false)}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600 px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                  >
                    Close (Switch to Manual Search)
                  </button>
                </div>
              </div>
            )}

            {/* Verified Student Details & Verification Actions */}
            <AnimatePresence>
              {status === 'not_found' && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl text-center"
                >
                  <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-black text-red-500 mb-2">Student Card / Record Not Found</h3>
                  <p className="text-slate-400 mb-6 text-sm">No registered student found for ID or code: <span className="font-mono text-white bg-slate-900 border px-2 py-0.5 rounded">{scannedData}</span></p>
                  <div className="flex justify-center gap-3">
                    <button 
                      onClick={() => { setStatus('idle'); setManualRollNo(''); }}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-5 py-2.5 rounded-xl text-xs transition-all"
                    >
                      Type Again
                    </button>
                    <button 
                      onClick={() => { setStatus('idle'); setIsScanning(true); }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Scan New Code
                    </button>
                  </div>
                </motion.div>
              )}

              {student && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-slate-900/60 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl p-6"
                >
                  {/* Profiler Card */}
                  <div className="flex flex-col md:flex-row gap-6 items-center pb-6 border-b border-slate-800">
                    <div className="relative shrink-0">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-xl bg-slate-800">
                        {student.photo ? (
                          <img src={student.photo} alt="Student" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500"><User className="w-10 h-10" /></div>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-lg shadow-lg border border-slate-900">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-0.5 rounded-full text-[10px] font-bold mb-2">
                        Student Record Verified (Active)
                      </div>
                      <h2 className="text-2xl font-black text-white">{student.name}</h2>
                      <p className="text-sm text-slate-400 mt-1">Father: {student.fatherName}</p>
                    </div>
                  </div>

                  {/* Metadata fields */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-6">
                    <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700 text-center">
                      <span className="text-[9px] text-slate-400 block mb-1">Roll No</span>
                      <span className="text-lg font-mono font-bold text-white tracking-wider">{student.rollNo}</span>
                    </div>
                    <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700 text-center">
                      <span className="text-[9px] text-slate-400 block mb-1">Grade / Class</span>
                      <span className="text-lg font-bold text-white">{student.grade}</span>
                    </div>
                    <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700 text-center col-span-2 md:col-span-1">
                      <span className="text-[9px] text-slate-400 block mb-1">Registration No</span>
                      <span className="text-lg font-mono font-bold text-slate-300">{student.registrationNo || '----'}</span>
                    </div>
                  </div>

                  {/* Attendance Actions */}
                  <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-700/60">
                    <p className="text-xs text-center text-slate-400 mb-4 font-bold">Select Attendance Status:</p>
                    {status === 'saved' ? (
                      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-5 rounded-2xl text-center flex flex-col items-center gap-1.5 shadow-lg shadow-emerald-900/20">
                        <CheckCircle2 className="w-10 h-10 text-white animate-bounce" />
                        <span className="text-base font-black">Attendance saved successfully!</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            type="button"
                            onClick={() => handleMarkAttendance('present')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-lg transition-all shadow-md active:scale-95 shadow-emerald-950/20"
                          >
                            Present
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleMarkAttendance('absent')}
                            className="bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold text-lg transition-all shadow-md active:scale-95 shadow-red-950/20"
                          >
                            Absent
                          </button>
                        </div>
                        <button 
                          type="button"
                          onClick={() => handleMarkAttendance('late')}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 py-3 rounded-xl font-black text-base transition-all active:scale-95 shadow-md shadow-amber-950/20"
                        >
                          Late / Leave
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Manual cancel / reset button */}
                  {status !== 'saved' && (
                    <div className="mt-4 text-center">
                      <button 
                        type="button" 
                        onClick={() => { setStudent(null); setManualRollNo(''); setScannedData(null); }}
                        className="text-slate-500 hover:text-slate-300 transition-colors text-xs font-bold"
                      >
                        Cancel & New Record
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Guidelines instruction card */}
          <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-3xl flex gap-4 text-left">
            <Info className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-blue-400 font-bold text-sm">Attendance Scanner Instructions & Guide:</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Scan the student QR code on their ID card or exam sheet to verify attendance in real-time. If the camera is unavailable or the code is damaged, enter the Roll Number manually to complete verification.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Statistics & Live Session Log history (5 grid span) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Stats Bento boxes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 text-center">
              <span className="text-slate-400 text-[10px] block">Total Scanned Logs</span>
              <span className="text-3xl font-black text-white font-mono block mt-1">{stats.total}</span>
            </div>
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-emerald-950 text-center">
              <span className="text-emerald-400 text-[10px] block">Total Present (P)</span>
              <span className="text-3xl font-black text-emerald-400 font-mono block mt-1">{stats.present}</span>
            </div>
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-red-950 text-center">
              <span className="text-red-400 text-[10px] block">Total Absent (A)</span>
              <span className="text-3xl font-black text-red-400 font-mono block mt-1">{stats.absent}</span>
            </div>
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-amber-950 text-center">
              <span className="text-amber-400 text-[10px] block">Late / Leave (L)</span>
              <span className="text-3xl font-black text-amber-500 font-mono block mt-1">{stats.late}</span>
            </div>
          </div>

          {/* Session History panel */}
          <div className="bg-slate-800/60 p-5 rounded-3xl border border-slate-700 shadow-xl flex-1 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                Today's Scanned Logs ({filteredLogs.length})
              </h3>
              {logs.length > 0 && (
                <button 
                  onClick={clearAllLogs}
                  className="text-[10px] text-red-400 hover:text-red-500 font-bold"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by name or roll no..."
                className="bg-slate-950 text-white placeholder-slate-600 px-3 py-2 rounded-xl text-[10px] border border-slate-700 outline-none"
              />
              <select 
                value={selectedGradeFilter}
                onChange={(e) => setSelectedGradeFilter(e.target.value)}
                className="bg-slate-950 text-slate-300 px-3 py-2 rounded-xl text-[10px] border border-slate-700 outline-none"
              >
                <option value="">All Classes</option>
                {allGrades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto max-h-[350px] space-y-2 pr-1 custom-scrollbar">
              {filteredLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-500">
                  <p className="text-xs font-bold">No attendance scanned yet</p>
                  <p className="text-[9px] text-slate-600 mt-1">Scan student QR code or search Roll No to mark attendance.</p>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50 flex items-center justify-between text-left"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">{log.name}</span>
                        <span className="text-[8px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono select-all">Roll: {log.rollNo}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-500">
                        <span>{log.grade}</span>
                        <span>•</span>
                        <span className="font-mono">{new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black ${
                        log.status === 'present' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : log.status === 'absent' 
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {log.status === 'present' ? 'Present' : log.status === 'absent' ? 'Absent' : 'Leave'}
                      </span>
                      <button 
                        onClick={() => handleDeleteLog(log.id)}
                        className="text-slate-600 hover:text-red-400 p-1 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <p className="text-[10px] text-center text-slate-500 border-t border-slate-800 pt-3 mt-4 select-none">
              Smart Scanner Panel • Verified Secure Session
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
