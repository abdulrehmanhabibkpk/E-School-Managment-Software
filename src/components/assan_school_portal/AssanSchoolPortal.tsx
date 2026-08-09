import React, { useState } from 'react';
import { 
  Building, 
  Users, 
  DollarSign, 
  AlertCircle, 
  ArrowRight, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle, 
  Star, 
  ArrowLeft, 
  ChevronDown, 
  Check, 
  Menu, 
  X, 
  Laptop, 
  BookOpen, 
  ShieldCheck, 
  Heart, 
  Send,
  Lock,
  User,
  Eye,
  EyeOff,
  HelpCircle,
  Clock,
  Sparkles,
  Award,
  ThumbsUp,
  MessageCircle,
  Globe,
  GraduationCap,
  Calendar,
  FileText,
  Bell,
  BarChart3,
  CreditCard,
  UserCheck,
  Briefcase,
  Layers,
  ChevronRight,
  Calculator,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function AssanSchoolPortal() {
  const navigate = useNavigate();
  // Navigation active tab: 'home' | 'about' | 'modules' | 'pricing' | 'contacts' | 'register' | 'login' | 'result'
  const [activeTab, setActiveTab] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modulesDropdownOpen, setModulesDropdownOpen] = useState(false);

  const [searchRollNo, setSearchRollNo] = useState('104');
  const [searchClass, setSearchClass] = useState('Grade 7');
  const [searchExam, setSearchExam] = useState('Annual Examination 2026');
  const [foundResult, setFoundResult] = useState(null);
  const [searchError, setSearchError] = useState('');

  const sampleResultsDatabase = {
    '104': {
      rollNo: '104',
      name: 'Muhammad Ali',
      fatherName: 'Tariq Mahmood',
      class: 'Grade 7-A',
      regNo: 'ASH-2024-8891',
      exam: 'Annual Examination 2026',
      totalMarks: 500,
      obtainedMarks: 448,
      percentage: '89.6%',
      grade: 'A+',
      position: '2nd in Class',
      status: 'PASS',
      remarks: 'Excellent Academic Performance',
      subjects: [
        { name: 'Mathematics', maxMarks: 100, passMarks: 33, obtained: 92, grade: 'A+' },
        { name: 'Science', maxMarks: 100, passMarks: 33, obtained: 88, grade: 'A+' },
        { name: 'English', maxMarks: 100, passMarks: 33, obtained: 85, grade: 'A' },
        { name: 'Urdu', maxMarks: 100, passMarks: 33, obtained: 91, grade: 'A+' },
        { name: 'Computer Studies', maxMarks: 100, passMarks: 33, obtained: 92, grade: 'A+' },
      ]
    },
    '102': {
      rollNo: '102',
      name: 'Sana Fatima',
      fatherName: 'Muhammad Rashid',
      class: 'Grade 7-A',
      regNo: 'ASH-2024-8875',
      exam: 'Annual Examination 2026',
      totalMarks: 500,
      obtainedMarks: 472,
      percentage: '94.4%',
      grade: 'A+',
      position: '1st in Class (Topper)',
      status: 'PASS',
      remarks: 'Outstanding Achievement - Class Topper',
      subjects: [
        { name: 'Mathematics', maxMarks: 100, passMarks: 33, obtained: 98, grade: 'A+' },
        { name: 'Science', maxMarks: 100, passMarks: 33, obtained: 95, grade: 'A+' },
        { name: 'English', maxMarks: 100, passMarks: 33, obtained: 92, grade: 'A+' },
        { name: 'Urdu', maxMarks: 100, passMarks: 33, obtained: 93, grade: 'A+' },
        { name: 'Computer Studies', maxMarks: 100, passMarks: 33, obtained: 94, grade: 'A+' },
      ]
    },
    '105': {
      rollNo: '105',
      name: 'Zubair Ahmed',
      fatherName: 'Ahmed Raza',
      class: 'Grade 7-A',
      regNo: 'ASH-2024-8902',
      exam: 'Annual Examination 2026',
      totalMarks: 500,
      obtainedMarks: 365,
      percentage: '73.0%',
      grade: 'B',
      position: '12th in Class',
      status: 'PASS',
      remarks: 'Good Effort - Promoted to Next Grade',
      subjects: [
        { name: 'Mathematics', maxMarks: 100, passMarks: 33, obtained: 68, grade: 'B' },
        { name: 'Science', maxMarks: 100, passMarks: 33, obtained: 74, grade: 'B' },
        { name: 'English', maxMarks: 100, passMarks: 33, obtained: 70, grade: 'B' },
        { name: 'Urdu', maxMarks: 100, passMarks: 33, obtained: 78, grade: 'A' },
        { name: 'Computer Studies', maxMarks: 100, passMarks: 33, obtained: 75, grade: 'B' },
      ]
    }
  };

  const handleSearchResult = (rollToSearch = searchRollNo) => {
    const trimmed = rollToSearch.toString().trim();
    if (!trimmed) {
      setSearchError('براہ کرم رول نمبر درج کریں۔ (Please enter a Roll Number)');
      setFoundResult(null);
      return;
    }
    
    if (sampleResultsDatabase[trimmed]) {
      setFoundResult(sampleResultsDatabase[trimmed]);
      setSearchError('');
      showToast(`Result found for Roll No: ${trimmed}`, 'success');
    } else {
      const obtained = Math.floor(Math.random() * (460 - 330 + 1)) + 330;
      const genResult = {
        rollNo: trimmed,
        name: `Student (Roll #${trimmed})`,
        fatherName: 'Guardian Name',
        class: searchClass,
        regNo: `ASH-2026-${trimmed}`,
        exam: searchExam,
        totalMarks: 500,
        obtainedMarks: obtained,
        percentage: `${((obtained / 500) * 100).toFixed(1)}%`,
        grade: obtained > 420 ? 'A+' : obtained > 370 ? 'A' : 'B',
        position: 'Pass Rank',
        status: 'PASS',
        remarks: 'Promoted to Next Class',
        subjects: [
          { name: 'Mathematics', maxMarks: 100, passMarks: 33, obtained: Math.min(100, Math.floor(obtained * 0.22)), grade: 'A' },
          { name: 'Science', maxMarks: 100, passMarks: 33, obtained: Math.min(100, Math.floor(obtained * 0.20)), grade: 'A' },
          { name: 'English', maxMarks: 100, passMarks: 33, obtained: Math.min(100, Math.floor(obtained * 0.18)), grade: 'B' },
          { name: 'Urdu', maxMarks: 100, passMarks: 33, obtained: Math.min(100, Math.floor(obtained * 0.20)), grade: 'A' },
          { name: 'Computer Studies', maxMarks: 100, passMarks: 33, obtained: Math.min(100, Math.floor(obtained * 0.20)), grade: 'A' },
        ]
      };
      setFoundResult(genResult);
      setSearchError('');
      showToast(`Result loaded for Roll No: ${trimmed}`, 'info');
    }
  };

  const [currentUser, setCurrentUser] = useState(null);
  const [loginRole, setLoginRole] = useState('principal'); // 'principal' | 'teacher' | 'parent'
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [regSchoolName, setRegSchoolName] = useState('');
  const [regPrincipalName, setRegPrincipalName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCity, setRegCity] = useState('Lahore');
  const [regStudentCount, setRegStudentCount] = useState('250-500');
  const [regSuccess, setRegSuccess] = useState(false);

  const [contactName, setContactName] = useState('');
  const [contactSchool, setContactSchool] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState([
    { sender: 'agent', text: 'Welcome to Assan School Portal! How can we help automate your school operations today?', time: 'Just now' }
  ]);

  const [demoTab, setDemoTab] = useState('voucher'); // 'voucher' | 'report' | 'attendance'
  const [calcStudents, setCalcStudents] = useState(300);
  const [calcPlan, setCalcPlan] = useState('standard'); // 'basic' | 'standard' | 'premium'

  const handleLogin = (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError('Please provide both username/email and password.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const userObj = {
        name: loginRole === 'principal' ? 'Prof. Tariq Mahmood' : loginRole === 'teacher' ? 'Ms. Ayesha Khan' : 'Mr. Shahid Iqbal (Parent)',
        role: loginRole === 'principal' ? 'Principal / Director' : loginRole === 'teacher' ? 'Class Teacher (7-A)' : 'Parent (Student: Hamza Shahid)',
        school: 'Al-Huda Model High School',
        email: loginEmail
      };
      setCurrentUser(userObj);
      showToast(`Welcome back, ${userObj.name}!`, 'success');
      setLoginError('');
    }, 1000);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!regSchoolName || !regPrincipalName || !regPhone) {
      showToast('Please fill in required fields.', 'error');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setRegSuccess(true);
      showToast('School Registration Submitted Successfully! Our consultant will contact you.', 'success');
    }, 1000);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactName || !contactPhone) {
      showToast('Please enter your name and phone number.', 'error');
      return;
    }
    setContactSubmitted(true);
    showToast('Inquiry sent! Our representative will call you shortly.', 'success');
  };

  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatLog((prev) => [...prev, { sender: 'user', text: userMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setChatInput('');

    setTimeout(() => {
      let reply = "Thank you for reaching out! Assan School Portal offers complete student records, fee vouchers with WhatsApp auto-alerts, report cards, and biometric staff attendance. Call us at +92 321 4567890 for a live campus demo!";
      if (userMsg.toLowerCase().includes('fee') || userMsg.toLowerCase().includes('price')) {
        reply = "Our plans start as low as PKR 12 per student per month with full feature support! Would you like a custom quote for your school?";
      }
      setChatLog((prev) => [...prev, { sender: 'agent', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1100);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col justify-between selection:bg-[#1b8755]/20 selection:text-[#1b8755]">
      
      {}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-5 right-5 z-50 px-6 py-3.5 rounded-xl shadow-2xl font-bold text-sm flex items-center space-x-3 text-white ${toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`}
          >
            {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <div className="bg-[#151515] text-white text-[11px] sm:text-xs py-2 px-4 flex justify-between items-center border-b border-emerald-900/40">
        <div className="flex items-center space-x-3 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center space-x-2">
            <span className="bg-[#a1d044] text-[#151515] px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">NEW</span>
            <span className="truncate font-medium">WhatsApp Auto-Fee Alerts & SMS Gateway Standard in 2026 Edition!</span>
          </div>
          <div className="hidden md:flex items-center space-x-6 text-gray-300 font-medium">
            <a href="tel:+923214567890" className="hover:text-[#a1d044] flex items-center space-x-1 transition-colors">
              <Phone className="w-3.5 h-3.5" />
              <span>+92 321 4567890</span>
            </a>
            <span className="text-gray-600">|</span>
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-[#a1d044]" />
              <span>Lahore | Faisalabad | Islamabad | Karachi</span>
            </span>
          </div>
        </div>
      </div>

      {}
      <nav className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo */}
            <div 
              className="flex items-center space-x-3 cursor-pointer group" 
              onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-600/30 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div className="text-left leading-tight">
                <span className="block text-xl font-black text-slate-800 tracking-tight">Assan <span className="text-emerald-600">School</span></span>
                <span className="block text-[10px] text-emerald-700 font-extrabold uppercase tracking-widest">
                  School Management Made Easy
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-8 font-bold text-sm text-slate-700">
              <button 
                onClick={() => setActiveTab('home')}
                className={`transition-colors hover:text-emerald-600 ${activeTab === 'home' ? 'text-emerald-600 border-b-2 border-emerald-600 py-1' : ''}`}
              >
                Home
              </button>
              <button 
                onClick={() => setActiveTab('about')}
                className={`transition-colors hover:text-emerald-600 ${activeTab === 'about' ? 'text-emerald-600 border-b-2 border-emerald-600 py-1' : ''}`}
              >
                About Us
              </button>

              {/* Online Result Portal Tab */}
              <button 
                onClick={() => setActiveTab('result')}
                className={`transition-colors hover:text-emerald-600 flex items-center space-x-1.5 ${activeTab === 'result' ? 'text-emerald-600 border-b-2 border-emerald-600 py-1' : ''}`}
              >
                <Search className="w-4 h-4 text-emerald-600" />
                <span>Check Result (آن لائن رزلٹ)</span>
              </button>
              
              {/* Modules Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setModulesDropdownOpen(!modulesDropdownOpen)}
                  onMouseEnter={() => setModulesDropdownOpen(true)}
                  className="flex items-center space-x-1 transition-colors hover:text-emerald-600 text-slate-700 py-1"
                >
                  <span>School Modules</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {modulesDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      onMouseLeave={() => setModulesDropdownOpen(false)}
                      className="absolute left-0 mt-2 w-64 bg-white border border-slate-100 rounded-xl shadow-2xl py-2 z-50 font-semibold text-xs text-slate-700"
                    >
                      <button 
                        onClick={() => { setActiveTab('modules'); setModulesDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 hover:text-emerald-700 flex items-center space-x-3 transition-colors"
                      >
                        <Users className="w-4 h-4 text-emerald-600" />
                        <span>Student SIS & Admissions</span>
                      </button>
                      <button 
                        onClick={() => { setActiveTab('modules'); setModulesDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 hover:text-emerald-700 flex items-center space-x-3 transition-colors"
                      >
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                        <span>Auto Fee Vouchers & WhatsApp</span>
                      </button>
                      <button 
                        onClick={() => { setActiveTab('modules'); setModulesDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 hover:text-emerald-700 flex items-center space-x-3 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <span>Exams & Report Cards</span>
                      </button>
                      <button 
                        onClick={() => { setActiveTab('modules'); setModulesDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 hover:text-emerald-700 flex items-center space-x-3 transition-colors"
                      >
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span>Biometric Attendance & Leave</span>
                      </button>
                      <button 
                        onClick={() => { setActiveTab('modules'); setModulesDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 hover:text-emerald-700 flex items-center space-x-3 transition-colors"
                      >
                        <Briefcase className="w-4 h-4 text-emerald-600" />
                        <span>Staff Payroll & Accounts</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button 
                onClick={() => setActiveTab('pricing')}
                className={`transition-colors hover:text-emerald-600 ${activeTab === 'pricing' ? 'text-emerald-600 border-b-2 border-emerald-600 py-1' : ''}`}
              >
                Pricing Plans
              </button>
              <button 
                onClick={() => setActiveTab('contacts')}
                className={`transition-colors hover:text-emerald-600 ${activeTab === 'contacts' ? 'text-emerald-600 border-b-2 border-emerald-600 py-1' : ''}`}
              >
                Contact
              </button>
            </div>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center space-x-3">
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-3.5 py-2.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all border border-emerald-200 shadow-sm"
                title="Go to Admin Management Dashboard"
              >
                <Laptop className="w-4 h-4 text-emerald-600" />
                <span>ERP Dashboard</span>
              </button>

              {currentUser ? (
                <div className="flex items-center space-x-3 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl">
                  <User className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold text-emerald-900">{currentUser.name}</span>
                  <button 
                    onClick={() => { setCurrentUser(null); showToast('Logged out successfully', 'info'); }}
                    className="text-[11px] text-rose-600 hover:underline font-bold ml-2"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => setActiveTab('login')}
                    className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${activeTab === 'login' ? 'text-emerald-700 bg-emerald-100' : 'text-slate-700 hover:bg-slate-100'}`}
                  >
                    Portal Login
                  </button>
                  <button 
                    onClick={() => setActiveTab('register')}
                    className="px-5 py-3 bg-[#151515] hover:bg-emerald-700 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                  >
                    <span>Register School</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Mobile Hamburger Menu Button */}
            <div className="flex lg:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-700 hover:text-emerald-600 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-slate-100 font-bold text-sm text-slate-700"
            >
              <div className="px-4 py-4 space-y-3">
                <button onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }} className="w-full text-left py-2 border-b border-slate-50 block">Home</button>
                <button onClick={() => { setActiveTab('result'); setMobileMenuOpen(false); }} className="w-full text-left py-2 border-b border-slate-50 text-emerald-700 font-extrabold flex items-center justify-between">
                  <span>Check Result by Roll No (آن لائن رزلٹ)</span>
                  <Search className="w-4 h-4" />
                </button>
                <button onClick={() => { setActiveTab('about'); setMobileMenuOpen(false); }} className="w-full text-left py-2 border-b border-slate-50 block">About Us</button>
                <button onClick={() => { setActiveTab('modules'); setMobileMenuOpen(false); }} className="w-full text-left py-2 border-b border-slate-50 block">Modules & Features</button>
                <button onClick={() => { setActiveTab('pricing'); setMobileMenuOpen(false); }} className="w-full text-left py-2 border-b border-slate-50 block">Pricing Plans</button>
                <button onClick={() => { setActiveTab('contacts'); setMobileMenuOpen(false); }} className="w-full text-left py-2 border-b border-slate-50 block">Contact Us</button>
                
                <div className="pt-3 flex flex-col gap-2">
                  <button 
                    onClick={() => { setActiveTab('login'); setMobileMenuOpen(false); }}
                    className="w-full py-2.5 text-center text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl text-xs"
                  >
                    Portal Login
                  </button>
                  <button 
                    onClick={() => { setActiveTab('register'); setMobileMenuOpen(false); }}
                    className="w-full py-3 text-center text-white bg-[#151515] hover:bg-emerald-700 rounded-xl text-xs uppercase tracking-wider"
                  >
                    Register School Now
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {}
      <main className="flex-1">

        {/* ==================== VIEW 1: HOME ==================== */}
        {activeTab === 'home' && (
          <div className="space-y-16">

            {/* HERO SECTION */}
            <section className="relative overflow-hidden bg-white py-12 lg:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#a1d044]/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
                
                {/* Hero Left Text */}
                <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
                  <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-900 text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-emerald-200">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pakistan's #1 All-In-One School ERP</span>
                  </div>

                  <div className="space-y-2">
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-none text-slate-900">
                      School Management
                    </h1>
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-none text-emerald-600">
                      Made Effortless!
                    </h1>
                  </div>

                  <p className="text-base sm:text-lg text-slate-600 font-semibold max-w-xl leading-relaxed mx-auto lg:mx-0">
                    Manage student admissions, automated fee vouchers with WhatsApp alerts, exam marksheet printing, biometric staff attendance, and parent mobile notifications in one effortless cloud software.
                  </p>

                  <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 pt-2">
                    <button 
                      onClick={() => setActiveTab('result')}
                      className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center space-x-3"
                    >
                      <Search className="w-4 h-4" />
                      <span>Check Online Result (رول نمبر)</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('register')}
                      className="w-full sm:w-auto px-8 py-4 bg-[#151515] hover:bg-emerald-700 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center space-x-2"
                    >
                      <span>Book Free Campus Demo</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Hero Right Interactive Live Demo Widget */}
                <div className="lg:col-span-6 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase">LIVE SOFTWARE PREVIEW</span>
                  </div>

                  {/* Interactive Switcher */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-2xl text-xs font-bold text-center">
                    <button 
                      onClick={() => setDemoTab('voucher')} 
                      className={`py-2 rounded-xl transition-all ${demoTab === 'voucher' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                      Fee Voucher
                    </button>
                    <button 
                      onClick={() => setDemoTab('report')} 
                      className={`py-2 rounded-xl transition-all ${demoTab === 'report' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                      Report Card
                    </button>
                    <button 
                      onClick={() => setDemoTab('attendance')} 
                      className={`py-2 rounded-xl transition-all ${demoTab === 'attendance' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                      Attendance
                    </button>
                  </div>

                  {/* Dynamic Preview Content */}
                  {demoTab === 'voucher' && (
                    <div className="bg-white text-slate-800 rounded-2xl p-5 space-y-4 shadow-inner">
                      <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900">Al-Huda Model School</h4>
                          <span className="text-[10px] text-slate-500 font-bold block">FEE CHALLAN VOUCHER (MARCH 2026)</span>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded uppercase">PAID</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                        <div><span className="text-slate-400 block text-[10px]">Student:</span> Muhammad Ali</div>
                        <div><span className="text-slate-400 block text-[10px]">Roll No:</span> 104 (Grade 7-A)</div>
                        <div><span className="text-slate-400 block text-[10px]">Tuition Fee:</span> PKR 4,000</div>
                        <div><span className="text-slate-400 block text-[10px]">Transport:</span> PKR 500</div>
                      </div>
                      <button 
                        onClick={() => showToast('Fee Voucher sent to parent via WhatsApp!', 'success')}
                        className="w-full py-2.5 bg-[#1b8755] hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send WhatsApp Fee Alert</span>
                      </button>
                    </div>
                  )}

                  {demoTab === 'report' && (
                    <div className="bg-white text-slate-800 rounded-2xl p-5 space-y-4 shadow-inner">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <h4 className="font-extrabold text-sm text-slate-900">Annual Marksheet 2026</h4>
                        <span className="text-emerald-700 font-black text-xs font-mono">Rank: 2nd</span>
                      </div>
                      <div className="space-y-1.5 text-xs font-bold">
                        <div className="flex justify-between p-1.5 bg-slate-50 rounded"><span>Mathematics</span><span className="text-emerald-700 font-mono">92 / 100</span></div>
                        <div className="flex justify-between p-1.5 bg-slate-50 rounded"><span>Science</span><span className="text-emerald-700 font-mono">88 / 100</span></div>
                        <div className="flex justify-between p-1.5 bg-slate-50 rounded"><span>Computer Studies</span><span className="text-emerald-700 font-mono">92 / 100</span></div>
                      </div>
                      <button 
                        onClick={() => setActiveTab('result')}
                        className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Open Online Result Search</span>
                      </button>
                    </div>
                  )}

                  {demoTab === 'attendance' && (
                    <div className="bg-white text-slate-800 rounded-2xl p-5 space-y-4 shadow-inner text-center">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto font-bold">
                        <UserCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm">Biometric & Mobile Attendance Sync</h4>
                        <p className="text-xs text-slate-500 font-medium mt-1">When students scan ID at school gate, instant SMS & WhatsApp alerts trigger to parents!</p>
                      </div>
                      <button 
                        onClick={() => showToast('Simulated Gate Punch: Student present alert dispatched!', 'info')}
                        className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl"
                      >
                        Simulate Gate Punch Scan
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </section>

            {}
            <section className="bg-gradient-to-b from-emerald-500/10 via-white to-white py-16 px-4 sm:px-6 lg:px-8 border-y border-emerald-500/20">
              <div className="max-w-7xl mx-auto space-y-12">
                <div className="text-center space-y-2">
                  <span className="text-xs uppercase font-black tracking-widest text-emerald-700 block">OUR CORE SERVICES</span>
                  <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
                    COMPLETE SCHOOL MODULES
                  </h2>
                  <div className="w-20 h-1.5 bg-emerald-500 mx-auto rounded-full mt-3"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="p-8 bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl space-y-4 shadow-sm hover:shadow-xl transition-all">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold">
                      <Users className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900">1. Admissions & Student SIS</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Maintain complete student bio data, family details, previous school records, document attachments, and GR register numbers effortlessly.
                    </p>
                  </div>

                  <div className="p-8 bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl space-y-4 shadow-sm hover:shadow-xl transition-all">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900">2. Fee Vouchers & WhatsApp</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Auto-generate monthly tuition vouchers, late fee fines, transport fees, and auto-send WhatsApp reminder alerts directly to parents.
                    </p>
                  </div>

                  <div className="p-8 bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl space-y-4 shadow-sm hover:shadow-xl transition-all">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900">3. Exam Engine & Report Cards</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Manage term exams, subject weightages, grading rules, auto-calculate position ranks, and print professional graphic report cards.
                    </p>
                  </div>

                  <div className="p-8 bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl space-y-4 shadow-sm hover:shadow-xl transition-all">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900">4. Biometric & Mobile Attendance</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Connect RFID card readers or biometric machines for automatic daily student and teacher attendance with instant leave application tracking.
                    </p>
                  </div>

                  <div className="p-8 bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl space-y-4 shadow-sm hover:shadow-xl transition-all">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold">
                      <Bell className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900">5. Parent App & SMS Portal</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Empower parents with mobile app access to view daily homework, exam schedules, teacher notices, and fee receipt history in real-time.
                    </p>
                  </div>

                  <div className="p-8 bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl space-y-4 shadow-sm hover:shadow-xl transition-all">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900">6. Staff HR, Payroll & Accounts</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Manage teacher salary slips, allowances, deductions, general ledger accounts, cash flow, and annual audit reports with zero stress.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-[#151515] text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden space-y-8">
                <div className="max-w-2xl space-y-2">
                  <span className="text-xs font-black uppercase text-[#a1d044] tracking-widest">Instant Cost Estimator</span>
                  <h2 className="text-3xl sm:text-4xl font-black">How Much Does Assan School Cost?</h2>
                  <p className="text-xs sm:text-sm text-gray-300">Adjust the student slider below to calculate your school's custom plan.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-900 p-6 rounded-2xl border border-slate-800">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span>Total Enrolled Students:</span>
                        <span className="text-[#a1d044] font-mono text-base">{calcStudents} Students</span>
                      </div>
                      <input 
                        type="range" 
                        min="50" 
                        max="2000" 
                        step="50"
                        value={calcStudents}
                        onChange={(e) => setCalcStudents(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-400">Select Software Edition:</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button 
                          onClick={() => setCalcPlan('basic')}
                          className={`py-2 text-xs font-bold rounded-lg border transition-all ${calcPlan === 'basic' ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700 text-gray-400 hover:border-slate-500'}`}
                        >
                          Basic
                        </button>
                        <button 
                          onClick={() => setCalcPlan('standard')}
                          className={`py-2 text-xs font-bold rounded-lg border transition-all ${calcPlan === 'standard' ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700 text-gray-400 hover:border-slate-500'}`}
                        >
                          Standard
                        </button>
                        <button 
                          onClick={() => setCalcPlan('premium')}
                          className={`py-2 text-xs font-bold rounded-lg border transition-all ${calcPlan === 'premium' ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700 text-gray-400 hover:border-slate-500'}`}
                        >
                          Premium
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-4">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Estimated Monthly Investment</span>
                    <div className="text-4xl font-black text-[#a1d044] font-mono">
                      PKR {(calcStudents * (calcPlan === 'basic' ? 12 : calcPlan === 'standard' ? 18 : 25)).toLocaleString()}
                      <span className="text-xs text-gray-400 font-sans font-normal block mt-1">/ month (~PKR {calcPlan === 'basic' ? 12 : calcPlan === 'standard' ? 18 : 25} per student)</span>
                    </div>
                    <button 
                      onClick={() => setActiveTab('register')}
                      className="w-full py-3 bg-[#a1d044] hover:bg-lime-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-colors"
                    >
                      Claim 14-Day Free Trial
                    </button>
                  </div>
                </div>
              </div>
            </section>

          </div>
        )}

        {}
        {activeTab === 'result' && (
          <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-emerald-800 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden text-center space-y-3 border border-emerald-700/50">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto border border-emerald-400/30 text-emerald-300">
                <Search className="w-8 h-8" />
              </div>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-black px-4 py-1 rounded-full uppercase tracking-widest border border-emerald-500/30 inline-block">
                Online Exam Portal 2026
              </span>
              <h1 className="text-3xl sm:text-4xl font-black">آن لائن امتحان رزلٹ پورٹل</h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-medium">
                Enter student Roll Number below to view and download official annual examination marksheets and subject grades.
              </p>
            </div>

            {/* Roll Number Search Box Card */}
            <div className="bg-white border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <form onSubmit={(e) => { e.preventDefault(); handleSearchResult(); }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Select Class / کلاس:</label>
                    <select 
                      value={searchClass} 
                      onChange={(e) => setSearchClass(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="Grade 5">Grade 5 (پنجم)</option>
                      <option value="Grade 6">Grade 6 (ششم)</option>
                      <option value="Grade 7">Grade 7 (ہفتم)</option>
                      <option value="Grade 8">Grade 8 (ہشتم)</option>
                      <option value="Grade 9">Grade 9 (نہـم)</option>
                      <option value="Grade 10">Grade 10 (دہـم)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Exam Term / امتحان:</label>
                    <select 
                      value={searchExam} 
                      onChange={(e) => setSearchExam(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="Annual Examination 2026">Annual Examination 2026</option>
                      <option value="Mid-Term Exam 2026">Mid-Term Exam 2026</option>
                      <option value="1st Term Exam 2026">1st Term Exam 2026</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Enter Roll No / رول نمبر:</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={searchRollNo}
                        onChange={(e) => setSearchRollNo(e.target.value)}
                        placeholder="e.g. 104"
                        className="w-full p-3 border-2 border-emerald-500 rounded-xl text-xs font-black text-slate-900 bg-emerald-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-600 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {searchError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-center">
                    {searchError}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
                    <span>Quick Test:</span>
                    <button 
                      type="button" 
                      onClick={() => { setSearchRollNo('104'); handleSearchResult('104'); }} 
                      className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 text-emerald-800 rounded-lg transition-colors"
                    >
                      Roll #104 (Ali)
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setSearchRollNo('102'); handleSearchResult('102'); }} 
                      className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 text-emerald-800 rounded-lg transition-colors"
                    >
                      Roll #102 (Sana)
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setSearchRollNo('105'); handleSearchResult('105'); }} 
                      className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 text-emerald-800 rounded-lg transition-colors"
                    >
                      Roll #105 (Zubair)
                    </button>
                  </div>

                  <button 
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search Result / رزلٹ معلوم کریں</span>
                  </button>
                </div>
              </form>
            </div>

            {/* MARKSHEET CARD RESULT DISPLAY */}
            {foundResult && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-2 border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden"
              >
                {/* Official Crest Header */}
                <div className="border-b-2 border-slate-900 pb-6 text-center space-y-2 relative">
                  <div className="flex justify-between items-center text-[11px] font-mono font-bold text-slate-500 mb-2">
                    <span>REG: {foundResult.regNo}</span>
                    <span className="bg-emerald-100 text-emerald-800 px-3 py-0.5 rounded-full uppercase">{foundResult.exam}</span>
                  </div>
                  <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
                    <GraduationCap className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">AL-HUDA MODEL HIGH SCHOOL</h2>
                  <p className="text-xs font-bold text-slate-600">OFFICIAL STATEMENT OF MARKS (امتحانی رزلٹ کارڈ)</p>
                </div>

                {/* Student Bio Info Grid */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold">
                  <div>
                    <span className="text-slate-400 block uppercase text-[10px]">Student Name:</span>
                    <span className="font-extrabold text-slate-900 text-sm">{foundResult.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase text-[10px]">Father Name:</span>
                    <span className="font-bold text-slate-800">{foundResult.fatherName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase text-[10px]">Roll Number:</span>
                    <span className="font-mono font-black text-emerald-700 text-sm">{foundResult.rollNo}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase text-[10px]">Class & Section:</span>
                    <span className="font-bold text-slate-800">{foundResult.class}</span>
                  </div>
                </div>

                {/* Subject Wise Marks Table */}
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-3.5">Subject</th>
                        <th className="p-3.5 text-center">Max Marks</th>
                        <th className="p-3.5 text-center">Passing</th>
                        <th className="p-3.5 text-center">Obtained Marks</th>
                        <th className="p-3.5 text-center">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                      {foundResult.subjects.map((sub, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3.5 font-bold text-slate-900">{sub.name}</td>
                          <td className="p-3.5 text-center font-mono">{sub.maxMarks}</td>
                          <td className="p-3.5 text-center font-mono text-slate-500">{sub.passMarks}</td>
                          <td className="p-3.5 text-center font-mono font-black text-slate-900">{sub.obtained}</td>
                          <td className="p-3.5 text-center font-bold">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">{sub.grade}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Marksheet Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Total Marks</span>
                    <span className="text-2xl font-black text-emerald-900 font-mono">{foundResult.obtainedMarks} / {foundResult.totalMarks}</span>
                  </div>

                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Percentage</span>
                    <span className="text-2xl font-black text-emerald-900 font-mono">{foundResult.percentage}</span>
                  </div>

                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Overall Grade</span>
                    <span className="text-2xl font-black text-emerald-900 font-mono">{foundResult.grade}</span>
                  </div>

                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Position / Status</span>
                    <span className="text-xs font-black text-emerald-900 block mt-1">{foundResult.position}</span>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-200/80 px-2 py-0.5 rounded mt-1 inline-block">{foundResult.status}</span>
                  </div>
                </div>

                {/* Remarks & Signatures */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                  <div>
                    <span className="font-bold text-slate-500">Principal Remarks: </span>
                    <span className="font-extrabold text-slate-900">"{foundResult.remarks}"</span>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Print Marksheet</span>
                    </button>
                    <button 
                      onClick={() => showToast('Result shared to registered phone via WhatsApp!', 'success')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5"
                    >
                      <Send className="w-4 h-4" />
                      <span>WhatsApp to Parent</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {}
        {activeTab === 'about' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-700">About Assan School Software</span>
              <h1 className="text-4xl sm:text-5xl font-black text-slate-900">Empowering Pakistani Schools With Modern Cloud Technology</h1>
              <p className="text-slate-600 font-medium text-sm leading-relaxed">
                Founded with a vision to eliminate manual ledger books and complicated Excel sheets, Assan School System is crafted specifically for educational institutes, school chains, and colleges.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 bg-white border border-slate-200 rounded-2xl space-y-3 text-center shadow-sm">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="font-black text-lg text-slate-900">550+ Campuses</h3>
                <p className="text-xs text-slate-600">Active deployment across Lahore, Faisalabad, Gujranwala, Rawalpindi, Peshawar, and Karachi.</p>
              </div>

              <div className="p-8 bg-white border border-slate-200 rounded-2xl space-y-3 text-center shadow-sm">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-black text-lg text-slate-900">100% Data Security</h3>
                <p className="text-xs text-slate-600">Encrypted cloud backups ensured daily so your student grades and fee records remain safe forever.</p>
              </div>

              <div className="p-8 bg-white border border-slate-200 rounded-2xl space-y-3 text-center shadow-sm">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="font-black text-lg text-slate-900">Dedicated Support</h3>
                <p className="text-xs text-slate-600">Our support team assists your school staff via phone and WhatsApp 24/7 whenever you need help.</p>
              </div>
            </div>
          </div>
        )}

        {}
        {activeTab === 'modules' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs font-black uppercase text-emerald-700 tracking-widest">Complete Feature Index</span>
              <h1 className="text-4xl font-black text-slate-900">School ERP System Modules</h1>
            </div>

            <div className="space-y-6">
              {[
                { title: 'Student Management & GR Register', desc: 'Maintain student profiles, parent CNIC, guardian contact, class transfer, roll call generation, and leaving certificate (SLC) printing with one click.', icon: Users },
                { title: 'Automated Fee Management & Challan Printing', desc: 'Customizable fee structures per class, transport charges, fine rules, multi-child discount management, and 3-copy bank voucher printing.', icon: CreditCard },
                { title: 'Examination, Result & Position Ranking', desc: 'Subject marks entry by class teachers, grade scaling, auto-generation of position ranks (1st, 2nd, 3rd), and parent signature mark sheets.', icon: FileText },
                { title: 'Biometric Attendance & Leave Portal', desc: 'Syncs with biometric thumb scanners or RFID cards. Automatic SMS dispatch to parents when student is absent or late.', icon: UserCheck },
                { title: 'Staff Payroll & HR Ledger', desc: 'Teacher attendance records, monthly salary generation, advances/loans tracking, and direct bank payroll transfer vouchers.', icon: Briefcase }
              ].map((m, idx) => (
                <div key={idx} className="p-6 bg-white border border-slate-200 rounded-2xl flex items-start space-x-5 shadow-sm">
                  <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
                    <m.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900 mb-1">{m.title}</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {}
        {activeTab === 'pricing' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs font-black uppercase text-emerald-700 tracking-widest">Transparent Monthly Pricing</span>
              <h1 className="text-4xl font-black text-slate-900">Simple Rates For Every School Size</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 bg-white border border-slate-200 rounded-3xl space-y-6 shadow-sm hover:shadow-xl transition-all">
                <h3 className="font-extrabold text-xl text-slate-900">Primary / Small School</h3>
                <div className="text-3xl font-black text-emerald-600 font-mono">
                  PKR 12 <span className="text-xs text-slate-500 font-normal">/ student / month</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-600 font-medium">
                  <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-emerald-600" /><span>Up to 250 Students</span></li>
                  <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-emerald-600" /><span>Student SIS & Admissions</span></li>
                  <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-emerald-600" /><span>Fee Voucher Printing</span></li>
                  <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-emerald-600" /><span>Basic Exam Marksheets</span></li>
                </ul>
                <button onClick={() => setActiveTab('register')} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl text-xs uppercase">Choose Plan</button>
              </div>

              <div className="p-8 bg-white border-2 border-emerald-500 rounded-3xl space-y-6 shadow-xl relative">
                <span className="absolute -top-3 right-6 bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">MOST POPULAR</span>
                <h3 className="font-extrabold text-xl text-slate-900">Standard High School</h3>
                <div className="text-3xl font-black text-emerald-600 font-mono">
                  PKR 18 <span className="text-xs text-slate-500 font-normal">/ student / month</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-600 font-medium">
                  <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-emerald-600" /><span>Up to 750 Students</span></li>
                  <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-emerald-600" /><span>WhatsApp Auto Fee Alerts</span></li>
                  <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-emerald-600" /><span>Biometric Attendance Sync</span></li>
                  <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-emerald-600" /><span>Parent Mobile App Portal</span></li>
                </ul>
                <button onClick={() => setActiveTab('register')} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl text-xs uppercase">Choose Plan</button>
              </div>

              <div className="p-8 bg-white border border-slate-200 rounded-3xl space-y-6 shadow-sm hover:shadow-xl transition-all">
                <h3 className="font-extrabold text-xl text-slate-900">School Chain Network</h3>
                <div className="text-3xl font-black text-emerald-600 font-mono">
                  Custom <span className="text-xs text-slate-500 font-normal">/ multi-campus</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-600 font-medium">
                  <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-emerald-600" /><span>Unlimited Students & Campuses</span></li>
                  <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-emerald-600" /><span>Centralized Director Dashboard</span></li>
                  <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-emerald-600" /><span>Custom Domain & Branding</span></li>
                  <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-emerald-600" /><span>Dedicated Account Manager</span></li>
                </ul>
                <button onClick={() => setActiveTab('contacts')} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl text-xs uppercase">Contact Sales</button>
              </div>
            </div>
          </div>
        )}

        {}
        {activeTab === 'contacts' && (
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-xl space-y-8">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-black text-slate-900">Contact School Portal Support</h1>
                <p className="text-xs text-slate-600">Have questions or want a team member to visit your campus? Send us a message!</p>
              </div>

              {contactSubmitted ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-900 text-center rounded-2xl space-y-2">
                  <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h3 className="font-extrabold text-lg">Thank You!</h3>
                  <p className="text-xs font-medium">Our representative will call your provided phone number shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Your Name *</label>
                      <input 
                        type="text" 
                        required 
                        value={contactName} 
                        onChange={(e) => setContactName(e.target.value)} 
                        className="w-full p-3 border border-slate-300 rounded-xl text-xs" 
                        placeholder="e.g. Prof. Tariq"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Mobile / WhatsApp Number *</label>
                      <input 
                        type="text" 
                        required 
                        value={contactPhone} 
                        onChange={(e) => setContactPhone(e.target.value)} 
                        className="w-full p-3 border border-slate-300 rounded-xl text-xs" 
                        placeholder="0300-1234567"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">School Name & City</label>
                    <input 
                      type="text" 
                      value={contactSchool} 
                      onChange={(e) => setContactSchool(e.target.value)} 
                      className="w-full p-3 border border-slate-300 rounded-xl text-xs" 
                      placeholder="e.g. Al-Huda Model School, Lahore"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Message / Requirements</label>
                    <textarea 
                      rows={3}
                      value={contactMsg}
                      onChange={(e) => setContactMsg(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-xl text-xs"
                      placeholder="How can we assist your school?"
                    ></textarea>
                  </div>
                  <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs uppercase tracking-wider">
                    Submit Inquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {}
        {activeTab === 'register' && (
          <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-xl space-y-6">
              <div className="text-center space-y-2">
                <span className="text-xs font-black uppercase text-emerald-700 tracking-widest">Get Started Today</span>
                <h1 className="text-3xl font-black text-slate-900">Register Your School Campus</h1>
                <p className="text-xs text-slate-600">Start your 14-day free trial. No credit card required.</p>
              </div>

              {regSuccess ? (
                <div className="p-8 bg-emerald-50 border border-emerald-200 text-emerald-900 text-center rounded-2xl space-y-3">
                  <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h3 className="font-extrabold text-xl">Registration Received!</h3>
                  <p className="text-xs text-slate-700 font-medium">Our onboarding specialist will contact you via WhatsApp to activate your school cloud portal!</p>
                  <button onClick={() => { setRegSuccess(false); setActiveTab('home'); }} className="px-6 py-2.5 bg-emerald-700 text-white font-bold rounded-xl text-xs">Return Home</button>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">School / Institute Name *</label>
                      <input 
                        type="text" 
                        required 
                        value={regSchoolName} 
                        onChange={(e) => setRegSchoolName(e.target.value)} 
                        className="w-full p-3 border border-slate-300 rounded-xl text-xs" 
                        placeholder="e.g. City Public School"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Principal / Owner Name *</label>
                      <input 
                        type="text" 
                        required 
                        value={regPrincipalName} 
                        onChange={(e) => setRegPrincipalName(e.target.value)} 
                        className="w-full p-3 border border-slate-300 rounded-xl text-xs" 
                        placeholder="e.g. Prof. Ahmed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Official Email</label>
                      <input 
                        type="email" 
                        value={regEmail} 
                        onChange={(e) => setRegEmail(e.target.value)} 
                        className="w-full p-3 border border-slate-300 rounded-xl text-xs" 
                        placeholder="school@gmail.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone / WhatsApp Number *</label>
                      <input 
                        type="text" 
                        required 
                        value={regPhone} 
                        onChange={(e) => setRegPhone(e.target.value)} 
                        className="w-full p-3 border border-slate-300 rounded-xl text-xs" 
                        placeholder="0300-1234567"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Campus City</label>
                      <select 
                        value={regCity} 
                        onChange={(e) => setRegCity(e.target.value)}
                        className="w-full p-3 border border-slate-300 rounded-xl text-xs bg-white font-medium"
                      >
                        <option value="Lahore">Lahore</option>
                        <option value="Faisalabad">Faisalabad</option>
                        <option value="Rawalpindi / Islamabad">Rawalpindi / Islamabad</option>
                        <option value="Multan">Multan</option>
                        <option value="Peshawar">Peshawar</option>
                        <option value="Karachi">Karachi</option>
                        <option value="Other">Other City</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Approx. Student Count</label>
                      <select 
                        value={regStudentCount} 
                        onChange={(e) => setRegStudentCount(e.target.value)}
                        className="w-full p-3 border border-slate-300 rounded-xl text-xs bg-white font-medium"
                      >
                        <option value="100-250">100 - 250 Students</option>
                        <option value="250-500">250 - 500 Students</option>
                        <option value="500-1000">500 - 1000 Students</option>
                        <option value="1000+">1000+ Students</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full py-4 bg-[#151515] hover:bg-emerald-700 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg"
                  >
                    {isLoading ? 'Submitting Registration...' : 'Activate My Free Campus Trial'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {}
        {activeTab === 'login' && (
          <div className="max-w-md mx-auto px-4 py-12">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
                  <Lock className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black text-slate-900">School Portal Login</h1>
                <p className="text-xs text-slate-500 font-medium">Select your role & sign in to your campus dashboard</p>
              </div>

              {/* Role Switcher */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-center text-xs font-bold">
                <button 
                  onClick={() => setLoginRole('principal')}
                  className={`py-2 rounded-lg transition-all ${loginRole === 'principal' ? 'bg-white text-emerald-800 shadow' : 'text-slate-500'}`}
                >
                  Principal
                </button>
                <button 
                  onClick={() => setLoginRole('teacher')}
                  className={`py-2 rounded-lg transition-all ${loginRole === 'teacher' ? 'bg-white text-emerald-800 shadow' : 'text-slate-500'}`}
                >
                  Teacher
                </button>
                <button 
                  onClick={() => setLoginRole('parent')}
                  className={`py-2 rounded-lg transition-all ${loginRole === 'parent' ? 'bg-white text-emerald-800 shadow' : 'text-slate-500'}`}
                >
                  Parent
                </button>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
                  {loginError}
                </div>
              )}

              {currentUser ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                  <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h3 className="font-extrabold text-base text-slate-900">Logged in as {currentUser.name}</h3>
                  <p className="text-xs text-slate-600 font-medium">{currentUser.role} - {currentUser.school}</p>
                  <button 
                    onClick={() => { setCurrentUser(null); showToast('Logged out', 'info'); }}
                    className="w-full py-2.5 bg-rose-600 text-white font-bold rounded-xl text-xs"
                  >
                    Logout from Session
                  </button>
                </div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {loginRole === 'principal' ? 'School Admin Email' : loginRole === 'teacher' ? 'Teacher ID / Email' : 'Parent Registered Mobile'}
                    </label>
                    <input 
                      type="text" 
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-xl text-xs font-medium"
                      placeholder={loginRole === 'principal' ? 'admin@alhuda.edu.pk' : loginRole === 'teacher' ? 'teacher@alhuda.edu.pk' : '03001234567'}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full p-3 border border-slate-300 rounded-xl text-xs font-medium pr-10"
                        placeholder="••••••••"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input type="checkbox" className="rounded text-emerald-600" />
                      <span>Remember Me</span>
                    </label>
                    <button type="button" className="text-emerald-700 hover:underline font-bold">Forgot Password?</button>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow"
                  >
                    {isLoading ? 'Authenticating...' : `Sign In as ${loginRole.toUpperCase()}`}
                  </button>

                  <div className="pt-2 text-center text-xs text-slate-500">
                    <span>Demo Hint: Enter any credentials to test portal login.</span>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </main>

      {}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="mb-4 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="bg-[#1b8755] text-white p-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-white text-emerald-800 flex items-center justify-center font-bold text-xs">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs">Assan School WhatsApp Support</h4>
                    <span className="text-[10px] text-emerald-200 block">Online • Typically replies instantly</span>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-white hover:opacity-75">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 h-64 overflow-y-auto space-y-3 bg-slate-50 text-xs">
                {chatLog.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-3 rounded-2xl max-w-[85%] font-medium ${msg.sender === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'}`}>
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-0.5 px-1">{msg.time}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={sendChatMessage} className="p-2 bg-white border-t border-slate-200 flex gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about school software..."
                  className="flex-1 p-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                />
                <button type="submit" className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 bg-[#1b8755] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform relative"
        >
          <MessageCircle className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full"></span>
        </button>
      </div>

      {}
      <footer className="bg-[#151515] text-white pt-16 pb-8 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-900 flex items-center justify-center font-black">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="font-black text-lg text-white">Assan <span className="text-emerald-400">School</span></span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                Complete school ERP management software designed to automate admissions, fee collection, exams, and attendance.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-sm text-white mb-3 uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => setActiveTab('home')} className="hover:text-emerald-400">Home</button></li>
                <li><button onClick={() => setActiveTab('about')} className="hover:text-emerald-400">About System</button></li>
                <li><button onClick={() => setActiveTab('modules')} className="hover:text-emerald-400">School Modules</button></li>
                <li><button onClick={() => setActiveTab('pricing')} className="hover:text-emerald-400">Pricing Rates</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm text-white mb-3 uppercase tracking-wider">Core Modules</h4>
              <ul className="space-y-2 text-gray-400">
                <li><span>Fee Voucher & WhatsApp</span></li>
                <li><span>Exam Marksheet Engine</span></li>
                <li><span>Biometric Attendance</span></li>
                <li><span>Parent Mobile Portal</span></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm text-white mb-3 uppercase tracking-wider">Campus Support</h4>
              <p className="text-gray-400 mb-2">Call or WhatsApp us for instant online demo:</p>
              <a href="tel:+923214567890" className="text-[#a1d044] font-black text-sm block font-mono hover:underline">+92 321 4567890</a>
              <span className="text-gray-500 text-[10px] block mt-1">Lahore • Faisalabad • Islamabad • Karachi</span>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 text-center text-gray-500 text-[11px] flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>© 2026 Assan School Portal. All rights reserved.</span>
            <span>School Management Made Simple</span>
          </div>
        </div>
      </footer>

    </div>
  );
}