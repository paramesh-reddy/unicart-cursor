# 🚀 Deploy Frontend & Backend Separately from Same Repo

Yes, you can deploy both frontend and backend separately from the same repository! Here's how:

## 📁 Current Structure

```
unicart-cursor/
├── vercel.json          ← Frontend config (Next.js)
├── package.json         ← Frontend dependencies
├── app/                 ← Frontend Next.js app
├── backend/
│   ├── vercel.json      ← Backend config (Express)
│   ├── package.json     ← Backend dependencies
│   ├── api/
│   │   └── index.ts     ← Backend entry point for Vercel
│   └── src/             ← Backend source code
```

## ✅ Step-by-Step Deployment

### **Step 1: Deploy Frontend (Next.js)**

1. **Go to Vercel Dashboard:**
   - Visit [vercel.com](https://vercel.com)
   - Click **"Add New"** → **"Project"**
   - Import your GitHub repository

2. **Configure Frontend Project:**
   - **Project Name:** `unicart-frontend` (or any name)
   - **Root Directory:** Leave empty (or set to `/`)
   - **Framework Preset:** Next.js (auto-detected)
   - **Build Command:** `prisma generate && next build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

3. **Add Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.vercel.app
   DATABASE_URL=your_database_url
   JWT_SECRET=your_jwt_secret
   NODE_ENV=production
   ```

4. **Deploy!** Click **"Deploy"**

---

### **Step 2: Deploy Backend (Express)**

1. **Create a NEW Project in Vercel:**
   - Still in Vercel Dashboard
   - Click **"Add New"** → **"Project"** again
   - Import the **SAME** GitHub repository

2. **Configure Backend Project:**
   - **Project Name:** `unicart-backend` (or any name)
   - **Root Directory:** `backend` ⚠️ **IMPORTANT!**
   - **Framework Preset:** Other
   - **Build Command:** `npm run build` (or leave empty)
   - **Output Directory:** Leave empty
   - **Install Command:** `npm install`

3. **Add Environment Variables:**
   ```
   DATABASE_URL=your_database_url
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=https://your-frontend-url.vercel.app
   NODE_ENV=production
   PORT=5000
   ```

4. **Deploy!** Click **"Deploy"**

---

## 🔗 Connect Frontend to Backend

After both are deployed:

1. **Get Backend URL:**
   - Go to your backend project in Vercel
   - Copy the deployment URL (e.g., `https://unicart-backend.vercel.app`)

2. **Update Frontend Environment Variables:**
   - Go to frontend project → **Settings** → **Environment Variables**
   - Update:
     ```
     NEXT_PUBLIC_API_URL=https://unicart-backend.vercel.app
     NEXT_PUBLIC_BACKEND_URL=https://unicart-backend.vercel.app
     ```
   - **Redeploy** the frontend

3. **Update Backend CORS:**
   - Go to backend project → **Settings** → **Environment Variables**
   - Update:
     ```
     FRONTEND_URL=https://unicart-frontend.vercel.app
     ```
   - **Redeploy** the backend

---

## 📝 Quick Checklist

### Frontend Deployment:
- ✅ Root directory: `/` (empty)
- ✅ Framework: Next.js
- ✅ Build command: `prisma generate && next build`
- ✅ Environment: `NEXT_PUBLIC_BACKEND_URL` = backend URL

### Backend Deployment:
- ✅ Root directory: `backend` ⚠️ **CRITICAL!**
- ✅ Framework: Other
- ✅ Environment: `FRONTEND_URL` = frontend URL

---

## 🎯 Summary

**You will have 2 separate Vercel projects:**
1. **Frontend:** `https://unicart-frontend.vercel.app`
2. **Backend:** `https://unicart-backend.vercel.app`

Both from the same GitHub repository, but deployed separately!

---

## ⚠️ Important Notes

1. **Root Directory:** The backend project MUST have `backend` as root directory
2. **Environment Variables:** Make sure to set them in both projects
3. **CORS:** Backend CORS is already configured to allow your frontend URL
4. **Database:** Use the same `DATABASE_URL` in both (or separate if needed)

---

## 🚨 Troubleshooting

**If backend doesn't work:**
- Check Root Directory is set to `backend`
- Verify `api/index.ts` exists in backend folder
- Check environment variables are set

**If CORS errors:**
- Make sure `FRONTEND_URL` in backend matches frontend deployment URL
- Redeploy backend after updating environment variables

