# 🔀 Separate Frontend & Backend into Different Git Repos

This guide will help you create two separate GitHub repositories - one for frontend and one for backend.

---

## 📋 Step 1: Prepare Backend Repository

### 1.1 Create New Folder for Backend
```bash
# Go to parent directory (outside your current project)
cd ..

# Create new backend folder
mkdir unicart-backend
cd unicart-backend
```

### 1.2 Copy Backend Files
```bash
# Copy backend folder from current project
# (Adjust path as needed)
xcopy "C:\new D\unicart-cursor\backend\*" "." /E /I

# Or use PowerShell:
Copy-Item -Path "C:\new D\unicart-cursor\backend\*" -Destination "." -Recurse
```

### 1.3 Initialize Git for Backend
```bash
# Initialize git
git init

# Create .gitignore
echo node_modules/ > .gitignore
echo .env >> .gitignore
echo dist/ >> .gitignore
echo .vercel/ >> .gitignore

# Add all files
git add .

# Commit
git commit -m "Initial commit - UniCart Backend"
```

### 1.4 Create GitHub Repository for Backend
1. Go to https://github.com
2. Click **"New repository"** (or **"+"** → **"New repository"**)
3. Repository name: `unicart-backend`
4. Description: "UniCart E-commerce Backend API"
5. **Make it Private** (or Public - your choice)
6. **DO NOT** initialize with README, .gitignore, or license
7. Click **"Create repository"**

### 1.5 Push Backend to GitHub
```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/unicart-backend.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 📋 Step 2: Prepare Frontend Repository

### 2.1 Go Back to Original Project
```bash
cd "C:\new D\unicart-cursor"
```

### 2.2 Remove Backend Folder from Frontend Repo
```bash
# Remove backend folder (it's now in separate repo)
# First, make sure you've committed everything
git add .
git commit -m "Remove backend - now in separate repo"

# Remove backend folder
Remove-Item -Recurse -Force backend
```

### 2.3 Update .gitignore (if needed)
Make sure `.gitignore` doesn't exclude important frontend files.

### 2.4 Commit Changes
```bash
git add .
git commit -m "Separate frontend - backend moved to separate repo"
```

### 2.5 Create GitHub Repository for Frontend
1. Go to https://github.com
2. Click **"New repository"**
3. Repository name: `unicart-frontend`
4. Description: "UniCart E-commerce Frontend (Next.js)"
5. **Make it Private** (or Public)
6. **DO NOT** initialize with README, .gitignore, or license
7. Click **"Create repository"**

### 2.6 Push Frontend to GitHub
```bash
# If you already have a remote, update it:
git remote set-url origin https://github.com/YOUR_USERNAME/unicart-frontend.git

# Or if no remote exists:
git remote add origin https://github.com/YOUR_USERNAME/unicart-frontend.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 📋 Step 3: Update Environment Variables

### 3.1 Backend Repository
Create `.env.example` in backend repo:
```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### 3.2 Frontend Repository
Update `.env.local.example` or create `.env.example`:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=http://localhost:5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

---

## 📋 Step 4: Deploy to Vercel

### 4.1 Deploy Frontend
1. Go to https://vercel.com
2. **Add New** → **Project**
3. Import `unicart-frontend` repository
4. Framework: Next.js (auto-detected)
5. Deploy!

### 4.2 Deploy Backend
1. **Add New** → **Project** (again)
2. Import `unicart-backend` repository
3. Framework: **Other**
4. Root Directory: Leave empty (backend is root now)
5. Add environment variables
6. Deploy!

---

## ✅ Final Structure

### Backend Repository (`unicart-backend`)
```
unicart-backend/
├── api/
│   └── index.ts
├── src/
│   ├── routes/
│   ├── lib/
│   └── ...
├── prisma/
│   └── schema.prisma
├── package.json
├── vercel.json
└── README.md
```

### Frontend Repository (`unicart-frontend`)
```
unicart-frontend/
├── app/
├── components/
├── lib/
├── public/
├── package.json
├── vercel.json
└── README.md
```

---

## 🔗 Quick Commands Summary

### Backend Repo Setup:
```bash
# Create backend repo
cd ..
mkdir unicart-backend
cd unicart-backend

# Copy files (adjust path)
Copy-Item -Path "C:\new D\unicart-cursor\backend\*" -Destination "." -Recurse

# Initialize git
git init
git add .
git commit -m "Initial commit"

# Connect to GitHub
git remote add origin https://github.com/YOUR_USERNAME/unicart-backend.git
git push -u origin main
```

### Frontend Repo Setup:
```bash
# Go to frontend
cd "C:\new D\unicart-cursor"

# Remove backend folder
Remove-Item -Recurse -Force backend

# Commit changes
git add .
git commit -m "Remove backend - separate repo"

# Connect to GitHub (or update existing)
git remote set-url origin https://github.com/YOUR_USERNAME/unicart-frontend.git
git push -u origin main
```

---

## 🎯 Benefits of Separate Repos

✅ **Independent deployments** - Deploy frontend/backend separately  
✅ **Better organization** - Clear separation of concerns  
✅ **Team collaboration** - Different teams can work on each repo  
✅ **Version control** - Independent versioning and releases  
✅ **Easier CI/CD** - Separate pipelines for each service  

---

## 🚨 Important Notes

1. **Backend is now root** - When deploying backend, root directory is `.` (not `backend/`)
2. **Update CORS** - Make sure backend CORS allows your frontend URL
3. **Environment Variables** - Set them in both Vercel projects
4. **Database** - Can be shared or separate (your choice)

---

## 📝 Next Steps

1. ✅ Create backend GitHub repo
2. ✅ Create frontend GitHub repo  
3. ✅ Deploy backend to Vercel
4. ✅ Deploy frontend to Vercel
5. ✅ Connect them via environment variables
6. ✅ Test the connection

Good luck! 🚀

