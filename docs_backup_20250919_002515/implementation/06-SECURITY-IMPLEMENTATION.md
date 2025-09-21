# Security Implementation Guide - WebUredno

## Overview
This document provides comprehensive security implementation guidelines for the WebUredno cleaning service platform, following defense-in-depth principles and industry best practices.

## 1. Application Security

### 1.1 Input Validation and Sanitization

#### Client-Side Validation
```javascript
// Form validation schema using Yup
const bookingSchema = yup.object({
  name: yup.string()
    .required('Name is required')
    .max(100, 'Name too long')
    .matches(/^[a-zA-ZšđčćžŠĐČĆŽ\s'-]+$/, 'Invalid characters'),

  email: yup.string()
    .required('Email is required')
    .email('Invalid email format')
    .max(255, 'Email too long'),

  phone: yup.string()
    .required('Phone is required')
    .matches(/^[\+]?[0-9\s()-]+$/, 'Invalid phone format')
    .min(9, 'Phone too short')
    .max(20, 'Phone too long'),

  squareMeters: yup.number()
    .required('Square meters required')
    .min(20, 'Minimum 20m²')
    .max(1000, 'Maximum 1000m²')
    .positive('Must be positive'),

  message: yup.string()
    .max(1000, 'Message too long')
    .matches(/^[^<>{}]*$/, 'Invalid characters detected')
});
```

#### Server-Side Validation
```javascript
// Express middleware for input sanitization
const sanitizeInput = (req, res, next) => {
  // Sanitize all string inputs
  Object.keys(req.body).forEach(key => {
    if (typeof req.body[key] === 'string') {
      // Remove HTML tags
      req.body[key] = req.body[key].replace(/<[^>]*>/g, '');
      // Trim whitespace
      req.body[key] = req.body[key].trim();
      // Escape special characters
      req.body[key] = escapeHtml(req.body[key]);
    }
  });

  // Validate data types
  if (req.body.squareMeters) {
    req.body.squareMeters = parseInt(req.body.squareMeters, 10);
    if (isNaN(req.body.squareMeters)) {
      return res.status(400).json({ error: 'Invalid square meters' });
    }
  }

  next();
};

// HTML escaping function
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
```

### 1.2 XSS Prevention

#### Content Security Policy (CSP)
```javascript
// Express CSP middleware
const helmet = require('helmet');

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'", // Remove in production
      "https://cdn.jsdelivr.net",
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com"
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      "https://fonts.googleapis.com",
      "https://cdn.jsdelivr.net"
    ],
    fontSrc: [
      "'self'",
      "https://fonts.gstatic.com"
    ],
    imgSrc: [
      "'self'",
      "data:",
      "https:",
      "blob:"
    ],
    connectSrc: [
      "'self'",
      "https://api.weburedno.hr",
      "https://www.google-analytics.com"
    ],
    frameAncestors: ["'none'"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: []
  }
}));
```

#### React XSS Prevention
```jsx
// Safe rendering practices
const SafeComponent = ({ userInput }) => {
  // Never use dangerouslySetInnerHTML with user input
  // Always use text content or proper sanitization

  return (
    <div>
      {/* Safe: React automatically escapes */}
      <p>{userInput}</p>

      {/* If HTML rendering is required, sanitize first */}
      <div
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(userInput, {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'],
            ALLOWED_ATTR: []
          })
        }}
      />
    </div>
  );
};
```

### 1.3 CSRF Protection

#### CSRF Token Implementation
```javascript
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// Apply CSRF protection to state-changing routes
app.use('/api/booking', csrfProtection);
app.use('/api/contact', csrfProtection);

// Provide CSRF token to client
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Client-side implementation
const submitBooking = async (formData) => {
  // Get CSRF token
  const tokenResponse = await fetch('/api/csrf-token');
  const { csrfToken } = await tokenResponse.json();

  // Include in request
  const response = await fetch('/api/booking', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'CSRF-Token': csrfToken
    },
    credentials: 'include',
    body: JSON.stringify(formData)
  });

  return response.json();
};
```

### 1.4 SQL Injection Prevention

