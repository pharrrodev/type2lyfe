# 🚀 DEPLOY NOW - Quick Reference Guide

**Follow these steps to deploy Type2Lyfe to production in ~40 minutes**

---

## ✅ **STEP 1: Deploy Database (10 minutes)**

### **1.1 Create Render Account**
1. Go to: **https://render.com**
2. Click **"Get Started"** → Sign up with GitHub
3. Authorize Render to access your GitHub

### **1.2 Create PostgreSQL Database**
1. Click **"New +"** (top right) → **"PostgreSQL"**
2. Fill in:
   - **Name:** `type2lyfe-db`
   - **Database:** `pharrrohealth`
   - **Region:** Choose closest (e.g., Oregon USA, Frankfurt EU)
   - **Plan:** **Free** (for now)
3. Click **"Create Database"**
4. Wait 2-3 minutes ⏳

### **1.3 Initialize Database**
1. Once created, click **"Connect"** → **"External Connection"**
2. Copy the **PSQL Command** (looks like):
   ```
   PSQL postgresql://pharrrohealth_user:xxxxx@dpg-xxxxx-a.oregon-postgres.render.com/pharrrohealth
   ```
3. Open **PowerShell** on your laptop
4. Paste and run the PSQL command
5. Once connected, copy/paste this SQL:
   ```sql
   CREATE TABLE IF NOT EXISTS users (
     id SERIAL PRIMARY KEY,
     username VARCHAR(255) UNIQUE NOT NULL,
     email VARCHAR(255) UNIQUE NOT NULL,
     password_hash VARCHAR(255) NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE IF NOT EXISTS logs (
     id SERIAL PRIMARY KEY,
     user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
     timestamp TIMESTAMPTZ NOT NULL,
     type VARCHAR(50) NOT NULL,
     data JSONB NOT NULL
   );

   CREATE TABLE IF NOT EXISTS user_medications (
     id SERIAL PRIMARY KEY,
     user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
     name VARCHAR(255) NOT NULL,
     dosage VARCHAR(255),
     unit VARCHAR(50)
   );

   CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
   CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
   CREATE INDEX IF NOT EXISTS idx_logs_type ON logs(type);
   CREATE INDEX IF NOT EXISTS idx_user_medications_user_id ON user_medications(user_id);
   ```
6. Verify: Type `\dt` and press Enter (should show 3 tables)
7. Exit: Type `\q` and press Enter

### **1.4 Save Database URL**
1. Go back to Render database page
2. Scroll down to **"Connections"**
3. Copy **"Internal Database URL"** (starts with `postgresql://`)
4. **SAVE THIS!** You'll need it in Step 2

✅ **Database ready!**

---

## ✅ **STEP 2: Deploy Backend (15 minutes)**

### **2.1 Create Web Service**
1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Click **"Build and deploy from a Git repository"** → **"Next"**
3. Find **"pharrrodev/type2lyfe"** → Click **"Connect"**
4. Fill in:
   - **Name:** `type2lyfe-backend`
   - **Region:** **Same as database!**
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** **Free**

### **2.2 Add Environment Variables**
Click **"Advanced"** → Scroll to **"Environment Variables"**

Add these **5 variables** (click "Add Environment Variable" for each):

| Key | Value |
|-----|-------|
| `GEMINI_API_KEY` | `[YOUR_GEMINI_API_KEY_HERE]` |
| `JWT_SECRET` | `[YOUR_JWT_SECRET_HERE]` |
| `FRONTEND_URL` | `https://type2lyfe.vercel.app` |
| `DATABASE_URL` | **[Paste Internal Database URL from Step 1.4]** |
| `NODE_ENV` | `production` |

### **2.3 Deploy**
1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment ⏳
3. Watch the logs - should see "Connected to the database!"
4. Once deployed, you'll see: **"Your service is live 🎉"**
5. Copy your backend URL (looks like): `https://type2lyfe-backend.onrender.com`
6. **SAVE THIS URL!** You'll need it in Step 3

### **2.4 Test Backend**
1. Click the URL or open in browser: `https://type2lyfe-backend.onrender.com/health`
2. Should see:
   ```json
   {
     "status": "healthy",
     "timestamp": "2025-10-05T...",
     "environment": "production"
   }
   ```

✅ **Backend is live!**

---

## ✅ **STEP 3: Deploy Frontend (10 minutes)**

### **3.1 Update Frontend Config**
1. Open your code editor
2. Edit `frontend/.env.production`
3. Update line 6 with your **actual backend URL** from Step 2.3:
   ```env
   VITE_API_URL=https://type2lyfe-backend.onrender.com
   ```
   (Replace with your actual URL if different)
4. Save file
5. Commit and push:
   ```bash
   git add frontend/.env.production
   git commit -m "Update production backend URL"
   git push origin main
   ```

