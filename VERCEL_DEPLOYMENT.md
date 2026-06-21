# Vercel Deployment Guide for Admin Auth System

Complete guide for deploying the admin authentication system on Vercel.

## 🚀 Frontend Deployment on Vercel

### Option 1: Git-Based Deployment (Recommended)

#### Step 1: Push to Git Repository

```bash
# Make sure all changes are committed
cd c:\ETBZ\EBZrp\EBZ
git add .
git commit -m "Add admin authentication system"
git push origin main  # or your branch name
```

#### Step 2: Connect to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select your Git repository
4. Choose the monorepo root: `EBZ` (or `./`)
5. Configure build settings (see below)

#### Step 3: Configure Build Settings

**Framework Preset**: Leave as "Other"

**Build & Output Settings**:
- **Build Command**: `pnpm run build`
- **Output Directory**: `artifacts/ethiobiz/dist`
- **Install Command**: `pnpm install`

**Environment Variables** (see section below)

#### Step 4: Deploy

Click "Deploy" - Vercel will automatically:
1. Clone your repository
2. Install dependencies
3. Build the frontend
4. Deploy to Vercel's CDN

---

### Step 5: Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```env
# Frontend Environment Variables
VITE_SUPABASE_URL=https://ybpyvctipbmwybfuhedu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Note**: 
- VITE_ prefix required for frontend (client-side variables)
- These are PUBLIC - don't put secrets here
- Get from your `.env` file

---

## 📡 Backend API Deployment

You have multiple options for hosting the Express.js backend:

### Option 1: Vercel Serverless Functions (Recommended for simplicity)

**Pros:**
- Same platform as frontend
- Automatic scaling
- Easy environment variable management
- Git-based deployments

**Cons:**
- Cold start delays
- Limited execution time (10 seconds for free tier)
- May timeout on database queries

#### Setup Vercel Serverless

1. **Create API route structure**:
   ```
   api/
   └── index.js (entry point)
   ```

2. **Create `vercel.json`**:
   ```json
   {
     "buildCommand": "pnpm run build",
     "outputDirectory": "artifacts/api-server/dist",
     "env": {
       "FRONTEND_URL": "@frontend_url"
     }
   }
   ```

3. **Set environment variables in Vercel**:
   - `SUPABASE_API_URL`
   - `SUPABASE_SERVICE_ROLE_JWT`
   - `DATABASE_URL`
   - `SUPABASE_DB_URL`
   - `FRONTEND_URL`
   - `PORT` (3000)

---

### Option 2: External Node.js Server (Recommended for production)

Better for production with longer running processes.

#### Hosting Options:
- **Railway.app** - $5/month starter
- **Render.com** - Free tier available
- **Fly.io** - $5/month starter
- **AWS EC2** - Pay as you go
- **DigitalOcean** - $4/month starter
- **Heroku** - No free tier (paid only)

#### Example: Deploy to Railway.app

1. **Create Railway account** at https://railway.app

2. **Connect GitHub repository**:
   - New Project → GitHub Repo
   - Select your EthiooBiz repo

3. **Configure build**:
   ```
   Start Command: cd artifacts/api-server && npm start
   Build Command: cd artifacts/api-server && npm run build
   ```

4. **Add environment variables**:
   ```env
   SUPABASE_API_URL=https://ybpyvctipbmwybfuhedu.supabase.co
   SUPABASE_SERVICE_ROLE_JWT=[your_service_key]
   DATABASE_URL=[your_db_url]
   SUPABASE_DB_URL=[your_db_url]
   FRONTEND_URL=https://yourdomain.vercel.app
   PORT=3000
   ```

5. **Deploy**: Railway auto-deploys on git push

---

## 🌐 Configure FRONTEND_URL for Vercel

Your Vercel deployment gets a URL like: `https://ethiobiz.vercel.app`

Update `.env` or environment variables:

```env
# In Vercel Dashboard
FRONTEND_URL=https://ethiobiz.vercel.app
# or your custom domain if you added one
FRONTEND_URL=https://ethiobiz.com
```

