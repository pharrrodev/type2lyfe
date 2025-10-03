# 🚀 Production Deployment Checklist

## Pre-Deployment Security Checklist

### ✅ Environment Variables

#### Backend (.env)
- [ ] **Generate new JWT_SECRET** (use command below)
- [ ] **Set FRONTEND_URL** to production domain (e.g., `https://yourdomain.com`)
- [ ] **Verify GEMINI_API_KEY** is set
- [ ] **Set strong DB_PASSWORD**
- [ ] **Never commit .env** to Git (verify with `git status`)

```bash
# Generate secure JWT_SECRET (run this command):
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Frontend (.env.local)
- [ ] **Set VITE_API_URL** to production backend URL (e.g., `https://api.yourdomain.com/api`)
- [ ] **Verify VITE_GEMINI_API_KEY** is set
- [ ] **Never commit .env.local** to Git

---

### ✅ Code Quality

- [x] All tests passing (25/25 ✅)
- [x] No console errors
- [x] No TypeScript errors
- [x] All features tested manually
- [x] Voice input tested ✅
- [x] Photo analysis tested ✅
- [x] Security features implemented ✅

---

### ✅ Security Hardening

- [x] CORS configured (restricted to frontend URL)
- [x] Rate limiting enabled (100 req/15min general, 5 req/15min auth)
- [x] Input validation (express-validator)
- [x] Security headers (Helmet.js)
- [x] Password hashing (bcrypt)
- [x] JWT authentication
- [x] SQL injection prevention (parameterized queries)
- [x] No photo storage (privacy)
- [ ] **HTTPS enabled** (required for production!)
- [ ] **Update FRONTEND_URL** in backend .env
- [ ] **Update VITE_API_URL** in frontend .env.local

---

### ✅ Database

- [ ] **Production database created**
- [ ] **Run database migrations** (create tables)
- [ ] **Set strong database password**
- [ ] **Restrict database access** (only backend server)
- [ ] **Enable SSL** for database connections (if remote)
- [ ] **Set up automated backups**

```sql
-- Run these commands on production database:
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_medications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  medication_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_logs_user_id ON logs(user_id);
CREATE INDEX idx_logs_type ON logs(type);
CREATE INDEX idx_logs_timestamp ON logs(timestamp);
CREATE INDEX idx_user_medications_user_id ON user_medications(user_id);
```

---

## Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend) - RECOMMENDED

#### Why This Option?
- ✅ **Free tier available**
- ✅ **Easy deployment** from GitHub
- ✅ **Automatic HTTPS**
- ✅ **PostgreSQL included** (Railway)
- ✅ **Global CDN** (Vercel)
- ✅ **Zero config** for most features

---

### 🎯 Step-by-Step: Vercel + Railway Deployment

#### Part 1: Deploy Backend to Railway

