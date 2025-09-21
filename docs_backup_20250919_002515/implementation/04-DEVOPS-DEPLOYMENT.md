# DevOps & Deployment Implementation Guide

## Overview

This guide provides comprehensive DevOps and deployment procedures for the WebUredno platform, ensuring reliable, secure, and scalable deployment across all environments.

---

## 1. Infrastructure Setup

### 1.1 Vercel Deployment Configuration

#### Initial Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Initialize project
vercel

# Link to existing project
vercel link
```

#### Project Configuration (vercel.json)
```json
{
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "regions": ["arn1"],
  "functions": {
    "app/api/**/*": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "env": {
    "NEXT_PUBLIC_APP_URL": "@app_url",
    "DATABASE_URL": "@database_url",
    "NEXTAUTH_SECRET": "@nextauth_secret"
  }
}
```

### 1.2 Environment Management

#### Environment Structure
```
Production (main branch)
├── Domain: weburedno.hr
├── API: api.weburedno.hr
└── Region: eu-central-1

Staging (staging branch)
├── Domain: staging.weburedno.hr
├── API: api-staging.weburedno.hr
└── Region: eu-central-1

Development (develop branch)
├── Domain: dev.weburedno.hr
├── API: api-dev.weburedno.hr
└── Region: eu-central-1
```

#### Environment Variables Configuration
```bash
# Production
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add STRIPE_SECRET_KEY production
vercel env add SMTP_HOST production
vercel env add SMTP_PORT production
vercel env add SMTP_USER production
vercel env add SMTP_PASSWORD production
vercel env add SENTRY_DSN production

# Staging
vercel env add DATABASE_URL preview
vercel env add NEXTAUTH_SECRET preview
# ... repeat for all variables

# Development
vercel env add DATABASE_URL development
vercel env add NEXTAUTH_SECRET development
# ... repeat for all variables
```

### 1.3 Domain and DNS Configuration

#### DNS Records Setup
```
A Records:
- @ -> 76.76.21.21 (Vercel)
- www -> 76.76.21.21 (Vercel)

CNAME Records:
- staging -> cname.vercel-dns.com
- dev -> cname.vercel-dns.com
- api -> cname.vercel-dns.com

MX Records (for email):
- Priority 1: aspmx.l.google.com
- Priority 5: alt1.aspmx.l.google.com
- Priority 5: alt2.aspmx.l.google.com

TXT Records:
- SPF: v=spf1 include:_spf.google.com ~all
- DMARC: v=DMARC1; p=quarantine; rua=mailto:admin@weburedno.hr
```

#### Domain Configuration Script
```bash
#!/bin/bash
# add-domain.sh

# Production domain
vercel domains add weburedno.hr --scope=team_name
vercel domains add www.weburedno.hr --scope=team_name

# Staging domain
vercel domains add staging.weburedno.hr --scope=team_name

# Development domain
vercel domains add dev.weburedno.hr --scope=team_name

# API subdomains
vercel domains add api.weburedno.hr --scope=team_name
vercel domains add api-staging.weburedno.hr --scope=team_name
vercel domains add api-dev.weburedno.hr --scope=team_name
```

### 1.4 SSL Certificate Setup

#### Automatic SSL with Vercel
```yaml
# Automatically provisioned by Vercel for all domains
# Manual verification if needed:

vercel certs ls
vercel certs issue weburedno.hr
```

#### Certificate Monitoring
```javascript
// scripts/check-ssl.js
const https = require('https');
const { parse } = require('url');

const domains = [
  'weburedno.hr',
  'staging.weburedno.hr',
  'dev.weburedno.hr'
];

domains.forEach(domain => {
  const options = {
    hostname: domain,
    port: 443,
    method: 'GET'
  };

  const req = https.request(options, (res) => {
    const cert = res.socket.getPeerCertificate();
    const expiry = new Date(cert.valid_to);
    const daysLeft = Math.floor((expiry - new Date()) / (1000 * 60 * 60 * 24));

    console.log(`${domain}: ${daysLeft} days until expiry`);

    if (daysLeft < 30) {
      console.warn(`WARNING: Certificate expiring soon for ${domain}`);
    }
  });

  req.end();
});
```

---

## 2. CI/CD Pipeline

### 2.1 GitHub Actions Workflows

#### Main CI/CD Workflow
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, staging, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20.x'
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run type check
        run: npm run type-check

      - name: Run linting
        run: npm run lint

      - name: Run tests
        run: npm run test:ci
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_APP_URL: ${{ secrets.NEXT_PUBLIC_APP_URL }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: .next/

  deploy-preview:
    needs: build
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project Artifacts
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy to Vercel Preview
        id: deploy
        run: |
          deployment_url=$(vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }})
          echo "deployment_url=$deployment_url" >> $GITHUB_OUTPUT

      - name: Comment PR with preview URL
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🚀 Preview deployed to: ${{ steps.deploy.outputs.deployment_url }}'
            })

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Staging
        run: |
          npm install --global vercel@latest
          vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}
          vercel build --token=${{ secrets.VERCEL_TOKEN }}
          vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }} --prod

      - name: Run smoke tests
        run: npm run test:e2e:staging
        env:
          STAGING_URL: https://staging.weburedno.hr

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Production
        run: |
          npm install --global vercel@latest
          vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
          vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
          vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Create deployment tag
        run: |
          git config user.name github-actions
          git config user.email github-actions@github.com
          git tag -a "v$(date +%Y%m%d%H%M%S)" -m "Production deployment"
          git push origin --tags

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Production deployment completed'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 2.2 Build and Test Automation

#### Test Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

#### E2E Test Workflow
```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  schedule:
    - cron: '0 */6 * * *' # Every 6 hours
  workflow_dispatch:

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          TEST_URL: ${{ secrets.STAGING_URL }}

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### 2.3 Deployment Triggers

#### Deployment Matrix
```yaml
# .github/workflows/deploy-matrix.yml
name: Deployment Matrix

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        type: choice
        options:
          - development
          - staging
          - production
      version:
        description: 'Version to deploy'
        required: false
        default: 'latest'

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.inputs.version }}

      - name: Deploy to ${{ github.event.inputs.environment }}
        run: |
          echo "Deploying version ${{ github.event.inputs.version }} to ${{ github.event.inputs.environment }}"
          npm install --global vercel@latest

          if [ "${{ github.event.inputs.environment }}" = "production" ]; then
            vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }}
          else
            vercel deploy --token=${{ secrets.VERCEL_TOKEN }}
          fi
```

### 2.4 Rollback Procedures

#### Automated Rollback Script
```bash
#!/bin/bash
# scripts/rollback.sh

set -e

ENVIRONMENT=$1
DEPLOYMENT_ID=$2

if [ -z "$ENVIRONMENT" ] || [ -z "$DEPLOYMENT_ID" ]; then
  echo "Usage: ./rollback.sh <environment> <deployment-id>"
  exit 1
fi

echo "Rolling back $ENVIRONMENT to deployment $DEPLOYMENT_ID"

# Get current deployment
CURRENT=$(vercel ls --token=$VERCEL_TOKEN | grep "$ENVIRONMENT" | head -1 | awk '{print $1}')

# Create rollback
vercel rollback $DEPLOYMENT_ID --token=$VERCEL_TOKEN --scope=team_name

# Verify rollback
NEW_DEPLOYMENT=$(vercel ls --token=$VERCEL_TOKEN | grep "$ENVIRONMENT" | head -1 | awk '{print $1}')

if [ "$CURRENT" != "$NEW_DEPLOYMENT" ]; then
  echo "Rollback successful: $CURRENT -> $NEW_DEPLOYMENT"

  # Notify team
  curl -X POST $SLACK_WEBHOOK \
    -H 'Content-Type: application/json' \
    -d "{\"text\":\"⚠️ Rollback executed for $ENVIRONMENT\"}"
else
  echo "Rollback failed"
  exit 1
fi
```

#### Manual Rollback Procedure
```markdown
## Manual Rollback Steps

1. **Identify the issue**
   - Check error logs in Vercel dashboard
   - Review Sentry for error spikes
   - Monitor performance metrics

2. **Find previous stable deployment**
   ```bash
   vercel ls --token=$VERCEL_TOKEN
   ```

3. **Execute rollback**
   ```bash
   vercel rollback [DEPLOYMENT_ID] --token=$VERCEL_TOKEN
   ```

4. **Verify rollback**
   - Check application health
   - Run smoke tests
   - Monitor error rates

5. **Post-rollback actions**
   - Create incident report
   - Fix issues in development
   - Schedule deployment retry
```

---

## 3. Monitoring & Logging

### 3.1 Application Monitoring Setup

#### Vercel Analytics Configuration
```javascript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hr">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

#### Custom Metrics Collection
```typescript
// lib/monitoring/metrics.ts
interface Metric {
  name: string;
  value: number;
  tags?: Record<string, string>;
}

class MetricsCollector {
  private metrics: Metric[] = [];

  track(name: string, value: number, tags?: Record<string, string>) {
    this.metrics.push({
      name,
      value,
      tags: {
        ...tags,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
    });

    // Send to monitoring service
    if (this.metrics.length >= 10) {
      this.flush();
    }
  }

  async flush() {
    if (this.metrics.length === 0) return;

    const batch = [...this.metrics];
    this.metrics = [];

    try {
      await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
      });
    } catch (error) {
      console.error('Failed to send metrics:', error);
    }
  }

  // Track specific business metrics
  trackBooking(duration: number) {
    this.track('booking.created', 1, { duration: String(duration) });
  }

  trackPayment(amount: number, method: string) {
    this.track('payment.processed', amount, { method });
  }

  trackApiLatency(endpoint: string, latency: number) {
    this.track('api.latency', latency, { endpoint });
  }
}

