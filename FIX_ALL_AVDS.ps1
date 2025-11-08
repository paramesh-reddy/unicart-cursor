# Fix All AVD Configurations
# This script fixes all AVDs that are using unstable API 36

Write-Host "=== Fixing All Android AVD Configurations ===" -ForegroundColor Cyan
Write-Host ""

$avdPath = "$env:USERPROFILE\.android\avd"

if (-not (Test-Path $avdPath)) {
    Write-Host "No AVD directory found" -ForegroundColor Red
    exit 1
}

$avds = Get-ChildItem -Path $avdPath -Filter "*.avd" -Directory
$fixedCount = 0
$api36Count = 0

foreach ($avd in $avds) {
    $configFile = Join-Path $avd.FullName "config.ini"
    
    if (-not (Test-Path $configFile)) {
        continue
    }
    
    $content = Get-Content $configFile -Raw
    $original = $content
    
    # Check API version
    if ($content -match 'target=android-(\d+)') {
        $apiVersion = [int]$matches[1]
        Write-Host "Found: $($avd.Name) - API $apiVersion" -ForegroundColor Yellow
        
        if ($apiVersion -ge 36) {
            $api36Count++
            Write-Host "  ⚠️  WARNING: API $apiVersion is too new and unstable!" -ForegroundColor Red
            Write-Host "  💡 Recommendation: Delete this AVD and create new one with API 30 or 31" -ForegroundColor Yellow
        }
    }
    
    # Fix GPU mode
    $content = $content -replace 'hw\.gpu\.mode=auto', 'hw.gpu.mode=swiftshader_indirect'
    $content = $content -replace 'hw\.gpu\.mode=host', 'hw.gpu.mode=swiftshader_indirect'
    $content = $content -replace 'hw\.gpu\.mode=mesa', 'hw.gpu.mode=swiftshader_indirect'
    
    # Disable fast boot
    $content = $content -replace 'fastboot\.forceFastBoot=yes', 'fastboot.forceFastBoot=no'
    
    # Reduce RAM if too high
    if ($content -match 'hw\.ramSize=(\d+)') {
        $ramSize = [int]$matches[1]
        if ($ramSize -gt 3072) {
            $content = $content -replace "hw\.ramSize=$ramSize", 'hw.ramSize=2048'
            Write-Host "  ✓ Reduced RAM from ${ramSize}MB to 2048MB" -ForegroundColor Green
        }
    }
    
    if ($content -ne $original) {
        Set-Content -Path $configFile -Value $content -NoNewline
        Write-Host "  ✓ Fixed configuration" -ForegroundColor Green
        $fixedCount++
    }
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Processed: $($avds.Count) AVD(s)" -ForegroundColor White
Write-Host "Fixed: $fixedCount AVD(s)" -ForegroundColor Green
Write-Host "Using API 36+: $api36Count AVD(s)" -ForegroundColor $(if ($api36Count -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($api36Count -gt 0) {
    Write-Host "⚠️  CRITICAL: You have $api36Count AVD(s) using API 36+ which is unstable!" -ForegroundColor Red
    Write-Host ""
    Write-Host "RECOMMENDED ACTION:" -ForegroundColor Yellow
    Write-Host "1. Delete all API 36 AVDs in Android Studio Device Manager" -ForegroundColor White
    Write-Host "2. Create new AVDs with API 30 or 31 (stable)" -ForegroundColor White
    Write-Host "3. Use x86_64 architecture (not arm64)" -ForegroundColor White
    Write-Host "4. Use Google APIs (not Google Play)" -ForegroundColor White
    Write-Host ""
}

Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Try Cold Boot on your AVDs:" -ForegroundColor Yellow
Write-Host "   Device Manager > AVD dropdown > Cold Boot Now" -ForegroundColor White
Write-Host ""
Write-Host "2. If still crashing, create new stable AVDs:" -ForegroundColor Yellow
Write-Host "   - API 30 or 31 (NOT 36)" -ForegroundColor White
Write-Host "   - x86_64 architecture" -ForegroundColor White
Write-Host "   - RAM: 2048 MB" -ForegroundColor White
Write-Host ""
Write-Host "3. Use physical device (BEST):" -ForegroundColor Yellow
Write-Host "   Enable USB Debugging > Connect phone > Run app" -ForegroundColor White
Write-Host ""

