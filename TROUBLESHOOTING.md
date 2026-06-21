# Troubleshooting Guide

## Common Issues and Solutions

---

## 🔴 Backend Issues

### Issue: "SUPABASE_SERVICE_ROLE_JWT must be set"

**Error Message:**
```
SUPABASE_API_URL and SUPABASE_SERVICE_ROLE_JWT must be set for server-side Supabase client.
```

**Cause:** Missing environment variable in `.env`

**Solution:**
1. Go to Supabase Dashboard → Settings → API
2. Copy the **Service Role Key** (NOT the anon key)
3. Add to `.env`:
   ```env
   SUPABASE_SERVICE_ROLE_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. Restart your API server
5. Check `.env` is in `.gitignore` (don't commit secrets!)

---

### Issue: "relation 'admins' does not exist"

**Error Message:**
```
error: relation "public.admins" does not exist
relation does not exist
```

**Cause:** Database table hasn't been created yet

**Solution:**
1. Go to Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy and paste this SQL:
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
4. Click "Run" or press Ctrl+Enter
5. Restart API server

---

### Issue: "GET /api/admin/me returns 401 Unauthorized"

**Cause 1:** No token provided
- **Solution:** Include Authorization header:
  ```bash
  Authorization: Bearer YOUR_TOKEN
  ```

**Cause 2:** Token is invalid/expired
- **Solution:** 
  1. Admin needs to login again
  2. Get new token from `/api/admin/login`

**Cause 3:** User doesn't exist in Supabase Auth
- **Solution:**
  1. Create user in Supabase Auth (Supabase Dashboard → Authentication → Users)
  2. Verify credentials are correct

---

### Issue: "POST /api/admin/login returns 403 Forbidden: Not an admin user"

**Cause:** User exists in Auth but not in admins table

**Solution:**
1. Get the user ID from `auth.users`:
   ```sql
   SELECT id, email FROM auth.users WHERE email = 'your-email@ethioobiz.et';
   ```
2. Insert into admins table:
   ```sql
   INSERT INTO admins (id, email, role, email_verified, active)
   VALUES ('[USER_ID]', 'your-email@ethioobiz.et', 'admin', true, true);
   ```
3. Try login again

---

### Issue: "POST /api/admin/login returns 403: Email not verified"

**Cause:** Admin account exists but email_verified is false

**Solution:**
1. Check current status:
   ```sql
   SELECT id, email, email_verified FROM admins WHERE email = 'admin@ethioobiz.et';
   ```

2. If email_verified is false, either:
   - Option A: Manually verify in database:
     ```sql
     UPDATE admins SET email_verified = true 
     WHERE email = 'admin@ethioobiz.et';
     ```
   - Option B: Request verification email through UI at `/admin/login`

---

### Issue: "POST /api/admin/admins returns 403: Only super admins can add admins"

**Cause:** Current logged-in admin is not a super_admin

**Solution:**
1. Check your role:
   ```sql
   SELECT id, email, role FROM admins WHERE email = 'your-email@ethioobiz.et';
   ```
2. If role is not 'super_admin', update it:
   ```sql
   UPDATE admins SET role = 'super_admin' 
   WHERE email = 'your-email@ethioobiz.et';
   ```
3. Try adding admin again

---

### Issue: API crashes with "Connection refused"

**Cause 1:** Database is down
- **Solution:** 
  1. Check Supabase Dashboard status
  2. Wait for Supabase to come back online
  3. Restart API server

**Cause 2:** Wrong database URL
- **Solution:**
  1. Check `.env` DATABASE_URL matches your Supabase project
  2. Verify credentials are correct (especially password)

---

## 🔴 Frontend Issues

### Issue: "Cannot find module '@/pages/admin/login'"

**Cause:** File doesn't exist in project

**Solution:**
1. Verify file exists at: `artifacts/ethiobiz/src/pages/admin/login.tsx`
2. If not, copy it from the implementation files
3. Check file paths match exactly (case-sensitive on Linux/Mac)

---

### Issue: "Admin login page shows "Access Denied"

**Cause 1:** Not logged in as admin (localStorage empty)
- **Solution:** Use admin credentials, not user account

**Cause 2:** Admin token expired
- **Solution:** Login again

---

### Issue: "/admin redirects to /admin/login in a loop"

**Cause:** Invalid or missing admin token in localStorage

**Solution:**
1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Check `adminToken` exists and has a value
4. If missing or empty:
   - Clear localStorage: `localStorage.clear()`
   - Login again at `/admin/login`

---

### Issue: "Email verification link doesn't work"

**Cause 1:** Email not sent
- **Solution:** Check Resend SMTP configuration

**Cause 2:** Link is expired
- **Solution:** Use "Resend Email" button on verification page

**Cause 3:** Frontend URL in link doesn't match your actual frontend URL
- **Solution:**
  1. Check `.env` FRONTEND_URL
  2. Make sure it matches where your app is running
  3. For localhost: `http://localhost:5173`
  4. For production: `https://yourdomain.com`