#### Parameterized Queries (PostgreSQL)
```javascript
const { Pool } = require('pg');
const pool = new Pool();

// NEVER concatenate user input into queries
// BAD - Vulnerable to SQL injection
const badQuery = `SELECT * FROM bookings WHERE email = '${userEmail}'`;

// GOOD - Parameterized query
const safeQuery = async (email, phone) => {
  const query = `
    SELECT * FROM bookings
    WHERE email = $1 OR phone = $2
    ORDER BY created_at DESC
    LIMIT 10
  `;

  try {
    const result = await pool.query(query, [email, phone]);
    return result.rows;
  } catch (error) {
    console.error('Query error:', error);
    throw new Error('Database query failed');
  }
};

// Using query builder (Knex.js)
const knex = require('knex')({
  client: 'postgresql',
  connection: process.env.DATABASE_URL
});

const getBookings = async (filters) => {
  return knex('bookings')
    .where('status', filters.status)
    .andWhere('created_at', '>=', filters.startDate)
    .orderBy('created_at', 'desc')
    .limit(50);
};
```

## 2. API Security

### 2.1 Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});

// General API rate limit
const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:api:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limit for booking endpoints
const bookingLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:booking:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 bookings per hour per IP
  skipSuccessfulRequests: false,
  message: 'Booking limit exceeded. Please wait before trying again.'
});

// Contact form limit
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Contact limit exceeded.'
});

// Apply limiters
app.use('/api/', apiLimiter);
app.use('/api/booking', bookingLimiter);
app.use('/api/contact', contactLimiter);
```

### 2.2 API Authentication (Future Implementation)

```javascript
// JWT-based authentication for admin/customer portals
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Token generation
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  });
};

// API key authentication for third-party integrations
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  // Validate API key against database
  const isValid = validateApiKey(apiKey);

  if (!isValid) {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  next();
};
```

### 2.3 Request Validation

```javascript
const Joi = require('joi');

// Booking request validation schema
const bookingValidation = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().max(255).required(),
  phone: Joi.string().pattern(/^[\+]?[0-9\s()-]+$/).min(9).max(20).required(),
  address: Joi.string().max(500).required(),
  squareMeters: Joi.number().integer().min(20).max(1000).required(),
  serviceType: Joi.string().valid('regular', 'deep', 'move-in', 'office').required(),
  preferredDate: Joi.date().min('now').required(),
  preferredTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  message: Joi.string().max(1000).optional()
});

// Validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    next();
  };
};

// Apply validation
app.post('/api/booking',
  validateRequest(bookingValidation),
  sanitizeInput,
  csrfProtection,
  bookingLimiter,
  handleBooking
);
```

### 2.4 Response Sanitization

```javascript
// Remove sensitive data from responses
const sanitizeResponse = (data) => {
  const sensitiveFields = [
    'password',
    'creditCard',
    'ssn',
    'internalNotes',
    'ipAddress'
  ];

  const sanitize = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }

    if (obj !== null && typeof obj === 'object') {
      const sanitized = {};

      for (const [key, value] of Object.entries(obj)) {
        if (!sensitiveFields.includes(key)) {
          sanitized[key] = sanitize(value);
        }
      }

      return sanitized;
    }

    return obj;
  };

  return sanitize(data);
};

// Response middleware
app.use((req, res, next) => {
  const originalSend = res.json;

  res.json = function(data) {
    const sanitized = sanitizeResponse(data);
    originalSend.call(this, sanitized);
  };

  next();
});
```

## 3. Data Protection

### 3.1 Encryption at Rest and in Transit

#### Database Encryption
```javascript
// PostgreSQL transparent data encryption
const encryptionConfig = {
  // Column-level encryption for sensitive data
  encryptedColumns: {
    'customers.phone': 'AES-256',
    'customers.email': 'AES-256',
    'customers.address': 'AES-256',
    'payments.card_number': 'AES-256'
  }
};

