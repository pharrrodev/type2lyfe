# 🔐 Google OAuth Setup Guide for Type2Lyfe

This guide will walk you through setting up Google OAuth authentication for Type2Lyfe.

---

## 📋 **Prerequisites**

- Google account
- Access to Google Cloud Console
- Type2Lyfe app running locally

---

## 🚀 **Step 1: Create Google Cloud Project**

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project:**
   - Click "Select a project" dropdown at the top
   - Click "NEW PROJECT"
   - **Project name:** `Type2Lyfe`
   - **Organization:** Leave as default (No organization)
   - Click "CREATE"

3. **Wait for project creation** (takes a few seconds)

---

## 🔑 **Step 2: Enable Google+ API**

1. **In your new project, go to:**
   - Left menu → "APIs & Services" → "Library"

2. **Search for "Google+ API"** or **"Google Identity"**
   - Actually, you don't need to enable any API for basic OAuth!
   - Skip this step - OAuth works out of the box

---

## 🎫 **Step 3: Create OAuth 2.0 Credentials**

1. **Go to Credentials:**
   - Left menu → "APIs & Services" → "Credentials"

2. **Configure OAuth Consent Screen** (REQUIRED FIRST):
   - Click "CONFIGURE CONSENT SCREEN"
   - Select **"External"** (allows anyone with a Google account)
   - Click "CREATE"

3. **Fill in OAuth Consent Screen:**
   
   **App information:**
   - **App name:** `Type2Lyfe`
   - **User support email:** `pharrrodev@gmail.com` (your email)
   - **App logo:** (Optional - upload your logo if you want)

   **App domain:**
   - **Application home page:** `https://type2lyfe.vercel.app`
   - **Application privacy policy:** `https://type2lyfe.vercel.app/privacy.html`
   - **Application terms of service:** `https://type2lyfe.vercel.app/terms.html`

   **Authorized domains:**
   - Add: `vercel.app`
   - Add: `localhost` (for local development)

   **Developer contact information:**
   - **Email addresses:** `pharrrodev@gmail.com`

   - Click "SAVE AND CONTINUE"

4. **Scopes** (Step 2):
   - Click "ADD OR REMOVE SCOPES"
   - Select:
     - ✅ `.../auth/userinfo.email`
     - ✅ `.../auth/userinfo.profile`
     - ✅ `openid`
   - Click "UPDATE"
   - Click "SAVE AND CONTINUE"

5. **Test users** (Step 3):
   - Add your email: `pharrrodev@gmail.com`
   - Click "ADD"
   - Click "SAVE AND CONTINUE"

6. **Summary** (Step 4):
   - Review everything
   - Click "BACK TO DASHBOARD"

---

## 🔐 **Step 4: Create OAuth Client ID**

1. **Go back to Credentials:**
   - Left menu → "APIs & Services" → "Credentials"

2. **Create Credentials:**
   - Click "+ CREATE CREDENTIALS" at the top
   - Select "OAuth client ID"

3. **Configure OAuth Client:**
   - **Application type:** `Web application`
   - **Name:** `Type2Lyfe Web Client`

   **Authorized JavaScript origins:**
   - Add: `http://localhost:3001` (local dev - frontend)
   - Add: `http://localhost:4173` (local preview)
   - Add: `https://type2lyfe.vercel.app` (production)
   - Add: `https://type2lyfe-pharrrodevs-projects.vercel.app` (if you have this)

   **Authorized redirect URIs:**
   - Add: `http://localhost:3001`
   - Add: `http://localhost:4173`
   - Add: `https://type2lyfe.vercel.app`

   - Click "CREATE"

