@echo off
REM ========================================
REM UniCart - Vercel Deployment Check Script (Windows)
REM ========================================
REM Run this before deploying to catch issues early

echo.
echo ================================================
echo   UniCart - Deployment Pre-Check (Windows)
echo ================================================
echo.

REM Check 1: Node Modules
echo [1/6] Checking node_modules...
if exist node_modules\ (
    echo [OK] node_modules exists
) else (
    echo [ERROR] node_modules not found!
    echo Please run: npm install
    pause
    exit /b 1
)

REM Check 2: Environment Files
echo.
echo [2/6] Checking environment files...
if exist .env.local (
    echo [OK] .env.local found
    echo [WARNING] Make sure .env.local is in .gitignore
) else (
    echo [INFO] .env.local not found (OK if using Vercel env vars)
)

REM Check 3: Build Test
echo.
echo [3/6] Testing production build...
echo This may take a few minutes...
call npm run build
if %ERRORLEVEL% EQU 0 (
    echo [OK] Build successful!
) else (
    echo [ERROR] Build failed! Fix errors before deploying.
    pause
    exit /b 1
)

REM Check 4: TypeScript Check
echo.
echo [4/6] Running TypeScript check...
call npm run type-check
if %ERRORLEVEL% EQU 0 (
    echo [OK] TypeScript check passed!
) else (
    echo [WARNING] TypeScript errors found (may still deploy)
)

REM Check 5: Git Status
echo.
echo [5/6] Checking git status...
if exist .git\ (
    echo [OK] Git repository initialized
    git status --short
) else (
    echo [WARNING] Not a git repository
    echo Initialize with: git init
)

REM Check 6: Required Files
echo.
echo [6/6] Checking required files...
set FILES=package.json next.config.js vercel.json
for %%f in (%FILES%) do (
    if exist %%f (
        echo [OK] %%f exists
    ) else (
        echo [ERROR] %%f missing!
    )
)

if exist prisma\schema.prisma (
    echo [OK] prisma\schema.prisma exists
) else (
    echo [ERROR] prisma\schema.prisma missing!
)

REM Summary
echo.
echo ================================================
echo            DEPLOYMENT CHECKLIST
echo ================================================
echo.
echo Before deploying to Vercel, ensure:
echo   [x] Build completed successfully
echo   [ ] All changes committed to Git
echo   [ ] GitHub repository created
echo   [ ] Database ready (Vercel Postgres/Supabase)
echo   [ ] Environment variables prepared:
echo       - DATABASE_URL
echo       - JWT_SECRET
echo       - NODE_ENV=production
echo.
echo ================================================
echo.
echo Ready to deploy?
echo.
echo Option 1: Deploy via Vercel CLI
echo   npm install -g vercel
echo   vercel --prod
echo.
echo Option 2: Deploy via Vercel Dashboard
echo   https://vercel.com/new
echo.
echo ================================================
echo.
pause

