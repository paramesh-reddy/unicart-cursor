# 🔧 Vercel Environment Variables Setup for Backend

## ⚠️ CRITICAL: The 500 Error is Because Environment Variables Are Missing!

Your backend on Vercel needs these environment variables to work:

---

## 📋 Required Environment Variables

Go to your Vercel backend project → **Settings** → **Environment Variables** and add:

### 1. **DATABASE_URL** (REQUIRED)
```
postgresql://username:password@host:port/database?schema=public
```

**How to get it:**
- **Supabase:** Settings → Database → Connection String (URI)
- **Railway:** Project → PostgreSQL → Connect → Connection URL
- **Vercel Postgres:** Storage → Your Database → .env.local → Copy DATABASE_URL
- **Neon:** Dashboard → Connection String

### 2. **JWT_SECRET** (REQUIRED)
```
42663bd76678ad2bdd54c00b231eb1bbbc12727205d8771e7dfbebe84cbf84a5
```

Or generate your own:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. **NODE_ENV** (Optional but recommended)
```
production
```

### 4. **PORT** (Optional - Vercel handles this)
```
5000
```

---

## 🚀 Step-by-Step Setup

### Step 1: Get Database URL

**Option A: Supabase (Free, Recommended)**
1. Go to https://supabase.com
2. Create account → New Project
3. Wait for project to be ready
4. Go to **Settings** → **Database**
5. Copy **Connection String** (URI format)
6. It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

**Option B: Vercel Postgres**
1. In your Vercel backend project
2. Go to **Storage** tab
3. Click **Create Database** → **Postgres**
4. Copy the `DATABASE_URL` from the connection string

**Option C: Railway**
1. Go to https://railway.app
2. New Project → Database → PostgreSQL
3. Copy connection string

### Step 2: Add Environment Variables in Vercel

1. Go to your Vercel backend project
2. Click **Settings** (top menu)
3. Click **Environment Variables** (left sidebar)
4. Add each variable:

   **Variable 1:**
   - Key: `DATABASE_URL`
   - Value: `your_postgresql_connection_string_here`
   - Environment: Select **Production**, **Preview**, and **Development**
   - Click **Save**

   **Variable 2:**
   - Key: `JWT_SECRET`
   - Value: `42663bd76678ad2bdd54c00b231eb1bbbc12727205d8771e7dfbebe84cbf84a5`
   - Environment: Select **Production**, **Preview**, and **Development**
   - Click **Save**

   **Variable 3:**
   - Key: `NODE_ENV`
   - Value: `production`
   - Environment: Select **Production**
   - Click **Save**

### Step 3: Set Up Database Tables

After adding `DATABASE_URL`, you need to create the database tables:

**Option A: Using Prisma Migrate (Recommended)**
```bash
# In your local backend folder
cd backend

# Set DATABASE_URL to your production database
# Update .env with production DATABASE_URL

# Push schema to database
npm run db:push
```

**Option B: Using Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Link to your project
cd backend
vercel link

# Pull environment variables
vercel env pull .env.local

# Push database schema
npm run db:push
```

### Step 4: Redeploy Backend

1. Go to Vercel → Your Backend Project
2. Go to **Deployments** tab
3. Click **"..."** (three dots) on latest deployment
4. Click **"Redeploy"**
5. Wait for deployment to complete

### Step 5: Test

```bash
# Test registration
curl -X POST https://unicart-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'
```

---

## ✅ Checklist

- [ ] `DATABASE_URL` added to Vercel environment variables
- [ ] `JWT_SECRET` added to Vercel environment variables
- [ ] `NODE_ENV` set to `production`
- [ ] Database tables created (using `npm run db:push`)
- [ ] Backend redeployed after adding environment variables
- [ ] Test registration endpoint works

---

## 🐛 Common Issues

### Error: "Can't reach database server"
- Check `DATABASE_URL` is correct
- Make sure database is accessible from internet (not localhost)
- Check if database requires SSL (add `?sslmode=require`)

### Error: "Prisma Client not initialized"
- Add `prisma generate` to build command in Vercel
- Or add to `package.json` scripts: `"postinstall": "prisma generate"`

### Error: "Table does not exist"
- Run `npm run db:push` with production DATABASE_URL
- Or create migration: `npm run db:migrate`

### Still getting 500 error?
1. Check Vercel deployment logs
2. Go to **Deployments** → Click on deployment → **Functions** tab
3. Check error logs for specific error message

---

## 📝 Quick Copy-Paste for Vercel

**Environment Variables to Add:**

```
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=42663bd76678ad2bdd54c00b231eb1bbbc12727205d8771e7dfbebe84cbf84a5
NODE_ENV=production
```

**Make sure to:**
- Replace `your_postgresql_connection_string` with actual database URL
- Select all environments (Production, Preview, Development) for DATABASE_URL and JWT_SECRET
- Redeploy after adding variables