// Application-level encryption
const crypto = require('crypto');

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  }

  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  decrypt(encryptedData) {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
```

#### TLS/HTTPS Configuration
```javascript
// Force HTTPS in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});

// HSTS header
app.use(helmet.hsts({
  maxAge: 31536000,
  includeSubDomains: true,
  preload: true
}));

// Certificate pinning for API clients
const tls = require('tls');
const https = require('https');

const pinnedCertificates = [
  process.env.API_CERT_FINGERPRINT
];

const agent = new https.Agent({
  checkServerIdentity: (host, cert) => {
    const fingerprint = cert.fingerprint256;

    if (!pinnedCertificates.includes(fingerprint)) {
      throw new Error('Certificate pinning validation failed');
    }

    return tls.checkServerIdentity(host, cert);
  }
});
```

### 3.2 PII Handling Procedures

```javascript
// PII data classification and handling
const PIIHandler = {
  // Classification levels
  levels: {
    HIGH: ['ssn', 'creditCard', 'bankAccount', 'passport'],
    MEDIUM: ['email', 'phone', 'address', 'dateOfBirth'],
    LOW: ['name', 'zipCode', 'city']
  },

  // Masking functions
  maskEmail(email) {
    const [local, domain] = email.split('@');
    const maskedLocal = local[0] + '*'.repeat(local.length - 2) + local[local.length - 1];
    return `${maskedLocal}@${domain}`;
  },

  maskPhone(phone) {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-***-**$3');
  },

  maskAddress(address) {
    const parts = address.split(' ');
    return parts.map((part, index) =>
      index === 0 ? part : '*'.repeat(part.length)
    ).join(' ');
  },

  // Logging sanitization
  sanitizeForLogging(data) {
    const sanitized = { ...data };

    Object.keys(sanitized).forEach(key => {
      if (this.levels.HIGH.includes(key)) {
        delete sanitized[key];
      } else if (this.levels.MEDIUM.includes(key)) {
        if (key === 'email') sanitized[key] = this.maskEmail(sanitized[key]);
        if (key === 'phone') sanitized[key] = this.maskPhone(sanitized[key]);
        if (key === 'address') sanitized[key] = this.maskAddress(sanitized[key]);
      }
    });

    return sanitized;
  }
};

// Data retention policies
const DataRetention = {
  policies: {
    bookings: 365 * 2, // 2 years
    inquiries: 365,    // 1 year
    logs: 90,          // 90 days
    sessions: 30       // 30 days
  },

  async purgeExpiredData() {
    const now = new Date();

    for (const [table, days] of Object.entries(this.policies)) {
      const expiryDate = new Date(now - days * 24 * 60 * 60 * 1000);

      await db.query(`
        DELETE FROM ${table}
        WHERE created_at < $1
      `, [expiryDate]);
    }
  }
};
```

### 3.3 GDPR Compliance

```javascript
// GDPR compliance implementation
class GDPRCompliance {
  // Consent management
  async recordConsent(userId, consentType, granted) {
    await db.query(`
      INSERT INTO consent_log (user_id, consent_type, granted, ip_address, timestamp)
      VALUES ($1, $2, $3, $4, NOW())
    `, [userId, consentType, granted, req.ip]);
  }

  // Right to access (data export)
  async exportUserData(userId) {
    const userData = await db.query(`
      SELECT * FROM customers WHERE id = $1
    `, [userId]);

    const bookings = await db.query(`
      SELECT * FROM bookings WHERE customer_id = $1
    `, [userId]);

    return {
      personal_data: userData.rows[0],
      bookings: bookings.rows,
      export_date: new Date().toISOString(),
      format: 'JSON'
    };
  }

  // Right to erasure (right to be forgotten)
  async deleteUserData(userId) {
    // Anonymize instead of hard delete for legal records
    await db.query(`
      UPDATE customers
      SET
        name = 'DELETED',
        email = CONCAT('deleted_', id, '@deleted.com'),
        phone = '000000000',
        address = 'DELETED',
        deleted_at = NOW()
      WHERE id = $1
    `, [userId]);

    // Delete associated non-essential data
    await db.query(`
      DELETE FROM marketing_preferences WHERE customer_id = $1;
      DELETE FROM saved_preferences WHERE customer_id = $1;
    `, [userId]);
  }

  // Data portability
  async generatePortableData(userId) {
    const data = await this.exportUserData(userId);

    // Convert to standard format (CSV/JSON)
    return {
      format: 'application/json',
      data: JSON.stringify(data, null, 2),
      checksum: crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex')
    };
  }
}

// Cookie consent implementation
const cookieConsent = {
  necessary: ['session_id', 'csrf_token'],
  functional: ['language', 'timezone'],
  analytics: ['_ga', '_gid', 'utm_*'],
  marketing: ['facebook_pixel', 'google_ads']
};

app.use((req, res, next) => {
  const consent = req.cookies.cookie_consent;

  if (!consent || !consent.necessary) {
    // Only set necessary cookies
    res.locals.allowedCookies = cookieConsent.necessary;
  } else {
    res.locals.allowedCookies = [
      ...cookieConsent.necessary,
      ...(consent.functional ? cookieConsent.functional : []),
      ...(consent.analytics ? cookieConsent.analytics : []),
      ...(consent.marketing ? cookieConsent.marketing : [])
    ];
  }

  next();
});
```

### 3.4 Data Masking Techniques

```javascript
// Dynamic data masking for different contexts
class DataMasking {
  constructor() {
    this.rules = {
      display: {
        email: (val) => this.maskEmail(val, 'partial'),
        phone: (val) => this.maskPhone(val, 'partial'),
        creditCard: (val) => this.maskCreditCard(val),
        address: (val) => this.maskAddress(val, 'partial')
      },
      logs: {
        email: (val) => this.maskEmail(val, 'full'),
        phone: (val) => this.maskPhone(val, 'full'),
        creditCard: () => 'REDACTED',
        address: () => 'REDACTED',
        password: () => 'REDACTED'
      },
      analytics: {
        email: (val) => this.hashValue(val),
        phone: (val) => this.hashValue(val),
        creditCard: () => null,
        address: (val) => this.extractZipCode(val)
      }
    };
  }

  maskEmail(email, level = 'partial') {
    if (level === 'full') {
      return 'user@***.com';
    }
    const [local, domain] = email.split('@');
    return local.substring(0, 2) + '***@' + domain;
  }

  maskPhone(phone, level = 'partial') {
    if (level === 'full') {
      return '***-***-****';
    }
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-***-$3');
  }

  maskCreditCard(card) {
    return '**** **** **** ' + card.slice(-4);
  }

  maskAddress(address, level = 'partial') {
    if (level === 'full') {
      return 'ADDRESS REDACTED';
    }
    const parts = address.split(',');
    if (parts.length > 1) {
      return '*****, ' + parts[parts.length - 1].trim();
    }
    return '*****';
  }

  hashValue(value) {
    return crypto.createHash('sha256').update(value + process.env.HASH_SALT).digest('hex');
  }

  extractZipCode(address) {
    const zipMatch = address.match(/\d{5}(-\d{4})?/);
    return zipMatch ? zipMatch[0] : null;
  }

  apply(data, context = 'display') {
    const rules = this.rules[context];
    const masked = { ...data };

    Object.keys(masked).forEach(key => {
      if (rules[key] && masked[key]) {
        masked[key] = rules[key](masked[key]);
      }
    });

    return masked;
  }
}
```

## 4. Infrastructure Security

### 4.1 Environment Variable Management

```javascript
// .env.example (never commit actual .env)
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/weburedno
DB_SSL_MODE=require

# Security Keys (use strong, unique values)
JWT_ACCESS_SECRET=generate-with-crypto-randomBytes-32
JWT_REFRESH_SECRET=generate-with-crypto-randomBytes-32
ENCRYPTION_KEY=generate-with-crypto-randomBytes-32
HASH_SALT=generate-with-crypto-randomBytes-16

# API Keys (rotate regularly)
STRIPE_SECRET_KEY=sk_live_...
SENDGRID_API_KEY=SG...
GOOGLE_MAPS_API_KEY=AIza...

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=strong-password

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
NEW_RELIC_LICENSE_KEY=...

// Environment variable validation
const requiredEnvVars = [
  'NODE_ENV',
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'ENCRYPTION_KEY'
];

const validateEnv = () => {
  const missing = requiredEnvVars.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    process.exit(1);
  }

  // Validate format
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'development') {
    console.error('NODE_ENV must be "production" or "development"');
    process.exit(1);
  }

  // Check key strength
  if (process.env.ENCRYPTION_KEY.length < 64) {
    console.error('ENCRYPTION_KEY must be at least 32 bytes (64 hex characters)');
    process.exit(1);
  }
};

