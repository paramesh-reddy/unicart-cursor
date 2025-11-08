# Fix Android Emulator AVD Configuration
# This script fixes common AVD configuration issues that cause crashes

Write-Host "=== Fixing Android Emulator AVD Configuration ===" -ForegroundColor Cyan
Write-Host ""

$androidSdk = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { "$env:LOCALAPPDATA\Android\Sdk" }
$avdPath = "$env:USERPROFILE\.android\avd"

if (-not (Test-Path $avdPath)) {
    Write-Host "No AVD directory found at: $avdPath" -ForegroundColor Red
    exit 1
}

$avds = Get-ChildItem -Path $avdPath -Filter "*.avd" -Directory

if ($avds.Count -eq 0) {
    Write-Host "No AVDs found" -ForegroundColor Yellow
    exit 0
}

foreach ($avd in $avds) {
    $configFile = Join-Path $avd.FullName "config.ini"
    
    if (-not (Test-Path $configFile)) {
        Write-Host "Skipping $($avd.Name) - no config.ini found" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "Fixing: $($avd.Name)..." -ForegroundColor Yellow
    
    $content = Get-Content $configFile -Raw
    $original = $content
    
    # Fix GPU mode - use software rendering for better compatibility
    $content = $content -replace 'hw\.gpu\.mode=auto', 'hw.gpu.mode=swiftshader_indirect'
    $content = $content -replace 'hw\.gpu\.mode=host', 'hw.gpu.mode=swiftshader_indirect'
    $content = $content -replace 'hw\.gpu\.mode=mesa', 'hw.gpu.mode=swiftshader_indirect'
    
    # Disable fast boot to force cold boot (more stable)
    $content = $content -replace 'fastboot\.forceFastBoot=yes', 'fastboot.forceFastBoot=no'
    
    # Reduce RAM if too high (can cause crashes)
    if ($content -match 'hw\.ramSize=(\d+)') {
        $ramSize = [int]$matches[1]
        if ($ramSize -gt 3072) {
            $content = $content -replace "hw\.ramSize=$ramSize", 'hw.ramSize=2048'
            Write-Host "  - Reduced RAM from ${ramSize}MB to 2048MB" -ForegroundColor Green
        }
    }
    
    # Ensure GPU is enabled
    if ($content -notmatch 'hw\.gpu\.enabled=yes') {
        if ($content -match 'hw\.gpu\.enabled') {
            $content = $content -replace 'hw\.gpu\.enabled=no', 'hw.gpu.enabled=yes'
        } else {
            $content += "`nhw.gpu.enabled=yes"
        }
    }
    
    if ($content -ne $original) {
        Set-Content -Path $configFile -Value $content -NoNewline
        Write-Host "  ✓ Fixed configuration" -ForegroundColor Green
    } else {
        Write-Host "  - No changes needed" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=== Additional Steps ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. In Android Studio, try Cold Boot:" -ForegroundColor Yellow
Write-Host "   Device Manager > Pixel_5 dropdown > Cold Boot Now" -ForegroundColor White
Write-Host ""
Write-Host "2. If still crashing, try:" -ForegroundColor Yellow
Write-Host "   - Delete Pixel_5 AVD" -ForegroundColor White
Write-Host "   - Create new AVD with:" -ForegroundColor White
Write-Host "     * API 30 or 31 (not 36)" -ForegroundColor White
Write-Host "     * x86_64 architecture" -ForegroundColor White
Write-Host "     * RAM: 2048 MB" -ForegroundColor White
Write-Host "     * Graphics: Hardware - GLES 2.0" -ForegroundColor White
Write-Host ""
Write-Host "3. Use a physical device (recommended):" -ForegroundColor Yellow
Write-Host "   Enable USB Debugging > Connect phone > Run app" -ForegroundColor White
Write-Host ""