### **3.2 Create Vercel Account**
1. Go to: **https://vercel.com**
2. Click **"Sign Up"** → **"Continue with GitHub"**
3. Authorize Vercel

### **3.3 Deploy Frontend**
1. Click **"Add New..."** → **"Project"**
2. Find **"pharrrodev/type2lyfe"** → Click **"Import"**
3. Configure:
   - **Framework Preset:** `Vite` (should auto-detect)
   - **Root Directory:** Click **"Edit"** → Type `frontend` → Click **"Continue"**
   - **Build Command:** `npm run build` (auto-filled)
   - **Output Directory:** `dist` (auto-filled)
   - **Install Command:** `npm install` (auto-filled)

### **3.4 Add Environment Variable**
1. Expand **"Environment Variables"**
2. Add:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://type2lyfe-backend.onrender.com` (your backend URL)
3. Click **"Add"**

### **3.5 Deploy**
1. Click **"Deploy"**
2. Wait 2-3 minutes ⏳
3. You'll see: **"Congratulations! 🎉"**
4. Click **"Continue to Dashboard"**
5. Copy your frontend URL (looks like): `https://type2lyfe-xxxxx.vercel.app`
6. **SAVE THIS URL!**

✅ **Frontend is live!**

---

## ✅ **STEP 4: Update Backend CORS (5 minutes)**

### **4.1 Update CORS Setting**
1. Go back to **Render Dashboard**
2. Click **"type2lyfe-backend"**
3. Click **"Environment"** (left sidebar)
4. Find `FRONTEND_URL`
5. Click **"Edit"** (pencil icon)
6. Update value to your **actual Vercel URL** from Step 3.5:
   ```
   https://type2lyfe-xxxxx.vercel.app
   ```
7. Click **"Save Changes"**
8. Backend will auto-redeploy (1-2 minutes) ⏳

✅ **CORS configured!**

---

## ✅ **STEP 5: Test Production App (5 minutes)**

### **5.1 Test on Desktop**
1. Open your Vercel URL: `https://type2lyfe-xxxxx.vercel.app`
2. **Register** a new account (use real email)
3. **Login**
4. **Add glucose reading** (e.g., 7.5 mmol/L)
5. Check **Dashboard** updates
6. Check **Activity** page shows entry
7. Try **Dark mode** toggle in Settings

### **5.2 Test on Mobile** 📱
1. Open same URL on your phone
2. Test all features
3. **Install PWA:**
   - **Chrome:** Menu (⋮) → "Install app"
   - **Safari:** Share (↑) → "Add to Home Screen"
4. Open installed app from home screen
5. Test features work in installed app

### **5.3 Test Offline Mode** ✈️
1. In installed PWA app
2. Enable **Airplane mode**
3. App should still load (cached)
4. Disable airplane mode
5. Add new entry - should sync

---

## 🎉 **DEPLOYMENT COMPLETE!**

Your app is now live at:
- **Frontend:** `https://type2lyfe-xxxxx.vercel.app`
- **Backend:** `https://type2lyfe-backend.onrender.com`
- **Database:** Render PostgreSQL

---

## 📱 **Share Your App!**

Send this link to anyone:
```
https://type2lyfe-xxxxx.vercel.app
```

They can:
- ✅ Use it in browser
- ✅ Install as PWA
- ✅ Use offline
- ✅ Get notifications (future feature)

---

## 🔧 **Troubleshooting**

### **"Failed to fetch" error on frontend**
- Check backend is running: Visit `https://type2lyfe-backend.onrender.com/health`
- Check CORS: Make sure `FRONTEND_URL` in backend matches your Vercel URL exactly
- Check browser console for specific error

### **Backend shows "Error acquiring client"**
- Check `DATABASE_URL` is set correctly in Render
- Make sure you used **Internal Database URL** (not External)
- Check database is running on Render

### **PWA won't install**
- Must use HTTPS (production URLs have this)
- Clear browser cache and try again
- Check manifest.json is accessible: `https://your-url.vercel.app/manifest.json`

---

## 💰 **Costs**

**Current Setup (Free Tier):**
- Render PostgreSQL: Free for 90 days
- Render Web Service: Free (sleeps after 15 min inactivity)
- Vercel: Free forever (hobby projects)

**After 90 days:**
- Render PostgreSQL: $7/month
- Render Web Service: Can stay free or upgrade to $7/month for always-on

---

## 🚀 **Next Steps**

1. **Custom Domain** (Optional)
   - Buy domain (e.g., type2lyfe.com)
   - Add to Vercel: Settings → Domains
   - Update `FRONTEND_URL` in backend

2. **Monitoring**
   - Check Render logs regularly
   - Set up error tracking (Sentry)

3. **Backups**
   - Export data from Settings page
   - Render auto-backups (paid plan)

---

**Congratulations! Your app is live! 🎊**

