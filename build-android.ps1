# Type2Lyfe - Android Build Script
# This script helps you build your PWA for Play Store using Bubblewrap

Write-Host "🚀 Type2Lyfe - Android Build Helper" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Check if Bubblewrap is installed
Write-Host "Checking Bubblewrap installation..." -ForegroundColor Yellow
$bubblewrapInstalled = npm list -g @bubblewrap/cli 2>&1
if ($bubblewrapInstalled -like "*@bubblewrap/cli*") {
    Write-Host "✅ Bubblewrap CLI is installed`n" -ForegroundColor Green
} else {
    Write-Host "❌ Bubblewrap CLI not found. Installing..." -ForegroundColor Red
    npm install -g @bubblewrap/cli
    Write-Host "✅ Bubblewrap CLI installed`n" -ForegroundColor Green
}

# Check if Java is installed
Write-Host "Checking Java installation..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1
    if ($javaVersion -like "*version*") {
        Write-Host "✅ Java is installed: $($javaVersion[0])`n" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Java not found!" -ForegroundColor Red
    Write-Host "   Please install JDK 17+ from: https://adoptium.net/`n" -ForegroundColor Yellow
    exit 1
}

# Check if twa-manifest.json exists
if (Test-Path "twa-manifest.json") {
    Write-Host "✅ TWA project already initialized`n" -ForegroundColor Green
    
    # Ask if user wants to rebuild
    $rebuild = Read-Host "Do you want to build the Android package? (Y/N)"
    if ($rebuild -eq "Y" -or $rebuild -eq "y") {
        Write-Host "`nBuilding Android package..." -ForegroundColor Yellow
        bubblewrap build
        
        if (Test-Path "app-release-signed.aab") {
            Write-Host "`n✅ SUCCESS! Android package created: app-release-signed.aab" -ForegroundColor Green
            Write-Host "`n📱 Next steps:" -ForegroundColor Cyan
            Write-Host "1. Backup android-keystore.keystore to safe location" -ForegroundColor White
            Write-Host "2. Create Digital Asset Links file" -ForegroundColor White
            Write-Host "3. Upload app-release-signed.aab to Google Play Console" -ForegroundColor White
            Write-Host "`nSee BUBBLEWRAP_PLAY_STORE_GUIDE.md for detailed instructions.`n" -ForegroundColor Yellow
        } else {
            Write-Host "`n❌ Build failed. Run 'bubblewrap doctor' to check dependencies.`n" -ForegroundColor Red
        }
    }
} else {
    Write-Host "⚠️  TWA project not initialized yet`n" -ForegroundColor Yellow
    Write-Host "To initialize, run:" -ForegroundColor White
    Write-Host "bubblewrap init --manifest https://type2lyfe.vercel.app/manifest.json`n" -ForegroundColor Green
    
    $init = Read-Host "Do you want to initialize now? (Y/N)"
    if ($init -eq "Y" -or $init -eq "y") {
        Write-Host "`nInitializing TWA project..." -ForegroundColor Yellow
        Write-Host "You'll be prompted for configuration. Use these values:`n" -ForegroundColor Cyan
        Write-Host "  Domain: type2lyfe.vercel.app" -ForegroundColor White
        Write-Host "  App Name: Type2Lyfe" -ForegroundColor White
        Write-Host "  Package ID: com.pharrrodev.type2lyfe" -ForegroundColor White
        Write-Host "  Theme Color: #14B8A6" -ForegroundColor White
        Write-Host "  Background Color: #F7F9FC`n" -ForegroundColor White
        
        Read-Host "Press Enter to continue..."
        bubblewrap init --manifest https://type2lyfe.vercel.app/manifest.json
        
        if (Test-Path "twa-manifest.json") {
            Write-Host "`n✅ TWA project initialized!`n" -ForegroundColor Green
            Write-Host "Next, run this script again to build the Android package.`n" -ForegroundColor Yellow
        }
    } else {
        Write-Host "`nRun this script again when ready to initialize.`n" -ForegroundColor Yellow
    }
}

Write-Host "📚 For full guide, see: BUBBLEWRAP_PLAY_STORE_GUIDE.md`n" -ForegroundColor Cyan