export const metrics = new MetricsCollector();
```

### 3.2 Error Tracking with Sentry

#### Sentry Configuration
```javascript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request?.cookies) {
      delete event.request.cookies;
    }
    return event;
  },
});
```

#### Custom Error Boundaries
```typescript
// components/ErrorBoundary.tsx
import React from 'react';
import * as Sentry from '@sentry/nextjs';

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.withScope((scope) => {
      scope.setExtras(errorInfo);
      Sentry.captureException(error);
    });
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback;
      if (Fallback && this.state.error) {
        return <Fallback error={this.state.error} />;
      }
      return (
        <div className="error-boundary">
          <h2>Nešto je pošlo po zlu</h2>
          <p>Molimo pokušajte ponovno ili kontaktirajte podršku.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 3.3 Performance Monitoring

#### Web Vitals Tracking
```typescript
// lib/monitoring/web-vitals.ts
import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  });

  // Use sendBeacon for reliability
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics', body);
  } else {
    fetch('/api/analytics', {
      body,
      method: 'POST',
      keepalive: true,
    });
  }
}

export function reportWebVitals() {
  getCLS(sendToAnalytics);
  getFCP(sendToAnalytics);
  getFID(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}
```

#### Performance Budget Monitoring
```javascript
// scripts/performance-budget.js
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance'],
    port: chrome.port,
  };

  const runnerResult = await lighthouse(url, options);
  await chrome.kill();

  return runnerResult.lhr;
}

const budgets = {
  'performance-score': 90,
  'first-contentful-paint': 1500,
  'largest-contentful-paint': 2500,
  'total-blocking-time': 300,
  'cumulative-layout-shift': 0.1,
};

async function checkPerformance() {
  const results = await runLighthouse('https://weburedno.hr');
  const metrics = results.audits;

  let passed = true;

  if (results.categories.performance.score * 100 < budgets['performance-score']) {
    console.error(`Performance score ${results.categories.performance.score * 100} below budget ${budgets['performance-score']}`);
    passed = false;
  }

  // Check other metrics...

  process.exit(passed ? 0 : 1);
}

checkPerformance();
```

### 3.4 Log Aggregation

#### Structured Logging
```typescript
// lib/logger.ts
import winston from 'winston';

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  new winston.transports.File({ filename: 'logs/all.log' }),
];

const Logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  levels: logLevels,
  format,
  transports,
});

export default Logger;
```

#### API Request Logging
```typescript
// middleware/logging.ts
import { NextRequest, NextResponse } from 'next/server';
import Logger from '@/lib/logger';

export function loggingMiddleware(request: NextRequest) {
  const startTime = Date.now();

  // Log request
  Logger.info({
    type: 'request',
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
    timestamp: new Date().toISOString(),
  });

  // Create response wrapper to log response
  const response = NextResponse.next();

  // Log response time
  const duration = Date.now() - startTime;
  Logger.info({
    type: 'response',
    method: request.method,
    url: request.url,
    status: response.status,
    duration,
    timestamp: new Date().toISOString(),
  });

  // Add timing header
  response.headers.set('X-Response-Time', `${duration}ms`);

  return response;
}
```

---

## 4. Security & Compliance

### 4.1 Secret Management

#### Environment Variable Security
```bash
# .env.vault (encrypted with dotenv-vault)
# Never commit .env files, use encrypted vault

# Install dotenv-vault
npm install -g dotenv-vault

# Login to vault
npx dotenv-vault login

# Push secrets to vault
npx dotenv-vault push

# Pull secrets from vault
npx dotenv-vault pull

# Build encrypted .env.vault file
npx dotenv-vault build
```

#### GitHub Secrets Setup
```yaml
# Required secrets in GitHub:
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
DATABASE_URL
NEXTAUTH_SECRET
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
SMTP_PASSWORD
SENTRY_DSN
SENTRY_AUTH_TOKEN
SLACK_WEBHOOK
```

#### Secret Rotation Policy
```typescript
// scripts/rotate-secrets.ts
import crypto from 'crypto';
import { Vercel } from '@vercel/client';

async function rotateSecret(name: string) {
  // Generate new secret
  const newSecret = crypto.randomBytes(32).toString('hex');

  // Update in Vercel
  const vercel = new Vercel({ token: process.env.VERCEL_TOKEN });
  await vercel.env.update(name, newSecret);

  // Update in GitHub
  // This requires GitHub API calls

  // Log rotation
  console.log(`Secret ${name} rotated at ${new Date().toISOString()}`);

  return newSecret;
}

// Rotate secrets every 90 days
const secretsToRotate = [
  'NEXTAUTH_SECRET',
  'DATABASE_PASSWORD',
  'JWT_SECRET',
];

secretsToRotate.forEach(secret => {
  rotateSecret(secret);
});
```

### 4.2 Security Headers Configuration

#### Next.js Security Headers
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
  }
];

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel.com *.googleapis.com;
  style-src 'self' 'unsafe-inline' *.googleapis.com;
  img-src 'self' blob: data: *.googleapis.com;
  media-src 'none';
  connect-src 'self' *.vercel.com *.sentry.io;
  font-src 'self' data: *.gstatic.com;
  frame-src 'self' *.stripe.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  block-all-mixed-content;
  upgrade-insecure-requests;
