# 🔍 How to Check Vercel Backend Errors

## The 500 Error - How to Diagnose

### Step 1: Check Vercel Deployment Logs

1. Go to https://vercel.com
2. Open your **backend project** (`unicart-backend`)
3. Click **Deployments** tab
4. Click on the **latest deployment** (the one with the error)
5. Scroll down to see **Build Logs** and **Function Logs**
6. Look for error messages - they will tell you exactly what's wrong

### Step 2: Common Error Messages & Fixes

#### Error: "Can't reach database server" or "P1001"
**Problem:** `DATABASE_URL` is missing or incorrect

**Fix:**
1. Go to **Settings** → **Environment Variables**
2. Add `DATABASE_URL` with your PostgreSQL connection string
3. Redeploy

#### Error: "Prisma Client not initialized"
**Problem:** Prisma client wasn't generated during build

**Fix:**
1. Go to **Settings** → **General**
2. Update **Build Command** to: `npm install && prisma generate`
3. Or add to `package.json`: `"postinstall": "prisma generate"`
4. Redeploy

#### Error: "Table does not exist" or "P2021"
**Problem:** Database tables haven't been created

**Fix:**
```bash
# In your local backend folder
cd backend

# Update .env with production DATABASE_URL
# Then run:
npm run db:push
```

#### Error: "JWT_SECRET is not defined"
**Problem:** Missing JWT_SECRET environment variable

**Fix:**
1. Go to **Settings** → **Environment Variables**
2. Add `JWT_SECRET` with a random string (at least 32 characters)
3. Redeploy

---

## 🚀 Quick Fix Checklist

### 1. Check Environment Variables in Vercel

Go to your backend project → **Settings** → **Environment Variables**

**Required variables:**
- ✅ `DATABASE_URL` - Your PostgreSQL connection string
- ✅ `JWT_SECRET` - Random secret key (32+ characters)
- ✅ `NODE_ENV` - Set to `production`

**How to check if they're set:**
- If the list is empty or missing any above → **That's your problem!**

### 2. Check Database Connection

Test if your database is accessible:

```bash
# Test connection (replace with your DATABASE_URL)
psql "your_database_url_here"

# If connection fails, the DATABASE_URL is wrong
```

### 3. Check Vercel Function Logs

1. Go to **Deployments** → Latest deployment
2. Click **Functions** tab
3. Click on the function that's failing
4. Check **Logs** for detailed error messages

### 4. Test Health Endpoint

```bash
curl https://unicart-backend.vercel.app/health
```

If this works but `/api/auth/register` doesn't → It's a database/auth issue

---

## 📝 Step-by-Step Fix

### Step 1: Add Environment Variables

1. **Get Database URL:**
   - Supabase: Settings → Database → Connection String (URI)
   - Vercel Postgres: Storage → Your Database → Copy connection string
   - Railway: Project → PostgreSQL → Connect → Connection URL

2. **Add to Vercel:**
   - Backend project → Settings → Environment Variables
   - Add `DATABASE_URL` = your connection string
   - Add `JWT_SECRET` = random 32+ character string
   - Add `NODE_ENV` = `production`
   - **Select all environments** (Production, Preview, Development)
   - Click **Save**

### Step 2: Create Database Tables

```bash
cd backend

# Update .env with production DATABASE_URL
# Then:
npm run db:push
```

### Step 3: Redeploy

1. In Vercel → Your backend project
2. **Deployments** → Click **"..."** on latest
3. Click **"Redeploy"**
4. Wait for deployment

### Step 4: Test

```bash
curl -X POST https://unicart-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'
```

---

## 🎯 Most Likely Issue

**99% chance the problem is:**
- ❌ `DATABASE_URL` not set in Vercel environment variables
- ❌ Database tables don't exist (need to run `npm run db:push`)

**Fix both of these and the 500 error will be resolved!**

