@echo off
REM ========================================
REM UniCart - Fresh Git Repository Setup (Windows)
REM Complete Commands to Push to New Repo
REM ========================================

echo.
echo ================================================
echo   UniCart - Fresh Repository Setup (Windows)
echo ================================================
echo.

REM Step 1: Check if .git exists and remove it
if exist .git\ (
    echo [Step 1/7] Removing old .git directory...
    rmdir /s /q .git
    echo [OK] Old repository removed
) else (
    echo [OK] No old repository found
)

REM Step 2: Initialize fresh Git repository
echo.
echo [Step 2/7] Initializing fresh Git repository...
git init
if %ERRORLEVEL% EQU 0 (
    echo [OK] Git initialized
) else (
    echo [ERROR] Git initialization failed!
    echo Make sure Git is installed: https://git-scm.com/download/win
    pause
    exit /b 1
)

REM Step 3: Add all files (respecting .gitignore)
echo.
echo [Step 3/7] Adding files to Git...
git add .
if %ERRORLEVEL% EQU 0 (
    echo [OK] Files staged
) else (
    echo [ERROR] Failed to stage files!
    pause
    exit /b 1
)

REM Step 4: Show what will be committed
echo.
echo [Step 4/7] Files to be committed:
git status --short

REM Step 5: Create initial commit
echo.
echo [Step 5/7] Creating initial commit...
git commit -m "Initial commit - UniCart Full-Stack E-Commerce Platform" -m "Features:" -m "- Complete Next.js 14 frontend with TypeScript" -m "- PostgreSQL database with Prisma ORM" -m "- JWT authentication with role-based access" -m "- RESTful API routes for all features" -m "- Admin dashboard with product management" -m "- Shopping cart and wishlist functionality" -m "- Responsive design with Tailwind CSS" -m "- Production-ready deployment configuration"

if %ERRORLEVEL% EQU 0 (
    echo [OK] Initial commit created
) else (
    echo [ERROR] Commit failed!
    pause
    exit /b 1
)

REM Step 6: Show commit details
echo.
echo [Step 6/7] Commit details:
git log --oneline -1

REM Step 7: Instructions for GitHub
echo.
echo ================================================
echo            NEXT STEPS - READ CAREFULLY
echo ================================================
echo.
echo [Step 7/7] Create and Push to GitHub:
echo.
echo 1. CREATE NEW REPOSITORY ON GITHUB:
echo    - Go to: https://github.com/new
echo    - Repository name: unicart (or your choice)
echo    - Keep it PUBLIC or PRIVATE
echo    - DON'T check: Add README, .gitignore, or license
echo    - Click: Create repository
echo.
echo 2. COPY YOUR GITHUB REPOSITORY URL
echo    It will look like:
echo    https://github.com/YOUR-USERNAME/YOUR-REPO.git
echo.
echo 3. RUN THESE COMMANDS:
echo    (Replace YOUR-USERNAME and YOUR-REPO with actual values)
echo.
echo    git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo ================================================
echo.
echo ✅ Your local repository is ready!
echo.
echo 📋 What's Included:
echo    - All source code
echo    - Database schema (Prisma)
echo    - API routes (Backend)
echo    - Frontend pages and components
echo    - Deployment configurations
echo    - Documentation files
echo.
echo 🚫 What's Excluded (via .gitignore):
echo    - node_modules/
echo    - .env files (sensitive data)
echo    - Build outputs (.next/)
echo    - IDE configs (.vscode/)
echo    - Log files
echo.
echo ================================================
echo.
pause

