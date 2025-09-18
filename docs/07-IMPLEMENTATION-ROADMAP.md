# Implementation Roadmap

## Phase 1: Foundation (Days 1-3)

### 1.1 Project Setup
- [ ] Initialize Next.js 14 project with TypeScript
- [ ] Configure Tailwind CSS
- [ ] Install and setup shadcn/ui
- [ ] Setup ESLint and Prettier
- [ ] Configure environment variables
- [ ] Setup Git repository

### 1.2 Core Infrastructure
- [ ] Setup folder structure
- [ ] Configure Next.js App Router
- [ ] Setup global styles and theme
- [ ] Configure fonts (Inter, Plus Jakarta Sans)
- [ ] Setup basic SEO components

### 1.3 Component Library Setup
```bash
# Install shadcn/ui components
npx shadcn-ui@latest add button card input select
npx shadcn-ui@latest add calendar dialog tabs accordion
npx shadcn-ui@latest add form toast badge separator
```

## Phase 2: Core Components (Days 4-6)

### 2.1 Layout Components
- [ ] Header with navigation
- [ ] Footer with links
- [ ] Mobile menu
- [ ] Section wrapper

### 2.2 Shared Components
- [ ] Hero component
- [ ] ServiceCard component
- [ ] TestimonialCard component
- [ ] FAQSection component
- [ ] ContactForm component

### 2.3 Homepage Implementation
- [ ] Hero section with CTA
- [ ] Services grid
- [ ] Testimonials section
- [ ] Trust indicators
- [ ] FAQ section
- [ ] CTA section

## Phase 3: Service Pages (Days 7-8)

### 3.1 Service Templates
- [ ] Service detail page template
- [ ] Service listing page
- [ ] Pricing calculator component

### 3.2 Individual Service Pages
- [ ] Standard cleaning page
- [ ] Deep cleaning page
- [ ] Move in/out cleaning page
- [ ] Airbnb cleaning page
- [ ] Commercial cleaning page

## Phase 4: Booking System (Days 9-11)

### 4.1 Booking Components
- [ ] BookingWizard component
- [ ] ServiceSelection step
- [ ] LocationSelector component
- [ ] CalendarPicker component
- [ ] ContactForm step
- [ ] Summary component

### 4.2 Booking Flow
- [ ] Multi-step form logic
- [ ] Form validation with Zod
- [ ] State management
- [ ] Price calculation
- [ ] Confirmation page

## Phase 5: Google Calendar Integration (Days 12-14)

### 5.1 API Setup
- [ ] Google Cloud Platform setup
- [ ] Service account creation
- [ ] Calendar API configuration
- [ ] Environment variables

### 5.2 Backend Implementation
- [ ] API route for availability
- [ ] API route for booking creation
- [ ] API route for booking updates
- [ ] Error handling
- [ ] Email notifications

### 5.3 Frontend Integration
- [ ] Connect CalendarPicker to API
- [ ] Real-time availability
- [ ] Booking confirmation flow
- [ ] Success/error states

## Phase 6: SEO & Performance (Days 15-16)

### 6.1 SEO Implementation
- [ ] Meta tags for all pages
- [ ] Structured data (JSON-LD)
- [ ] Sitemap generation
- [ ] Robots.txt
- [ ] Croatian language tags

### 6.2 Performance Optimization
- [ ] Image optimization
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Font optimization
- [ ] Cache headers

## Phase 7: Additional Pages (Days 17-18)

### 7.1 Static Pages
- [ ] About Us page
- [ ] Contact page
- [ ] Privacy Policy
- [ ] Terms of Service

### 7.2 Dynamic Features
- [ ] Blog setup (optional)
- [ ] Location-specific landing pages
- [ ] 404 error page
- [ ] Success pages

## Phase 8: Testing & Launch (Days 19-21)

### 8.1 Testing
- [ ] Unit tests for utilities
- [ ] Integration tests for booking
- [ ] E2E tests for critical paths
- [ ] Cross-browser testing
- [ ] Mobile responsiveness

### 8.2 Deployment Preparation
- [ ] Production environment setup
- [ ] Domain configuration
- [ ] SSL certificate
- [ ] CDN setup
- [ ] Analytics integration

### 8.3 Launch Checklist
- [ ] Final content review
- [ ] SEO validation
- [ ] Performance audit
- [ ] Security check
- [ ] Backup strategy

## Quick Start Commands

```bash
# 1. Create Next.js project
npx create-next-app@latest weburedno --typescript --tailwind --app

# 2. Navigate to project
cd weburedno

# 3. Install dependencies
npm install lucide-react date-fns react-hook-form zod
npm install @hookform/resolvers @radix-ui/react-*
npm install @tanstack/react-query googleapis

# 4. Setup shadcn/ui
npx shadcn-ui@latest init

# 5. Add components
npx shadcn-ui@latest add button card form

# 6. Install dev dependencies
npm install -D @types/node prettier eslint-config-prettier

# 7. Run development server
npm run dev
```

## Environment Variables Template

```env
# .env.local

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://weburedno.hr
NEXT_PUBLIC_SITE_NAME=WebUredno

# Google Calendar API
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY=your_private_key
GOOGLE_CALENDAR_ID=your_calendar_id@group.calendar.google.com

# Email Service (optional)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your_email@gmail.com
EMAIL_SERVER_PASSWORD=your_app_password
EMAIL_FROM=noreply@weburedno.hr

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## Development Priorities

### MVP Features (Must Have)
✅ Homepage with service overview
✅ Service pages with details
✅ Booking form with calendar
✅ Google Calendar integration
✅ Mobile responsive design
✅ Croatian language content
✅ Basic SEO

### Phase 2 Features (Nice to Have)
- Customer dashboard
- Recurring bookings
- Payment integration
- SMS notifications
- Review system
- Referral program
- Multi-language support

### Phase 3 Features (Future)
- Mobile app
- Staff management system
- Route optimization
- Inventory tracking
- Loyalty program
- Advanced analytics

## Success Metrics

### Technical Metrics
- PageSpeed Score > 95
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s
- SEO Score > 90

### Business Metrics
- Booking conversion rate > 5%
- Average session duration > 2min
- Bounce rate < 40%
- Mobile traffic > 60%

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Google Calendar API limits | Implement caching and rate limiting |
| Poor mobile performance | Progressive enhancement, optimize images |
| Low SEO ranking | Content marketing, local SEO focus |
| Complex booking flow | User testing, simplification |
| Browser compatibility | Use modern polyfills, test extensively |