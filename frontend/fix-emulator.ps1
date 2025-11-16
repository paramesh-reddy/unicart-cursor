# Fix Android Emulator Error Script

Write-Host "=== Android Emulator Diagnostic ===" -ForegroundColor Cyan
Write-Host ""

# Check if Android SDK is installed
$androidHome = $env:ANDROID_HOME
if (-not $androidHome) {
    $androidHome = "$env:LOCALAPPDATA\Android\Sdk"
}

if (Test-Path $androidHome) {
    Write-Host "✓ Android SDK found at: $androidHome" -ForegroundColor Green
} else {
    Write-Host "✗ Android SDK not found. Please install Android Studio." -ForegroundColor Red
    exit 1
}

# Check for emulator
$emulatorPath = Join-Path $androidHome "emulator\emulator.exe"
if (Test-Path $emulatorPath) {
    Write-Host "✓ Android Emulator found" -ForegroundColor Green
} else {
    Write-Host "✗ Android Emulator not found. Install via Android Studio SDK Manager" -ForegroundColor Red
}

# Check AVD directory
$avdPath = "$env:USERPROFILE\.android\avd"
if (Test-Path $avdPath) {
    Write-Host "✓ AVD directory found: $avdPath" -ForegroundColor Green
    $avds = Get-ChildItem -Path $avdPath -Filter "*.avd" -Directory
    if ($avds.Count -gt 0) {
        Write-Host "  Found AVDs:" -ForegroundColor Yellow
        foreach ($avd in $avds) {
            Write-Host "    - $($avd.Name)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "✗ AVD directory not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Solutions ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Delete and recreate the AVD in Android Studio:" -ForegroundColor Yellow
Write-Host "   - Tools > Device Manager > Delete Pixel_6 > Create new device" -ForegroundColor White
Write-Host ""
Write-Host "2. Cold boot the AVD:" -ForegroundColor Yellow
Write-Host "   - Device Manager > Pixel_6 dropdown > Cold Boot Now" -ForegroundColor White
Write-Host ""
Write-Host "3. Use a physical device instead:" -ForegroundColor Yellow
Write-Host "   - Enable USB Debugging on your phone" -ForegroundColor White
Write-Host "   - Connect via USB cable" -ForegroundColor White
Write-Host "   - Run: npm run cap:android" -ForegroundColor White
Write-Host ""
Write-Host "4. Check hardware acceleration:" -ForegroundColor Yellow
Write-Host "   - Ensure virtualization is enabled in BIOS" -ForegroundColor White
Write-Host "   - Install Intel HAXM or Hyper-V driver" -ForegroundColor White
Write-Host ""

# Check if physical device is connected
Write-Host "=== Checking for connected devices ===" -ForegroundColor Cyan
$adbPath = Join-Path $androidHome "platform-tools\adb.exe"
if (Test-Path $adbPath) {
    $devices = & $adbPath devices
    if ($devices.Count -gt 2) {
        Write-Host "✓ Physical device(s) detected!" -ForegroundColor Green
        Write-Host $devices -ForegroundColor White
        Write-Host ""
        Write-Host "You can use a physical device instead of the emulator." -ForegroundColor Green
    } else {
        Write-Host "No physical devices connected" -ForegroundColor Yellow
    }
} else {
    Write-Host "ADB not found. Cannot check for devices." -ForegroundColor Yellow
}

