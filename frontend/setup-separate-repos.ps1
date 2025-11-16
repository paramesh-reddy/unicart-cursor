# PowerShell Script to Separate Frontend and Backend Repos
# Run this script to set up separate repositories

Write-Host "🚀 Setting up separate repositories..." -ForegroundColor Green

# Step 1: Create Backend Repository
Write-Host "`n📦 Step 1: Creating backend repository..." -ForegroundColor Yellow

# Get current directory
$currentDir = Get-Location
$parentDir = Split-Path -Parent $currentDir
$backendDir = Join-Path $parentDir "unicart-backend"

# Create backend directory
if (Test-Path $backendDir) {
    Write-Host "Backend directory already exists. Skipping..." -ForegroundColor Yellow
} else {
    New-Item -ItemType Directory -Path $backendDir
    Write-Host "Created backend directory: $backendDir" -ForegroundColor Green
}

# Copy backend files
$backendSource = Join-Path $currentDir "backend"
if (Test-Path $backendSource) {
    Write-Host "Copying backend files..." -ForegroundColor Yellow
    Copy-Item -Path "$backendSource\*" -Destination $backendDir -Recurse -Force
    Write-Host "Backend files copied!" -ForegroundColor Green
} else {
    Write-Host "ERROR: Backend folder not found at $backendSource" -ForegroundColor Red
    exit 1
}

# Initialize git in backend
Set-Location $backendDir
if (Test-Path ".git") {
    Write-Host "Git already initialized in backend" -ForegroundColor Yellow
} else {
    git init
    Write-Host "Git initialized in backend" -ForegroundColor Green
}

# Create .gitignore for backend
$gitignoreContent = @"
node_modules/
.env
.env.local
dist/
.vercel/
*.log
.DS_Store
"@
Set-Content -Path ".gitignore" -Value $gitignoreContent
Write-Host "Created .gitignore for backend" -ForegroundColor Green

# Add and commit
git add .
git commit -m "Initial commit - UniCart Backend" 2>&1 | Out-Null
Write-Host "Backend repository ready!" -ForegroundColor Green

# Step 2: Prepare Frontend Repository
Write-Host "`n📦 Step 2: Preparing frontend repository..." -ForegroundColor Yellow

Set-Location $currentDir

# Remove backend folder from frontend
if (Test-Path "backend") {
    Write-Host "Removing backend folder from frontend repo..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "backend"
    Write-Host "Backend folder removed from frontend" -ForegroundColor Green
}

# Create/update .gitignore for frontend
$frontendGitignore = @"
node_modules/
.env
.env.local
.next/
.vercel/
dist/
*.log
.DS_Store
android/
"@
Set-Content -Path ".gitignore" -Value $frontendGitignore
Write-Host "Updated .gitignore for frontend" -ForegroundColor Green

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Backend: Go to $backendDir" -ForegroundColor White
Write-Host "   - Create GitHub repo: unicart-backend" -ForegroundColor White
Write-Host "   - Run: git remote add origin https://github.com/YOUR_USERNAME/unicart-backend.git" -ForegroundColor White
Write-Host "   - Run: git push -u origin main" -ForegroundColor White
Write-Host "`n2. Frontend: Stay in current directory" -ForegroundColor White
Write-Host "   - Create GitHub repo: unicart-frontend" -ForegroundColor White
Write-Host "   - Run: git add ." -ForegroundColor White
Write-Host "   - Run: git commit -m 'Remove backend - separate repo'" -ForegroundColor White
Write-Host "   - Run: git remote set-url origin https://github.com/YOUR_USERNAME/unicart-frontend.git" -ForegroundColor White
Write-Host "   - Run: git push -u origin main" -ForegroundColor White