validateEnv();
```

### 4.2 Secret Rotation Procedures

```bash
#!/bin/bash
# Secret rotation script

# Function to generate secure random key
generate_key() {
  openssl rand -hex 32
}

# Rotate database password
rotate_db_password() {
  NEW_PASSWORD=$(generate_key)

  # Update database user password
  psql -U postgres -c "ALTER USER weburedno WITH PASSWORD '$NEW_PASSWORD';"

  # Update environment variable
  heroku config:set DATABASE_URL="postgresql://weburedno:$NEW_PASSWORD@localhost:5432/weburedno"

  # Log rotation
  echo "$(date): Database password rotated" >> /var/log/secret-rotation.log
}

# Rotate JWT secrets
rotate_jwt_secrets() {
  NEW_ACCESS_SECRET=$(generate_key)
  NEW_REFRESH_SECRET=$(generate_key)

  # Store old secrets for grace period
  heroku config:set JWT_ACCESS_SECRET_OLD=$JWT_ACCESS_SECRET
  heroku config:set JWT_REFRESH_SECRET_OLD=$JWT_REFRESH_SECRET

  # Set new secrets
  heroku config:set JWT_ACCESS_SECRET=$NEW_ACCESS_SECRET
  heroku config:set JWT_REFRESH_SECRET=$NEW_REFRESH_SECRET

  echo "$(date): JWT secrets rotated" >> /var/log/secret-rotation.log
}

