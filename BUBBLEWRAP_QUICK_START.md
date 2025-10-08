# 🎯 Bubblewrap Quick Start - Type2Lyfe

## What You Have Done ✅
- ✅ Installed Bubblewrap CLI globally (`@bubblewrap/cli@1.24.1`)
- ✅ PWA is production-ready at https://type2lyfe.vercel.app
- ✅ All assets prepared (icons, screenshots, legal docs)

## What You Haven't Done Yet ❌
- ❌ Initialize TWA project (`bubblewrap init`)
- ❌ Build Android package (`.aab` file)
- ❌ Configure Digital Asset Links
- ❌ Submit to Google Play Store

---

## 🚀 Next Steps (30 minutes)

### **Step 1: Check Prerequisites**
```powershell
# Check Java (need 17+)
java -version

# If not installed, download from: https://adoptium.net/

# Check Bubblewrap
npm list -g @bubblewrap/cli
```

### **Step 2: Initialize TWA Project**
```powershell
cd c:\pharrrohealth

# Run the init command
bubblewrap init --manifest https://type2lyfe.vercel.app/manifest.json
```

**When prompted, use these values:**
- **Domain**: `type2lyfe.vercel.app`
- **Package ID**: `com.pharrrodev.type2lyfe`
- **App Name**: `Type2Lyfe`
- **Theme Color**: `#14B8A6`
- **Background**: `#F7F9FC`
- **Icon**: Accept default (512x512)
- **Signing**: `auto` (generates keystore)

### **Step 3: Build Android Package**
```powershell
bubblewrap build
```

This creates: `app-release-signed.aab` (your Play Store package!)

### **Step 4: Get SHA-256 Fingerprint**
```powershell
keytool -list -v -keystore android-keystore.keystore -alias android
```

Copy the SHA-256 fingerprint (looks like `AA:BB:CC:...`)

### **Step 5: Update Digital Asset Links**
Edit: `frontend/public/.well-known/assetlinks.json`

Replace `REPLACE_WITH_YOUR_SHA256_FINGERPRINT` with your actual fingerprint.

### **Step 6: Deploy to Vercel**
```powershell
git add .
git commit -m "Add Bubblewrap TWA config and Digital Asset Links"
git push origin main
```

Vercel auto-deploys! Verify at:
https://type2lyfe.vercel.app/.well-known/assetlinks.json

---

## 🎯 Alternative: Use the Helper Script

I created a script to automate this:

```powershell
cd c:\pharrrohealth
.\build-android.ps1
```

This script:
- ✅ Checks all prerequisites
- ✅ Initializes TWA project
- ✅ Builds Android package
- ✅ Shows next steps

---

## 📱 Play Store Submission (1 hour)

1. **Create Google Play Console Account**
   - https://play.google.com/console
   - Cost: $25 (one-time)

2. **Create New App**
   - Click "Create app"
   - Name: Type2Lyfe
   - Language: English

3. **Upload Assets**
   - **Icon**: `frontend/public/icons/LOGO_GRAPHIC_PLAY_STORE_512_512.png`
   - **Screenshots**: Use the 20+ screenshots from `frontend/public/screenshots/`
   - **Feature Graphic**: 1024x500 (create if needed)

4. **Upload AAB**
   - Go to Production → Create Release
   - Upload `app-release-signed.aab`

5. **Fill Required Info**
   - Privacy Policy: https://type2lyfe.vercel.app/privacy.html
   - Description: (see BUBBLEWRAP_PLAY_STORE_GUIDE.md)
   - Category: Medical
   - Content Rating: Complete questionnaire

6. **Submit for Review**
   - Review all sections (green checkmarks)
   - Click "Submit"
   - Wait 1-3 days for approval

---

## 🔒 CRITICAL: Backup Your Keystore!

After building, **immediately backup** these files:

**Files:**
- `android-keystore.keystore` ← MOST IMPORTANT!
- `twa-manifest.json`

**Backup locations:**
1. USB drive
2. Cloud storage (Google Drive, Dropbox)
3. Password manager (for keystore password)

**Why?**
Without the keystore, you **cannot** update your app! You'd have to publish a new app with different package name.

---

## 🐛 Troubleshooting

### "Java not found"
**Fix:** Install JDK 17+ from https://adoptium.net/

### "ANDROID_HOME not set"
**Fix:** 
```powershell
# Option 1: Install Android Studio (easiest)
# Download from: https://developer.android.com/studio

# Option 2: Set manually (after installing SDK)
$env:ANDROID_HOME = "C:\Users\YourName\AppData\Local\Android\Sdk"
```

### "bubblewrap: command not found"
**Fix:**
```powershell
npm install -g @bubblewrap/cli
```

### "Build fails"
**Fix:**
```powershell
# Check what's missing
bubblewrap doctor

# Follow its recommendations
```

---

## 📚 Documentation

- **Full Guide**: `BUBBLEWRAP_PLAY_STORE_GUIDE.md`
- **App Store Assets**: `APP_STORE_SUBMISSION_STATUS.md`
- **Bubblewrap Docs**: https://github.com/GoogleChromeLabs/bubblewrap

---

## 🎯 Summary

**Current Status:** Bubblewrap installed, TWA not initialized  
**Next Command:** `bubblewrap init --manifest https://type2lyfe.vercel.app/manifest.json`  
**Or Run Script:** `.\build-android.ps1`  
**Time to Store:** 30 min build + 1 hour submission + 1-3 days review  
**Total Cost:** $25 (Google Play Console)

---

## ✅ Checklist

- [ ] Java JDK 17+ installed
- [ ] Android SDK installed (via Android Studio)
- [ ] Run `bubblewrap init`
- [ ] Run `bubblewrap build`
- [ ] Get SHA-256 fingerprint
- [ ] Update assetlinks.json
- [ ] Deploy to Vercel
- [ ] Backup keystore file
- [ ] Create Play Console account
- [ ] Submit app

---

**Good luck! You're almost there! 🚀**