---

## 🔒 Secure Environment Variables in Vercel

### Never Expose These:
- `SUPABASE_SERVICE_ROLE_JWT` ⛔
- `DATABASE_URL` (with password) ⛔
- `SUPABASE_DB_URL` (with password) ⛔

### Safe to Expose (Public):
- `VITE_SUPABASE_URL` ✅
- `VITE_SUPABASE_ANON_KEY` ✅
- `FRONTEND_URL` ✅

### How Vercel Handles Secrets:
1. Store in "Secret" fields (not visible after creation)
2. Only backend can access them
3. Frontend cannot see secrets (even if you try)
4. Automatically injected at build/runtime

---

## 📋 Vercel Environment Variables Checklist

### Frontend Variables (Public)

```env
# Vercel → Settings → Environment Variables

# Frontend Auth
VITE_SUPABASE_URL=https://ybpyvctipbmwybfuhedu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# These are visible in frontend code - OK!
```

### Backend Variables (Secret)

If using Vercel for backend:

```env
# Vercel → Settings → Environment Variables
# Mark these as "Secret"

# Database (KEEP SECRET)
DATABASE_URL=postgresql://postgres:password@db.ybpyvctipbmwybfuhedu.supabase.co:5432/postgres
SUPABASE_DB_URL=postgresql://postgres:password@db.ybpyvctipbmwybfuhedu.supabase.co:5432/postgres

# Supabase (KEEP SECRET)
SUPABASE_API_URL=https://ybpyvctipbmwybfuhedu.supabase.co
SUPABASE_SERVICE_ROLE_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Frontend URL (can be public)
FRONTEND_URL=https://ethiobiz.vercel.app

# Session Secret (KEEP SECRET)
SESSION_SECRET=750093b731e9458801fb4cac7b5f7056bf91ef569310775f88adac6a5eaaf4bd
```

---

## 🔄 Continuous Deployment with Vercel

### Auto-Deploy on Git Push

1. Every git push to `main` auto-deploys
2. Pull requests get preview deployments
3. Automatic rollbacks available

### Preview Deployments

Create a pull request → Vercel automatically:
1. Builds frontend
2. Creates preview URL
3. Shows status on PR
4. Auto-deploys when PR merges

### Custom Domains

Add your domain in Vercel:
1. Vercel Dashboard → Project → Domains
2. Add `ethiobiz.com`
3. Update DNS records (CNAME)
4. SSL certificate auto-provisioned

---

## 🚨 Common Vercel Issues

### Issue: Build fails with "Command not found"

**Problem**: `pnpm` not installed

**Solution**:
1. Go to Vercel Dashboard
2. Settings → General
3. Set "Node.js Version" to 18 (or 20)
4. No need to install pnpm manually (Vercel has it)

---

### Issue: "Cannot find module @workspace/..."

**Problem**: Monorepo dependencies not resolved

**Solution**:
1. Ensure `pnpm` is used (not `npm`)
2. In Vercel settings:
   - **Build Command**: `pnpm run build`
   - **Install Command**: `pnpm install`

---

### Issue: Frontend can't reach backend API

**Problem**: Wrong API URL configured

**Solution 1**: If backend on same Vercel
```env
# Frontend .env
VITE_API_URL=/api  # Relative URL
```

**Solution 2**: If backend on different server
```env
# Frontend .env
VITE_API_URL=https://api.yourdomain.com
```

---

### Issue: Email verification links broken in production

**Problem**: FRONTEND_URL points to wrong domain

**Solution**:
```env
# Backend environment variable
FRONTEND_URL=https://ethiobiz.vercel.app

# Or your custom domain:
FRONTEND_URL=https://ethiobiz.com
```

---

### Issue: "SUPABASE_SERVICE_ROLE_JWT is not defined"

**Problem**: Secret not set in Vercel

**Solution**:
1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Add `SUPABASE_SERVICE_ROLE_JWT`
4. Mark as "Secret" (not visible after)
5. Click "Add"
6. Trigger new deployment (git push or manual)