# Rotate API keys
rotate_api_keys() {
  # Generate new API keys in respective services
  # Update environment variables
  # Maintain old keys for grace period

  echo "$(date): API keys rotation initiated" >> /var/log/secret-rotation.log
}

# Schedule rotation (crontab)
# 0 0 1 * * /path/to/rotate-secrets.sh
```

### 4.3 Access Control Policies

```javascript
// Role-Based Access Control (RBAC)
const AccessControl = {
  roles: {
    SUPER_ADMIN: {
      permissions: ['*'],
      description: 'Full system access'
    },
    ADMIN: {
      permissions: [
        'bookings:read',
        'bookings:update',
        'bookings:delete',
        'customers:read',
        'customers:update',
        'reports:read',
        'settings:read',
        'settings:update'
      ]
    },
    STAFF: {
      permissions: [
        'bookings:read',
        'bookings:update',
        'customers:read',
        'reports:read'
      ]
    },
    CUSTOMER: {
      permissions: [
        'own_bookings:read',
        'own_bookings:create',
        'own_bookings:update',
        'own_profile:read',
        'own_profile:update'
      ]
    }
  },

  checkPermission(userRole, permission, resourceOwnerId = null, userId = null) {
    const role = this.roles[userRole];

    if (!role) {
      return false;
    }

    // Super admin bypass
    if (role.permissions.includes('*')) {
      return true;
    }

    // Check for ownership-based permissions
    if (permission.startsWith('own_')) {
      if (resourceOwnerId !== userId) {
        return false;
      }
      permission = permission.replace('own_', '');
    }

    return role.permissions.includes(permission);
  },

  middleware(permission) {
    return (req, res, next) => {
      const userRole = req.user?.role || 'GUEST';
      const userId = req.user?.id;
      const resourceOwnerId = req.params.userId || req.body.userId;

      if (!this.checkPermission(userRole, permission, resourceOwnerId, userId)) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          required: permission,
          userRole: userRole
        });
      }

      next();
    };
  }
};

// IP-based access control
const ipWhitelist = process.env.ADMIN_IP_WHITELIST?.split(',') || [];

