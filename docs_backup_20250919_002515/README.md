# WebUredno - Professional Cleaning Service Platform

**Modern web platform for professional cleaning services in Zagreb, Croatia**

## Quick Overview

- **Service Area**: Zagreb city and Zagreb County
- **Pricing**: €15/hour per person, €45 minimum
- **Technology**: Next.js 14, TypeScript, Tailwind CSS
- **Contact**: kontakt@uredno.eu | +385 92 450 2265

## Documentation Structure

### For Business Stakeholders
- **[Business Guide](BUSINESS_GUIDE.md)** - Complete business model, services, pricing, and strategy
- **[Security & Compliance](SECURITY_COMPLIANCE.md)** - GDPR compliance and security requirements

### For Developers
- **[Developer Guide](DEVELOPER_GUIDE.md)** - Technical setup, development workflow, and coding standards

### Implementation Documentation
- **[Implementation Overview](implementation/README.md)** - Development roadmap and implementation status
- **[Frontend Implementation](implementation/01-FRONTEND-IMPLEMENTATION.md)** - UI/UX components and architecture
- **[Backend Implementation](implementation/02-BACKEND-IMPLEMENTATION.md)** - API design and server-side logic
- **[Testing Implementation](implementation/03-TESTING-IMPLEMENTATION.md)** - Quality assurance and testing strategy
- **[DevOps & Deployment](implementation/04-DEVOPS-DEPLOYMENT.md)** - CI/CD pipeline and deployment procedures
- **[Database Architecture](implementation/05-DATABASE-ARCHITECTURE.md)** - Database design and data models
- **[Security Implementation](implementation/06-SECURITY-IMPLEMENTATION.md)** - Security patterns and measures

## Quick Start

### Development Setup
```bash
git clone <repository-url>
cd WebUredno
npm install
npm run dev
```

### Environment Configuration
Create `.env.local` with required variables (see [Developer Guide](DEVELOPER_GUIDE.md) for details)

### Key Commands
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run lint` - Code linting
- `npm test` - Run test suite

## Project Status

### ✅ Completed
- Core Next.js setup with TypeScript
- Basic UI components and styling
- Pricing calculation engine
- Form validation system
- Project documentation structure

### 🔄 In Progress
- Booking system implementation
- Security hardening
- GDPR compliance features
- Google Calendar integration

### ⏳ Planned
- Database implementation
- Email notification system
- Production deployment
- Performance optimization

## Quick Links

- **Live Site**: https://uredno.eu (when deployed)
- **Staging**: [Vercel Preview URL]
- **Issues**: GitHub Issues
- **Contact**: kontakt@uredno.eu

---

*For detailed information, refer to the specific documentation files listed above.*