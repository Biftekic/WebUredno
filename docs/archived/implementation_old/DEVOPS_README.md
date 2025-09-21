# WebUredno DevOps Implementation Guide

## Quick Start

### Prerequisites
- Node.js 20.x or higher
- Docker & Docker Compose
- Vercel CLI (`npm i -g vercel`)
- GitHub account with repository access

### Local Development Setup

```bash
# Clone repository
git clone https://github.com/weburedno/weburedno.git
cd weburedno

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development environment with Docker
docker-compose up -d

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Production Deployment

```bash
# Deploy to staging
vercel --env=staging

# Deploy to production
vercel --prod

# Rollback if needed
./scripts/rollback.sh
```

## Architecture Overview

### Infrastructure Stack
- **Hosting**: Vercel Edge Network
- **Database**: PostgreSQL (Supabase)
- **Cache**: Redis (Upstash)
- **CDN**: Cloudflare
- **Monitoring**: Sentry, Vercel Analytics
- **CI/CD**: GitHub Actions

### Environment Structure
```
Production (uredno.eu)
├── Edge Functions (Vercel)
├── PostgreSQL Database (Supabase)
├── Redis Cache (Upstash)
└── CDN (Cloudflare)

Staging (staging.uredno.eu)
├── Edge Functions (Vercel)
├── PostgreSQL Database (Supabase Dev)
├── Redis Cache (Upstash Dev)
└── Direct Access (No CDN)

Development (localhost:3000)
├── Next.js Dev Server
├── PostgreSQL (Docker)
├── Redis (Docker)
└── Hot Reload Enabled
```

## CI/CD Pipeline

### Workflow Triggers
1. **Pull Request**: Runs tests, linting, type checking
2. **Merge to develop**: Deploys to staging
3. **Merge to main**: Deploys to production (with approval)

### Pipeline Stages
```yaml
Quality Gates → Unit Tests → E2E Tests → Security Scan → Build → Deploy
```

### GitHub Actions Workflows

#### Main CI/CD Pipeline
- **File**: `.github/workflows/ci-cd.yml`
- **Triggers**: Push to main/develop, Pull requests
- **Jobs**: Quality checks, tests, security, deployment

#### Database Migration
- **File**: `.github/workflows/db-migrate.yml`
- **Triggers**: Manual dispatch
- **Actions**: Deploy migrations, reset, seed data

## Security Configuration

### Security Headers
All security headers are configured in `src/middleware.ts`:
- Strict-Transport-Security (HSTS)
- Content-Security-Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection

### Rate Limiting
- **API Routes**: 60 requests per minute per IP
- **Authentication**: 5 attempts per 15 minutes
- **Booking API**: 10 requests per minute

### Environment Variables
```bash
# Required for production
DATABASE_URL=           # PostgreSQL connection string
REDIS_URL=              # Redis connection string
NEXTAUTH_SECRET=        # Random 32+ character string
NEXTAUTH_URL=          # https://uredno.eu
GOOGLE_CLIENT_ID=      # Google OAuth client
GOOGLE_CLIENT_SECRET=  # Google OAuth secret

# Optional monitoring
SENTRY_DSN=            # Sentry error tracking
VERCEL_TOKEN=          # Deployment automation
SLACK_WEBHOOK=         # Alert notifications
```

## Database Management

### Migrations
```bash
# Create migration
npx prisma migrate dev --name migration_name

# Deploy migration to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Backup & Recovery
```bash
# Create backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore backup
psql $DATABASE_URL < backup_20250118.sql
```

## Monitoring & Observability

### Health Checks
- **Endpoint**: `/api/health`
- **Checks**: Database, Redis, Memory, Environment
- **Frequency**: Every 30 seconds

### Metrics Collection
- Application metrics via Sentry
- Database metrics via pg_stat_statements
- Cache metrics via Redis INFO
- Infrastructure metrics via Vercel Analytics

### Alert Channels
1. **Critical**: Slack + PagerDuty
2. **Warning**: Slack notifications
3. **Info**: Email digest

## Performance Optimization

### Caching Layers
1. **Browser Cache**: Static assets (1 year)
2. **CDN Cache**: Public pages (1 hour)
3. **Redis Cache**: API responses (5-60 minutes)
4. **Next.js Cache**: ISR pages (1 hour)

### Database Optimization
- Connection pooling (max 100)
- Query optimization with indexes
- Prepared statements via Prisma
- Read replicas for analytics

## Deployment Procedures

### Standard Deployment
```bash
# 1. Run tests locally
npm run test
npm run test:e2e

# 2. Create feature branch
git checkout -b feature/new-feature

# 3. Commit changes
git add .
git commit -m "feat: add new feature"

# 4. Push and create PR
git push origin feature/new-feature
# Create PR on GitHub

# 5. After approval, merge to develop
# Automatic deployment to staging

# 6. Test on staging
./scripts/validate-deployment.sh https://staging.uredno.eu

# 7. Merge to main for production
# Automatic deployment to production
```

### Emergency Rollback
```bash
# Immediate rollback to last stable
./scripts/rollback.sh

# Rollback to specific deployment
./scripts/rollback.sh deployment_id

# Verify rollback
./scripts/validate-deployment.sh
```

### Database Rollback
```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back

# Restore from backup
psql $DATABASE_URL < backup_latest.sql
```

## Troubleshooting

### Common Issues

#### High Memory Usage
```bash
# Check memory usage
docker stats

# Restart application
vercel restart --prod

# Scale up if needed
vercel scale 2 --prod
```

#### Database Connection Issues
```bash
# Check connection pool
SELECT count(*) FROM pg_stat_activity;

# Kill idle connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle' AND state_change < NOW() - INTERVAL '10 minutes';
```

#### Cache Issues
```bash
# Clear Redis cache
redis-cli FLUSHALL

# Check cache stats
redis-cli INFO stats
```

### Debug Mode
```bash
# Enable debug logging
export DEBUG=*
npm run dev

# Verbose database logging
export DATABASE_LOG=query,info,warn,error
```

## Maintenance Procedures

### Weekly Tasks
- [ ] Review error logs in Sentry
- [ ] Check database performance metrics
- [ ] Validate backup integrity
- [ ] Update dependencies (development)

### Monthly Tasks
- [ ] Security updates review
- [ ] SSL certificate check
- [ ] Performance audit (Lighthouse)
- [ ] Cost optimization review

### Quarterly Tasks
- [ ] Rotate secrets and API keys
- [ ] Disaster recovery drill
- [ ] Load testing
- [ ] Security audit

## Support & Contacts

### Team Contacts
- **DevOps Lead**: devops@uredno.eu
- **On-Call Engineer**: +385-XX-XXX-XXXX
- **Emergency Slack**: #production-alerts

### External Services
- **Vercel Support**: support.vercel.com
- **Supabase Support**: support.supabase.com
- **Cloudflare Support**: support.cloudflare.com

### Documentation
- [Phase 2 DevOps Plan](./PHASE2_DEVOPS_PLAN.md)
- [API Documentation](/docs/api)
- [Security Guidelines](/docs/security)
- [Performance Optimization](/docs/performance)

## License

Copyright © 2025 WebUredno. All rights reserved.