# Architecture Documentation

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                          │
│                     (React/Next.js Frontend)                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP/HTTPS
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      NEXT.JS APP ROUTER                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Frontend Pages                         │  │
│  │  /login  /register  /dashboard/*                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                    │
│                             │ API Calls                          │
│                             │                                    │
│  ┌──────────────────────────▼──────────────────────────────┐  │
│  │                    API Routes Layer                       │  │
│  │  /api/auth/*  /api/appointments/*  /api/pharmacy/*      │  │
│  └──────────────────────────┬──────────────────────────────┘  │
└─────────────────────────────┼─────────────────────────────────┘
                              │
                              │ Service Calls
                              │
┌─────────────────────────────▼─────────────────────────────────┐
│                    BACKEND MODULES                             │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                  Service Layer                           │  │
│  │  • Business Logic                                        │  │
│  │  • Validation                                            │  │
│  │  • Orchestration                                         │  │
│  └─────────────────────┬───────────────────────────────────┘  │
│                        │                                        │
│  ┌─────────────────────▼───────────────────────────────────┐  │
│  │                Repository Layer                          │  │
│  │  • Data Access                                           │  │
│  │  • Query Building                                        │  │
│  │  • Database Operations                                   │  │
│  └─────────────────────┬───────────────────────────────────┘  │
└────────────────────────┼───────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         │               │               │
┌────────▼────────┐ ┌───▼────────┐ ┌───▼──────────┐
│   SUPABASE      │ │   STRIPE   │ │  SUPABASE    │
│   PostgreSQL    │ │   Payment  │ │   Storage    │
│   Database      │ │   Gateway  │ │   (Files)    │
└─────────────────┘ └────────────┘ └──────────────┘
```

## Module Architecture

### Backend Module Structure

```
backend/modules/{feature}/
│
├── repository/
│   └── {feature}.repository.ts
│       • Direct database access
│       • CRUD operations
│       • Query building
│       • No business logic
│
└── services/
    └── {feature}.service.ts
        • Business logic
        • Validation
        • Orchestration
        • Calls repositories
```

### Frontend Module Structure

```
frontend/modules/{feature}/
│
├── components/
│   └── {Feature}Component.tsx
│       • UI components
│       • State management
│       • API calls
│       • User interaction
│
└── pages/ (future)
    └── {feature}Page.tsx
```

## Data Flow

### Request Flow (Create Appointment Example)

```
1. User clicks "Book Appointment"
   ↓
2. PatientDashboard.tsx (Frontend Component)
   ↓
3. fetch('/api/appointments', { method: 'POST', ... })
   ↓
4. app/api/appointments/route.ts (API Route)
   ↓
5. AppointmentService.createAppointment()
   ↓
6. AppointmentRepository.isSlotAvailable()
   AppointmentRepository.getNextQueueNumber()
   AppointmentRepository.createAppointment()
   ↓
7. Supabase Database
   ↓
8. Response flows back up the chain
   ↓
9. UI updates with new appointment
```

## Module Dependencies

```
┌─────────────────────────────────────────────────────────┐
│                    Auth Module                          │
│  • User authentication                                  │
│  • Registration                                         │
│  • Password hashing                                     │
└─────────────────────────────────────────────────────────┘
                         │
                         │ Provides user context
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Patient    │  │    Doctor    │  │    Admin     │
│   Module     │  │    Module    │  │    Module    │
└──────┬───────┘  └──────┬───────┘  └──────────────┘
       │                 │
       │                 │
       └────────┬────────┘
                │
                ▼
        ┌──────────────┐
        │ Appointment  │
        │   Module     │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │Prescription  │
        │   Module     │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │  Pharmacy    │
        │   Module     │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │   Payment    │
        │   Module     │
        └──────────────┘
```

## Database Schema Relationships

```
┌─────────┐
│  Users  │
└────┬────┘
     │
     ├──────────────┬──────────────┐
     │              │              │
     ▼              ▼              ▼
┌─────────┐   ┌─────────┐   ┌──────────┐
│Patients │   │ Doctors │   │Pharmacist│
└────┬────┘   └────┬────┘   └──────────┘
     │             │
     │             │
     └──────┬──────┘
            │
            ▼
     ┌─────────────┐
     │Appointments │
     └──────┬──────┘
            │
            ▼
     ┌─────────────┐
     │Prescriptions│
     └──────┬──────┘
            │
            ├──────────────┐
            │              │
            ▼              ▼
     ┌──────────┐   ┌──────────────┐
     │Medicines │◄──│Prescription  │
     └────┬─────┘   │  Medicines   │
          │         └──────────────┘
          │
          ▼
     ┌──────────────┐
     │Pharmacy Orders│
     └──────┬────────┘
            │
            ▼
     ┌──────────┐
     │ Payments │
     └──────────┘
```

## API Route Structure

```
/api
├── /auth
│   ├── /login          POST   - User login
│   └── /register       POST   - User registration
│
├── /appointments
│   ├── /               POST   - Create appointment
│   ├── /               GET    - Get patient appointments
│   └── /doctor         GET    - Get doctor appointments
│
├── /prescriptions
│   └── /               POST   - Create prescription
│
├── /pharmacy
│   └── /orders
│       ├── /           POST   - Create order
│       └── /           GET    - Get orders by status
│
├── /payments
│   └── /               POST   - Create payment
│
└── /admin
    └── /stats          GET    - Get dashboard stats
```

## Security Architecture

```
┌──────────────────────────────────────────────────────┐
│                   Client Request                     │
└────────────────────────┬─────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│              Authentication Middleware                │
│  • Verify user session                               │
│  • Extract user ID and role                          │
│  • Add to request headers                            │
└────────────────────────┬─────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│              Authorization Check                      │
│  • Verify user has permission                        │
│  • Check role-based access                           │
└────────────────────────┬─────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│                  API Route Handler                    │
└────────────────────────┬─────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│                  Service Layer                        │
│  • Input validation                                  │
│  • Business rules                                    │
└────────────────────────┬─────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│                Repository Layer                       │
│  • Parameterized queries                             │
│  • SQL injection prevention                          │
└────────────────────────┬─────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│                    Database                           │
│  • Row Level Security (RLS)                          │
│  • Encrypted at rest                                 │
└──────────────────────────────────────────────────────┘
```

## Scalability Considerations

### Current Architecture
- Monolithic Next.js application
- Single database
- Direct API calls

### Future Scalability Path

```
┌─────────────────────────────────────────────────────┐
│                  Load Balancer                       │
└────────────┬────────────────────────────────────────┘
             │
    ┌────────┼────────┐
    │        │        │
    ▼        ▼        ▼
┌────────┐ ┌────────┐ ┌────────┐
│Next.js │ │Next.js │ │Next.js │
│Instance│ │Instance│ │Instance│
└────┬───┘ └────┬───┘ └────┬───┘
     │          │          │
     └──────────┼──────────┘
                │
        ┌───────┼───────┐
        │       │       │
        ▼       ▼       ▼
    ┌─────┐ ┌─────┐ ┌──────┐
    │Redis│ │Queue│ │Cache │
    └─────┘ └─────┘ └──────┘
                │
                ▼
        ┌──────────────┐
        │   Database   │
        │   (Primary)  │
        └──────┬───────┘
               │
        ┌──────┴───────┐
        │              │
        ▼              ▼
    ┌────────┐    ┌────────┐
    │Replica │    │Replica │
    └────────┘    └────────┘
```

## Technology Stack

```
┌─────────────────────────────────────────────────────┐
│                   Frontend Layer                     │
│  • React 18                                         │
│  • Next.js 14 (App Router)                          │
│  • TypeScript                                       │
│  • Tailwind CSS                                     │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│                   Backend Layer                      │
│  • Next.js API Routes                               │
│  • TypeScript                                       │
│  • Service/Repository Pattern                       │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│                   Data Layer                         │
│  • Supabase (PostgreSQL)                            │
│  • Supabase Storage                                 │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│                External Services                     │
│  • Stripe (Payments)                                │
│  • Email Service (Future)                           │
│  • SMS Service (Future)                             │
└─────────────────────────────────────────────────────┘
```

## Design Patterns Used

1. **Repository Pattern**: Data access abstraction
2. **Service Layer Pattern**: Business logic separation
3. **Module Pattern**: Feature isolation
4. **Dependency Injection**: Loose coupling
5. **Factory Pattern**: Object creation (future)
6. **Observer Pattern**: Event handling (future)

## Performance Optimization

- Server-side rendering (SSR)
- Static generation where possible
- API route caching (future)
- Database query optimization
- Connection pooling
- Lazy loading components
- Code splitting
