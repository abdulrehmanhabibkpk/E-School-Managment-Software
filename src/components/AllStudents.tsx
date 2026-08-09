import React, { useEffect, useState } from 'react';
import { 
  Users, X, Search, Filter, Printer, Edit, Trash2, 
  ChevronLeft, ChevronRight, Download, Upload, GripVertical,
  RefreshCw
} from 'lucide-react';
import PrintAdmissionForm from './PrintAdmissionForm';
import StudentManagement from './StudentManagement';
import { exportToExcel, importFromExcel } from '../excelUtils';
import { addToRecycleBin } from './RecycleBin';
import { syncToServer } from '../syncService';
import { logActivity } from '../utils/logger';
import * as XLSX from 'xlsx';
import VoiceInput from './VoiceInput';

interface Student {
  id: number;
  name: string;
  fatherName: string;
  gender: string;
  cnic: string;
  dob: string;
  admissionDate: string;
  regNo: string;
  rollNo: string;
  currentAddress: string;
  currentDistrict: string;
  permanentAddress: string;
  permanentDistrict: string;
  phone: string;
  grade: string;
  section: string;
  madrasaDetails?: string;
  photo?: string;
}

interface AllStudentsProps {
  onBack: () => void;
  permissions?: {
    canAdd: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
}

const generateNumericId = () => {
    return Number(Math.floor(Math.random() * 900000) + 100000);
};

export default function AllStudents({ onBack, permissions }: AllStudentsProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [printingStudent, setPrintingStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [userRole] = useState(() => localStorage.getItem('currentUserRole') || 'Teacher');

  const [systemSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('system_settings');
      return saved ? JSON.parse(saved) : { jamiaName: 'Professional School Portal', monogram: '' };
    } catch (e) {
      return { jamiaName: 'Professional School Portal', monogram: '' };
    }
  });

  const [darjas, setDarjas] = useState<string[]>([]);
  const [selectedDarja, setSelectedDarja] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    const fetchStudents = () => {
      try {
        const saved = localStorage.getItem('students');
        if (saved) {
          const parsed: Student[] = JSON.parse(saved);
          setStudents(parsed);

          const savedGrades = JSON.parse(localStorage.getItem('grades_list') || '[]');
          const gradesFromList = savedGrades.map((g: any) => (typeof g === 'string' ? g : g?.name)).filter(Boolean);
          const gradesFromStudents = parsed.map(s => s.grade).filter(Boolean);
          const uniqueDarjas = Array.from(new Set([...gradesFromList, ...gradesFromStudents]));
          if (uniqueDarjas.length > 0) {
            setDarjas(uniqueDarjas as string[]);
          }
        }
      } catch (err) {
        console.error('Error fetching students:', err);
      }
    };

