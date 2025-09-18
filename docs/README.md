# Uredno - Documentation

## 📚 Documentation Structure

This documentation provides a complete blueprint for building a professional cleaning service website for the Croatian market.

### Documentation Files

1. **[01-PROJECT-OVERVIEW.md](01-PROJECT-OVERVIEW.md)**
   - Business goals and target audience
   - Service offerings (residential & commercial)
   - Technology stack decisions
   - Success metrics

2. **[02-TECHNICAL-ARCHITECTURE.md](02-TECHNICAL-ARCHITECTURE.md)**
   - System architecture diagram
   - Project folder structure
   - Component hierarchy
   - Performance optimization strategies

3. **[03-UI-DESIGN-SYSTEM.md](03-UI-DESIGN-SYSTEM.md)**
   - Brand colors and typography
   - shadcn/ui component library setup
   - Layout patterns and grid system
   - Accessibility standards

4. **[04-CROATIAN-CONTENT-SEO.md](04-CROATIAN-CONTENT-SEO.md)**
   - Complete Croatian translations
   - SEO keyword strategy
   - Meta tags and structured data
   - Local SEO for Zagreb region

5. **[05-COMPONENT-SPECIFICATIONS.md](05-COMPONENT-SPECIFICATIONS.md)**
   - Detailed component specifications
   - TypeScript interfaces
   - Reusable component patterns
   - Usage examples

6. **[06-GOOGLE-CALENDAR-INTEGRATION.md](06-GOOGLE-CALENDAR-INTEGRATION.md)**
   - Google Calendar API setup
   - Booking system implementation
   - Availability management
   - Email notifications

7. **[07-IMPLEMENTATION-ROADMAP.md](07-IMPLEMENTATION-ROADMAP.md)**
   - 21-day development timeline
   - Phase-by-phase implementation
   - Quick start commands
   - Environment setup

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Google Cloud Platform account (for Calendar API)
- Domain name for production

### Initial Setup

1. **Create the project:**
```bash
npx create-next-app@latest weburedno --typescript --tailwind --app
cd weburedno
```

2. **Install dependencies:**
```bash
npm install lucide-react date-fns react-hook-form zod @hookform/resolvers
npm install @tanstack/react-query googleapis
```

3. **Setup shadcn/ui:**
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card form calendar dialog
```

4. **Configure environment:**
   - Copy `.env.example` to `.env.local`
   - Add your Google Calendar API credentials
   - Configure email service (optional)

5. **Start development:**
```bash
npm run dev
```

## 🎯 Key Features

### Core Functionality
- ✅ Service showcase with pricing
- ✅ Online booking with calendar
- ✅ Google Calendar integration
- ✅ Mobile-responsive design
- ✅ Croatian language (SEO optimized)
- ✅ Fast performance (shadcn/ui + Tailwind)

### Services Offered
- **Residential:** Standard, Deep Clean, Move In/Out, Airbnb
- **Commercial:** Offices, Retail, Medical facilities
- **Areas:** Zagreb & Zagrebačka županija

### Technology Choices
- **Framework:** Next.js 14 (App Router)
- **UI Library:** shadcn/ui
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Calendar:** Google Calendar API

## 📋 Implementation Phases

| Phase | Duration | Focus |
|-------|----------|-------|
| 1. Foundation | 3 days | Project setup, infrastructure |
| 2. Core Components | 3 days | Reusable components, homepage |
| 3. Service Pages | 2 days | Service templates, content |
| 4. Booking System | 3 days | Multi-step wizard, validation |
| 5. Calendar Integration | 3 days | Google Calendar API, availability |
| 6. SEO & Performance | 2 days | Optimization, meta tags |
| 7. Additional Pages | 2 days | Static pages, policies |
| 8. Testing & Launch | 3 days | Testing, deployment |

## 🎨 Design Highlights

- **Colors:** Professional blue (#1654D0) with green accents
- **Typography:** Inter for body, Plus Jakarta Sans for headings
- **Components:** Modern, accessible shadcn/ui components
- **Mobile-first:** Responsive design for all devices

## 🔍 SEO Strategy

- **Target Keywords:** "čišćenje Zagreb", "profesionalno čišćenje"
- **Local Focus:** Zagreb neighborhoods and districts
- **Structured Data:** LocalBusiness schema
- **Performance:** <3s load time, 95+ PageSpeed score

## 📞 Support & Questions

For implementation questions or clarifications about the design:
1. Review the relevant documentation file
2. Check the implementation roadmap for timeline
3. Refer to component specifications for technical details

## ⚠️ Important Notes

- All text content is in Croatian for the primary market
- Prices are in Euros (€) as per Croatian standards
- Business hours and calendar are in Europe/Zagreb timezone
- GDPR compliance required for EU market

---

**Project:** Uredno
**Market:** Zagreb & Zagrebačka županija, Croatia
**Status:** Design Documentation Complete
**Next Step:** Begin Phase 1 - Foundation Setup