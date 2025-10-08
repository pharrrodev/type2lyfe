# 🚀 Type2Lyfe - Bubblewrap Play Store Deployment Guide

**Status:** Bubblewrap CLI Installed ✅  
**Next Step:** Initialize TWA Project  
**Goal:** Get Type2Lyfe on Google Play Store

---

## 📋 What is Bubblewrap?

**Bubblewrap** is Google's official CLI tool that wraps your PWA into a native Android app using **Trusted Web Activities (TWA)**. Your PWA runs in a full-screen Chrome Custom Tab with no browser UI.

### **Advantages:**
- ✅ Official Google tool
- ✅ No code changes needed
- ✅ Full control over build process
- ✅ Automatic updates (content updates via PWA)
- ✅ Access to native Android features

---

## ✅ Prerequisites (What You Already Have)

- ✅ Bubblewrap CLI installed (`@bubblewrap/cli@1.24.1`)
- ✅ PWA fully functional at https://type2lyfe.vercel.app
- ✅ All app icons ready (512x512 for Play Store)
- ✅ Screenshots ready (20+ screenshots)
- ✅ Privacy Policy & Terms live
- ✅ HTTPS enabled on production URL

---

## 📦 What You Still Need

### 1. **Java Development Kit (JDK) 17+**
Bubblewrap requires JDK to build Android packages.

**Check if you have it:**
```powershell
java -version
```

**If not installed, download from:**
- https://adoptium.net/ (Recommended - Eclipse Temurin JDK 17 or 21)
- Install and add to PATH

### 2. **Android SDK**
You have two options:

**Option A: Android Studio (Easier)**
- Download: https://developer.android.com/studio
- Install Android Studio
- Open it and let it download the SDK automatically

**Option B: Command Line Tools Only (Smaller)**
- Download: https://developer.android.com/studio#command-tools
- Extract and set `ANDROID_HOME` environment variable

### 3. **Google Play Console Account**
- Cost: $25 one-time fee
- Sign up at: https://play.google.com/console
- Required to publish apps

### 4. **Digital Asset Links (for TWA)**
Your web server needs to verify app ownership.

---

## 🚀 Step-by-Step Instructions

### **Step 1: Initialize Bubblewrap Project**

Open PowerShell in your project directory:

```powershell
cd c:\pharrrohealth
bubblewrap init --manifest https://type2lyfe.vercel.app/manifest.json
```

**You'll be prompted for:**
- **Domain**: `type2lyfe.vercel.app`
- **App Name**: `Type2Lyfe`
- **Package ID**: `com.pharrrodev.type2lyfe`
- **Display Mode**: `standalone`
- **Orientation**: `any`
- **Theme Color**: `#14B8A6` (your teal color)
- **Background Color**: `#F7F9FC`
- **Icon URL**: `https://type2lyfe.vercel.app/icons/LOGO_GRAPHIC_PLAY_STORE_512_512.png`
- **Maskable Icon**: Same or specific maskable icon
- **Splash Screen**: Use same icon
- **Shortcuts**: Skip for now (press Enter)
- **Signing Key**: `auto` (will generate for you)

**This creates:**
- `twa-manifest.json` - Your TWA configuration
- `android-keystore.keystore` - Signing key (KEEP THIS SAFE!)
- `store_icon.png` - Downloaded icon

---

### **Step 2: Build the Android Package**

```powershell
bubblewrap build
```

This will:
1. Download Android build tools (first time only - takes 5-10 minutes)
2. Generate the Android project
3. Build a signed `.aab` (Android App Bundle)
4. Output: `app-release-signed.aab`

**Location:** `c:\pharrrohealth\app-release-signed.aab`

---

### **Step 3: Verify Digital Asset Links**

Create `.well-known/assetlinks.json` in your frontend:

```powershell
cd c:\pharrrohealth\frontend\public
mkdir .well-known
```

Then create `assetlinks.json` file (I'll help you with content in next step).

---

### **Step 4: Get Your SHA-256 Fingerprint**

After building, Bubblewrap will show you the SHA-256 fingerprint. You need this for Digital Asset Links.

**Or get it manually:**
```powershell
keytool -list -v -keystore android-keystore.keystore -alias android
```

**Password:** Check the Bubblewrap output or `twa-manifest.json`

Copy the SHA-256 fingerprint (looks like: `AA:BB:CC:DD:...`)

---

### **Step 5: Upload to Google Play Console**

1. **Go to:** https://play.google.com/console
2. **Create App:**
   - Click "Create app"
   - App name: `Type2Lyfe`
   - Default language: English (United States)
   - App or game: App
   - Free or paid: Free
   - Accept policies
   - Click "Create app"

3. **Fill Required Info:**
   - **App icon:** Use `LOGO_GRAPHIC_PLAY_STORE_512_512.png`
   - **Feature graphic:** Create a 1024x500 banner (or I can help you)
   - **Screenshots:** Upload your 20+ screenshots
   - **Short description:** (80 chars)
     ```
     Track glucose, meals, weight & BP with AI photo analysis
     ```
   - **Full description:** (Use from APP_STORE_READINESS.md)
   - **Privacy Policy:** `https://type2lyfe.vercel.app/privacy.html`
   - **App category:** Medical

4. **Upload AAB:**
   - Go to "Production" → "Create new release"
   - Upload `app-release-signed.aab`
   - Add release notes
   - Review and rollout

5. **Content Rating:**
   - Fill out questionnaire
   - Medical app, no violence/adult content

6. **Target Audience:**
   - Age 18+ (medical app)

7. **Submit for Review:**
   - Review all sections (must be green)
   - Submit

**Review time:** 1-3 days typically

---

## 🔒 Digital Asset Links Setup

### **What This Does:**
Proves you own both the website AND the Android app, allowing TWA to open without browser UI.

### **File to Create:**

`frontend/public/.well-known/assetlinks.json`:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.pharrrodev.type2lyfe",
    "sha256_cert_fingerprints": [
      "YOUR_SHA256_FINGERPRINT_HERE"
    ]
  }
}]
```

**Replace `YOUR_SHA256_FINGERPRINT_HERE` with the fingerprint from Step 4.**

### **Deploy:**
1. Commit and push to GitHub
2. Vercel will auto-deploy
3. Verify at: `https://type2lyfe.vercel.app/.well-known/assetlinks.json`

