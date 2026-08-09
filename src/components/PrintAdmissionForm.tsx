import React, { useState, useEffect } from 'react';
import { Printer, ArrowLeft } from 'lucide-react';
import { resolveApiUrl } from '../config';

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
  caste?: string;
  village?: string;
  tehsil?: string;
  postOffice?: string;
  madrasaDetails?: string;
  guardianName?: string;
  guardianPhone?: string;
  education?: string;
  age?: string;
  courses?: string;
  photo?: string;
  fatherCnic?: string;
  isResidential?: boolean | number;
}

interface PrintAdmissionFormProps {
  student: Student;
  onBack: () => void;
}

const CnicBoxes = ({ value = "" }: { value?: string }) => {
  const safeValue = value || "";
  const digits = safeValue.replace(/-/g, '').split('');
  const boxes = new Array(13).fill('');
  digits.forEach((d, i) => { if (i < 13) boxes[i] = d; });
  
  return (
    <div className="boxes-group">
      {boxes.slice(0, 5).map((d, i) => <div key={i} className="digit-box">{d}</div>)}
      <span style={{fontWeight: 'bold', lineHeight: '26px'}}>-</span>
      {boxes.slice(5, 12).map((d, i) => <div key={i+5} className="digit-box">{d}</div>)}
      <span style={{fontWeight: 'bold', lineHeight: '26px'}}>-</span>
      <div className="digit-box">{boxes[12]}</div>
    </div>
  );
};

