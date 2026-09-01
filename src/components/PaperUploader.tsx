import React, { useState, useEffect } from 'react';
import { ArrowRight, Upload, Book, User, CheckCircle, X, Eye } from 'lucide-react';
import { API_BASE_URL, customFetch } from '../config';

interface PaperUploaderProps {
  onBack: () => void;
}

export default function PaperUploader({ onBack }: PaperUploaderProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [selectedDarja, setSelectedDarja] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [uploadStatus, setUploadStatus] = useState<Record<string, string>>({});
  const [darjas, setDarjas] = useState<string[]>([]);
  const [allResults, setAllResults] = useState<any[]>([]);

  useEffect(() => {
    // Load students - prefer 'students' as it's the standard sync key
    const savedStudents = JSON.parse(localStorage.getItem('students') || localStorage.getItem('students_list') || '[]');
    setStudents(savedStudents);
    
    // Load darjas from grades
    const savedGrades = JSON.parse(localStorage.getItem('grades_list') || '[]');
    const uniqueDarjas = Array.from(new Set(savedGrades.map((g: any) => g.name))).filter(Boolean);
    
    if (uniqueDarjas.length > 0) {
      setDarjas(uniqueDarjas as string[]);
    } else {
      // Fallback to students' grades
      const gradesFromStudents = Array.from(new Set(savedStudents.map((s: any) => s.grade).filter(Boolean)));
      setDarjas(gradesFromStudents as string[]);
    }

    // Load books
    const savedBooks = JSON.parse(localStorage.getItem('books_list') || '[]');
    setBooks(savedBooks);

    // Load results
    const savedResults = JSON.parse(localStorage.getItem('results') || '[]');
    setAllResults(savedResults);
  }, []);

  // Determine API Base URL
  const getApiUrl = () => {
    return API_BASE_URL;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, bookName: string) => {
    const file = e.target.files?.[0];
    if (!file || !selectedStudent) return;

    setUploadStatus(prev => ({ ...prev, [bookName]: 'uploading' }));

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        
        try {
          // Upload to server
          const response = await customFetch(`${getApiUrl()}/api/upload-paper`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: `${selectedStudent.id}_${bookName.replace(/\s+/g, '_')}_${Date.now()}.${file.name.split('.').pop()}`,
              fileData: base64Data
            })
          });

          if (!response.ok) throw new Error('Upload failed');
          const data = await response.json();
          
          if (data.success) {
            // Save to local Results pending sync
            const existingResults = JSON.parse(localStorage.getItem('results') || '[]');
            
            // Check if already uploaded for this student and book, if so update/append
            const existingIdx = existingResults.findIndex((r: any) => 
              r.studentId === selectedStudent.id && r.book === bookName
            );
            
            let updatedPath = data.path;
            if (existingIdx >= 0) {
              const prevRecord = existingResults[existingIdx];
              if (prevRecord.paperPath) {
                // Append new page to existing pages (comma separated list)
                updatedPath = `${prevRecord.paperPath},${data.path}`;
              }
            }
            
            const newRecord = {
              id: existingIdx >= 0 ? existingResults[existingIdx].id : Date.now(),
              studentId: selectedStudent.id,
              studentName: selectedStudent.name,
              darja: selectedStudent.grade || selectedDarja,
              book: bookName,
              paperPath: updatedPath,
              marks: null,
              comments: '',
              status: 'pending' // pending checking
            };

            if (existingIdx >= 0) {
              existingResults[existingIdx] = newRecord;
            } else {
              existingResults.push(newRecord);
            }
            
            localStorage.setItem('results', JSON.stringify(existingResults));
            setAllResults(existingResults);
            
            // Trigger sync
            window.dispatchEvent(new Event('storage_updated'));
            import('../syncService').then(m => m.syncToServer());
            
            setUploadStatus(prev => ({ ...prev, [bookName]: 'success' }));
            setTimeout(() => {
              setUploadStatus(prev => ({ ...prev, [bookName]: '' }));
            }, 2000);
          } else {
            throw new Error(data.error || 'Server error');
          }
        } catch (fetchError: any) {
          console.error('Fetch Error:', fetchError);
          alert('سرور سے رابطہ نہیں ہو سکا۔ براہ کرم چیک کریں کہ سرور چل رہا ہے۔');
          setUploadStatus(prev => ({ ...prev, [bookName]: 'error' }));
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setUploadStatus(prev => ({ ...prev, [bookName]: 'error' }));
    }
  };

  const filteredStudents = students.filter(s => s.grade === selectedDarja);
  const studentBooks = books.filter(b => b.grade === selectedDarja);

  const getFullSrc = (path: string) => {
    if (!path) return '';
    if (path.startsWith('data:')) return path;
    if (path.startsWith('http')) return path;
    return `${getApiUrl()}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 font-sans" dir="ltr">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">Upload Center / Paper Uploader</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Grade Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Select Class / Grade</h2>
            <div className="space-y-2">
              {darjas.map(darja => (
                <button
                  key={darja}
                  onClick={() => {
                    setSelectedDarja(darja);
                    setSelectedStudent(null);
                    setUploadStatus({});
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg font-bold transition-all ${selectedDarja === darja ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                >
                  {darja}
                </button>
              ))}
              {darjas.length === 0 && <p className="text-slate-500 text-sm">No grades or classes available.</p>}
            </div>
          </div>

          {/* Student List */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Student List</h2>
            {selectedDarja ? (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredStudents.map(student => (
                  <button
                    key={student.id}
                    onClick={() => {
                      setSelectedStudent(student);
                      setUploadStatus({});
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg font-bold flex items-center justify-between transition-all ${selectedStudent?.id === student.id ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{student.name}</span>
                    </div>
                    <span className="text-xs opacity-80">Roll #{student.rollNo}</span>
                  </button>
                ))}
                {filteredStudents.length === 0 && <p className="text-slate-500 text-sm">No students in this grade.</p>}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400 font-bold uppercase text-xs tracking-widest">
                Select Grade First
              </div>
            )}
          </div>

          {/* Book List & Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Subjects & Upload</h2>
            {selectedStudent ? (
              <div className="space-y-4">
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 mb-4">
                  <p className="text-xs font-black text-emerald-800 uppercase tracking-widest">Active Student</p>
                  <p className="text-sm font-bold text-emerald-900 mt-0.5">{selectedStudent.name}</p>
                </div>
                
                {studentBooks.length > 0 ? studentBooks.map(book => {
                  const resultRecord = allResults.find(r => r.studentId === selectedStudent.id && r.book === book.name);
                  const pages = resultRecord && resultRecord.paperPath ? resultRecord.paperPath.split(',').filter(Boolean) : [];

                  return (
                    <div key={book.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex flex-col gap-3">
                      <div className="flex items-center justify-between font-bold text-slate-700">
                        <div className="flex items-center gap-2">
                          <Book className="w-4 h-4 text-blue-500" />
                          <span>{book.name}</span>
                        </div>
                        {pages.length > 0 && (
                          <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-lg font-black uppercase tracking-wider">
                            {pages.length} {pages.length === 1 ? 'Page' : 'Pages'}
                          </span>
                        )}
                      </div>

                      {/* Display thumbnail previews for each page */}
                      {pages.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded-lg border border-slate-200">
                          {pages.map((pagePath, pIdx) => (
                            <div key={pIdx} className="relative group rounded border border-slate-100 overflow-hidden bg-slate-50 aspect-square flex flex-col items-center justify-center p-1">
                              {pagePath.endsWith('.pdf') ? (
                                <div className="text-[10px] font-black text-rose-500 uppercase">PDF Paper</div>
                              ) : (
                                <img src={getFullSrc(pagePath)} alt={`Page ${pIdx + 1}`} className="w-full h-full object-cover rounded" />
                              )}
                              <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center font-bold">
                                Page {pIdx + 1}
                              </span>
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all">
                                <button
                                  type="button"
                                  onClick={() => window.open(getFullSrc(pagePath), '_blank')}
                                  className="bg-white/90 hover:bg-white text-slate-800 p-1 rounded-full shadow"
                                  title="View Full"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const updatedPages = pages.filter((_, i) => i !== pIdx);
                                    const updatedResults = allResults.map(r => {
                                      if (r.studentId === selectedStudent.id && r.book === book.name) {
                                        return {
                                          ...r,
                                          paperPath: updatedPages.join(',')
                                        };
                                      }
                                      return r;
                                    }).filter(r => r.paperPath); // Remove record if no pages left
                                    
                                    setAllResults(updatedResults);
                                    localStorage.setItem('results', JSON.stringify(updatedResults));
                                    window.dispatchEvent(new Event('storage_updated'));
                                  }}
                                  className="bg-rose-500 hover:bg-rose-600 text-white p-1 rounded-full shadow"
                                  title="Remove Page"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        {uploadStatus[book.name] === 'uploading' ? (
                          <div className="text-blue-600 text-sm font-bold animate-pulse flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                            Uploading...
                          </div>
                        ) : (
                          <div className="flex gap-2 w-full">
                            <label className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 transition-all shadow-md">
                              <Upload className="w-3.5 h-3.5" />
                              {pages.length > 0 ? 'Add Another Page' : 'Upload Paper'}
                              <input 
                                type="file" 
                                accept="image/*,.pdf" 
                                className="hidden" 
                                onChange={(e) => handleFileUpload(e, book.name)}
                              />
                            </label>
                            {pages.length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedResults = allResults.filter(r => !(r.studentId === selectedStudent.id && r.book === book.name));
                                  setAllResults(updatedResults);
                                  localStorage.setItem('results', JSON.stringify(updatedResults));
                                  window.dispatchEvent(new Event('storage_updated'));
                                }}
                                className="px-2.5 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition-all text-xs font-bold"
                                title="Clear All Pages"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-slate-500 text-sm">No subjects listed for this class.</p>
                )}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400 font-bold uppercase text-xs tracking-widest">
                Select Student First
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