const ipRestriction = (req, res, next) => {
  if (req.path.startsWith('/admin')) {
    const clientIp = req.ip || req.connection.remoteAddress;

    if (ipWhitelist.length > 0 && !ipWhitelist.includes(clientIp)) {
      return res.status(403).json({ error: 'Access denied from this IP' });
    }
  }

  next();
};
```

### 4.4 Security Monitoring

```javascript
// Security event logging
const SecurityLogger = {
  events: {
    LOGIN_SUCCESS: 'auth.login.success',
    LOGIN_FAILURE: 'auth.login.failure',
    PERMISSION_DENIED: 'access.denied',
    RATE_LIMIT_EXCEEDED: 'rate_limit.exceeded',
    SUSPICIOUS_ACTIVITY: 'security.suspicious',
    DATA_BREACH_ATTEMPT: 'security.breach_attempt'
  },

  log(eventType, details) {
    const event = {
      timestamp: new Date().toISOString(),
      event: eventType,
      details: details,
      ip: details.ip,
      userId: details.userId || null,
      userAgent: details.userAgent,
      severity: this.getSeverity(eventType)
    };

    // Log to file
    fs.appendFileSync('/var/log/security.log', JSON.stringify(event) + '\n');

    // Send to SIEM
    if (process.env.SIEM_ENDPOINT) {
      axios.post(process.env.SIEM_ENDPOINT, event);
    }

    // Alert on critical events
    if (event.severity === 'CRITICAL') {
      this.sendAlert(event);
    }
  },

  getSeverity(eventType) {
    const severityMap = {
      [this.events.DATA_BREACH_ATTEMPT]: 'CRITICAL',
      [this.events.SUSPICIOUS_ACTIVITY]: 'HIGH',
      [this.events.PERMISSION_DENIED]: 'MEDIUM',
      [this.events.LOGIN_FAILURE]: 'LOW',
      [this.events.LOGIN_SUCCESS]: 'INFO'
    };

    return severityMap[eventType] || 'INFO';
  },

  sendAlert(event) {
    // Send email/SMS/Slack notification
    const message = `
      SECURITY ALERT: ${event.event}
      Time: ${event.timestamp}
      IP: ${event.ip}
      Details: ${JSON.stringify(event.details)}
    `;

    // Implementation depends on notification service
    console.error(message);
  }
};

