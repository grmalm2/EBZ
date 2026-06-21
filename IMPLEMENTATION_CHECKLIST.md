# Admin Authentication Implementation Checklist

## ✅ What Has Been Implemented

### Database Schema
- [x] Created `admins` table schema in `/lib/db/src/schema/admins.ts`
- [x] Added admin schema export to `/lib/db/src/schema/index.ts`
- [x] Support for multiple admin roles: admin, moderator, super_admin

### Backend API Routes
- [x] `/api/admin/login` - Admin authentication
- [x] `/api/admin/me` - Get current admin profile
- [x] `/api/admin/verify-email` - Verify email after clicking link
- [x] `/api/admin/request-verification` - Resend verification email
- [x] `/api/admin/admins` - List all admins (super admin only)
- [x] `/api/admin/admins` (POST) - Add new admin (super admin only)
- [x] `/api/admin/admins/:id` (PATCH) - Update admin (super admin only)
- [x] `/api/admin/admins/:id` (DELETE) - Delete admin (super admin only)

### Frontend Pages
- [x] `/admin/login` - Admin login page with email verification checks
- [x] `/admin/verify-email` - Admin email verification page
- [x] `/admin` - Protected admin dashboard with logout
- [x] `/admin/manage-admins` - Super admin management interface
- [x] `/verify-email` - User email verification page
- [x] Updated `/signup` - Redirects to email verification

### User Email Verification
- [x] Email verification flow for user signup
- [x] Resend verification email functionality
- [x] Integration ready for Resend + Supabase SMTP

### Security Features
- [x] Email verification requirement for admin access
- [x] Role-based access control
- [x] Token-based authentication
- [x] Admin status verification before login
- [x] Active admin status check

---

## 🔧 Configuration Required

### 1. Get Supabase Credentials

Visit your Supabase project dashboard:
1. Go to **Settings** → **API**
2. Copy your **Service Role Key** (keep this secret!)
3. Add to `.env`:

```env
SUPABASE_SERVICE_ROLE_JWT=[paste_service_role_key_here]
```

### 2. Create Admin Table in Database

Run this SQL in your Supabase dashboard (SQL Editor):

```sql
-- Create admins table
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

-- Create indexes for performance
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admins_role ON admins(role);
CREATE INDEX idx_admins_active ON admins(active);
```

### 3. Set Up Resend (for email delivery)

1. Create account at https://resend.com
2. Get your API key
3. In Supabase Dashboard:
   - Go to **Settings** → **Authentication** → **Email Settings**
   - Scroll to **SMTP Settings**
   - Enable **Custom SMTP**
   - Add Resend credentials:
     - Host: `smtp.resend.com`
     - Port: `587`
     - Username: `resend`
     - Password: `re_[your_resend_api_key]`
     - From Email: `noreply@yourdomain.com`
     - From Name: `EthiooBiz`

### 4. Environment Variables Checklist

Make sure your `.env` has:

```env
# ✓ Required
PORT=3000
SESSION_SECRET=[your_session_secret]
DATABASE_URL=[your_database_url]
SUPABASE_DB_URL=[your_database_url]
NEXT_PUBLIC_SUPABASE_URL=[your_database_url]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your_anon_key]
SUPABASE_API_URL=https://ybpyvctipbmwybfuhedu.supabase.co
SUPABASE_SERVICE_ROLE_JWT=[paste_service_role_key]
FRONTEND_URL=http://localhost:5173
```

---

## 🚀 Next Steps to Run the System

### Step 1: Install Dependencies (if not already done)

```bash
cd c:\ETBZ\EBZrp\EBZ
pnpm install
```

### Step 2: Run Database Migrations

If your project uses migrations, run them:

```bash
pnpm run db:migrate
# or
pnpm run db:push
```

### Step 3: Create Initial Super Admin

Option A - Via SQL (recommended for first setup):

```sql
-- Get a user ID from auth.users table first
INSERT INTO admins (
  id, 
  email, 
  first_name, 
  last_name, 
  role, 
  email_verified, 
  active
) VALUES (
  '[copy_id_from_auth_users]',
  'admin@ethioobiz.et',
  'Admin',
  'Account',
  'super_admin',
  true,
  true
);
```