---

### Issue: "Manage Admins page shows Access Denied"

**Cause:** You're not logged in as a super_admin

**Solution:**
1. Check your admin role in database:
   ```sql
   SELECT email, role FROM admins WHERE id = 'your-id';
   ```
2. If role is not 'super_admin', update it:
   ```sql
   UPDATE admins SET role = 'super_admin' WHERE id = 'your-id';
   ```
3. Refresh the page

---

### Issue: "Add Admin dialog won't open"

**Cause:** Missing UI component or permission issue

**Solution:**
1. Check browser console (F12) for JavaScript errors
2. Verify you're logged in as super_admin
3. Check that you're not on a mobile device with very small screen

---

## 🔴 Email Issues

### Issue: "Verification emails not being sent"

**Cause 1:** Resend SMTP not configured
- **Solution:**
  1. Go to Supabase Settings → Authentication → Email Settings
  2. Check "Enable Custom SMTP" is toggled ON
  3. Verify SMTP credentials:
     - Host: `smtp.resend.com`
     - Port: `587`
     - Username: `resend`
     - Password: `re_...` (your Resend API key)

**Cause 2:** Resend account has no credits
- **Solution:**
  1. Go to https://resend.com/dashboard
  2. Check account balance
  3. Add payment method if needed

**Cause 3:** Email address is invalid or bounced
- **Solution:**
  1. Check email spelling
  2. Try different email address
  3. Check Resend bounce logs

---

### Issue: "Verification emails going to spam"

**Cause:** Email not authenticated properly

**Solution:**
1. Verify SMTP "From Email" is set correctly in Supabase
2. Set it to your domain: `noreply@yourdomain.com`
3. Ensure domain has SPF/DKIM records (check Resend docs)
4. Ask users to check spam folder or whitelist sender

---

### Issue: "Email says 'Setup password' but I want 'Verify Email' email"

**Cause:** Different email templates sent based on flow

**Solution:**
- For new admin: Resend gets invite link (to set password)
- For verification: Resend gets magic link (to verify email)
- This is expected behavior

---

## 🔴 Authentication Issues

### Issue: "Can't login with correct credentials"

**Check list:**
1. Verify email exists in `auth.users`:
   ```bash
   SELECT * FROM auth.users WHERE email = 'admin@ethioobiz.et';
   ```
2. Verify admin record exists:
   ```bash
   SELECT * FROM admins WHERE email = 'admin@ethioobiz.et';
   ```
3. Check email is verified:
   ```bash
   SELECT email_verified FROM admins WHERE email = 'admin@ethioobiz.et';
   ```
4. Check account is active:
   ```bash
   SELECT active FROM admins WHERE email = 'admin@ethioobiz.et';
   ```
5. Check password is correct (try resetting)

---

### Issue: "Token keeps expiring"

**Cause:** Supabase auth tokens have 1 hour expiration

**Solution:**
- This is expected behavior
- Frontend handles auto-logout
- User/admin needs to login again
- To extend: implement refresh token logic (available in latest code)

---

### Issue: "Super admin can't delete their own account"

**Cause:** System prevents self-deletion (safety feature)

