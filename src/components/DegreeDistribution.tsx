import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, Plus, Search, FileText, Trash2, 
  Download, Printer, Filter, ChevronRight, X,
  Calendar, MapPin, User, Hash, Star, PenTool, QrCode,
  Upload
} from 'lucide-react';
import QRCode from 'qrcode';

interface DegreeRecord {
  id?: string;
  studentName: string;
  fatherName: string;
  residence: string;
  district: string;
  grade: string;
  rollNo: string;
  year: string;
  taqdeer: string; // Rank/Grade (Excellent, Good, etc.)
  signatureDate: string;
  createdAt: number;
}

const DegreeDistribution = () => {
  const [records, setRecords] = useState<DegreeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [signatures, setSignatures] = useState<{mohtamim?: string, sadrMudarris?: string}>({});
  
  const [formData, setFormData] = useState<Omit<DegreeRecord, 'id' | 'createdAt'>>({
    studentName: '',
    fatherName: '',
    residence: '',
    district: '',
    grade: 'Grade 10',
    rollNo: '',
    year: new Date().getFullYear().toString(),
    taqdeer: 'Excellent',
    signatureDate: new Date().toISOString().split('T')[0],
  });

  const classes = [
    "Grade 12", "Grade 11", "Grade 10", "Grade 9", "Grade 8", "Grade 7", "Grade 6", "Grade 5", "Grade 4", "Hifz", "Nazra"
  ];

  const taqdeerOptions = ["Excellent", "Very Good", "Good", "Pass"];

  useEffect(() => {
    // Load local records
    const savedRecords = localStorage.getItem('degree_records');
    if (savedRecords) {
      try {
        setRecords(JSON.parse(savedRecords));
      } catch (e) {}
    }
    
    // Load signatures
    const savedSigs = localStorage.getItem('degree_signatures');
    if (savedSigs) {
      try {
        setSignatures(JSON.parse(savedSigs));
      } catch (e) {}
    }
    
    setIsLoading(false);
  }, []);

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>, role: 'mohtamim' | 'sadrMudarris') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const updatedSigs = { ...signatures, [role]: base64 };
        setSignatures(updatedSigs);
        localStorage.setItem('degree_signatures', JSON.stringify(updatedSigs));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: DegreeRecord = {
      ...formData,
      id: Date.now().toString(),
      createdAt: Date.now()
    };
    
    const updatedRecords = [newRecord, ...records];
    setRecords(updatedRecords);
    localStorage.setItem('degree_records', JSON.stringify(updatedRecords));
    
    setShowAddModal(false);
    setFormData({
      studentName: '',
      fatherName: '',
      residence: '',
      district: '',
      grade: 'Grade 10',
      rollNo: '',
      year: new Date().getFullYear().toString(),
      taqdeer: 'Excellent',
      signatureDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      const updatedRecords = records.filter(r => r.id !== id);
      setRecords(updatedRecords);
      localStorage.setItem('degree_records', JSON.stringify(updatedRecords));
    }
  };

  const filteredRecords = records.filter(r => 
    (selectedClass === 'All' || r.grade === selectedClass) &&
    (selectedYear === 'All' || r.year === selectedYear) &&
    (r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
     r.rollNo.includes(searchTerm) || 
     r.fatherName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex-1 bg-slate-50 p-4 md:p-8 overflow-y-auto" dir="ltr">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Degree Records</h1>
          <p className="text-slate-500">Academic certificates and historical records archive.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="p-4 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
            title="Settings"
          >
            <PenTool className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-3xl font-bold flex items-center gap-3 shadow-xl shadow-emerald-600/20 transition-all active:scale-95 flex-1 md:flex-none justify-center"
          >
            <Plus className="w-6 h-6" />
            <span>Add New Record</span>
          </button>
        </div>
      </div>

      {/* Stats & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-slate-500 font-bold">Total Degrees</span>
          </div>
          <div className="text-3xl font-black text-slate-900">{records.length}</div>
        </div>

        <div className="md:col-span-3 bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by name, father name or roll no..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <button 
              onClick={() => setSelectedClass('All')}
              className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${selectedClass === 'All' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              All Classes
            </button>
            {classes.map(c => (
              <button 
                key={c}
                onClick={() => setSelectedClass(c)}
                className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${selectedClass === c ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar border-l border-slate-100 pl-4">
             <select 
               value={selectedYear}
               onChange={(e) => setSelectedYear(e.target.value)}
               className="px-6 py-3 bg-slate-100 rounded-2xl font-bold text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500/20"
             >
               <option value="All">All Years</option>
               {Array.from({ length: new Date().getFullYear() - 1980 + 1 }, (_, i) => (new Date().getFullYear() - i).toString()).map(year => (
                 <option key={year} value={year}>{year}</option>
               ))}
             </select>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden print:shadow-none print:border-none">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center print:hidden">
          <h3 className="font-black text-slate-800">Records Archive</h3>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95"
          >
            <Printer className="w-5 h-5" />
            <span>Print Report</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 print:bg-white print:border-slate-300">
                <th className="px-6 py-5 font-black text-slate-600 text-xs md:text-sm print:border print:px-3 print:py-2">Roll No</th>
                <th className="px-6 py-5 font-black text-slate-600 text-xs md:text-sm print:border print:px-3 print:py-2">Student Name</th>
                <th className="px-6 py-5 font-black text-slate-600 text-xs md:text-sm print:border print:px-3 print:py-2">Father Name</th>
                <th className="px-6 py-5 font-black text-slate-600 text-xs md:text-sm print:border print:px-3 print:py-2">Grade</th>
                <th className="px-6 py-5 font-black text-slate-600 text-xs md:text-sm print:border print:px-3 print:py-2">Year</th>
                <th className="px-6 py-5 font-black text-slate-600 text-xs md:text-sm print:border print:px-3 print:py-2">Residence</th>
                <th className="px-6 py-5 font-black text-slate-600 text-xs md:text-sm print:border print:px-3 print:py-2">Result</th>
                <th className="px-6 py-5 font-black text-slate-600 text-xs md:text-sm print:hidden">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 print:divide-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">Loading records...</td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">No records found.</td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/80 transition-colors group print:hover:bg-transparent">
                    <td className="px-6 py-5 font-bold text-slate-900 print:border print:px-3 print:py-2">{record.rollNo}</td>
                    <td className="px-6 py-5 font-bold text-slate-900 print:border print:px-3 print:py-2">{record.studentName}</td>
                    <td className="px-6 py-5 text-slate-600 print:border print:px-3 print:py-2">{record.fatherName}</td>
                    <td className="px-6 py-5 print:border print:px-3 print:py-2">
                      <span className="px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] md:text-xs font-bold print:bg-transparent print:p-0 print:text-black">{record.grade}</span>
                    </td>
                    <td className="px-6 py-5 text-slate-600 print:border print:px-3 print:py-2">{record.year}</td>
                    <td className="px-6 py-5 text-slate-600 text-xs print:border print:px-3 print:py-2">{record.residence}, {record.district}</td>
                    <td className="px-6 py-5 print:border print:px-3 print:py-2">
                      <span className={`px-4 py-1 rounded-full text-[10px] md:text-xs font-bold print:bg-transparent print:p-0 print:text-black ${
                        record.taqdeer === 'Excellent' ? 'bg-emerald-50 text-emerald-600' :
                        record.taqdeer === 'Very Good' ? 'bg-blue-50 text-blue-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {record.taqdeer}
                      </span>
                    </td>
                    <td className="px-6 py-5 print:hidden">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={async () => {
                            const qrData = `Verified Record\nName: ${record.studentName}\nFather: ${record.fatherName}\nGrade: ${record.grade}\nRoll No: ${record.rollNo}\nYear: ${record.year}`;
                            const qrCodeUrl = await QRCode.toDataURL(qrData);

                            const printWindow = window.open('', '_blank');
                            if (printWindow) {
                              printWindow.document.write(`
                                <html dir="ltr">
                                  <head>
                                    <title>Degree - ${record.studentName}</title>
                                    <style>
                                      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap');
                                      * { margin: 0; padding: 0; box-sizing: border-box; }
                                      body { 
                                        font-family: 'Plus Jakarta Sans', sans-serif; 
                                        padding: 0;
                                        background: #fff;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        min-height: 100vh;
                                      }
                                      .certificate-container {
                                        width: 1000px;
                                        height: 700px;
                                        padding: 60px;
                                        position: relative;
                                        background: #fff;
                                        border: 20px solid #d4af37;
                                        box-shadow: inset 0 0 50px rgba(0,0,0,0.05);
                                      }
                                      .header {
                                        text-align: center;
                                        margin-bottom: 40px;
                                      }
                                      .title {
                                        font-size: 48px;
                                        font-weight: 800;
                                        color: #1e293b;
                                        letter-spacing: -1px;
                                        margin-bottom: 10px;
                                      }
                                      .subtitle {
                                        font-size: 18px;
                                        color: #64748b;
                                        font-weight: 600;
                                      }
                                      .content {
                                        text-align: center;
                                        font-size: 22px;
                                        line-height: 1.8;
                                        color: #334155;
                                        margin-top: 40px;
                                      }
                                      .field {
                                        font-weight: 800;
                                        color: #0f172a;
                                        border-bottom: 2px solid #e2e8f0;
                                        padding: 0 10px;
                                      }
                                      .footer {
                                        margin-top: 80px;
                                        display: flex;
                                        justify-content: space-around;
                                      }
                                      .sign-box {
                                        text-align: center;
                                        width: 250px;
                                      }
                                      .signature-line {
                                        border-top: 2px solid #e2e8f0;
                                        margin-top: 60px;
                                        padding-top: 10px;
                                        font-weight: 700;
                                        color: #64748b;
                                      }
                                      .qr-container {
                                        position: absolute;
                                        bottom: 40px;
                                        right: 40px;
                                        text-align: center;
                                      }
                                      .qr-container img { width: 80px; height: 80px; }
                                      .watermark {
                                        position: absolute;
                                        top: 50%;
                                        left: 50%;
                                        transform: translate(-50%, -50%);
                                        font-size: 150px;
                                        opacity: 0.03;
                                        font-weight: 900;
                                        z-index: -1;
                                      }
                                    </style>
                                  </head>
                                  <body>
                                    <div class="certificate-container">
                                      <div class="header">
                                        <div class="title">CERTIFICATE OF ACHIEVEMENT</div>
                                        <div class="subtitle">Official Academic Record</div>
                                      </div>
                                      <div class="content">
                                        This is to certify that <span class="field">${record.studentName}</span> 
                                        son of <span class="field">${record.fatherName}</span> 
                                        resident of <span class="field">${record.residence}, ${record.district}</span> 
                                        has successfully completed <span class="field">${record.grade}</span> 
                                        in the academic year <span class="field">${record.year}</span> 
                                        with a grade of <span class="field" style="color: #059669;">${record.taqdeer}</span>.
                                        Roll Number: <span class="field">${record.rollNo}</span>
                                      </div>
                                      <div class="footer">
                                        <div class="sign-box">
                                          <div class="signature-line">Principal / Director</div>
                                        </div>
                                        <div class="sign-box">
                                          <div class="signature-line">Controller of Examinations</div>
                                        </div>
                                      </div>
                                      <div class="qr-container">
                                        <img src="${qrCodeUrl}" />
                                        <div style="font-size: 10px; margin-top: 5px;">VERIFIED</div>
                                      </div>
                                      <div class="watermark">ACADEMY</div>
                                    </div>
                                  </body>
                                </html>
                              `);
                              printWindow.document.close();
                              setTimeout(() => {
                                printWindow.print();
                              }, 500);
                            }
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Print Certificate"
                        >
                          <Printer className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => record.id && handleDelete(record.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettingsModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center px-10 py-8 border-b border-slate-100">
                <h2 className="text-2xl font-black text-slate-900">Certificate Settings</h2>
                <button 
                  onClick={() => setShowSettingsModal(false)}
                  className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Principal Signature */}
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-500 flex items-center gap-2">
                      <PenTool className="w-4 h-4" /> Principal Signature
                    </label>
                    <div className="relative group">
                      <div className="w-full h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                        {signatures.mohtamim ? (
                          <img src={signatures.mohtamim} alt="Principal Signature" className="h-full object-contain" />
                        ) : (
                          <span className="text-slate-400 text-xs">No signature</span>
                        )}
                      </div>
                      <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                        <span className="text-white text-xs font-bold flex items-center gap-2">
                          <Upload className="w-4 h-4" /> Upload
                        </span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => handleSignatureUpload(e, 'mohtamim')}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Controller Signature */}
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-500 flex items-center gap-2">
                      <PenTool className="w-4 h-4" /> Controller Signature
                    </label>
                    <div className="relative group">
                      <div className="w-full h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                        {signatures.sadrMudarris ? (
                          <img src={signatures.sadrMudarris} alt="Controller Signature" className="h-full object-contain" />
                        ) : (
                          <span className="text-slate-400 text-xs">No signature</span>
                        )}
                      </div>
                      <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                        <span className="text-white text-xs font-bold flex items-center gap-2">
                          <Upload className="w-4 h-4" /> Upload
                        </span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => handleSignatureUpload(e, 'sadrMudarris')}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowSettingsModal(false)}
                  className="w-full bg-slate-900 text-white py-5 rounded-3xl font-bold hover:bg-slate-800 transition-all active:scale-[0.98]"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center px-10 py-8 border-b border-slate-100">
                <h2 className="text-2xl font-black text-slate-900">Add New Record</h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddRecord} className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 px-2 flex items-center gap-2">
                      <User className="w-4 h-4" /> Student Name
                    </label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      value={formData.studentName}
                      onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 px-2 flex items-center gap-2">
                      <User className="w-4 h-4" /> Father's Name
                    </label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({...formData, fatherName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 px-2 flex items-center gap-2">
                      <Hash className="w-4 h-4" /> Roll No
                    </label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      value={formData.rollNo}
                      onChange={(e) => setFormData({...formData, rollNo: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 px-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Residence / Address
                    </label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      value={formData.residence}
                      onChange={(e) => setFormData({...formData, residence: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 px-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> District
                    </label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      value={formData.district}
                      onChange={(e) => setFormData({...formData, district: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 px-2 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" /> Grade
                    </label>
                    <select 
                      className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      value={formData.grade}
                      onChange={(e) => setFormData({...formData, grade: e.target.value})}
                    >
                      {classes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 px-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Year
                    </label>
                    <input 
                      required
                      type="number" 
                      min="1980"
                      max={new Date().getFullYear()}
                      className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 px-2 flex items-center gap-2">
                      <Star className="w-4 h-4" /> Result / Grade
                    </label>
                    <select 
                      className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      value={formData.taqdeer}
                      onChange={(e) => setFormData({...formData, taqdeer: e.target.value})}
                    >
                      {taqdeerOptions.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 px-2 flex items-center gap-2">
                      <PenTool className="w-4 h-4" /> Signature Date
                    </label>
                    <input 
                      required
                      type="date" 
                      className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      value={formData.signatureDate}
                      onChange={(e) => setFormData({...formData, signatureDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-3xl font-bold transition-all shadow-xl shadow-emerald-600/20 active:scale-[0.98]"
                  >
                    Save Record
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-10 bg-slate-100 hover:bg-slate-200 text-slate-600 py-5 rounded-3xl font-bold transition-all active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DegreeDistribution;
