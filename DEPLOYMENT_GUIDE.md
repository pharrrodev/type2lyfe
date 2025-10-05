# 🚀 Type2Lyfe Deployment Guide

## Overview
This guide will help you deploy the Type2Lyfe application to production using Vercel (frontend) and Render (backend).

---

## 📋 Prerequisites

Before deploying, ensure you have:
- ✅ GitHub account with the repository pushed
- ✅ Vercel account (free tier available)
- ✅ Render account (free tier available)
- ✅ Google Gemini API key (for AI features)
- ✅ PostgreSQL database (Render provides free tier)

---

## 🗄️ Step 1: Deploy Database (Render PostgreSQL)

### 1.1 Create PostgreSQL Database
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `type2lyfe-db`
   - **Database**: `type2lyfe`
   - **User**: `type2lyfe_user` (auto-generated)
   - **Region**: Choose closest to your users
   - **Plan**: **Free** (or paid for production)
4. Click **"Create Database"**
5. Wait for database to provision (~2 minutes)

### 1.2 Get Database Connection String
1. Once created, go to database dashboard
2. Copy the **"External Database URL"** (starts with `postgres://`)
3. Save this for backend deployment

### 1.3 Initialize Database Schema
1. Connect to database using connection string
2. Run the SQL schema from `backend/schema.sql` (if exists)
3. Or let the backend auto-create tables on first run

---

## 🔧 Step 2: Deploy Backend (Render Web Service)

### 2.1 Create Web Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the `type2lyfe` repository

### 2.2 Configure Service
- **Name**: `type2lyfe-backend`
- **Region**: Same as database
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: **Free** (or paid for production)

### 2.3 Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:
```
PORT=3000
NODE_ENV=production
DATABASE_URL=<your-postgres-connection-string>
JWT_SECRET=<generate-a-secure-random-string>
GEMINI_API_KEY=<your-google-gemini-api-key>
FRONTEND_URL=<will-add-after-frontend-deployment>
```

**To generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2.4 Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (~3-5 minutes)
3. Once deployed, copy the service URL (e.g., `https://type2lyfe-backend.onrender.com`)

### 2.5 Update CORS Settings
1. Go back to environment variables
2. Update `FRONTEND_URL` with your Vercel URL (will add in next step)
3. Save changes (will trigger redeploy)

---

## 🌐 Step 3: Deploy Frontend (Vercel)

### 3.1 Import Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Select `type2lyfe` repository

### 3.2 Configure Project
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3.3 Add Environment Variables
Click **"Environment Variables"** and add:

```
VITE_API_URL=<your-render-backend-url>
```

Example:
```
VITE_API_URL=https://type2lyfe-backend.onrender.com
```

### 3.4 Deploy
1. Click **"Deploy"**
2. Wait for deployment (~2-3 minutes)
3. Once deployed, you'll get a URL like: `https://type2lyfe.vercel.app`

### 3.5 Add Custom Domain (Optional)
1. Go to project settings → **"Domains"**
2. Add your custom domain (e.g., `type2lyfe.app`)
3. Follow DNS configuration instructions
4. Wait for SSL certificate provisioning

---

## 🔄 Step 4: Update Backend CORS

Now that you have the frontend URL:

1. Go back to Render backend service
2. Update environment variable:
   ```
   FRONTEND_URL=https://type2lyfe.vercel.app
   ```
3. Save (will trigger redeploy)

---

## ✅ Step 5: Verify Deployment

### 5.1 Test Backend
Visit: `https://your-backend-url.onrender.com/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-01-05T..."
}
```

### 5.2 Test Frontend
1. Visit your Vercel URL
2. Try to register a new account
3. Log in
4. Test logging a glucose reading
5. Verify data appears in dashboard

### 5.3 Test PWA Installation
1. Open site on mobile device
2. Look for "Install Type2Lyfe" prompt
3. Click "Install"
4. Verify app appears on home screen
5. Open app - should look native (no browser UI)

---

## 📱 Step 6: PWA Verification

### 6.1 Test Offline Support
1. Open the installed PWA
2. Turn off WiFi/mobile data
3. Try to navigate between pages
4. Cached pages should still work

### 6.2 Lighthouse Audit
1. Open Chrome DevTools
2. Go to **"Lighthouse"** tab
3. Select **"Progressive Web App"**
4. Click **"Generate report"**
5. Aim for score > 90

---

## 🔒 Security Checklist

Before going live:

- [ ] JWT_SECRET is strong and random (64+ characters)
- [ ] Database credentials are secure
- [ ] CORS is configured correctly (only your frontend URL)
- [ ] HTTPS is enabled (Vercel/Render do this automatically)
- [ ] Environment variables are not committed to Git
- [ ] Rate limiting is enabled on backend
- [ ] Input validation is working
- [ ] SQL injection protection is in place

---

## 📊 Monitoring & Maintenance

### Free Tier Limitations
**Render Free Tier:**
- Spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- 750 hours/month free

**Vercel Free Tier:**
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS

### Recommended Upgrades for Production
- **Render**: Upgrade to $7/month for always-on backend
- **Database**: Upgrade to paid plan for backups and better performance
- **Vercel**: Free tier is usually sufficient

---

## 🐛 Troubleshooting

### Backend won't start
- Check environment variables are set correctly
- Verify DATABASE_URL is correct
- Check Render logs for errors

### Frontend can't connect to backend
- Verify VITE_API_URL is correct
- Check CORS settings on backend
- Ensure backend is running (not spun down)

### PWA won't install
- Verify manifest.json is accessible
- Check service worker is registered
- Ensure site is served over HTTPS
- Clear browser cache and try again

### Database connection errors
- Verify DATABASE_URL format
- Check database is running
- Ensure IP whitelist allows Render IPs (if applicable)

---

## 🎉 You're Live!

Your Type2Lyfe app is now deployed and accessible worldwide!

**Next Steps:**
- Share the URL with users
- Monitor error logs
- Collect user feedback
- Plan feature updates

**Support:**
- Backend logs: Render Dashboard → Your Service → Logs
- Frontend logs: Vercel Dashboard → Your Project → Deployments → Logs
- Database logs: Render Dashboard → Your Database → Logs

---

## 📝 Environment Variables Reference

### Backend (.env)
```
PORT=3000
NODE_ENV=production
DATABASE_URL=postgres://user:pass@host:5432/dbname
JWT_SECRET=your-64-char-random-string
GEMINI_API_KEY=your-google-gemini-api-key
FRONTEND_URL=https://type2lyfe.vercel.app
```

### Frontend (.env)
```
VITE_API_URL=https://type2lyfe-backend.onrender.com
```

---

## 🔄 Continuous Deployment

Both Vercel and Render support automatic deployments:

1. Push code to GitHub `main` branch
2. Vercel automatically deploys frontend
3. Render automatically deploys backend
4. Changes go live in ~2-5 minutes

**Best Practice:**
- Use feature branches for development
- Test locally before pushing to main
- Monitor deployment logs for errors

---

Good luck with your launch! 🚀

