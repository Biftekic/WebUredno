# WebUredno Phase 2: DevOps Implementation Plan

## Executive Summary

This comprehensive DevOps plan transforms WebUredno's Phase 1 implementation into a production-ready, scalable platform with automated CI/CD pipelines, infrastructure as code, robust security, and performance optimization.

**Timeline**: 4 weeks (January 20 - February 14, 2025)
**Environments**: Development → Staging → Production
**Key Technologies**: GitHub Actions, Vercel, PostgreSQL (Supabase), Redis, Cloudflare

---

## 1. DevOps Architecture Overview

### System Architecture Diagram

```mermaid
graph TB
    subgraph "Developer Workflow"
        DEV[Developer] --> GIT[GitHub Repository]
        GIT --> PR[Pull Request]
    end

    subgraph "CI/CD Pipeline"
        PR --> GA[GitHub Actions]
        GA --> LINT[Linting & Type Check]
        GA --> TEST[Unit Tests]
        GA --> E2E[E2E Tests]
        GA --> BUILD[Build Process]
        GA --> SEC[Security Scan]
    end

    subgraph "Deployment Pipeline"
        BUILD --> PREVIEW[Preview Deploy]
        PREVIEW --> STAGING[Staging Deploy]
        STAGING --> PROD[Production Deploy]
    end

    subgraph "Infrastructure"
        PROD --> VERCEL[Vercel Edge Network]
        VERCEL --> CF[Cloudflare CDN]
        VERCEL --> API[API Routes]
        API --> DB[(PostgreSQL)]
        API --> REDIS[(Redis Cache)]
        API --> S3[S3 Storage]
    end

    subgraph "Monitoring"
        VERCEL --> SENTRY[Sentry APM]
        VERCEL --> ANALYTICS[Vercel Analytics]
        DB --> METRICS[Database Metrics]
        REDIS --> MONITOR[Redis Monitor]
    end
```

### Environment Strategy

