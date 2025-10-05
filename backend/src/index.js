require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const db = require('../models/db');

const app = express();
const port = process.env.PORT || 3000;

// Trust proxy - required for Render and other hosting platforms
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS configuration - allow requests from frontend
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3001',
      'http://localhost:3000',
      process.env.FRONTEND_URL,
    ];

    // Check if origin is in allowed list OR is a Vercel preview deployment
    if (allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Rate limiting - prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use(limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login/register attempts per windowMs
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Increase payload size limit for image uploads (base64 images can be large)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Define Routes
app.use('/api/auth', authLimiter, require('../routes/auth')); // Apply stricter rate limiting to auth
app.use('/api/logs', require('../routes/logs'));
app.use('/api/medications', require('../routes/medications'));
app.use('/api/analyze', require('../routes/analyze'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.send('PharrroHealth Backend is running!');
});

// Initialize database tables
const initializeDatabase = async () => {
  const client = await db.getClient();
  try {
    console.log('🔄 Initializing database tables...');
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        timestamp TIMESTAMPTZ NOT NULL,
        type VARCHAR(50) NOT NULL,
        data JSONB NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_medications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        dosage VARCHAR(255),
        unit VARCHAR(50)
      );
    `);

    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_logs_type ON logs(type);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_user_medications_user_id ON user_medications(user_id);');

    await client.query('COMMIT');
    console.log('✅ Database tables initialized successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error initializing database:', err.stack);
    throw err;
  } finally {
    client.release();
  }
};

// Start server after database initialization
initializeDatabase()
  .then(() => {
    app.listen(port, '0.0.0.0', () => {
      console.log(`✅ Server is running on port ${port}`);
      console.log(`🌐 Server accessible at http://localhost:${port}`);
      console.log(`🌐 Server accessible at http://0.0.0.0:${port}`);
    }).on('error', (err) => {
      console.error('❌ Server failed to start:', err);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to initialize database, server not started:', err);
    process.exit(1);
  });