# 🚀 Deploy Frontend & Backend from Same Repo to Vercel

## Overview
You'll create **2 separate Vercel projects** from the **same GitHub repository**:
- **Project 1:** Frontend (root directory)
- **Project 2:** Backend (backend/ directory)

---

## Step 1: Deploy Frontend (Next.js)

### 1.1 Go to Vercel Dashboard
- Visit https://vercel.com
- Click **"Add New"** button (top right corner)
- Click **"Project"**

### 1.2 Import Repository
- If not connected, connect your GitHub account
- Find and select your repository (`unicart-cursor` or your repo name)
- Click **"Import"**

### 1.3 Configure Frontend Project
- **Project Name:** `unicart-frontend` (or any name you like)
- **Framework Preset:** Should auto-detect "Next.js" ✅
- **Root Directory:** Leave as **`.`** (default/empty) ⚠️ **IMPORTANT**
- **Build Command:** `prisma generate && next build` (or leave default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (default)

### 1.4 Add Environment Variables (Optional for now)
Click **"Environment Variables"** and add:
```
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.vercel.app
```
(You'll update this after backend is deployed)

### 1.5 Deploy
- Click **"Deploy"** button
- Wait 2-5 minutes for build
- **Copy your frontend URL** (e.g., `https://unicart-frontend.vercel.app`)

---

## Step 2: Deploy Backend (Express.js)

### 2.1 Create Second Project
- Still in Vercel Dashboard
- Click **"Add New"** → **"Project"** again
- Import the **SAME** GitHub repository

### 2.2 Configure Backend Project
- **Project Name:** `unicart-backend` (different name!)
- **Framework Preset:** Click dropdown → Select **"Other"** ⚠️ **IMPORTANT**
- **Root Directory:** Click **"Edit"** → Type: `backend` ⚠️ **CRITICAL**
- **Build Command:** Leave empty OR `npm run build`
- **Output Directory:** Leave empty
- **Install Command:** `npm install`

### 2.3 Add Environment Variables (Before Deploy)
Click **"Environment Variables"** and add:

```
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key_min_32_characters
FRONTEND_URL=https://unicart-frontend.vercel.app
NODE_ENV=production
```

**Important:** Replace `https://unicart-frontend.vercel.app` with your actual frontend URL from Step 1.5

### 2.4 Deploy
- Click **"Deploy"** button
- Wait for build to complete
- **Copy your backend URL** (e.g., `https://unicart-backend.vercel.app`)

---

## Step 3: Connect Frontend to Backend

### 3.1 Update Frontend Environment Variables
1. Go to Vercel Dashboard
2. Open your **Frontend Project** (`unicart-frontend`)
3. Go to **Settings** → **Environment Variables**
4. Add/Update:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://unicart-backend.vercel.app
   NEXT_PUBLIC_API_URL=https://unicart-backend.vercel.app
   ```
   (Replace with your actual backend URL)

### 3.2 Redeploy Frontend
1. Go to **Deployments** tab
2. Click **"..."** (three dots) on latest deployment
3. Click **"Redeploy"**
4. Wait for redeploy to complete

---

## Step 4: Update Backend CORS (If Needed)

### 4.1 Update Backend Environment Variables
1. Go to your **Backend Project** (`unicart-backend`)
2. Go to **Settings** → **Environment Variables**
3. Make sure `FRONTEND_URL` matches your frontend URL exactly
4. If you changed it, **Redeploy** the backend

---

## ✅ Final Checklist

### Frontend Project:
- ✅ Root Directory: `.` (empty/default)
- ✅ Framework: Next.js
- ✅ Environment Variable: `NEXT_PUBLIC_BACKEND_URL` = backend URL

### Backend Project:
- ✅ Root Directory: `backend` ⚠️ **MUST BE SET**
- ✅ Framework: Other
- ✅ Environment Variables:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `FRONTEND_URL` = frontend URL
  - `NODE_ENV=production`

---

## 🎯 Summary

You now have:
- **Frontend:** `https://unicart-frontend.vercel.app`
- **Backend:** `https://unicart-backend.vercel.app`

Both from the same GitHub repository! 🎉

---

## 🚨 Troubleshooting

### Backend not working?
1. Check **Root Directory** is set to `backend` (not `.`)
2. Verify `backend/api/index.ts` exists
3. Check environment variables are set
4. Check deployment logs for errors

### CORS errors?
1. Make sure `FRONTEND_URL` in backend matches frontend URL exactly
2. Redeploy backend after updating environment variables
3. Check browser console for exact error

### Can't find "Root Directory" option?
- It's in the project configuration page
- Look for **"Configure Project"** section
- May be under **"Advanced"** or **"Settings"** tab
- If still not visible, use Vercel CLI (see alternative method below)

---

## Alternative: Use Vercel CLI for Backend

If you can't find "Root Directory" in UI:

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Go to backend folder
cd backend

# 3. Login
vercel login

# 4. Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: unicart-backend
# - Directory: ./ (or just press Enter)
# - Override settings? No

# 5. Add environment variables via CLI or Dashboard
# 6. Deploy to production
vercel --prod
```

