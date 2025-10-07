# 🚀 Type2Lyfe - Quick Start Guide

**Live App:** [https://type2lyfe.vercel.app](https://type2lyfe.vercel.app)

---

## 🎯 **For Users**

### **Getting Started (30 seconds)**

1. **Visit the app:** [https://type2lyfe.vercel.app](https://type2lyfe.vercel.app)
2. **Click "Sign in with Google"**
3. **Select your Google account**
4. **Start tracking your health!**

That's it! No registration forms, no passwords to remember.

### **What You Can Track**

- 📊 **Glucose Levels** - Blood sugar readings with timing
- ⚖️ **Weight** - Track your weight over time
- 💉 **Blood Pressure** - Systolic, diastolic, and pulse
- 🍽️ **Meals** - Take photos and get AI nutrition analysis
- 💊 **Medications** - Manage your medication schedule

### **Key Features**

- 🤖 **AI-Powered** - Photo analysis using Google Gemini
- 📱 **Mobile-First** - Works great on phones and tablets
- 🌓 **Dark Mode** - Easy on the eyes
- 🔒 **Secure** - Your data is encrypted and private
- 📊 **Visual Charts** - See your trends at a glance

---

## 👨‍💻 **For Developers**

### **Quick Local Setup (5 minutes)**

1. **Clone the repo:**
   ```bash
   git clone https://github.com/pharrrodev/type2lyfe.git
   cd type2lyfe
   ```

2. **Install dependencies:**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Set up environment variables:**
   
   Create `backend/.env`:
   ```env
   DATABASE_URL=postgresql://user:pass@localhost:5432/type2lyfe
   JWT_SECRET=your-secret-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GEMINI_API_KEY=your-gemini-api-key
   FRONTEND_URL=http://localhost:3001
   ```
   
   Create `frontend/.env.local`:
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   VITE_GEMINI_API_KEY=your-gemini-api-key
   ```

4. **Start the servers:**
   ```bash
   # Backend (in backend/ directory)
   npm start
   
   # Frontend (in frontend/ directory)
   npm run dev
   ```

5. **Open your browser:**
   ```
   http://localhost:3001
   ```

### **Tech Stack**

**Frontend:**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router

**Backend:**
- Node.js + Express
- PostgreSQL
- JWT Authentication
- Google OAuth 2.0

**AI & Services:**
- Google Gemini API
- Google OAuth

### **Project Structure**

```
type2lyfe/
├── frontend/           # React frontend
│   ├── src/           # App source code
│   ├── components/    # React components
│   └── services/      # API services
│
├── backend/           # Express backend
│   ├── controllers/   # Route controllers
│   ├── routes/        # API routes
│   ├── models/        # Database models
│   └── middleware/    # Auth middleware
│
└── docs/              # Documentation
```

### **Available Scripts**

**Backend:**
```bash
npm start          # Start server
npm run dev        # Start with nodemon
npm test           # Run tests
```

**Frontend:**
```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm test           # Run tests
```

---

## 🔐 **Google OAuth Setup**

### **For Development**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins:
   - `http://localhost:3001`
6. Copy the Client ID to your `.env` files

**Detailed guide:** See [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md)

---

## 🚀 **Deployment**

### **Quick Deploy (Free)**

**Frontend (Vercel):**
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

**Backend (Render):**
1. Create new Web Service
2. Connect GitHub repo
3. Add environment variables
4. Deploy!

**Database (Render):**
1. Create PostgreSQL database
2. Copy connection string
3. Add to backend env vars

**Total Cost:** $0/month (free tier)

**Detailed guide:** See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## 📚 **Documentation**

- **[README.md](README.md)** - Main documentation
- **[PRODUCTION_STATUS.md](PRODUCTION_STATUS.md)** - Current production status
- **[GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md)** - OAuth setup guide
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Deployment instructions
- **[GOOGLE_OAUTH_IMPLEMENTATION.md](GOOGLE_OAUTH_IMPLEMENTATION.md)** - Implementation details

---

## 🆘 **Common Issues**

### **"Cannot connect to database"**
- Check DATABASE_URL is correct
- Ensure PostgreSQL is running
- Verify network access

### **"Google OAuth not working"**
- Check GOOGLE_CLIENT_ID is set
- Verify authorized origins in Google Console
- Clear browser cache and try again

### **"API requests failing"**
- Check VITE_API_URL has no trailing slash
- Verify backend is running
- Check CORS settings

---

## 💡 **Tips**

- **Use Dark Mode** - Better for your eyes, especially at night
- **Take Photos** - AI analysis works great for meals
- **Track Regularly** - Consistency helps identify patterns
- **Check Trends** - Use the charts to see your progress

---

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📞 **Support**

- **Issues:** [GitHub Issues](https://github.com/pharrrodev/type2lyfe/issues)
- **Discussions:** [GitHub Discussions](https://github.com/pharrrodev/type2lyfe/discussions)

---

## 📄 **License**

MIT License - See [LICENSE](LICENSE) file

---

**Made with ❤️ for the Type 2 diabetes community**

**Start tracking your health today:** [https://type2lyfe.vercel.app](https://type2lyfe.vercel.app)

