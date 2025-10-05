# 🔧 API URL Fix - 404 Errors

## 🐛 Problem

Getting 404 errors with duplicate `/api/api/` in URLs:
```
❌ https://type2lyfe-backend.onrender.com/api/api/logs/glucose
❌ https://type2lyfe-backend.onrender.com/api/api/logs/weight
❌ https://type2lyfe-backend.onrender.com/api/api/medications
```

Should be:
```
✅ https://type2lyfe-backend.onrender.com/api/logs/glucose
✅ https://type2lyfe-backend.onrender.com/api/logs/weight
✅ https://type2lyfe-backend.onrender.com/api/medications
```

---

## 🔍 Root Cause

The `VITE_API_URL` environment variable in Vercel includes `/api` at the end, but the code also adds `/api/` to each endpoint.

**Current (WRONG):**
```
VITE_API_URL = https://type2lyfe-backend.onrender.com/api
```

Then code does:
```javascript
api.get('/api/logs/glucose')
// Results in: https://type2lyfe-backend.onrender.com/api/api/logs/glucose ❌
```

---

## ✅ Solution

### Option 1: Fix Environment Variable (RECOMMENDED)

**In Vercel Dashboard:**

1. Go to your project settings
2. Navigate to **Environment Variables**
3. Find `VITE_API_URL`
4. Change it from:
   ```
   https://type2lyfe-backend.onrender.com/api
   ```
   To:
   ```
   https://type2lyfe-backend.onrender.com
   ```
5. **Redeploy** the frontend

---

### Option 2: Fix Code (Alternative)

If you can't change the environment variable, update `frontend/src/MainApp.tsx` and remove `/api/` from all endpoints:

**Change:**
```javascript
api.get('/api/logs/glucose')      // ❌
```

**To:**
```javascript
api.get('/logs/glucose')          // ✅
```

**But this is NOT recommended** because it breaks local development.

---

## 🚀 Quick Fix Steps

### **Step 1: Update Vercel Environment Variable**

1. Go to https://vercel.com/dashboard
2. Select your `type2lyfe` project
3. Go to **Settings** → **Environment Variables**
4. Find `VITE_API_URL`
5. Click **Edit**
6. Change value to: `https://type2lyfe-backend.onrender.com`
7. Click **Save**

### **Step 2: Redeploy**

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **Redeploy** button
4. Wait ~2 minutes for deployment

### **Step 3: Test**

1. Open your app
2. Try logging in
3. Check browser console - should see:
   ```
   ✅ https://type2lyfe-backend.onrender.com/api/logs/glucose
   ```
   Instead of:
   ```
   ❌ https://type2lyfe-backend.onrender.com/api/api/logs/glucose
   ```

---

## 📝 How It Works

### Correct Setup:

**Environment Variable:**
```
VITE_API_URL=https://type2lyfe-backend.onrender.com
```

**Code (api.ts):**
```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});
```

**API Calls:**
```javascript
api.get('/api/logs/glucose')
// Results in: https://type2lyfe-backend.onrender.com/api/logs/glucose ✅
```

---

## 🧪 Verification

After fixing, check browser console for:

```
API Base URL: https://type2lyfe-backend.onrender.com
🔄 Fetching initial data...
📊 Initial data fetched: { glucose: X, meals: Y, ... }
```

No more 404 errors!

---

## 📋 Environment Variable Reference

### Local Development (.env.local):
```
VITE_API_URL=http://localhost:3000
```

### Production (Vercel):
```
VITE_API_URL=https://type2lyfe-backend.onrender.com
```

**Note:** Do NOT include `/api` at the end!

---

*This fix should resolve all 404 errors immediately after redeployment.*

