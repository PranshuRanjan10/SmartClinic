# Quick Start Guide

Get the Smart Clinic and Pharmacy Management System running in 5 minutes.

## Prerequisites
- Node.js 18+
- Supabase account
- Stripe account (test mode)

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your credentials

# 3. Run development server
npm run dev
```

Visit: http://localhost:3000

## Environment Setup

### Get Supabase Credentials
1. Create project at [supabase.com](https://supabase.com)
2. Go to Settings → API
3. Copy URL and keys to `.env`
4. Run SQL from `backend/database/schema.sql` in SQL Editor

### Get Stripe Credentials
1. Create account at [stripe.com](https://stripe.com)
2. Enable test mode
3. Go to Developers → API Keys
4. Copy keys to `.env`

## Test the App

### 1. Register Users
```
Patient:     patient@test.com / password123
Doctor:      doctor@test.com / password123
Pharmacist:  pharmacist@test.com / password123
Admin:       admin@test.com / password123
```

### 2. Access Dashboards
- Patient: http://localhost:3000/dashboard/patient
- Doctor: http://localhost:3000/dashboard/doctor
- Pharmacist: http://localhost:3000/dashboard/pharmacist
- Admin: http://localhost:3000/dashboard/admin

## Project Structure

```
├── app/                    # Pages & API routes
├── backend/                # Business logic
│   ├── modules/            # Feature modules
│   └── types/              # TypeScript types
├── frontend/               # UI components
│   └── modules/            # Feature components
└── backend/database/       # SQL schema
```

## Key Features

✅ Role-based authentication (Patient, Doctor, Pharmacist, Admin)
✅ Modular architecture (easy to extend)
✅ TypeScript for type safety
✅ Tailwind CSS for styling
✅ Supabase for database
✅ Stripe for payments
✅ Clean separation of concerns

## Next Steps

1. Read [README.md](README.md) for full documentation
2. Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed setup
3. Review [ARCHITECTURE.md](ARCHITECTURE.md) for system design
4. See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for code organization

## Common Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Lint code
```

## Need Help?

- Check documentation files
- Review code comments
- Check Supabase logs
- Check browser console

## What's Included

### Backend Modules
- ✅ Auth (login, register)
- ✅ Appointments (booking, scheduling)
- ✅ Doctor (profiles, availability)
- ✅ Pharmacy (orders, inventory)
- ✅ Payments (Stripe, counter)
- ✅ Prescriptions (creation, management)
- ✅ Admin (statistics, overview)

### Frontend Components
- ✅ Login/Register forms
- ✅ Patient dashboard
- ✅ Doctor dashboard
- ✅ Pharmacist dashboard
- ✅ Admin dashboard
- ✅ Responsive layouts

### Database Tables
- ✅ Users
- ✅ Doctors
- ✅ Patients
- ✅ Appointments
- ✅ Prescriptions
- ✅ Medicines
- ✅ Pharmacy Orders
- ✅ Payments

## Architecture Highlights

- **Micro-module design**: Each feature is independent
- **Layered backend**: Repository → Service → API Route
- **Type-safe**: Full TypeScript coverage
- **Scalable**: Easy to add new features
- **Maintainable**: Clear structure and naming

## Development Tips

1. Start with one module at a time
2. Test API routes with tools like Postman
3. Use browser DevTools for debugging
4. Check Supabase dashboard for data
5. Use Stripe test cards for payments

## Test Cards (Stripe)

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
```

## Production Checklist

- [ ] Update environment variables
- [ ] Enable Supabase RLS
- [ ] Use production Stripe keys
- [ ] Enable HTTPS
- [ ] Add authentication middleware
- [ ] Implement rate limiting
- [ ] Add logging
- [ ] Setup monitoring

Happy coding! 🚀
