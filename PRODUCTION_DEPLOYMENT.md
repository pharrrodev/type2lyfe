# 🚀 Type2Lyfe Production Deployment Guide

**Complete step-by-step guide to deploy Type2Lyfe to production**

---

## 📋 **Prerequisites**

- ✅ GitHub account (for code repository)
- ✅ Render account (for backend + database) - https://render.com
- ✅ Vercel account (for frontend) - https://vercel.com
- ✅ Gemini API key (already have: AIzaSyCBvXhe6V-e6hu6AUOv7X432gx7ZrjxZlQ)

---

## 🗄️ **STEP 1: Deploy PostgreSQL Database on Render**

### **1.1 Create Render Account**
1. Go to https://render.com
2. Sign up with GitHub (recommended) or email
3. Verify your email

### **1.2 Create PostgreSQL Database**
1. Click **"New +"** button (top right)
2. Select **"PostgreSQL"**
3. Fill in details:
   - **Name:** `type2lyfe-db`
   - **Database:** `pharrrohealth`
   - **User:** `pharrrohealth_user` (auto-generated is fine)
   - **Region:** Choose closest to you (e.g., Oregon, Frankfurt)
   - **PostgreSQL Version:** 16 (latest)
   - **Plan:** **Free** (for testing) or **Starter** ($7/month for production)
4. Click **"Create Database"**
5. Wait 2-3 minutes for database to provision

### **1.3 Get Database Connection Details**
Once created, you'll see:
- **Internal Database URL** (for backend on Render)
- **External Database URL** (for local testing)
- **PSQL Command** (for running SQL)

**Save these URLs!** You'll need them.

### **1.4 Initialize Database Schema**
1. On the database page, click **"Connect"** → **"External Connection"**
2. Copy the **PSQL Command** (looks like):
   ```
   PSQL postgresql://user:password@host/database
   ```
3. Open your local terminal and run the PSQL command
4. Once connected, run the schema:
   ```sql
   -- Copy and paste the contents of backend/schema.sql
   -- Or run: \i backend/schema.sql
   ```
5. Verify tables created:
   ```sql
   \dt
   ```
   You should see: `users`, `logs`, `user_medications`
6. Exit: `\q`

**✅ Database is ready!**

---

## 🔧 **STEP 2: Deploy Backend to Render**

### **2.1 Prepare Backend for Deployment**

**Update `.env` file is NOT committed** (already in `.gitignore`)

### **2.2 Create Web Service on Render**
1. Go to Render Dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository:
   - Click **"Connect account"** (if first time)
   - Select **"pharrrodev/type2lyfe"** repository
   - Click **"Connect"**
4. Fill in details:
   - **Name:** `type2lyfe-backend`
   - **Region:** Same as database
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** **Free** (for testing) or **Starter** ($7/month)

### **2.3 Configure Environment Variables**
Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:

| Key | Value | Notes |
|-----|-------|-------|
| `GEMINI_API_KEY` | `AIzaSyCBvXhe6V-e6hu6AUOv7X432gx7ZrjxZlQ` | Your Gemini API key |
| `JWT_SECRET` | `08d6de2a82c1c04a218d85c535a12dd0acd589c410e89a9ef1cf3c5bdabb5115aedbfe3dcc0498e6650c03803b79d946e69928661f1abc374c718ef91a13983` | Your JWT secret |
| `FRONTEND_URL` | `https://type2lyfe.vercel.app` | Will update after frontend deploy |
| `DATABASE_URL` | `[Internal Database URL from Step 1.3]` | From Render database |
| `NODE_ENV` | `production` | Production mode |

**Important:** Use the **Internal Database URL** (starts with `postgresql://`)

### **2.4 Deploy Backend**
1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. Once deployed, you'll get a URL like: `https://type2lyfe-backend.onrender.com`
4. **Save this URL!** You'll need it for frontend

### **2.5 Test Backend**
Open in browser: `https://type2lyfe-backend.onrender.com/health`

