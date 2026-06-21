# Admin Authentication System - Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React/Vite)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────┐      ┌──────────────────────────┐    │
│  │   User Authentication    │      │  Admin Authentication    │    │
│  ├──────────────────────────┤      ├──────────────────────────┤    │
│  │ • /login                 │      │ • /admin/login           │    │
│  │ • /signup                │      │ • /admin/verify-email    │    │
│  │ • /verify-email          │      │ • /admin (dashboard)     │    │
│  │ • /add-business          │      │ • /admin/manage-admins   │    │
│  │                          │      │ • /admin/businesses      │    │
│  └──────────────────────────┘      └──────────────────────────┘    │
│                                                                      │
│  Token Storage: localStorage (adminToken, adminUser for admin)     │
│                 Supabase Session (user)                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
                    ┌───────────────────────────────┐
                    │   HTTP/CORS                   │
                    │   Bearer Token in Header      │
                    └───────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                   BACKEND API (Express.js)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │              Middleware                                    │    │
│  ├────────────────────────────────────────────────────────────┤    │
│  │ • CORS Handling                                            │    │
│  │ • JSON Parser                                              │    │
│  │ • Cookie Parser                                            │    │
│  │ • Logging (Pino)                                           │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                    ↓                                 │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │          Route Handlers (admin-auth.ts)                   │    │
│  ├────────────────────────────────────────────────────────────┤    │
│  │ • POST   /admin/login                [Auth + User Check]  │    │
│  │ • GET    /admin/me                   [Token Validation]   │    │
│  │ • POST   /admin/verify-email         [Token Validation]   │    │
│  │ • POST   /admin/request-verification [Token Validation]   │    │
│  │ • GET    /admin/admins               [SuperAdmin Check]   │    │
│  │ • POST   /admin/admins               [SuperAdmin Check]   │    │
│  │ • PATCH  /admin/admins/:id           [SuperAdmin Check]   │    │
│  │ • DELETE /admin/admins/:id           [SuperAdmin Check]   │    │
│  └────────────────────────────────────────────────────────────┘    │
│                    ↓                          ↓                      │
│          ┌─────────────────────┐    ┌──────────────────┐            │
│          │  Token Validation   │    │ Role Checking    │            │
│          │  (Supabase Auth)    │    │ (Database)       │            │
│          └─────────────────────┘    └──────────────────┘            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                 Supabase Backend (Authentication)                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │            PostgreSQL Database                           │      │
│  ├──────────────────────────────────────────────────────────┤      │
│  │                                                          │      │
│  │  ┌────────────────────────────────────────────────┐    │      │
│  │  │ auth.users (Supabase Auth Table)              │    │      │
│  │  ├────────────────────────────────────────────────┤    │      │
│  │  │ • id (UUID)                                    │    │      │
│  │  │ • email                                        │    │      │
│  │  │ • encrypted_password                           │    │      │
│  │  │ • email_confirmed_at                           │    │      │
│  │  │ • created_at                                   │    │      │
│  │  └────────────────────────────────────────────────┘    │      │
│  │                                                          │      │
│  │  ┌────────────────────────────────────────────────┐    │      │
│  │  │ public.admins (Custom Table)                  │    │      │
│  │  ├────────────────────────────────────────────────┤    │      │
│  │  │ • id (TEXT, FK to auth.users)                 │    │      │
│  │  │ • email (UNIQUE)                              │    │      │
│  │  │ • first_name                                  │    │      │
│  │  │ • last_name                                   │    │      │
│  │  │ • role (admin|moderator|super_admin)          │    │      │
│  │  │ • email_verified (BOOLEAN)                    │    │      │
│  │  │ • active (BOOLEAN)                            │    │      │
│  │  │ • created_at                                  │    │      │
│  │  │ • last_login                                  │    │      │
│  │  └────────────────────────────────────────────────┘    │      │
│  │                                                          │      │
│  └──────────────────────────────────────────────────────────┘      │
│                                                                      │
│  Indexes:                                                           │
│  • idx_admins_email                                                 │
│  • idx_admins_role                                                  │
│  • idx_admins_active                                                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│              Email Service (Supabase + Resend SMTP)                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  When verification email needed:                                    │
│  1. Backend calls: supabaseAdmin.auth.admin.generateLink()          │
│  2. Link generated with redirect_to parameter                       │
│  3. Email sent via Resend SMTP (configured in Supabase)            │
│  4. User clicks link in email                                       │
│  5. Redirects to frontend with verification token                   │
│  6. Frontend verifies email via API                                 │
│  7. Backend marks email_verified = true                             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Sequences

### Admin Login Sequence