---

## 📊 Deployment Architecture (Vercel)

```
┌─────────────────────────────────────────┐
│         Your Git Repository             │
│  (GitHub/GitLab/Bitbucket)             │
└──────────────┬──────────────────────────┘
               │ Push to main
               ↓
┌─────────────────────────────────────────┐
│    Vercel CI/CD Pipeline               │
├─────────────────────────────────────────┤
│ 1. Clone repository                     │
│ 2. Install pnpm dependencies            │
│ 3. Run build command                    │
│ 4. Run tests (optional)                 │
│ 5. Deploy to CDN                        │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│   Vercel Edge Network (CDN)            │
├─────────────────────────────────────────┤
│ • ethiobiz.vercel.app                   │
│ • ethiobiz.com (custom domain)          │
│ • SSL/TLS automatic                     │
│ • Global distribution                   │
│ • Auto-scaling                          │
└──────────────┬──────────────────────────┘
               │
               ├─→ Frontend JS/CSS/HTML
               │
               └─→ API Calls to Backend
                   (if backend on Vercel)
```

---

## ✅ Pre-Deployment Checklist

- [ ] All code committed to git
- [ ] No `.env` secrets in git (should be in `.gitignore`)
- [ ] All environment variables defined in Vercel dashboard
- [ ] `SUPABASE_SERVICE_ROLE_JWT` is marked as "Secret"
- [ ] `FRONTEND_URL` matches your Vercel domain
- [ ] Admins table created in Supabase
- [ ] Resend SMTP configured in Supabase
- [ ] First super admin account created
- [ ] Tested locally with `pnpm run dev`
- [ ] `vercel.json` configured (if needed)

---

## 🔄 Deploy Steps Summary

### For Frontend on Vercel

1. **Connect Git**:
   - Vercel Dashboard → New Project → Select Repo

2. **Configure Build**:
   - Root: `artifacts/ethiobiz`
   - Build: `pnpm run build`
   - Output: `dist`

3. **Add Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. **Deploy**: Click Deploy

5. **Test**: Visit your Vercel URL

### For Backend (Choose One)

**Option A: Vercel Serverless**
- Use `vercel.json` configuration
- Set all environment variables
- Deploy with git push

**Option B: External Server**
- Use Railway.app, Render.com, etc.
- Connect GitHub repository
- Set environment variables
- Deploy on git push

---

## 🌍 Production Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed (Vercel or external)
- [ ] Custom domain configured
- [ ] SSL certificate active (auto with Vercel)
- [ ] All environment variables set
- [ ] Resend SMTP tested
- [ ] Admin login tested
- [ ] Email verification tested
- [ ] Database backups enabled
- [ ] Monitoring/logging configured
- [ ] Error tracking enabled (Vercel integrates with Sentry)

---

## 📞 Vercel Support

- **Docs**: https://vercel.com/docs
- **Dashboard**: https://vercel.com/dashboard
- **Help**: https://vercel.com/support

---

## 🎓 Additional Resources

### Vercel Specific
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Vercel Deployments](https://vercel.com/docs/deployments)
- [Vercel Functions](https://vercel.com/docs/functions)
- [Vercel Domains](https://vercel.com/docs/concepts/projects/domains)

### Monitoring Production
- [Vercel Analytics](https://vercel.com/analytics)
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights)
- [Web Vitals Monitoring](https://web.dev/vitals/)

---

## 🚀 Quick Deploy Command

If you have Vercel CLI installed:

```bash
# Install Vercel CLI (one time)
npm i -g vercel

# Deploy from project root
cd c:\ETBZ\EBZrp\EBZ
vercel --prod

# Or just: vercel (for preview)
```

---

**Status**: Ready for Vercel Production  
**Recommended Backend**: Railway.app or external Node server  
**Deployment Time**: ~2-5 minutes  
**Cost**: Frontend free, Backend varies ($0-20/month)

Start with [`QUICK_START.md`](./QUICK_START.md) for local testing, then come back here for Vercel deployment!
