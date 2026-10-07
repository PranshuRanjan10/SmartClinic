# Smart Clinic and Pharmacy Management System

A comprehensive full-stack healthcare management system built with Next.js, TypeScript, Tailwind CSS, Supabase, and Stripe.

## Architecture

This project follows a **micro-module, feature-based architecture** with clear separation between frontend and backend concerns.

### Project Structure

```
├── app/                          # Next.js App Router pages
│   ├── api/                      # API routes (backend endpoints)
│   ├── dashboard/                # Dashboard pages
│   ├── login/                    # Auth pages
│   └── register/
├── backend/                      # Backend logic
│   ├── config/                   # Configuration (Supabase, Stripe)
│   ├── database/                 # Database schema
│   ├── modules/                  # Feature modules
│   │   ├── auth/
│   │   │   ├── repository/       # Data access layer
│   │   │   └── services/         # Business logic
│   │   ├── appointments/
│   │   ├── doctor/
│   │   ├── pharmacy/
│   │   └── payments/
│   └── types/                    # TypeScript types
├── frontend/                     # Frontend logic
│   ├── components/               # Shared UI components
│   └── modules/                  # Feature-specific components
│       ├── auth/
│       ├── patient/
│       ├── doctor/
│       ├── pharmacist/
│       └── admin/
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Payments**: Stripe (test mode)
- **Authentication**: Custom with bcrypt

## Features

### User Roles
1. **Patient** - Book appointments, view history, order medicines
2. **Doctor** - Manage schedule, view patients, create prescriptions
3. **Pharmacist** - Process orders, manage inventory
4. **Admin** - System overview, analytics, user management

### Core Modules
- **Auth Module**: Login, registration, role-based access
- **Appointment Module**: Booking, scheduling, queue management
- **Doctor Module**: Profile, availability, time slots
- **Pharmacy Module**: Orders, inventory, medicine management
- **Payment Module**: Stripe integration, counter payments
- **Admin Module**: Dashboard, analytics, system management

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`

### 3. Database Setup
Run the SQL schema in your Supabase SQL editor:
```bash
backend/database/schema.sql
```

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000`

## Architecture Principles

### Layered Backend Architecture
```
API Routes → Services → Repository → Database
```

- **Repository Layer**: Direct database access
- **Service Layer**: Business logic and validation
- **API Routes**: HTTP handlers, minimal logic

### Frontend Module Structure
Each feature has its own module with:
- Components
- Pages
- API client functions (future)

### Key Design Decisions

1. **Micro-modules**: Each feature is self-contained and can be modified independently
2. **Separation of Concerns**: Frontend never directly accesses database
3. **Type Safety**: Comprehensive TypeScript types for all entities
4. **Scalability**: Easy to add new features without modifying existing code
5. **Maintainability**: Clear folder structure and naming conventions

## API Routes

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - Get patient appointments
- `GET /api/appointments/doctor` - Get doctor appointments

### Pharmacy
- `POST /api/pharmacy/orders` - Create pharmacy order
- `GET /api/pharmacy/orders?status=pending` - Get orders by status

### Payments
- `POST /api/payments` - Create payment

## Database Schema

See `backend/database/schema.sql` for complete schema with:
- Users, Doctors, Patients
- Appointments with queue management
- Prescriptions and Medicines
- Pharmacy Orders
- Payments with Stripe integration

## Future Enhancements

- JWT authentication
- Real-time notifications
- Analytics dashboard
- File upload for medical records
- Telemedicine integration
- SMS/Email notifications
- Advanced reporting

## Development Guidelines

1. Keep modules independent
2. Use TypeScript strictly
3. Follow the layered architecture
4. Write minimal, focused code
5. Use environment variables for secrets
6. Implement proper error handling

## License

MIT