`;

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### 4.3 GDPR Compliance Checks

#### Cookie Consent Implementation
```typescript
// components/CookieConsent.tsx
import { useState, useEffect } from 'react';
import { getCookie, setCookie } from '@/lib/cookies';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = getCookie('gdpr-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    setCookie('gdpr-consent', 'accepted', 365);
    setShowBanner(false);
    // Initialize analytics
    window.gtag('consent', 'update', {
      'analytics_storage': 'granted'
    });
  };

  const handleDecline = () => {
    setCookie('gdpr-consent', 'declined', 365);
    setShowBanner(false);
    // Disable analytics
    window.gtag('consent', 'update', {
      'analytics_storage': 'denied'
    });
  };

  if (!showBanner) return null;

  return (
    <div className="cookie-banner">
      <p>
        Koristimo kolačiće za poboljšanje korisničkog iskustva.
        Pročitajte našu <a href="/privacy">Politiku privatnosti</a>.
      </p>
      <button onClick={handleAccept}>Prihvaćam</button>
      <button onClick={handleDecline}>Odbijam</button>
    </div>
  );
}
```

#### Data Protection Audit
```typescript
// scripts/gdpr-audit.ts
interface PersonalDataField {
  table: string;
  column: string;
  type: 'email' | 'name' | 'phone' | 'address' | 'other';
  encrypted: boolean;
  retention: number; // days
}

