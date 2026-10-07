# Smart Clinic and Pharmacy Management System - Detailed Project Report

## 1. Project Overview & Architecture
This project is a full-stack Next.js (App Router) healthcare management system tailored for clinics and pharmacies. 
It uses **TypeScript**, **Tailwind CSS**, **Supabase (PostgreSQL + Auth/Storage)**, and **Stripe** for payments. 
The system adopts a highly structured **micro-module architecture**, strictly isolating Frontend, Backend (API routes + Services + Repositories), and Database interactions.

### The Flow of Data
`Frontend (UI Components)` ↔ `Next.js API Routes (/app/api)` ↔ `Backend Services (/backend/modules/*/services)` ↔ `Repositories (/backend/modules/*/repository)` ↔ `Supabase DB`

This separation of concerns ensures that the frontend never queries the database directly, making the codebase highly scalable and secure.

---

## 2. Comprehensive Directory Breakdown

### `app/` (Next.js Frontend Routes & APIs)
This is the heart of the Next.js App Router, combining pages and backend API endpoints:
- **`app/api/`**: Contains the RESTful endpoints handling client requests.
  - `admin/`, `appointments/`, `auth/`, `doctors/`, `patient/`, `payments/`, `pharmacy/`, `prescriptions/`
- **`app/dashboard/`**: Role-based dashboards (Admin, Doctor, Patient, Pharmacist). Currently contains scaffolding/UI but lacks complete API integration.
- **`app/login/` & `app/register/`**: Authentication pages.
- **`app/patient/`**: Specific pages for patient operations (`history`, `prescriptions`, `profile`).

### `backend/` (Isolated Business Logic & DB Access)
This folder holds the strict logic layers.
- **`config/`**: Supabase and Stripe initializations (`supabase.ts`, `stripe.ts`). Supabase employs both an Anon key for frontend and a Service Role key for backend operations to bypass RLS safely.
- **`database/`**: Contains `schema.sql` (defining tables, relationships, and RLS policies) and `seed-admin.sql`.
- **`modules/`**: The core business logic, separated by domain (Admin, Appointments, Auth, Doctor, Patient, Payments, Pharmacy, Prescription).
  - **`repository/`**: Classes containing explicit Supabase queries.
  - **`services/`**: Business logic classes that consume the repositories.
- **`types/`**: `api.types.ts` and `database.types.ts` for strict Type safety across the stack.

### `frontend/` (Isolated UI Components)
- **`components/`**: Shared generic components (e.g., `DashboardLayout.tsx`).
- **`modules/`**: Feature-specific UI blocks (e.g., `LoginForm.tsx`, `PatientDashboard.tsx`, `DoctorDashboard.tsx`). Matches the backend domains.

### `scripts/` & Root Scripts
- Contains utility scripts (`fix_doctor.js`, `create-admin.js`, `check-database.js`, `seed_10_doctors.sql`). `fix_doctor.js` was clearly used to patch a missing doctor profile record for a registered user—indicating that the registration flow might not automatically create role-specific table entries yet.

---

## 3. "Broken Stuff" & Technical Debt to Amend

Based on the roadmap and codebase inspection, the system is primarily in a **Scaffold Complete** state. The UI and the Database schema exist, but the wiring between them is incomplete or "broken".

1. **Authentication Middleware is Missing:**
   - There is no JWT or Next.js middleware protecting routes (`app/dashboard/*`). Anyone navigating to `/dashboard/admin` can currently see the page. This needs immediate implementation.
2. **Frontend-to-Backend Wiring:**
   - The UI forms (login, register, appointment booking) are mostly static. They need to be wired to the existing `/app/api/...` endpoints using `fetch` or a tool like React Query/SWR.
3. **Role-Specific Profile Creation (The `fix_doctor.js` symptom):**
   - When a user registers as a Doctor or Patient, their entry in the specific `doctors` or `patients` table isn't reliably created (hence the `fix_doctor.js` script). The `auth.service.ts` or a Supabase Trigger needs to automatically insert a profile row upon signup.
4. **Error Handling & State Management:**
   - Loading states, error boundaries, and toast notifications for API failures are missing. 
5. **No Session Persistence:**
   - The user session is not actively persisted or managed across the application state.

---

## 4. Roadmap for Adding New Features & Functions

When you and I (the AI) start building, we must adhere to the **Phase-by-Phase Roadmap** outlined in the project:

### Immediate Next Steps (Priority 1)
- **JWT & Protected Routes**: Implement Next.js Middleware to parse Supabase sessions or custom JWTs, redirecting unauthenticated users to `/login` and unauthorized users away from specific dashboards.
- **Complete Auth Flow**: Connect `LoginForm.tsx` and `RegisterForm.tsx` to the `auth.service.ts`.

### Core Modules Implementation (Priority 2)
- **Patient Features**: Wire up Appointment Booking (`app/api/appointments`), Medical History viewing, and Prescription tracking.
- **Doctor Features**: Create the UI and wire up Schedule Management and Prescription Creation (note: `doctor_prescription_creation` file exists but needs completion).
- **Pharmacy & Inventory**: Wire the UI for Pharmacists to process orders based on prescriptions and update stock in Supabase.

### Advanced Features (Priority 3)
- **Stripe Payments**: Connect the `StripePaymentForm.tsx` to `/app/api/payments/route.ts` for actual payment processing and counter payments.
- **Real-Time Notifications**: Utilize Supabase's Realtime subscriptions for appointment status changes.
- **Storage/File Management**: Integrate Supabase Storage for medical record uploads and profile pictures.

## 5. Guidelines for Future AI Agent Work
When prompting me to write code for this project, keep the following rules in mind:
1. **Respect the Layers**: Never write a Supabase query inside a frontend component. Always create an API route, which calls a Service, which calls a Repository.
2. **Type Safety**: Always update `backend/types/database.types.ts` if we modify `schema.sql`.
3. **Micro-Modules**: If we add a new feature (e.g., Telemedicine), create a new folder under `backend/modules/telemedicine` and `frontend/modules/telemedicine`. Do not clutter existing modules.