4. **Copy Your Credentials:**
   - A popup will show your credentials
   - **Copy the "Client ID"** - it looks like:
     ```
     123456789-abcdefghijklmnop.apps.googleusercontent.com
     ```
   - **Copy the "Client Secret"** (you'll need this for backend)
   - Click "OK"

---

## 📝 **Step 5: Add Credentials to Environment Files**

### **Frontend (.env.local):**

Add this line to `frontend/.env.local`:

```env
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
```

**Example:**
```env
VITE_API_URL=http://localhost:3000/api
VITE_GEMINI_API_KEY=AIzaSyCBvXhe6V-e6hu6AUOv7X432gx7ZrjxZlQ
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

### **Backend (.env):**

Add this line to `backend/.env`:

```env
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
```

**Example:**
```env
GEMINI_API_KEY=AIzaSyAFRxV85yPbOsCE4Ju0-epoW_fxUQXL4A0
JWT_SECRET=08d6de2a82c1c04a218d85c535a12dd0acd589c410e89a9ef1cf3c5bdabb5115aedbfe3dcc0498e6650c03803b79d946e69928661f1abc374c718ef91a13983
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com

# Frontend URL for CORS
FRONTEND_URL=http://localhost:4173

DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=pharrrohealth
DB_PASSWORD=Naphtali1@
DB_PORT=5432
```

---

## 🌐 **Step 6: Add to Production (Vercel)**

### **For Frontend (Vercel):**

1. Go to Vercel Dashboard: https://vercel.com/pharrrodevs-projects/type2lyfe
2. Go to "Settings" → "Environment Variables"
3. Add new variable:
   - **Key:** `VITE_GOOGLE_CLIENT_ID`
   - **Value:** `YOUR_CLIENT_ID_HERE.apps.googleusercontent.com`
   - Click "Save"

### **For Backend (Render):**

1. Go to Render Dashboard: https://dashboard.render.com/
2. Select your backend service
3. Go to "Environment" tab
4. Add new variable:
   - **Key:** `GOOGLE_CLIENT_ID`
   - **Value:** `YOUR_CLIENT_ID_HERE.apps.googleusercontent.com`
   - Click "Save"

---

## ✅ **Step 7: Verify Setup**

After adding the credentials:

1. **Restart your local servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. **Test Google OAuth:**
   - Go to http://localhost:3001/login
   - You should see a "Sign in with Google" button
   - Click it and test the login flow

---

## 🔒 **Security Notes**

- ✅ **Client ID is public** - it's safe to expose in frontend code
- ⚠️ **Client Secret is private** - NEVER commit to Git (only used in backend if needed)
- ✅ **JWT Secret stays private** - already in .env (not committed)
- ✅ **Authorized domains** - only your domains can use OAuth

---

## 🐛 **Troubleshooting**

### **Error: "redirect_uri_mismatch"**
- Make sure you added the exact URL to "Authorized redirect URIs" in Google Console
- Check for typos (http vs https, trailing slashes, etc.)

### **Error: "Access blocked: This app's request is invalid"**
- Make sure you configured the OAuth Consent Screen
- Add your email as a test user
- Make sure you added the required scopes

### **Error: "idpiframe_initialization_failed"**
- Clear browser cookies
- Make sure you're not blocking third-party cookies
- Try in incognito mode

### **Button doesn't appear:**
- Check browser console for errors
- Make sure `VITE_GOOGLE_CLIENT_ID` is set in `.env.local`
- Restart the frontend dev server

---

## 📚 **Resources**

- Google Cloud Console: https://console.cloud.google.com/
- OAuth 2.0 Docs: https://developers.google.com/identity/protocols/oauth2
- React OAuth Library: https://www.npmjs.com/package/@react-oauth/google

---

## ✅ **Checklist**

Before proceeding with implementation:

- [ ] Created Google Cloud Project
- [ ] Configured OAuth Consent Screen
- [ ] Created OAuth Client ID
- [ ] Copied Client ID
- [ ] Added `VITE_GOOGLE_CLIENT_ID` to `frontend/.env.local`
- [ ] Added `GOOGLE_CLIENT_ID` to `backend/.env`
- [ ] Restarted local servers

---

**Once you've completed these steps, let me know and I'll implement the OAuth code!** 🚀

