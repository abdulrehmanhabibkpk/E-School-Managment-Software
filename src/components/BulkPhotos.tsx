import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Upload, FileImage, Image as ImageIcon, Users, Check, 
  Trash2, AlertCircle, RefreshCw, Grid, HelpCircle
} from 'lucide-react';
import { updateCentralKey } from '../syncService';

interface Student {
  id: number;
  name: string;
  fatherName: string;
  phone: string;
  grade: string;
  rollNo?: string;
  photo?: string;
}

interface MappedPhoto {
  fileName: string;
  rollNo: string;
  studentId: number;
  studentName: string;
  grade: string;
  base64Data: string;
  status: 'matched' | 'unmatched';
}

interface BulkPhotosProps {
  onBack: () => void;
}

export default function BulkPhotos({ onBack }: BulkPhotosProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [mappedPhotos, setMappedPhotos] = useState<MappedPhoto[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    const loadedStudents = localStorage.getItem('students');
    if (loadedStudents) {
      try {
        setStudents(JSON.parse(loadedStudents));
      } catch (e) {
        console.error('Failed to load students in BulkPhotos:', e);
      }
    }
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFiles = (files: FileList) => {
    const filesArray = Array.from(files);
    const newMappings: MappedPhoto[] = [];

    filesArray.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        return; // Skip non-images
      }

      // Extract Roll Number from file name (e.g., "101.jpg" or "roll-101.png" -> "101")
      const rawName = file.name;
      const cleanName = rawName.replace(/\.[^/.]+$/, ""); // strip extension
      const rollMatch = cleanName.match(/\d+/); // find first sequence of digits
      const rollNo = rollMatch ? rollMatch[0] : "";

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;

        // Try to match rollNo with students in database
        const matchedStudent = students.find(s => s.rollNo === rollNo);

        const mapping: MappedPhoto = {
          fileName: rawName,
          rollNo: rollNo,
          studentId: matchedStudent ? matchedStudent.id : 0,
          studentName: matchedStudent ? matchedStudent.name : 'Unknown Student',
          grade: matchedStudent ? matchedStudent.grade : 'Unknown Grade',
          base64Data: base64,
          status: matchedStudent ? 'matched' : 'unmatched'
        };

        setMappedPhotos((prev) => {
          // Prevent duplicates
          const filtered = prev.filter(p => p.fileName !== rawName);
          return [...filtered, mapping];
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
  };

  const handleRemovePhoto = (fileName: string) => {
    setMappedPhotos(prev => prev.filter(p => p.fileName !== fileName));
  };

  const handleSaveMappedPhotos = () => {
    const matchedOnly = mappedPhotos.filter(p => p.status === 'matched');
    if (matchedOnly.length === 0) {
      alert('No matched student photos to save.');
      return;
    }

    // Map base64Data to corresponding students
    const updatedStudents = students.map((student) => {
      const match = matchedOnly.find(p => p.studentId === student.id);
      if (match) {
        return { ...student, photo: match.base64Data };
      }
      return student;
    });

    setStudents(updatedStudents);
    localStorage.setItem('students', JSON.stringify(updatedStudents));
    updateCentralKey('students', updatedStudents);

    // Dispatch custom event for storage updates
    window.dispatchEvent(new Event('storage_updated'));

    setSaveStatus(`🎉 Successfully saved ${matchedOnly.length} student photos in database!`);
    setMappedPhotos([]); // Clear uploader queue after successful map

    setTimeout(() => setSaveStatus(null), 5000);
  };

  const matchedCount = mappedPhotos.filter(p => p.status === 'matched').length;
  const unmatchedCount = mappedPhotos.filter(p => p.status === 'unmatched').length;
  const studentsWithoutPhotos = students.filter(s => !s.photo);

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
            <div className="w-10 h-10 bg-sky-500/20 border border-sky-400/30 text-sky-400 rounded-xl flex items-center justify-center shadow-inner">
              <FileImage className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-snug flex items-center gap-2">
                Student Bulk Photos Manager
              </h1>
              <p className="text-xs text-slate-400">
                بلک فوٹوز — فائل نیم میں موجود رول نمبرز کے مطابق طلباء کی تصاویر اپلوڈ کریں
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 pt-6 flex-1 space-y-6">
        
        {/* Status Alert Banner */}
        {saveStatus && (
          <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in">
            <Check className="w-4 h-4 shrink-0" />
            <p>{saveStatus}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* File Upload Box (8 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-sky-500" />
                Upload Multiple Student Photos
              </h3>
              <div className="flex gap-2 text-[10px] font-bold text-slate-500">
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full uppercase">
                  Matched: {matchedCount}
                </span>
                <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full uppercase">
                  Unmatched: {unmatchedCount}
                </span>
              </div>
            </div>

            {/* Drag & Drop Area */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-10 text-center flex flex-col items-center justify-center gap-4 transition-all ${
                dragActive ? "border-sky-500 bg-sky-50/50" : "border-slate-300 bg-slate-50/30 hover:bg-slate-50/70"
              }`}
            >
              <div className="w-14 h-14 bg-sky-50 text-sky-600 border border-sky-100 rounded-2xl flex items-center justify-center shadow-xs">
                <ImageIcon className="w-6 h-6 animate-pulse" />
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-700">
                  Drag and drop files here, or <span className="text-sky-600 underline cursor-pointer">browse from computer</span>
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  Rule: File name must contain Roll Number (e.g., <strong className="text-slate-600">"101.jpg"</strong> matches Roll No <strong className="text-slate-600">101</strong>)
                </p>
              </div>

              <input 
                type="file" 
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="hidden" 
                id="bulk-photo-input"
              />
              <label 
                htmlFor="bulk-photo-input"
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs transition"
              >
                Select Photo Files
              </label>
            </div>

            {/* Matchings Queue List */}
            {mappedPhotos.length > 0 && (
              <div className="space-y-3 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">UPLOAD & MAPPING PREVIEW QUEUE</span>
                  <button 
                    onClick={() => setMappedPhotos([])}
                    className="text-[10px] text-red-600 hover:underline font-bold"
                  >
                    Clear All Uploads
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[350px] overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                  {mappedPhotos.map((photo) => (
                    <div 
                      key={photo.fileName}
                      className={`bg-white rounded-2xl p-2.5 border transition-all flex flex-col justify-between space-y-3 relative group ${
                        photo.status === 'matched' ? 'border-emerald-200' : 'border-amber-200'
                      }`}
                    >
                      {/* Delete chip */}
                      <button 
                        onClick={() => handleRemovePhoto(photo.fileName)}
                        className="p-1 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-full text-slate-400 absolute right-2 top-2 z-10 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>

                      <div className="space-y-2">
                        <div className="w-full aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
                          <img 
                            src={photo.base64Data} 
                            alt={photo.fileName}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="text-left">
                          <span className="text-[9px] text-slate-400 font-bold block truncate" title={photo.fileName}>
                            {photo.fileName}
                          </span>
                          <strong className="text-[11px] text-slate-800 font-bold block truncate">
                            {photo.studentName}
                          </strong>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                          photo.status === 'matched' 
                            ? 'bg-emerald-50 text-emerald-800' 
                            : 'bg-amber-50 text-amber-800'
                        }`}>
                          {photo.status === 'matched' ? `Roll ${photo.rollNo}` : 'No Match'}
                        </span>
                        {photo.status === 'matched' && (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSaveMappedPhotos}
                  disabled={matchedCount === 0}
                  className={`w-full py-3 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer ${
                    matchedCount > 0 ? 'bg-sky-500 hover:bg-sky-600' : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>Assign & Save {matchedCount} Mapped Photos</span>
                </button>
              </div>
            )}
          </div>

          {/* Stats Box (4 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <Users className="w-5 h-5 text-sky-500" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Coverage Statistics</h3>
                  <p className="text-[11px] text-slate-500">تصاویر اپلوڈ کرنے کی کوریج تفصیلات</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">STUDENTS WITHOUT PHOTO</span>
                    <strong className="text-xl font-extrabold text-amber-600">{studentsWithoutPhotos.length}</strong>
                  </div>
                  <AlertCircle className="w-8 h-8 text-amber-500/20" />
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">TOTAL STUDENTS REGISTERED</span>
                    <strong className="text-xl font-extrabold text-slate-700">{students.length}</strong>
                  </div>
                  <Grid className="w-8 h-8 text-slate-500/20" />
                </div>
              </div>

              {studentsWithoutPhotos.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">STUDENTS MISSING IMAGES</span>
                  <div className="max-h-[200px] overflow-y-auto bg-slate-50/50 rounded-2xl p-3 border border-slate-100 space-y-2">
                    {studentsWithoutPhotos.slice(0, 15).map(student => (
                      <div key={student.id} className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                        <span className="truncate">👤 {student.name}</span>
                        <span className="bg-slate-100 text-slate-800 font-mono px-1.5 py-0.2 rounded text-[10px]">
                          Roll {student.rollNo || 'N/A'}
                        </span>
                      </div>
                    ))}
                    {studentsWithoutPhotos.length > 15 && (
                      <p className="text-[10px] text-slate-400 text-center pt-1 italic">And {studentsWithoutPhotos.length - 15} more...</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-400 font-semibold text-center pt-4 border-t border-slate-100 uppercase tracking-widest mt-4">
              AI Student Profile Matching
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
