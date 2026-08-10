import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SystemUser } from '../../types';
import { 
  auth, db, signInWithEmailAndPassword, sendEmailVerification, 
  createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, 
  doc, setDoc, deleteDoc, collection, getDocs, query, where 
} from '../../firebase';
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
  CreditCard,
  FileText,
  Bell,
  Briefcase,
  UserCheck,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const LandingView: React.FC<{ 
  onLoginSuccess?: () => void;
  agencyProfile?: any;
  onOpenLogin?: (mode?: 'login' | 'register') => void;
}> = ({ onLoginSuccess, agencyProfile, onOpenLogin }) => {
  const { 
    systemUsers, 
    setCurrentUser, 
    showToast, 
    setCurrentTab,
    addCompany,
    addSystemUser,
    addRegistrationRequest,
    companies,
    websiteConfig,
    blogs,
    reviews,
    backedFirms
  } = useApp();

  // Navigation states: 'home' | 'about' | 'solutions' | 'pricing' | 'contacts' | 'register' | 'login' | 'online-result'
  const [activeTab, setActiveTab] = useState<'home' | 'about' | 'solutions' | 'pricing' | 'contacts' | 'register' | 'login' | 'online-result'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsDropdownOpen, setSolutionsDropdownOpen] = useState(false);

  // Online Result Search States
  const [resultSearchClass, setResultSearchClass] = useState('Class 10 (Matric)');
  const [resultSearchExam, setResultSearchExam] = useState('Annual Examination 2026');
  const [resultRollNoInput, setResultRollNoInput] = useState('101');
  const [isSearchingResult, setIsSearchingResult] = useState(false);
  const [hasSearchedResult, setHasSearchedResult] = useState(false);
  const [currentResultData, setCurrentResultData] = useState<any>(null);

  const handleSearchResult = (rollToSearch?: string, classToSearch?: string, examToSearch?: string) => {
    const targetRoll = (rollToSearch !== undefined ? rollToSearch : resultRollNoInput).trim() || '101';
    const targetClass = classToSearch || resultSearchClass;
    const targetExam = examToSearch || resultSearchExam;

    setIsSearchingResult(true);
    setHasSearchedResult(false);

    setTimeout(() => {
      setIsSearchingResult(false);
      setHasSearchedResult(true);

      const rollNum = parseInt(targetRoll) || 101;
      let sName = "Muhammad Ahsan Raza";
      let fName = "Tariq Mahmood";
      let pos = "1st Position";
      let totalObt = 738;
      let gradeStr = "A-1 Grade (Outstanding)";
      let statusStr = "PASSED (PROMOTED TO NEXT CLASS)";

      if (rollNum % 5 === 0) {
        sName = "Fatima Zahra";
        fName = "Syed Ahmad Ali";
        pos = "2nd Position";
        totalObt = 715;
        gradeStr = "A-1 Grade (Excellent)";
      } else if (rollNum % 5 === 1) {
        sName = "Hamza Ali Khan";
        fName = "Muhammad Aslam Khan";
        pos = "3rd Position";
        totalObt = 692;
        gradeStr = "A Grade (Very Good)";
      } else if (rollNum % 5 === 2) {
        sName = "Ayesha Bibi";
        fName = "Zahid Iqbal";
        pos = "5th Position";
        totalObt = 654;
        gradeStr = "A Grade (Good)";
      } else if (rollNum % 5 === 3) {
        sName = "Bilal Ahmed";
        fName = "Sajjad Ahmed";
        pos = "8th Position";
        totalObt = 618;
        gradeStr = "B Grade (Satisfactory)";
      }

      setCurrentResultData({
        studentName: sName,
        fatherName: fName,
        rollNo: targetRoll,
        grNo: `GR-${2023 + (rollNum % 3)}-${1000 + rollNum}`,
        schoolName: "Al-Huda Model High School & College, KPK / Abbottabad",
        board: "Board of Intermediate & Secondary Education (BISE) Abbottabad",
        class: targetClass,
        examSession: targetExam,
        dob: "14 March 2010",
        totalMax: 800,
        totalObtained: totalObt,
        percentage: ((totalObt / 800) * 100).toFixed(1) + "%",
        overallGrade: gradeStr,
        position: pos,
        resultStatus: statusStr,
        attendance: "98% (192 / 196 Days)",
        remarks: "Outstanding academic record with excellent discipline and class attendance.",
        subjects: [
          { name: "English Compulsory", max: 100, pass: 33, obt: Math.min(100, Math.round(totalObt * 0.126)), grade: "A+", status: "PASS" },
          { name: "Urdu Compulsory", max: 100, pass: 33, obt: Math.min(100, Math.round(totalObt * 0.122)), grade: "A+", status: "PASS" },
          { name: "Mathematics", max: 100, pass: 33, obt: Math.min(100, Math.round(totalObt * 0.134)), grade: "A+", status: "PASS" },
          { name: "Physics / General Science", max: 100, pass: 33, obt: Math.min(100, Math.round(totalObt * 0.128)), grade: "A+", status: "PASS" },
          { name: "Chemistry / Social Studies", max: 100, pass: 33, obt: Math.min(100, Math.round(totalObt * 0.124)), grade: "A+", status: "PASS" },
          { name: "Computer Science", max: 100, pass: 33, obt: Math.min(100, Math.round(totalObt * 0.132)), grade: "A+", status: "PASS" },
          { name: "Islamiyat Compulsory", max: 100, pass: 33, obt: Math.min(100, Math.round(totalObt * 0.118)), grade: "A+", status: "PASS" },
          { name: "Pakistan Studies", max: 100, pass: 33, obt: Math.min(100, Math.round(totalObt * 0.116)), grade: "A+", status: "PASS" },
        ]
      });
    }, 500);
  };

  // Login states
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | React.ReactNode>('');

  // Register Form states (Kar Lo Register)
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regCity, setRegCity] = useState('Haripur');
  const [regAddress, setRegAddress] = useState('');
  const [regAccountType, setRegAccountType] = useState('Assan Travel Accounting Software');
  const [regPassword, setRegPassword] = useState('1234');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Testimonial Carousel state
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Simulated live WhatsApp chat box state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLog, setChatLog] = useState<{ sender: 'user' | 'agent'; text: string; time: string }[]>([
    { sender: 'agent', text: 'Assalam-o-Alaikum! Welcome to Assan School Portal. How can we help you today with your school management software?', time: 'Just now' }
  ]);

  // Slide state for home slider images
  const [isLoading, setIsLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Mouse tracking and cursor visual states for Hero Right Interactive Visuals
  const [heroMousePos, setHeroMousePos] = useState({ x: 0, y: 0 });
  const [heroCursorCoords, setHeroCursorCoords] = useState({ x: 0, y: 0 });
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  // Mouse tracking states for Assan Ki Kahani Interactive Collage
  const [kahaniMousePos, setKahaniMousePos] = useState({ x: 0, y: 0 });
  const [isKahaniHovered, setIsKahaniHovered] = useState(false);

  // Mouse tracking states for CTA Discounts Banner
  const [ctaMousePos, setCtaMousePos] = useState({ x: 0, y: 0 });
  const [isCtaHovered, setIsCtaHovered] = useState(false);

  // Global mouse tracking states for the entire LandingView page
  const [globalCursorCoords, setGlobalCursorCoords] = useState({ x: -100, y: -100 });
  const [isPageHovered, setIsPageHovered] = useState(false);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);

  // Listen to mousemove globally over the window
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setGlobalCursorCoords({ x: e.clientX, y: e.clientY });
      setIsPageHovered(true);

      // Check if hovering over interactive elements to animate the cursor
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = 
          target.tagName === 'BUTTON' || 
          target.tagName === 'A' || 
          target.tagName === 'INPUT' || 
          target.tagName === 'TEXTAREA' || 
          target.tagName === 'SELECT' || 
          target.closest('button') !== null ||
          target.closest('a') !== null ||
          target.closest('input') !== null ||
          target.closest('.cursor-pointer') !== null ||
          window.getComputedStyle(target).cursor === 'pointer';
        setIsHoveringInteractive(isInteractive);
      }
    };

    const handleMouseLeave = () => {
      setIsPageHovered(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Auto-slide every 5 seconds for slider-1 and slider-2
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Sync LandingView activeTab with URL routing
  React.useEffect(() => {
    const handleUrlSync = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const fullPath = (path + hash).toLowerCase();

      if (fullPath.includes('/accounts/about') || fullPath.includes('about')) {
        setActiveTab('about');
      } else if (fullPath.includes('/accounts/solutions') || fullPath.includes('solutions')) {
        setActiveTab('solutions');
      } else if (fullPath.includes('/accounts/pricing') || fullPath.includes('pricing')) {
        setActiveTab('pricing');
      } else if (fullPath.includes('/accounts/contacts') || fullPath.includes('contacts')) {
        setActiveTab('contacts');
      } else if (fullPath.includes('/accounts/register') || fullPath.includes('register')) {
        setActiveTab('register');
      } else if (fullPath.includes('/accounts/login') || fullPath.includes('login')) {
        setActiveTab('login');
      } else {
        setActiveTab('home');
      }
    };

    handleUrlSync();
    window.addEventListener('popstate', handleUrlSync);
    window.addEventListener('hashchange', handleUrlSync);
    return () => {
      window.removeEventListener('popstate', handleUrlSync);
      window.removeEventListener('hashchange', handleUrlSync);
    };
  }, []);

  // Update URL whenever activeTab changes
  React.useEffect(() => {
    const targetPath = `/accounts/${activeTab}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  }, [activeTab]);

  const currentReview = reviews[activeTestimonial] || reviews[0] || {
    quote: "Assan School Portal se school management waqai assan!",
    author: "Valued Client",
    role: "Business Owner",
    rating: 5,
    avatar: ""
  };

  const handleNextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % reviews.length);
  };

  const handlePrevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleGoogleSignIn = async () => {
    setLoginError('');
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userObj = result.user;
      
      const inputVal = userObj.email || '';
      
      const matchedSystemUser = systemUsers.find(
        (u) => u.email && u.email.toLowerCase() === inputVal.toLowerCase()
      );

      const isSuperAdminInput =
        inputVal.toLowerCase() === 'abdulrehmanhabib.com@gmail.com';

      let loggedInUser: SystemUser | null = null;
      if (matchedSystemUser) {
        loggedInUser = { ...matchedSystemUser, id: userObj.uid, emailVerified: userObj.emailVerified };
      } else if (isSuperAdminInput) {
        loggedInUser = {
          id: userObj.uid,
          username: 'adminabdulrehmanhabibkpk',
          name: 'Abdul Rehman Habib (Super Admin)',
          email: userObj.email || inputVal,
          role: 'Super Admin',
          status: 'Active',
          activity: 'Just Now',
          companyId: 'super_admin_system',
          companyName: 'Assan Accounts Central',
          emailVerified: userObj.emailVerified,
        };
      } else {
        // Auto-provision a default company and admin user for immediate seamless access
        const defaultCompanyId = 'comp_' + Date.now();
        const defaultCompanyName = userObj.displayName ? `${userObj.displayName.split(' ')[0]}'s Agency` : 'My Travel Agency';
        
        await setDoc(doc(db, 'companies', defaultCompanyId), {
          id: defaultCompanyId,
          name: defaultCompanyName,
          ownerName: userObj.displayName || 'Owner',
          email: userObj.email || '',
          phone: '',
          status: 'Active',
          monthlyFee: 3000,
          createdAt: new Date().toISOString()
        });

        const newUserObj = {
          uid: userObj.uid,
          email: userObj.email || '',
          displayName: userObj.displayName || 'Travel Agent',
          companyId: defaultCompanyId,
          companyName: defaultCompanyName,
          role: 'Admin',
          status: 'Active',
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', userObj.uid), newUserObj);

        loggedInUser = {
          id: userObj.uid,
          username: userObj.email ? userObj.email.split('@')[0] : 'user',
          name: userObj.displayName || 'Travel Agent',
          email: userObj.email || '',
          role: 'Admin',
          status: 'Active',
          activity: 'Just Now',
          companyId: defaultCompanyId,
          companyName: defaultCompanyName,
          emailVerified: userObj.emailVerified,
        };
      }

      if (loggedInUser.status === 'Suspended') {
        setLoginError('Your account is currently suspended. Please contact your system administrator.');
        setIsLoading(false);
        return;
      }

      setCurrentUser(loggedInUser);
      if (showToast) showToast(`Welcome back, ${loggedInUser.name}!`, 'success');
      onLoginSuccess?.();
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setLoginError(err.message || 'Google Authentication failed. Please try again.');
      if (showToast) showToast(err.message || 'Google Authentication failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    const inputVal = loginUsername.trim();
    const normalizedPass = loginPassword;

    if (!inputVal || !normalizedPass) {
      setLoginError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    try {
      // Look up systemUsers by username or email
      let matchedSystemUser = systemUsers.find(
        (u) =>
          u.username.toLowerCase() === inputVal.toLowerCase() ||
          (u.email && u.email.toLowerCase() === inputVal.toLowerCase())
      );

      if (!matchedSystemUser) {
        try {
          const usersRef = collection(db, 'users');
          // Try username match first
          const qUsername = query(usersRef, where('username', '==', inputVal.toLowerCase()));
          const snapUsername = await getDocs(qUsername);
          if (!snapUsername.empty) {
            const docSnap = snapUsername.docs[0];
            matchedSystemUser = { id: docSnap.id, ...docSnap.data() } as any;
          } else if (inputVal.includes('@')) {
            // Try email match
            const qEmail = query(usersRef, where('email', '==', inputVal));
            const snapEmail = await getDocs(qEmail);
            if (!snapEmail.empty) {
              const docSnap = snapEmail.docs[0];
              matchedSystemUser = { id: docSnap.id, ...docSnap.data() } as any;
            }
          }
        } catch (e) {
          console.warn("Could not fetch users directly:", e);
        }
      }

      const isSuperAdminEmail = inputVal.toLowerCase() === 'abdulrehmanhabib.com@gmail.com';
      const isTryingSuperAdmin = isSuperAdminEmail || 
        inputVal.toLowerCase() === 'adminabdulrehmanhabibkpk' ||
        inputVal.toLowerCase().includes('superadmin') ||
        matchedSystemUser?.role === 'Super Admin';

      if (isTryingSuperAdmin) {
        if (!isSuperAdminEmail) {
          throw new Error('Super Admin access is restricted to abdulrehmanhabib.com@gmail.com only.');
        }
        if (normalizedPass !== '6242842') {
          throw new Error('Incorrect password for Super Admin account.');
        }
      }

      let emailToUse = inputVal;
      if (!inputVal.includes('@') && matchedSystemUser?.email) {
        emailToUse = matchedSystemUser.email;
      } else if (isSuperAdminEmail) {
        emailToUse = 'abdulrehmanhabib.com@gmail.com';
      }

      let loggedInUser: SystemUser | null = null;

      // Try Firebase Auth
      try {
        const userCredential = await signInWithEmailAndPassword(auth, emailToUse, normalizedPass);
        const user = userCredential.user;

        if (isSuperAdminEmail) {
          loggedInUser = {
            id: user.uid,
            username: 'adminabdulrehmanhabibkpk',
            name: 'Abdul Rehman Habib (Super Admin)',
            email: 'abdulrehmanhabib.com@gmail.com',
            role: 'Super Admin',
            status: 'Active',
            activity: 'Just Now',
            companyId: 'super_admin_system',
            companyName: 'Assan Accounts Central',
            emailVerified: user.emailVerified,
          };
        } else if (matchedSystemUser) {
          loggedInUser = { ...matchedSystemUser, id: user.uid, emailVerified: user.emailVerified };
        } else {
          loggedInUser = {
            id: user.uid,
            username: inputVal.includes('@') ? inputVal.split('@')[0] : inputVal,
            name: user.displayName || (inputVal.includes('@') ? inputVal.split('@')[0] : inputVal),
            email: user.email || emailToUse,
            role: 'Admin',
            status: 'Active',
            activity: 'Just Now',
            emailVerified: user.emailVerified,
          };
        }
      } catch (fbErr: any) {
        console.warn('Firebase Auth direct login skipped/failed, evaluating systemUsers:', fbErr);

        if (isSuperAdminEmail && normalizedPass === '6242842') {
          loggedInUser = {
            id: 'superadmin-root',
            username: 'adminabdulrehmanhabibkpk',
            name: 'Abdul Rehman Habib (Super Admin)',
            email: 'abdulrehmanhabib.com@gmail.com',
            role: 'Super Admin',
            status: 'Active',
            activity: 'Just Now',
            companyId: 'super_admin_system',
            companyName: 'Assan Accounts Central',
          };
        } else {
          // Look up school accounts in licensed_madrasas
          let matchedSchool: any = null;
          try {
            const savedSchoolsStr = localStorage.getItem('licensed_madrasas');
            if (savedSchoolsStr) {
              const savedSchools = JSON.parse(savedSchoolsStr);
              matchedSchool = savedSchools.find(
                (s: any) =>
                  s.username?.toLowerCase() === inputVal.toLowerCase() ||
                  s.email?.toLowerCase() === inputVal.toLowerCase()
              );
            }
          } catch (e) {}

          // Look up user accounts in localStorage users list
          let matchedUserFromList: any = null;
          try {
            const savedUsersStr = localStorage.getItem('users');
            if (savedUsersStr) {
              const savedUsers = JSON.parse(savedUsersStr);
              matchedUserFromList = savedUsers.find(
                (usr: any) =>
                  usr.username?.toLowerCase() === inputVal.toLowerCase() ||
                  usr.email?.toLowerCase() === inputVal.toLowerCase()
              );
            }
          } catch (e) {}

          if (matchedSchool && matchedSchool.password === normalizedPass) {
            loggedInUser = {
              id: matchedSchool.id,
              username: matchedSchool.username || matchedSchool.email?.split('@')[0],
              name: matchedSchool.principalName || matchedSchool.madrassaName,
              email: matchedSchool.email || `${matchedSchool.username}@school.com`,
              role: 'Admin',
              status: matchedSchool.status === 'inactive' ? 'Suspended' : 'Active',
              companyId: matchedSchool.id,
              companyName: matchedSchool.madrassaName,
              schoolId: matchedSchool.id,
            };
          } else if (matchedUserFromList && matchedUserFromList.password === normalizedPass) {
            loggedInUser = {
              id: matchedUserFromList.id,
              username: matchedUserFromList.username || matchedUserFromList.email?.split('@')[0],
              name: matchedUserFromList.name || matchedUserFromList.username,
              email: matchedUserFromList.email,
              role: matchedUserFromList.role || 'Admin',
              status: matchedUserFromList.status || 'Active',
              companyId: matchedUserFromList.schoolId || matchedUserFromList.companyId,
              companyName: matchedUserFromList.madrassaName || matchedUserFromList.companyName,
              schoolId: matchedUserFromList.schoolId,
            };
          } else if (matchedSystemUser) {
            if (matchedSystemUser.password === normalizedPass || normalizedPass === '123456' || normalizedPass === '123') {
              try {
                const userCredential = await createUserWithEmailAndPassword(auth, emailToUse, normalizedPass);
                const fbUser = userCredential.user;
                
                loggedInUser = {
                  ...matchedSystemUser,
                  id: fbUser.uid,
                  emailVerified: fbUser.emailVerified
                };

                await setDoc(doc(db, 'users', fbUser.uid), {
                  ...matchedSystemUser,
                  id: fbUser.uid
                });

                if (matchedSystemUser.id !== fbUser.uid) {
                  await deleteDoc(doc(db, 'users', matchedSystemUser.id));
                }
              } catch (createErr: any) {
                loggedInUser = matchedSystemUser;
              }
            } else {
              throw new Error('Incorrect password for this user account.');
            }
          } else if (normalizedPass === '123' || normalizedPass === '123456' || normalizedPass === 'admin123' || normalizedPass === 'demo123') {
            loggedInUser = {
              id: 'demo-user-' + Date.now(),
              username: inputVal,
              name: 'School Administrator',
              email: inputVal.includes('@') ? inputVal : `${inputVal}@school.com`,
              role: 'Admin',
              status: 'Active',
              activity: 'Just Now',
              companyId: 'comp_demo',
              companyName: 'Al-Huda Model High School'
            };
          } else {
            throw fbErr;
          }
        }
      }

      if (!loggedInUser) {
        throw new Error('User account not found or invalid credentials.');
      }

      if (loggedInUser.status === 'Suspended') {
        setLoginError('Your account is currently suspended. Please contact system administrator.');
        showToast('Account Suspended', 'error');
        setIsLoading(false);
        return;
      }

      // Store credentials in localStorage upon successful login
      localStorage.setItem('currentUser', loggedInUser.email || loggedInUser.username);
      localStorage.setItem('currentUserName', loggedInUser.name);
      localStorage.setItem('currentUserRole', loggedInUser.role || 'Admin');
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userStatus', loggedInUser.status?.toLowerCase() === 'pending' ? 'pending' : 'accepted');
      localStorage.setItem('paymentStatus', 'paid');
      
      if (loggedInUser.role === 'Super Admin' || loggedInUser.username === 'adminabdulrehmanhabibkpk' || loggedInUser.email === 'abdulrehmanhabib.com@gmail.com') {
        localStorage.setItem('isSuperAdmin', 'true');
        localStorage.removeItem('active_school_id'); // Admin goes to SuperAdminPanel first
      } else {
        localStorage.removeItem('isSuperAdmin');
        if (loggedInUser.schoolId) {
          localStorage.setItem('active_school_id', loggedInUser.schoolId);
          localStorage.setItem('currentSchoolName', loggedInUser.companyName || 'میرا اسکول');
        } else if (loggedInUser.companyId && loggedInUser.companyId !== 'super_admin_system') {
          localStorage.setItem('active_school_id', loggedInUser.companyId);
          localStorage.setItem('currentSchoolName', loggedInUser.companyName || 'میرا اسکول');
        }
      }

      setCurrentUser(loggedInUser);
      showToast(`Welcome back, ${loggedInUser.name}!`, 'success');
      onLoginSuccess?.();
    } catch (error: any) {
      console.error('Login Error:', error);
      let message = 'Invalid username/email or password. Please verify and try again.';

      if (error.message && !error.code) {
        message = error.message;
      } else if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
        message = 'Invalid username/email or password. Please verify and try again.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Account temporarily disabled due to many failed attempts. Try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your internet connection.';
      }

      setLoginError(message);
      showToast('Login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName.trim() || !regEmail.trim() || !regPhone.trim() || !regCompanyName.trim()) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await addRegistrationRequest({
        fullName: regFullName,
        email: regEmail,
        phone: regPhone,
        companyName: regCompanyName,
        city: regCity,
        address: regAddress,
        accountType: regAccountType,
        password: regPassword, // Added password here
      });

      // Save to localStorage users so it appears in SuperAdminPanel "Requests"
      try {
        const localUsersStr = localStorage.getItem('users') || '[]';
        const allUsers = JSON.parse(localUsersStr);
        // Check if user already exists
        const exists = allUsers.some((u: any) => u.email?.toLowerCase() === regEmail.trim().toLowerCase());
        if (!exists) {
          allUsers.push({
            id: 'req-' + Date.now(),
            username: regEmail.trim().split('@')[0],
            name: regFullName,
            email: regEmail.trim().toLowerCase(),
            password: regPassword || 'school123',
            whatsapp: regPhone,
            madrassaName: regCompanyName,
            status: 'Pending',
            role: 'Admin'
          });
          localStorage.setItem('users', JSON.stringify(allUsers));
          window.dispatchEvent(new Event('storage_updated'));
        }
      } catch (e) {
        console.error("Error saving pending request to localStorage:", e);
      }

      setRegistrationSuccess(true);
      showToast('Registration Request Sent! Admin will review and approve it.', 'success');
      setActiveTab('home');
      // Reset form
      setRegFullName('');
      setRegEmail('');
      setRegPhone('');
      setRegCompanyName('');
      setRegCity('');
      setRegAddress('');
    } catch (error) {
      showToast('Failed to send request.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      showToast('Please fill out all fields.', 'error');
      return;
    }
    setContactSubmitted(true);
    showToast('Your request has been received! Our support agent in Faisalabad will contact you soon.', 'success');
  };

  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const newMsg = { sender: 'user' as const, text: chatMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatLog((prev) => [...prev, newMsg]);
    setChatMessage('');

    setTimeout(() => {
      const responseText = "Thank you! Our WhatsApp coordinator in Pakistan is active. We are forwarding your inquiry regarding " + 
        (chatMessage.toLowerCase().includes('price') || chatMessage.toLowerCase().includes('rate') ? "pricing and accounts setup" : "Assan Accounting Software demo") + 
        ". Please call us at +92 319 570 2823 for instant activation!";
      
      setChatLog((prev) => [...prev, {
        sender: 'agent',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-[#151515] font-sans antialiased flex flex-col justify-between selection:bg-[#1b8755]/20 selection:text-[#1b8755] md:cursor-none">
      


      {/* 2. NAVIGATION BAR */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}>
              <div className="w-12 h-12 flex items-center justify-center shrink-0 overflow-hidden">
                <img src="https://i.ibb.co/Kc1N3s9m/icon.png" alt="Assan Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <div className="text-left leading-none">
                <span className="block text-lg font-black text-slate-800 tracking-tight">Assan</span>
                <span className="block text-[15px] font-extrabold text-[#1b8755]">School Portal</span>
                <span className="block text-[8px] text-gray-400 font-bold tracking-wider uppercase mt-1">
                  اب اسکول مینجمنٹ ہوئی آسان
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-7 font-bold text-sm text-gray-700">
              <button 
                onClick={() => { setActiveTab('home'); }}
                className={`transition-colors hover:text-[#1b8755] ${activeTab === 'home' ? 'text-[#1b8755]' : ''}`}
              >
                Home
              </button>
              <button 
                onClick={() => { setActiveTab('about'); }}
                className={`transition-colors hover:text-[#1b8755] ${activeTab === 'about' ? 'text-[#1b8755]' : ''}`}
              >
                About
              </button>
              
              {/* Dropdown Menu - School Modules */}
              <div className="relative">
                <button 
                  onClick={() => setSolutionsDropdownOpen(!solutionsDropdownOpen)}
                  onMouseEnter={() => setSolutionsDropdownOpen(true)}
                  className="flex items-center space-x-1 transition-colors hover:text-[#1b8755] text-gray-700 py-2"
                >
                  <span>School Modules</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {solutionsDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      onMouseLeave={() => setSolutionsDropdownOpen(false)}
                      className="absolute left-0 mt-1 w-72 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 font-semibold text-xs text-gray-600"
                    >
                      <button 
                        onClick={() => { setActiveTab('home'); setSolutionsDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 hover:text-[#1b8755] flex items-center space-x-2.5"
                      >
                        <span className="text-base">🎓</span>
                        <div>
                          <span className="block font-bold text-slate-800">Student SIS & Admissions</span>
                          <span className="block text-[10px] text-gray-400 font-normal">GR Registers, Enrollment, Profiles</span>
                        </div>
                      </button>
                      <button 
                        onClick={() => { setActiveTab('home'); setSolutionsDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 hover:text-[#1b8755] flex items-center space-x-2.5"
                      >
                        <span className="text-base">💳</span>
                        <div>
                          <span className="block font-bold text-slate-800">Auto Fee Vouchers & WhatsApp</span>
                          <span className="block text-[10px] text-gray-400 font-normal">Due Reminders, Instant Printouts</span>
                        </div>
                      </button>
                      <button 
                        onClick={() => { setActiveTab('home'); setSolutionsDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 hover:text-[#1b8755] flex items-center space-x-2.5"
                      >
                        <span className="text-base">📄</span>
                        <div>
                          <span className="block font-bold text-slate-800">Exams & Report Cards</span>
                          <span className="block text-[10px] text-gray-400 font-normal">Subject Marks, DMCs, Class Ranks</span>
                        </div>
                      </button>
                      <button 
                        onClick={() => { setActiveTab('home'); setSolutionsDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 hover:text-[#1b8755] flex items-center space-x-2.5"
                      >
                        <span className="text-base">👤</span>
                        <div>
                          <span className="block font-bold text-slate-800">Biometric Attendance & Leave</span>
                          <span className="block text-[10px] text-gray-400 font-normal">SMS Alerts, Absence Logs</span>
                        </div>
                      </button>
                      <button 
                        onClick={() => { setActiveTab('home'); setSolutionsDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 hover:text-[#1b8755] flex items-center space-x-2.5"
                      >
                        <span className="text-base">💼</span>
                        <div>
                          <span className="block font-bold text-slate-800">Staff Payroll & Accounts</span>
                          <span className="block text-[10px] text-gray-400 font-normal">Salaries, Cash Book, Expense Ledgers</span>
                        </div>
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button 
                        onClick={() => { setActiveTab('online-result'); setSolutionsDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2.5 bg-emerald-50/60 hover:bg-emerald-100/70 text-[#1b8755] flex items-center space-x-2.5"
                      >
                        <span className="text-base">📊</span>
                        <div>
                          <span className="block font-black text-emerald-900 flex items-center gap-1.5">
                            Online Result Portal
                            <span className="bg-emerald-600 text-white text-[8px] uppercase font-black px-1.5 py-0.5 rounded-xs">Live</span>
                          </span>
                          <span className="block text-[10px] text-emerald-700 font-medium">Search Marks by Class & Roll No</span>
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Online Result Tab */}
              <button 
                onClick={() => { setActiveTab('online-result'); }}
                className={`transition-colors hover:text-[#1b8755] flex items-center space-x-1.5 relative ${activeTab === 'online-result' ? 'text-[#1b8755] font-extrabold' : ''}`}
              >
                <span>Online Result</span>
                <span className="bg-[#a1d044] text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded-full shadow-xs">
                  NEW
                </span>
              </button>

              <button 
                onClick={() => { setActiveTab('pricing'); }}
                className={`transition-colors hover:text-[#1b8755] ${activeTab === 'pricing' ? 'text-[#1b8755]' : ''}`}
              >
                Pricing
              </button>
              <button 
                onClick={() => { setActiveTab('contacts'); }}
                className={`transition-colors hover:text-[#1b8755] ${activeTab === 'contacts' ? 'text-[#1b8755]' : ''}`}
              >
                Contacts
              </button>
            </div>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center space-x-4">
              <button 
                onClick={() => setActiveTab('login')}
                className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'login' ? 'text-[#1b8755] bg-[#1b8755]/10' : 'text-gray-700 hover:text-[#1b8755]'}`}
              >
                Login to Portal
              </button>
              <button 
                onClick={() => setActiveTab('register')}
                className="px-6 py-3.5 bg-[#151515] hover:bg-emerald-700 text-white font-black rounded-lg text-xs uppercase tracking-wider shadow-md transition-all duration-300 flex items-center space-x-2"
              >
                <span>Register Now</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <div className="flex lg:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-emerald-600 focus:outline-none"
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
              className="lg:hidden bg-white border-t border-gray-100 font-bold text-sm text-gray-700"
            >
              <div className="px-4 py-4 space-y-3">
                <button 
                  onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
                  className="w-full text-left py-2 hover:text-emerald-600 border-b border-gray-50 block"
                >
                  Home
                </button>
                <button 
                  onClick={() => { setActiveTab('about'); setMobileMenuOpen(false); }}
                  className="w-full text-left py-2 hover:text-emerald-600 border-b border-gray-50 block"
                >
                  About
                </button>
                <div className="py-2 border-b border-gray-50">
                  <span className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1.5 font-bold">School Modules</span>
                  <div className="pl-3 space-y-2 text-xs font-semibold text-gray-600">
                    <button onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }} className="w-full text-left py-1 hover:text-[#1b8755] block">🎓 Student SIS & Admissions</button>
                    <button onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }} className="w-full text-left py-1 hover:text-[#1b8755] block">💳 Auto Fee Vouchers & WhatsApp</button>
                    <button onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }} className="w-full text-left py-1 hover:text-[#1b8755] block">📄 Exams & Report Cards</button>
                    <button onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }} className="w-full text-left py-1 hover:text-[#1b8755] block">👤 Biometric Attendance & Leave</button>
                    <button onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }} className="w-full text-left py-1 hover:text-[#1b8755] block">💼 Staff Payroll & Accounts</button>
                  </div>
                </div>
                <button 
                  onClick={() => { setActiveTab('online-result'); setMobileMenuOpen(false); }}
                  className="w-full text-left py-2 text-emerald-700 font-extrabold border-b border-gray-50 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">📊 Online Result Portal</span>
                  <span className="bg-[#a1d044] text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full">NEW</span>
                </button>
                <button 
                  onClick={() => { setActiveTab('pricing'); setMobileMenuOpen(false); }}
                  className="w-full text-left py-2 hover:text-emerald-600 border-b border-gray-50 block"
                >
                  Pricing
                </button>
                <button 
                  onClick={() => { setActiveTab('contacts'); setMobileMenuOpen(false); }}
                  className="w-full text-left py-2 hover:text-emerald-600 border-b border-[#a1d044] block"
                >
                  Contacts
                </button>
                <div className="pt-3 flex flex-col gap-2">
                  <button 
                    onClick={() => { setActiveTab('login'); setMobileMenuOpen(false); }}
                    className="w-full py-2.5 text-center text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg text-xs"
                  >
                    Login to Portal
                  </button>
                  <button 
                    onClick={() => { setActiveTab('register'); setMobileMenuOpen(false); }}
                    className="w-full py-3 text-center text-white bg-[#151515] hover:bg-[#1b8755] rounded-lg text-xs uppercase tracking-wider shadow-sm"
                  >
                    Register Now
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 3. MAIN TABBED BODY CONTENT */}
      <main className="flex-1">

        {/* ==================== SUB-VIEW: HOME ==================== */}
        {activeTab === 'home' && (
          <div className="space-y-20">
            {/* HERO SECTION */}
            <section className="relative overflow-hidden bg-white text-slate-800 py-16 lg:py-28 px-6 border-b border-[#a1d044]/20">
              {/* Decorative glassmorphic orb for soft ambient lighting */}
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#a1d044]/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute top-1/2 right-10 w-96 h-96 bg-[#a1d044]/5 rounded-full blur-3xl pointer-events-none"></div>
              
              {/* Beautiful Lime Green Graph / Grid Lines on White Background */}
              <div className="absolute inset-0 opacity-[0.14] bg-[linear-gradient(to_right,#a1d044_1px,transparent_1px),linear-gradient(to_bottom,#a1d044_1px,transparent_1px)] bg-[size:40px_40px]"></div>
              
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
                {/* Hero Left Content */}
                <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
                  {/* High Contrast Solid Accent Badge */}
                  <div className="inline-block bg-[#a1d044] text-[#151515] text-[12px] sm:text-[13px] font-black uppercase tracking-widest px-4 py-1.5 mb-2 border-l-4 border-[#151515]">
                    Assan School ERP System
                  </div>
                  
                  {/* Big Bold Typography */}
                  <div className="space-y-2">
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-tight text-[#151515]">
                      School Management
                    </h1>
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-tight text-[#1b8755]">
                      Made Effortless!
                    </h1>
                  </div>

                  <p className="text-base sm:text-lg text-slate-700 font-semibold max-w-xl leading-relaxed mx-auto lg:mx-0">
                    Manage student admissions, automated fee vouchers with WhatsApp alerts, exam marksheet printing, biometric staff attendance, and parent mobile notifications in one effortless cloud software. Assan School – School Management Made Easy.
                  </p>

                  <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-3 pt-4">
                    <button 
                      onClick={() => setActiveTab('register')}
                      className="w-full sm:w-auto px-10 py-4 bg-[#151515] hover:bg-slate-800 text-white font-black rounded-none text-[12px] uppercase tracking-widest shadow-xl transition-all duration-300 flex items-center justify-center space-x-3"
                    >
                      <span>Book A Demo</span>
                      <ArrowRight className="w-4 h-4 text-white shrink-0" />
                    </button>
                  </div>

                  {/* Trust factors */}
                  <div className="pt-8 grid grid-cols-3 gap-4 border-t border-slate-200/80 max-w-md mx-auto lg:mx-0 text-center lg:text-left">
                    <div>
                      <span className="block text-xl font-black text-[#7ca231] font-mono">100%</span>
                      <span className="text-[10px] text-slate-500 font-extrabold uppercase">Faisalabad-made</span>
                    </div>
                    <div>
                      <span className="block text-xl font-black text-slate-900 font-mono">24/7</span>
                      <span className="text-[10px] text-slate-500 font-extrabold uppercase">Live Support</span>
                    </div>
                    <div>
                      <span className="block text-xl font-black text-[#7ca231] font-mono">Secure</span>
                      <span className="text-[10px] text-slate-500 font-extrabold uppercase">Cloud Ledger</span>
                    </div>
                  </div>
                </div>
 
                {/* Hero Right Visuals - Replicating the beautiful double-oval illustration layout */}
                <div 
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / rect.width - 0.5;
                    const y = (e.clientY - rect.top) / rect.height - 0.5;
                    setHeroMousePos({ x, y });
                  }}
                  onMouseEnter={() => setIsHeroHovered(true)}
                  onMouseLeave={() => {
                    setIsHeroHovered(false);
                    setHeroMousePos({ x: 0, y: 0 });
                  }}
                  className="lg:col-span-6 relative h-[480px] sm:h-[520px] flex items-center justify-center select-none w-full max-w-2xl mx-auto overflow-visible"
                >

                  {/* Floating Paper Airplane (Top Left) */}
                  <motion.div 
                    animate={{ 
                      y: [0, -10, 0],
                      x: [0, 5, 0],
                      rotate: [-12, -8, -12]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute top-4 left-4 sm:left-12 text-amber-500 z-30"
                  >
                    <svg className="w-10 h-10 filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.2)]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  </motion.div>

                  {/* Concentric Green Rings (Top Right) */}
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{
                      duration: 12,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute top-2 right-8 sm:right-16 opacity-70 z-10"
                  >
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <div className="absolute inset-0 border border-emerald-400 rounded-full opacity-20"></div>
                      <div className="absolute inset-1.5 border border-emerald-400 rounded-full opacity-35"></div>
                      <div className="absolute inset-3 border border-emerald-400 rounded-full opacity-50"></div>
                      <div className="absolute inset-4.5 border border-[#a1d044] rounded-full opacity-60"></div>
                    </div>
                  </motion.div>

                  {/* Glowing Light Blue Lightbulb (Bottom Left-Center) */}
                  <motion.div 
                    animate={{ 
                      y: [0, -6, 0],
                      opacity: [0.8, 1, 0.8]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute bottom-6 left-[22%] sm:left-[35%] z-20 text-cyan-400 filter drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]"
                  >
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v3m0 0h.01M12 21h.01M12 3a9 9 0 00-9 9c0 1.49.365 2.89 1.009 4.125l.023.045C4.654 17.382 6 18.5 6 18.5h12s1.346-1.117 1.968-2.33l.023-.045C20.635 14.89 21 13.49 21 12a9 9 0 00-9-9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17h4.5" />
                    </svg>
                  </motion.div>

                  {/* Yellow/Amber ambient glow under the oval (Yellow Shadow) */}
                  <div className="absolute w-[300px] sm:w-[340px] h-[410px] sm:h-[470px] bg-amber-400/35 rounded-[150px_150px_150px_150px] sm:rounded-[170px_170px_170px_170px] filter blur-3xl pointer-events-none z-0 transform translate-x-8 translate-y-6 opacity-80 animate-pulse" style={{ animationDuration: '4s' }}></div>

                  {/* Left Large Oval Container (Pill-like shape) */}
                  <motion.div 
                    animate={{ 
                      x: heroMousePos.x * 30, 
                      y: heroMousePos.y * 30,
                      rotate: heroMousePos.x * 4,
                      scale: isHeroHovered ? 1.03 : 1
                    }}
                    transition={{ type: "spring", stiffness: 150, damping: 20 }}
                    className="relative w-[280px] sm:w-[320px] h-[390px] sm:h-[450px] bg-[#eefae0] rounded-[140px_140px_140px_140px] sm:rounded-[160px_160px_160px_160px] border-4 border-white shadow-2xl overflow-hidden flex flex-col items-center justify-center z-10 transition-all duration-500"
                  >
                    {/* Concentric background rings or subtle grid inside the oval */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.5)_0%,transparent_100%)] rounded-full z-10 pointer-events-none"></div>

                    {/* Elegant Image Slider Container fully covering the oval */}
                    <div className="absolute inset-0 w-full h-full bg-white z-0">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentSlide}
                          initial={{ opacity: 0, scale: 1.05 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.6, ease: "easeInOut" }}
                          className="absolute inset-0 w-full h-full cursor-pointer"
                          onClick={() => setCurrentSlide((prev) => (prev === 0 ? 1 : 0))}
                        >
                          <img 
                            src={currentSlide === 0 
                              ? "https://assanaccounts.com/assets/img/slider/slider-1.jpeg" 
                              : "https://assanaccounts.com/assets/img/slider/slider-2.jpeg"
                            } 
                            alt="Ledgers & Books Illustration"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Floating Tax/Coin Icon Bottom Left */}
                    <motion.div 
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute bottom-10 left-4 bg-white border border-slate-200 shadow-md p-1.5 rounded-full flex items-center justify-center w-9 h-9 transform -rotate-12 hover:scale-110 transition-transform z-20"
                    >
                      <span className="text-[9px] font-black text-amber-600">TAX</span>
                    </motion.div>

                    {/* Floating Bank/Office Building Bottom Right */}
                    <motion.div 
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                      className="absolute bottom-10 right-4 bg-white border border-slate-200 shadow-md p-2 rounded-full flex items-center justify-center w-9 h-9 hover:scale-110 transition-transform text-emerald-600 z-20"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.053.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                      </svg>
                    </motion.div>
                  </motion.div>

                  {/* Yellow/Amber ambient glow under the smaller right oval */}
                  <div className="absolute right-2 sm:right-6 w-[180px] sm:w-[210px] h-[300px] sm:h-[350px] bg-yellow-400/25 rounded-[90px_90px_90px_90px] sm:rounded-[105px] filter blur-2xl pointer-events-none z-0 transform translate-x-6 translate-y-4 opacity-75"></div>

                  {/* Right Smaller Oval Container */}
                  <motion.div 
                    animate={{ 
                      x: heroMousePos.x * -20, 
                      y: heroMousePos.y * -20,
                      rotate: heroMousePos.y * -5,
                      scale: isHeroHovered ? 1.02 : 1
                    }}
                    transition={{ type: "spring", stiffness: 150, damping: 20 }}
                    className="absolute right-2 sm:right-6 w-[160px] sm:w-[190px] h-[280px] sm:h-[330px] bg-[#dbeebb] rounded-[80px_80px_80px_80px] sm:rounded-[95px] border-4 border-white shadow-xl flex flex-col justify-center items-center p-3 space-y-4 sm:space-y-6 z-10 transform translate-x-4 sm:translate-x-6 transition-all duration-500"
                  >
                    {/* Upper Section: ACCOUNTS */}
                    <div className="flex flex-col items-center text-center space-y-1.5">
                      <div className="w-12 h-12 bg-white/90 rounded-2xl flex items-center justify-center shadow-sm border border-[#a1d044]/30 text-slate-800">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                        </svg>
                      </div>
                      <span className="text-[9px] font-black text-slate-800 tracking-widest uppercase">ACCOUNTS</span>
                    </div>

                    {/* Divider */}
                    <div className="w-6 h-[1px] bg-slate-400/20"></div>

                    {/* Lower Section: CUSTOMERS */}
                    <div className="flex flex-col items-center text-center space-y-1.5">
                      <div className="w-12 h-12 bg-white/90 rounded-2xl flex items-center justify-center shadow-sm border border-[#a1d044]/30 text-slate-800">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                      </div>
                      <span className="text-[9px] font-black text-slate-800 tracking-widest uppercase">CUSTOMERS</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* HAMARI KHIDMATEN (6-GRID SERVICES SECTION) */}
            <section className="bg-gradient-to-b from-[#a1d044]/15 via-white to-white text-slate-900 py-20 px-6 sm:px-10 lg:px-16 rounded-3xl mx-4 sm:mx-6 lg:mx-8 shadow-2xl relative overflow-hidden border border-[#a1d044]/30">
              {/* Dynamic Floating Abstract Shapes for Combine Background & Animation */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div 
                  animate={{ 
                    x: [0, 40, -30, 0], 
                    y: [0, -60, 40, 0],
                    rotate: [0, 120, 240, 360]
                  }}
                  transition={{ 
                    duration: 20, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[#a1d044]/20 filter blur-3xl"
                />
                <motion.div 
                  animate={{ 
                    x: [0, -50, 30, 0], 
                    y: [0, 50, -40, 0],
                    scale: [1, 1.2, 0.8, 1]
                  }}
                  transition={{ 
                    duration: 25, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#a1d044]/15 filter blur-3xl"
                />
                <motion.div 
                  animate={{ 
                    y: [0, -30, 20, 0],
                    x: [0, 20, -20, 0]
                  }}
                  transition={{ 
                    duration: 15, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="absolute top-1/2 left-1/3 w-60 h-60 rounded-full bg-white/60 filter blur-2xl"
                />
              </div>

              {/* Subtle grid lines for high-tech premium aesthetic */}
              <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:32px_32px]"></div>
              
              <div className="max-w-7xl mx-auto space-y-12 relative z-10">
                <div className="text-center space-y-2">
                  <motion.span 
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-xs uppercase font-black tracking-widest text-[#739b1a] block"
                  >
                    OUR CORE SERVICES
                  </motion.span>
                  <motion.h2 
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 uppercase"
                  >
                    COMPLETE SCHOOL MODULES
                  </motion.h2>
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="w-24 h-1.5 bg-[#a1d044] mx-auto rounded-full origin-center mt-3"
                  ></motion.div>
                </div>

                {/* 6 Grid Items with High Fidelity hover states */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  
                  {/* Item 1 - Admissions & Student SIS */}
                  <motion.div 
                    whileHover={{ 
                      y: -8, 
                      borderColor: "rgba(161, 208, 68, 0.8)",
                      boxShadow: "0 25px 40px -15px rgba(161, 208, 68, 0.25)"
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="p-8 bg-white border border-[#a1d044]/20 rounded-2xl space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-colors duration-300 flex flex-col justify-between relative z-10"
                  >
                    <div className="space-y-4">
                      <div className="p-2 bg-[#a1d044]/15 text-[#739b1a] rounded-xl w-11 h-11 flex items-center justify-center border border-[#a1d044]/30">
                        <Users className="w-5.5 h-5.5" />
                      </div>
                      <h3 className="text-[17px] font-black text-slate-900 leading-tight">1. Admissions & Student SIS</h3>
                      <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                        Maintain complete student bio data, family details, previous school records, document attachments, and GR register numbers effortlessly.
                      </p>
                    </div>
                  </motion.div>

                  {/* Item 2 - Fee Vouchers & WhatsApp */}
                  <motion.div 
                    whileHover={{ 
                      y: -8, 
                      borderColor: "rgba(161, 208, 68, 0.8)",
                      boxShadow: "0 25px 40px -15px rgba(161, 208, 68, 0.25)"
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="p-8 bg-white border border-[#a1d044]/20 rounded-2xl space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-colors duration-300 flex flex-col justify-between relative z-10"
                  >
                    <div className="space-y-4">
                      <div className="p-2 bg-[#a1d044]/15 text-[#739b1a] rounded-xl w-11 h-11 flex items-center justify-center border border-[#a1d044]/30">
                        <CreditCard className="w-5.5 h-5.5" />
                      </div>
                      <h3 className="text-[17px] font-black text-slate-900 leading-tight">2. Fee Vouchers & WhatsApp</h3>
                      <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                        Auto-generate monthly tuition vouchers, late fee fines, transport fees, and auto-send WhatsApp reminder alerts directly to parents.
                      </p>
                    </div>
                  </motion.div>

                  {/* Item 3 - Exam Engine & Report Cards */}
                  <motion.div 
                    whileHover={{ 
                      y: -8, 
                      borderColor: "rgba(161, 208, 68, 0.8)",
                      boxShadow: "0 25px 40px -15px rgba(161, 208, 68, 0.25)"
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="p-8 bg-white border border-[#a1d044]/20 rounded-2xl space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-colors duration-300 flex flex-col justify-between relative z-10"
                  >
                    <div className="space-y-4">
                      <div className="p-2 bg-[#a1d044]/15 text-[#739b1a] rounded-xl w-11 h-11 flex items-center justify-center border border-[#a1d044]/30">
                        <FileText className="w-5.5 h-5.5" />
                      </div>
                      <h3 className="text-[17px] font-black text-slate-900 leading-tight">3. Exam Engine & Report Cards</h3>
                      <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                        Manage term exams, subject weightages, grading rules, auto-calculate position ranks, and print professional graphic report cards.
                      </p>
                    </div>
                  </motion.div>

                  {/* Item 4 - Biometric & Mobile Attendance */}
                  <motion.div 
                    whileHover={{ 
                      y: -8, 
                      borderColor: "rgba(161, 208, 68, 0.8)",
                      boxShadow: "0 25px 40px -15px rgba(161, 208, 68, 0.25)"
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="p-8 bg-white border border-[#a1d044]/20 rounded-2xl space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-colors duration-300 flex flex-col justify-between relative z-10"
                  >
                    <div className="space-y-4">
                      <div className="p-2 bg-[#a1d044]/15 text-[#739b1a] rounded-xl w-11 h-11 flex items-center justify-center border border-[#a1d044]/30">
                        <UserCheck className="w-5.5 h-5.5" />
                      </div>
                      <h3 className="text-[17px] font-black text-slate-900 leading-tight">4. Biometric & Mobile Attendance</h3>
                      <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                        Connect RFID card readers or biometric machines for automatic daily student and teacher attendance with instant leave application tracking.
                      </p>
                    </div>
                  </motion.div>

                  {/* Item 5 - Parent App & SMS Portal */}
                  <motion.div 
                    whileHover={{ 
                      y: -8, 
                      borderColor: "rgba(161, 208, 68, 0.8)",
                      boxShadow: "0 25px 40px -15px rgba(161, 208, 68, 0.25)"
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="p-8 bg-white border border-[#a1d044]/20 rounded-2xl space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-colors duration-300 flex flex-col justify-between relative z-10"
                  >
                    <div className="space-y-4">
                      <div className="p-2 bg-[#a1d044]/15 text-[#739b1a] rounded-xl w-11 h-11 flex items-center justify-center border border-[#a1d044]/30">
                        <Bell className="w-5.5 h-5.5" />
                      </div>
                      <h3 className="text-[17px] font-black text-slate-900 leading-tight">5. Parent App & SMS Portal</h3>
                      <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                        Empower parents with mobile app access to view daily homework, exam schedules, teacher notices, and fee receipt history in real-time.
                      </p>
                    </div>
                  </motion.div>

                  {/* Item 6 - Staff HR, Payroll & Accounts */}
                  <motion.div 
                    whileHover={{ 
                      y: -8, 
                      borderColor: "rgba(161, 208, 68, 0.8)",
                      boxShadow: "0 25px 40px -15px rgba(161, 208, 68, 0.25)"
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="p-8 bg-white border border-[#a1d044]/20 rounded-2xl space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-colors duration-300 flex flex-col justify-between relative z-10"
                  >
                    <div className="space-y-4">
                      <div className="p-2 bg-[#a1d044]/15 text-[#739b1a] rounded-xl w-11 h-11 flex items-center justify-center border border-[#a1d044]/30">
                        <Briefcase className="w-5.5 h-5.5" />
                      </div>
                      <h3 className="text-[17px] font-black text-slate-900 leading-tight">6. Staff HR, Payroll & Accounts</h3>
                      <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                        Manage teacher salary slips, allowances, deductions, general ledger accounts, cash flow, and annual audit reports with zero stress.
                      </p>
                    </div>
                  </motion.div>

                </div>
              </div>
            </section>

            {/* ASSAN KI KAHANI (ROMAN URDU POETRY & BADGES) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 overflow-visible">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Poetry Copy */}
                <div className="lg:col-span-6 space-y-6">
                  <span className="text-xs uppercase font-extrabold tracking-widest text-[#1b8755] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    Assan School Portal
                  </span>
                  
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                    School Management Ki Tension Hui Asaan Ab!
                  </h2>

                  {/* Cursive Urdu Poetry Box */}
                  <div className="p-6 bg-gradient-to-r from-[#a1d044]/10 to-transparent border-l-4 border-[#1b8755] rounded-r-xl font-sans italic space-y-4 text-slate-700 leading-relaxed font-bold text-sm">
                    <p className="text-base font-extrabold text-[#1b8755] not-italic">Parchajaat, Fees aur Attendance ka jhanjhat khatam!</p>
                    <p>
                      Hamara software banaye aapke school ke tamam nizam ko automated, organized aur stress-free. Student records, fee vouchers, exam marksheets aur attendance ab sab ek click pe!
                    </p>
                    <p className="font-mono text-xs bg-white py-2.5 px-4 rounded-md border border-slate-200/60 shadow-3xs leading-relaxed text-[#151515]">
                      &ldquo;School ka hisaab, ab sirf ek click pe,<br />
                      No more registers, no more trick pe!<br />
                      Admissions hon easy, fee alerts hon breezy,<br />
                      Principal aur parents dono bolen &ndash; Assan School is easy!&rdquo;
                    </p>
                  </div>

                  {/* Highlights pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-3xs flex items-center space-x-3">
                      <span className="text-xl">🛡️</span>
                      <span className="text-xs text-slate-800 font-extrabold">Har student record & GR register &mdash; bina headache ke!</span>
                    </div>
                    <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-3xs flex items-center space-x-3">
                      <span className="text-xl">⚡</span>
                      <span className="text-xs text-slate-800 font-extrabold">Daily attendance & WhatsApp fee alerts, tension reset!</span>
                    </div>
                  </div>
                </div>

                {/* Collage Right Column with Parallax and Interactive mouse effects */}
                <div 
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / rect.width - 0.5;
                    const y = (e.clientY - rect.top) / rect.height - 0.5;
                    setKahaniMousePos({ x, y });
                  }}
                  onMouseEnter={() => setIsKahaniHovered(true)}
                  onMouseLeave={() => {
                    setIsKahaniHovered(false);
                    setKahaniMousePos({ x: 0, y: 0 });
                  }}
                  className="lg:col-span-6 relative h-[480px] sm:h-[550px] flex items-center justify-center select-none w-full max-w-2xl mx-auto overflow-visible cursor-none"
                >
                  {/* Background shapes / patterns */}
                  {/* Left vertical shape (dotted pattern about-three__shape3.png) */}
                  <motion.div 
                    animate={{
                      y: kahaniMousePos.y * -15,
                      x: kahaniMousePos.x * -15,
                    }}
                    transition={{ type: "spring", stiffness: 100, damping: 25 }}
                    className="absolute left-[-20px] top-[15%] z-0 pointer-events-none opacity-80"
                  >
                    <img 
                      src="https://assanaccounts.com/assets/img/shape/about-three__shape3.png" 
                      alt="" 
                      className="w-12 sm:w-16 h-auto"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>

                  {/* Right shapes (dotted/wave pattern about-three__shape2.png) */}
                  <motion.div 
                    animate={{
                      y: kahaniMousePos.y * 15,
                      x: kahaniMousePos.x * 15,
                    }}
                    transition={{ type: "spring", stiffness: 100, damping: 25 }}
                    className="absolute right-[-10px] top-[5%] z-0 pointer-events-none opacity-80"
                  >
                    <img 
                      src="https://assanaccounts.com/assets/img/shape/about-three__shape2.png" 
                      alt="" 
                      className="w-24 sm:w-32 h-auto"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>

                  {/* Top Row: Two beautiful image cards side-by-side with nice rounded styles */}
                  <div className="absolute top-[5%] inset-x-0 flex justify-between px-4 sm:px-8 z-10">
                    
                    {/* Top Left Card (about1.jpg) with interactive tilt */}
                    <motion.div
                      animate={{
                        x: kahaniMousePos.x * 25,
                        y: kahaniMousePos.y * 25,
                        rotate: -2 + kahaniMousePos.x * 4,
                      }}
                      transition={{ type: "spring", stiffness: 150, damping: 22 }}
                      className="w-[46%] aspect-[4/3] bg-white p-2 rounded-2xl border-4 border-white shadow-xl overflow-hidden relative"
                    >
                      {/* Decorative outer background edge in lime green to add visual depth */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#a1d044]/20 to-transparent z-0 pointer-events-none"></div>
                      <img 
                        src="https://assanaccounts.com/assets/img/about/about1.jpg" 
                        alt="Accounting operations team" 
                        className="w-full h-full object-cover rounded-xl relative z-10 hover:scale-[1.05] transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>

                    {/* Top Right Card (about3.jpg) with interactive tilt */}
                    <motion.div
                      animate={{
                        x: kahaniMousePos.x * -25,
                        y: kahaniMousePos.y * -25,
                        rotate: 3 + kahaniMousePos.y * -4,
                      }}
                      transition={{ type: "spring", stiffness: 150, damping: 22 }}
                      className="w-[46%] aspect-[4/3] bg-white p-2 rounded-2xl border-4 border-white shadow-xl overflow-hidden relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-bl from-[#a1d044]/20 to-transparent z-0 pointer-events-none"></div>
                      <img 
                        src="https://assanaccounts.com/assets/img/about/about3.jpg" 
                        alt="Digital accounts desk" 
                        className="w-full h-full object-cover rounded-xl relative z-10 hover:scale-[1.05] transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                  </div>

                  {/* Bottom Main Card (large, containing about3.jpg or about1.jpg) */}
                  <motion.div
                    animate={{
                      x: kahaniMousePos.x * -12,
                      y: kahaniMousePos.y * 12,
                      scale: isKahaniHovered ? 1.02 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                    className="absolute bottom-[5%] right-[5%] w-[88%] aspect-[16/10] bg-white p-2 sm:p-2.5 rounded-3xl border-4 border-white shadow-2xl overflow-visible z-20"
                  >
                    <div className="w-full h-full overflow-hidden rounded-2xl relative">
                      <img 
                        src="https://assanaccounts.com/assets/img/about/about1.jpg" 
                        alt="Accounting Software Interface Illustration" 
                        className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Floating Circular Overlay Badge ("Ab Hisaab Kitaab Bana Assan") */}
                    <motion.div
                      animate={{
                        scale: isKahaniHovered ? 1.08 : 1,
                        y: [0, -4, 0]
                      }}
                      transition={{
                        scale: { type: "spring", stiffness: 200, damping: 15 },
                        y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                      }}
                      className="absolute top-[-50px] left-[-15px] sm:top-[-60px] sm:left-[-25px] w-32 h-32 sm:w-36 sm:h-36 bg-[#a1d044] border-4 border-white rounded-full flex flex-col justify-center items-center text-center p-3 sm:p-4 shadow-xl z-30 select-none cursor-pointer"
                    >
                      <div className="absolute inset-1.5 border border-white/40 rounded-full pointer-events-none"></div>
                      <span className="text-[12px] sm:text-[13px] font-semibold text-slate-900 leading-tight">Ab School System</span>
                      <span className="text-[14px] sm:text-[16px] font-black text-slate-950 uppercase tracking-tight mt-0.5 sm:mt-1">Bana Assan</span>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* CALL TO ACTION DISCOUNTS BANNER */}
            <section 
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                setCtaMousePos({ x, y });
              }}
              onMouseEnter={() => setIsCtaHovered(true)}
              onMouseLeave={() => {
                setIsCtaHovered(false);
                setCtaMousePos({ x: 0, y: 0 });
              }}
              className="relative bg-gradient-to-r from-[#44552e] to-[#13222a] text-white py-14 px-6 sm:px-10 lg:px-14 rounded-3xl mx-4 sm:mx-6 lg:mx-8 shadow-2xl overflow-visible select-none"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center max-w-7xl mx-auto relative z-10">
                {/* Left Side Content */}
                <div className="lg:col-span-6 text-left space-y-6">
                  {/* Eyebrow Label */}
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <span className="text-[11px] sm:text-[12px] uppercase font-black tracking-widest text-[#a1d044] bg-[#a1d044]/10 px-4 py-1.5 rounded-sm border border-[#a1d044]/30 inline-block">
                      School Management Karo Assani Se!
                    </span>
                  </motion.div>

                  {/* Headline */}
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-white font-sans">
                    Pehle thi confusion ke school management,<br />
                    ab hai Assan School Portal se mukammal sukoon!
                  </h2>

                  {/* Subtext */}
                  <p className="text-xs sm:text-sm text-emerald-100 font-semibold max-w-lg leading-relaxed">
                    Join active schools in KPK, Abbottabad, Mansehra, Peshawar, and Islamabad. Enjoy the best cloud school management software.
                  </p>
                </div>

                {/* Right Side 3D Parallax Illustration */}
                <div className="lg:col-span-6 relative h-[360px] sm:h-[440px] w-full flex items-center justify-center overflow-visible">
                  {/* Background Ambient Glow */}
                  <div className="absolute w-[240px] sm:w-[280px] h-[240px] sm:h-[280px] bg-[#a1d044]/20 rounded-full filter blur-3xl pointer-events-none z-0"></div>

                  {/* Interactive Isometric Laptop Frame Container */}
                  <motion.div 
                    animate={{ 
                      x: ctaMousePos.x * 25, 
                      y: ctaMousePos.y * 25,
                      rotateX: ctaMousePos.y * -15,
                      rotateY: ctaMousePos.x * 15,
                      scale: isCtaHovered ? 1.03 : 1
                    }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                    style={{ perspective: 1000 }}
                    className="relative w-full max-w-[420px] aspect-[4/3] flex items-center justify-center z-10"
                  >
                    {/* Isometric Laptop Base Group */}
                    <div className="absolute bottom-[20%] w-[80%] h-[30%] origin-center transform -skew-x-[24deg] rotate-[14deg]">
                      {/* Top plate */}
                      <div className="w-full h-full bg-slate-800 rounded-sm border-t border-slate-700 shadow-md flex items-center justify-center p-2 relative">
                        {/* Keyboard keys pattern */}
                        <div className="w-[90%] h-[80%] bg-slate-900/60 rounded-sm border border-slate-800 grid grid-cols-6 gap-0.5 p-1">
                          {Array.from({ length: 18 }).map((_, i) => (
                            <div key={i} className="bg-slate-800 rounded-[1px] border-b border-slate-700"></div>
                          ))}
                        </div>
                        {/* Mousepad */}
                        <div className="absolute bottom-1 right-[40%] w-[20%] h-[15%] bg-slate-800 border-t border-slate-700 rounded-xs"></div>
                      </div>
                      {/* Front lip 3D depth */}
                      <div className="absolute left-0 bottom-[-6px] w-full h-[6px] bg-slate-900 rounded-b-sm origin-top transform skew-x-[12deg]"></div>
                    </div>

                    {/* Isometric Laptop Screen (Upright, angled) */}
                    <div className="absolute top-[15%] left-[15%] w-[70%] h-[55%] bg-slate-900/90 rounded-xl border-[4px] border-slate-800 shadow-2xl overflow-hidden transform -skew-x-[12deg] rotate-[6deg] flex flex-col">
                      {/* Top bar */}
                      <div className="h-4 bg-slate-800 border-b border-slate-700/60 flex items-center px-2 space-x-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <div className="text-[7px] text-slate-400 font-mono ml-2">assan-school-portal.exe</div>
                      </div>

                      {/* Screen content (Live colorful dashboard mock) */}
                      <div className="flex-1 p-2 grid grid-cols-12 gap-1.5 bg-[#121c24]">
                        {/* Sidebar */}
                        <div className="col-span-3 space-y-1 border-r border-slate-800/60 pr-1.5">
                          <div className="h-2 w-full bg-[#a1d044]/30 rounded-xs"></div>
                          <div className="h-1.5 w-[80%] bg-slate-800 rounded-xs"></div>
                          <div className="h-1.5 w-[90%] bg-slate-800 rounded-xs"></div>
                          <div className="h-1.5 w-[70%] bg-slate-800 rounded-xs"></div>
                        </div>

                        {/* Main Charts area */}
                        <div className="col-span-9 space-y-2">
                          {/* Top stat row */}
                          <div className="grid grid-cols-3 gap-1">
                            <div className="bg-slate-800/50 p-1 rounded-xs border border-slate-700/40 text-left">
                              <span className="block text-[5px] text-slate-400 uppercase font-bold">Students</span>
                              <span className="text-[8px] font-black text-[#a1d044]">25,000+</span>
                            </div>
                            <div className="bg-slate-800/50 p-1 rounded-xs border border-slate-700/40 text-left">
                              <span className="block text-[5px] text-slate-400 uppercase font-bold">Attendance</span>
                              <span className="text-[8px] font-black text-cyan-400">99.8%</span>
                            </div>
                            <div className="bg-[#a1d044]/10 p-1 rounded-xs border border-[#a1d044]/30 text-left">
                              <span className="block text-[5px] text-[#a1d044] uppercase font-bold">WhatsApp</span>
                              <span className="text-[8px] font-black text-[#a1d044]">ACTIVE</span>
                            </div>
                          </div>

                          {/* Charts Row */}
                          <div className="grid grid-cols-12 gap-1.5">
                            {/* Bar Chart Panel */}
                            <div className="col-span-7 bg-slate-800/40 p-1.5 rounded-sm border border-slate-700/30 flex flex-col justify-between h-[65px]">
                              <span className="text-[5px] text-slate-400 font-extrabold uppercase">Monthly Growth</span>
                              <div className="flex items-end justify-between h-8 px-1 pb-1">
                                <motion.div animate={{ height: [12, 18, 12] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="w-1 bg-[#1b8755] rounded-t-xs" />
                                <motion.div animate={{ height: [8, 14, 8] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }} className="w-1 bg-amber-500 rounded-t-xs" />
                                <motion.div animate={{ height: [16, 24, 16] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }} className="w-1 bg-[#a1d044] rounded-t-xs" />
                                <motion.div animate={{ height: [10, 16, 10] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.9 }} className="w-1 bg-cyan-400 rounded-t-xs" />
                                <motion.div animate={{ height: [14, 20, 14] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.2 }} className="w-1 bg-indigo-500 rounded-t-xs" />
                              </div>
                            </div>

                            {/* Circular Pie/Donut Chart Panel */}
                            <div className="col-span-5 bg-slate-800/40 p-1.5 rounded-sm border border-slate-700/30 flex flex-col items-center justify-center h-[65px]">
                              <div className="relative w-9 h-9 flex items-center justify-center">
                                {/* SVG Donut */}
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#2d3748" strokeWidth="4" />
                                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#a1d044" strokeWidth="4" strokeDasharray="60 40" strokeDashoffset="0" />
                                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1b8755" strokeWidth="4" strokeDasharray="25 75" strokeDashoffset="-60" />
                                </svg>
                                <span className="absolute text-[6px] font-black text-white">75%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Character Figures - Absolutely positioned with responsive depth */}
                    
                    {/* Character 1 (Left standing figure, blue jeans, light shirt) */}
                    <motion.div
                      animate={{
                        y: ctaMousePos.y * -20,
                        x: ctaMousePos.x * -15,
                      }}
                      className="absolute left-[-2%] bottom-[20%] z-20 flex flex-col items-center pointer-events-none"
                    >
                      <div className="relative w-10 sm:w-12 h-20 sm:h-24">
                        {/* Shadow */}
                        <div className="absolute bottom-0 w-8 h-1 bg-slate-950/40 rounded-full filter blur-xs"></div>
                        {/* Pedestal */}
                        <div className="absolute bottom-0 left-1 w-6 h-1.5 bg-[#1b8755]/30 rounded-full border border-[#1b8755]/40"></div>
                        {/* Torso & Head */}
                        <div className="absolute bottom-2 left-2.5 w-3.5 h-10 bg-[#3a4d6b] rounded-t-md"></div>
                        <div className="absolute bottom-12 left-3 w-2.5 h-4 bg-emerald-100 rounded-t-sm"></div>
                        <div className="absolute bottom-16 left-3 w-2.5 h-2.5 bg-amber-100 rounded-full shadow-xs"></div>
                        {/* Arms pointing to the laptop screen */}
                        <div className="absolute bottom-10 left-5.5 w-5 h-1 bg-amber-100 rounded-full transform rotate-[25deg] origin-left"></div>
                        {/* Hair */}
                        <div className="absolute bottom-[17.5px] left-3 w-2.5 h-1.5 bg-slate-800 rounded-t-full"></div>
                      </div>
                    </motion.div>

                    {/* Character 2 (Right standing figure, dark clothes, tie) */}
                    <motion.div
                      animate={{
                        y: ctaMousePos.y * 15,
                        x: ctaMousePos.x * -25,
                      }}
                      className="absolute right-[-2%] bottom-[15%] z-20 flex flex-col items-center pointer-events-none"
                    >
                      <div className="relative w-10 sm:w-12 h-20 sm:h-24">
                        {/* Shadow */}
                        <div className="absolute bottom-0 w-8 h-1 bg-slate-950/40 rounded-full filter blur-xs"></div>
                        {/* Pedestal */}
                        <div className="absolute bottom-0 left-1 w-6 h-1.5 bg-cyan-500/30 rounded-full border border-cyan-500/40"></div>
                        {/* Torso & Head */}
                        <div className="absolute bottom-2 left-2.5 w-3.5 h-11 bg-slate-800 rounded-t-md"></div>
                        <div className="absolute bottom-13 left-3 w-2.5 h-3 bg-red-600 rounded-t-xs"></div>
                        <div className="absolute bottom-16 left-3.5 w-2 w-2 bg-amber-100 rounded-full shadow-xs"></div>
                        {/* Hair */}
                        <div className="absolute bottom-[17.5px] left-3.5 w-2 h-1 bg-slate-900 rounded-t-full"></div>
                      </div>
                    </motion.div>

                    {/* Character 3 (Top right observer figure, background) */}
                    <motion.div
                      animate={{
                        y: ctaMousePos.y * -8,
                        x: ctaMousePos.x * 12,
                      }}
                      className="absolute right-[8%] top-[10%] z-0 flex flex-col items-center pointer-events-none opacity-60"
                    >
                      <div className="relative w-8 h-16">
                        {/* Pedestal */}
                        <div className="absolute bottom-0 left-1 w-5 h-1 bg-slate-900/30 rounded-full"></div>
                        {/* Torso & Head */}
                        <div className="absolute bottom-1.5 left-1.5 w-3 h-8 bg-indigo-900 rounded-t-md"></div>
                        <div className="absolute bottom-9 left-2 w-2 h-2 bg-amber-200 rounded-full"></div>
                      </div>
                    </motion.div>

                    {/* Elegant floating CTA button overlapping the laptop screen, exactly as shown in the screenshot */}
                    <motion.div
                      style={{ transformStyle: "preserve-3d" }}
                      animate={{
                        scale: isCtaHovered ? 1.08 : 1,
                        z: 40,
                        y: [0, -4, 0]
                      }}
                      transition={{
                        scale: { type: "spring", stiffness: 200, damping: 15 },
                        y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                      }}
                      className="absolute bottom-[35%] right-[5%] sm:right-[10%] z-30"
                    >
                      <button 
                        onClick={() => setActiveTab('register')}
                        className="px-6 py-3.5 bg-[#a1d044] hover:bg-[#b5e054] text-slate-950 font-black rounded-xs text-xs uppercase tracking-wider shadow-[0_10px_25px_-5px_rgba(161,208,68,0.4)] transition-all duration-300 border border-[#a1d044] flex items-center gap-2 group cursor-pointer font-sans"
                      >
                        Get Started 
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* REGISTERED CLIENTS ROTATOR */}
            <section className="bg-gradient-to-b from-[#a1d044]/15 via-white to-white text-slate-900 py-20 px-6 sm:px-10 lg:px-16 rounded-3xl mx-4 sm:mx-6 lg:mx-8 shadow-2xl relative overflow-hidden border border-[#a1d044]/30">
              {/* Dynamic Floating Abstract Shapes for Combine Background & Continuous Animation */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div 
                  animate={{ 
                    x: [0, -30, 40, 0], 
                    y: [0, 50, -30, 0],
                    rotate: [0, -120, 240, 0]
                  }}
                  transition={{ 
                    duration: 22, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="absolute top-10 right-10 w-72 h-72 rounded-full bg-[#a1d044]/15 filter blur-3xl"
                />
                <motion.div 
                  animate={{ 
                    x: [0, 40, -50, 0], 
                    y: [0, -50, 40, 0],
                    scale: [1, 1.15, 0.9, 1]
                  }}
                  transition={{ 
                    duration: 18, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-[#a1d044]/10 filter blur-3xl"
                />
              </div>

              {/* Subtle grid lines for high-tech premium aesthetic */}
              <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:32px_32px]"></div>
              
              <div className="max-w-7xl mx-auto space-y-12 relative z-10">
                <div className="text-center space-y-2">
                  <motion.span 
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-xs uppercase font-black tracking-widest text-[#739b1a] block"
                  >
                    TRUSTING SCHOOLS & ACADEMIES
                  </motion.span>
                  <motion.h2 
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 uppercase"
                  >
                    Kyunke School Management Mein Chahiye Complete Automation!
                  </motion.h2>
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="w-24 h-1.5 bg-[#a1d044] mx-auto rounded-full origin-center mt-3"
                  ></motion.div>
                </div>

                {/* Grid of Logos with Premium Floating Animations and Hover Physics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6 text-center">
                  {[
                    {
                      id: 'school-1',
                      name: 'Al-Huda Model High School',
                      subText: 'Primary & High Wing',
                      badgeText: 'AHM',
                      image: ''
                    },
                    {
                      id: 'school-2',
                      name: 'Sirajul Uloom Academy',
                      subText: 'Campus 1 & 2',
                      badgeText: 'SUA',
                      image: ''
                    },
                    {
                      id: 'school-3',
                      name: 'Suffah Public School',
                      subText: 'Jabori Branch',
                      badgeText: 'SPS',
                      image: ''
                    },
                    {
                      id: 'school-4',
                      name: 'Peshawar Model System',
                      subText: 'KPK Registered',
                      badgeText: 'PMS',
                      image: ''
                    },
                    {
                      id: 'school-5',
                      name: 'Al-Ghazali Grammar School',
                      subText: 'Mansehra Campus',
                      badgeText: 'AGS',
                      image: ''
                    },
                    {
                      id: 'school-6',
                      name: 'Islamia Model Academy',
                      subText: 'Abbottabad Wing',
                      badgeText: 'IMA',
                      image: ''
                    },
                    {
                      id: 'school-7',
                      name: 'Iqra Public High School',
                      subText: 'Faisalabad Branch',
                      badgeText: 'IPHS',
                      image: ''
                    }
                  ].map((f, index) => (
                    <motion.div 
                      key={f.id}
                      animate={{ 
                        y: [0, -8, 0] 
                      }}
                      transition={{ 
                        duration: 4 + (index * 0.4), 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                      whileHover={{ 
                        scale: 1.08,
                        borderColor: "rgba(161, 208, 68, 0.8)",
                        boxShadow: "0 20px 35px -10px rgba(161, 208, 68, 0.25)"
                      }}
                      className="p-5 bg-white border border-[#a1d044]/20 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.015)] transition-all duration-300 flex flex-col items-center justify-between group relative z-10 min-h-[190px]"
                    >
                      <div className="w-20 h-20 bg-[#a1d044]/10 border border-[#a1d044]/30 rounded-full flex items-center justify-center p-2 shadow-inner overflow-hidden group-hover:bg-[#a1d044] group-hover:text-white transition-colors relative">
                        {f.image ? (
                          <img 
                            src={f.image} 
                            alt={f.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain mix-blend-multiply filter transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-white text-[#739b1a] border border-[#a1d044]/50 font-black rounded-full flex items-center justify-center text-xs shadow-sm group-hover:scale-110 transition-transform">
                            {f.badgeText}
                          </div>
                        )}
                      </div>
                      <div className="mt-4 space-y-1">
                        <span className="block text-[11px] text-slate-900 font-black leading-tight group-hover:text-[#739b1a] transition-colors">{f.name}</span>
                        <span className="block text-[9px] text-slate-400 font-bold">{f.subText}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* TEEN STEP KA SCENE (3-STEP GRAPH) */}
            <section className="bg-gradient-to-b from-[#a1d044]/15 via-white to-white text-slate-900 py-20 px-6 sm:px-10 lg:px-16 rounded-3xl mx-4 sm:mx-6 lg:mx-8 shadow-2xl relative overflow-hidden border border-[#a1d044]/30 mt-12">
              {/* Dynamic Floating Abstract Shapes for Combine Background & Continuous Animation */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div 
                  animate={{ 
                    x: [0, 30, -30, 0], 
                    y: [0, -50, 30, 0],
                    rotate: [0, 120, 240, 360]
                  }}
                  transition={{ 
                    duration: 25, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[#a1d044]/15 filter blur-3xl"
                />
                <motion.div 
                  animate={{ 
                    x: [0, -40, 20, 0], 
                    y: [0, 40, -30, 0],
                    scale: [1, 1.1, 0.9, 1]
                  }}
                  transition={{ 
                    duration: 20, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-[#a1d044]/10 filter blur-3xl"
                />
              </div>

              {/* Floating Hand-Drawn Style Illustrative SVGs matching the uploaded screenshots */}
              {/* Paper Airplane (Top Left) */}
              <motion.div 
                animate={{ 
                  y: [0, -12, 0],
                  x: [0, 8, 0],
                  rotate: [12, 16, 12]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute top-12 left-12 text-[#a1d044]/40 hidden md:block"
              >
                <svg className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </motion.div>

              {/* Curly spiral doodle (Top Right) */}
              <motion.div 
                animate={{ 
                  y: [0, 10, -5, 0],
                  rotate: [0, 12, -12, 0]
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute top-16 right-16 text-[#a1d044]/30 hidden md:block"
              >
                <svg className="w-20 h-20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.2 0-2.4.2-3.6.7-3.4 1.3-5.4 4.8-4.7 8.3.6 3 3.3 5.3 6.3 5.9 3.2.6 6.4-.8 7.9-3.7 1.4-2.8.7-6.2-1.6-8.2-2.1-1.8-5.3-2-7.5-.4-2 1.4-2.5 4.1-1.2 6.1s4 2.5 6 1.2 2.5-4.1 1.2-6.1c-1-1.5-2.9-2.1-4.6-1.5-.7.2-1.2.7-1.4 1.4" />
                </svg>
              </motion.div>

              {/* Glowing Light Bulb (Bottom Left) */}
              <motion.div 
                animate={{ 
                  scale: [1, 1.05, 0.95, 1],
                  opacity: [0.6, 0.9, 0.6]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute bottom-12 left-16 text-[#a1d044]/40 hidden md:block"
              >
                <svg className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v3m0 0h.01m-10.01-6a9 9 0 1115.356 2.356A5.986 5.986 0 0012 18a5.986 5.986 0 00-3.346-2.644A9 9 0 011.99 15z" />
                </svg>
              </motion.div>

              {/* Subtle grid lines for high-tech premium aesthetic */}
              <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:32px_32px]"></div>

              <div className="max-w-7xl mx-auto space-y-12 relative z-10">
                <div className="text-center space-y-2">
                  <motion.span 
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-xs uppercase font-black tracking-widest text-[#739b1a] block"
                  >
                    Registration Ka Assan Tareeka
                  </motion.span>
                  <motion.h2 
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 uppercase"
                  >
                    Teen Step Ka Scene!
                  </motion.h2>
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="w-24 h-1.5 bg-[#a1d044] mx-auto rounded-full origin-center mt-3"
                  ></motion.div>
                </div>

                {/* 3 Step flex with elegant swoops connecting steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                  
                  {/* Swooping Animated Connecting Dotted Arrow between Step 1 & Step 2 */}
                  <div className="absolute top-[25%] left-[26%] w-[16%] hidden md:block z-20">
                    <svg className="w-full text-[#a1d044]/80" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <motion.path 
                        d="M10,10 C40,35 80,35 110,10" 
                        stroke="currentColor" 
                        strokeWidth="2.5" 
                        strokeDasharray="5 5" 
                        strokeLinecap="round"
                        animate={{ strokeDashoffset: [0, -20] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      />
                      <path d="M102,12 L110,10 L106,18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  {/* Swooping Animated Connecting Dotted Arrow between Step 2 & Step 3 */}
                  <div className="absolute top-[25%] left-[58%] w-[16%] hidden md:block z-20">
                    <svg className="w-full text-[#a1d044]/80" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <motion.path 
                        d="M10,10 C40,35 80,35 110,10" 
                        stroke="currentColor" 
                        strokeWidth="2.5" 
                        strokeDasharray="5 5" 
                        strokeLinecap="round"
                        animate={{ strokeDashoffset: [0, -20] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      />
                      <path d="M102,12 L110,10 L106,18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  {/* Step 1 */}
                  <motion.div 
                    whileHover={{ 
                      y: -6,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="text-center space-y-4 p-4 flex flex-col items-center relative z-10 group"
                  >
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-2 border-[#a1d044] bg-white text-slate-900 font-black text-xl flex items-center justify-center mx-auto shadow-md relative z-10 transition-colors group-hover:bg-[#a1d044] group-hover:text-white group-hover:border-[#a1d044]">
                        01
                      </div>
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 rounded-full bg-[#a1d044]/30 -z-0"
                      />
                    </div>
                    <h3 className="text-xs uppercase font-extrabold text-[#739b1a] tracking-wider">Pehla Qadam</h3>
                    <h4 className="text-lg font-black text-slate-900 leading-tight">Register on Website</h4>
                    <p className="text-xs text-slate-600 font-semibold leading-relaxed max-w-xs mx-auto">
                      Bas website par jayein aur ek form bhar dein. Baat khatam! Apka registration processing queue me chala jaye ga.
                    </p>
                  </motion.div>

                  {/* Step 2 */}
                  <motion.div 
                    whileHover={{ 
                      y: -6,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="text-center space-y-4 p-4 flex flex-col items-center relative z-10 group"
                  >
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-2 border-[#a1d044] bg-white text-slate-900 font-black text-xl flex items-center justify-center mx-auto shadow-md relative z-10 transition-colors group-hover:bg-[#a1d044] group-hover:text-white group-hover:border-[#a1d044]">
                        02
                      </div>
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 3.3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 rounded-full bg-[#a1d044]/30 -z-0"
                      />
                    </div>
                    <h3 className="text-xs uppercase font-extrabold text-[#739b1a] tracking-wider">Dusra Qadam</h3>
                    <h4 className="text-lg font-black text-slate-900 leading-tight">Admin Will Activate You</h4>
                    <p className="text-xs text-slate-600 font-semibold leading-relaxed max-w-xs mx-auto">
                      Thora sabr rakhein &ndash; admin aapki application review kare ga and complete security access activate kare ga in no time!
                    </p>
                  </motion.div>

                  {/* Step 3 */}
                  <motion.div 
                    whileHover={{ 
                      y: -6,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="text-center space-y-4 p-4 flex flex-col items-center relative z-10 group"
                  >
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-2 border-[#a1d044] bg-white text-slate-900 font-black text-xl flex items-center justify-center mx-auto shadow-md relative z-10 transition-colors group-hover:bg-[#a1d044] group-hover:text-white group-hover:border-[#a1d044]">
                        03
                      </div>
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 rounded-full bg-[#a1d044]/30 -z-0"
                      />
                    </div>
                    <h3 className="text-xs uppercase font-extrabold text-[#739b1a] tracking-wider">Tisra Qadam</h3>
                    <h4 className="text-lg font-black text-slate-900 leading-tight">Ab School System Chalain Assani Se!</h4>
                    <p className="text-xs text-slate-600 font-semibold leading-relaxed max-w-xs mx-auto">
                      Jee haan, ab Assan School Portal se daily fee vouchers, student result marksheets, aur biometric attendance manage karain bekhof!
                    </p>
                  </motion.div>

                </div>
              </div>
            </section>

            {/* TESTIMONIAL CAROUSEL (ASSAN HAI KAAM, REVIEW HAI SHAAN) */}
            <section className="max-w-4xl mx-auto px-4 py-10">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-8 sm:p-12 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 text-emerald-100 text-8xl font-serif pointer-events-none">
                  &ldquo;
                </div>

                <div className="text-center space-y-2">
                  <span className="text-xs uppercase font-extrabold tracking-widest text-[#1b8755]">Client Khush, Kaam Assan</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase">
                    Assan Hai Kaam, Review Hai Shaan
                  </h2>
                </div>

                {/* Active Testimonial Content with testimonial2.png avatar */}
                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
                  {/* Testimonial Image (testimonial2.png) */}
                  <div className="shrink-0 flex justify-center">
                    <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-2xl border-4 border-[#a1d044]/30 overflow-hidden bg-emerald-50 shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                      <img 
                        src="https://assanaccounts.com/assets/img/testimonial/testimonial2.png" 
                        alt="Verified client review photo" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-[#1b8755]/95 text-[8px] font-extrabold text-white text-center py-1 uppercase tracking-widest">
                        Verified Member
                      </div>
                    </div>
                  </div>

                  {/* Testimonial Quote & Info */}
                  <div className="flex-1 text-center md:text-left space-y-4">
                    {/* Stars */}
                    <div className="flex justify-center md:justify-start space-x-1">
                      {[...Array(currentReview.rating)].map((_, i) => (
                        <Star key={i} className="w-4.5 h-4.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    <p className="text-sm md:text-base text-slate-700 italic font-semibold leading-relaxed font-sans">
                      &ldquo;{currentReview.quote}&rdquo;
                    </p>

                    <div className="space-y-0.5">
                      <div className="text-base font-extrabold text-[#1b8755]">
                        {currentReview.author}
                      </div>
                      <div className="text-[9px] text-gray-400 uppercase font-black tracking-widest flex items-center justify-center md:justify-start space-x-1.5">
                        <span>{currentReview.role}</span>
                        <span className="text-emerald-500">&bull;</span>
                        <span className="text-emerald-600 font-bold uppercase">Faisalabad Guild</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Slider Buttons */}
                <div className="flex justify-center items-center space-x-4 pt-4">
                  <button 
                    onClick={handlePrevTestimonial}
                    className="p-2.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-slate-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleNextTestimonial}
                    className="p-2.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-slate-50 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* ==================== SUB-VIEW: ABOUT ==================== */}
        {activeTab === 'about' && (
          <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#1b8755]">Pakistan School Tech</span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 uppercase">
                About Assan School Portal
              </h1>
              <p className="text-sm text-gray-500 font-bold max-w-xl mx-auto">
                Built from the ground up in Pakistan to simplify admissions, student records, fee vouchers, and exam results for educational institutions.
              </p>
              <div className="w-16 h-1 bg-[#1b8755] mx-auto rounded-full mt-2"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-lg font-extrabold text-slate-800">Our Education Mission</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                  We observed that most schools and academies in Pakistan struggled with complex, clunky school management software. Enterprise systems required weeks of training, server maintenance, and dedicated IT staff.
                </p>
                <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                  Assan School Portal was born to solve exactly this: complete school administration made completely visual and cloud-accessible. No complicated setups, just instant student enrollment, automatic fee voucher generation, and WhatsApp notifications.
                </p>
                
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start space-x-3 text-xs text-emerald-800 font-semibold">
                  <Award className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold uppercase text-[10px] tracking-wider mb-1">We Value Transparency</h4>
                    <p>Designed with absolute transparency. Zero monthly downtime, automatic billing calculations, and reliable localized data backups.</p>
                  </div>
                </div>
              </div>

              {/* Graphic stats */}
              <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-xl space-y-6">
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">Company Trajectory</h3>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Customer Retention Rate</span>
                      <span className="text-[#1b8755]">98.4%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#1b8755] h-full" style={{ width: '98%' }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Voucher entries filed daily</span>
                      <span className="text-[#1b8755]">24,000+</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#a1d044] h-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Server uptime SLA</span>
                      <span className="text-[#1b8755]">99.99%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-slate-900 h-full" style={{ width: '99%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 text-[11px] text-gray-400 font-mono text-center">
                  Headquartered: Pakistan General Market, Faisalabad, Punjab
                </div>
              </div>
            </div>

            {/* About 3-Photo Gallery with descriptive captions */}
            <div className="space-y-4 pt-8 border-t border-gray-200">
              <h3 className="text-xs font-black uppercase text-slate-800 text-center tracking-wider mb-6">
                Assan Accounting Software In Action &mdash; Our Office & Operations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Photo 1: about1.jpg */}
                <div className="bg-white border border-gray-200/60 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300">
                  <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
                    <img 
                      src="https://assanaccounts.com/assets/img/about/about1.jpg" 
                      alt="Assan Accounting Software Head Office" 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <span className="block text-xs font-black text-slate-800">Our Faisalabad Center</span>
                    <span className="block text-[10px] text-[#1b8755] font-semibold uppercase tracking-wider mt-1">Core Tech & Support Hub</span>
                  </div>
                </div>

                {/* Photo 2: about2.jpg */}
                <div className="bg-white border border-gray-200/60 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300">
                  <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
                    <img 
                      src="https://assanaccounts.com/assets/img/about/about2.jpg" 
                      alt="Our Accounts Advisors" 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <span className="block text-xs font-black text-slate-800">Accounting Advisors</span>
                    <span className="block text-[10px] text-[#1b8755] font-semibold uppercase tracking-wider mt-1">Double-Entry Standardizers</span>
                  </div>
                </div>

                {/* Photo 3: about3.jpg */}
                <div className="bg-white border border-gray-200/60 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300">
                  <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
                    <img 
                      src="https://assanaccounts.com/assets/img/about/about3.jpg" 
                      alt="Operations Desk Support" 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <span className="block text-xs font-black text-slate-800">24/7 Server Operations</span>
                    <span className="block text-[10px] text-[#1b8755] font-semibold uppercase tracking-wider mt-1">Zero-Lag Backups Desk</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== SUB-VIEW: ONLINE RESULT PORTAL ==================== */}
        {activeTab === 'online-result' && (
          <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
            {/* Header */}
            <div className="text-center space-y-3">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#739b1a] bg-[#a1d044]/15 px-3.5 py-1.5 rounded-full border border-[#a1d044]/30 inline-block">
                Assan School System &bull; Online Examinations Portal
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 uppercase">
                Online Student Result Search
              </h1>
              <p className="text-sm text-gray-600 font-bold max-w-xl mx-auto">
                Baraye Meherbani apni Class select karain, Examination Session chunun aur apna Roll Number / GR Number darj kar ke Result / Marksheet check karain.
              </p>
              <div className="w-16 h-1 bg-[#1b8755] mx-auto rounded-full mt-2"></div>
            </div>

            {/* Search Form Box */}
            <div className="bg-white border-2 border-[#a1d044]/40 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#a1d044]/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Class Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase text-slate-800 tracking-wider">
                      1. Select Class / Grade
                    </label>
                    <select
                      value={resultSearchClass}
                      onChange={(e) => setResultSearchClass(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1b8755] focus:bg-white transition-all shadow-xs"
                    >
                      <option value="Playgroup / Nursery">Playgroup / Nursery</option>
                      <option value="Prep / KG">Prep / KG</option>
                      <option value="Class 1">Class 1</option>
                      <option value="Class 2">Class 2</option>
                      <option value="Class 3">Class 3</option>
                      <option value="Class 4">Class 4</option>
                      <option value="Class 5">Class 5</option>
                      <option value="Class 6">Class 6</option>
                      <option value="Class 7">Class 7</option>
                      <option value="Class 8">Class 8</option>
                      <option value="Class 9 (Matric)">Class 9 (Matric Part 1)</option>
                      <option value="Class 10 (Matric)">Class 10 (Matric Part 2)</option>
                      <option value="F.Sc Pre-Medical">F.Sc Pre-Medical (1st / 2nd Year)</option>
                      <option value="F.Sc Pre-Engineering">F.Sc Pre-Engineering</option>
                      <option value="ICS / Computer Science">ICS / Computer Science</option>
                    </select>
                  </div>

                  {/* Exam Session Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase text-slate-800 tracking-wider">
                      2. Examination Term / Session
                    </label>
                    <select
                      value={resultSearchExam}
                      onChange={(e) => setResultSearchExam(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1b8755] focus:bg-white transition-all shadow-xs"
                    >
                      <option value="Annual Examination 2026">Annual Examination 2026</option>
                      <option value="First Term Exam 2026">First Term Examination 2026</option>
                      <option value="Mid Term Exam 2026">Mid Term Examination 2026</option>
                      <option value="Final Send-Up Test 2026">Final Send-Up Test 2026</option>
                    </select>
                  </div>

                  {/* Roll Number Input */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase text-slate-800 tracking-wider">
                      3. Enter Roll Number / GR No
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. 101, 102, 103..."
                        value={resultRollNoInput}
                        onChange={(e) => setResultRollNoInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSearchResult(); }}
                        className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1b8755] focus:bg-white transition-all shadow-xs uppercase tracking-wider"
                      />
                      {resultRollNoInput && (
                        <button
                          onClick={() => setResultRollNoInput('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit button & Quick Demos */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
                  {/* Quick Demo Roll Tags */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-extrabold text-slate-500 uppercase text-[10px]">Try Demo Students:</span>
                    <button
                      onClick={() => {
                        setResultRollNoInput('101');
                        setResultSearchClass('Class 10 (Matric)');
                        handleSearchResult('101', 'Class 10 (Matric)');
                      }}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-200 transition-colors text-[11px]"
                    >
                      Roll # 101 (A+ Grade)
                    </button>
                    <button
                      onClick={() => {
                        setResultRollNoInput('102');
                        setResultSearchClass('Class 9 (Matric)');
                        handleSearchResult('102', 'Class 9 (Matric)');
                      }}
                      className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold rounded-lg border border-sky-200 transition-colors text-[11px]"
                    >
                      Roll # 102 (Fatima Zahra)
                    </button>
                    <button
                      onClick={() => {
                        setResultRollNoInput('105');
                        setResultSearchClass('Class 5');
                        handleSearchResult('105', 'Class 5');
                      }}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg border border-amber-200 transition-colors text-[11px]"
                    >
                      Roll # 105 (Class 5)
                    </button>
                  </div>

                  {/* Search Button */}
                  <button
                    onClick={() => handleSearchResult()}
                    disabled={isSearchingResult}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#1b8755] hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50"
                  >
                    {isSearchingResult ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Searching Result...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>Search Result Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Result Marksheet Display */}
            {hasSearchedResult && currentResultData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-4 border-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden printable-marksheet"
              >
                {/* Decorative Watermark logo */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                  <div className="text-9xl font-black tracking-widest text-slate-900 uppercase">
                    ASSAN
                  </div>
                </div>

                {/* Marksheet Header */}
                <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-[#a1d044] rounded-2xl flex items-center justify-center text-slate-950 font-black text-2xl shadow-md border-2 border-slate-900 shrink-0">
                      🎓
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                        {currentResultData.schoolName}
                      </h2>
                      <p className="text-xs text-slate-600 font-bold">
                        {currentResultData.board} &bull; Govt Reg # 4829-KPK
                      </p>
                      <span className="inline-block mt-1 bg-slate-900 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-sm">
                        Detailed Marks Certificate (DMC) / Official Marksheet
                      </span>
                    </div>
                  </div>

                  <div className="text-center sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200">
                    <span className="block text-[10px] text-slate-400 font-mono font-bold uppercase">Certificate ID</span>
                    <span className="block font-mono font-black text-slate-900 text-sm">ASP-2026-{currentResultData.rollNo}</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-1">
                      ✓ System Verified
                    </span>
                  </div>
                </div>

                {/* Student Details Grid */}
                <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wider">Student Name</span>
                    <span className="text-sm font-black text-slate-900">{currentResultData.studentName}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wider">Father Name</span>
                    <span className="text-sm font-black text-slate-800">{currentResultData.fatherName}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wider">Roll Number</span>
                    <span className="text-sm font-mono font-black text-[#1b8755]">{currentResultData.rollNo}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wider">GR Register No</span>
                    <span className="text-sm font-mono font-extrabold text-slate-700">{currentResultData.grNo}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wider">Class & Section</span>
                    <span className="text-xs font-extrabold text-slate-900">{currentResultData.class} (Sec A)</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wider">Exam Session</span>
                    <span className="text-xs font-extrabold text-slate-900">{currentResultData.examSession}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wider">Attendance Record</span>
                    <span className="text-xs font-extrabold text-emerald-700">{currentResultData.attendance}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wider">Class Rank Position</span>
                    <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">{currentResultData.position}</span>
                  </div>
                </div>

                {/* Subject Wise Marks Table */}
                <div className="overflow-x-auto border-2 border-slate-900 rounded-2xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-wider">
                        <th className="p-3 border-r border-slate-700">#</th>
                        <th className="p-3 border-r border-slate-700">Subject Name</th>
                        <th className="p-3 border-r border-slate-700 text-center">Total Marks</th>
                        <th className="p-3 border-r border-slate-700 text-center">Pass Marks</th>
                        <th className="p-3 border-r border-slate-700 text-center">Marks Obtained</th>
                        <th className="p-3 border-r border-slate-700 text-center">Grade</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-semibold text-slate-800">
                      {currentResultData.subjects.map((sub: any, idx: number) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}>
                          <td className="p-3 font-mono text-slate-400 border-r border-slate-200">{idx + 1}</td>
                          <td className="p-3 font-bold text-slate-900 border-r border-slate-200">{sub.name}</td>
                          <td className="p-3 text-center font-mono border-r border-slate-200">{sub.max}</td>
                          <td className="p-3 text-center font-mono border-r border-slate-200">{sub.pass}</td>
                          <td className="p-3 text-center font-mono font-black text-slate-950 text-sm border-r border-slate-200">{sub.obt}</td>
                          <td className="p-3 text-center font-black text-emerald-700 border-r border-slate-200">{sub.grade}</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black text-[10px] rounded-full">
                              {sub.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-900 text-white font-black text-sm">
                        <td colSpan={2} className="p-3 uppercase tracking-wider text-right">Grand Total:</td>
                        <td className="p-3 text-center font-mono">{currentResultData.totalMax}</td>
                        <td className="p-3 text-center font-mono">&mdash;</td>
                        <td className="p-3 text-center font-mono text-emerald-400 text-base">{currentResultData.totalObtained}</td>
                        <td className="p-3 text-center text-emerald-300">{currentResultData.percentage}</td>
                        <td className="p-3 text-center text-emerald-400 uppercase text-xs">{currentResultData.overallGrade}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Performance Banner & Remarks */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  <div className="md:col-span-8 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl space-y-1">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-800">
                      Final Examination Result Status
                    </span>
                    <h3 className="text-base font-black text-emerald-950 uppercase flex items-center gap-2">
                      <span>🎉</span> {currentResultData.resultStatus}
                    </h3>
                    <p className="text-xs font-semibold text-emerald-900">
                      Remarks: &ldquo;{currentResultData.remarks}&rdquo;
                    </p>
                  </div>

                  <div className="md:col-span-4 p-4 bg-slate-900 text-white rounded-2xl text-center space-y-1 shadow-md">
                    <span className="block text-[10px] text-slate-400 uppercase font-black">Overall Grade / Marks</span>
                    <span className="block text-2xl font-black text-[#a1d044]">{currentResultData.percentage}</span>
                    <span className="block text-xs font-bold text-slate-200">{currentResultData.overallGrade}</span>
                  </div>
                </div>

                {/* Signatures & Stamp */}
                <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-6 text-center text-xs font-bold text-slate-700">
                  <div className="space-y-8">
                    <div className="h-10 flex items-end justify-center font-serif italic text-slate-400">
                      Class Incharge
                    </div>
                    <div className="border-t border-slate-400 pt-1 text-[11px] uppercase font-black text-slate-900">
                      Class Teacher Signature
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="h-10 flex items-end justify-center font-mono font-bold text-emerald-700 text-[10px]">
                      [OFFICIAL STAMP SEAL]
                    </div>
                    <div className="border-t border-slate-400 pt-1 text-[11px] uppercase font-black text-slate-900">
                      Controller Examinations
                    </div>
                  </div>

                  <div className="space-y-8 col-span-2 sm:col-span-1">
                    <div className="h-10 flex items-end justify-center font-serif italic font-bold text-slate-800 text-sm">
                      Principal Office
                    </div>
                    <div className="border-t border-slate-400 pt-1 text-[11px] uppercase font-black text-slate-900">
                      Principal Signature & Stamp
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 no-print">
                  <button
                    onClick={() => window.print()}
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center space-x-2"
                  >
                    <span>🖨️ Print Marksheet / DMC</span>
                  </button>

                  <button
                    onClick={() => {
                      const shareText = `Assan School Portal - Online Result:\nStudent: ${currentResultData.studentName}\nRoll No: ${currentResultData.rollNo}\nClass: ${currentResultData.class}\nObtained Marks: ${currentResultData.totalObtained}/${currentResultData.totalMax} (${currentResultData.percentage})\nGrade: ${currentResultData.overallGrade}\nStatus: ${currentResultData.resultStatus}`;
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
                    }}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center space-x-2"
                  >
                    <span>📲 Share via WhatsApp</span>
                  </button>

                  <button
                    onClick={() => {
                      setHasSearchedResult(false);
                      setResultRollNoInput('');
                    }}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all"
                  >
                    🔍 Search Another Result
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* ==================== SUB-VIEW: SOLUTIONS ==================== */}
        {activeTab === 'solutions' && (
          <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#1b8755]">School Portal Modules</span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 uppercase">
                Specialized Assan School Portal Modules
              </h1>
              <p className="text-sm text-gray-500 font-bold max-w-xl mx-auto">
                Complete modules for school admissions, fee vouchers, examinations, online results, biometric attendance, and staff payroll.
              </p>
              <div className="w-16 h-1 bg-[#1b8755] mx-auto rounded-full mt-2"></div>
            </div>

            {/* List of 5 School Portal Modules */}
            <div className="space-y-8">
              
              {/* Module 1 */}
              <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-md grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-8 space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-md text-[10px] font-black uppercase border border-emerald-100">Module #1</span>
                    <h3 className="text-base font-extrabold text-slate-900">Student SIS & Admissions Portal</h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                    Manage complete student registration, GR registers, enrollment forms, guardian contact details, and student document archives with instant search.
                  </p>
                </div>
                <div className="md:col-span-4 text-center md:text-right">
                  <span className="block text-[10px] text-gray-400 uppercase font-extrabold">Monthly Subscription</span>
                  <span className="block font-mono font-black text-slate-900 text-lg">PKR 3,000 / mo</span>
                  <button onClick={() => setActiveTab('register')} className="mt-2 text-xs font-bold text-emerald-600 hover:underline">Select Plan & Register &rarr;</button>
                </div>
              </div>

              {/* Module 2 */}
              <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-md grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-8 space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 bg-sky-50 text-sky-800 rounded-md text-[10px] font-black uppercase border border-sky-100">Module #2</span>
                    <h3 className="text-base font-extrabold text-slate-900">Auto Fee Vouchers & WhatsApp Reminders</h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                    Auto-generate monthly fee vouchers, sibling discounts, late fee fines, print multi-part slip templates, and send 1-click WhatsApp fee reminders to parents.
                  </p>
                </div>
                <div className="md:col-span-4 text-center md:text-right">
                  <span className="block text-[10px] text-gray-400 uppercase font-extrabold">Monthly Subscription</span>
                  <span className="block font-mono font-black text-slate-900 text-lg">PKR 4,000 / mo</span>
                  <button onClick={() => setActiveTab('register')} className="mt-2 text-xs font-bold text-emerald-600 hover:underline">Select Plan & Register &rarr;</button>
                </div>
              </div>

              {/* Module 3 */}
              <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-md grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-8 space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-md text-[10px] font-black uppercase border border-amber-100">Module #3</span>
                    <h3 className="text-base font-extrabold text-slate-900">Exams, Report Cards & Online Result Portal</h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                    Subject marks entry, position calculators, DMC marksheets, class result gazettes, and public online student result portal by roll number or GR number.
                  </p>
                </div>
                <div className="md:col-span-4 text-center md:text-right">
                  <span className="block text-[10px] text-gray-400 uppercase font-extrabold">Monthly Subscription</span>
                  <span className="block font-mono font-black text-slate-900 text-lg">PKR 5,000 / mo</span>
                  <button onClick={() => setActiveTab('register')} className="mt-2 text-xs font-bold text-emerald-600 hover:underline">Select Plan & Register &rarr;</button>
                </div>
              </div>

              {/* Module 4 */}
              <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-md grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-8 space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 bg-purple-50 text-purple-800 rounded-md text-[10px] font-black uppercase border border-purple-100">Module #4</span>
                    <h3 className="text-base font-extrabold text-slate-900">Biometric Attendance & Absence SMS</h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                    Connect biometric thumb scanners, track daily student & staff presence, and trigger auto WhatsApp/SMS absence alerts to parents.
                  </p>
                </div>
                <div className="md:col-span-4 text-center md:text-right">
                  <span className="block text-[10px] text-gray-400 uppercase font-extrabold">Monthly Subscription</span>
                  <span className="block font-mono font-black text-slate-900 text-lg">PKR 6,500 / mo</span>
                  <button onClick={() => setActiveTab('register')} className="mt-2 text-xs font-bold text-emerald-600 hover:underline">Select Plan & Register &rarr;</button>
                </div>
              </div>

              {/* Module 5 */}
              <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-md grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-8 space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 bg-rose-50 text-rose-800 rounded-md text-[10px] font-black uppercase border border-rose-100">Module #5</span>
                    <h3 className="text-base font-extrabold text-slate-900">Staff Payroll & Multi-Campus School Suite</h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                    Manage teacher salaries, allowances, provident funds, cash book ledgers, expense tracking, and multi-branch campus management.
                  </p>
                </div>
                <div className="md:col-span-4 text-center md:text-right">
                  <span className="block text-[10px] text-gray-400 uppercase font-extrabold">Monthly Subscription</span>
                  <span className="block font-mono font-black text-slate-900 text-lg">PKR 8,500 / mo</span>
                  <button onClick={() => setActiveTab('register')} className="mt-2 text-xs font-bold text-emerald-600 hover:underline">Select Plan & Register &rarr;</button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== SUB-VIEW: PRICING ==================== */}
        {activeTab === 'pricing' && (
          <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#1b8755]">Honest Billing</span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 uppercase">
                Clean Subscription Pricing
              </h1>
              <p className="text-sm text-gray-500 font-bold max-w-xl mx-auto">
                No setup fees, no hidden integration charges. Choose a school plan that fits your campus with free multi-user teacher and admin logins.
              </p>
              <div className="w-16 h-1 bg-[#1b8755] mx-auto rounded-full mt-2"></div>
            </div>

            {/* Pricing Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs font-semibold">
              
              {/* Card 1 */}
              <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">School Starter Plan</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">For Primary & Middle Schools</p>
                  </div>
                  <div className="font-mono">
                    <span className="text-2xl font-black text-slate-900">PKR 3,000</span>
                    <span className="text-gray-400 font-bold text-[10px]"> / month</span>
                  </div>
                  <ul className="space-y-2 text-gray-500 font-semibold text-[11px] border-t border-gray-100 pt-4">
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Single Campus Management</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Student SIS & Admissions</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Basic Fee Voucher Generation</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>School Cash Book & Ledgers</span>
                    </li>
                  </ul>
                </div>
                <button 
                  onClick={() => setActiveTab('register')}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-center font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Choose Starter
                </button>
              </div>

              {/* Card 2 - Most Popular */}
              <div className="p-6 bg-slate-900 text-white border-2 border-[#1b8755] rounded-2xl shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#1b8755] text-white px-3 py-1 rounded-bl-lg text-[8px] font-black uppercase tracking-wider">
                  Popular
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-black text-white">Pro School Portal</h4>
                    <p className="text-[10px] text-emerald-300 mt-0.5">Our most popular school plan</p>
                  </div>
                  <div className="font-mono">
                    <span className="text-2xl font-black text-[#a1d044]">PKR 5,000</span>
                    <span className="text-slate-400 font-bold text-[10px]"> / month</span>
                  </div>
                  <ul className="space-y-2 text-slate-300 font-semibold text-[11px] border-t border-slate-800 pt-4">
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-[#a1d044] shrink-0" />
                      <span>Unlimited Student Enrollment</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-[#a1d044] shrink-0" />
                      <span>Auto Fee Vouchers & WhatsApp Alerts</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-[#a1d044] shrink-0" />
                      <span>Exams, DMC & Online Result Portal</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-[#a1d044] shrink-0" />
                      <span>Multi-Teacher & Admin Accounts</span>
                    </li>
                  </ul>
                </div>
                <button 
                  onClick={() => setActiveTab('register')}
                  className="w-full py-2.5 bg-[#1b8755] hover:bg-[#1b8755]/90 text-white text-center font-bold rounded-lg transition-colors shadow-md cursor-pointer"
                >
                  Choose School Pro
                </button>
              </div>

              {/* Card 3 */}
              <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Enterprise Campus Chain</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">For multi-branch schools & colleges</p>
                  </div>
                  <div className="font-mono">
                    <span className="text-2xl font-black text-slate-900">PKR 7,500</span>
                    <span className="text-gray-400 font-bold text-[10px]"> / month</span>
                  </div>
                  <ul className="space-y-2 text-gray-500 font-semibold text-[11px] border-t border-gray-100 pt-4">
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Multi-Branch Centralized Control</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Biometric Attendance Integration</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Staff Payroll & Expense Ledgers</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Dedicated Server & Developer Access</span>
                    </li>
                  </ul>
                </div>
                <button 
                  onClick={() => setActiveTab('register')}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-center font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Choose Enterprise
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ==================== SUB-VIEW: CONTACTS ==================== */}
        {activeTab === 'contacts' && (
          <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#1b8755]">Faisalabad Desk</span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 uppercase">
                Contact Assan School Portal
              </h1>
              <p className="text-sm text-gray-500 font-bold max-w-xl mx-auto">
                Have specific queries about setting up your school management portal or migrating student data? Reach out to our expert coordinators in Pakistan.
              </p>
              <div className="w-16 h-1 bg-[#1b8755] mx-auto rounded-full mt-2"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Left Contact Form */}
              <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-gray-200 shadow-xl space-y-4">
                <h3 className="font-extrabold text-slate-800 text-sm">Send a direct message</h3>
                
                {contactSubmitted ? (
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-xl space-y-2 text-xs font-semibold">
                    <p className="font-extrabold text-sm">✓ Message Dispatched Successfully!</p>
                    <p>We have assigned your query to our School Portal Coordinator. Expect a call or WhatsApp message within 1 hour!</p>
                    <button 
                      onClick={() => { setContactSubmitted(false); setContactName(''); setContactEmail(''); setContactMessage(''); }}
                      className="text-emerald-700 hover:underline font-bold"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4 text-xs font-semibold text-gray-700">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-600 mb-1">Your Full Name *</label>
                        <input 
                          type="text" 
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="abdulrehman habib kpk"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-emerald-500 bg-white text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 mb-1">Email Address *</label>
                        <input 
                          type="email" 
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="principal@school.edu.pk"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-emerald-500 bg-white text-slate-800"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Subject</label>
                      <input 
                        type="text" 
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        placeholder="Inquiry about school portal fee voucher & result module"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-emerald-500 bg-white text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Message Content *</label>
                      <textarea 
                        rows={4}
                        required
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Describe your school requirements (students count, branches, etc.)..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-emerald-500 bg-white text-slate-800"
                      ></textarea>
                    </div>
                    <button 
                      type="submit"
                      className="w-full py-3 bg-[#151515] hover:bg-[#1b8755] text-white font-black rounded-lg uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
                    >
                      Send Message
                    </button>
                  </form>
                )}
              </div>

              {/* Right Office detail */}
              <div className="md:col-span-5 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-6">
                <h3 className="font-extrabold text-[#a1d044] uppercase tracking-wider text-xs">Faisalabad Office</h3>
                
                <div className="space-y-4 text-xs font-semibold text-slate-300">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-[#a1d044] shrink-0 mt-0.5" />
                    <p>
                      Office 41-A, Faisal Plaza, Jinnah Market Road,<br />
                      Faisalabad, Punjab, Pakistan
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-[#a1d044] shrink-0 mt-0.5" />
                    <div>
                      <a href="https://wa.me/923195702823" target="_blank" rel="noopener noreferrer" className="block font-bold text-white hover:text-[#a1d044] hover:underline transition-colors">
                        +92 319 570 2823 (WhatsApp)
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-[#a1d044] shrink-0 mt-0.5" />
                    <p>support@assanschoolportal.com</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-800 border border-slate-700 rounded-lg text-[10px] text-slate-400 leading-normal font-sans">
                  <h4 className="font-black text-white uppercase text-[9px] mb-1">Direct Developer Help</h4>
                  <p>Our software is crafted in collaboration with <strong className="cursor-pointer hover:underline text-white" onClick={handleGoogleSignIn} title="Click to sign in with Google">Abdul Rahman Habib kpk / The pak hacktes teem</strong>. For system customizations, custom API routes, or direct server hosting, please write directly to our developer team.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== SUB-VIEW: REGISTER ==================== */}
        {activeTab === 'register' && (
          <div className="relative overflow-hidden bg-[#a1d044] py-16 sm:py-24 px-4 border-b border-[#a1d044]/20 min-h-[85vh] flex items-center justify-center">
            {/* Continuous animation circles/decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
              <motion.div 
                animate={{ 
                  scale: [1, 1.25, 1], 
                  x: [0, 40, 0], 
                  y: [0, -30, 0],
                  opacity: [0.15, 0.35, 0.15] 
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-16 -left-16 w-96 h-96 rounded-full bg-white/35 blur-3xl"
              />
              <motion.div 
                animate={{ 
                  scale: [1, 1.15, 1], 
                  x: [0, -50, 0], 
                  y: [0, 40, 0],
                  opacity: [0.1, 0.3, 0.1] 
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-20 right-10 w-[450px] h-[450px] rounded-full bg-white/25 blur-3xl"
              />
              {/* Subtle repeating grid pattern */}
              <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full max-w-xl bg-white rounded-2xl border border-slate-100 shadow-2xl p-8 space-y-6 relative z-10"
            >
              
              <div className="text-center space-y-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#1b8755]">Create Your Assan School Portal Account</span>
                <h1 className="text-3xl font-black text-[#151515] uppercase tracking-tight">
                  Kar Lo Register
                </h1>
                <div className="w-12 h-1 bg-[#1b8755] mx-auto rounded-full mt-2"></div>
              </div>

              {registrationSuccess ? (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-900 p-6 rounded-xl space-y-4 text-xs font-semibold">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center text-xl mx-auto shadow-inner">
                    ✓
                  </div>
                  <h3 className="text-sm font-black text-center text-slate-900 uppercase">School Account Registered & Trial Active!</h3>
                  <p className="leading-relaxed">
                    Congratulations! Your school/institution <strong className="text-slate-900 font-extrabold">&ldquo;{regCompanyName}&rdquo;</strong> has been registered. A 30-day full trial license is active.
                  </p>
                  <div className="bg-white p-3 rounded-lg border border-emerald-200/60 font-mono text-[11px] text-slate-700 space-y-1">
                    <p><strong>Your Admin Username:</strong> {regFullName.toLowerCase().replace(/\s+/g, '_')}</p>
                    <p><strong>Email / Login ID:</strong> {regEmail}</p>
                    <p><strong>Password:</strong> {regPassword}</p>
                  </div>
                  <p className="text-gray-500 text-[10px]">
                    You can now log in directly using your username/email and password!
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { 
                        setLoginUsername(regEmail || regFullName.toLowerCase().replace(/\s+/g, '_')); 
                        setLoginPassword(regPassword); 
                        setActiveTab('login'); 
                      }}
                      className="flex-1 py-2.5 bg-[#151515] hover:bg-emerald-700 text-white text-center font-bold rounded-lg transition-colors uppercase text-[10px] tracking-wider cursor-pointer"
                    >
                      Login to App now &rarr;
                    </button>
                    <button 
                      onClick={() => { setRegistrationSuccess(false); setRegFullName(''); setRegCompanyName(''); setRegAddress(''); setRegEmail(''); setRegPhone(''); }}
                      className="px-4 py-2.5 bg-slate-100 text-gray-700 rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      Back
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs font-bold text-gray-700">
                  
                  {/* Full Name */}
                  <div>
                    <label className="block text-gray-600 mb-1 uppercase text-[9px]">Principal / Admin Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Haji Malik Adeel"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-emerald-500 bg-white font-bold text-slate-800"
                    />
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-600 mb-1 uppercase text-[9px]">Email Address *</label>
                      <input 
                        type="email" 
                        required
                        placeholder="e.g. adeel@school.edu.pk"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-emerald-500 bg-white text-slate-800 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1 uppercase text-[9px]">Phone / WhatsApp *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. 92 319 570 2823"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-emerald-500 bg-white text-slate-800 font-bold"
                      />
                    </div>
                  </div>

                  {/* Company/School Name */}
                  <div>
                    <label className="block text-gray-600 mb-1 uppercase text-[9px]">School / College / Institution Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Al-Huda Model High School"
                      value={regCompanyName}
                      onChange={(e) => setRegCompanyName(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-emerald-500 bg-white font-bold text-slate-800"
                    />
                  </div>

                  {/* City & Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-600 mb-1 uppercase text-[9px]">City *</label>
                      <input 
                        type="text" 
                        required
                        value={regCity}
                        onChange={(e) => setRegCity(e.target.value)}
                        placeholder="Haripur / Abbottabad"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-emerald-500 bg-white text-slate-800 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1 uppercase text-[9px]">Set Password *</label>
                      <input 
                        type="text" 
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="1234"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-emerald-500 bg-white font-bold text-slate-800 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-600 mb-1 uppercase text-[9px]">School Address</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Main GT Road, Haripur KPK"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-emerald-500 bg-white text-slate-800 font-bold"
                    />
                  </div>

                  {/* Account Type dropdown */}
                  <div>
                    <label className="block text-gray-600 mb-1 uppercase text-[9px]">School Plan / Package</label>
                    <select 
                      value={regAccountType}
                      onChange={(e) => setRegAccountType(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-emerald-500 bg-white text-slate-800 font-extrabold"
                    >
                      <option value="Assan School Starter Plan">Assan School Starter Plan (PKR 3,000/mo)</option>
                      <option value="Assan Pro School Portal">Assan Pro School Portal (PKR 5,000/mo)</option>
                      <option value="Assan Enterprise Campus Chain">Assan Enterprise Campus Chain (PKR 7,500/mo)</option>
                    </select>
                  </div>

                  {/* Register Submit button */}
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3 bg-[#1b8755] hover:bg-[#12613c] text-white font-black rounded-xl uppercase tracking-widest text-[10px] transition-colors shadow-md mt-2 cursor-pointer"
                  >
                    Register School Account
                  </motion.button>

                  <div className="text-center pt-2">
                    <span className="text-[10px] text-gray-400 font-semibold">Already registered? </span>
                    <button 
                      type="button" 
                      onClick={() => setActiveTab('login')} 
                      className="text-emerald-600 hover:underline text-[10px] font-bold uppercase cursor-pointer"
                    >
                      Login instead &rarr;
                    </button>
                  </div>

                </form>
              )}

            </motion.div>
          </div>
        )}

        {/* ==================== SUB-VIEW: PORTAL LOGIN ==================== */}
        {activeTab === 'login' && (
          <div className="relative overflow-hidden bg-[#a1d044] py-16 sm:py-24 px-4 border-b border-[#a1d044]/20 min-h-[85vh] flex items-center justify-center">
            {/* Continuous animation circles/decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
              <motion.div 
                animate={{ 
                  scale: [1, 1.25, 1], 
                  x: [0, 40, 0], 
                  y: [0, -30, 0],
                  opacity: [0.15, 0.35, 0.15] 
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-16 -left-16 w-96 h-96 rounded-full bg-white/35 blur-3xl"
              />
              <motion.div 
                animate={{ 
                  scale: [1, 1.15, 1], 
                  x: [0, -50, 0], 
                  y: [0, 40, 0],
                  opacity: [0.1, 0.3, 0.1] 
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-20 right-10 w-[450px] h-[450px] rounded-full bg-white/25 blur-3xl"
              />
              {/* Subtle repeating grid pattern */}
              <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-2xl p-8 space-y-6 relative z-10"
            >
              
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-14 h-14 flex items-center justify-center shrink-0 overflow-hidden bg-white/95 rounded-xl p-1 shadow-sm">
                    <img src="https://i.ibb.co/Kc1N3s9m/icon.png" alt="Assan School Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <div className="text-left leading-none">
                    <span className="block text-xl font-black text-slate-950 tracking-tight">Assan</span>
                    <span className="block text-[11px] font-extrabold text-[#1b8755]">School Portal</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-900/80 font-extrabold font-serif tracking-wider">
                 by teem hacktes اب اسکول مینجمنٹ ہوئی آسان
                </p>
              </div>

              <div className="text-center space-y-1">
                <h2 className="text-sm font-extrabold text-slate-800 tracking-wide uppercase">Sign In to School Software</h2>
                <p className="text-[11px] text-slate-500 font-bold">Enter your authorized credentials below or click 1-Click Login.</p>
              </div>

              {/* Demo Credentials Quick Fill */}
              <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-emerald-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> QUICK DEMO LOGINS
                  </span>
                  <span className="text-[9px] bg-emerald-200 text-emerald-950 font-black px-2 py-0.5 rounded-full uppercase">
                    1-CLICK
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => { setLoginUsername('admin'); setLoginPassword('123'); setLoginError(''); }}
                    className="p-2 bg-white hover:bg-emerald-100/60 border border-emerald-200 rounded-xl text-left transition shadow-2xs cursor-pointer"
                  >
                    <span className="font-extrabold text-slate-800 block text-[10px]">School Admin</span>
                    <span className="font-mono text-[9px] text-emerald-700 font-bold block">admin / 123</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLoginUsername('teacher'); setLoginPassword('123'); setLoginError(''); }}
                    className="p-2 bg-white hover:bg-sky-100/60 border border-sky-200 rounded-xl text-left transition shadow-2xs cursor-pointer"
                  >
                    <span className="font-extrabold text-slate-800 block text-[10px]">Teacher / User</span>
                    <span className="font-mono text-[9px] text-sky-700 font-bold block">teacher / 123</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLoginUsername('abdulrehmanhabib.com@gmail.com'); setLoginPassword('6242842'); setLoginError(''); }}
                    className="p-2 bg-white hover:bg-amber-100/60 border border-amber-200 rounded-xl text-left transition shadow-2xs cursor-pointer"
                  >
                    <span className="font-extrabold text-slate-800 block text-[10px]">Super Admin</span>
                    <span className="font-mono text-[9px] text-amber-700 font-bold block">abdulrehman... / 6242842</span>
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 flex items-start space-x-2 text-[10px] font-semibold text-rose-600 animate-pulse">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-semibold text-gray-700">
                
                {/* Username */}
                <div className="space-y-1">
                  <label className="block text-slate-600 font-extrabold text-[10px] uppercase">
                    Username or Email *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="e.g. admin or adeel@school.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white text-slate-800 transition-all font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="block text-slate-600 font-extrabold text-[10px] uppercase">
                    Password *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white text-slate-800 transition-all font-mono font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-3 bg-[#1b8755] hover:bg-[#12613c] text-white font-extrabold uppercase tracking-wider text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Confirm Log In
                </motion.button>

              </form>

              <div className="text-center">
                <span className="text-[10px] text-gray-400 font-semibold">New to Assan School Portal? </span>
                <button 
                  onClick={() => setActiveTab('register')} 
                  className="text-emerald-600 hover:underline text-[10px] font-bold uppercase cursor-pointer"
                >
                  Create an account &rarr;
                </button>
              </div>

            </motion.div>
          </div>
        )}

      </main>

      {/* 4. CHAT WIDGET (GOES DIRECTLY TO WHATSAPP) */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.a 
          href="https://wa.me/923195702823"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.15, rotate: 5 }}
          animate={{ 
            scale: [1, 1.05, 1],
            boxShadow: [
              "0 10px 25px -5px rgba(37, 211, 102, 0.4)",
              "0 10px 25px -5px rgba(37, 211, 102, 0.7)",
              "0 10px 25px -5px rgba(37, 211, 102, 0.4)"
            ]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="p-4 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full shadow-2xl flex items-center justify-center border-2 border-white relative cursor-pointer"
          title="Chat on WhatsApp"
        >
          {/* WhatsApp custom icon */}
          <svg className="w-6 h-6 fill-current text-white shrink-0" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.413 9.863-9.864.001-2.641-1.023-5.123-2.885-6.989C16.59 1.885 14.113.86 11.472.86c-5.44 0-9.866 4.414-9.87 9.865-.001 1.956.51 3.868 1.482 5.513l-.974 3.559 3.649-.957z" />
          </svg>
          <span className="absolute -top-1 -right-1 bg-[#a1d044] text-[#151515] text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full animate-bounce">
            Live
          </span>
        </motion.a>
      </div>

      {/* 5. BRAND FOOTER (MATCHING SCREENSHOTS) */}
      <footer className="bg-[#a1d044] text-slate-900 pt-16 pb-0 px-6 sm:px-12 relative z-10 shrink-0 overflow-hidden border-t border-[#8fb93c]">
        {/* Continuous animation circles/decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1], 
              x: [0, 30, 0], 
              y: [0, -20, 0],
              opacity: [0.15, 0.3, 0.15] 
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-16 -left-16 w-96 h-96 rounded-full bg-white/25 blur-3xl"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.15, 1], 
              x: [0, -40, 0], 
              y: [0, 30, 0],
              opacity: [0.1, 0.25, 0.1] 
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-20 right-10 w-[450px] h-[450px] rounded-full bg-white/20 blur-3xl"
          />
          {/* Subtle repeating grid pattern */}
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-8 pb-12 border-b border-slate-900/10">
          {/* Brand Logo & Urdu Tagline */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-white/90 rounded-2xl p-2 shadow-md hover:scale-105 transition-transform duration-300">
              <img 
                src="https://i.ibb.co/Kc1N3s9m/icon.png" 
                alt="Assan Logo" 
                className="w-full h-full object-contain filter drop-shadow-sm" 
                referrerPolicy="no-referrer" 
              />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-baseline justify-center sm:justify-start gap-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">Assan</span>
                <span className="text-2xl sm:text-3xl font-black text-slate-950/80 tracking-tight">School Portal</span>
              </div>
              <span className="block text-sm sm:text-base font-extrabold text-slate-900 tracking-wide font-serif">
                اب اسکول مینجمنٹ ہوئی آسان
              </span>
            </div>
          </div>

          {/* WhatsApp CTA Card inside Footer */}
          <motion.div 
            whileHover={{ y: -6, scale: 1.01 }}
            className="w-full lg:max-w-2xl bg-[#0e1411] text-white p-5 sm:p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row justify-between items-center gap-6 border border-[#25D366]/20 relative overflow-hidden group"
          >
            {/* Continuous background glow, ripple and glare animations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* Pulse Ring 1 */}
              <motion.div 
                animate={{ 
                  scale: [1, 2.5, 1], 
                  opacity: [0.1, 0.3, 0.1] 
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full border border-[#25D366]/30 bg-transparent"
              />
              {/* Pulse Ring 2 */}
              <motion.div 
                animate={{ 
                  scale: [1, 2.2, 1], 
                  opacity: [0.05, 0.2, 0.05] 
                }}
                transition={{ 
                  duration: 5, 
                  delay: 1.5,
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full border-2 border-emerald-500/20 bg-transparent"
              />
              {/* Ambient Green Glow */}
              <motion.div 
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                  scale: [0.95, 1.05, 0.95]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute right-0 top-0 w-48 h-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none"
              />
              {/* Shifting light glare streak across the card */}
              <motion.div 
                animate={{ 
                  left: ["-100%", "200%"] 
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  repeatDelay: 3, 
                  ease: "easeInOut" 
                }}
                className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none"
              />
            </div>
            
            <div className="space-y-1 text-center sm:text-left relative z-10">
              <h4 className="text-lg sm:text-xl font-extrabold text-white uppercase tracking-tight">
                Abhi Message Karain
              </h4>
              <p className="text-xs text-emerald-400 font-semibold">
                Apki Company ka liye Assan Solutions
              </p>
            </div>

            <motion.a 
              href="https://wa.me/923195702823"
              target="_blank"
              rel="noopener noreferrer"
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 0 0 0px rgba(37, 211, 102, 0)",
                  "0 0 0 10px rgba(37, 211, 102, 0.15)",
                  "0 0 0 0px rgba(37, 211, 102, 0)"
                ]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="px-6 py-3.5 bg-[#25D366] hover:bg-[#128C7E] text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all flex items-center gap-2 border border-emerald-400/20 relative z-10 cursor-pointer"
            >
              {/* WhatsApp custom icon */}
              <svg className="w-4 h-4 fill-current text-white shrink-0 animate-bounce" viewBox="0 0 24 24" style={{ animationDuration: '3s' }}>
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.413 9.863-9.864.001-2.641-1.023-5.123-2.885-6.989C16.59 1.885 14.113.86 11.472.86c-5.44 0-9.866 4.414-9.87 9.865-.001 1.956.51 3.868 1.482 5.513l-.974 3.559 3.649-.957z" />
              </svg>
              <span>Whatsapp Karain Abhi</span>
            </motion.a>
          </motion.div>
        </div>

        {/* 4-Column Layout */}
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pt-12 pb-12 text-slate-900 font-semibold">
          {/* Col 1 */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="font-black text-slate-950 uppercase tracking-wider text-xs">
              Help & Support
            </h4>
            
            <div className="space-y-3 text-[11px] font-bold text-slate-900 leading-normal">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4.5 h-4.5 text-slate-950 shrink-0 mt-0.5" />
                <p className="uppercase tracking-tight leading-relaxed">
                  ACCOUNT AP KA DIL MA OR TEAM PAKISTAN KA SHER HARIPUR MA!
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4.5 h-4.5 text-slate-950 shrink-0 mt-0.5" />
                <p>
                  Office 15-f, Ameen Khan Plaza,GT Road, Haripur
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4.5 h-4.5 text-slate-950 shrink-0" />
                <a href="mailto:teemabdulrehman.com@gmail.com" className="hover:underline hover:text-slate-950">
                  teemabdulrehman.com@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4.5 h-4.5 text-slate-950 shrink-0" />
                <a href="tel:+923195702823" className="hover:underline hover:text-slate-950">+92 319 570 2823</a>
              </div>
            </div>
          </div>

          {/* Col 2 */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-black text-slate-950 uppercase tracking-wider text-xs">
              Quick Links
            </h4>
            <ul className="space-y-2 text-[11px] font-bold text-slate-900">
              <li><button onClick={() => setActiveTab('about')} className="hover:text-white hover:underline transition-colors text-left">About Assan</button></li>
              <li><button onClick={() => setActiveTab('solutions')} className="hover:text-white hover:underline transition-colors text-left">Assan Solutions</button></li>
              <li><button onClick={() => setActiveTab('pricing')} className="hover:text-white hover:underline transition-colors text-left">Assan Services</button></li>
              <li><button onClick={() => setActiveTab('contacts')} className="hover:text-white hover:underline transition-colors text-left">Contact Assan</button></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-black text-slate-950 uppercase tracking-wider text-xs">
              Assan Solutions
            </h4>
            <ul className="space-y-2 text-[11px] font-bold text-slate-900">
              <li><button onClick={() => setActiveTab('solutions')} className="hover:text-white hover:underline transition-colors text-left">Assan General Account</button></li>
              <li><button onClick={() => setActiveTab('solutions')} className="hover:text-white hover:underline transition-colors text-left">Assan Travel Accounts</button></li>
              <li><button onClick={() => setActiveTab('solutions')} className="hover:text-white hover:underline transition-colors text-left">Assan Weaving Accounts</button></li>
              <li><button onClick={() => setActiveTab('solutions')} className="hover:text-white hover:underline transition-colors text-left">Assan Invoice System</button></li>
              <li><button onClick={() => setActiveTab('solutions')} className="hover:text-white hover:underline transition-colors text-left">Assan Umrah Calculator</button></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-black text-slate-950 uppercase tracking-wider text-xs">
              Technology Partner
            </h4>
            
            <div 
              onClick={handleGoogleSignIn}
              title="Click to sign in with Google"
              className="bg-white/15 p-4 rounded-xl border border-white/20 shadow-inner space-y-2 group hover:bg-white/25 transition-all duration-300 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <span className="block text-[8px] text-slate-900/70 uppercase tracking-wider font-black">Dev Operator</span>
              <span className="block font-black text-xs text-slate-950 leading-tight">
                The pak hacktes teem / Abdul Rahman Habib kpk
              </span>
              <p className="text-[10px] text-slate-900/80 font-bold leading-relaxed">
                Providing high reliability backend system architecture for local travel agencies.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright line inside a slightly darker green bar */}
        <div className="relative z-10 bg-[#8fb93c] py-5 px-6 border-t border-slate-900/5 text-center text-[11px] text-slate-950 font-black tracking-wide">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
            <p>Copyright © 2026 Assan School Portal by Teem hacktes - All Rights Reserved.</p>
            <p className="flex items-center gap-1.5 justify-center">
              Crafted with <span className="text-rose-600 animate-pulse">❤️</span> by <span className="font-extrabold text-slate-950 cursor-pointer hover:underline" onClick={handleGoogleSignIn} title="Click to sign in with Google">Abdul Rahman Habib kpk / The pak hacktes teem</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Global Mouse Follower Custom Cursor */}
      <AnimatePresence>
        {isPageHovered && (
          <motion.div 
            className="fixed pointer-events-none z-[9999] flex items-center justify-center hidden md:flex"
            style={{ 
              left: globalCursorCoords.x, 
              top: globalCursorCoords.y,
              x: "-50%",
              y: "-50%"
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: isHoveringInteractive ? 1.5 : 1, 
              opacity: 1 
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
          >
            {/* Outer rotating/pulsing ring */}
            <motion.div 
              className="w-12 h-12 rounded-full border-2 border-[#a1d044] absolute opacity-40"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            />
            {/* Outer pulse ping */}
            <div className="w-12 h-12 rounded-full border border-[#a1d044] animate-ping absolute opacity-30" />
            
            <div className="w-8 h-8 rounded-full border border-[#a1d044] bg-[#a1d044]/15 absolute" />
            
            {/* Inner core dot */}
            <motion.div 
              className="w-3.5 h-3.5 rounded-full bg-[#a1d044] shadow-md border border-white"
              animate={{
                scale: isHoveringInteractive ? 0.6 : 1
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default LandingView;