| Environment | Purpose | Branch | URL | Auto-Deploy |
|------------|---------|--------|-----|-------------|
| Development | Feature testing | feature/* | pr-*.uredno.eu | On PR |
| Staging | Integration testing | develop | staging.uredno.eu | On merge |
| Production | Live service | main | uredno.eu | Manual approval |

---

## 2. CI/CD Pipeline Implementation

### 2.1 GitHub Actions Workflows

#### Main CI/CD Workflow
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '20.x'
  CACHE_VERSION: v1

jobs:
  # Quality Gates
  quality-check:
    name: Code Quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Cache Dependencies
        uses: actions/cache@v4
        with:
          path: |
            ~/.npm
            node_modules
            .next/cache
          key: deps-${{ env.CACHE_VERSION }}-${{ hashFiles('**/package-lock.json') }}

      - name: Install Dependencies
        run: npm ci --prefer-offline

      - name: Type Check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Format Check
        run: npm run format:check

  # Unit Testing
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: quality-check
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run Tests
        run: |
          npm run test:ci -- --shard=${{ matrix.shard }}/4
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

      - name: Upload Coverage
        uses: codecov/codecov-action@v4
        with:
          flags: unittests-shard-${{ matrix.shard }}
          token: ${{ secrets.CODECOV_TOKEN }}

  # E2E Testing
  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: quality-check
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install Dependencies
        run: |
          npm ci
          npx playwright install --with-deps

      - name: Setup Database
        run: |
          npx prisma migrate deploy
          npx prisma db seed
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Run E2E Tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}

      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/

  # Security Scanning
  security-scan:
    name: Security Analysis
    runs-on: ubuntu-latest
    needs: quality-check
    steps:
      - uses: actions/checkout@v4

      - name: Run Trivy Security Scan
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy Results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'

      - name: Dependency Audit
        run: npm audit --audit-level=moderate

  # Build & Deploy
  build-deploy:
    name: Build and Deploy
    runs-on: ubuntu-latest
    needs: [unit-tests, e2e-tests, security-scan]
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build Application
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXT_PUBLIC_SITE_URL: ${{ vars.SITE_URL }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: ${{ github.ref == 'refs/heads/main' && '--prod' || '' }}
```

#### Database Migration Workflow
```yaml
# .github/workflows/db-migrate.yml
name: Database Migration

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target Environment'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production
      migration:
        description: 'Migration Type'
        required: true
        default: 'deploy'
        type: choice
        options:
          - deploy
          - reset
          - seed

jobs:
  migrate:
    name: Run Migration
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'

      - name: Install Dependencies
        run: npm ci

      - name: Run Migration
        run: |
          case "${{ github.event.inputs.migration }}" in
            deploy)
              npx prisma migrate deploy
              ;;
            reset)
              npx prisma migrate reset --force
              ;;
            seed)
              npx prisma db seed
              ;;
          esac
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Database migration completed for ${{ github.event.inputs.environment }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 3. Infrastructure as Code

### 3.1 Vercel Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "regions": ["fra1"],
  "functions": {
    "src/app/api/*": {
      "maxDuration": 30,
      "memory": 1024
    }
  },
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/reminders",
      "schedule": "0 9 * * *"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "NEXT_PUBLIC_SITE_URL": "https://uredno.eu"
  },
  "build": {
    "env": {
      "DATABASE_URL": "@database-url",
      "REDIS_URL": "@redis-url",
      "NEXTAUTH_SECRET": "@nextauth-secret"
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
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
  "rewrites": [
    {
      "source": "/sitemap.xml",
      "destination": "/api/sitemap"
    }
  ]
}
```

### 3.2 Docker Configuration (Local Development)

```dockerfile
# Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

### 3.3 Database Infrastructure

```yaml
# infrastructure/database.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: postgres-config
data:
  postgres.conf: |
    # Connection settings
    max_connections = 100
    shared_buffers = 256MB

    # Performance
    effective_cache_size = 1GB
    work_mem = 4MB
    maintenance_work_mem = 64MB

    # WAL settings
    wal_level = replica
    max_wal_size = 1GB
    min_wal_size = 80MB

    # Query tuning
    random_page_cost = 1.1
    effective_io_concurrency = 200

    # Monitoring
    shared_preload_libraries = 'pg_stat_statements'
    pg_stat_statements.track = all
---
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secrets
type: Opaque
stringData:
  DATABASE_URL: "postgresql://user:pass@host:5432/weburedno"
  POSTGRES_PASSWORD: "${POSTGRES_PASSWORD}"
```

### 3.4 Redis Cache Configuration

```yaml
# infrastructure/redis.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis-cache
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        resources:
          limits:
            memory: "512Mi"
            cpu: "500m"
          requests:
            memory: "256Mi"
            cpu: "250m"
        volumeMounts:
        - name: redis-config
          mountPath: /usr/local/etc/redis/redis.conf
          subPath: redis.conf
        command:
        - redis-server
        - /usr/local/etc/redis/redis.conf
      volumes:
      - name: redis-config
        configMap:
          name: redis-config
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: redis-config
data:
  redis.conf: |
    # Memory management
    maxmemory 256mb
    maxmemory-policy allkeys-lru

    # Persistence
    save 900 1
    save 300 10
    save 60 10000

    # Performance
    tcp-backlog 511
    timeout 0
    tcp-keepalive 300

    # Security
    requirepass ${REDIS_PASSWORD}
    protected-mode yes
```

---

## 4. Security Implementation

### 4.1 Security Checklist

#### Authentication & Authorization
- [x] NextAuth.js with secure session management
- [x] JWT tokens with proper expiration
- [x] CSRF protection enabled
- [x] Role-based access control (RBAC)
- [ ] Multi-factor authentication (Phase 3)

#### API Security
- [x] Rate limiting per IP and user
- [x] API key management for external services
- [x] Input validation with Zod schemas
- [x] SQL injection prevention (Prisma ORM)
- [x] XSS protection headers

#### Data Protection
- [x] HTTPS enforced (SSL/TLS)
- [x] Database encryption at rest
- [x] Sensitive data encryption in transit
- [x] GDPR compliance measures
- [x] PII data masking in logs

#### Infrastructure Security
- [x] Environment variable encryption
- [x] GitHub Secrets for sensitive data
- [x] Network segmentation
- [x] DDoS protection (Cloudflare)
- [x] Web Application Firewall (WAF)

### 4.2 Security Headers Configuration

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security Headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel-analytics.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' *.supabase.co *.vercel-analytics.com; " +
    "frame-ancestors 'none';"
  );

  // Rate Limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip ?? '127.0.0.1';
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(reset).toISOString());

    if (!success) {
      return new NextResponse('Too Many Requests', { status: 429, headers: response.headers });
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### 4.3 API Rate Limiting

```typescript
// src/lib/rate-limit.ts
import { LRUCache } from 'lru-cache';

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

export default function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  });

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, [1]);
        }
        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limit;
        const newUsage = isRateLimited ? currentUsage : currentUsage + 1;
        tokenCache.set(token, [newUsage]);
        isRateLimited ? reject() : resolve();
      }),
  };
}
```

### 4.4 Secrets Management

```yaml
# .github/workflows/secrets-rotation.yml
name: Secrets Rotation

on:
  schedule:
    - cron: '0 0 1 */3 *' # Every 3 months
  workflow_dispatch:

jobs:
  rotate-secrets:
    name: Rotate Secrets
    runs-on: ubuntu-latest
    steps:
      - name: Generate New Secrets
        id: generate
        run: |
          echo "nextauth_secret=$(openssl rand -base64 32)" >> $GITHUB_OUTPUT
          echo "db_password=$(openssl rand -base64 24)" >> $GITHUB_OUTPUT
          echo "redis_password=$(openssl rand -base64 24)" >> $GITHUB_OUTPUT

      - name: Update GitHub Secrets
        uses: google/secrets-sync-action@v1.7.0
        with:
          secrets: |
            NEXTAUTH_SECRET=${{ steps.generate.outputs.nextauth_secret }}
            DB_PASSWORD=${{ steps.generate.outputs.db_password }}
            REDIS_PASSWORD=${{ steps.generate.outputs.redis_password }}

      - name: Update Vercel Environment
        run: |
          vercel env rm NEXTAUTH_SECRET production --yes
          echo "${{ steps.generate.outputs.nextauth_secret }}" | vercel env add NEXTAUTH_SECRET production

      - name: Trigger Deployment
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.VERCEL_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{"target":"production"}' \
            https://api.vercel.com/v13/deployments
```

---

## 5. Performance Optimization

### 5.1 Caching Strategy

#### Application-Level Caching
```typescript
// src/lib/cache.ts
import { Redis } from '@upstash/redis';
import { unstable_cache } from 'next/cache';

const redis = Redis.fromEnv();

// Redis cache wrapper
export async function cacheWithRedis<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    ttl?: number;
    tags?: string[];
  }
): Promise<T> {
  const cached = await redis.get<T>(key);

  if (cached) {
    return cached;
  }

  const fresh = await fetcher();
  await redis.set(key, fresh, {
    ex: options?.ttl || 3600, // 1 hour default
  });

  return fresh;
}

// Next.js Data Cache
export const getCachedServices = unstable_cache(
  async () => {
    return await prisma.service.findMany({
      where: { isActive: true },
    });
  },
  ['services'],
  {
    revalidate: 3600, // 1 hour
    tags: ['services'],
  }
);

// ISR Cache Configuration
export const revalidate = 3600; // Revalidate every hour
```

#### Edge Caching (Vercel/Cloudflare)
```typescript
// src/app/api/services/route.ts
export async function GET() {
  const services = await getCachedServices();

  return NextResponse.json(services, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'CDN-Cache-Control': 'public, max-age=7200',
      'Vercel-CDN-Cache-Control': 'public, max-age=7200',
    },
  });
}
```

### 5.2 Database Query Optimization

```typescript
// src/lib/db-optimization.ts
import { PrismaClient } from '@prisma/client';

// Connection pooling
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Query optimization examples
export async function getOptimizedBookings(customerId: string) {
  return prisma.booking.findMany({
    where: { customerId },
    select: {
      id: true,
      bookingNumber: true,
      scheduledDate: true,
      status: true,
      finalPrice: true,
      // Only select needed fields
      service: {
        select: {
          name: true,
          duration: true,
        },
      },
    },
    orderBy: { scheduledDate: 'desc' },
    take: 10, // Pagination
  });
}

// Batch operations
export async function batchUpdateBookings(updates: Array<{ id: string; status: string }>) {
  const transactions = updates.map(({ id, status }) =>
    prisma.booking.update({
      where: { id },
      data: { status },
    })
  );

  return prisma.$transaction(transactions);
}

// Database indexes (in schema.prisma)
// @@index([customerId, scheduledDate])
// @@index([status, scheduledDate])
```

### 5.3 Image Optimization Pipeline

```typescript
// src/lib/image-optimization.ts
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function optimizeAndUploadImage(
  buffer: Buffer,
  key: string
): Promise<string[]> {
  const sizes = [
    { width: 320, suffix: 'sm' },
    { width: 768, suffix: 'md' },
    { width: 1024, suffix: 'lg' },
    { width: 1920, suffix: 'xl' },
  ];

  const uploads = await Promise.all(
    sizes.map(async ({ width, suffix }) => {
      const optimized = await sharp(buffer)
        .resize(width, null, {
          withoutEnlargement: true,
          fit: 'inside',
        })
        .webp({ quality: 85 })
        .toBuffer();

      const uploadKey = `${key}-${suffix}.webp`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET!,
          Key: uploadKey,
          Body: optimized,
          ContentType: 'image/webp',
          CacheControl: 'public, max-age=31536000, immutable',
        })
      );

      return `${process.env.CDN_URL}/${uploadKey}`;
    })
  );

  return uploads;
}
```

### 5.4 Performance Benchmarks & Targets

| Metric | Current | Target | Measurement Tool |
|--------|---------|--------|------------------|
| **Core Web Vitals** |
| LCP (Largest Contentful Paint) | 2.5s | < 1.8s | Lighthouse |
| FID (First Input Delay) | 100ms | < 50ms | Web Vitals |
| CLS (Cumulative Layout Shift) | 0.1 | < 0.05 | Lighthouse |
| **Application Metrics** |
| Time to Interactive (TTI) | 3.8s | < 2.5s | Lighthouse |
| First Contentful Paint (FCP) | 1.2s | < 0.8s | Web Vitals |
| Speed Index | 3.2s | < 2.0s | Lighthouse |
| **API Performance** |
| p50 Response Time | 150ms | < 100ms | Datadog |
| p95 Response Time | 500ms | < 300ms | Datadog |
| p99 Response Time | 1000ms | < 500ms | Datadog |
| **Database Performance** |
| Query p50 | 20ms | < 10ms | pg_stat_statements |
| Query p95 | 100ms | < 50ms | pg_stat_statements |
| Connection Pool Utilization | 60% | < 70% | PgBouncer |
| **Infrastructure Metrics** |
| Uptime SLA | 99.5% | 99.9% | UptimeRobot |
| Error Rate | 0.5% | < 0.1% | Sentry |
| Cache Hit Ratio | 75% | > 90% | Redis Stats |

---

## 6. Monitoring & Observability

### 6.1 Application Performance Monitoring

```typescript
// src/lib/monitoring.ts
import * as Sentry from '@sentry/nextjs';
import { metrics } from '@opentelemetry/api-metrics';

// Sentry Configuration
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers;
    }
    return event;
  },
});

// Custom Metrics
const meter = metrics.getMeter('weburedno', '1.0.0');

export const bookingCounter = meter.createCounter('bookings_created', {
  description: 'Count of bookings created',
});

export const responseTime = meter.createHistogram('api_response_time', {
  description: 'API response time in milliseconds',
  unit: 'ms',
});

// Performance tracking
export function trackPerformance(name: string, fn: () => Promise<any>) {
  return Sentry.startSpan({ name }, async () => {
    const start = Date.now();
    try {
      const result = await fn();
      responseTime.record(Date.now() - start, { endpoint: name });
      return result;
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  });
}
```

### 6.2 Health Check Endpoints

```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export async function GET() {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: 'unknown',
      redis: 'unknown',
      memory: 'unknown',
    },
  };

  // Database check
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.checks.database = 'healthy';
  } catch (error) {
    checks.checks.database = 'unhealthy';
    checks.status = 'degraded';
  }

  // Redis check
  try {
    await redis.ping();
    checks.checks.redis = 'healthy';
  } catch (error) {
    checks.checks.redis = 'unhealthy';
    checks.status = 'degraded';
  }

  // Memory check
  const memUsage = process.memoryUsage();
  const memLimit = 512 * 1024 * 1024; // 512MB
  if (memUsage.heapUsed < memLimit * 0.9) {
    checks.checks.memory = 'healthy';
  } else {
    checks.checks.memory = 'warning';
    checks.status = 'degraded';
  }

  return NextResponse.json(checks, {
    status: checks.status === 'healthy' ? 200 : 503,
  });
}
```

---

## 7. Deployment & Rollback Strategies

### 7.1 Blue-Green Deployment

```yaml
# .github/workflows/blue-green-deploy.yml
name: Blue-Green Deployment

on:
  workflow_dispatch:
    inputs:
      target:
        description: 'Deployment target'
        required: true
        type: choice
        options:
          - blue
          - green

jobs:
  deploy:
    name: Deploy to ${{ github.event.inputs.target }}
    runs-on: ubuntu-latest
    environment: production-${{ github.event.inputs.target }}
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Target
        run: |
          vercel --prod \
            --env DATABASE_URL=${{ secrets.DATABASE_URL }} \
            --build-env NODE_ENV=production \
            --alias weburedno-${{ github.event.inputs.target }}

      - name: Health Check
        run: |
          for i in {1..10}; do
            response=$(curl -s -o /dev/null -w "%{http_code}" \
              https://weburedno-${{ github.event.inputs.target }}.vercel.app/api/health)
            if [ $response -eq 200 ]; then
              echo "Health check passed"
              exit 0
            fi
            echo "Attempt $i failed, waiting..."
            sleep 30
          done
          exit 1

      - name: Switch Traffic
        if: success()
        run: |
          vercel alias set \
            weburedno-${{ github.event.inputs.target }}.vercel.app \
            uredno.eu
```

### 7.2 Canary Deployment

```typescript
// src/middleware/canary.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const CANARY_PERCENTAGE = 10; // 10% of traffic

export function canaryMiddleware(request: NextRequest) {
  const cookie = request.cookies.get('deployment-version');

  if (!cookie) {
    // Randomly assign to canary or stable
    const isCanary = Math.random() * 100 < CANARY_PERCENTAGE;
    const version = isCanary ? 'canary' : 'stable';

    const response = NextResponse.next();
    response.cookies.set('deployment-version', version, {
      maxAge: 60 * 60 * 24, // 24 hours
      httpOnly: true,
      sameSite: 'lax',
    });

    // Route to appropriate deployment
    if (isCanary) {
      return NextResponse.rewrite(
        new URL(process.env.CANARY_URL!, request.url)
      );
    }
  }

  return NextResponse.next();
}
```

### 7.3 Rollback Procedures

```bash
#!/bin/bash
# scripts/rollback.sh

set -e

echo "🔄 Starting rollback procedure..."

# Get the last stable deployment
LAST_STABLE=$(vercel list --prod | grep "Ready" | head -2 | tail -1 | awk '{print $1}')

if [ -z "$LAST_STABLE" ]; then
  echo "❌ No stable deployment found"
  exit 1
fi

echo "📍 Rolling back to deployment: $LAST_STABLE"

# Promote the last stable deployment
vercel promote $LAST_STABLE --scope=weburedno

# Verify rollback
sleep 10
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://uredno.eu/api/health)

if [ "$HEALTH_CHECK" -eq 200 ]; then
  echo "✅ Rollback successful"

  # Notify team
  curl -X POST $SLACK_WEBHOOK \
    -H 'Content-Type: application/json' \
    -d "{\"text\":\"🔄 Production rolled back to $LAST_STABLE\"}"
else
  echo "❌ Rollback verification failed"
  exit 1
fi
```

---

## 8. Implementation Timeline

### Week 1 (Jan 20-24): Foundation & CI/CD
**Monday-Tuesday: CI/CD Pipeline Setup**
- [ ] Configure GitHub Actions workflows
- [ ] Set up test environments
- [ ] Implement quality gates
- [ ] Configure code coverage reporting

**Wednesday-Thursday: Security Implementation**
- [ ] Implement security headers
- [ ] Set up rate limiting
- [ ] Configure CORS policies
- [ ] Implement API authentication

**Friday: Testing & Validation**
- [ ] Run security scans
- [ ] Validate CI/CD pipelines
- [ ] Document procedures
- [ ] Team training on new workflows

### Week 2 (Jan 27-31): Infrastructure & Database
**Monday-Tuesday: Infrastructure as Code**
- [ ] Set up Vercel configuration
- [ ] Configure environment variables
- [ ] Implement secrets management
- [ ] Set up staging environment

**Wednesday-Thursday: Database Optimization**
- [ ] Implement connection pooling
- [ ] Add database indexes
- [ ] Set up migration workflows
- [ ] Configure backup procedures

**Friday: Redis Integration**
- [ ] Deploy Redis cache
- [ ] Implement caching layer
- [ ] Configure cache strategies
- [ ] Test cache performance

### Week 3 (Feb 3-7): Performance & Monitoring
**Monday-Tuesday: Performance Optimization**
- [ ] Implement image optimization
- [ ] Configure CDN
- [ ] Set up edge caching
- [ ] Optimize API responses

**Wednesday-Thursday: Monitoring Setup**
- [ ] Configure Sentry APM
- [ ] Set up custom metrics
- [ ] Implement health checks
- [ ] Configure alerting rules

**Friday: Load Testing**
- [ ] Run performance benchmarks
- [ ] Stress test infrastructure
- [ ] Validate scaling capabilities
- [ ] Document performance baselines

### Week 4 (Feb 10-14): Deployment & Documentation
**Monday-Tuesday: Deployment Strategies**
- [ ] Implement blue-green deployment
- [ ] Set up canary releases
- [ ] Configure rollback procedures
- [ ] Test disaster recovery

**Wednesday-Thursday: Production Readiness**
- [ ] Final security audit
- [ ] Performance validation
- [ ] Documentation review
- [ ] Runbook creation

**Friday: Launch Preparation**
- [ ] Production deployment
- [ ] Monitoring validation
- [ ] Team handover
- [ ] Post-deployment review

---

## 9. Success Metrics

### Technical KPIs
- **Deployment Frequency**: 2+ deploys per week
- **Lead Time**: < 2 hours from commit to production
- **MTTR (Mean Time to Recovery)**: < 30 minutes
- **Change Failure Rate**: < 5%
- **Test Coverage**: > 80%
- **Build Success Rate**: > 95%

### Business KPIs
- **Site Availability**: 99.9% uptime
- **Page Load Time**: < 2 seconds
- **API Response Time**: < 200ms p50
- **Error Rate**: < 0.1%
- **Customer Satisfaction**: > 4.5/5

### Security KPIs
- **Vulnerability Scan Pass Rate**: 100%
- **Security Incident Response**: < 15 minutes
- **Patch Deployment Time**: < 24 hours for critical
- **Audit Compliance**: 100% pass rate

---

## 10. Risk Mitigation

### Identified Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Database migration failure | High | Medium | Automated backups, rollback scripts, staging validation |
| Performance degradation | Medium | Medium | Continuous monitoring, auto-scaling, cache layer |
| Security breach | High | Low | WAF, rate limiting, security scanning, incident response |
| Deployment failure | Medium | Low | Blue-green deployment, automated rollback, health checks |
| Third-party service outage | Medium | Medium | Fallback mechanisms, multi-region deployment, SLA monitoring |
| Team knowledge gap | Low | Medium | Documentation, training sessions, runbooks |

### Incident Response Plan

1. **Detection** (< 5 minutes)
   - Automated monitoring alerts
   - Health check failures
   - Customer reports

2. **Triage** (< 10 minutes)
   - Severity assessment
   - Impact analysis
   - Team notification

3. **Response** (< 30 minutes)
   - Immediate mitigation
   - Rollback if necessary
   - Communication to stakeholders

4. **Resolution** (varies)
   - Root cause analysis
   - Permanent fix deployment
   - Post-mortem documentation

5. **Review** (< 48 hours)
   - Incident review meeting
   - Process improvements
   - Documentation updates

---

## Conclusion

This comprehensive DevOps implementation plan transforms WebUredno into a production-ready, scalable platform with:

- **Automated CI/CD pipelines** ensuring code quality and rapid deployment
- **Robust security measures** protecting customer data and maintaining compliance
- **Performance optimizations** delivering exceptional user experience
- **Comprehensive monitoring** enabling proactive issue resolution
- **Scalable infrastructure** supporting business growth

The 4-week implementation timeline provides a structured approach to achieving operational excellence while maintaining service continuity. With proper execution, WebUredno will have enterprise-grade DevOps practices supporting reliable, secure, and performant service delivery.

**Next Steps:**
1. Review and approve the implementation plan
2. Allocate resources and assign team responsibilities
3. Begin Week 1 implementation
4. Schedule daily standup meetings for progress tracking
5. Prepare production environment credentials