const personalDataInventory: PersonalDataField[] = [
  { table: 'users', column: 'email', type: 'email', encrypted: false, retention: 730 },
  { table: 'users', column: 'name', type: 'name', encrypted: false, retention: 730 },
  { table: 'users', column: 'phone', type: 'phone', encrypted: true, retention: 730 },
  { table: 'bookings', column: 'address', type: 'address', encrypted: true, retention: 365 },
];

// Audit functions
async function auditDataRetention() {
  for (const field of personalDataInventory) {
    const query = `
      SELECT COUNT(*) as count
      FROM ${field.table}
      WHERE created_at < NOW() - INTERVAL '${field.retention} days'
    `;
    // Execute query and log results
  }
}

async function auditEncryption() {
  const unencryptedSensitive = personalDataInventory.filter(
    field => !field.encrypted && ['phone', 'address'].includes(field.type)
  );

  if (unencryptedSensitive.length > 0) {
    console.error('Sensitive data not encrypted:', unencryptedSensitive);
  }
}

// Export data for GDPR requests
async function exportUserData(userId: string) {
  const userData = {};

  for (const field of personalDataInventory) {
    const query = `SELECT ${field.column} FROM ${field.table} WHERE user_id = $1`;
    // Execute and collect data
  }

  return userData;
}
```

### 4.4 Backup Strategies

#### Database Backup Configuration
```yaml
# .github/workflows/backup.yml
name: Database Backup

