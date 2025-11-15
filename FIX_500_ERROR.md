# 🔧 Fix 500 Error on Vercel Backend

## ✅ What I Fixed

1. **Fixed `store/constants.ts`** - Removed space before URL and made it use environment variables
2. **Updated `backend/api/index.ts`** - Simplified CORS to allow all origins (matches server.ts)
3. **Added `postinstall` script** - Ensures Prisma client generates on Vercel

---

## 🚨 The Real Problem: Missing Environment Variables on Vercel

The 500 error is happening because your Vercel backend **doesn't have the required environment variables**.

---

## 🚀 Fix Steps (Do This Now!)

### Step 1: Add Environment Variables to Vercel

1. Go to https://vercel.com
2. Open your **backend project** (`unicart-backend`)
3. Click **Settings** → **Environment Variables**
4. Add these 3 variables:

   **Variable 1: DATABASE_URL**
   ```
   Key: DATABASE_URL
   Value: your_postgresql_connection_string
   Environments: ✅ Production ✅ Preview ✅ Development
   ```

   **Variable 2: JWT_SECRET**
   ```
   Key: JWT_SECRET
   Value: 42663bd76678ad2bdd54c00b231eb1bbbc12727205d8771e7dfbebe84cbf84a5
   Environments: ✅ Production ✅ Preview ✅ Development
   ```

   **Variable 3: NODE_ENV**
   ```
   Key: NODE_ENV
   Value: production
   Environments: ✅ Production only
   ```

### Step 2: Get Database URL

**Easiest: Supabase (Free)**
1. Go to https://supabase.com
2. Create account → New Project
3. Wait 2 minutes for setup
4. Go to **Settings** → **Database**
5. Copy **Connection String** (URI)
6. It looks like: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

**Or use:**
- **Vercel Postgres:** Storage → Create Database → Postgres
- **Railway:** New Project → PostgreSQL → Copy connection string

### Step 3: Create Database Tables

After adding `DATABASE_URL`, create the tables:

```bash
# In your local backend folder
cd backend

# Update .env with production DATABASE_URL (temporarily)
# Then run:
npm run db:push
```

This creates all tables (users, products, etc.) in your production database.

### Step 4: Redeploy Backend

1. In Vercel → Your Backend Project
2. **Deployments** tab
3. Click **"..."** on latest deployment
4. Click **"Redeploy"**
5. Wait for deployment

### Step 5: Test

```bash
curl -X POST https://unicart-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'
```

Should return success instead of 500 error!

---

## 📝 Summary

**The 500 error = Missing `DATABASE_URL` and `JWT_SECRET` on Vercel**

**Fix = Add environment variables + Create database tables + Redeploy**

See `backend/VERCEL_ENV_SETUP.md` for detailed instructions.

---

## ✅ Quick Checklist

- [ ] Added `DATABASE_URL` to Vercel environment variables
- [ ] Added `JWT_SECRET` to Vercel environment variables  
- [ ] Added `NODE_ENV=production` to Vercel
- [ ] Created database tables (`npm run db:push`)
- [ ] Redeployed backend on Vercel
- [ ] Tested registration endpoint

After completing these steps, your 500 error will be fixed! 🎉