Should see:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-05T..."
}
```

**✅ Backend is live!**

---

## 🎨 **STEP 3: Deploy Frontend to Vercel**

### **3.1 Update Frontend Environment**

**Update `frontend/.env.production`:**
```env
# Production Environment Variables
VITE_API_URL=https://type2lyfe-backend.onrender.com
```

**Commit this change:**
```bash
git add frontend/.env.production
git commit -m "Update production API URL"
git push origin main
```

### **3.2 Create Vercel Account**
1. Go to https://vercel.com
2. Sign up with GitHub (recommended)
3. Authorize Vercel to access your repositories

### **3.3 Deploy Frontend**
1. Click **"Add New..."** → **"Project"**
2. Import **"pharrrodev/type2lyfe"** repository
3. Configure project:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### **3.4 Configure Environment Variables**
Click **"Environment Variables"**

Add:
| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://type2lyfe-backend.onrender.com` |

### **3.5 Deploy**
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. You'll get a URL like: `https://type2lyfe.vercel.app`

**✅ Frontend is live!**

---

## 🔄 **STEP 4: Update Backend CORS**

Now that frontend is deployed, update backend CORS:

1. Go to Render Dashboard → **type2lyfe-backend**
2. Click **"Environment"**
3. Update `FRONTEND_URL`:
   - **Old:** `https://type2lyfe.vercel.app` (placeholder)
   - **New:** `https://[your-actual-vercel-url].vercel.app`
4. Click **"Save Changes"**
5. Backend will auto-redeploy (1-2 minutes)

**✅ CORS configured!**

---

## 🧪 **STEP 5: Test Production App**

### **5.1 Test on Desktop**
1. Open: `https://[your-vercel-url].vercel.app`
2. Register a new account
3. Login
4. Add glucose reading
5. Check Dashboard updates
6. Check Activity page

### **5.2 Test on Mobile**
1. Open same URL on your phone
2. Test all features
3. **Test PWA Install:**
   - Chrome: Menu → "Install app" or "Add to Home Screen"
   - Safari: Share → "Add to Home Screen"
4. Open installed app
5. Test offline mode (enable airplane mode)

---

## 📊 **STEP 6: Monitor & Verify**

### **Check Render Logs**
1. Go to Render Dashboard → **type2lyfe-backend**
2. Click **"Logs"** tab
3. Verify no errors

### **Check Vercel Logs**
1. Go to Vercel Dashboard → **type2lyfe**
2. Click **"Deployments"**
3. Click latest deployment → **"View Function Logs"**

### **Check Database**
1. Go to Render Dashboard → **type2lyfe-db**
2. Click **"Connect"** → Use PSQL command
3. Check data:
   ```sql
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM logs;
   ```

---

## 🎉 **DEPLOYMENT COMPLETE!**

Your app is now live at:
- **Frontend:** `https://[your-vercel-url].vercel.app`
- **Backend:** `https://type2lyfe-backend.onrender.com`
- **Database:** Render PostgreSQL

---

## 🔧 **Troubleshooting**

### **Backend won't start**
- Check Render logs for errors
- Verify all environment variables are set
- Verify DATABASE_URL is correct (Internal URL)

### **Frontend can't connect to backend**
- Check CORS settings (FRONTEND_URL in backend)
- Check VITE_API_URL in frontend
- Check browser console for errors

### **Database connection errors**
- Verify DATABASE_URL is Internal URL (not External)
- Check database is running on Render
- Check firewall/network settings

### **PWA not installing**
- Must use HTTPS (production URLs)
- Check manifest.json is accessible
- Check service worker is registered
- Clear browser cache and try again

---

## 📝 **Next Steps**

1. **Custom Domain** (Optional)
   - Vercel: Settings → Domains → Add domain
   - Update FRONTEND_URL in backend

2. **Monitoring**
   - Set up error tracking (Sentry)
   - Set up uptime monitoring (UptimeRobot)

3. **Backups**
   - Render PostgreSQL auto-backups (Starter plan)
   - Export data regularly

4. **Scaling**
   - Upgrade Render plans if needed
   - Add caching (Redis)
   - Add CDN for assets

---

## 💰 **Cost Estimate**

**Free Tier (Testing):**
- Render PostgreSQL: Free (90 days, then $7/month)
- Render Web Service: Free (sleeps after 15 min inactivity)
- Vercel: Free (hobby projects)
- **Total: $0/month** (first 90 days)

**Production Tier:**
- Render PostgreSQL Starter: $7/month
- Render Web Service Starter: $7/month
- Vercel Pro (optional): $20/month
- **Total: $14-34/month**

---

**Good luck! 🚀**

