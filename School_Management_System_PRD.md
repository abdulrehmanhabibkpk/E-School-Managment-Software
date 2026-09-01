# Product Requirements Document (PRD)
## School Management System (SMS)

| Field | Detail |
|---|---|
| Document Version | 1.0 |
| Date | September 1, 2026 |
| Prepared For | School Management System – Full Stack Web Application |
| Tech Stack (as implemented) | React.js, Node.js, Express.js, MongoDB, Tailwind CSS, Socket.io, JWT, Cloudinary, Nodemailer, Razorpay, Chart.js |
| Status | Live / Deployment-Ready |

---

## 1. Executive Summary

The School Management System (SMS) is a full-stack, role-based web application that digitizes core school operations — admissions, attendance, fees, homework, examinations, communication, and reporting — for four primary user groups: **Admins, Teachers, Students, and Parents**. The platform integrates an **AI Assistant layer** for report card comments, quiz generation, homework help, and administrative content generation, along with real-time chat via Socket.io and online fee collection via Razorpay.

This document defines the product scope, functional and non-functional requirements, user roles, data/module breakdown, and deployment expectations for the system as built (MERN stack), and can also serve as the baseline specification if the same feature set is to be re-implemented on a **PHP stack** (e.g., Laravel/CodeIgniter + MySQL) — architecture equivalences are noted in Section 10.

---

## 2. Problem Statement

Schools, particularly small-to-mid-sized institutions, rely on manual or fragmented systems (registers, spreadsheets, WhatsApp groups) for attendance, fee collection, homework distribution, and parent communication. This causes:

- Delayed or lost communication between school, teachers, and parents
- Manual, error-prone attendance and fee tracking
- No centralized academic record (homework, results, report cards)
- No real-time visibility for parents into their child's academic and financial status

**Goal:** Provide a single, secure, role-based platform that centralizes school administration, academics, communication, and payments — with AI-assisted content generation to reduce staff workload.

---

## 3. Objectives & Success Metrics

| Objective | Success Metric |
|---|---|
| Digitize attendance | 100% of daily attendance recorded digitally within the platform |
| Centralize fee management | Reduce manual fee reconciliation effort; online payment adoption via Razorpay |
| Improve parent engagement | Parents can view attendance, fees, homework, results in real time |
| Reduce staff workload | AI Assistant reduces time spent drafting report card comments, notices, reminders |
| Secure access | Zero unauthorized access incidents (RBAC + JWT enforced on all protected routes/APIs) |
| Scalable onboarding | New school can be registered and OTP-verified in under 10 minutes |

---

## 4. User Roles & Personas

| Role | Description | Primary Needs |
|---|---|---|
| **Super Admin / School Admin** | Manages the school's entire digital operation | Registration, staff/student onboarding, settings, analytics |
| **Teacher** | Manages classes, attendance, homework, exams | Fast attendance entry, homework creation, grading, communication |
| **Student** | Consumes academic content, submits work | View homework, study material, attendance, fees, results |
| **Parent** | Monitors child's academic/financial status | Attendance, fee status, results, notices, communication with school |

Authentication and permissions are enforced via **JWT + Role-Based Access Control (RBAC)**, so each role only sees modules and API endpoints relevant to it.

---

## 5. Functional Requirements

### 5.1 Admin Dashboard
- School registration with **OTP email verification**
- Dashboard analytics (enrollment, attendance %, fee collection, etc.)
- Student, Teacher, Parent management (CRUD)
- Class & Subject management
- School settings (branding, academic year, configuration)

### 5.2 Student Dashboard
- Attendance tracking (view own record)
- Homework listing and submission
- Study material access (PDFs, notes, worksheets, past papers)
- Online fee payment
- Exam schedule viewing
- AI Homework Helper
- AI Quiz Generator
- Report card viewing

### 5.3 Parent Dashboard
- Child's attendance record
- Fee status and payment history
- Homework visibility
- Exam results
- School notices
- Academic progress overview

### 5.4 AI Assistant Module
- School insights (data-driven summaries for admin)
- General AI chat assistant
- Report card comment generator
- Fee reminder message generator
- Notice/circular generator
- Event planner assistant
- Homework helper (student-facing)
- Quiz generator (student/teacher-facing)

### 5.5 Attendance Management
- Daily attendance entry (teacher)
- Bulk attendance marking
- Monthly attendance reports
- Attendance analytics/trends

### 5.6 Fee Management
- Configurable fee structure (per class/category)
- Fee collection (online via Razorpay + manual entry)
- Pending fee tracking
- Payment history log
- Fee reports (exportable)
- Concession/discount management

### 5.7 Homework & Assignment Module
- Create homework with due dates
- Track student submissions
- Assignment status management (pending/submitted/graded)

### 5.8 Timetable Management
- Weekly timetable per class
- Teacher schedule view
- Class schedule view
- Support for multiple periods/slots per day

### 5.9 Test & Examination Module
- Create tests/exams
- Publish results
- Auto-generate report cards

### 5.10 Real-Time Communication
- Admin ↔ Teacher chat
- Teacher ↔ Student chat
- Parent communication channel
- Real-time messaging via **Socket.io**

### 5.11 Reports & Analytics
- Attendance reports
- Financial reports
- Student performance reports
- Fee reports
- CSV export for all major reports
- Dashboard-level analytics (Chart.js visualizations)

