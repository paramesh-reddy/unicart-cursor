#!/bin/bash

# ========================================
# UniCart - Fresh Git Repository Setup
# Complete Commands to Push to New Repo
# ========================================

echo "🚀 UniCart - Fresh Repository Setup"
echo "===================================="
echo ""

# Step 1: Check if .git exists and remove it
if [ -d ".git" ]; then
    echo "📁 Removing old .git directory..."
    rm -rf .git
    echo "✅ Old repository removed"
else
    echo "✅ No old repository found"
fi

# Step 2: Initialize fresh Git repository
echo ""
echo "🔧 Initializing fresh Git repository..."
git init
echo "✅ Git initialized"

# Step 3: Add all files (respecting .gitignore)
echo ""
echo "📦 Adding files to Git..."
git add .
echo "✅ Files staged"

# Step 4: Show what will be committed
echo ""
echo "📋 Files to be committed:"
git status --short

# Step 5: Create initial commit
echo ""
echo "💾 Creating initial commit..."
git commit -m "Initial commit - UniCart Full-Stack E-Commerce Platform

Features:
- Complete Next.js 14 frontend with TypeScript
- PostgreSQL database with Prisma ORM
- JWT authentication with role-based access
- RESTful API routes for all features
- Admin dashboard with product management
- Shopping cart and wishlist functionality
- Responsive design with Tailwind CSS
- Production-ready deployment configuration"

echo "✅ Initial commit created"

# Step 6: Show commit details
echo ""
echo "📊 Commit details:"
git log --oneline -1

# Step 7: Instructions for GitHub
echo ""
echo "===================================="
echo "📌 NEXT STEPS:"
echo "===================================="
echo ""
echo "1. Create a new repository on GitHub:"
echo "   → Go to: https://github.com/new"
echo "   → Repository name: unicart (or your preferred name)"
echo "   → Keep it PUBLIC or PRIVATE"
echo "   → Don't initialize with README, .gitignore, or license"
echo "   → Click 'Create repository'"
echo ""
echo "2. Add remote and push:"
echo "   Run these commands (replace YOUR-USERNAME and YOUR-REPO):"
echo ""
echo "   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Or if using SSH:"
echo ""
echo "   git remote add origin git@github.com:YOUR-USERNAME/YOUR-REPO.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "===================================="
echo "✅ Local repository is ready!"
echo "===================================="