Option B - Via API:
1. First create a test user in Supabase Auth
2. Use API endpoint to add them as super admin

### Step 4: Start Development Servers

Terminal 1 - API Server:
```bash
cd artifacts/api-server
pnpm run dev
```

Terminal 2 - Frontend:
```bash
cd artifacts/ethiobiz
pnpm run dev
```

### Step 5: Test the Flow

1. Visit `http://localhost:5173/admin/login`
2. Login with your super admin credentials
3. Navigate to `/admin/manage-admins`
4. Add a new admin
5. Verify email delivery (check spam folder)
6. Click verification link
7. Try logging in with new admin

---

## 📋 Pages Overview

### Admin Routes
| Route | Purpose | Auth Required | Role |
|-------|---------|---------------|------|
| `/admin/login` | Admin login page | No | Any |
| `/admin` | Dashboard | Yes | admin+ |
| `/admin/verify-email` | Email verification | Yes | Any |
| `/admin/manage-admins` | Admin management | Yes | super_admin |
| `/admin/businesses` | Business management | Yes | admin+ |

### User Routes
| Route | Purpose | Auth Required |
|-------|---------|---------------|
| `/signup` | User signup | No |
| `/verify-email` | Email verification | Yes |
| `/login` | User login | No |

---

## 🧪 Testing Endpoints

### Test Admin Login

```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ethioobiz.et",
    "password": "your_password"
  }'
```

### Test Get Current Admin

```bash
curl -X GET http://localhost:3000/api/admin/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Add Admin

```bash
curl -X POST http://localhost:3000/api/admin/admins \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newadmin@ethioobiz.et",
    "firstName": "Jane",
    "lastName": "Doe",
    "role": "admin"
  }'
```

---

## ⚠️ Important Notes

1. **SUPABASE_SERVICE_ROLE_JWT**: Keep this secret! Don't commit to Git.
2. **FRONTEND_URL**: Make sure this matches your frontend URL in development and production.
3. **Email Verification**: Users must verify email before fully accessing admin dashboard.
4. **Database Migration**: The `admins` table must exist before running the API server.
5. **Resend Setup**: Without proper SMTP, verification emails won't send.

---

## 🐛 Troubleshooting

### "SUPABASE_SERVICE_ROLE_JWT must be set"
- Solution: Add `SUPABASE_SERVICE_ROLE_JWT` to your `.env` file

### "Email verification table doesn't exist"
- Solution: Run the SQL migration to create the `admins` table

### "Admin can't login - email not verified"
- Solution: Set `email_verified: true` in database or resend verification email

### "Email not being sent"
- Solution: Check Resend SMTP configuration in Supabase Settings

### "Token expired"
- Solution: Admin needs to login again

---

## 📚 File Structure

```
artifacts/
├── api-server/
│   └── src/routes/
│       ├── admin-auth.ts (NEW - all admin endpoints)
│       └── index.ts (UPDATED - added admin-auth router)
│
├── ethiobiz/
│   └── src/
│       ├── pages/
│       │   ├── admin/
│       │   │   ├── login.tsx (NEW - admin login)
│       │   │   ├── verify-email.tsx (NEW - admin email verification)
│       │   │   └── manage-admins.tsx (NEW - admin management)
│       │   ├── verify-email.tsx (NEW - user email verification)
│       │   └── signup.tsx (UPDATED - redirects to email verification)
│       └── App.tsx (UPDATED - added new routes)
│
lib/db/
└── src/schema/
    ├── admins.ts (NEW - admin table schema)
    └── index.ts (UPDATED - export admins schema)

.env (UPDATED - added SUPABASE_SERVICE_ROLE_JWT, FRONTEND_URL)
.env.example (NEW - template for environment variables)
ADMIN_AUTH_SETUP.md (NEW - complete setup guide)
IMPLEMENTATION_CHECKLIST.md (THIS FILE)
```

---

## ✨ Summary

You now have a complete admin authentication system with:
- ✅ Multi-level admin roles
- ✅ Email verification requirement
- ✅ Admin management interface  
- ✅ User email verification
- ✅ Secure token-based auth
- ✅ Production-ready code

Next: Configure Resend SMTP and create your first super admin account!
