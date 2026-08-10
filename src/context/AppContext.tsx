import React, { createContext, useContext, useState } from 'react';
import { SystemUser } from '../types';

interface AppContextType {
  systemUsers: SystemUser[];
  currentUser: SystemUser | null;
  setCurrentUser: (user: SystemUser | null) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  setCurrentTab: (tab: string) => void;
  addCompany: (comp: any) => void;
  addSystemUser: (user: any) => void;
  addRegistrationRequest: (req: any) => void;
  companies: any[];
  websiteConfig: any;
  blogs: any[];
  reviews: any[];
  backedFirms: any[];
}

const defaultUser: SystemUser = {
  id: 'admin-1',
  username: 'admin',
  name: 'School Admin',
  email: 'admin@school.com',
  role: 'Admin',
  status: 'Active',
  companyId: 'comp_1',
  companyName: 'Al-Huda Model School'
};

const defaultUsers: SystemUser[] = [
  defaultUser,
  {
    id: 'superadmin-1',
    username: 'adminabdulrehmanhabibkpk',
    name: 'Abdul Rehman Habib (Super Admin)',
    email: 'abdulrehmanhabib.com@gmail.com',
    role: 'Super Admin',
    status: 'Active',
    companyId: 'super_admin_system',
    companyName: 'Assan Accounts Central'
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(defaultUser);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(defaultUsers);
  const [companies, setCompanies] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([
    {
      quote: "Assan Accounting Software se humara school management buhut aasan ho gaya hai!",
      author: "Principal Muhammad Ali",
      role: "Al-Huda Model High School",
      rating: 5,
      avatar: ""
    }
  ]);
  const [backedFirms, setBackedFirms] = useState<any[]>([]);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    console.log(`[Toast ${type}]: ${msg}`);
  };

  const setCurrentTab = (tab: string) => {
    console.log(`Current tab: ${tab}`);
  };

  const addCompany = (comp: any) => {
    setCompanies((prev) => [...prev, comp]);
  };

  const addSystemUser = (user: any) => {
    setSystemUsers((prev) => [...prev, user]);
  };

  const addRegistrationRequest = (req: any) => {
    console.log('Registration request added:', req);
  };

  const websiteConfig = {
    title: 'Assan School Portal & Accounting ERP',
    tagline: 'اب اکاؤنٹس اور اسکول مینجمنٹ ہوئے آسان',
    phone: '0319-5702823',
    email: 'info@assanaccounts.com',
  };

  return (
    <AppContext.Provider
      value={{
        systemUsers,
        currentUser,
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    return {
      systemUsers: defaultUsers,
      currentUser: defaultUser,
      setCurrentUser: () => {},
      showToast: (msg: string) => console.log(msg),
      setCurrentTab: () => {},
      addCompany: () => {},
      addSystemUser: () => {},
      addRegistrationRequest: () => {},
      companies: [],
      websiteConfig: {
        title: 'Assan School Portal',
        tagline: 'اب اکاؤنٹس اور اسکول مینجمنٹ ہوئے آسان',
        phone: '0319-5702823',
        email: 'info@assanaccounts.com',
      },
      blogs: [],
      reviews: [
        {
          quote: "Assan Accounting Software se humara school management buhut aasan ho gaya hai!",
          author: "Principal Muhammad Ali",
          role: "Al-Huda Model High School",
          rating: 5,
          avatar: ""
        }
      ],
      backedFirms: []
    };
  }
  return ctx;
};
