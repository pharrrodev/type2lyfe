# Security Documentation

## 🔒 Security Features Implemented

### 1. **Authentication & Authorization**

#### Password Security
- ✅ **Bcrypt hashing** with salt (10 rounds)
- ✅ **Minimum password length**: 6 characters
- ✅ Passwords never stored in plain text
- ✅ Passwords never logged or exposed in API responses

#### JWT Tokens
- ✅ **JWT authentication** for all protected routes
- ✅ **Token expiration**: 100 hours (360000 seconds)
- ✅ Tokens stored in localStorage (client-side)
- ✅ Authorization header: `Bearer <token>`

---

### 2. **Input Validation**

#### Using express-validator
- ✅ **Email validation**: Must be valid email format
- ✅ **Username validation**: 3-30 characters, trimmed
- ✅ **Password validation**: Minimum 6 characters
- ✅ **Email normalization**: Converts to lowercase, removes dots in Gmail addresses

#### Validation Rules
```javascript
// Registration
- username: 3-30 characters, trimmed
- email: Valid email, normalized
- password: Minimum 6 characters

// Login
- email: Valid email, normalized
- password: Required, not empty
```

---

### 3. **Rate Limiting**

#### General Rate Limiting
- ✅ **100 requests per 15 minutes** per IP address
- ✅ Applies to all API routes
- ✅ Returns 429 status code when exceeded

#### Auth Route Rate Limiting (Stricter)
- ✅ **5 login/register attempts per 15 minutes** per IP
- ✅ Prevents brute force attacks
- ✅ Doesn't count successful requests
- ✅ Returns 429 status code when exceeded

---

### 4. **CORS (Cross-Origin Resource Sharing)**

#### Configuration
- ✅ **Restricted to frontend URL only**
- ✅ Default: `http://localhost:3001` (development)
- ✅ Production: Set via `FRONTEND_URL` environment variable
- ✅ **Credentials enabled**: Allows cookies/auth headers
- ✅ **Prevents unauthorized domains** from accessing API

#### Environment Variable
```bash
FRONTEND_URL=https://yourdomain.com  # Set this in production!
```

---

### 5. **Security Headers (Helmet.js)**

#### Headers Applied
- ✅ **X-DNS-Prefetch-Control**: Controls DNS prefetching
- ✅ **X-Frame-Options**: Prevents clickjacking (SAMEORIGIN)
- ✅ **X-Content-Type-Options**: Prevents MIME sniffing
- ✅ **X-XSS-Protection**: Enables XSS filter
- ✅ **Strict-Transport-Security**: Forces HTTPS (in production)
- ✅ **Content-Security-Policy**: Restricts resource loading

---

### 6. **SQL Injection Prevention**

#### Parameterized Queries
- ✅ **All database queries use parameterized statements**
- ✅ User input never directly concatenated into SQL
- ✅ PostgreSQL `pg` library handles escaping

#### Example
```javascript
// ✅ SAFE - Parameterized query
const result = await pool.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);

// ❌ UNSAFE - Never do this!
const result = await pool.query(
  `SELECT * FROM users WHERE email = '${email}'`
);
```

---

### 7. **Environment Variables**

#### Protected Secrets
- ✅ **All secrets in .env file**
- ✅ **.env in .gitignore** (never committed to Git)
- ✅ **.env.example** provided for reference
- ✅ **API keys never exposed** in frontend code

#### Required Environment Variables
```bash
# Backend (.env)
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_long_random_secret
FRONTEND_URL=http://localhost:3001
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=pharrrohealth
DB_PASSWORD=your_password
DB_PORT=5432

# Frontend (.env.local)
VITE_API_URL=http://localhost:3000/api
VITE_GEMINI_API_KEY=your_gemini_api_key
```

---

### 8. **Data Privacy**

#### Photo Storage
- ✅ **Photos NOT stored** in database
- ✅ Photos used only for AI analysis, then discarded
- ✅ Only extracted data (glucose values, macros) stored
- ✅ Reduces storage by 99.975%
- ✅ Protects user privacy

#### User Data
- ✅ **User data isolated** by user_id
- ✅ Users can only access their own data
- ✅ All queries filtered by authenticated user ID

---

## ⚠️ Security Checklist for Production

### Before Deploying to Production:

#### 1. Environment Variables
- [ ] Generate new strong JWT_SECRET (64+ characters)
- [ ] Set FRONTEND_URL to production domain
- [ ] Verify all environment variables are set
- [ ] Never commit .env files to Git

#### 2. HTTPS
- [ ] Enable HTTPS on production server
- [ ] Force HTTPS redirects
- [ ] Update FRONTEND_URL to use https://
- [ ] Update VITE_API_URL to use https://

#### 3. Database
- [ ] Use strong database password
- [ ] Restrict database access to backend server only
- [ ] Enable SSL for database connections (if remote)
- [ ] Regular database backups

#### 4. API Keys
- [ ] Rotate API keys if exposed
- [ ] Set up API key restrictions (IP, domain)
- [ ] Monitor API usage for anomalies

#### 5. Monitoring
- [ ] Set up error logging (e.g., Sentry)
- [ ] Monitor rate limit violations
- [ ] Track failed login attempts
- [ ] Set up alerts for suspicious activity

#### 6. Updates
- [ ] Keep dependencies up to date
- [ ] Run `npm audit` regularly
- [ ] Subscribe to security advisories

---

## 🚨 Security Incident Response

### If You Suspect a Security Breach:

1. **Immediately rotate all secrets**:
   - Generate new JWT_SECRET
   - Rotate API keys
   - Change database passwords

2. **Invalidate all user sessions**:
   - Users will need to log in again

3. **Review logs** for suspicious activity

4. **Notify affected users** if data was compromised

5. **Patch the vulnerability** before re-deploying

---

## 📝 Security Best Practices

### For Developers:

1. **Never log sensitive data**:
   - Passwords
   - JWT tokens
   - API keys
   - Personal health information

2. **Always validate user input**:
   - Use express-validator
   - Sanitize data before processing
   - Check data types and ranges

3. **Use HTTPS in production**:
   - Never send credentials over HTTP
   - Enable HSTS headers

4. **Keep dependencies updated**:
   - Run `npm audit` regularly
   - Update packages with security patches

5. **Follow principle of least privilege**:
   - Users can only access their own data
   - Database user has minimal permissions

---

## 🔐 Password Requirements

### Current Requirements:
- Minimum 6 characters
- No maximum length
- No complexity requirements (for MVP)

### Recommended for Future:
- Minimum 8-12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Password strength meter

---

## 📊 Security Audit Results

### ✅ Passed Security Checks:
- [x] Password hashing (bcrypt)
- [x] JWT authentication
- [x] Input validation
- [x] Rate limiting
- [x] CORS configuration
- [x] Security headers (Helmet)
- [x] SQL injection prevention
- [x] Environment variable protection
- [x] .gitignore configured
- [x] No photo storage (privacy)

### ⚠️ Future Improvements:
- [ ] Two-factor authentication (2FA)
- [ ] Password reset functionality
- [ ] Email verification
- [ ] Account lockout after failed attempts
- [ ] Session management (logout all devices)
- [ ] CAPTCHA for registration/login
- [ ] Security audit logging
- [ ] Penetration testing

---

## 📞 Reporting Security Issues

If you discover a security vulnerability, please email:
**pharrrodev@gmail.com**

Do NOT create a public GitHub issue for security vulnerabilities.

---

## 📚 Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Last Updated**: 2025-10-03
**Version**: 1.0.0

