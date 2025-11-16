# Quick Start Guide - Separated Frontend & Backend

## 🚀 Quick Start

### Option 1: Run Both Servers Together (Recommended)

```bash
# Install concurrently if not already installed
npm install --save-dev concurrently

# Run both frontend and backend
npm run dev:all
```

This will start:
- **Frontend** on http://localhost:3000
- **Backend** on http://localhost:5000

### Option 2: Run Separately (Two Terminals)

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## 📋 Prerequisites

1. **Backend Setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your DATABASE_URL and JWT_SECRET
   npm run db:generate
   ```

2. **Frontend Setup:**
   ```bash
   # Create .env.local
   echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:5000" > .env.local
   ```

## ✅ Verify Setup

1. Check backend health: http://localhost:5000/health
2. Check frontend: http://localhost:3000
3. Try logging in or browsing products

## 🔧 Troubleshooting

- **CORS errors**: Make sure `FRONTEND_URL` in `backend/.env` matches your frontend URL
- **Connection refused**: Ensure backend is running on port 5000
- **Database errors**: Verify `DATABASE_URL` is correct in both `.env` files

## 📚 More Information

See `SEPARATION_GUIDE.md` for detailed setup instructions.