on:
  schedule:
    - cron: '0 3 * * *' # Daily at 3 AM
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Backup PostgreSQL
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          # Parse DATABASE_URL
          export PGHOST=$(echo $DATABASE_URL | sed -n 's/.*@\(.*\):.*/\1/p')
          export PGPORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
          export PGDATABASE=$(echo $DATABASE_URL | sed -n 's/.*\/\(.*\)/\1/p')
          export PGUSER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\(.*\):.*/\1/p')
          export PGPASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:.*:\(.*\)@.*/\1/p')

          # Create backup
          BACKUP_FILE="backup-$(date +%Y%m%d-%H%M%S).sql"
          pg_dump -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE > $BACKUP_FILE

          # Compress backup
          gzip $BACKUP_FILE

          # Upload to S3
          aws s3 cp ${BACKUP_FILE}.gz s3://weburedno-backups/db/

      - name: Verify backup
        run: |
          # Check backup size
          BACKUP_SIZE=$(stat -c%s "${BACKUP_FILE}.gz")
          if [ $BACKUP_SIZE -lt 1000 ]; then
            echo "Backup too small, possible error"
            exit 1
          fi

      - name: Cleanup old backups
        run: |
          # Keep only last 30 days
          aws s3 ls s3://weburedno-backups/db/ | while read -r line; do
            createDate=$(echo $line | awk '{print $1" "$2}')
            createDate=$(date -d "$createDate" +%s)
            olderThan=$(date -d "30 days ago" +%s)
            if [[ $createDate -lt $olderThan ]]; then
              fileName=$(echo $line | awk '{print $4}')
              aws s3 rm s3://weburedno-backups/db/$fileName
            fi
          done
```

#### Disaster Recovery Plan
```markdown
## Disaster Recovery Procedures

### RTO (Recovery Time Objective): 4 hours
### RPO (Recovery Point Objective): 24 hours

### Recovery Scenarios

#### 1. Database Failure
1. Identify failure type (corruption, deletion, hardware)
2. Restore from latest backup:
   ```bash
   ./scripts/restore-db.sh latest
   ```
3. Verify data integrity
4. Run data validation scripts