---

## 🔑 IMPORTANT: Backup Your Signing Key!

**The file `android-keystore.keystore` is CRITICAL!**

**Why?**
- You CANNOT update your app without it
- Google Play won't accept updates signed with a different key
- If you lose it, you must publish a NEW app with different package name

**What to do:**
1. **Copy** `android-keystore.keystore` to a USB drive
2. **Upload** to secure cloud storage (Google Drive, Dropbox)
3. **Store** the password somewhere safe (password manager)
4. **Add to .gitignore** (never commit to GitHub!)

**File locations:**
- Keystore: `c:\pharrrohealth\android-keystore.keystore`
- Password: In `twa-manifest.json` → `signingKey.storePassword`

---

## 📱 Testing Before Submission

### **Test on Physical Android Device:**

1. **Enable Developer Mode:**
   - Settings → About Phone → Tap "Build Number" 7 times
   - Go back → Developer Options → Enable "USB Debugging"

2. **Install ADB (Android Debug Bridge):**
   - Comes with Android Studio
   - Or download platform-tools

3. **Install Your App:**
   ```powershell
   adb install app-release-signed.aab
   ```

4. **Test All Features:**
   - Login with Google
   - Log glucose, meals, weight, BP
   - Take photos and analyze
   - Check dark/light mode
   - Test offline mode
   - Verify charts load

---

## 🐛 Troubleshooting

### **Problem: JDK not found**
**Solution:**
```powershell
# Check Java
java -version

# If not installed, download JDK 17+ from https://adoptium.net/
# After install, verify again
```

### **Problem: ANDROID_HOME not set**
**Solution:**
```powershell
# Set environment variable (replace path with your SDK location)
$env:ANDROID_HOME = "C:\Users\YourName\AppData\Local\Android\Sdk"

# Or set permanently in System Environment Variables
```

### **Problem: Build fails with "SDK not found"**
**Solution:**
```powershell
# Install Android SDK via Android Studio
# Or use Bubblewrap's doctor command
bubblewrap doctor
```

### **Problem: Digital Asset Links not working**
**Solution:**
- Verify file is accessible: `https://type2lyfe.vercel.app/.well-known/assetlinks.json`
- Check JSON is valid (no syntax errors)
- SHA-256 fingerprint must match exactly (including colons)
- Wait 5-10 minutes for Google to verify

### **Problem: App opens in browser UI**
**Solution:**
- Digital Asset Links not verified yet
- Check package name matches in assetlinks.json
- Verify SHA-256 fingerprint is correct
- May take 24-48 hours to propagate

---

## 📊 Quick Command Reference

```powershell
# Initialize new TWA project
bubblewrap init --manifest https://type2lyfe.vercel.app/manifest.json

# Build production AAB
bubblewrap build

# Update TWA configuration
bubblewrap update

# Check system dependencies
bubblewrap doctor

# Get keystore fingerprint
keytool -list -v -keystore android-keystore.keystore -alias android

# Install on connected device
adb install app-release-signed.aab

# View device logs
adb logcat
```

---

## 📝 Checklist

### **Before You Start:**
- [ ] Java JDK 17+ installed
- [ ] Android SDK installed (via Android Studio or CLI tools)
- [ ] Bubblewrap CLI installed ✅ (already done)
- [ ] Google Play Console account ($25)

### **Build Steps:**
- [ ] Run `bubblewrap init`
- [ ] Review and confirm all prompts
- [ ] Run `bubblewrap build`
- [ ] Save `android-keystore.keystore` safely
- [ ] Note the SHA-256 fingerprint

### **Deploy Steps:**
- [ ] Create `.well-known/assetlinks.json`
- [ ] Add SHA-256 fingerprint to assetlinks.json
- [ ] Deploy to Vercel (push to GitHub)
- [ ] Verify assetlinks.json is accessible
- [ ] Test app on physical Android device

### **Play Store Steps:**
- [ ] Create app in Play Console
- [ ] Upload all screenshots
- [ ] Upload app icon and feature graphic
- [ ] Write descriptions
- [ ] Upload AAB file
- [ ] Complete content rating
- [ ] Set target audience
- [ ] Submit for review

---

## 🎯 Summary

**You're at:** Bubblewrap installed, but project not initialized  
**Next command:** `bubblewrap init --manifest https://type2lyfe.vercel.app/manifest.json`  
**Time to Play Store:** 2-3 hours setup + 1-3 days review  
**Cost:** $25 (Google Play Console one-time fee)

---

## 🆘 Need Help?

If you get stuck:
1. Run `bubblewrap doctor` to check dependencies
2. Check Bubblewrap docs: https://github.com/GoogleChromeLabs/bubblewrap
3. Check PWA requirements: https://web.dev/pwa-checklist/
4. Open an issue on GitHub

---

**Good luck with your Play Store submission! 🚀**