### 5.12 Study Material Module
- Upload PDFs, notes, worksheets, previous year papers
- File storage/delivery via **Cloudinary**

### 5.13 Email Notification System
- OTP verification emails
- Auto-generated login credentials for teachers, students, and parents
- Automated transactional emails via **Nodemailer**

---

## 6. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Security** | JWT authentication, bcrypt password hashing, RBAC, protected routes and APIs |
| **Performance** | Dashboard and report queries should return within acceptable load times for a mid-size school (500–2000 users) |
| **Scalability** | Modular folder structure to support horizontal feature growth |
| **Availability** | Deployable on Vercel (frontend) + Render (backend) + MongoDB Atlas (DB) with standard uptime expectations |
| **Usability** | Responsive UI (mobile/tablet/desktop) using Tailwind CSS and Lucide icons |
| **Auditability** | Payment history, attendance logs, and submission logs must be retrievable historically |
| **Data Privacy** | Role-based data isolation — a school's data must not be visible to another school (multi-tenant boundary) |

---

## 7. Technical Architecture (As Implemented)

- **Frontend:** React.js + Tailwind CSS + Lucide Icons — SPA with role-based routing
- **Backend:** Node.js + Express.js — REST API following MVC pattern
- **Database:** MongoDB (via MongoDB Atlas)
- **Real-Time Layer:** Socket.io for chat/messaging
- **File Storage:** Cloudinary (PDFs, study material, media)
- **Payments:** Razorpay integration for online fee collection
- **Email:** Nodemailer (OTP, credentials, notifications)
- **Auth:** JWT-based sessions with bcrypt password hashing
- **Charts/Analytics:** Chart.js
- **Architecture Pattern:** MVC, modular folder structure, reusable components, REST APIs

### Deployment Targets
- Frontend → Vercel
- Backend → Render
- Database → MongoDB Atlas
- File/Media → Cloudinary

---

## 8. Data Model Overview (High-Level Entities)

| Entity | Key Fields (indicative) |
|---|---|
| School | name, address, admin contact, settings, verification status |
| User (Admin/Teacher/Student/Parent) | name, email, role, password (hashed), schoolId |
| Class | name, section, teacherId, subjects[] |
| Subject | name, classId, teacherId |
| Attendance | studentId, classId, date, status |
| Fee | studentId, structureId, amount, status, paymentHistory[] |
| Homework | classId, subjectId, dueDate, submissions[] |
| Exam/Test | classId, subjectId, schedule, results[] |
| Notice | title, body, targetRole(s), schoolId |
| Message | senderId, receiverId, content, timestamp |
| StudyMaterial | title, fileUrl (Cloudinary), classId, type |

---

## 9. Security Requirements

- All passwords stored using **bcrypt** hashing — never plaintext.
- All API routes protected via **JWT middleware**; role validated on every request (RBAC).
- OTP-based email verification for new school registration.
- Auto-generated credentials for teachers/students/parents sent via secure email, with forced first-login password change recommended.
- File uploads restricted by type/size and routed through Cloudinary (no direct server file storage).
- Payment transactions handled via Razorpay's secure API (no raw card data touches the app server).

---

## 10. Note on PHP Implementation Equivalence

Since this system was built and is described here in the **MERN stack**, if the same PRD is used to (re)build the project in **PHP**, the following technology mapping is recommended:

| MERN Component | PHP Equivalent |
|---|---|
| Node.js + Express.js | PHP + Laravel (or CodeIgniter) |
| MongoDB | MySQL / MariaDB (relational schema recommended given the structured entities above) |
| JWT (jsonwebtoken) | `firebase/php-jwt` or Laravel Sanctum/Passport |
| bcrypt (Node) | PHP `password_hash()` / `password_verify()` (bcrypt algorithm) |
| Socket.io | Laravel WebSockets, Pusher, or Ratchet (PHP WebSocket library) |
| Nodemailer | PHPMailer or Laravel Mail |
| Cloudinary SDK (Node) | Cloudinary PHP SDK (official support available) |
| Razorpay (Node SDK) | Razorpay PHP SDK (official support available) |
| React.js + Tailwind | Can remain React (frontend-agnostic) consuming PHP REST APIs, or Blade + Tailwind if a server-rendered approach is preferred |
| Chart.js | Same (frontend library, stack-independent) |

All functional requirements (Sections 5–6) remain identical regardless of backend language — only the implementation layer changes.

---

## 11. Assumptions

- Single school per registration, with potential multi-school (multi-tenant) support governed by `schoolId` scoping.
- Internet connectivity is assumed for real-time chat and payment features.
- Email delivery (OTP, credentials) depends on a functioning SMTP/Nodemailer or PHPMailer configuration.

## 12. Out of Scope (v1)

- Native mobile applications (iOS/Android) — web-responsive only.
- Offline-first attendance capture.
- Multi-language/localization support.
- Biometric attendance integration.

## 13. Deliverables

- Complete frontend source code
- Complete backend source code
- Database setup scripts/schema
- Documentation + README setup guide
- Environment variable configuration guide
- Deployment guide (Vercel / Render / MongoDB Atlas / Cloudinary)
- Lifetime updates (per vendor terms)

---

*End of Document*