    fetchStudents();
    window.addEventListener('storage_updated', fetchStudents);
    return () => window.removeEventListener('storage_updated', fetchStudents);
  }, []);

  const filteredStudents = students.filter(s => {
    const matchesSearch = !searchTerm || 
      (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (s.fatherName && s.fatherName.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (s.cnic && s.cnic.includes(searchTerm)) || 
      (s.regNo && s.regNo.includes(searchTerm)) ||
      (s.rollNo && s.rollNo.includes(searchTerm));
    
    const matchesDarja = !selectedDarja || (s.grade && s.grade.trim() === selectedDarja.trim());
    
    let studentYear = '';
    if (s.admissionDate) {
      const yearMatch = s.admissionDate.match(/\d{4}/);
      studentYear = yearMatch ? yearMatch[0] : '';
    }
    const matchesYear = !selectedYear || studentYear === selectedYear;
    
    return matchesSearch && matchesDarja && matchesYear;
  });

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDelete = async (id: any) => {
    if (!window.confirm('Are you sure you want to delete this student record?')) {
      return;
    }
    const studentToDelete = students.find(s => String(s.id) === String(id));
    if (studentToDelete) {
      logActivity(`Deleted student: ${studentToDelete.name}`, 'Enrollment');
      addToRecycleBin('students', studentToDelete, 'name');
    }
    const updated = students.filter(s => String(s.id) !== String(id));
    setStudents(updated);
    localStorage.setItem('students', JSON.stringify(updated));
    await syncToServer();
  };

  if (printingStudent) {
    return <PrintAdmissionForm student={printingStudent} onBack={() => setPrintingStudent(null)} />;
  }

  if (editingStudent) {
    return <StudentManagement 
      editingStudent={editingStudent} 
      onBack={() => { 
        setEditingStudent(null); 
        const saved = JSON.parse(localStorage.getItem('students') || '[]'); 
        setStudents(saved); 
      }} 
    />;
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden print:overflow-visible print:bg-white print:h-auto" dir="ltr">
      {/* Header */}
      <div className="bg-[#1e293b] text-white p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg print:hidden">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-4 w-full md:w-auto">
           <button 
            onClick={onBack}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          
          <button 
            onClick={() => window.print()}
            className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-xl transition-all font-bold flex items-center gap-2"
          >
            <Printer className="w-5 h-5" />
            <span>Print List</span>
          </button>

          <button 
            onClick={() => {
              const exportData = students.map(s => ({
                'Name': s.name, 'Father': s.fatherName, 'Class': s.grade, 'Roll No': s.rollNo, 'CNIC': s.cnic, 'Phone': s.phone
              }));
              exportToExcel(exportData, 'student_list');
            }}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl transition-all font-bold flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            <span>Export Excel</span>
          </button>
        </div>
        
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Student Database</h1>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 border-b border-slate-200 flex flex-wrap gap-4 items-center print:hidden">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search name, ID, CNIC..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
          value={selectedDarja}
          onChange={(e) => setSelectedDarja(e.target.value)}
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
        >
          <option value="">All Classes</option>
          {darjas.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <select 
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
        >
          <option value="">All Years</option>
          {Array.from({ length: 11 }, (_, i) => 2020 + i).map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
          <span>Rows:</span>
          <select 
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="bg-slate-50 border-none outline-none"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-4 print:p-0">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:border-none">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                <th className="px-4 py-4">S#</th>
                <th className="px-4 py-4">Photo</th>
                <th className="px-4 py-4">Name</th>
                <th className="px-4 py-4">Father Name</th>
                <th className="px-4 py-4">Class</th>
                <th className="px-4 py-4">Roll No</th>
                <th className="px-4 py-4">Phone</th>
                <th className="px-4 py-4 print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-20 text-center text-slate-400">No student records found.</td>
                </tr>
              ) : (
                paginatedStudents.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 font-mono text-slate-400">{(currentPage - 1) * pageSize + idx + 1}</td>
                    <td className="px-4 py-4">
                      {student.photo ? (
                        <img src={student.photo} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">NA</div>
                      )}
                    </td>
                    <td className="px-4 py-4 font-bold text-slate-900">{student.name}</td>
                    <td className="px-4 py-4 text-slate-600">{student.fatherName}</td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">{student.grade}</span>
                    </td>
                    <td className="px-4 py-4 font-mono text-slate-500">{student.rollNo}</td>
                    <td className="px-4 py-4 font-mono text-slate-500">{student.phone}</td>
                    <td className="px-4 py-4 print:hidden">
                      <div className="flex gap-2">
                        <button onClick={() => setEditingStudent(student)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit className="w-4 h-4"/></button>
                        <button onClick={() => handleDelete(student.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4"/></button>
                        <button onClick={() => setPrintingStudent(student)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-all"><Printer className="w-4 h-4"/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white border-t border-slate-200 p-4 flex items-center justify-between print:hidden">
        <div className="text-xs font-bold text-slate-400 uppercase">
          Showing {paginatedStudents.length} of {filteredStudents.length} students
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-slate-200 rounded-lg disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="flex items-center px-4 text-xs font-bold">{currentPage} / {totalPages}</span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border border-slate-200 rounded-lg disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