#### 2. Application Failure
1. Rollback to previous deployment
2. Restore from Git if code corruption
3. Rebuild and redeploy:
   ```bash
   git checkout last-known-good
   vercel deploy --prod
   ```

#### 3. Complete Infrastructure Failure
1. Provision new infrastructure
2. Restore database from backup
3. Deploy application from Git
4. Update DNS records
5. Verify all services

### Testing Schedule
- Monthly: Backup restoration test
- Quarterly: Full DR drill
- Annually: Complete infrastructure rebuild
```

---

## 5. Scaling & Optimization

### 5.1 CDN Configuration

#### Vercel Edge Network
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['cdn.weburedno.hr'],
    loader: 'default',
    formats: ['image/avif', 'image/webp'],
  },

  // Static asset caching
  async headers() {
    return [
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate',
          },
        ],
      },
    ];
  },
};
```

#### CloudFlare Integration
```javascript
// lib/cdn/cloudflare.ts
export const cloudflareConfig = {
  zoneId: process.env.CLOUDFLARE_ZONE_ID,
  apiToken: process.env.CLOUDFLARE_API_TOKEN,

  cacheRules: [
    {
      match: '*.css',
      edge_ttl: 2592000, // 30 days
      browser_ttl: 86400, // 1 day
    },
    {
      match: '*.js',
      edge_ttl: 2592000,
      browser_ttl: 86400,
    },
    {
      match: '/api/*',
      edge_ttl: 0,
      browser_ttl: 0,
    },
  ],

  purgeCache: async (urls: string[]) => {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${cloudflareConfig.zoneId}/purge_cache`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cloudflareConfig.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: urls }),
      }
    );
    return response.json();
  },
};
```

### 5.2 Database Scaling Approach

#### Connection Pooling
```typescript
// lib/db/pool.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Health check
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;

  // Log slow queries
  if (duration > 1000) {
    console.warn('Slow query:', { text, duration });
  }

  return res;
}
```

#### Read Replica Configuration
```typescript
// lib/db/replicas.ts
import { Pool } from 'pg';

const writePool = new Pool({
  connectionString: process.env.DATABASE_URL_PRIMARY,
  max: 10,
});

const readPool = new Pool({
  connectionString: process.env.DATABASE_URL_REPLICA,
  max: 20,
});

export async function executeQuery(
  query: string,
  params?: any[],
  options: { write?: boolean } = {}
) {
  const pool = options.write ? writePool : readPool;
  return pool.query(query, params);
}

// Usage examples
export const db = {
  // Write operations
  create: (query: string, params?: any[]) =>
    executeQuery(query, params, { write: true }),

  update: (query: string, params?: any[]) =>
    executeQuery(query, params, { write: true }),

  delete: (query: string, params?: any[]) =>
    executeQuery(query, params, { write: true }),

  // Read operations
  find: (query: string, params?: any[]) =>
    executeQuery(query, params),

  findOne: async (query: string, params?: any[]) => {
    const result = await executeQuery(query, params);
    return result.rows[0];
  },
};
```

### 5.3 Caching Strategies

#### Redis Cache Layer
```typescript
// lib/cache/redis.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  },

  async set(key: string, value: any, ttl?: number) {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await redis.setex(key, ttl, serialized);
    } else {
      await redis.set(key, serialized);
    }
  },

  async invalidate(pattern: string) {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },

  async remember<T>(
    key: string,
    ttl: number,
    callback: () => Promise<T>
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const fresh = await callback();
    await this.set(key, fresh, ttl);
    return fresh;
  },
};
```

#### API Response Caching
```typescript
// middleware/cache.ts
import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/cache/redis';

