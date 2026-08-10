/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Student {
  id: string;
  rollNumber: string;
  name: string;
  class: string;
  section: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  parentName: string;
  phoneNumber: string;
  email: string;
  address: string;
  admissionDate: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  subjectId?: string;
  period?: number;
}

export interface FeeStructure {
  id: string;
  className: string;
  category: string;
  amount: number;
  description: string;
}

export interface FeePayment {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  method: 'Cash' | 'Card' | 'UPI' | 'Net Banking' | 'Cheque';
  status: 'Paid' | 'Pending' | 'Partial';
  receiptNumber: string;
}

export interface Question {
  id: string;
  subject: string;
  class: string;
  chapter: string;
  type: 'MCQ' | 'Short' | 'Long';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionText: string;
  marks: number;
  options?: string[]; // For MCQ
  answer?: string;
}

export interface Exam {
  id: string;
  title: string;
  class: string;
  subject: string;
  date: string;
  startTime: string;
  duration: number; // in minutes
  totalMarks: number;
  room?: string;
}

export interface ExamResult {
  id: string;
  studentId: string;
  examId: string;
  marksObtained: number;
  grade: string;
  remarks: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  department: string;
}

export interface SystemUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Staff' | 'Teacher' | 'Student' | string;
  status: 'Active' | 'Suspended' | string;
  activity?: string;
  companyId?: string;
  companyName?: string;
  password?: string;
  emailVerified?: boolean;
}
