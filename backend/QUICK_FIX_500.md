# 🚨 Quick Fix for 500 Error on Vercel

## The Problem
Your backend on Vercel is returning 500 errors because it's missing required environment variables.

## ✅ Fix in 3 Steps

### Step 1: Add Environment Variables to Vercel

1. **Go to Vercel:**
   - https://vercel.com
   - Open your **backend project** (`unicart-backend`)

2. **Add Environment Variables:**
   - Click **Settings** → **Environment Variables**
   - Add these 3 variables:

   **Variable 1: DATABASE_URL**
   ```
   Key: DATABASE_URL
   Value: your_postgresql_connection_string_here
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
2. Sign up → New Project
3. Wait 2 minutes for setup
4. Go to **Settings** → **Database**
5. Copy **Connection String** (URI format)
6. It looks like: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

**Or use Vercel Postgres:**
1. In Vercel backend project → **Storage** tab
2. **Create Database** → **Postgres**
3. Copy the connection string

### Step 3: Create Database Tables

```bash
# In your local backend folder
cd backend

# Update .env file with production DATABASE_URL
# Then run:
npm run db:push
```

This creates all tables (users, products, etc.) in your database.

### Step 4: Redeploy

1. In Vercel → Your backend project
2. **Deployments** tab
3. Click **"..."** on latest deployment
4. Click **"Redeploy"**
5. Wait for deployment

---

## 🧪 Test After Fix

```bash
curl -X POST https://unicart-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'
```

Should return success instead of 500!

---

## 🔍 Check Error Details

After redeploying, if you still get 500 error, check the response body. It will now show:
- `hasDatabase: true/false` - tells you if DATABASE_URL is set
- `hasJwtSecret: true/false` - tells you if JWT_SECRET is set
- `details` - the actual error message (in development mode)

---

## ✅ Checklist

- [ ] Added `DATABASE_URL` to Vercel environment variables
- [ ] Added `JWT_SECRET` to Vercel environment variables
- [ ] Added `NODE_ENV=production` to Vercel
- [ ] Created database tables (`npm run db:push`)
- [ ] Redeployed backend on Vercel
- [ ] Tested registration endpoint

**After completing these steps, your 500 error will be fixed!** 🎉