**Solution:**
- Cannot delete your own account while logged in
- Ask another super admin to delete you (if needed)
- Or: delete from database directly:
  ```sql
  DELETE FROM admins WHERE email = 'admin@ethioobiz.et';
  ```

---

## 🔴 Database Issues

### Issue: "Foreign key constraint violation"

**Cause:** Trying to insert admin with invalid user ID

**Solution:**
1. Make sure user exists in `auth.users`:
   ```sql
   SELECT id FROM auth.users WHERE id = '[your_id]';
   ```
2. If user doesn't exist, create it first in Supabase Auth
3. Use correct user ID in insert

---

### Issue: "Unique constraint violation on email"

**Cause:** Email already exists in admins table

**Solution:**
1. Check if email already exists:
   ```sql
   SELECT * FROM admins WHERE email = 'admin@ethioobiz.et';
   ```
2. If it's a duplicate:
   - Delete old one: `DELETE FROM admins WHERE email = '...';`
   - Or use different email
3. Try adding admin again

---

### Issue: "Connection pool exhausted"

**Cause:** Too many database connections

**Solution:**
1. Restart API server
2. Check if you have connection leaks (forgot to close connections)
3. Increase connection pool size in Supabase settings

---

## 🔴 Deployment Issues

### Issue: "Works locally but not in production"

**Common causes and solutions:**

1. **Missing environment variables:**
   ```bash
   # Check all required vars are set in production
   echo $SUPABASE_SERVICE_ROLE_JWT
   echo $FRONTEND_URL
   echo $DATABASE_URL
   ```

2. **CORS error in production:**
   - Update FRONTEND_URL in production `.env`
   - Ensure API CORS allows production domain

3. **Email links broken in production:**
   - Update FRONTEND_URL to production domain
   - Verify production frontend URL is correct

4. **Database connection timeout:**
   - Check if database IP is whitelisted
   - Verify connection string is correct
   - Check firewall rules

---

### Issue: "Vercel deployment fails"

**Check:**
1. All environment variables set in Vercel dashboard
2. No secrets in code (should be in `.env`)
3. `pnpm install` completes without errors
4. Build command succeeds: `pnpm run build`

---

## 📊 Debugging Tips

### Check backend logs
```bash
# View API server logs
npm run dev  # Shows live logs

# Or check logs file if configured
tail -f logs/api-server.log
```

### Check database logs
```bash
# In Supabase Dashboard
Settings → Logs → Recent Logs
```

### Check frontend errors
1. Open browser DevTools: F12
2. Go to Console tab
3. Look for red error messages
4. Check Network tab for failed API calls

### Test API endpoint directly
```bash
# Test admin login
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ethioobiz.et",
    "password": "password123"
  }' | jq

# Test get current admin
curl -X GET http://localhost:3000/api/admin/me \
  -H "Authorization: Bearer YOUR_TOKEN" | jq
```

---

## 🆘 Still Having Issues?

### Before asking for help, provide:

1. **Error message** (full text)
2. **What you're trying to do** (step-by-step)
3. **Environment** (localhost vs production)
4. **Recent changes** (what did you just do?)
5. **API response** (from network tab or curl)
6. **Database state** (query results showing relevant data)

### Resources:

- [Supabase Docs](https://supabase.com/docs)
- [Resend Email Docs](https://resend.com/docs)
- [Express.js Docs](https://expressjs.com)
- [React Docs](https://react.dev)

---

## ✅ Verification Checklist

If everything seems broken, verify these basics:

- [ ] API server is running (`pnpm run dev` in api-server folder)
- [ ] Frontend is running (`pnpm run dev` in ethiobiz folder)
- [ ] `.env` file exists and has SUPABASE_SERVICE_ROLE_JWT
- [ ] Admins table exists in Supabase (run SQL migration)
- [ ] Your user exists in auth.users
- [ ] Your user has admin record with email_verified = true
- [ ] Browser console has no red errors (F12)
- [ ] Network tab shows successful API requests
- [ ] Resend SMTP is enabled in Supabase

If all checked ✓, system should work!

---

**Last Updated:** June 20, 2026
**Status:** Production Ready
