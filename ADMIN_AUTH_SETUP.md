# Admin Authentication & Email Verification Setup Guide

## Overview

This system implements a complete admin authentication layer with email verification for both admin and user accounts.

### Features Implemented

1. **Admin Authentication**
   - Dedicated admin login page
   - Email verification requirement for admin accounts
   - Multi-level admin roles (admin, moderator, super_admin)
   - Admin management interface (add/remove/edit admins)

2. **User Email Verification**
   - Email verification during signup
   - Resend verification email functionality
   - Integration with Supabase + Resend for email delivery

3. **Database Schema**
   - New `admins` table to track admin users
   - Separate from regular user authentication

---

## Backend Setup (API Server)

### 1. Environment Variables Required

The API server needs access to Supabase credentials. Make sure these are in your `.env`:

```env
# Database Connection
SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.ybpyvctipbmwybfuhedu.supabase.co:5432/postgres
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.ybpyvctipbmwybfuhedu.supabase.co:5432/postgres

# Supabase Admin
SUPABASE_API_URL=https://ybpyvctipbmwybfuhedu.supabase.co
SUPABASE_SERVICE_ROLE_JWT=[YOUR_SERVICE_ROLE_KEY]

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173  # Development
FRONTEND_URL=https://yourdomain.com  # Production
```

### 2. Create the `admins` Table in Supabase

Run this SQL in your Supabase SQL editor:

```sql
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'admin', -- 'admin', 'super_admin', 'moderator'
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Add indexes for faster queries
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admins_role ON admins(role);
CREATE INDEX idx_admins_active ON admins(active);
```

### 3. API Endpoints

All admin endpoints require a Bearer token in the Authorization header.

#### Authentication Endpoints

**Admin Login**
```
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@ethioobiz.et",
  "password": "securepassword"
}

Response:
{
  "admin": { ... },
  "session": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresAt": 1234567890
  }
}
```

**Get Current Admin**
```
GET /api/admin/me
Authorization: Bearer [TOKEN]

Response:
{
  "id": "uuid",
  "email": "admin@ethioobiz.et",
  "firstName": "John",
  "lastName": "Doe",
  "role": "admin",
  "emailVerified": true,
  "active": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "lastLogin": "2024-01-15T10:30:00Z"
}
```

**Verify Email**
```
POST /api/admin/verify-email
Authorization: Bearer [TOKEN]

Response:
{
  "message": "Email verified successfully",
  "admin": { ... }
}
```

**Request Verification Email**
```
POST /api/admin/request-verification
Authorization: Bearer [TOKEN]

Response:
{
  "message": "Verification email sent"
}
```

#### Admin Management Endpoints (Super Admin Only)

**List All Admins**
```
GET /api/admin/admins
Authorization: Bearer [TOKEN]

Response:
[
  { ... admin objects ... }
]
```

**Add New Admin**
```
POST /api/admin/admins
Authorization: Bearer [TOKEN]
Content-Type: application/json

{
  "email": "newadmin@ethioobiz.et",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "admin"  // 'admin', 'super_admin', or 'moderator'
}

Response:
{
  "id": "uuid",
  "email": "newadmin@ethioobiz.et",
  "emailVerified": false,
  "active": true,
  ...
}
```

**Update Admin**
```
PATCH /api/admin/admins/:id
Authorization: Bearer [TOKEN]
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "moderator",
  "active": true
}

Response:
{ ... updated admin ... }
```

**Delete Admin**
```
DELETE /api/admin/admins/:id
Authorization: Bearer [TOKEN]

Response:
{
  "message": "Admin deleted"
}
```

---

## Frontend Setup

### 1. Routes Added

- `/admin/login` - Admin login page
- `/admin/verify-email` - Admin email verification
- `/admin` - Admin dashboard (requires authentication)
- `/admin/manage-admins` - Admin management (super admin only)
- `/admin/businesses` - Business management
- `/verify-email` - User email verification

### 2. Authentication Flow

#### Admin Login Flow
1. Admin visits `/admin/login`
2. Enters email and password
3. System validates against Supabase Auth + admins table
4. Checks if email is verified
5. If not verified, shows error with option to resend
6. If verified, stores token in localStorage and redirects to `/admin`
7. Admin dashboard checks for valid token on load

#### User Signup Flow
1. User visits `/signup`
2. Fills in email and password
3. Supabase sends verification email
4. User redirected to `/verify-email`
5. User clicks link in email
6. Email verified, user can access account

