# 🩺 Type2Lyfe

> AI-powered health tracking application for people with Type 2 diabetes
> Mobile-optimized Progressive Web App (PWA)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js)](https://nodejs.org/)
[![Live Demo](https://img.shields.io/badge/Live-Demo-14B8A6?logo=vercel)](https://type2lyfe.vercel.app)

---

## 📖 **About**

Type2Lyfe is a comprehensive health tracking web application designed specifically for people managing Type 2 diabetes. The app provides an intuitive interface for logging glucose readings, weight, blood pressure, meals, and medications with AI-powered insights.

**🌐 Live Demo:** [https://type2lyfe.vercel.app](https://type2lyfe.vercel.app)

### ✨ **Key Features**

- 📊 **Glucose Tracking** - Log blood sugar readings with timing context (fasting, after meal, random)
- ⚖️ **Weight Monitoring** - Track weight changes over time
- 💉 **Blood Pressure Logging** - Record systolic, diastolic, and pulse readings
- 🍽️ **Meal Tracking** - Log meals with AI-powered photo analysis and nutrition estimation
- 💊 **Medication Management** - Track medications and dosages
- 🔐 **Google OAuth** - Secure sign-in with your Google account
- 📸 **Photo Analysis** - AI-powered meal analysis from photos using Google Gemini
- 🌓 **Dark Mode** - Eye-friendly dark theme support
- 📱 **Mobile-First Design** - Responsive design optimized for mobile devices
- 🔒 **Secure & Private** - Your health data is encrypted and secure

---

## 🚀 **Quick Start**

### **Prerequisites**

- Node.js 18.x or higher
- npm or yarn
- PostgreSQL database (local or cloud-hosted)
- Google Gemini API key (for AI features)
- Google OAuth Client ID (for authentication)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/pharrrodev/type2lyfe.git
   cd type2lyfe
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**

   **Backend** (`backend/.env`):
   ```env
   NODE_ENV=development
   PORT=3000

   # Database (PostgreSQL)
   DATABASE_URL=postgresql://username:password@localhost:5432/type2lyfe

   # Authentication
   JWT_SECRET=your-super-secret-jwt-key-here
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

   # AI Services
   GEMINI_API_KEY=your-gemini-api-key-here

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3001
   ```

   **Frontend** (`frontend/.env.local`):
   ```env
   # Backend API URL (no trailing slash)
   VITE_API_URL=http://localhost:3000

   # Google OAuth
   VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

   # AI Services
   VITE_GEMINI_API_KEY=your-gemini-api-key-here
   ```

   > **📝 Note:** See [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md) for detailed Google OAuth setup instructions.

5. **Set up the database**

   Create a PostgreSQL database and run the initialization:
   ```bash
   cd backend
   # Database tables will be created automatically on first run
   ```

6. **Start the development servers**

   **Backend** (in `backend/` directory):
   ```bash
   npm start
   # Server runs on http://localhost:3000
   ```

   **Frontend** (in `frontend/` directory):
   ```bash
   npm run dev
   # App runs on http://localhost:3001
   ```

7. **Open your browser**
   ```
   http://localhost:3001
   ```

8. **Sign in with Google**
   - Click "Sign in with Google"
   - Select your Google account
   - Start tracking your health data!

---

## 📁 **Project Structure**

```
type2lifestyles/
├── backend/                    # Express.js backend API
│   ├── controllers/           # Route controllers
│   ├── models/                # Database models
│   ├── routes/                # API routes
│   ├── services/              # Business logic
│   ├── middleware/            # Custom middleware
│   └── src/                   # Server entry point
│
├── frontend/                   # React + Vite frontend
│   ├── components/            # React components
│   ├── src/                   # Application source
│   ├── public/                # Static assets
│   ├── services/              # API services
│   └── types.ts               # TypeScript types
│
├── PRODUCTION_DEPLOYMENT_GUIDE.md  # Deployment guide
├── QUICK_REFERENCE.md              # Quick reference
└── PROJECT_SUMMARY.md              # Project overview
```

---

## 🛠️ **Technology Stack**

### **Frontend**
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Google OAuth 2.0** - Secure authentication

### **AI & Services**
- **Google Gemini API** - AI-powered meal and health analysis
- **Google OAuth** - Secure user authentication
- **Canvas API** - Image processing

---

## 📱 **Features in Detail**

### **Glucose Tracking**
- Log readings with timing context (fasting, after meal, random)
- Visual indicators for high/low readings
- Historical trends and patterns
- Export data for healthcare providers

### **Meal Tracking**
- AI-powered photo analysis using Google Gemini
- Automatic nutrition estimation
- Carbohydrate counting
- Meal history and patterns

### **Authentication**
- Secure Google OAuth 2.0 sign-in
- No password management required
- Fast and secure authentication
- Automatic account creation

### **Dark Mode**
- Eye-friendly dark theme
- Automatic theme switching
- Persistent user preference
- Optimized for OLED screens

---

## 🚀 **Deployment**

**🌐 Production App:** [https://type2lyfe.vercel.app](https://type2lyfe.vercel.app)

For detailed deployment instructions, see:
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Complete step-by-step guide
- **[GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md)** - Google OAuth configuration

### **Current Production Stack**

- **Database:** Render PostgreSQL (Free tier)
- **Backend:** Render.com (Free tier) - [https://type2lyfe-backend.onrender.com](https://type2lyfe-backend.onrender.com)
- **Frontend:** Vercel (Free tier) - [https://type2lyfe.vercel.app](https://type2lyfe.vercel.app)
- **Authentication:** Google OAuth 2.0
- **AI Services:** Google Gemini API

**Total Cost:** $0/month (free tier)

### **Required Environment Variables**

**Vercel (Frontend):**
- `VITE_API_URL` - Backend URL (no trailing slash)
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `VITE_GEMINI_API_KEY` - Google Gemini API key

**Render (Backend):**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `GEMINI_API_KEY` - Google Gemini API key
- `FRONTEND_URL` - Frontend URL for CORS

---

## 🧪 **Testing**

### **Run Tests**
```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test
```

### **Build for Production**
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run build
```

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 **Contributing**

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 **Support**

For support, please open an issue in the GitHub repository or contact the maintainers.

---

## 🙏 **Acknowledgments**

- Google for Gemini AI and OAuth services
- Render for database and backend hosting
- Vercel for frontend hosting
- The open-source community
- The Type 2 diabetes community for inspiration

---

## ⚠️ **Disclaimer**

Type2Lyfe is a tracking tool and does not provide medical advice. Always consult your healthcare provider for medical decisions. This application is not a substitute for professional medical advice, diagnosis, or treatment.

---

**Made with ❤️ for the Type 2 diabetes community**

**Last Updated:** January 7, 2025
**Version:** 1.0.0
**Status:** ✅ Production Ready