export async function cacheMiddleware(
  request: NextRequest,
  handler: () => Promise<NextResponse>
) {
  // Skip cache for mutations
  if (request.method !== 'GET') {
    return handler();
  }

  const cacheKey = `api:${request.nextUrl.pathname}:${request.nextUrl.search}`;

  // Try cache
  const cached = await cache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        'X-Cache': 'HIT',
        'Cache-Control': 'public, max-age=60',
      },
    });
  }

  // Generate fresh response
  const response = await handler();
  const data = await response.json();

  // Cache successful responses
  if (response.status === 200) {
    await cache.set(cacheKey, data, 300); // 5 minutes
  }

  return NextResponse.json(data, {
    headers: {
      'X-Cache': 'MISS',
      'Cache-Control': 'public, max-age=60',
    },
  });
}
```

### 5.4 Load Balancing Considerations

#### Health Check Endpoint
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db/pool';
import { cache } from '@/lib/cache/redis';

export async function GET() {
  const checks = {
    app: 'ok',
    database: 'unknown',
    cache: 'unknown',
    timestamp: new Date().toISOString(),
  };

  try {
    // Check database
    await query('SELECT 1');
    checks.database = 'ok';
  } catch (error) {
    checks.database = 'error';
  }

  try {
    // Check cache
    await cache.set('health:check', Date.now(), 10);
    checks.cache = 'ok';
  } catch (error) {
    checks.cache = 'error';
  }

  const healthy = Object.values(checks).every(v =>
    v === 'ok' || typeof v === 'string'
  );

  return NextResponse.json(checks, {
    status: healthy ? 200 : 503,
  });
}
```

#### Auto-Scaling Configuration
```yaml
# vercel.json auto-scaling
{
  "functions": {
    "app/api/bookings/create/route.ts": {
      "maxDuration": 30,
      "memory": 1024,
      "runtime": "nodejs20.x"
    },
    "app/api/*/route.ts": {
      "maxDuration": 10,
      "memory": 512
    }
  },
  "regions": ["arn1", "fra1"], # Multi-region for redundancy
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 3 * * *"
    }
  ]
}
```

#### Traffic Distribution
```typescript
// lib/load-balancer/config.ts
export const loadBalancerConfig = {
  // Regional distribution
  regions: {
    'eu-central': {
      weight: 70,
      endpoints: ['arn1.vercel.app'],
    },
    'eu-west': {
      weight: 30,
      endpoints: ['fra1.vercel.app'],
    },
  },

  // Circuit breaker
  circuitBreaker: {
    failureThreshold: 5,
    resetTimeout: 60000, // 1 minute
    monitorInterval: 10000, // 10 seconds
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Requests per window
    message: 'Previše zahtjeva, pokušajte ponovno kasnije',
  },

  // Request routing
  routing: {
    '/api/bookings/*': {
      priority: 'high',
      timeout: 30000,
    },
    '/api/public/*': {
      priority: 'low',
      timeout: 5000,
    },
  },
};
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Security scan completed
- [ ] Performance budget met
- [ ] Database migrations ready
- [ ] Environment variables configured
- [ ] SSL certificates valid

### Deployment
- [ ] Create deployment tag
- [ ] Deploy to staging first
- [ ] Run smoke tests
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify SSL and security headers

### Post-Deployment
- [ ] Monitor application logs
- [ ] Check Sentry for errors
- [ ] Verify analytics tracking
- [ ] Test critical user paths
- [ ] Update status page
- [ ] Notify stakeholders

### Rollback Criteria
- [ ] Error rate > 5%
- [ ] Response time > 3s
- [ ] Memory usage > 90%
- [ ] Database connections exhausted
- [ ] Payment processing failures
- [ ] Critical functionality broken

---

## Support & Maintenance

### Monitoring Dashboard URLs
- Vercel Dashboard: https://vercel.com/team/dashboard
- Sentry: https://sentry.io/organizations/weburedno
- Analytics: https://analytics.google.com/weburedno
- Status Page: https://status.weburedno.hr

### Emergency Contacts
- DevOps Lead: devops@weburedno.hr
- On-Call Engineer: +385 XX XXX XXXX
- Escalation: management@weburedno.hr

### Documentation
- API Docs: https://api.weburedno.hr/docs
- Runbooks: https://github.com/weburedno/runbooks
- Architecture: https://github.com/weburedno/docs

---

End of DevOps & Deployment Implementation Guide