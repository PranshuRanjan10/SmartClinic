# Project Structure Documentation

## Overview
This document explains the micro-module architecture of the Smart Clinic and Pharmacy Management System.

## Directory Structure

```
smart-clinic-pharmacy-system/
│
├── app/                                    # Next.js App Router
│   ├── api/                                # Backend API Routes
│   │   ├── admin/
│   │   │   └── stats/route.ts              # Admin statistics endpoint
│   │   ├── appointments/
│   │   │   ├── route.ts                    # Patient appointments CRUD
│   │   │   └── doctor/route.ts             # Doctor appointments view
│   │   ├── auth/
│   │   │   ├── login/route.ts              # Login endpoint
│   │   │   └── register/route.ts           # Registration endpoint
│   │   ├── payments/route.ts               # Payment processing
│   │   ├── pharmacy/
│   │   │   └── orders/route.ts             # Pharmacy orders
│   │   └── prescriptions/route.ts          # Prescription management
│   │
│   ├── dashboard/                          # Dashboard Pages
│   │   ├── admin/page.tsx
│   │   ├── doctor/page.tsx
│   │   ├── patient/page.tsx
│   │   └── pharmacist/page.tsx
│   │
│   ├── login/page.tsx                      # Login page
│   ├── register/page.tsx                   # Registration page
│   ├── page.tsx                            # Home page
│   ├── layout.tsx                          # Root layout
│   └── globals.css                         # Global styles
│
├── backend/                                # Backend Logic (Isolated)
│   ├── config/                             # Configuration
│   │   ├── supabase.ts                     # Supabase client setup
│   │   └── stripe.ts                       # Stripe client setup
│   │
│   ├── database/                           # Database
│   │   └── schema.sql                      # PostgreSQL schema
│   │
│   ├── modules/                            # Feature Modules
│   │   ├── admin/
│   │   │   └── services/
│   │   │       └── admin.service.ts        # Admin business logic
│   │   │
│   │   ├── appointments/
│   │   │   ├── repository/
│   │   │   │   └── appointment.repository.ts  # Data access
│   │   │   └── services/
│   │   │       └── appointment.service.ts     # Business logic
│   │   │
│   │   ├── auth/
│   │   │   ├── repository/
│   │   │   │   └── auth.repository.ts
│   │   │   └── services/
│   │   │       └── auth.service.ts
│   │   │
│   │   ├── doctor/
│   │   │   ├── repository/
│   │   │   │   └── doctor.repository.ts
│   │   │   └── services/
│   │   │       └── doctor.service.ts
│   │   │
│   │   ├── patient/
│   │   │   └── repository/
│   │   │       └── patient.repository.ts
│   │   │
│   │   ├── payments/
│   │   │   ├── repository/
│   │   │   │   └── payment.repository.ts
│   │   │   └── services/
│   │   │       └── payment.service.ts
│   │   │
│   │   ├── pharmacy/
│   │   │   ├── repository/
│   │   │   │   ├── medicine.repository.ts
│   │   │   │   └── pharmacy.repository.ts
│   │   │   └── services/
│   │   │       └── pharmacy.service.ts
│   │   │
│   │   └── prescription/
│   │       ├── repository/
│   │       │   └── prescription.repository.ts
│   │       └── services/
│   │           └── prescription.service.ts
│   │
│   └── types/                              # TypeScript Types
│       ├── api.types.ts                    # API request/response types
│       └── database.types.ts               # Database entity types
│
├── frontend/                               # Frontend Logic (Isolated)
│   ├── components/                         # Shared Components
│   │   └── DashboardLayout.tsx             # Dashboard wrapper
│   │
│   └── modules/                            # Feature Modules
│       ├── admin/
│       │   └── components/
│       │       └── AdminDashboard.tsx
│       │
│       ├── auth/
│       │   └── components/
│       │       ├── LoginForm.tsx
│       │       └── RegisterForm.tsx
│       │
│       ├── doctor/
│       │   └── components/
│       │       └── DoctorDashboard.tsx
│       │
│       ├── patient/
│       │   └── components/
│       │       └── PatientDashboard.tsx
│       │
│       └── pharmacist/
│           └── components/
│               └── PharmacistDashboard.tsx
│
├── .env.example                            # Environment variables template
├── .gitignore                              # Git ignore rules
├── next.config.js                          # Next.js configuration
├── package.json                            # Dependencies
├── postcss.config.js                       # PostCSS configuration
├── README.md                               # Project documentation
├── tailwind.config.ts                      # Tailwind configuration
└── tsconfig.json                           # TypeScript configuration
```

## Module Architecture

### Backend Modules
Each backend module follows a layered architecture:

```
Module/
├── repository/          # Data Access Layer
│   └── *.repository.ts  # Direct database operations
└── services/            # Business Logic Layer
    └── *.service.ts     # Business rules, validation
```

**Flow**: API Route → Service → Repository → Database

### Frontend Modules
Each frontend module contains:

```
Module/
├── components/          # UI Components
│   └── *.tsx           # React components
└── pages/              # Page components (future)
    └── *.tsx
```

## Module Responsibilities

### Auth Module
- User authentication
- Registration
- Password hashing (try salting / or other simpler yet effective methods for password security)
- Session management (future: JWT)

### Appointment Module
- Appointment booking
- Time slot management
- Queue number generation
- Double booking prevention
- Status updates

### Doctor Module
- Doctor profile management
- Working hours configuration
- Time slot generation
- Availability management

### Patient Module
- Patient profile management
- Medical history
- Appointment history

### Pharmacy Module
- Medicine inventory
- Order processing
- Stock management
- Availability checking

### Prescription Module
- Prescription creation
- Medicine association
- Prescription history

### Payment Module
- Stripe integration
- Counter payment processing
- Payment status tracking
- Revenue calculation

### Admin Module
- Dashboard statistics
- System overview
- User management (future)

## Design Principles

### 1. Separation of Concerns
- Frontend handles UI and user interaction
- Backend handles business logic and data
- No direct database access from frontend

### 2. Single Responsibility
- Each module handles one feature
- Each service handles one business domain
- Each repository handles one entity

### 3. Dependency Direction
```
Frontend → API Routes → Services → Repositories → Database
```

### 4. Independence
- Modules can be modified without affecting others
- New features can be added as new modules
- Modules can be replaced independently

### 5. Scalability
- Easy to add new features
- Easy to split into microservices
- Easy to add caching, queues, etc.

## Adding New Features

### Backend Feature
1. Create module folder: `backend/modules/feature-name/`
2. Add repository: `repository/feature.repository.ts`
3. Add service: `services/feature.service.ts`
4. Create API route: `app/api/feature-name/route.ts`
5. Add types: Update `backend/types/`

### Frontend Feature
1. Create module folder: `frontend/modules/feature-name/`
2. Add components: `components/FeatureComponent.tsx`
3. Create page: `app/feature-name/page.tsx`
4. Add to navigation

## Best Practices

1. **Keep modules small and focused**
2. **Use TypeScript strictly**
3. **Follow naming conventions**
4. **Write minimal code**
5. **Avoid code duplication**
6. **Use environment variables**
7. **Handle errors properly**
8. **Document complex logic**

## Future Enhancements

- Add middleware layer for authentication (very important task for later)
- Implement caching layer
- Add event-driven architecture (check this again to understand better)
- Implement message queues
- Add logging and monitoring
- Implement API versioning (check this again and understand better)