```
User                     Frontend                Backend              Supabase
 │                          │                       │                    │
 │─── Enter credentials ────→│                       │                    │
 │                          │─── POST /admin/login ─→│                    │
 │                          │                       │─ Check email ──────→│
 │                          │                       │                    │
 │                          │                       │←─ User data ────────│
 │                          │                       │                    │
 │                          │                       │─ Query admins table │
 │                          │                       │  (Drizzle ORM)     │
 │                          │                       │                    │
 │                          │                       │← Admin record ─────│
 │                          │                       │                    │
 │                          │  Verify:              │                    │
 │                          │  1. Email verified?   │                    │
 │                          │  2. Account active?   │                    │
 │                          │  3. Role OK?          │                    │
 │                          │                       │                    │
 │                          │←── Token + Admin ─────│                    │
 │                          │                       │                    │
 │←─ Redirect /admin ───────│                       │                    │
 │                          │                       │                    │
 └──┬─ Store token in localStorage                  │                    │
    │  localStorage.adminToken = "..."              │                    │
    │  localStorage.adminUser = {...}               │                    │
    └──→
```

### Super Admin Adding New Admin Sequence

```
Super Admin              Frontend                Backend              Supabase
    │                       │                       │                    │
    │─ Fill form ──→        │                       │                    │
    │                       │─ POST /admin/admins ─→│                    │
    │                       │  + Bearer Token       │                    │
    │                       │                       │                    │
    │                       │                       │─ Verify superadmin │
    │                       │                       │                    │
    │                       │                       │─ Create Auth user ─→│
    │                       │                       │                   ╱│
    │                       │                       │←─ User created ─╱  │
    │                       │                       │                    │
    │                       │                       │─ Insert admin ─────→│
    │                       │                       │  record in admins   │
    │                       │                       │                    │
    │                       │                       │←─ Admin created ────│
    │                       │                       │                    │
    │                       │                       │─ Send invitation ──→│
    │                       │                       │  generateLink()     │
    │                       │                       │                    │
    │                       │←─ Success message ────│                    │
    │                       │                       │                    │
    │←─ Show success toast ─│                       │                    │
    │                       │                       │                    │
    │                       │                       │                    │
    ↓                       ↓                       ↓                    ↓
    
    New Admin receives email with:
    Subject: Invitation to EthiooBiz Admin
    Body: Click link to set password
    Link: https://frontend/admin/setup-password?token=...
    
    After clicking:
    1. New Admin sets password in Supabase
    2. Email automatically marked as verified
    3. Can now login with credentials
```

### User Signup & Email Verification Sequence

```
User                     Frontend                Backend              Supabase
 │                          │                       │                    │
 │─── Fill signup form ─────→│                       │                    │
 │                          │─ POST /signup ────────────────────────────→│
 │                          │  (Supabase client)                          │
 │                          │                       │                    │
 │                          │                       │  ┌─ Create user    │
 │                          │                       │  ├─ Send email     │
 │                          │                       │←─ Confirmation ────│
 │                          │                       │                    │
 │                          │←─ Redirect /verify-email                   │
 │                          │                       │                    │
 │─ Check email ────────────→│                       │                    │
 │ (user receives email)     │                       │                    │
 │                          │                       │                    │
 │─ Click verification ─────→│ (OAuth callback)      │                    │
 │   link in email           │                       │                    │
 │                          │─────────────────────────── Verify token ───→│
 │                          │                       │                    │
 │                          │                       │←─ Email verified ──│
 │                          │                       │                    │
 │                          │←─ Redirect /login ────│                    │
 │                          │                       │                    │
 │─ Login with email ───────→│                       │                    │
 │   & password              │                       │                    │
 │                          │                       │  Full access! ✓    │
 └──────────────────────────→
```

---

## Role Hierarchy

```
┌─────────────────────────────────────┐
│        Role-Based Permissions       │
├─────────────────────────────────────┤
│                                     │
│  super_admin                        │
│  ├─ Can login to admin panel        │
│  ├─ Can manage all admins           │
│  ├─ Can add/edit/delete admins      │
│  ├─ Can view all businesses         │
│  ├─ Can approve businesses          │
│  ├─ Can modify business listings    │
│  └─ Can manage ads                  │
│                                     │
│  admin                              │
│  ├─ Can login to admin panel        │
│  ├─ Can view all businesses         │
│  ├─ Can approve businesses          │
│  ├─ Can modify business listings    │
│  ├─ Can manage ads                  │
│  └─ Cannot manage admins            │
│                                     │
│  moderator                          │
│  ├─ Can login to admin panel        │
│  ├─ Can view all businesses         │
│  ├─ Can flag/review suspicious     │
│  │   listings                       │
│  └─ Cannot approve businesses      │
│                                     │
│  (regular user)                     │
│  ├─ Can signup/login               │
│  ├─ Can add business listings      │
│  ├─ Cannot access admin panel      │
│  └─ Cannot verify others           │
│                                     │
└─────────────────────────────────────┘
```

---

## Component Dependencies

