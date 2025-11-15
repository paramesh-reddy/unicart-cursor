# Frontend and Backend Separation Guide

This guide explains how to run the UniCart application with separated frontend and backend servers.

## Architecture

- **Frontend**: Next.js application running on port 3000
- **Backend**: Express.js API server running on port 5000

## Setup Instructions

### 1. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=5000
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:3000"
```

5. Generate Prisma client:
```bash
npm run db:generate
```

6. Run database migrations:
```bash
npm run db:migrate
```

### 2. Frontend Setup

1. Install dependencies (if not already done):
```bash
npm install
```

2. Create `.env.local` file:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
DATABASE_URL="your-postgresql-connection-string"
```

### 3. Running the Application

#### Option 1: Run Separately (Recommended for Development)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

#### Option 2: Run Both Together

If you have `concurrently` installed:
```bash
npm run dev:all
```

This will start both servers simultaneously.

## Ports

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Backend Health Check**: http://localhost:5000/health

## API Endpoints

All API endpoints are prefixed with `/api`:

- Authentication: `/api/auth/*`
- Products: `/api/products/*`
- Categories: `/api/categories`
- Cart: `/api/cart/*`
- Wishlist: `/api/wishlist/*`

## Environment Variables

### Backend (.env)
- `PORT` - Backend server port (default: 5000)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - JWT expiration time (default: 7d)
- `FRONTEND_URL` - Frontend URL for CORS

### Frontend (.env.local)
- `NEXT_PUBLIC_BACKEND_URL` - Backend API URL (default: http://localhost:5000)
- `DATABASE_URL` - PostgreSQL connection string (for Prisma)

## Troubleshooting

### CORS Errors
Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL.

### Connection Refused
1. Verify backend is running on port 5000
2. Check `NEXT_PUBLIC_BACKEND_URL` in frontend `.env.local`
3. Ensure no firewall is blocking the connection

### Database Connection Issues
1. Verify `DATABASE_URL` is correct in both frontend and backend
2. Ensure PostgreSQL is running
3. Run `npm run db:generate` in backend directory

## Production Deployment

For production, you'll need to:
1. Set up environment variables on your hosting platform
2. Update `NEXT_PUBLIC_BACKEND_URL` to your production backend URL
3. Update `FRONTEND_URL` in backend to your production frontend URL
4. Build both frontend and backend:
   ```bash
   # Frontend
   npm run build
   
   # Backend
   cd backend
   npm run build
   ```

