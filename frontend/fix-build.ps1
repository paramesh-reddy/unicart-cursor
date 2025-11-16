# Fix Build Script for UniCart
# This script fixes all build issues

Write-Host "=== Fixing Build Issues ===" -ForegroundColor Cyan

# 1. Fix PowerShell execution policy
Write-Host "`n1. Setting PowerShell execution policy..." -ForegroundColor Yellow
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force

# 2. Install missing dependencies
Write-Host "`n2. Installing missing dependencies..." -ForegroundColor Yellow
npm install fast-check --save-dev
npm install lucide-react --save

# 3. Generate Prisma Client
Write-Host "`n3. Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

# 4. Run type check
Write-Host "`n4. Running type check..." -ForegroundColor Yellow
npm run type-check

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Type check passed!" -ForegroundColor Green
    Write-Host "`n5. Building project..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✓✓ Build successful!" -ForegroundColor Green
    } else {
        Write-Host "`n✗ Build failed. Check errors above." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "`n✗ Type check failed. Fix errors before building." -ForegroundColor Red
    exit 1
}