### 3. Key Components

**Admin Login Page** (`/admin/login`)
- Email/password form
- Error handling for unverified accounts
- Link to user login

**Email Verification Page** (`/admin/verify-email`)
- Checks verification status
- Shows resend email option
- Redirects to dashboard on success

**Admin Dashboard** (`/admin`)
- Protected route - requires valid admin token
- Shows admin user info
- Super admins can access admin management
- Logout functionality

**Manage Admins Page** (`/admin/manage-admins`)
- Super admin only
- Add new admins
- View all admins with status
- Delete admins (except self)
- Edit admin details (optional UI, API ready)

---

## Email Configuration with Resend

### Setup Resend SMTP

1. Create account at [Resend.com](https://resend.com)
2. Get your SMTP credentials
3. In Supabase Dashboard:
   - Go to Project Settings → Authentication → SMTP Settings
   - Enable Custom SMTP
   - Add Resend credentials:
     - Host: `smtp.resend.com`
     - Port: `587`
     - Username: `resend`
     - Password: `[Your Resend API Key]`
     - From Name: `EthiooBiz`
     - From Email: `noreply@yourdomain.com`

4. Test by triggering verification email

### Email Templates

Emails sent by Supabase Auth are customizable in:
- Supabase Dashboard → Authentication → Email Templates

Customize for your branding and language.

---

## Setting Up Initial Super Admin

### Option 1: Via Supabase Console

1. Create a user in Supabase Auth
2. Run this SQL in Supabase:

```sql
INSERT INTO admins (id, email, first_name, last_name, role, email_verified, active)
VALUES (
  '[USER_ID_FROM_AUTH]',
  'admin@ethioobiz.et',
  'Admin',
  'Account',
  'super_admin',
  true,
  true
);
```

### Option 2: API Call

Use the Add Admin endpoint with your first super admin's Supabase user ID.

---

## Security Considerations

1. **Email Verification Required**: Admin accounts must have verified emails before login
2. **Role-Based Access**: Different endpoints check for specific roles
3. **Token Validation**: All endpoints verify Bearer tokens against Supabase
4. **Password Hashing**: Handled by Supabase Auth
5. **CORS**: API configured to accept requests from frontend

### Best Practices

- Never hardcode admin credentials
- Use strong passwords (minimum 6 characters enforced)
- Regularly review active admins
- Monitor last login timestamps
- Rotate API keys periodically
- Use HTTPS in production

---

## Testing the System

### 1. Create a Test Admin

```bash
# Make API call to add admin
curl -X POST http://localhost:3000/api/admin/admins \
  -H "Authorization: Bearer [SUPER_ADMIN_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testadmin@ethioobiz.et",
    "firstName": "Test",
    "lastName": "Admin",
    "role": "admin"
  }'
```

### 2. Test Admin Login

```bash
# Login with test admin
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testadmin@ethioobiz.et",
    "password": "testpassword123"
  }'
```

### 3. Test Email Verification

1. Click verification link in email
2. Check admin record shows `email_verified: true`
3. Attempt login - should succeed

---

## Troubleshooting

### Admin Can't Login
- ✓ Check email is verified: `SELECT email_verified FROM admins WHERE email = '...';`
- ✓ Check admin is active: `SELECT active FROM admins WHERE email = '...';`
- ✓ Check Supabase Auth user exists
- ✓ Check password is correct

### Email Not Being Sent
- ✓ Verify SMTP settings in Supabase
- ✓ Check Resend account has credits
- ✓ Check email templates are configured
- ✓ Verify FRONTEND_URL is correct

### Token Expired
- ✓ User needs to login again
- ✓ Check token expiration: `SELECT expires_at FROM sessions;`

### Admin Can't Add Other Admins
- ✓ Verify current admin role is `super_admin`
- ✓ Check API response for permission errors

---

## Next Steps

1. **Test the complete flow** locally
2. **Configure Resend SMTP** with your domain
3. **Create initial super admin** account
4. **Deploy to staging** for testing
5. **Configure production environment** variables
6. **Deploy to production**

## Support

For questions about specific implementations, refer to:
- Supabase Docs: https://supabase.com/docs
- Resend Email: https://resend.com/docs
- API Server Routes: `/artifacts/api-server/src/routes/admin-auth.ts`
- Frontend Pages: `/artifacts/ethiobiz/src/pages/admin/`