1. **Go to [Railway.app](https://railway.app)**
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `type2lifestyles` repository
   - Select `backend` folder as root directory

3. **Add PostgreSQL Database**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will automatically create database and set environment variables

4. **Set Environment Variables**
   - Go to your backend service → "Variables" tab
   - Add these variables:
     ```
     GEMINI_API_KEY=your_gemini_api_key
     JWT_SECRET=your_generated_secret_from_above
     FRONTEND_URL=https://yourdomain.vercel.app
     ```
   - Railway auto-sets: `DATABASE_URL`, `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

5. **Update Database Connection** (if needed)
   - Railway provides `DATABASE_URL` - you may need to update your code to use it
   - Or use the individual PG* variables that Railway provides

6. **Deploy**
   - Railway will automatically deploy
   - Note your backend URL (e.g., `https://your-app.railway.app`)

7. **Run Database Migrations**
   - In Railway dashboard, go to your PostgreSQL database
   - Click "Query" tab
   - Run the SQL commands from the Database section above

---

#### Part 2: Deploy Frontend to Vercel

1. **Go to [Vercel.com](https://vercel.com)**
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Import your `type2lifestyles` repository
   - Select `frontend` as root directory

3. **Configure Build Settings**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Set Environment Variables**
   - Go to "Environment Variables" section
   - Add these variables:
     ```
     VITE_API_URL=https://your-backend.railway.app/api
     VITE_GEMINI_API_KEY=your_gemini_api_key
     ```

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your app
   - Note your frontend URL (e.g., `https://type2lifestyles.vercel.app`)

6. **Update Backend CORS**
   - Go back to Railway
   - Update `FRONTEND_URL` environment variable to your Vercel URL
   - Example: `FRONTEND_URL=https://type2lifestyles.vercel.app`
   - Redeploy backend

---

### Option 2: Render.com (All-in-One)

#### Why This Option?
- ✅ **Free tier available**
- ✅ **Deploy both frontend and backend**
- ✅ **PostgreSQL included**
- ✅ **Automatic HTTPS**

#### Steps:

1. **Go to [Render.com](https://render.com)**
   - Sign up with GitHub

2. **Create PostgreSQL Database**
   - Click "New" → "PostgreSQL"
   - Choose free tier
   - Note the connection details

3. **Deploy Backend**
   - Click "New" → "Web Service"
   - Connect GitHub repository
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add environment variables (same as Railway)

4. **Deploy Frontend**
   - Click "New" → "Static Site"
   - Connect GitHub repository
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Add environment variables

---

### Option 3: DigitalOcean / AWS / Azure

#### Why This Option?
- ✅ **More control**
- ✅ **Better for scaling**
- ❌ **More expensive**
- ❌ **More setup required**

#### Not recommended for MVP - use Vercel + Railway instead!

---

## Post-Deployment Checklist

### ✅ Verify Deployment

- [ ] **Frontend loads** at production URL
- [ ] **Backend responds** at API URL
- [ ] **HTTPS enabled** (check for padlock icon)
- [ ] **Registration works**
- [ ] **Login works**
- [ ] **Glucose logging works** (voice, manual, photo)
- [ ] **Meal logging works** (voice, manual, photo)
- [ ] **Weight logging works**
- [ ] **Blood pressure logging works**
- [ ] **Medication logging works**
- [ ] **Dashboard displays data**
- [ ] **Activity page shows entries**
- [ ] **History page works**
- [ ] **Settings page works**
- [ ] **Dark mode works**
- [ ] **Late entry flow works**

---

### ✅ Performance Testing

- [ ] **Page load time** < 3 seconds
- [ ] **API response time** < 500ms
- [ ] **Photo analysis** < 10 seconds
- [ ] **Voice input** works smoothly
- [ ] **Mobile responsive** (test on phone)

---

### ✅ Security Testing

- [ ] **HTTPS enforced** (no HTTP access)
- [ ] **CORS working** (only your domain can access API)
- [ ] **Rate limiting working** (try 6 failed logins)
- [ ] **Input validation working** (try invalid email)
- [ ] **JWT expiration working**
- [ ] **SQL injection prevented** (try `' OR '1'='1`)

---

### ✅ Monitoring & Analytics

- [ ] **Set up error tracking** (e.g., Sentry)
- [ ] **Set up analytics** (e.g., Google Analytics, Plausible)
- [ ] **Set up uptime monitoring** (e.g., UptimeRobot)
- [ ] **Set up database backups**

---

## 🎉 Launch Checklist

### Before Public Launch:

- [ ] **All deployment steps complete**
- [ ] **All features tested in production**
- [ ] **Security checklist complete**
- [ ] **Performance acceptable**
- [ ] **Error tracking set up**
- [ ] **Backup strategy in place**
- [ ] **Domain name configured** (optional)
- [ ] **SSL certificate valid**

### Launch Day:

- [ ] **Announce on social media**
- [ ] **Share with beta testers**
- [ ] **Monitor error logs**
- [ ] **Monitor server performance**
- [ ] **Be ready to fix issues quickly**

---

## 🐛 Troubleshooting

### Common Issues:

#### "CORS Error"
- **Solution**: Update `FRONTEND_URL` in backend .env to match your frontend URL

#### "Failed to fetch"
- **Solution**: Check `VITE_API_URL` in frontend .env.local points to correct backend URL

#### "Database connection failed"
- **Solution**: Verify database credentials in backend .env

#### "Rate limit exceeded"
- **Solution**: Wait 15 minutes or adjust rate limits in `backend/src/index.js`

#### "JWT token invalid"
- **Solution**: Clear localStorage and log in again

---

## 📞 Support

If you encounter issues during deployment:
- Check Railway/Vercel logs for errors
- Review SECURITY.md for security best practices
- Email: pharrrodev@gmail.com

---

**Good luck with your deployment! 🚀**

