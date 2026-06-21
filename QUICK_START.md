# Quick Start Guide - Admin Auth System

## What Was Built

A complete admin authentication and email verification system for EthiooBiz with:
- Admin login with email verification
- Multiple admin roles (admin, moderator, super_admin)
- Super admin panel to manage other admins
- User email verification during signup

## 5-Minute Setup

### 1. Add Supabase Service Key to `.env`

Go to your Supabase dashboard → Settings → API → Copy **Service Role Key**

```env
# In C:\ETBZ\EBZrp\EBZ\.env, replace:
SUPABASE_SERVICE_ROLE_JWT=YOUR_SERVICE_ROLE_KEY_HERE
```

### 2. Create Admin Table in Supabase

Supabase Dashboard → SQL Editor → Copy and run:

```sql
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'admin',
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admins_role ON admins(role);
CREATE INDEX idx_admins_active ON admins(active);
```

### 3. Create Your First Super Admin

In Supabase SQL Editor, run:

```sql
-- First, get your user ID from auth.users
SELECT id, email FROM auth.users LIMIT 1;

-- Then use that ID in this insert:
INSERT INTO admins (id, email, first_name, last_name, role, email_verified, active)
VALUES ('[YOUR_USER_ID]', 'your-email@ethioobiz.et', 'Your', 'Name', 'super_admin', true, true);
```

### 4. Configure Email (Resend + Supabase SMTP)

1. Create free account at https://resend.com
2. Get your API key
3. In Supabase Dashboard:
   - Settings → Authentication → Email Settings
   - Scroll down to "SMTP Settings"
   - Toggle "Enable Custom SMTP"
   - Fill in:
     ```
     Host: smtp.resend.com
     Port: 587
     Username: resend
     Password: re_[your_resend_api_key]
     From Email: noreply@yourdomain.com
     From Name: EthiooBiz
     ```

### 5. Start Development

```bash
# Terminal 1 - Start API server
cd c:\ETBZ\EBZrp\EBZ\artifacts\api-server
pnpm run dev

# Terminal 2 - Start Frontend
cd c:\ETBZ\EBZrp\EBZ\artifacts\ethiobiz
pnpm run dev
```

## Test It

1. Visit `http://localhost:5173/admin/login`
2. Login with your super admin credentials
3. Redirect to dashboard
4. Click "Manage Admins"
5. Add a new admin
6. Check email for verification link
7. Verify and test login with new admin

## Key URLs

- **Admin Login**: `http://localhost:5173/admin/login`
- **Admin Dashboard**: `http://localhost:5173/admin`
- **Manage Admins**: `http://localhost:5173/admin/manage-admins`
- **User Signup**: `http://localhost:5173/signup`
- **User Login**: `http://localhost:5173/login`

## API Endpoints

```bash
# Admin Login
POST /api/admin/login
{ "email": "admin@ethioobiz.et", "password": "..." }

# Get Current Admin
GET /api/admin/me
Headers: Authorization: Bearer [TOKEN]

# List All Admins (super admin only)
GET /api/admin/admins
Headers: Authorization: Bearer [TOKEN]

# Add Admin (super admin only)
POST /api/admin/admins
Headers: Authorization: Bearer [TOKEN]
Body: { "email": "...", "firstName": "...", "lastName": "...", "role": "admin" }

# Verify Email
POST /api/admin/verify-email
Headers: Authorization: Bearer [TOKEN]

# Request Verification Email
POST /api/admin/request-verification
Headers: Authorization: Bearer [TOKEN]
```

## Files Changed/Created

### New Files
- `/lib/db/src/schema/admins.ts` - Admin database schema
- `/artifacts/api-server/src/routes/admin-auth.ts` - Backend API routes
- `/artifacts/ethiobiz/src/pages/admin/login.tsx` - Admin login page
- `/artifacts/ethiobiz/src/pages/admin/verify-email.tsx` - Admin verification page
- `/artifacts/ethiobiz/src/pages/admin/manage-admins.tsx` - Admin management
- `/artifacts/ethiobiz/src/pages/verify-email.tsx` - User verification
- `/.env.example` - Environment template
- `/ADMIN_AUTH_SETUP.md` - Detailed setup guide
- `/IMPLEMENTATION_CHECKLIST.md` - Full checklist

### Updated Files
- `/lib/db/src/schema/index.ts` - Export admins schema
- `/artifacts/api-server/src/routes/index.ts` - Added admin routes
- `/artifacts/ethiobiz/src/App.tsx` - Added new routes
- `/artifacts/ethiobiz/src/pages/signup.tsx` - Email verification redirect
- `/.env` - Added new environment variables

## Common Issues

**"SUPABASE_SERVICE_ROLE_JWT must be set"**
- Add your service role key from Supabase to `.env`

**"Admin table doesn't exist"**
- Run the SQL migration in Supabase SQL Editor

**"Email not sending"**
- Check Resend SMTP is configured in Supabase
- Verify Resend account has credits

**"Can't login with new admin"**
- Ensure email_verified is true in database
- Check token hasn't expired

## Full Documentation

See detailed guides:
- `ADMIN_AUTH_SETUP.md` - Complete setup with all options
- `IMPLEMENTATION_CHECKLIST.md` - Full checklist and testing

## Features Breakdown

### Admin Features
✅ Email/password login  
✅ Email verification requirement  
✅ Multi-level roles (admin, moderator, super_admin)  
✅ Add/remove/manage other admins (super admin only)  
✅ Dashboard with business stats  
✅ Business management & approval  
✅ Logout functionality  

### User Features
✅ Email/password signup  
✅ Email verification  
✅ Business listing submission  
✅ Account management  

### Security
✅ Token-based authentication  
✅ Role-based access control  
✅ Email verification required for admin access  
✅ Password hashing (Supabase Auth)  
✅ CORS configured  

---

You're all set! Run the development servers and test the admin login flow.
