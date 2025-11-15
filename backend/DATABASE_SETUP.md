# 🗄️ Database Setup Guide for UniCart Backend

## Quick Setup Steps

### 1. **Update .env File**

The `.env` file has been created. You need to update the `DATABASE_URL` with your actual database connection string.

**Open `backend/.env` and update:**

```env
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
```

### 2. **Database Options**

#### Option A: Local PostgreSQL (If you have PostgreSQL installed)

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/unicart?schema=public"
```

**To create database:**
```sql
CREATE DATABASE unicart;
```

#### Option B: Supabase (Free, Recommended)

1. Go to https://supabase.com
2. Create account and new project
3. Go to **Settings** → **Database**
4. Copy **Connection String** (URI format)
5. Update `.env`:
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

#### Option C: Railway.app (Free)

1. Go to https://railway.app
2. Create account
3. **New Project** → **Database** → **PostgreSQL**
4. Copy connection string
5. Update `.env`

#### Option D: Vercel Postgres

1. In Vercel project → **Storage** → **Create Database** → **Postgres**
2. Copy connection string
3. Update `.env`

### 3. **Run Database Migrations**

After updating `DATABASE_URL`, run:

```bash
cd backend

# Push schema to database (creates all tables)
npm run db:push

# OR use migrations (recommended for production)
npm run db:migrate
```

### 4. **Verify Database Connection**

Test if database is connected:

```bash
# Start the server
npm run dev

# Check health endpoint
curl http://localhost:5000/health
```

### 5. **Test Registration**

Try registering a user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'
```

---

## 🔧 Troubleshooting

### Error: "Can't reach database server"
- Check if PostgreSQL is running
- Verify `DATABASE_URL` is correct
- Check firewall/network settings

### Error: "Database does not exist"
- Create the database first
- Or use a managed service (Supabase/Railway)

### Error: "Prisma Client not initialized"
- Run: `npm run db:generate`

### Error: "Table does not exist"
- Run: `npm run db:push` or `npm run db:migrate`

---

## ✅ Current .env Configuration

Your `.env` file should have:

```env
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="42663bd76678ad2bdd54c00b231eb1bbbc12727205d8771e7dfbebe84cbf84a5"
PORT=5000
NODE_ENV="development"
```

**IMPORTANT:** Update `DATABASE_URL` with your actual database connection!

---

## 🚀 Quick Start (No Database Setup)

If you want to test without a database first, the backend will use sample data mode when `DATABASE_URL` is not set or invalid. However, login/register requires a real database.