export default function PrintAdmissionForm({ student, onBack }: PrintAdmissionFormProps) {
  const [systemSettings, setSystemSettings] = useState<any>({});

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('system_settings') || '{}');
      setSystemSettings(saved);
    } catch (e) {
      setSystemSettings({});
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  // Helper to make image URLs dynamic
  const getDynamicUrl = (url: string) => resolveApiUrl(url);

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 flex flex-col items-center admission-form-root">
      <style dangerouslySetInnerHTML={{ __html: `
        .admission-form-root {
            --primary-color: #0f172a;
            --secondary-color: #0284c7;
            --bg-color: #ffffff;
            --text-color: #1e293b;
            --white: #ffffff;
            --border-style: 2px solid var(--primary-color);
        }

        .main-container {
            width: 210mm;
            height: 297mm;
            margin: 0 auto;
            background: var(--bg-color);
            border: 1px solid #ddd;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            box-sizing: border-box;
            position: relative;
            overflow: hidden;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .form-border-outer {
            position: absolute;
            top: 5mm;
            right: 5mm;
            bottom: 5mm;
            left: 5mm;
            border: 2px solid var(--primary-color);
            padding: 1mm;
        }

        .form-border-inner {
            height: 100%;
            border: 1px solid var(--secondary-color);
            padding: 8mm;
            box-sizing: border-box;
            position: relative;
        }

        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 60px;
            font-weight: 800;
            color: rgba(15, 23, 42, 0.04);
            white-space: nowrap;
            pointer-events: none;
            z-index: 0;
            text-transform: uppercase;
        }

        .form-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px double var(--primary-color);
            padding-bottom: 10px;
            margin-bottom: 15px;
            position: relative;
            z-index: 1;
        }

        .institution-header { text-align: center; flex: 1; }
        .institution-header h1 {
            font-size: 1.8em;
            font-weight: 900;
            color: var(--primary-color);
            margin: 0;
            line-height: 1.2;
            text-transform: uppercase;
            letter-spacing: -0.02em;
        }
        .institution-header p {
            margin: 4px 0 0 0;
            font-size: 11px;
            font-weight: 700;
            color: var(--secondary-color);
        }

        .logo-box {
            width: 80px; height: 80px;
            border: 2px solid var(--primary-color);
            border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            background: var(--white);
            overflow: hidden;
        }

        .student-photo-box {
            width: 100px; height: 120px;
            border: 1px solid var(--primary-color);
            background: var(--white);
            display: flex; align-items: center; justify-content: center;
            font-size: 10px; text-align: center; color: #666;
            overflow: hidden;
            position: relative;
            font-weight: 600;
        }

        .form-title-badge {
            background: var(--primary-color);
            color: white;
            padding: 4px 24px;
            border-radius: 4px;
            font-weight: 800;
            display: inline-block;
            margin-top: 8px;
            font-size: 12px;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            border: 1px solid var(--secondary-color);
        }

        .section-header {
            background: #f1f5f9;
            border-left: 4px solid var(--primary-color);
            color: var(--primary-color);
            padding: 6px 12px;
            font-weight: 800;
            margin: 15px 0 10px 0;
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.03em;
        }

        .field-row {
            display: flex; gap: 10px; margin-bottom: 12px; align-items: center;
            font-size: 12px;
        }
        .label {
            font-weight: 700; color: var(--primary-color); min-width: 110px;
        }
        .line-input {
            border-bottom: 1px solid #cbd5e1;
            flex: 1; height: 20px;
            display: flex; align-items: flex-end; padding-bottom: 2px;
            font-weight: 700; color: var(--text-color);
        }

        .boxes-group { display: flex; gap: 3px; direction: ltr; }
        .digit-box {
            width: 22px; height: 22px;
            border: 1px solid #94a3b8;
            background: var(--white);
            display: flex; align-items: center; justify-content: center;
            font-weight: 800; font-family: monospace;
            font-size: 12px;
        }

        .office-box {
            border: 1px solid var(--primary-color);
            padding: 10px;
            border-radius: 6px;
            margin-top: 15px;
            background: #f8fafc;
        }
        .office-title {
            text-align: center; color: var(--primary-color);
            font-weight: 800; margin-bottom: 8px;
            font-size: 12px;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            border-bottom: 1px solid var(--primary-color);
            display: inline-block;
            width: 100%;
            padding-bottom: 4px;
        }

        .agreement {
            font-size: 10px; line-height: 1.5;
            border: 1px solid #e2e8f0;
            padding: 8px; margin: 10px 0; color: #334155;
            background: #fff;
        }

        .sig-area {
            display: flex; justify-content: space-around; margin-top: 25px;
        }
        .sig-line {
            border-top: 1px solid var(--text-color); width: 150px;
            text-align: center; padding-top: 3px; font-weight: 700;
            font-size: 11px;
            text-transform: uppercase;
        }

        @page {
            size: A4;
            margin: 0;
        }

        @media print {
            .no-print { display: none !important; }
            body { background: none; -webkit-print-color-adjust: exact; }
            .main-container { 
                margin: 0; 
                box-shadow: none; 
                border: none;
                width: 210mm;
                height: 297mm;
            }
            .admission-form-root { background: white !important; padding: 0 !important; }
        }

      `}} />

      {/* Controls - Hidden on Print */}
      <div className="w-full max-w-4xl mx-auto mb-8 flex items-center justify-between no-print bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 bg-slate-800 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-slate-900 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to List</span>
        </button>
        
        <button 
          onClick={handlePrint}
          className="bg-emerald-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-xl font-bold text-sm"
        >
          <Printer className="w-4 h-4" />
          <span>Print Form</span>
        </button>
      </div>

      {/* Printable Form */}
      <div className="main-container font-sans" dir="ltr" id="admission-form">
          <div className="watermark">{systemSettings.jamiaName || 'Academic Institute'}</div>
          
          <div className="form-border-outer">
            <div className="form-border-inner">
              {/* Header */}
              <header className="form-header">
                  <div className="logo-box">
                    {systemSettings.monogram ? (
                      <img src={getDynamicUrl(systemSettings.monogram)} alt="Logo" className="w-full h-full object-contain" />
                    ) : <span className="text-[10px] text-slate-400 font-bold">LOGO</span>}
                  </div>
                  <div className="institution-header">
                      <h1>{systemSettings.jamiaName || 'Academic Institute & Educational System'}</h1>
                      <p>Main Campus, Educational Zone Academic Center</p>
                      <div className="form-title-badge">Student Admission Form</div>
                  </div>
                  <div className="student-photo-box">
                    {student.photo ? (
                      <img src={getDynamicUrl(student.photo)} alt="Student" className="w-full h-full object-cover absolute inset-0" />
                    ) : <span className="p-2">Affix Photo Here</span>}
                  </div>
              </header>

              <div style={{display: 'flex', justify: 'space-between', fontWeight: 'bold', marginBottom: '10px', color: 'var(--primary-color)', fontSize: '11px'}}>
                  <span>Form No: <span style={{color: 'var(--text-color)'}}>{student.regNo || student.id || '________'}</span></span>
                  <span>Academic Session: 2026 - 2027</span>
              </div>

              {/* Personal Section */}
              <div className="section-header">
                  <span>Part I: Personal Details</span>
              </div>

              <div className="field-row">
                  <span className="label">Student Name:</span>
                  <div className="line-input text-base">{student.name}</div>
              </div>

              <div className="field-row">
                  <span className="label">Father's Name:</span>
                  <div className="line-input text-base">{student.fatherName}</div>
                  <span className="label" style={{minWidth: '50px'}}>Caste:</span>
                  <div className="line-input">{student.caste || '__________'}</div>
              </div>

              <div className="field-row">
                  <span className="label">CNIC / B-Form:</span>
                  <CnicBoxes value={student.cnic} />
              </div>

              <div className="field-row">
                  <span className="label">Date of Birth:</span>
                  <div className="line-input" style={{flex: 0.4, fontFamily: 'monospace'}}>{student.dob || '__________'}</div>
                  <span className="label" style={{minWidth: '70px'}}>Residence:</span>
                  <div style={{display: 'flex', gap: '15px', fontWeight: 'bold'}}>
                      <label className="flex items-center gap-1"><input type="checkbox" checked={!student.isResidential} readOnly /> Day Scholar</label>
                      <label className="flex items-center gap-1"><input type="checkbox" checked={!!student.isResidential} readOnly /> Hostel / Boarder</label>
                  </div>
              </div>

              {/* Contact Section */}
              <div className="section-header">
                  <span>Part II: Contact Information</span>
              </div>

              <div className="field-row">
                  <span className="label">Full Address:</span>
                  <div className="line-input">{student.currentAddress || student.permanentAddress || '__________'}</div>
              </div>

              <div className="field-row">
                  <span className="label">Tehsil / District:</span>
                  <div className="line-input">{(student.tehsil || '') + (student.tehsil && student.currentDistrict ? ' / ' : '') + (student.currentDistrict || '__________')}</div>
                  <span className="label" style={{minWidth: '80px'}}>Mobile No:</span>
                  <div className="line-input font-mono">{student.phone || '__________'}</div>
              </div>

              {/* Academic Section */}
              <div className="section-header">
                  <span>Part III: Academic Record</span>
              </div>

              <div className="field-row">
                  <span className="label">Previous School:</span>
                  <div className="line-input">{student.education || '__________'}</div>
              </div>

              <div className="field-row">
                  <span className="label">Previous Class:</span>
                  <div className="line-input">__________</div>
                  <span className="label" style={{minWidth: '100px'}}>Applied Grade:</span>
                  <div className="line-input font-bold text-base">{student.grade || '__________'}</div>
              </div>

              {/* Agreement */}
              <div className="agreement">
                  <strong>Declaration:</strong> I hereby solemnly affirm that I will abide by all rules and regulations of the institution and will not engage in any illegal or improper activities. In case of false or misleading information, my admission may be cancelled.
              </div>

              <div className="sig-area">
                  <div className="sig-line">Student Signature</div>
                  <div className="sig-line">Guardian Signature</div>
              </div>

              {/* Office Section */}
              <div className="office-box">
                  <div className="office-title">For Office Use Only</div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                      <div className="field-row"><span className="label">Admission No:</span><div className="line-input">{student.regNo || '__________'}</div></div>
                      <div className="field-row"><span className="label">Admission Date:</span><div className="line-input" style={{fontFamily: 'monospace'}}>{student.admissionDate || '__________'}</div></div>
                      <div className="field-row"><span className="label">Assigned Grade:</span><div className="line-input">{student.grade || '__________'}</div></div>
                      <div className="field-row"><span className="label">Monthly Fee:</span><div className="line-input">__________</div></div>
                  </div>
                  <div style={{textAlign: 'center', marginTop: '12px', fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '11px'}}>
                      Principal Signature & Stamp: ________________________________
                  </div>
              </div>
            </div>
          </div>
      </div>

    </div>
  );
}
