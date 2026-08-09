import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, CheckCircle } from 'lucide-react';

const StudentProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState<any>(null);
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        const savedStudents = JSON.parse(localStorage.getItem('students') || '[]');
        const foundStudent = savedStudents.find((s: any) => s.id.toString() === id);
        setStudent(foundStudent);
        setIsVerified(localStorage.getItem(`verified_${id}`) === 'true');
    }, [id]);

    const handleVerify = () => {
        localStorage.setItem(`verified_${id}`, 'true');
        setIsVerified(true);
    };

    if (!student) return <div className="p-8 text-center text-slate-500 font-medium">Student record not found.</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans" dir="ltr">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                <div className="bg-slate-900 p-6 text-white text-center">
                   <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-slate-800 text-4xl overflow-hidden shadow-inner">
                      {student.photo ? <img src={student.photo} alt={student.name} className="w-full h-full rounded-full object-cover" /> : <User size={48} />}
                   </div>
                   <h2 className="text-2xl font-black">{student.name}</h2>
                   <p className="opacity-80 text-sm mt-1">{student.grade} - Roll No: {student.rollNo}</p>
                </div>
                <div className="p-6 space-y-4 text-slate-700">
                    <div className="flex justify-between border-b pb-2 text-sm">
                        <span className="text-slate-500 font-bold">Father's Name:</span>
                        <span className="font-semibold">{student.fatherName}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2 text-sm">
                        <span className="text-slate-500 font-bold">Registration No:</span>
                        <span className="font-mono font-semibold">{student.regNo}</span>
                    </div>
                    
                    {isVerified ? (
                        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-center justify-center gap-2 font-bold mt-6 text-sm">
                            <CheckCircle className="w-5 h-5" /> Verified Profile
                        </div>
                    ) : (
                        <button 
                            onClick={handleVerify}
                            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold mt-6 hover:bg-slate-800 active:scale-95 transition-all text-sm shadow-md"
                        >
                            Sign / Verify Profile
                        </button>
                    )}

                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-bold mt-2 hover:bg-slate-200 transition-colors text-sm"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;
