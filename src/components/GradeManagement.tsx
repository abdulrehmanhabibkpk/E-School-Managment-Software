import React, { useState, useEffect } from 'react';
import { 
  Grid, Plus, List, Search, Trash2, Edit2, Info, ArrowRight, Save, RotateCcw,
  Download, Upload, BookOpen, Book, BarChart2, Users
} from 'lucide-react';
import { exportToExcel, importFromExcel } from '../excelUtils';
import { motion, AnimatePresence } from 'motion/react';
import { syncToServer } from '../syncService';
import { addToRecycleBin } from './RecycleBin';
import { generateNumericId } from '../lib/idUtils';

interface Grade {
  id: number;
  name: string;
  year: string;
  section: string;
  totalStudents: number;
  teacher: string;
  books?: string;
}

const GradeManagement: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'add_book' | 'all_books' | 'syllabus' | 'assignments' | 'result_books_setup'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('All Years');
  
  const [selectedGradeForSetup, setSelectedGradeForSetup] = useState('');
  const [setupMapping, setSetupMapping] = useState<any>(() => {
    const saved = localStorage.getItem('exam_book_setup');
    return saved ? JSON.parse(saved) : {};
  });

  // Listen to Staff updates so local state stays in sync
  useEffect(() => {
    const handleStorageUpdated = () => {
      const saved = localStorage.getItem('staff');
      if (saved) setStaff(JSON.parse(saved));
    };
    window.addEventListener('storage_updated', handleStorageUpdated);
    return () => window.removeEventListener('storage_updated', handleStorageUpdated);
  }, []);
  
  const getDefaultBooks = () => [
    { id: 101, name: 'English Language & Grammar', grade: 'Grade 1', totalSyllabus: '100 Pages', coveredSyllabus: '40 Pages', teacher: '' },
    { id: 102, name: 'Mathematics & Arithmetic', grade: 'Grade 1', totalSyllabus: '120 Pages', coveredSyllabus: '50 Pages', teacher: '' },
    { id: 103, name: 'General Science', grade: 'Grade 1', totalSyllabus: '90 Pages', coveredSyllabus: '30 Pages', teacher: '' },
    { id: 104, name: 'Computer Studies', grade: 'Grade 1', totalSyllabus: '80 Pages', coveredSyllabus: '20 Pages', teacher: '' },
    { id: 105, name: 'Social Studies', grade: 'Grade 1', totalSyllabus: '100 Pages', coveredSyllabus: '45 Pages', teacher: '' },
    { id: 106, name: 'Ethics & Values', grade: 'Grade 1', totalSyllabus: '60 Pages', coveredSyllabus: '25 Pages', teacher: '' },
    
    { id: 201, name: 'English Literature', grade: 'Grade 2', totalSyllabus: '110 Pages', coveredSyllabus: '35 Pages', teacher: '' },
    { id: 202, name: 'Elementary Algebra', grade: 'Grade 2', totalSyllabus: '130 Pages', coveredSyllabus: '60 Pages', teacher: '' },
    { id: 203, name: 'Environmental Science', grade: 'Grade 2', totalSyllabus: '100 Pages', coveredSyllabus: '40 Pages', teacher: '' },
    { id: 204, name: 'Information Technology', grade: 'Grade 2', totalSyllabus: '85 Pages', coveredSyllabus: '30 Pages', teacher: '' },
    { id: 205, name: 'World Geography', grade: 'Grade 2', totalSyllabus: '95 Pages', coveredSyllabus: '25 Pages', teacher: '' },
    { id: 206, name: 'Art & Design', grade: 'Grade 2', totalSyllabus: '50 Pages', coveredSyllabus: '20 Pages', teacher: '' },

    { id: 301, name: 'Advanced English Grammar', grade: 'Grade 3', totalSyllabus: '120 Pages', coveredSyllabus: '40 Pages', teacher: '' },
    { id: 302, name: 'Geometry & Mathematics', grade: 'Grade 3', totalSyllabus: '140 Pages', coveredSyllabus: '60 Pages', teacher: '' },
    { id: 303, name: 'Physics & Chemistry Basics', grade: 'Grade 3', totalSyllabus: '110 Pages', coveredSyllabus: '45 Pages', teacher: '' },
    { id: 304, name: 'Programming & Logic', grade: 'Grade 3', totalSyllabus: '90 Pages', coveredSyllabus: '35 Pages', teacher: '' },
    { id: 305, name: 'History & Civilization', grade: 'Grade 3', totalSyllabus: '100 Pages', coveredSyllabus: '30 Pages', teacher: '' },
    { id: 306, name: 'Creative Writing', grade: 'Grade 3', totalSyllabus: '70 Pages', coveredSyllabus: '30 Pages', teacher: '' },

    { id: 401, name: 'English Communications', grade: 'Grade 4', totalSyllabus: '130 Pages', coveredSyllabus: '50 Pages', teacher: '' },
    { id: 402, name: 'Calculus & Statistics', grade: 'Grade 4', totalSyllabus: '150 Pages', coveredSyllabus: '70 Pages', teacher: '' },
    { id: 403, name: 'Biology & Life Science', grade: 'Grade 4', totalSyllabus: '120 Pages', coveredSyllabus: '50 Pages', teacher: '' },
    { id: 404, name: 'Data Structures', grade: 'Grade 4', totalSyllabus: '100 Pages', coveredSyllabus: '40 Pages', teacher: '' },
    { id: 405, name: 'Global Economics', grade: 'Grade 4', totalSyllabus: '110 Pages', coveredSyllabus: '35 Pages', teacher: '' },
    { id: 406, name: 'Physical Education', grade: 'Grade 4', totalSyllabus: '60 Pages', coveredSyllabus: '30 Pages', teacher: '' },
  ];

  const [books, setBooks] = useState<any[]>(() => {
    const saved = localStorage.getItem('books_list');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Clean out any old Urdu default books if present
      if (parsed.length > 0 && parsed[0]?.name?.includes('نحو')) {
        const defaults = getDefaultBooks();
        localStorage.setItem('books_list', JSON.stringify(defaults));
        return defaults;
      }
      return parsed;
    }
    const defaults = getDefaultBooks();
    localStorage.setItem('books_list', JSON.stringify(defaults));
    return defaults;
  });

  const loadStandardCurriculum = async () => {
    if (confirm('Load standard English curriculum (6 subjects per grade)? This will update current subjects list.')) {
      const defaultBooks = getDefaultBooks();
      setBooks(defaultBooks);
      localStorage.setItem('books_list', JSON.stringify(defaultBooks));
      await syncToServer();
      alert('Standard English Curriculum loaded successfully.');
    }
  };

  const [newBook, setNewBook] = useState({ name: '', grade: '', totalSyllabus: '', coveredSyllabus: '', teacher: '' });

  const [staff, setStaff] = useState<any[]>(() => {
    const saved = localStorage.getItem('staff');
    return saved ? JSON.parse(saved) : [];
  });

  const [bookAssignments, setBookAssignments] = useState<any[]>(() => {
    const saved = localStorage.getItem('book_assignments');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('book_assignments', JSON.stringify(bookAssignments));
  }, [bookAssignments]);

  useEffect(() => {
    localStorage.setItem('books_list', JSON.stringify(books));
  }, [books]);

  const [grades, setGrades] = useState<Grade[]>(() => {
    const saved = localStorage.getItem('grades_list');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Clean out old Urdu grade defaults
      if (parsed.length > 0 && (parsed[0]?.name?.includes('اولیٰ') || parsed[0]?.teacher?.includes('عبدالوحید'))) {
        const defaults: Grade[] = [
          { id: 1, name: 'Grade 1', year: '2026', section: 'A', totalStudents: 0, teacher: 'Unassigned', books: 'English, Math, Science' },
          { id: 2, name: 'Grade 2', year: '2026', section: 'A', totalStudents: 0, teacher: 'Unassigned', books: 'English, Math, Science' },
          { id: 3, name: 'Grade 3', year: '2026', section: 'A', totalStudents: 0, teacher: 'Unassigned', books: 'English, Math, Science' },
          { id: 4, name: 'Grade 4', year: '2026', section: 'A', totalStudents: 0, teacher: 'Unassigned', books: 'English, Math, Science' }
        ];
        localStorage.setItem('grades_list', JSON.stringify(defaults));
        return defaults;
      }
      return parsed;
    }
    const defaults: Grade[] = [
      { id: 1, name: 'Grade 1', year: '2026', section: 'A', totalStudents: 0, teacher: 'Unassigned', books: 'English, Math, Science' },
      { id: 2, name: 'Grade 2', year: '2026', section: 'A', totalStudents: 0, teacher: 'Unassigned', books: 'English, Math, Science' },
      { id: 3, name: 'Grade 3', year: '2026', section: 'A', totalStudents: 0, teacher: 'Unassigned', books: 'English, Math, Science' },
      { id: 4, name: 'Grade 4', year: '2026', section: 'A', totalStudents: 0, teacher: 'Unassigned', books: 'English, Math, Science' }
    ];
    localStorage.setItem('grades_list', JSON.stringify(defaults));
    return defaults;
  });

  const [newGrade, setNewGrade] = useState({
    name: '',
    year: '',
    section: '',
    teacher: '',
    books: ''
  });

  useEffect(() => {
    localStorage.setItem('grades_list', JSON.stringify(grades));
    
    // Update totalStudents from the students list
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const updatedGrades = grades.map(g => {
      const count = students.filter((s: any) => s.grade === g.name && s.section === g.section).length;
      if (g.totalStudents !== count) {
        return { ...g, totalStudents: count };
      }
      return g;
    });
    
    const hasChanges = updatedGrades.some((g, i) => g.totalStudents !== grades[i]?.totalStudents);
    if (hasChanges) {
      setGrades(updatedGrades);
    }
  }, [grades]);

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.name || !newBook.grade) return;
    const bookId = generateNumericId();
    const updatedBooks = [...books, { id: bookId, ...newBook }];
    setBooks(updatedBooks);
    localStorage.setItem('books_list', JSON.stringify(updatedBooks));
    setNewBook({ name: '', grade: '', totalSyllabus: '', coveredSyllabus: '', teacher: '' });
    setActiveTab('all_books');
    await syncToServer();
  };

  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGrade.name || !newGrade.year) return;

    const grade: Grade = {
      id: generateNumericId(),
      name: newGrade.name,
      year: newGrade.year,
      section: newGrade.section,
      totalStudents: 0,
      teacher: newGrade.teacher || 'Unassigned',
      books: newGrade.books
    };

    const updatedGrades = [grade, ...grades];
    setGrades(updatedGrades);
    localStorage.setItem('grades_list', JSON.stringify(updatedGrades));
    setNewGrade({ name: '', year: '', section: '', teacher: '', books: '' });
    setActiveTab('list');
    await syncToServer();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this grade?')) {
      const gradeToDelete = grades.find(g => g.id === id);
      if (gradeToDelete) {
        addToRecycleBin('grades', gradeToDelete, 'name');
      }
      const updatedGrades = grades.filter(g => g.id !== id);
      setGrades(updatedGrades);
      localStorage.setItem('grades_list', JSON.stringify(updatedGrades));
      await syncToServer();
    }
  };

  const filteredGrades = grades.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          g.year.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          g.section.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = yearFilter === 'All Years' || g.year === yearFilter;
    return matchesSearch && matchesYear;
  });

  const uniqueYears = ['All Years', ...Array.from(new Set(grades.map(g => g.year)))];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 font-sans" dir="ltr">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2.5 rounded-xl">
              <Grid className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Academics & Curriculum Management</h1>
              <p className="text-xs text-slate-500">Manage grades, subjects, syllabus tracking, and course assignments.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => exportToExcel(grades, 'grades_record')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl transition-all font-bold flex items-center gap-2 shadow-sm text-xs"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
          
          <label className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-xl transition-all font-bold flex items-center gap-2 shadow-sm cursor-pointer text-xs">
            <Upload className="w-4 h-4" />
            Import Excel
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              className="hidden" 
              onChange={async (e) => {
                if (e.target.files && e.target.files[0]) {
                  try {
                    const data = await importFromExcel(e.target.files[0]);
                    const merged = [...grades, ...data];
                    setGrades(merged);
                    localStorage.setItem('grades_list', JSON.stringify(merged));
                    alert('Grades imported successfully.');
                  } catch (err) {
                    alert('Error importing Excel file.');
                  }
                }
              }} 
            />
          </label>
          <button 
            onClick={() => setActiveTab('assignments')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'assignments' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Users className="w-4 h-4 inline-block mr-1.5" />
            Course Assignments
          </button>
          <button 
            onClick={() => setActiveTab('syllabus')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'syllabus' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <BarChart2 className="w-4 h-4 inline-block mr-1.5" />
            Syllabus Tracker
          </button>
          <button 
            onClick={() => setActiveTab('result_books_setup')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'result_books_setup' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <BookOpen className="w-4 h-4 inline-block mr-1.5" />
            Exam Course Setup
          </button>
          <button 
            onClick={() => setActiveTab('all_books')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'all_books' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <BookOpen className="w-4 h-4 inline-block mr-1.5" />
            All Subjects
          </button>
          <button 
            onClick={() => setActiveTab('add_book')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'add_book' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Book className="w-4 h-4 inline-block mr-1.5" />
            Add Subject
          </button>
          <button 
            onClick={() => setActiveTab('list')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'list' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <List className="w-4 h-4 inline-block mr-1.5" />
            All Grades
          </button>
          <button 
            onClick={() => setActiveTab('add')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'add' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Plus className="w-4 h-4 inline-block mr-1.5" />
            Add Grade
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'list' ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Search & Filter Controls */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                  <div className="relative flex-1 w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      type="text"
                      placeholder="Search grade name, year, or section..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="w-full md:w-64">
                    <select 
                      value={yearFilter}
                      onChange={(e) => setYearFilter(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-semibold"
                    >
                      {uniqueYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Grades Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider font-semibold">
                          <th className="px-4 py-4 text-center w-12">#</th>
                          <th className="px-6 py-4">Grade Name</th>
                          <th className="px-6 py-4 text-center">Academic Year</th>
                          <th className="px-6 py-4 text-center">Section</th>
                          <th className="px-6 py-4 text-center">Enrolled Students</th>
                          <th className="px-6 py-4">Lead Teacher</th>
                          <th className="px-6 py-4">Assigned Subjects</th>
                          <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {filteredGrades.map((grade, index) => (
                          <tr key={grade.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-4 py-4 text-xs font-bold text-slate-400 text-center">{index + 1}</td>
                            <td className="px-6 py-4 font-bold text-slate-800">{grade.name}</td>
                            <td className="px-6 py-4 text-center">
                              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold">{grade.year}</span>
                            </td>
                            <td className="px-6 py-4 text-center text-slate-500 font-medium">
                              {grade.section || '---'}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold">
                                {grade.totalStudents}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600 font-medium">{grade.teacher || 'Unassigned'}</td>
                            <td className="px-6 py-4">
                              <span className="text-xs text-slate-500 max-w-[180px] truncate block" title={grade.books}>{grade.books || 'None'}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => handleDelete(grade.id)}
                                  className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all"
                                  title="Delete Grade"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredGrades.length === 0 && (
                          <tr>
                            <td colSpan={8} className="py-16 text-center">
                              <div className="flex flex-col items-center gap-3 text-slate-400">
                                <Search className="w-10 h-10 opacity-30" />
                                <span className="text-sm font-medium">No grades found</span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'add' ? (
              <motion.div
                key="add"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                  <div className="bg-slate-900 p-8 text-white relative">
                    <h2 className="text-2xl font-bold relative z-10 flex items-center gap-3">
                      <div className="bg-white/10 p-2 rounded-xl">
                        <Plus className="w-6 h-6 text-indigo-400" />
                      </div>
                      Add New Grade / Class
                    </h2>
                  </div>

                  <form onSubmit={handleAddGrade} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Grade Name</label>
                        <select 
                          required
                          value={newGrade.name}
                          onChange={(e) => setNewGrade({...newGrade, name: e.target.value})}
                          className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-sm"
                        >
                          <option value="">-- Select Grade --</option>
                          <option value="Grade 1">Grade 1</option>
                          <option value="Grade 2">Grade 2</option>
                          <option value="Grade 3">Grade 3</option>
                          <option value="Grade 4">Grade 4</option>
                          <option value="Grade 5">Grade 5</option>
                          <option value="Grade 6">Grade 6</option>
                          <option value="Grade 7">Grade 7</option>
                          <option value="Grade 8">Grade 8</option>
                          <option value="Grade 9">Grade 9</option>
                          <option value="Grade 10">Grade 10</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Academic Year</label>
                        <input 
                          required
                          type="text"
                          placeholder="e.g. 2026"
                          value={newGrade.year}
                          onChange={(e) => setNewGrade({...newGrade, year: e.target.value})}
                          className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Section</label>
                        <input 
                          type="text"
                          placeholder="e.g. Section A, Section B"
                          value={newGrade.section}
                          onChange={(e) => setNewGrade({...newGrade, section: e.target.value})}
                          className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Lead Teacher</label>
                        <input 
                          type="text"
                          placeholder="Enter teacher name..."
                          value={newGrade.teacher}
                          onChange={(e) => setNewGrade({...newGrade, teacher: e.target.value})}
                          className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-sm"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Assigned Subjects (comma separated)</label>
                        <textarea 
                          placeholder="e.g. Mathematics, English, Science, Computer Studies..."
                          value={newGrade.books || ''}
                          onChange={(e) => setNewGrade({...newGrade, books: e.target.value})}
                          className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-sm min-h-[90px]"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                      <button 
                        type="submit"
                        className="flex-1 bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
                      >
                        <Save className="w-5 h-5" />
                        Save Grade
                      </button>
                      <button 
                        type="button"
                        onClick={() => setActiveTab('list')}
                        className="px-6 bg-slate-100 text-slate-600 py-3.5 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        <RotateCcw className="w-5 h-5" />
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            ) : activeTab === 'add_book' ? (
              <motion.div
                key="add_book"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                  <div className="bg-slate-900 p-8 text-white">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      <Book className="w-6 h-6 text-indigo-400" />
                      Add New Subject
                    </h2>
                  </div>
                  <form onSubmit={handleAddBook} className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Select Target Grade</label>
                        <select 
                          required
                          value={newBook.grade}
                          onChange={(e) => setNewBook({...newBook, grade: e.target.value})}
                          className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-sm"
                        >
                          <option value="">-- Select Grade --</option>
                          {grades.map(g => <option key={g.id} value={g.name}>{g.name} ({g.year})</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Subject Name</label>
                        <input 
                          required
                          type="text"
                          placeholder="e.g. Physics, World History, Algebra..."
                          value={newBook.name}
                          onChange={(e) => setNewBook({...newBook, name: e.target.value})}
                          className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Assigned Subject Teacher</label>
                        <select 
                          value={newBook.teacher}
                          onChange={(e) => setNewBook({...newBook, teacher: e.target.value})}
                          className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-sm"
                        >
                          <option value="">-- Select Teacher --</option>
                          {staff.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="pt-4 flex gap-4">
                      <button type="submit" className="flex-1 bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 text-sm shadow-sm">
                        <Save className="w-5 h-5" />
                        Save Subject
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            ) : activeTab === 'assignments' ? (
              <motion.div
                key="assignments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
              >
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Users className="text-indigo-600" />
                  Course & Subject Teacher Assignments
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="bg-slate-900 text-white font-semibold text-xs uppercase tracking-wider">
                        <th className="py-4 px-6">Grade</th>
                        <th className="py-4 px-6">Subject</th>
                        <th className="py-4 px-6">Assigned Instructor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {grades.map(g => {
                        const gradeBooks = books.filter(b => b.grade === g.name);
                        return gradeBooks.map(b => (
                          <tr key={`${g.id}-${b.id}`} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-6 font-bold text-slate-700">{g.name} ({g.year})</td>
                            <td className="py-4 px-6 text-slate-600 font-medium">{b.name}</td>
                            <td className="py-4 px-6">
                              <select 
                                value={b.teacher || ''}
                                onChange={(e) => {
                                  const updatedBooks = books.map(bk => bk.id === b.id ? {...bk, teacher: e.target.value} : bk);
                                  setBooks(updatedBooks);
                                }}
                                className="w-full max-w-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-xs"
                              >
                                <option value="">-- Select Teacher --</option>
                                {staff.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                              </select>
                            </td>
                          </tr>
                        ));
                      })}
                      {books.length === 0 && (
                        <tr><td colSpan={3} className="py-16 text-center text-slate-400 font-medium">No subjects available for assignment.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : activeTab === 'all_books' ? (
              <motion.div
                key="all_books"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Grade Curriculum Details</h3>
                    <p className="text-xs text-slate-500">List of active subjects grouped by academic grade.</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={loadStandardCurriculum}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl transition-all font-bold flex items-center gap-2 text-xs shadow-sm"
                    >
                      <BookOpen className="w-4 h-4" />
                      Load Standard Curriculum (6 Subjects)
                    </button>
                    <button 
                      onClick={() => exportToExcel(books, 'books_list')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl transition-all font-bold flex items-center gap-2 text-xs shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {grades.map(g => {
                    const gradeBooks = books.filter(b => b.grade === g.name);
                    if (gradeBooks.length === 0) return null;
                    return (
                      <div key={g.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <h4 className="font-bold text-base text-indigo-700 border-b border-slate-200 pb-2 mb-3">{g.name} ({g.year})</h4>
                        <ul className="space-y-2">
                          {gradeBooks.map((b, i) => (
                            <li key={b.id} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-100 shadow-sm">
                              <span className="font-semibold text-slate-700 text-xs">{i+1}. {b.name}</span>
                              <button onClick={() => { if(confirm('Delete this subject?')) setBooks(books.filter(bk => bk.id !== b.id)) }} className="text-rose-400 hover:text-rose-600 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                  {books.length === 0 && <div className="col-span-full text-center text-slate-400 py-12 font-medium">No subjects added yet.</div>}
                </div>
              </motion.div>
            ) : activeTab === 'result_books_setup' ? (
              <motion.div
                key="result_books_setup"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
              >
                <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <BookOpen className="text-indigo-600" />
                  Exam Subject Mapping
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Select a grade and choose which subjects participate in each specific exam term.
                </p>

                <div className="mb-6 max-w-xs">
                  <label className="text-xs font-bold text-slate-600 block mb-2">Select Grade</label>
                  <select
                    value={selectedGradeForSetup}
                    onChange={(e) => setSelectedGradeForSetup(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-sm"
                  >
                    <option value="">-- Select Grade --</option>
                    {Array.from(new Set(grades.map(g => g.name))).map((gradeName: string) => (
                      <option key={gradeName} value={gradeName}>{gradeName}</option>
                    ))}
                  </select>
                </div>

                {selectedGradeForSetup ? (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-900 text-white font-semibold text-xs">
                          <th className="py-3 px-4">Subject Name</th>
                          {['Quiz 1', 'Midterm', 'Final Exam', 'Term 1'].map((examName: string) => (
                            <th key={examName} className="py-3 px-4 text-center">{examName}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {books.filter(b => {
                          const bGrade = String(b.grade || '').trim();
                          const selGrade = String(selectedGradeForSetup).trim();
                          return bGrade === selGrade || bGrade.includes(selGrade);
                        }).map((book: any) => {
                          const examList = ['Quiz 1', 'Midterm', 'Final Exam', 'Term 1'];
                          const bookMapping = setupMapping[selectedGradeForSetup]?.[book.name] || [];
                          
                          return (
                            <tr key={book.id} className="hover:bg-slate-50">
                              <td className="py-3.5 px-4 font-bold text-slate-700">{book.name}</td>
                              {examList.map((examName: string) => {
                                const isChecked = bookMapping.includes(examName);
                                return (
                                  <td key={examName} className="py-3.5 px-4 text-center">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        const checked = e.target.checked;
                                        const updatedSetup = { ...setupMapping };
                                        if (!updatedSetup[selectedGradeForSetup]) {
                                          updatedSetup[selectedGradeForSetup] = {};
                                        }
                                        if (!updatedSetup[selectedGradeForSetup][book.name]) {
                                          updatedSetup[selectedGradeForSetup][book.name] = [];
                                        }
                                        if (checked) {
                                          if (!updatedSetup[selectedGradeForSetup][book.name].includes(examName)) {
                                            updatedSetup[selectedGradeForSetup][book.name].push(examName);
                                          }
                                        } else {
                                          updatedSetup[selectedGradeForSetup][book.name] = updatedSetup[selectedGradeForSetup][book.name].filter((t: string) => t !== examName);
                                        }
                                        setSetupMapping(updatedSetup);
                                        localStorage.setItem('exam_book_setup', JSON.stringify(updatedSetup));
                                        syncToServer();
                                      }}
                                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                    />
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                        {books.filter(b => {
                          const bGrade = String(b.grade || '').trim();
                          const selGrade = String(selectedGradeForSetup).trim();
                          return bGrade === selGrade || bGrade.includes(selGrade);
                        }).length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                              No subjects found for this grade. Please add subjects first.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-indigo-50 text-indigo-700 p-8 rounded-xl border border-indigo-100 text-center font-bold text-sm">
                    Please select a grade from the dropdown above to configure exam subjects.
                  </div>
                )}
              </motion.div>
            ) : activeTab === 'syllabus' ? (
              <motion.div
                key="syllabus"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
              >
                <h3 className="text-lg font-bold text-slate-800 mb-6">Syllabus Completion Tracker</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-semibold text-xs">
                        <th className="py-3 px-4">Subject Name</th>
                        <th className="py-3 px-4 text-center">Grade</th>
                        <th className="py-3 px-4 text-center">Total Syllabus</th>
                        <th className="py-3 px-4 text-center">Covered Syllabus</th>
                        <th className="py-3 px-4 text-center">Auto Saved</th>
                      </tr>
                    </thead>
                    <tbody>
                      {books.map(b => (
                        <tr key={b.id} className="border-b hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-800">{b.name}</td>
                          <td className="py-3.5 px-4 text-center font-bold text-slate-600">{b.grade}</td>
                          <td className="py-3.5 px-4 text-center">
                            <input 
                              type="text" 
                              value={b.totalSyllabus || ''} 
                              onChange={(e) => setBooks(books.map(bk => bk.id === b.id ? {...bk, totalSyllabus: e.target.value} : bk))}
                              className="w-28 text-center border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-indigo-500 font-medium" 
                              placeholder="Total syllabus" 
                            />
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <input 
                              type="text" 
                              value={b.coveredSyllabus || ''} 
                              onChange={(e) => setBooks(books.map(bk => bk.id === b.id ? {...bk, coveredSyllabus: e.target.value} : bk))}
                              className="w-28 text-center border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-indigo-500 font-medium" 
                              placeholder="Covered" 
                            />
                          </td>
                          <td className="py-3.5 px-4 text-center text-xs text-slate-400 font-medium">Saved automatically</td>
                        </tr>
                      ))}
                      {books.length === 0 && (
                        <tr><td colSpan={5} className="py-12 text-center text-slate-400 font-medium">No subjects found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default GradeManagement;