```
Frontend Structure:
├── pages/
│   ├── admin/
│   │   ├── index.tsx (Dashboard)
│   │   │   ├── Requires: adminToken in localStorage
│   │   │   ├── Fetches: /api/admin/me
│   │   │   └── Fetches: /api/dashboard/stats
│   │   ├── login.tsx
│   │   │   └── Calls: POST /api/admin/login
│   │   ├── verify-email.tsx
│   │   │   ├── Calls: POST /api/admin/verify-email
│   │   │   └── Calls: POST /api/admin/request-verification
│   │   ├── manage-admins.tsx
│   │   │   ├── Fetches: GET /api/admin/admins
│   │   │   ├── Calls: POST /api/admin/admins
│   │   │   ├── Calls: PATCH /api/admin/admins/:id
│   │   │   └── Calls: DELETE /api/admin/admins/:id
│   │   └── businesses.tsx (existing)
│   │       └── Calls: existing business endpoints
│   ├── signup.tsx (updated)
│   │   └── Redirects to /verify-email
│   ├── verify-email.tsx (new)
│   │   └── Calls: POST /api/admin/verify-email (for user flow)
│   └── ...other pages
│
└── lib/
    ├── supabase.ts (frontend client)
    └── i18n.ts

Backend Structure:
├── routes/
│   ├── admin-auth.ts (NEW)
│   │   ├── Uses: db (Drizzle ORM)
│   │   ├── Uses: supabaseAdmin
│   │   └── Uses: Supabase Auth
│   ├── auth.ts (existing)
│   ├── businesses.ts (existing)
│   └── ...other routes
│
├── lib/
│   ├── logger.ts
│   └── (other utilities)
│
└── middleware/ (existing patterns)
```

---

## Technology Stack

```
Frontend:
├── React (UI framework)
├── TypeScript (type safety)
├── Vite (bundler)
├── Wouter (routing)
├── React Hook Form + Zod (form validation)
├── TanStack Query (API state)
├── Tailwind CSS (styling)
├── Radix UI (components)
└── Supabase JS Client (auth)

Backend:
├── Express.js (HTTP server)
├── TypeScript (type safety)
├── Drizzle ORM (database queries)
├── PostgreSQL (database)
├── Supabase (auth + database)
├── Zod (validation)
├── Pino (logging)
└── Node.js (runtime)

Database:
├── PostgreSQL (Supabase)
├── Drizzle ORM (query builder)
└── Custom Tables: admins

Email:
├── Supabase Auth (user management)
├── Resend (SMTP provider)
└── Custom SMTP relay
```

---

## Security Layers

```
┌─ Layer 1: HTTPS Transport ─────────────────────────────┐
│ All communication encrypted in transit                 │
└────────────────────────────────────────────────────────┘
                         ↓
┌─ Layer 2: CORS Policy ─────────────────────────────────┐
│ Only frontend domain can make API requests             │
│ Origins: http://localhost:5173, https://yourdomain.com │
└────────────────────────────────────────────────────────┘
                         ↓
┌─ Layer 3: Token Validation ────────────────────────────┐
│ Every request includes Bearer token                    │
│ Token validated against Supabase Auth                  │
└────────────────────────────────────────────────────────┘
                         ↓
┌─ Layer 4: Role Authorization ──────────────────────────┐
│ User role checked from database                        │
│ Different endpoints require different roles            │
└────────────────────────────────────────────────────────┘
                         ↓
┌─ Layer 5: Email Verification ──────────────────────────┐
│ Admin accounts must have verified emails               │
│ Login denied until verified                            │
└────────────────────────────────────────────────────────┘
                         ↓
┌─ Layer 6: Database Encryption ─────────────────────────┐
│ Passwords hashed with bcrypt (Supabase)               │
│ Database connection encrypted                         │
└────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Production Environment                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Vercel (Frontend Hosting)               │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ • React app deployed automatically on git push       │  │
│  │ • CDN for global distribution                        │  │
│  │ • Environment variables (VITE_SUPABASE_*)           │  │
│  │ • Auto SSL/HTTPS                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓ API calls                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      Your Server (API + Node.js)                    │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ • Express.js backend deployed                        │  │
│  │ • Environment variables (SUPABASE_*)                │  │
│  │ • Auto restart on errors                             │  │
│  │ • Log aggregation                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓                                 │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Supabase (Database & Auth)                │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ • PostgreSQL database (ybpyvctipbmwybfuhedu)       │  │
│  │ • Supabase Auth (password hashing, JWT)            │  │
│  │ • Automated backups                                 │  │
│  │ • Row-level security policies                       │  │
│  │ • SSL/TLS connections                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓                                 │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Email Service (Resend)                    │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ • SMTP relay for email delivery                     │  │
│  │ • Configured in Supabase SMTP settings              │  │
│  │ • Delivery logs and bounce handling                 │  │
│  │ • Custom from address (noreply@yourdomain.com)     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

This architecture provides:
- ✅ Scalability (Vercel auto-scales frontend)
- ✅ Security (multiple auth layers)
- ✅ Reliability (managed services)
- ✅ Performance (CDN + optimized queries)
- ✅ Maintainability (clear separation of concerns)
