#!/bin/bash

# ========================================
# UniCart - Vercel Deployment Check Script
# ========================================
# Run this before deploying to catch issues early

echo "🔍 UniCart Deployment Pre-Check Starting..."
echo ""

# Check 1: Node Modules
echo "✓ Checking node_modules..."
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules not found. Run: npm install"
    exit 1
fi
echo "✅ node_modules exists"

# Check 2: Environment Variables
echo ""
echo "✓ Checking environment files..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local found"
    echo "⚠️  Make sure .env.local is in .gitignore"
else
    echo "⚠️  .env.local not found (OK if using Vercel env vars)"
fi

# Check 3: Build Test
echo ""
echo "✓ Testing production build..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Fix errors before deploying."
    exit 1
fi

# Check 4: TypeScript Check
echo ""
echo "✓ Running TypeScript check..."
npm run type-check
if [ $? -eq 0 ]; then
    echo "✅ TypeScript check passed!"
else
    echo "⚠️  TypeScript errors found (may still deploy)"
fi

# Check 5: Git Status
echo ""
echo "✓ Checking git status..."
if [ -d ".git" ]; then
    echo "✅ Git repository initialized"
    UNCOMMITTED=$(git status --porcelain | wc -l)
    if [ $UNCOMMITTED -gt 0 ]; then
        echo "⚠️  You have uncommitted changes"
        git status --short
    else
        echo "✅ All changes committed"
    fi
else
    echo "⚠️  Not a git repository. Initialize with: git init"
fi

# Check 6: Required Files
echo ""
echo "✓ Checking required files..."
FILES=("package.json" "next.config.js" "prisma/schema.prisma" "vercel.json")
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing!"
    fi
done

# Check 7: Vercel Configuration
echo ""
echo "✓ Checking Vercel configuration..."
if [ -f "vercel.json" ]; then
    echo "✅ vercel.json configured"
else
    echo "⚠️  vercel.json not found (Vercel will auto-detect)"
fi

# Summary
echo ""
echo "=========================================="
echo "📋 DEPLOYMENT CHECKLIST"
echo "=========================================="
echo ""
echo "Before deploying to Vercel, ensure:"
echo "  [ ] Build completed successfully ✅"
echo "  [ ] All changes committed to Git"
echo "  [ ] GitHub repository created"
echo "  [ ] Database ready (Vercel Postgres/Supabase)"
echo "  [ ] Environment variables prepared:"
echo "      - DATABASE_URL"
echo "      - JWT_SECRET"
echo "      - NODE_ENV=production"
echo ""
echo "🚀 Ready to deploy? Run:"
echo "   vercel --prod"
echo ""
echo "   OR deploy via Vercel Dashboard:"
echo "   https://vercel.com/new"
echo ""
echo "=========================================="

