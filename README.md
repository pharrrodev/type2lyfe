# 🩺 Type2Lyfe

> AI-powered health tracking application for people with Type 2 diabetes

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js)](https://nodejs.org/)

---

## 📖 **About**

Type2Lyfe is a comprehensive health tracking web application designed specifically for people managing Type 2 diabetes. The app provides an intuitive interface for logging glucose readings, weight, blood pressure, meals, and medications with AI-powered insights.

### ✨ **Key Features**

- 📊 **Glucose Tracking** - Log blood sugar readings with timing context (fasting, after meal, random)
- ⚖️ **Weight Monitoring** - Track weight changes over time
- 💉 **Blood Pressure Logging** - Record systolic, diastolic, and pulse readings
- 🍽️ **Meal Tracking** - Log meals with AI-powered photo analysis and nutrition estimation
- 💊 **Medication Management** - Track medications and dosages
- 🎤 **Voice Input** - Hands-free data entry using voice commands
- 📸 **Photo Analysis** - AI-powered meal analysis from photos
- 🌓 **Dark Mode** - Eye-friendly dark theme support
- 📱 **Mobile-First Design** - Responsive design optimized for mobile devices
- 🔒 **Secure & Private** - Your health data is encrypted and secure

---

## 🚀 **Quick Start**

### **Prerequisites**

- Node.js 18.x or higher
- npm or yarn
- MongoDB (local or MongoDB Atlas)
- OpenAI API key (for AI features)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/pharrrodev/type2lifestyles.git
   cd type2lifestyles
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
   MONGODB_URI=mongodb://localhost:27017/type2lifestyles
   JWT_SECRET=your-jwt-secret-here
   OPENAI_API_KEY=your-openai-api-key-here
   ```

   **Frontend** (`frontend/.env.local`):
   ```env
   VITE_API_URL=http://localhost:3000/api
   VITE_OPENAI_API_KEY=your-openai-api-key-here
   ```

5. **Start the development servers**

   **Backend** (in `backend/` directory):
   ```bash
   npm start
   ```

   **Frontend** (in `frontend/` directory):
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3001
   ```

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
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication

### **AI & Services**
- **OpenAI API** - AI-powered features
- **Web Speech API** - Voice input
- **Canvas API** - Image processing

---

## 📱 **Features in Detail**

### **Glucose Tracking**
- Log readings with timing context (fasting, after meal, random)
- Visual indicators for high/low readings
- Historical trends and patterns
- Export data for healthcare providers

### **Meal Tracking**
- AI-powered photo analysis
- Automatic nutrition estimation
- Carbohydrate counting
- Meal history and patterns

### **Voice Input**
- Hands-free data entry
- Natural language processing
- Support for all data types
- Accurate speech recognition

### **Dark Mode**
- Eye-friendly dark theme
- Automatic theme switching
- Persistent user preference
- Optimized for OLED screens

---

## 🚀 **Deployment**

For detailed deployment instructions, see:
- **[PRODUCTION_DEPLOYMENT_GUIDE.md](PRODUCTION_DEPLOYMENT_GUIDE.md)** - Complete step-by-step guide
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick deployment reference

### **Quick Deploy**

**Recommended Stack:**
- **Database:** MongoDB Atlas (Free tier)
- **Backend:** Render.com (Free tier)
- **Frontend:** Vercel (Free tier)

**Total Cost:** $0/month (free tier) or ~$1/month with custom domain

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

- OpenAI for AI-powered features
- MongoDB for database services
- Vercel and Render for hosting
- The open-source community

---

## ⚠️ **Disclaimer**

Type2Lyfe is a tracking tool and does not provide medical advice. Always consult your healthcare provider for medical decisions. This application is not a substitute for professional medical advice, diagnosis, or treatment.

---

**Made with ❤️ for the Type 2 diabetes community**

**Last Updated:** October 2, 2025  
**Version:** 1.0.0