// Intrusion detection
const IntrusionDetection = {
  patterns: {
    SQL_INJECTION: /(\bUNION\b|\bSELECT\b.*\bFROM\b|\bDROP\b|\bDELETE\b.*\bFROM\b)/i,
    XSS_ATTEMPT: /<script|javascript:|onerror=|onclick=/i,
    PATH_TRAVERSAL: /\.\.\/|\.\.\\|%2e%2e%2f/i,
    COMMAND_INJECTION: /;|\||&|`|\$\(/
  },

  check(req) {
    const payload = JSON.stringify({
      body: req.body,
      query: req.query,
      params: req.params
    });

    for (const [attack, pattern] of Object.entries(this.patterns)) {
      if (pattern.test(payload)) {
        SecurityLogger.log(SecurityLogger.events.DATA_BREACH_ATTEMPT, {
          attack_type: attack,
          ip: req.ip,
          path: req.path,
          payload: payload.substring(0, 1000)
        });

        return true;
      }
    }

    return false;
  }
};
```

## 5. Security Testing

### 5.1 Vulnerability Scanning Setup

```json
// package.json security scripts
{
  "scripts": {
    "security:audit": "npm audit --audit-level=moderate",
    "security:check": "npm run security:audit && npm run security:scan",
    "security:scan": "snyk test",
    "security:monitor": "snyk monitor",
    "security:owasp": "dependency-check --scan . --format HTML --out reports/dependency-check.html"
  },
  "devDependencies": {
    "snyk": "^1.1064.0",
    "@owasp/dependency-check": "^8.4.0"
  }
}
```

```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'  # Weekly scan

jobs:
  security:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Run Snyk Security Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

      - name: Run OWASP Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'WebUredno'
          path: '.'
          format: 'HTML'
          args: >
            --enableRetired
            --enableExperimental

      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: security-reports
          path: reports/
```

### 5.2 Penetration Testing Checklist

```markdown
## Web Application Penetration Testing Checklist

### Authentication Testing
- [ ] Test for weak passwords
- [ ] Test for username enumeration
- [ ] Test for authentication bypass
- [ ] Test for password reset vulnerability
- [ ] Test for session fixation
- [ ] Test for cookie security flags
- [ ] Test for brute force protection

### Authorization Testing
- [ ] Test for privilege escalation
- [ ] Test for IDOR (Insecure Direct Object References)
- [ ] Test for missing function level access control
- [ ] Test for forced browsing

### Input Validation Testing
- [ ] Test for SQL injection
- [ ] Test for XSS (reflected, stored, DOM-based)
- [ ] Test for XML injection
- [ ] Test for LDAP injection
- [ ] Test for Command injection
- [ ] Test for Path traversal
- [ ] Test for File upload vulnerabilities

### Session Management Testing
- [ ] Test for session timeout
- [ ] Test for session fixation
- [ ] Test for CSRF
- [ ] Test for cookie attributes
- [ ] Test for session token entropy

### Business Logic Testing
- [ ] Test for price manipulation
- [ ] Test for race conditions
- [ ] Test for workflow bypass
- [ ] Test for negative value inputs

### API Security Testing
- [ ] Test for API rate limiting
- [ ] Test for API authentication
- [ ] Test for API input validation
- [ ] Test for API versioning issues
- [ ] Test for excessive data exposure

### Infrastructure Testing
- [ ] Test for SSL/TLS configuration
- [ ] Test for security headers
- [ ] Test for directory listing
- [ ] Test for backup files
- [ ] Test for debug mode
```

### 5.3 Security Audit Procedures

```javascript
// Automated security audit script
const SecurityAudit = {
  async runFullAudit() {
    const results = {
      timestamp: new Date().toISOString(),
      passed: [],
      failed: [],
      warnings: []
    };

    // Check dependencies
    const depCheck = await this.checkDependencies();
    results[depCheck.status].push(depCheck);

    // Check configurations
    const configCheck = await this.checkConfigurations();
    results[configCheck.status].push(configCheck);

    // Check security headers
    const headerCheck = await this.checkSecurityHeaders();
    results[headerCheck.status].push(headerCheck);

    // Check SSL/TLS
    const sslCheck = await this.checkSSL();
    results[sslCheck.status].push(sslCheck);

    // Check for common vulnerabilities
    const vulnCheck = await this.checkCommonVulnerabilities();
    results[vulnCheck.status].push(vulnCheck);

    // Generate report
    await this.generateReport(results);

    return results;
  },

  async checkDependencies() {
    const { execSync } = require('child_process');

    try {
      const output = execSync('npm audit --json', { encoding: 'utf8' });
      const audit = JSON.parse(output);

      if (audit.metadata.vulnerabilities.high > 0 || audit.metadata.vulnerabilities.critical > 0) {
        return {
          status: 'failed',
          check: 'dependencies',
          message: `Found ${audit.metadata.vulnerabilities.high} high and ${audit.metadata.vulnerabilities.critical} critical vulnerabilities`
        };
      }

      return {
        status: 'passed',
        check: 'dependencies',
        message: 'No high or critical vulnerabilities found'
      };
    } catch (error) {
      return {
        status: 'failed',
        check: 'dependencies',
        message: error.message
      };
    }
  },

  async checkConfigurations() {
    const issues = [];

    // Check for debug mode in production
    if (process.env.NODE_ENV === 'production' && process.env.DEBUG) {
      issues.push('DEBUG mode enabled in production');
    }

    // Check for weak secrets
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      issues.push('JWT_SECRET is too weak');
    }

    // Check for default credentials
    if (process.env.ADMIN_PASSWORD === 'admin' || process.env.ADMIN_PASSWORD === 'password') {
      issues.push('Default admin credentials detected');
    }

    if (issues.length > 0) {
      return {
        status: 'failed',
        check: 'configurations',
        message: issues.join(', ')
      };
    }

    return {
      status: 'passed',
      check: 'configurations',
      message: 'Configuration security checks passed'
    };
  },

  async checkSecurityHeaders() {
    const axios = require('axios');
    const requiredHeaders = [
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Content-Security-Policy',
      'Strict-Transport-Security'
    ];

    try {
      const response = await axios.get(process.env.APP_URL);
      const headers = response.headers;
      const missing = requiredHeaders.filter(h => !headers[h.toLowerCase()]);

      if (missing.length > 0) {
        return {
          status: 'failed',
          check: 'headers',
          message: `Missing security headers: ${missing.join(', ')}`
        };
      }

      return {
        status: 'passed',
        check: 'headers',
        message: 'All required security headers present'
      };
    } catch (error) {
      return {
        status: 'failed',
        check: 'headers',
        message: error.message
      };
    }
  },

  async generateReport(results) {
    const report = {
      ...results,
      score: (results.passed.length / (results.passed.length + results.failed.length)) * 100,
      recommendations: this.getRecommendations(results)
    };

    // Save report
    fs.writeFileSync(
      `reports/security-audit-${Date.now()}.json`,
      JSON.stringify(report, null, 2)
    );

    // Send notifications if critical issues
    if (results.failed.length > 0) {
      await this.notifySecurityTeam(report);
    }

    return report;
  }
};
```

### 5.4 Incident Response Plan

```markdown
# Security Incident Response Plan

## 1. Preparation Phase
- Maintain updated contact list for incident response team
- Keep incident response tools ready
- Regular security training for team members
- Maintain secure backup and recovery procedures

## 2. Detection & Analysis

### Severity Classification
- **P1 (Critical)**: Data breach, system compromise, ransomware
- **P2 (High)**: Unauthorized access, DDoS attack
- **P3 (Medium)**: Suspicious activity, policy violation
- **P4 (Low)**: Failed login attempts, minor vulnerabilities

### Initial Response (Within 15 minutes)
1. Verify the incident
2. Assess severity level
3. Notify incident commander
4. Begin documentation

## 3. Containment

### Short-term Containment
- Isolate affected systems
- Block malicious IP addresses
- Disable compromised accounts
- Take system snapshots for forensics

### Long-term Containment
- Apply patches
- Remove malware
- Reset compromised credentials
- Implement additional monitoring

## 4. Eradication
- Remove malware and artifacts
- Close vulnerabilities
- Update security controls
- Verify system integrity

## 5. Recovery
- Restore from clean backups
- Rebuild compromised systems
- Test functionality
- Monitor for recurring issues
- Gradual return to production

## 6. Post-Incident Activities
- Complete incident report
- Conduct lessons learned meeting
- Update security procedures
- Share threat intelligence
- Legal and regulatory notifications

## Contact Information
- Security Team Lead: [Contact]
- CTO: [Contact]
- Legal Team: [Contact]
- PR Team: [Contact]
- External Security Firm: [Contact]

## Notification Requirements
- GDPR breach notification: Within 72 hours to supervisory authority
- Affected users: Without undue delay
- Media (if required): Coordinated with PR team
```

## Security Implementation Checklist

```markdown
## Phase 1: Foundation (Week 1-2)
- [ ] Implement input validation and sanitization
- [ ] Set up CSRF protection
- [ ] Configure security headers (CSP, HSTS, etc.)
- [ ] Enable HTTPS everywhere
- [ ] Set up rate limiting

## Phase 2: Data Protection (Week 3-4)
- [ ] Implement encryption at rest
- [ ] Set up PII handling procedures
- [ ] Configure GDPR compliance features
- [ ] Implement data masking
- [ ] Set up backup and recovery

## Phase 3: Authentication & Authorization (Week 5-6)
- [ ] Implement secure authentication
- [ ] Set up RBAC
- [ ] Configure session management
- [ ] Implement 2FA (optional)
- [ ] Set up password policies

## Phase 4: Monitoring & Testing (Week 7-8)
- [ ] Set up security monitoring
- [ ] Configure intrusion detection
- [ ] Implement logging and auditing
- [ ] Run vulnerability scans
- [ ] Conduct penetration testing

## Phase 5: Hardening & Documentation (Week 9-10)
- [ ] Harden infrastructure
- [ ] Implement secret rotation
- [ ] Complete security documentation
- [ ] Train team on security procedures
- [ ] Establish incident response plan

## Ongoing Activities
- [ ] Weekly vulnerability scans
- [ ] Monthly security reviews
- [ ] Quarterly penetration testing
- [ ] Annual security audit
- [ ] Continuous security training
```

## Conclusion

This security implementation guide provides a comprehensive framework for securing the WebUredno application. Regular reviews and updates of these security measures are essential to maintain a strong security posture as the application evolves and new threats emerge.

Remember: Security is not a one-time implementation but an ongoing process that requires continuous monitoring, updating, and improvement.