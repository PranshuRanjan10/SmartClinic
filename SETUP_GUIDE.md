# Setup Guide

Complete step-by-step guide to set up the Smart Clinic and Pharmacy Management System.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier works)
- Stripe account (test mode)
- Git (optional)

## Step 1: Install Dependencies

```bash
npm install
```

This will install:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Supabase client
- Stripe SDK
- bcryptjs for password hashing
- Zod for validation

## Step 2: Supabase Setup

### 2.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details
5. Wait for project to be created

### 2.2 Get API Keys
1. Go to Project Settings → API
2. Copy the following:
   - Project URL
   - `anon` public key
   - `service_role` secret key (keep this secure!)

### 2.3 Create Database Tables
1. Go to SQL Editor in Supabase dashboard
2. Open `backend/database/schema.sql`
3. Copy the entire SQL content
4. Paste into SQL Editor
5. Click "Run"
6. Verify all tables are created in Table Editor

## Step 3: Stripe Setup

### 3.1 Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Sign up for an account
3. Activate test mode (toggle in top right)

### 3.2 Get API Keys
1. Go to Developers → API Keys
2. Copy:
   - Publishable key (starts with `pk_test_`)
   - Secret key (starts with `sk_test_`)

### 3.3 Webhook Setup (Optional for now)
1. Go to Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.failed`
4. Copy webhook secret

## Step 4: Environment Variables

### 4.1 Create .env file
```bash
cp .env.example .env
```

### 4.2 Fill in values
Open `.env` and add your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 5: Run Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000`

## Step 6: Test the Application

### 6.1 Register a User
1. Click "Register"
2. Fill in details
3. Select role (start with "Patient")
4. Submit

### 6.2 Login
1. Use registered credentials
2. You'll be redirected to role-specific dashboard

### 6.3 Test Each Role
Register users with different roles:
- Patient
- Doctor
- Pharmacist
- Admin

## Step 7: Seed Sample Data (Optional)

Create sample data for testing:

### Sample Doctor
```sql
-- First create a user
INSERT INTO users (name, email, password, role)
VALUES ('Dr. John Smith', 'doctor@test.com', '$2a$10$...', 'doctor');

-- Then create doctor profile (use the user_id from above)
INSERT INTO doctors (user_id, specialization, license_number, consultation_fee, working_hours_start, working_hours_end, slot_duration)
VALUES ('user-id-here', 'General Medicine', 'DOC12345', 50.00, '09:00', '17:00', 30);
```

### Sample Medicines
```sql
INSERT INTO medicines (name, manufacturer, unit_price, stock_quantity, reorder_level)
VALUES 
  ('Paracetamol 500mg', 'PharmaCorp', 5.00, 100, 20),
  ('Amoxicillin 250mg', 'MediLab', 15.00, 50, 10),
  ('Ibuprofen 400mg', 'HealthPharma', 8.00, 75, 15);
```

## Troubleshooting

### Issue: Module not found errors
**Solution**: Run `npm install` again

### Issue: Supabase connection error
**Solution**: 
- Check if API keys are correct
- Verify project URL is correct
- Check if tables are created

### Issue: Stripe payment not working
**Solution**:
- Verify you're in test mode
- Check API keys are correct
- Use test card: 4242 4242 4242 4242

### Issue: Build errors
**Solution**:
```bash
rm -rf .next
rm -rf node_modules
npm install
npm run dev
```

### Issue: TypeScript errors
**Solution**: Check `tsconfig.json` paths are correct

## Production Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production
- Update `NEXT_PUBLIC_APP_URL` to your domain
- Use production Supabase project
- Use production Stripe keys
- Enable Stripe webhooks

## Security Checklist

- [ ] Never commit `.env` file
- [ ] Keep `SUPABASE_SERVICE_ROLE_KEY` secret
- [ ] Keep `STRIPE_SECRET_KEY` secret
- [ ] Use HTTPS in production
- [ ] Enable Row Level Security in Supabase
- [ ] Implement proper authentication middleware
- [ ] Validate all user inputs
- [ ] Sanitize database queries

## Next Steps

1. Implement JWT authentication
2. Add email verification
3. Implement file upload for medical records
4. Add real-time notifications
5. Implement advanced search
6. Add analytics dashboard
7. Implement telemedicine features
8. Add SMS/Email notifications

## Support

For issues or questions:
1. Check documentation
2. Review error logs
3. Check Supabase logs
4. Check Stripe dashboard

## Useful Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Type check
npx tsc --noEmit
```

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
