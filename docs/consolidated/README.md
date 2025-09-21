# WebUredno - Professional Cleaning Service Platform

**Modern web platform for professional cleaning services in Zagreb, Croatia**

## 🚀 Quick Overview

WebUredno is a comprehensive cleaning service platform serving Zagreb city and Zagreb County with transparent pricing, instant online booking, and guaranteed service quality.

### Key Information
- **Service Area**: Zagreb City & Zagreb County
- **Pricing**: €15/hour per person, €45 minimum charge
- **Technology Stack**: Next.js 14, TypeScript, Tailwind CSS, PostgreSQL
- **Contact**: kontakt@uredno.eu | +385 92 450 2265
- **Website**: https://uredno.eu

## 📚 Documentation Structure

This consolidated documentation provides comprehensive guidance for all stakeholders involved in the WebUredno platform development and operation.

### Core Documentation

1. **[BUSINESS_REQUIREMENTS.md](./BUSINESS_REQUIREMENTS.md)**
   - Business model and service offerings
   - Pricing structure and market analysis
   - Customer segments and value propositions
   - Croatian market specifics and localization
   - Legal and compliance requirements

2. **[TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md)**
   - System architecture and design patterns
   - API documentation and data models
   - Integration specifications (Google Calendar, Email)
   - Database architecture and schemas
   - Security implementation patterns

3. **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)**
   - Step-by-step development roadmap
   - Frontend and backend implementation
   - Component specifications and UI patterns
   - Configuration and environment setup
   - Code examples and best practices

4. **[TESTING_DEPLOYMENT.md](./TESTING_DEPLOYMENT.md)**
   - Comprehensive testing strategy
   - Unit, integration, and E2E testing
   - CI/CD pipeline configuration
   - Deployment procedures and rollback plans
   - Performance optimization guidelines

5. **[OPERATIONS_MANUAL.md](./OPERATIONS_MANUAL.md)**
   - Security protocols and monitoring
   - GDPR compliance procedures
   - Maintenance and backup strategies
   - Incident response procedures
   - Operational checklists and runbooks

## 🎯 Quick Start Guide

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager
- PostgreSQL 14+ (production)
- Git for version control

### Development Setup

```bash
# Clone repository
git clone <repository-url>
cd WebUredno

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### Environment Configuration

Create `.env.local` with the following variables:

```env
# Application
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Uredno
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/weburedno

# Google Calendar
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALENDAR_ID=calendar_id@group.calendar.google.com

# Email Service
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
EMAIL_FROM_ADDRESS=kontakt@uredno.eu

# Security
JWT_SECRET=your_jwt_secret_key
ADMIN_PASSWORD_HASH=bcrypt_hash_here
```

## 📊 Project Status

### ✅ Phase 1: Complete
- Core Next.js setup with TypeScript
- Basic UI components and design system
- Pricing calculation engine
- Form validation system
- Documentation structure

### 🔄 Phase 2: In Progress
- Booking system implementation
- Google Calendar integration
- Email notification system
- Security hardening
- GDPR compliance features

### ⏳ Phase 3: Planned
- Admin dashboard
- Customer portal
- Analytics integration
- Mobile application
- Advanced reporting

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────┐
│           Frontend (Next.js)            │
│  - React Components                     │
│  - Tailwind CSS                         │
│  - TypeScript                           │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         API Layer (Next.js API)         │
│  - RESTful Endpoints                    │
│  - Authentication & Authorization       │
│  - Validation & Sanitization            │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Business Logic Layer            │
│  - Booking Management                   │
│  - Pricing Calculations                 │
│  - Service Scheduling                   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Integration Layer               │
│  - Google Calendar API                  │
│  - Email Service (SendGrid)             │
│  - Payment Processing                   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Data Layer (PostgreSQL)         │
│  - Customer Data                        │
│  - Booking Records                      │
│  - Service History                      │
└─────────────────────────────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14.2.5 with App Router
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form + Zod
- **State Management**: React Context API

### Backend
- **Runtime**: Node.js 18+
- **API**: Next.js API Routes
- **Database**: PostgreSQL 14+ with Prisma ORM
- **Authentication**: JWT with secure httpOnly cookies
- **Validation**: Zod schemas

### Infrastructure
- **Hosting**: Vercel (Frontend) + Supabase (Database)
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics + Sentry
- **CI/CD**: GitHub Actions

### Integrations
- **Calendar**: Google Calendar API
- **Email**: SendGrid (Primary) + Resend (Backup)
- **Analytics**: Google Analytics 4
- **Maps**: Google Maps API

## 🔐 Security & Compliance

### Security Measures
- JWT authentication with secure cookies
- CSRF protection on all forms
- Rate limiting on API endpoints
- Input validation and sanitization
- SQL injection prevention via Prisma
- XSS protection headers
- Content Security Policy (CSP)

### GDPR Compliance
- Explicit consent for data processing
- Right to access and data portability
- Right to erasure (right to be forgotten)
- Privacy by design implementation
- Data minimization principles
- Secure data storage and encryption

## 📈 Key Metrics

### Performance Targets
- Page Load: < 2 seconds
- Time to Interactive: < 3 seconds
- Lighthouse Score: > 90
- Core Web Vitals: All green

### Business Metrics
- Booking Conversion: > 25%
- Customer Retention: > 60%
- Average Rating: > 4.5 stars
- Response Time: < 2 hours

## 📞 Support & Resources

### Documentation
- [Business Requirements](./BUSINESS_REQUIREMENTS.md) - Business logic and requirements
- [Technical Documentation](./TECHNICAL_DOCUMENTATION.md) - Technical specifications
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md) - Development instructions
- [Testing & Deployment](./TESTING_DEPLOYMENT.md) - Quality assurance
- [Operations Manual](./OPERATIONS_MANUAL.md) - Operational procedures

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Contact Information
- **Business**: kontakt@uredno.eu
- **Technical Support**: dev@uredno.eu
- **Phone**: +385 92 450 2265
- **Website**: https://uredno.eu

---

*Last updated: 2024 | Version 2.0*